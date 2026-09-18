"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { publicSelect } from "@/lib/supabase/publicRest";
import { formatCurrencyBRL } from "@/lib/utils";
import type { MeuPedido } from "@/types/checkout";

interface LoteOferta {
  id: string;
  preco: number | null;
  hypercash_checkout_url: string | null;
  status: string;
  modalidades_encontro27: { slug: string; nome: string; para_quem_e: string | null } | null;
}

/**
 * Oferta do "Almoço — Start" só para quem tem pedido Start. A modalidade fica
 * inativa (fora da Home e de /ingressos); o checkout continua aceitando o lote
 * por id. A elegibilidade aqui é só de exibição.
 */
export function OfertaAlmocoStart({ pedidos }: { pedidos: MeuPedido[] }) {
  const [lote, setLote] = useState<LoteOferta | null>(null);

  const temStart = pedidos.some(
    (p) => p.modalidade_nome === "Start" && p.status_pagamento !== "recusado" && p.status_pagamento !== "cancelado",
  );
  const jaTemAlmocoStart = pedidos.some(
    (p) => p.modalidade_nome === "Almoço — Start" && p.status_pagamento !== "recusado" && p.status_pagamento !== "cancelado",
  );

  useEffect(() => {
    if (!temStart || jaTemAlmocoStart) return;
    let cancelled = false;
    publicSelect<LoteOferta>(
      "lotes_encontro27",
      "select=id,preco,hypercash_checkout_url,status,modalidades_encontro27!inner(slug,nome,para_quem_e)&modalidades_encontro27.slug=eq.almoco-start&status=eq.ativo&order=ordem.asc&limit=1",
    )
      .then((rows) => {
        if (!cancelled) setLote(rows[0] ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [temStart, jaTemAlmocoStart]);

  if (!temStart || jaTemAlmocoStart || !lote || lote.preco == null || !lote.hypercash_checkout_url) return null;

  return (
    <section
      aria-labelledby="oferta-almoco-titulo"
      className="mt-8 rounded-card border border-dourado-linha bg-areia px-5 py-5"
    >
      <h2 id="oferta-almoco-titulo" className="font-display text-2xl text-heading leading-snug">
        Almoço de Negócios para quem tem Start
      </h2>
      <p className="mt-3 text-[17px] leading-7 text-marrom">
        {lote.modalidades_encontro27?.para_quem_e ?? "Exclusivo para participantes que já possuem ingresso Start."} Valor:{" "}
        <strong className="text-vinho">{formatCurrencyBRL(lote.preco)}</strong>.
      </p>
      <Link
        href={`/checkout?lote=${lote.id}`}
        className="mt-5 inline-flex min-h-11 items-center rounded-pill bg-ambar-escuro px-5 font-semibold text-papel hover:bg-ambar-pressed"
      >
        Adicionar o Almoço — Start
      </Link>
    </section>
  );
}
