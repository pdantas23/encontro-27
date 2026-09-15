"use client";

import Link from "next/link";
import { useModalidades, type Modalidade } from "@/hooks/useModalidades";
import { TicketCard, TicketCardSkeleton } from "@/components/ingressos/TicketCard";

/** Start e VIP dão acesso ao evento; o resto são experiências (cap. 06). */
const SLUGS_EVENTO = new Set(["start", "vip"]);

/**
 * Modalidades em dois grupos, para o visitante entender o que é ingresso do
 * evento e o que é experiência vendida à parte. Estados: carregando / erro /
 * vazio / lista. Usada na Home e em /ingressos.
 */
export function TicketGrid({ showFallbackLink = true }: { showFallbackLink?: boolean }) {
  const state = useModalidades();

  if (state.status === "loading") {
    return (
      <ul className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <TicketCardSkeleton key={i} />
        ))}
      </ul>
    );
  }

  if (state.status === "error") {
    return (
      <p role="alert" className="border-l-2 border-vermelho pl-4 text-marrom">
        Não foi possível carregar os ingressos agora. Tente novamente em instantes
        {showFallbackLink ? (
          <>
            {" "}
            ou acesse a{" "}
            <Link href="/ingressos" className="text-vinho underline underline-offset-4">
              página de ingressos
            </Link>
          </>
        ) : null}
        .
      </p>
    );
  }

  if (state.modalidades.length === 0) {
    return <p className="text-lg text-marrom">Os ingressos serão disponibilizados em breve.</p>;
  }

  const evento = state.modalidades.filter((m) => SLUGS_EVENTO.has(m.slug));
  const experiencias = state.modalidades.filter((m) => !SLUGS_EVENTO.has(m.slug));

  return (
    <div className="space-y-12">
      <Grupo titulo="Ingressos do evento" itens={evento} colunas="sm:grid-cols-2" />
      <Grupo titulo="Experiências" itens={experiencias} colunas="sm:grid-cols-2" />
    </div>
  );
}

function Grupo({ titulo, itens, colunas = "sm:grid-cols-2" }: { titulo: string; itens: Modalidade[]; colunas?: string }) {
  if (itens.length === 0) return null;
  return (
    <div>
      <h3 className="eyebrow text-marrom-suave">{titulo}</h3>
      <ul className={`mt-4 grid gap-5 ${colunas}`}>
        {itens.map((m) => (
          <TicketCard key={m.id} modalidade={m} />
        ))}
      </ul>
    </div>
  );
}
