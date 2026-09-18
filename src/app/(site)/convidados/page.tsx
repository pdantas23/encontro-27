"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { PageHeader } from "@/components/layout/PageHeader";

type Palestrante = Database["public"]["Tables"]["palestrantes_encontro27"]["Row"];

export default function ConvidadosPage() {
  const [palestrantes, setPalestrantes] = useState<Palestrante[] | null | undefined>(undefined);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("palestrantes_encontro27")
        .select("*")
        .order("ordem", { ascending: true });
      setPalestrantes(data ?? null);
    }
    load();
  }, []);

  return (
    <>
      <PageHeader
        title="Convidados"
        description="Quem sobe ao palco do O Encontro 2027."
      />

      <main id="conteudo" className="container-site py-10 sm:py-14">
        {palestrantes === undefined ? (
          <p className="text-marrom-suave">Carregando…</p>
        ) : !palestrantes || palestrantes.length === 0 ? (
          <p className="text-marrom-suave">Os convidados desta edição serão anunciados em breve.</p>
        ) : (
          <ul className="max-w-3xl divide-y divide-border border-y border-border">
            {palestrantes.map((pessoa) => (
              <li key={pessoa.id} className="flex gap-5 py-7 sm:gap-6">
                <div className="size-24 sm:size-28 shrink-0 overflow-hidden rounded-full border border-border bg-areia">
                  {pessoa.foto_url ? (
                    // Fotos vêm de URL externa cadastrada no painel; sem otimização (output: export).
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pessoa.foto_url}
                      alt=""
                      width={112}
                      height={112}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex size-full items-center justify-center font-display text-3xl text-dourado"
                    >
                      {pessoa.nome.trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="font-display text-2xl text-heading leading-snug">{pessoa.nome}</h2>
                  {pessoa.funcao ? (
                    <p className="rotulo-secao mt-2 text-ambar-texto text-[0.8rem]">{pessoa.funcao}</p>
                  ) : null}
                  {pessoa.bio ? (
                    <p className="mt-4 text-[17px] leading-7 text-marrom text-pretty">{pessoa.bio}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
