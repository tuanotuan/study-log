import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LogStudy",
    template: "%s | LogStudy"
  },
  description: "Ghi lại hành trình học tập mỗi ngày bằng commit, hình ảnh và streak."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
