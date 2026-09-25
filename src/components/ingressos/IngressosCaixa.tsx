"use client";

import { useEffect, useRef, useState } from "react";
import { Ticket } from "lucide-react";
import { useModalidades } from "@/hooks/useModalidades";
import { IngressosLista, menorPrecoCompravel } from "@/components/ingressos/IngressosLista";
import { CTAButton } from "@/components/ui/CTAButton";
import { formatCurrencyBRL } from "@/lib/utils";

/**
 * Caixa de ingressos no desenho de bilheteria (Sympla): card com todas as
 * modalidades. Na home fica fixa na lateral; no celular, com `barraMobile`,
 * uma barra "a partir de" presa embaixo aparece sempre que a caixa sai da tela.
 */
export function IngressosCaixa({ barraMobile = false, showFallbackLink = true }: { barraMobile?: boolean; showFallbackLink?: boolean }) {
  const state = useModalidades();
  const caixaRef = useRef<HTMLElement>(null);
  const [caixaVisivel, setCaixaVisivel] = useState(true);
  const aPartirDe = menorPrecoCompravel(state);

  useEffect(() => {
    const caixa = caixaRef.current;
    if (!barraMobile || !caixa) return;
    const observer = new IntersectionObserver(([entry]) => setCaixaVisivel(entry.isIntersecting));
    observer.observe(caixa);
    return () => observer.disconnect();
  }, [barraMobile]);

  return (
    <>
      <section
        ref={caixaRef}
        id="ingressos"
        aria-labelledby="ingressos-titulo"
        className="scroll-mt-6 rounded-card border border-border bg-papel p-5 sm:p-6 shadow-card"
      >
        <h2 id="ingressos-titulo" className="flex items-center gap-2 font-display text-heading text-2xl">
          <Ticket aria-hidden="true" className="size-5 text-ambar-texto" />
          Ingressos
        </h2>
        <div className="mt-4">
          <IngressosLista state={state} showFallbackLink={showFallbackLink} />
        </div>
      </section>

      {barraMobile && aPartirDe != null ? (
        <div
          aria-hidden={caixaVisivel}
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-papel/95 backdrop-blur-sm transition-transform duration-200 motion-reduce:transition-none lg:hidden ${
            caixaVisivel ? "translate-y-full" : "translate-y-0"
          }`}
        >
          <div className="container-site flex items-center justify-between gap-4 py-3">
            <p className="text-sm leading-tight text-marrom-suave">
              Ingressos a partir de
              <span className="block font-display text-xl text-vinho">{formatCurrencyBRL(aPartirDe)}</span>
            </p>
            <CTAButton href="#ingressos" tabIndex={caixaVisivel ? -1 : undefined}>
              Ver ingressos
            </CTAButton>
          </div>
        </div>
      ) : null}
    </>
  );
}
