"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MeuPedido } from "@/types/checkout";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// ⚠️ TEMPORÁRIO — só pra pré-visualização local, pedido pelo usuário. NÃO
// COMMITAR assim. Pula o login e mostra um ingresso falso (nada toca o
// banco). Voltar PREVIEW_FAKE pra false (ou apagar o bloco) assim que a
// visualização acabar.
const PREVIEW_FAKE = true;
const PEDIDO_FAKE: MeuPedido = {
  id: "00000000-0000-0000-0000-000000000000",
  status_pagamento: "aprovado",
  quantidade: 1,
  valor_total: 890,
  comprador_nome: "Maria da Silva",
  comprador_whatsapp: "(11) 98888-7777",
  modalidade_nome: "VIP",
  lote_nome: "Lote 1",
  created_at: new Date().toISOString(),
  participantes: [
    {
      nome: "Maria da Silva",
      identificador_unico: "11111111-2222-3333-4444-555555555555",
      check_in_status: false,
    },
  ],
};

/**
 * Sessão + pedidos do comprador autenticado (login por e-mail/senha, ver
 * /login). Sem sessão, redireciona para /login.
 */
export function useMeusPedidos() {
  const [email, setEmail] = useState<string | null>(PREVIEW_FAKE ? "maria@example.com" : null);
  const [pedidos, setPedidos] = useState<MeuPedido[] | null>(PREVIEW_FAKE ? [PEDIDO_FAKE] : null);
  const [loading, setLoading] = useState(!PREVIEW_FAKE);

  useEffect(() => {
    if (PREVIEW_FAKE) return;

    let ativo = true;

    async function carregar() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.replace(`${basePath}/login`);
        return;
      }
      if (!ativo) return;

      setEmail(user.email ?? null);

      const { data } = await supabase.rpc("meus_pedidos_encontro27");
      if (!ativo) return;

      setPedidos((data as unknown as MeuPedido[] | null) ?? []);
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
    const { data } = await supabase.rpc("meus_pedidos_encontro27");
    setPedidos((data as unknown as MeuPedido[] | null) ?? []);
  }

  return { email, pedidos, loading, refetch };
}
