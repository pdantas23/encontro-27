import Image from "next/image";
import { assetPath } from "@/lib/utils";

/**
 * Banner do evento no topo da página de ingressos (desenho de bilheteria):
 * fundo botânico oficial com a assinatura da marca. Decorativo — o nome do
 * evento em texto é o H1 logo abaixo.
 */
export function EventoBanner() {
  return (
    <div className="relative overflow-hidden bg-papel">
      {/* Fundo como <img> para ser descoberto cedo (elemento LCP). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assetPath("/brand/fundo-botanico-sm.webp")}
        srcSet={`${assetPath("/brand/fundo-botanico-sm.webp")} 720w, ${assetPath("/brand/fundo-botanico.webp")} 1600w`}
        sizes="100vw"
        alt=""
        width={1600}
        height={1067}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-papel/70" />

      <div aria-hidden="true" className="relative flex flex-col items-center justify-center py-10 sm:py-14 lg:py-16">
        <Image
          src={assetPath("/brand/flor-ouro.webp")}
          alt=""
          width={600}
          height={571}
          priority
          sizes="(min-width: 640px) 110px, 56px"
          className="w-14 sm:w-[90px] lg:w-[110px] h-auto"
        />
        {/* Wordmark oficial (não recriar em fonte de sistema). */}
        <Image
          src={assetPath("/brand/wordmark-ouro.webp")}
          alt=""
          width={900}
          height={135}
          priority
          sizes="(min-width: 1024px) 460px, (min-width: 640px) 380px, 220px"
          className="mt-3 sm:mt-4 w-[220px] sm:w-[380px] lg:w-[460px] h-auto"
        />
        <span className="mt-2 sm:mt-3 flex items-center justify-center gap-3 sm:gap-4 font-display text-dourado text-xs sm:text-base tracking-[0.42em] indent-[0.42em]">
          <span className="h-px w-8 sm:w-12 bg-dourado-linha" />
          2027
          <span className="h-px w-8 sm:w-12 bg-dourado-linha" />
        </span>
    </div>
    </div>
  );
}
