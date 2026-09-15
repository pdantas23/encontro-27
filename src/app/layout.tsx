import type { Metadata } from "next";
import { Oranienbaum, Quicksand, Libre_Baskerville } from "next/font/google";
import { UtmCapture } from "@/components/tracking/UtmCapture";
import { GoogleTagManagerScript, GoogleTagManagerNoscript } from "@/components/tracking/GoogleTagManager";
import "./globals.css";

/**
 * Tipografia da identidade oficial (ver checkpoint L0):
 * - The Seasons (títulos) é comercial → Oranienbaum, presente no próprio manual (p.2).
 * - Quicksand (corpo) e Libre Baskerville ("2027" do logo) são as fontes originais.
 * Todas via next/font: self-hosted, com fallback ajustado para zero CLS.
 */
const oranienbaum = Oranienbaum({
  variable: "--font-oranienbaum",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Domínio de produção é PENDENTE (cap. 16). Enquanto isso, NEXT_PUBLIC_SITE_URL
 * define a base absoluta de canonical/OG; sem ela, Next usa URLs relativas.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const description =
  "Edição comemorativa de 5 anos. Natureza que conecta, cultura que transforma: conheça as experiências, os convidados e as modalidades de ingresso do O Encontro 2027.";

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: "O Encontro 2027 | Edição de 5 anos",
    template: "%s | O Encontro 2027",
  },
  description,
  alternates: siteUrl ? { canonical: `${basePath}/` } : undefined,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "O Encontro 2027",
    title: "O Encontro 2027 | Edição de 5 anos",
    description,
    images: [{ url: `${basePath}/brand/og.jpg`, width: 1200, height: 630, alt: "O Encontro 2027" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: { icon: `${basePath}/brand/flor-ouro-sm.webp` },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${oranienbaum.variable} ${quicksand.variable} ${libreBaskerville.variable} h-full antialiased`}
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
