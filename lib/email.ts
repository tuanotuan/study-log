import "server-only";

import { resolve4 } from "dns/promises";
import { isIP } from "net";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

type AuthEmailKind = "verify" | "reset";

const SMTP_TIMEOUT_MS = 10_000;
const RESEND_TIMEOUT_MS = 10_000;

function getAppUrl() {
  return process.env.APP_URL || "https://logstudy.onrender.com";
}

async function resolveSmtpHost(host: string) {
  if (isIP(host)) {
    return { connectHost: host, servername: undefined };
  }

  const addresses = await resolve4(host);
  const connectHost = addresses[0];

  if (!connectHost) {
    throw new Error(`No IPv4 address found for ${host}`);
  }

  return { connectHost, servername: host };
}

async function getTransport() {
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s/g, "");
  const host = process.env.SMTP_HOST || (user && pass ? "smtp.gmail.com" : "");

  if (!host || !user || !pass) {
    console.warn("[LogStudy email config missing]", {
      hasHost: Boolean(host),
      hasUser: Boolean(user),
      hasPass: Boolean(pass),
      port
    });
    return null;
  }

  const { connectHost, servername } = await resolveSmtpHost(host);

  console.info("[LogStudy email transport]", {
    host,
    connectHost,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465
  });

  const options: SMTPTransport.Options = {
    host: connectHost,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: user && pass ? { user, pass } : undefined,
    requireTLS: port === 587,
    tls: servername ? { servername } : undefined,
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS
  };

  return nodemailer.createTransport(options);
}

function getEmailCopy(kind: AuthEmailKind, code: string, email: string) {
  if (kind === "verify") {
    return {
      subject: "LogStudy verification code",
      text: [
        "Use this code to verify your LogStudy account:",
        "",
        code,
        "",
        `Open: ${getAppUrl()}/verify-email?email=${encodeURIComponent(email)}`,
        "",
        "This code expires in 10 minutes."
      ].join("\n")
    };
  }

  return {
    subject: "LogStudy password reset code",
    text: [
      "Use this code to reset your LogStudy password:",
      "",
      code,
      "",
      `Open: ${getAppUrl()}/reset-password?email=${encodeURIComponent(email)}`,
      "",
      "This code expires in 10 minutes."
    ].join("\n")
  };
}

function getFromAddress() {
  return (
    process.env.RESEND_FROM ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "LogStudy <onboarding@resend.dev>"
  );
}

async function sendResendEmail(email: string, copy: { subject: string; text: string }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RESEND_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "logstudy/1.0"
      },
      body: JSON.stringify({
        from: getFromAddress(),
        to: [email],
        subject: copy.subject,
        text: copy.text
      }),
      signal: controller.signal
    });
    const body = await response.text();

    if (!response.ok) {
      console.error("[LogStudy resend email error]", {
        status: response.status,
        body: body.slice(0, 500)
      });
      return false;
    }

    console.info("[LogStudy resend email sent]", {
      status: response.status,
      body: body.slice(0, 200)
    });
    return true;
  } catch (error) {
    console.error("[LogStudy resend email error]", {
      message: error instanceof Error ? error.message : String(error)
    });
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function sendAuthCodeEmail(email: string, code: string, kind: AuthEmailKind) {
  const copy = getEmailCopy(kind, code, email);
  const resendSent = await sendResendEmail(email, copy);

  if (resendSent !== null) {
    if (!resendSent) {
      console.log(`[LogStudy email fallback] ${kind} code for ${email}: ${code}`);
    }

    return resendSent;
  }

  let transport: nodemailer.Transporter | null = null;

  try {
    transport = await getTransport();
  } catch (error) {
    console.error("[LogStudy email DNS error]", {
      message: error instanceof Error ? error.message : String(error)
    });
  }

  if (!transport) {
    console.log(`[LogStudy email fallback] ${kind} code for ${email}: ${code}`);
    return false;
  }

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || "LogStudy <no-reply@logstudy.local>",
      to: email,
      subject: copy.subject,
      text: copy.text
    });
    return true;
  } catch (error) {
    const smtpError = error as {
      code?: unknown;
      command?: unknown;
      response?: unknown;
      responseCode?: unknown;
    };

    console.error("[LogStudy email error]", {
      code: smtpError.code,
      command: smtpError.command,
      responseCode: smtpError.responseCode,
      response: smtpError.response,
      message: error instanceof Error ? error.message : String(error)
    });
    console.log(`[LogStudy email fallback] ${kind} code for ${email}: ${code}`);
    return false;
  }
}
