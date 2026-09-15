"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { trackFaqInteraction } from "@/lib/tracking/events";

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

  if (faqs === undefined) {
    return (
      <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
        <p>Carregando...</p>
      </main>
    );
  }

  if (!faqs || faqs.length === 0) {
    return (
      <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
        <h1>Perguntas frequentes</h1>
        <p>Perguntas frequentes em breve.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>Perguntas frequentes</h1>

      {faqs.map((faq) => (
        <details
          key={faq.id}
          style={{ marginBottom: 12, borderBottom: "1px solid #eee", paddingBottom: 12 }}
          onToggle={(event) => {
            if (event.currentTarget.open) {
              trackFaqInteraction(faq.pergunta);
            }
          }}
        >
          <summary style={{ cursor: "pointer", fontWeight: "bold" }}>{faq.pergunta}</summary>
          <p>{faq.resposta ?? "Resposta em breve."}</p>
        </details>
      ))}
    </main>
  );
}
