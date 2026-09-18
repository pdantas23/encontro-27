"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CheckoutWizard } from "./CheckoutWizard";
import { CheckoutAuthGate } from "./CheckoutAuthGate";
import type { LoteComModalidade } from "@/types/checkout";

function lotePodeSerComprado(lote: Pick<LoteComModalidade, "status" | "preco" | "quantidade" | "quantidade_vendida">) {
  if (lote.status !== "ativo" || lote.preco == null) return false;
  return lote.quantidade == null || lote.quantidade - lote.quantidade_vendida > 0;
}

/** Lote ativo do VIP, se ainda dá pra comprar; senão não há upgrade a oferecer. */
async function carregarUpgradeVip(): Promise<LoteComModalidade | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("lotes_encontro27")
    .select(
      "id, nome, preco, quantidade, quantidade_vendida, status, hypercash_checkout_url, modalidades_encontro27!inner(slug, nome, descricao)",
    )
    .eq("modalidades_encontro27.slug", "vip")
    .eq("status", "ativo")
    .order("ordem", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  const modalidade = data.modalidades_encontro27 as unknown as LoteComModalidade["modalidade"] | null;
  if (!modalidade) return null;

  const vip: LoteComModalidade = {
    id: data.id,
    nome: data.nome,
    preco: data.preco,
    quantidade: data.quantidade,
    quantidade_vendida: data.quantidade_vendida,
    status: data.status,
    hypercash_checkout_url: data.hypercash_checkout_url,
    modalidade,
  };
  return lotePodeSerComprado(vip) ? vip : null;
}

export function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const loteId = searchParams.get("lote");
  const [lote, setLote] = useState<LoteComModalidade | null | undefined>(undefined);
  const [upgrade, setUpgrade] = useState<LoteComModalidade | null>(null);

  useEffect(() => {
    if (!loteId) return;
    const id = loteId;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("lotes_encontro27")
        .select(
          "id, nome, preco, quantidade, quantidade_vendida, status, hypercash_checkout_url, modalidades_encontro27(slug, nome, descricao)",
        )
        .eq("id", id)
        .maybeSingle();

      if (!data) {
        setLote(null);
        return;
      }

      const modalidade = data.modalidades_encontro27 as unknown as LoteComModalidade["modalidade"] | null;
      if (!modalidade) {
        setLote(null);
        return;
      }

      // Quem compra o Start pode fazer upgrade pro VIP.
      setUpgrade(modalidade.slug === "start" ? await carregarUpgradeVip() : null);

      setLote({
        id: data.id,
        nome: data.nome,
        preco: data.preco,
        quantidade: data.quantidade,
        quantidade_vendida: data.quantidade_vendida,
        status: data.status,
        hypercash_checkout_url: data.hypercash_checkout_url,
        modalidade,
      });
    }

    load();
  }, [loteId]);

  const naoEncontrado = (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-heading">Ingresso não encontrado</h1>
      <Link
        href="/ingressos"
        className="mt-4 inline-flex min-h-11 items-center text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro"
      >
        Voltar para ingressos
      </Link>
    </div>
  );

  if (!loteId) return naoEncontrado;
  if (lote === undefined) return <p className="text-marrom-suave">Carregando…</p>;
  if (!lote) return naoEncontrado;

  if (lote.status !== "ativo") {
    return <p className="max-w-2xl text-[17px] leading-7 text-marrom">Esta modalidade não está disponível para compra no momento.</p>;
  }

  if (lote.preco == null) {
    return <p className="max-w-2xl text-[17px] leading-7 text-marrom">Esta modalidade ainda não está com preço configurado. Volte em breve.</p>;
  }

  const disponivel = lote.quantidade == null ? null : lote.quantidade - lote.quantidade_vendida;
  if (disponivel !== null && disponivel <= 0) {
    return <p className="max-w-2xl text-[17px] leading-7 text-marrom">Ingressos esgotados para esta modalidade.</p>;
  }

  // Só entra no wizard com sessão: o pedido nasce colado ao e-mail da conta,
  // que é o que a área do usuário usa para mostrar ingresso e QR Code.
  return (
    <CheckoutAuthGate>{(perfil) => <CheckoutWizard lote={lote} upgrade={upgrade} perfil={perfil} />}</CheckoutAuthGate>
  );
}
