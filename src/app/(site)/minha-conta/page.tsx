"use client";

import { MinhaContaNav } from "@/components/layout/MinhaContaNav";
import { useMeusPedidos } from "@/hooks/useMeusPedidos";
import { OfertaAlmocoStart } from "@/components/conta/OfertaAlmocoStart";

export default function MinhaContaPage() {
  const { email, pedidos, loading } = useMeusPedidos();

  if (loading) return null;

  const proximoPedido = pedidos?.find((p) => p.status_pagamento === "aprovado") ?? pedidos?.[0];

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <MinhaContaNav />
      <h1>Minha conta</h1>
      <p>{email}</p>

      {!pedidos || pedidos.length === 0 ? (
        <p>Você ainda não tem nenhum pedido registrado com este e-mail.</p>
      ) : (
        <div style={{ border: "1px solid #ddd", padding: 16, marginTop: 16 }}>
          <p>Modalidade: {proximoPedido?.modalidade_nome}</p>
          <p>Status do pagamento: {proximoPedido?.status_pagamento}</p>
          {proximoPedido?.status_pagamento === "aguardando_pagamento" && (
            <p>Assim que o pagamento for confirmado, seu ingresso aparece em &quot;Meus ingressos&quot;.</p>
          )}
        </div>
      )}

      {pedidos && pedidos.length > 0 ? <OfertaAlmocoStart pedidos={pedidos} /> : null}
    </main>
  );
}
