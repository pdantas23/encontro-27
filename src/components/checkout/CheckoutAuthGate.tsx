"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CTAButton } from "@/components/ui/CTAButton";

/**
 * Portão de conta do checkout.
 *
 * A compra exige sessão: o ingresso e o QR Code vivem em /minha-conta, e a RPC
 * meus_pedidos_encontro27 casa o pedido pelo e-mail autenticado. Comprar
 * deslogado (como era antes) deixava o pedido preso a um e-mail digitado que
 * podia nunca virar conta.
 *
 * Não há tela separada de "cadastrar": o acesso é por link no e-mail e
 * `shouldCreateUser: true` cria a conta na primeira vez. O link volta para
 * ESTE checkout (mesmo lote), então a pessoa retoma a compra onde parou.
 */
export function CheckoutAuthGate({ children }: { children: (email: string) => React.ReactNode }) {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [digitado, setDigitado] = useState("");
  const [status, setStatus] = useState<"idle" | "enviando" | "enviado" | "erro">("idle");

  useEffect(() => {
    let active = true;

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      setEmail(user?.email ?? null);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("enviando");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: digitado,
      options: {
        shouldCreateUser: true,
        // Volta para a mesma URL de checkout, com o lote na query.
        emailRedirectTo: window.location.href,
      },
    });

    setStatus(error ? "erro" : "enviado");
  }

  if (email === undefined) return <p className="text-marrom-suave">Carregando…</p>;
  if (email) return <>{children(email)}</>;

  return (
    <div className="max-w-2xl">
      <p className="rotulo-secao text-ambar-texto">Antes de pagar</p>
      <span aria-hidden="true" className="filete mt-4" />

      <h1 className="font-display text-heading mt-5 text-3xl sm:text-4xl leading-[1.1]">
        Entre na sua conta
      </h1>
      <p className="mt-4 text-[17px] leading-7 text-marrom">
        O ingresso e o QR Code de entrada ficam na sua conta. Informe seu e-mail: se você já comprou
        antes, entramos na conta existente; se é a primeira vez, criamos a conta agora — sem senha.
      </p>

      {status === "enviado" ? (
        <p className="mt-8 rounded-card border border-dourado/50 bg-areia px-5 py-4 text-[17px] leading-7 text-marrom">
          Enviamos um link de acesso para <strong className="text-vinho">{digitado}</strong>. Abra seu
          e-mail e clique no link — você volta direto para esta compra.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <label>
            E-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={digitado}
              onChange={(event) => setDigitado(event.target.value)}
            />
          </label>

          {status === "erro" ? (
            <p role="alert" className="border-l-2 border-vermelho pl-4 text-marrom">
              Não foi possível enviar o link. Tente novamente.
            </p>
          ) : null}

          <CTAButton type="submit" disabled={status === "enviando"} className="mt-2">
            {status === "enviando" ? "Enviando…" : "Entrar ou criar conta"}
          </CTAButton>
        </form>
      )}
    </div>
  );
}
