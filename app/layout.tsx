import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import SiteHeader from "@/components/SiteHeader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "M.A. Confecções e Brindes",
  description:
    "Camisetas, canecas, brindes personalizados, uniformes, linha Baby, Pet, Torcedor e muito mais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${inter.className} ${inter.variable}`}
    >
      <body>
        <SiteHeader />

        {children}
      </body>
    </html>
  );
}