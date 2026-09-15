"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { publicSelect } from "@/lib/supabase/publicRest";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { trackFaqInteraction } from "@/lib/tracking/events";

interface Faq {
  id: string;
  pergunta: string;
  resposta: string | null;
}

type State = { status: "loading" } | { status: "error" } | { status: "ready"; itens: Faq[] };

const LIMITE_HOME = 6;

/**
 * FAQ da Home: só perguntas já respondidas no banco. Tabela vazia hoje
 * (cap. 16) → estado "em breve", sem perguntas inventadas.
 */
export function FaqSection() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    publicSelect<Faq>("faq_encontro27", `select=id,pergunta,resposta&resposta=not.is.null&order=ordem.asc&limit=${LIMITE_HOME}`)
      .then((itens) => {
        if (!cancelled) setState({ status: "ready", itens });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section aria-labelledby="faq-titulo" className="border-t border-border">
      <div className="container-site py-16 sm:py-24 max-w-3xl">
        <SectionHeading id="faq-titulo" title="Tire suas dúvidas" align="center" />

        <div className="mt-10" aria-live="polite">
          {state.status === "loading" ? (
            <ul aria-hidden="true" className="divide-y divide-border animate-pulse">
              {Array.from({ length: 3 }, (_, i) => (
                <li key={i} className="h-14 bg-areia/40" />
              ))}
            </ul>
          ) : state.status === "error" ? (
            <p className="text-marrom">
              Não foi possível carregar as perguntas agora.{" "}
              <Link href="/faq" className="font-semibold text-vinho underline underline-offset-4">
                Ver página de perguntas frequentes
              </Link>
              .
            </p>
          ) : state.itens.length === 0 ? (
            <p className="text-lg text-marrom">As respostas sobre ingressos, pagamento e acesso serão publicadas em breve.</p>
          ) : (
            <>
              <ul className="divide-y divide-border border-y border-border">
                {state.itens.map((faq) => (
                  <li key={faq.id}>
                    <details
                      className="group"
                      onToggle={(e) => {
                        if (e.currentTarget.open) trackFaqInteraction(faq.pergunta);
                      }}
                    >
                      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-5 text-[17px] font-medium text-vinho [&::-webkit-details-marker]:hidden">
                        {faq.pergunta}
                        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-marrom transition-transform duration-200 group-open:rotate-180">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </summary>
                      <p className="pb-6 pr-8 text-marrom-suave leading-relaxed">{faq.resposta}</p>
                    </details>
                  </li>
                ))}
              </ul>
              <p className="mt-8">
                <Link href="/faq" className="inline-flex min-h-11 items-center font-semibold text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro">
                  Ver todas as perguntas
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
