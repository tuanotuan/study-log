import "server-only";

type AuthEmailKind = "verify" | "reset";

const RESEND_TIMEOUT_MS = 10_000;

function getAppUrl() {
  return process.env.APP_URL || "https://logstudy.onrender.com";
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
  return process.env.RESEND_FROM || "LogStudy <onboarding@resend.dev>";
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
  const emailSent = await sendResendEmail(email, copy);

  if (!emailSent) {
    console.log(`[LogStudy email fallback] ${kind} code for ${email}: ${code}`);
  }

  return Boolean(emailSent);
}
