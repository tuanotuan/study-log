import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LogStudy",
  description: "Ghi lại commit học tập hằng ngày"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
