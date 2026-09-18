"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { trackFaqInteraction } from "@/lib/tracking/events";
import { PageHeader } from "@/components/layout/PageHeader";

type Faq = Database["public"]["Tables"]["faq_encontro27"]["Row"];

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[] | null | undefined>(undefined);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("faq_encontro27")
        .select("*")
        .order("ordem", { ascending: true });
      setFaqs(data ?? null);
    }
    load();
  }, []);

  return (
    <>
      <PageHeader
        title="Perguntas frequentes"
        description="Dúvidas sobre ingressos, pagamento, acesso e as experiências do evento."
      />

      <main id="conteudo" className="container-site py-10 sm:py-14">
        {faqs === undefined ? (
          <p className="text-marrom-suave">Carregando…</p>
        ) : !faqs || faqs.length === 0 ? (
          <p className="text-marrom-suave">As perguntas frequentes serão publicadas em breve.</p>
        ) : (
          <div className="max-w-3xl divide-y divide-border border-y border-border">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="group py-5"
                onToggle={(event) => {
                  if (event.currentTarget.open) {
                    trackFaqInteraction(faq.pergunta);
                  }
                }}
              >
                <summary className="flex cursor-pointer items-start justify-between gap-4 font-display text-xl text-heading leading-snug marker:content-none [&::-webkit-details-marker]:hidden">
                  {faq.pergunta}
                  <span aria-hidden="true" className="mt-1 shrink-0 text-dourado transition-transform group-open:rotate-45">
                    ✦
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-[17px] leading-7 text-marrom">
                  {faq.resposta ?? "Resposta em breve."}
                </p>
              </details>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
