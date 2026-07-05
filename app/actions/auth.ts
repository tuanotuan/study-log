"use server";

import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearSession, createSession } from "@/lib/session";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getPassword(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function registerAction(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = getPassword(formData.get("password"));
  const confirmPassword = getPassword(formData.get("confirmPassword"));

  if (!EMAIL_PATTERN.test(email)) {
    redirectWithError("/register", "Email không hợp lệ.");
  }

  if (password.length < 8) {
    redirectWithError("/register", "Mật khẩu cần ít nhất 8 ký tự.");
  }

  if (password !== confirmPassword) {
    redirectWithError("/register", "Mật khẩu xác nhận không khớp.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });

  if (existingUser) {
    redirectWithError("/register", "Email này đã được đăng ký.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash
    }
  });

  redirect("/login?registered=1");
}

export async function loginAction(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = getPassword(formData.get("password"));

  if (!EMAIL_PATTERN.test(email) || password.length === 0) {
    redirectWithError("/login", "Email hoặc mật khẩu không đúng.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      passwordHash: true
    }
  });

  if (!user) {
    redirectWithError("/login", "Email hoặc mật khẩu không đúng.");
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    redirectWithError("/login", "Email hoặc mật khẩu không đúng.");
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
