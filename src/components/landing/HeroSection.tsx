import Image from "next/image";
import { CTAButton } from "@/components/ui/CTAButton";
import { assetPath } from "@/lib/utils";
import { EventInfo } from "@/components/landing/EventInfo";

/**
 * Hero: server component, H1 e CTA no HTML estático. Copy é a do manual de
 * identidade (p.3). Data e local só aparecem quando confirmados (EventInfo).
 */
export function HeroSection() {
  return (
    <section aria-labelledby="hero-titulo" className="relative overflow-hidden bg-papel">
      {/* Fundo botânico como <img> para ser descoberto cedo (elemento LCP). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assetPath("/brand/fundo-botanico-sm.webp")}
        srcSet={`${assetPath("/brand/fundo-botanico-sm.webp")} 720w, ${assetPath("/brand/fundo-botanico.webp")} 1600w`}
        sizes="(max-width: 767px) 50vw, 100vw"
        alt=""
        width={1600}
        height={1067}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-papel/70" />

      <div className="container-site relative flex flex-col items-center text-center py-8 sm:py-20 lg:py-24">
        <Image
          src={assetPath("/brand/flor-ouro.webp")}
          alt=""
          width={600}
          height={571}
          priority
          data-flor-origem=""
          sizes="(min-width: 640px) 180px, 80px"
          className="w-20 sm:w-[180px] h-auto"
        />

        <h1 id="hero-titulo" className="font-display text-heading mt-4 sm:mt-6 text-4xl sm:text-6xl lg:text-7xl leading-none tracking-wide">
          O Encontro{" "}
          <span className="block font-serif text-ambar-texto text-xl sm:text-3xl tracking-[0.35em] mt-2 sm:mt-3">2027</span>
        </h1>

        <p className="font-display text-vinho text-2xl sm:text-3xl lg:text-4xl leading-tight mt-4 sm:mt-8 max-w-2xl text-balance">
          Natureza que conecta. Cultura que transforma.
        </p>
        <p className="mt-3 sm:mt-4 max-w-lg text-[17px] leading-7 sm:text-lg sm:leading-relaxed text-marrom text-pretty">
          O Encontro 2027 celebra o Piauí com sofisticação, afetividade e propósito.
        </p>

        <CTAButton href="#ingressos" size="lg" className="mt-5 sm:mt-7 w-full sm:w-auto">
          Comprar ingresso
        </CTAButton>
        <CTAButton href="#experiencias" variant="ghost" className="mt-2 sm:mt-3 min-h-11 text-[15px]">
          Conhecer o evento
        </CTAButton>

        <EventInfo className="mt-6 sm:mt-8" />
      </div>
    </section>
  );
}
