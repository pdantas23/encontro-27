"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CheckoutWizard } from "./CheckoutWizard";
import type { LoteComModalidade } from "@/types/checkout";

export function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const loteId = searchParams.get("lote");
  const [lote, setLote] = useState<LoteComModalidade | null | undefined>(undefined);

  useEffect(() => {
    if (!loteId) return;
    const id = loteId;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("lotes_encontro27")
        .select(
          "id, nome, preco, quantidade, quantidade_vendida, status, hypercash_checkout_url, modalidades_encontro27(slug, nome)",
        )
        .eq("id", id)
        .maybeSingle();

      if (!data) {
        setLote(null);
        return;
      }

      const modalidade = data.modalidades_encontro27 as unknown as { slug: string; nome: string } | null;
      if (!modalidade) {
        setLote(null);
        return;
      }

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
    <div>
      <h1>Ingresso não encontrado</h1>
      <Link href="/ingressos">Voltar para ingressos</Link>
    </div>
  );

  if (!loteId) return naoEncontrado;
  if (lote === undefined) return <p>Carregando...</p>;
  if (!lote) return naoEncontrado;

  if (lote.status !== "ativo") {
    return <p>Esta modalidade não está disponível para compra no momento.</p>;
  }

  if (lote.preco == null || !lote.hypercash_checkout_url) {
    return <p>Esta modalidade ainda não está com preço e pagamento configurados. Volte em breve.</p>;
  }

  const disponivel = lote.quantidade == null ? null : lote.quantidade - lote.quantidade_vendida;
  if (disponivel !== null && disponivel <= 0) {
    return <p>Ingressos esgotados para esta modalidade.</p>;
  }

  return <CheckoutWizard lote={lote} />;
}
