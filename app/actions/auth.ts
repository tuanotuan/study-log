"use server";

import { randomInt } from "crypto";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearSession, createSession } from "@/lib/session";
import { sendAuthCodeEmail } from "@/lib/email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_PATTERN = /^\d{6}$/;
const CODE_TTL_MS = 10 * 60 * 1000;

function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getPassword(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function getCode(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function redirectWithParams(path: string, params: Record<string, string>): never {
  const searchParams = new URLSearchParams(params);
  redirect(`${path}?${searchParams.toString()}`);
}

function generateCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function codeExpiresAt() {
  return new Date(Date.now() + CODE_TTL_MS);
}

async function createEmailVerificationCode(userId: string, email: string) {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);

  await prisma.emailVerificationCode.deleteMany({
    where: { userId }
  });

  await prisma.emailVerificationCode.create({
    data: {
      userId,
      codeHash,
      expiresAt: codeExpiresAt()
    }
  });

  await sendAuthCodeEmail(email, code, "verify");
}

async function createPasswordResetCode(userId: string, email: string) {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);

  await prisma.passwordResetCode.deleteMany({
    where: { userId }
  });

  await prisma.passwordResetCode.create({
    data: {
      userId,
      codeHash,
      expiresAt: codeExpiresAt()
    }
  });

  await sendAuthCodeEmail(email, code, "reset");
}

export async function registerAction(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = getPassword(formData.get("password"));
  const confirmPassword = getPassword(formData.get("confirmPassword"));

  if (!EMAIL_PATTERN.test(email)) {
    redirectWithError("/register", "Email khong hop le.");
  }

  if (password.length < 8) {
    redirectWithError("/register", "Mat khau can it nhat 8 ky tu.");
  }

  if (password !== confirmPassword) {
    redirectWithError("/register", "Mat khau xac nhan khong khop.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      emailVerifiedAt: true
    }
  });

  if (existingUser?.emailVerifiedAt) {
    redirectWithError("/register", "Email nay da duoc dang ky.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user =
    existingUser ??
    (await prisma.user.create({
      data: {
        email,
        passwordHash
      },
      select: {
        id: true,
        email: true
      }
    }));

  if (existingUser && !existingUser.emailVerifiedAt) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { passwordHash }
    });
  }

  await createEmailVerificationCode(user.id, user.email);
  redirectWithParams("/verify-email", { email, sent: "1" });
}

export async function verifyEmailAction(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const code = getCode(formData.get("code"));

  if (!EMAIL_PATTERN.test(email) || !CODE_PATTERN.test(code)) {
    redirectWithParams("/verify-email", {
      email,
      error: "Email hoac ma xac thuc khong hop le."
    });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      emailVerifiedAt: true
    }
  });

  if (!user) {
    redirectWithError("/register", "Email chua duoc dang ky.");
  }

  if (user.emailVerifiedAt) {
    redirect("/login?verified=1");
  }

  const verificationCode = await prisma.emailVerificationCode.findFirst({
    where: {
      userId: user.id,
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!verificationCode || !(await bcrypt.compare(code, verificationCode.codeHash))) {
    redirectWithParams("/verify-email", {
      email,
      error: "Ma xac thuc khong dung hoac da het han."
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date()
    }
  });

  await prisma.emailVerificationCode.deleteMany({
    where: { userId: user.id }
  });

  redirect("/login?verified=1");
}

export async function resendVerificationAction(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));

  if (!EMAIL_PATTERN.test(email)) {
    redirectWithError("/verify-email", "Email khong hop le.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      emailVerifiedAt: true
    }
  });

  if (!user) {
    redirectWithError("/register", "Email chua duoc dang ky.");
  }

  if (user.emailVerifiedAt) {
    redirect("/login?verified=1");
  }

  await createEmailVerificationCode(user.id, user.email);
  redirectWithParams("/verify-email", { email, sent: "1" });
}

export async function loginAction(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = getPassword(formData.get("password"));

  if (!EMAIL_PATTERN.test(email) || password.length === 0) {
    redirectWithError("/login", "Email hoac mat khau khong dung.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      emailVerifiedAt: true
    }
  });

  if (!user) {
    redirectWithError("/login", "Email hoac mat khau khong dung.");
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    redirectWithError("/login", "Email hoac mat khau khong dung.");
  }

  if (!user.emailVerifiedAt) {
    await createEmailVerificationCode(user.id, user.email);
    redirectWithParams("/verify-email", {
      email,
      error: "Email chua xac thuc. Minh da gui lai ma moi."
    });
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));

  if (!EMAIL_PATTERN.test(email)) {
    redirectWithError("/forgot-password", "Email khong hop le.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      emailVerifiedAt: true
    }
  });

  if (user?.emailVerifiedAt) {
    await createPasswordResetCode(user.id, user.email);
  }

  redirectWithParams("/reset-password", { email, sent: "1" });
}

export async function resetPasswordAction(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const code = getCode(formData.get("code"));
  const password = getPassword(formData.get("password"));
  const confirmPassword = getPassword(formData.get("confirmPassword"));

  if (!EMAIL_PATTERN.test(email) || !CODE_PATTERN.test(code)) {
    redirectWithParams("/reset-password", {
      email,
      error: "Email hoac ma reset khong hop le."
    });
  }

  if (password.length < 8) {
    redirectWithParams("/reset-password", {
      email,
      error: "Mat khau can it nhat 8 ky tu."
    });
  }

  if (password !== confirmPassword) {
    redirectWithParams("/reset-password", {
      email,
      error: "Mat khau xac nhan khong khop."
    });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      emailVerifiedAt: true
    }
  });

  if (!user || !user.emailVerifiedAt) {
    redirectWithParams("/reset-password", {
      email,
      error: "Khong the reset mat khau cho email nay."
    });
  }

  const resetCode = await prisma.passwordResetCode.findFirst({
    where: {
      userId: user.id,
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!resetCode || !(await bcrypt.compare(code, resetCode.codeHash))) {
    redirectWithParams("/reset-password", {
      email,
      error: "Ma reset khong dung hoac da het han."
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(password, 12)
    }
  });

  await prisma.passwordResetCode.deleteMany({
    where: { userId: user.id }
  });

  await clearSession();
  redirect("/login?reset=1");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
