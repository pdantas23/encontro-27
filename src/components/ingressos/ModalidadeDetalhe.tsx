"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database, Json } from "@/types/database";
import { formatCurrencyBRL } from "@/lib/utils";
import { trackSelectTicket } from "@/lib/tracking/events";

type Modalidade = Database["public"]["Tables"]["modalidades_encontro27"]["Row"] & {
  lotes_encontro27: Database["public"]["Tables"]["lotes_encontro27"]["Row"][];
};

/** itens_incluidos/itens_nao_incluidos são jsonb — hoje vêm null, mas quando
 * preenchidos esperamos uma lista simples de strings. Qualquer outro formato
 * é tratado como "sem itens" em vez de quebrar a página. */
function toStringList(value: Json | null): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function ModalidadeDetalhe({ slug }: { slug: string }) {
  const [modalidade, setModalidade] = useState<Modalidade | null | undefined>(undefined);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("modalidades_encontro27")
        .select("*, lotes_encontro27(*)")
        .eq("slug", slug)
        .maybeSingle();
      setModalidade((data as unknown as Modalidade | null) ?? null);
    }
    load();
  }, [slug]);

  if (modalidade === undefined) {
    return (
      <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
        <p>Carregando...</p>
      </main>
    );
  }

  if (!modalidade) {
    return (
      <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
        <h1>Modalidade não encontrada</h1>
        <p>
          <Link href="/ingressos">Voltar para ingressos</Link>
        </p>
      </main>
    );
  }

  const loteAtivo = modalidade.lotes_encontro27.find((lote) => lote.status === "ativo") ?? null;
  const compravel = Boolean(loteAtivo?.preco != null && loteAtivo?.hypercash_checkout_url);
  const disponibilidade =
    loteAtivo?.quantidade != null ? loteAtivo.quantidade - loteAtivo.quantidade_vendida : null;

  const itensIncluidos = toStringList(modalidade.itens_incluidos);
  const itensNaoIncluidos = toStringList(modalidade.itens_nao_incluidos);

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <p>
        <Link href="/ingressos">← Voltar para ingressos</Link>
      </p>

      <h1>{modalidade.nome}</h1>
      <p>{modalidade.descricao ?? "Em breve"}</p>

      <h2>Para quem é</h2>
      <p>{modalidade.para_quem_e ?? "A definir"}</p>

      <h2>O que está incluído</h2>
      {itensIncluidos.length > 0 ? (
        <ul>
          {itensIncluidos.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>Em breve</p>
      )}

      <h2>O que não está incluído</h2>
      {itensNaoIncluidos.length > 0 ? (
        <ul>
          {itensNaoIncluidos.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>Em breve</p>
      )}

      <h2>Condições</h2>
      <p>{modalidade.condicoes ?? "A definir"}</p>

      <h2>Preço e disponibilidade</h2>
      <p style={{ fontWeight: "bold" }}>
        {loteAtivo?.preco != null ? formatCurrencyBRL(loteAtivo.preco) : "Preço a definir"}
      </p>
      <p>
        {disponibilidade != null ? `${disponibilidade} vaga(s) disponível(is)` : "Disponibilidade a definir"}
      </p>

      {compravel && loteAtivo ? (
        <Link
          href={`/checkout?lote=${loteAtivo.id}`}
          onClick={() => trackSelectTicket(modalidade.slug, modalidade.nome)}
          style={{
            display: "inline-block",
            padding: "8px 16px",
            background: "#111",
            color: "#fff",
            borderRadius: 4,
            textDecoration: "none",
          }}
        >
          Comprar
        </Link>
      ) : (
        <p style={{ color: "#888" }}>Em breve</p>
      )}
    </main>
  );
}
