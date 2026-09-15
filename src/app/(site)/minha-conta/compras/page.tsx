"use client";

import { MinhaContaNav } from "@/components/layout/MinhaContaNav";
import { useMeusPedidos } from "@/hooks/useMeusPedidos";
import { formatCurrencyBRL } from "@/lib/utils";

export default function MinhasComprasPage() {
  const { pedidos, loading } = useMeusPedidos();

  if (loading) return null;

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <MinhaContaNav />
      <h1>Minhas compras</h1>

      {!pedidos || pedidos.length === 0 ? (
        <p>Nenhuma compra ainda.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Data</th>
              <th style={{ textAlign: "left" }}>Modalidade</th>
              <th style={{ textAlign: "left" }}>Qtd.</th>
              <th style={{ textAlign: "left" }}>Valor</th>
              <th style={{ textAlign: "left" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{new Date(pedido.created_at).toLocaleDateString("pt-BR")}</td>
                <td>{pedido.modalidade_nome}</td>
                <td>{pedido.quantidade}</td>
                <td>{formatCurrencyBRL(pedido.valor_total)}</td>
                <td>{pedido.status_pagamento}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
