"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MeuIngresso } from "@/types/checkout";

// ⚠️ TEMPORÁRIO — mesmo preview local do useMeusPedidos (ver o aviso lá).
// Some junto quando o bypass for removido.
const PREVIEW_FAKE = true;
const INGRESSO_FAKE: MeuIngresso = {
  identificador_unico: "11111111-2222-3333-4444-555555555555",
  nome: "Maria da Silva",
  check_in_status: false,
  status_pagamento: "aprovado",
  modalidade_nome: "VIP",
  transferencia_pendente: null,
};

/** Ingressos que a sessão atual segura — o que aparece em "Meus ingressos". */
export function useMeusIngressos() {
  const [ingressos, setIngressos] = useState<MeuIngresso[] | null>(PREVIEW_FAKE ? [INGRESSO_FAKE] : null);
  const [loading, setLoading] = useState(!PREVIEW_FAKE);

  useEffect(() => {
    if (PREVIEW_FAKE) return;

    let ativo = true;

    async function carregar() {
      const supabase = createClient();
      const { data } = await supabase.rpc("meus_ingressos_encontro27");
      if (!ativo) return;

      setIngressos((data as unknown as MeuIngresso[] | null) ?? []);
      setLoading(false);
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, []);

  async function refetch() {
    if (PREVIEW_FAKE) return;

    const supabase = createClient();
    const { data } = await supabase.rpc("meus_ingressos_encontro27");
    setIngressos((data as unknown as MeuIngresso[] | null) ?? []);
  }

  return { ingressos, loading, refetch };
}
