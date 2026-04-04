import type { Metadata } from "next";
import "./globals.css";
import { HeaderNav } from "@/widgets/HeaderNav";
import { FooterBar } from "@/widgets/FooterBar";

export const metadata: Metadata = {
  title: "BizGuide – Цифровой советник для бизнеса",
  description: "WW TEAM :P",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="flex min-h-screen flex-col">
        <HeaderNav />
        <main className="flex-grow">{children}</main>
        <FooterBar />
      </body>
    </html>
  );
}