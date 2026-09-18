"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MeuIngresso } from "@/types/checkout";

/** Ingressos que a sessão atual segura — o que aparece em "Meus ingressos". */
export function useMeusIngressos() {
  const [ingressos, setIngressos] = useState<MeuIngresso[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    const supabase = createClient();
    const { data } = await supabase.rpc("meus_ingressos_encontro27");
    setIngressos((data as unknown as MeuIngresso[] | null) ?? []);
  }

  return { ingressos, loading, refetch };
}
