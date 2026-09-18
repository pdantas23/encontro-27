"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MeuPedido } from "@/types/checkout";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Sessão + pedidos do comprador autenticado (login por e-mail/senha, ver
 * /login). Sem sessão, redireciona para /login.
 */
export function useMeusPedidos() {
  const [email, setEmail] = useState<string | null>(null);
  const [pedidos, setPedidos] = useState<MeuPedido[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  return { email, pedidos, loading };
}
