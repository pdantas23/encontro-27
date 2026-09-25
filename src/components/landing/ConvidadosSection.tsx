"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { publicSelect } from "@/lib/supabase/publicRest";
import { EventoSecao } from "@/components/landing/EventoSecao";
import { SpeakerCard } from "@/components/landing/SpeakerCard";

interface Convidado {
  id: string;
  nome: string;
  funcao: string | null;
  foto_url: string | null;
}

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; itens: Convidado[] };

const LIMITE_HOME = 8;

/**
 * Convidados/palestrantes confirmados no banco. Hoje a tabela está vazia
 * (cap. 16), então a seção mostra o estado "em breve" — sem nomes inventados.
 */
export function ConvidadosSection() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    publicSelect<Convidado>("palestrantes_encontro27", `select=id,nome,funcao,foto_url&order=ordem.asc&limit=${LIMITE_HOME}`)
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
    <EventoSecao id="convidados" titulo="Convidados">
      <div aria-live="polite">
        {state.status === "loading" ? (
          <p aria-hidden="true" className="h-7 w-2/3 max-w-xl rounded bg-areia animate-pulse" />
        ) : state.status === "error" ? (
          <p className="text-marrom">
            Não foi possível carregar os convidados agora.{" "}
            <Link href="/convidados" className="font-semibold text-vinho underline underline-offset-4">
              Ver a página de convidados
            </Link>
            .
          </p>
        ) : state.itens.length === 0 ? (
          <p className="text-[17px] leading-7 text-marrom">Os convidados desta edição serão anunciados em breve.</p>
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {state.itens.map((c) => (
                <SpeakerCard key={c.id} nome={c.nome} funcao={c.funcao} fotoUrl={c.foto_url} />
              ))}
            </ul>
            <p className="mt-10">
              <Link href="/convidados" className="inline-flex min-h-11 items-center font-semibold text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro">
                Ver todos os convidados
              </Link>
            </p>
          </>
        )}
      </div>
    </EventoSecao>
  );
}
