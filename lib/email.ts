import "server-only";

import nodemailer from "nodemailer";

type AuthEmailKind = "verify" | "reset";

function getAppUrl() {
  return process.env.APP_URL || "https://logstudy.onrender.com";
}

function getTransport() {
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || (user && pass ? "smtp.gmail.com" : "");

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: user && pass ? { user, pass } : undefined
  });
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

export async function sendAuthCodeEmail(email: string, code: string, kind: AuthEmailKind) {
  const transport = getTransport();
  const copy = getEmailCopy(kind, code, email);

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
    console.error("[LogStudy email error]", error);
    console.log(`[LogStudy email fallback] ${kind} code for ${email}: ${code}`);
    return false;
  }
}
