import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalesFlow AI",
  description: "AI搭載 顧客・案件管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}