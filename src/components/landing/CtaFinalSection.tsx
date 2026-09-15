import { CTAButton } from "@/components/ui/CTAButton";

/** Reforço final de valor + compra. Sem escassez inventada. */
export function CtaFinalSection() {
  return (
    <section aria-labelledby="cta-final-titulo" className="relative overflow-hidden bg-botanico">
      <div aria-hidden="true" className="absolute inset-0 bg-papel/75" />
      <div className="container-site relative flex flex-col items-center py-16 sm:py-24 text-center">
        <h2 id="cta-final-titulo" className="font-display text-heading text-3xl sm:text-4xl lg:text-5xl leading-[1.1] max-w-2xl text-balance">
          Da mesma origem, diferentes movimentos se encontram para formar algo maior.
        </h2>
        <p className="mt-5 max-w-xl text-lg text-marrom">
          Os ingressos estão à venda.
        </p>
        <CTAButton href="#ingressos" size="lg" className="mt-8">
          Ver ingressos
        </CTAButton>
      </div>
    </section>
  );
}
