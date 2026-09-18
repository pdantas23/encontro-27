"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Dados da conta usados no pedido: nome e WhatsApp foram coletados no cadastro (user_metadata). */
export interface PerfilComprador {
  email: string;
  nome: string | null;
  whatsapp: string | null;
}

/**
 * Portão de conta do checkout.
 *
 * A compra exige sessão: o ingresso e o QR Code vivem em /minha-conta, e a RPC
 * meus_pedidos_encontro27 casa o pedido pelo e-mail autenticado. Comprar
 * deslogado deixava o pedido preso a um e-mail digitado que podia nunca virar
 * conta.
 *
 * Sem sessão, manda pro /login unificado do site (mesmo formulário de
 * e-mail+senha usado em qualquer outro lugar), com volta automática pra esta
 * mesma URL de checkout via ?redirect=.
 */
export function CheckoutAuthGate({ children }: { children: (perfil: PerfilComprador) => React.ReactNode }) {
  const [perfil, setPerfil] = useState<PerfilComprador | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;

      if (!user?.email) {
        // pathname já vem com o basePath (é a URL real do navegador); o
        // redirect precisa ir SEM ele, porque router.push (usado no login)
        // adiciona o basePath de novo.
        const semBasePath = (window.location.pathname + window.location.search).replace(
          new RegExp(`^${basePath}`),
          "",
        );
        window.location.replace(`${basePath}/login?redirect=${encodeURIComponent(semBasePath)}`);
        return;
      }

      setPerfil({
        email: user.email,
        nome: (user.user_metadata?.nome as string | undefined)?.trim() || null,
        whatsapp: (user.user_metadata?.whatsapp as string | undefined)?.trim() || null,
      });
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  if (!perfil) return <p className="text-marrom-suave">Carregando…</p>;
  return <>{children(perfil)}</>;
}
