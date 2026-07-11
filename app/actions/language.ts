"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale, localeCookieName } from "@/lib/i18n";

export async function setLanguageAction(formData: FormData) {
  const locale = formData.get("locale");
  const returnTo = formData.get("returnTo");

  if (isLocale(locale)) {
    const cookieStore = await cookies();
    cookieStore.set(localeCookieName, locale, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 365 * 24 * 60 * 60
    });
  }

  const safeReturnTo =
    typeof returnTo === "string" &&
    returnTo.startsWith("/") &&
    !returnTo.startsWith("//") &&
    !returnTo.includes("\\")
      ? returnTo
      : "/";

  redirect(safeReturnTo);
}
