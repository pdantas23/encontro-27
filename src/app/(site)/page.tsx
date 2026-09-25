import { EventoBanner } from "@/components/landing/EventoBanner";
import { EventInfo } from "@/components/landing/EventInfo";
import { SobreSection } from "@/components/landing/SobreSection";
import { ExperienciasSection } from "@/components/landing/ExperienciasSection";
import { ConvidadosSection } from "@/components/landing/ConvidadosSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { EdicoesAnterioresSection } from "@/components/landing/EdicoesAnterioresSection";
import { EventJsonLd } from "@/components/landing/EventJsonLd";
import { IngressosCaixa } from "@/components/ingressos/IngressosCaixa";

/**
 * Home no desenho de página de ingressos (Sympla): banner, fotos de edições
 * anteriores, título e dados do evento, caixa de ingressos fixa na lateral e a descrição do evento em
 * blocos na coluna da esquerda. No celular a caixa vem logo depois do título,
 * e uma barra "a partir de" fica presa embaixo quando ela sai da tela.
 * Server component: só as ilhas que dependem do Supabase são client.
 */
export default function HomePage() {
  return (
    <main id="conteudo" className="pb-24 lg:pb-16">
      <EventJsonLd />
      <EventoBanner />
      <EdicoesAnterioresSection />

      <div className="container-site grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="pt-6 sm:pt-8 pb-8 lg:col-start-1">
          <h1 className="font-display text-heading text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.1]">
            O Encontro 2027
          </h1>
          <p className="mt-3 font-display text-vinho text-xl sm:text-2xl leading-snug text-balance">
            Natureza que conecta. Cultura que transforma.
          </p>
          <p className="mt-3 max-w-xl text-[17px] leading-7 text-marrom text-pretty">
            O Encontro 2027 celebra o Piauí com sofisticação, afetividade e propósito.
          </p>
          <EventInfo className="mt-6" />
        </div>

        <aside className="pb-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:pt-8">
          <div className="lg:sticky lg:top-6">
            <IngressosCaixa barraMobile />
          </div>
        </aside>

        <div className="lg:col-start-1">
          <SobreSection />
          <ExperienciasSection />
          <ConvidadosSection />
          <FaqSection />
        </div>
      </div>
    </main>
  );
}
