import { HeroSection } from "@/components/landing/HeroSection";
import { PorQueParticiparSection } from "@/components/landing/PorQueParticiparSection";
import { CincoAnosSection } from "@/components/landing/CincoAnosSection";
import { ExperienciasSection } from "@/components/landing/ExperienciasSection";
import { ConvidadosSection } from "@/components/landing/ConvidadosSection";
import { IngressosSection } from "@/components/landing/IngressosSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { CtaFinalSection } from "@/components/landing/CtaFinalSection";
import { EdicoesAnterioresSection } from "@/components/landing/EdicoesAnterioresSection";
import { EventJsonLd } from "@/components/landing/EventJsonLd";
import { FlorMotion } from "@/components/landing/FlorMotion";

/**
 * Home / landing de vendas. Server component: tudo que é estático sai no
 * HTML; só as ilhas que dependem do Supabase são client components.
 */
export default function HomePage() {
  return (
    <main id="conteudo" className="relative">
      <EventJsonLd />
      <FlorMotion />
      <HeroSection />
      <PorQueParticiparSection />
      <CincoAnosSection />
      <ExperienciasSection />
      <ConvidadosSection />
      <IngressosSection />
      <FaqSection />
      <EdicoesAnterioresSection />
      <CtaFinalSection />
    </main>
  );
}
