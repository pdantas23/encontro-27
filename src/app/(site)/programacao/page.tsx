"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { PageHeader } from "@/components/layout/PageHeader";

type ProgramacaoRow = Database["public"]["Tables"]["programacao_encontro27"]["Row"] & {
  palestrantes_encontro27: { nome: string } | null;
};

export default function ProgramacaoPage() {
  const [itens, setItens] = useState<ProgramacaoRow[] | null | undefined>(undefined);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("programacao_encontro27")
        .select("*, palestrantes_encontro27(nome)")
        .order("dia", { ascending: true })
        .order("ordem", { ascending: true });
      setItens((data as unknown as ProgramacaoRow[]) ?? null);
    }
    load();
  }, []);

  const porDia = new Map<number, ProgramacaoRow[]>();
  for (const item of itens ?? []) {
    const lista = porDia.get(item.dia) ?? [];
    lista.push(item);
    porDia.set(item.dia, lista);
  }
  const dias = Array.from(porDia.keys()).sort((a, b) => a - b);

  return (
    <>
      <PageHeader
        title="Programação"
        description="O que acontece em cada dia do evento."
      />

      <main id="conteudo" className="container-site py-10 sm:py-14">
        {itens === undefined ? (
          <p className="text-marrom-suave">Carregando…</p>
        ) : dias.length === 0 ? (
          <p className="text-marrom-suave">A programação completa será publicada em breve.</p>
        ) : (
          <div className="max-w-3xl space-y-14">
            {dias.map((dia) => (
              <section key={dia} aria-labelledby={`dia-${dia}`}>
                <h2 id={`dia-${dia}`} className="rotulo-secao text-ambar-texto">
                  Dia {dia}
                </h2>
                <span aria-hidden="true" className="filete mt-4" />

                <ul className="mt-7 divide-y divide-border border-y border-border">
                  {(porDia.get(dia) ?? []).map((item) => (
                    <li key={item.id} className="flex flex-col gap-1 py-5 sm:flex-row sm:gap-8">
                      <p className="font-display text-lg text-dourado sm:w-24 sm:shrink-0 sm:pt-0.5">
                        {item.horario ?? "A definir"}
                      </p>
                      <div className="min-w-0">
                        <p className="font-display text-xl text-heading leading-snug">{item.atividade}</p>
                        {item.palestrantes_encontro27?.nome ? (
                          <p className="mt-1 text-marrom">{item.palestrantes_encontro27.nome}</p>
                        ) : null}
                        {item.local ? (
                          <p className="mt-1 text-sm text-marrom-suave">{item.local}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
