"use client";

import { MinhaContaNav } from "@/components/layout/MinhaContaNav";
import { useMeusPedidos } from "@/hooks/useMeusPedidos";
import { OfertaAlmocoStart } from "@/components/conta/OfertaAlmocoStart";

export default function MinhaContaPage() {
  const { email, pedidos, loading } = useMeusPedidos();

  if (loading) return null;

  const proximoPedido = pedidos?.find((p) => p.status_pagamento === "aprovado") ?? pedidos?.[0];

  return (
    <>
      <MinhaContaNav />

      <main id="conteudo" className="container-site py-10 sm:py-14">
        <div className="max-w-2xl">
          <h1 className="font-display text-2xl text-heading">Minha conta</h1>
          {email ? <p className="mt-1 text-[15px] text-marrom-suave">{email}</p> : null}

          {!pedidos || pedidos.length === 0 ? (
            <p className="mt-6 text-[17px] leading-7 text-marrom">
              Você ainda não tem nenhum pedido registrado com este e-mail.
            </p>
          ) : (
            <dl className="mt-6 divide-y divide-border rounded-card border border-border bg-areia px-5 text-[15px]">
              <div className="flex flex-wrap justify-between gap-2 py-3">
                <dt className="text-marrom-suave">Modalidade</dt>
                <dd className="text-marrom">{proximoPedido?.modalidade_nome}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2 py-3">
                <dt className="text-marrom-suave">Status do pagamento</dt>
                <dd className="text-marrom">{proximoPedido?.status_pagamento}</dd>
              </div>
              {proximoPedido?.status_pagamento === "aguardando_pagamento" && (
                <div className="py-3">
                  <p className="text-marrom">
                    Assim que o pagamento for confirmado, seu ingresso aparece em &quot;Meus ingressos&quot;.
                  </p>
                </div>
              )}
            </dl>
          )}

          {pedidos && pedidos.length > 0 ? <OfertaAlmocoStart pedidos={pedidos} /> : null}
        </div>
      </main>
    </>
  );
}
