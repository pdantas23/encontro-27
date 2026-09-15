import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { UtmCapture } from "@/components/tracking/UtmCapture";
import { GoogleTagManagerScript, GoogleTagManagerNoscript } from "@/components/tracking/GoogleTagManager";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "O Encontro 2027",
  description: "O Encontro 2027 — edição comemorativa de 5 anos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <GoogleTagManagerScript />
      </head>
      <body className="min-h-full flex flex-col">
        <GoogleTagManagerNoscript />
        <UtmCapture />
        {children}
      </body>
    </html>
  );
}
