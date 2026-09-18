"use client";

import { useMeusPedidos } from "@/hooks/useMeusPedidos";
import { formatCurrencyBRL } from "@/lib/utils";

export default function MinhasComprasPage() {
  const { pedidos, loading } = useMeusPedidos();

  if (loading) return null;

  return (
    <main id="conteudo" className="container-site py-10 sm:py-14">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-2xl text-heading">Minhas compras</h1>

        {!pedidos || pedidos.length === 0 ? (
          <p className="mt-6 text-[17px] leading-7 text-marrom">Nenhuma compra ainda.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-[15px]">
              <thead>
                <tr>
                  {["Data", "Modalidade", "Qtd.", "Valor", "Status"].map((coluna) => (
                    <th
                      key={coluna}
                      scope="col"
                      className="eyebrow whitespace-nowrap border-b border-border bg-areia px-3 py-3 text-center text-[0.65rem] text-marrom-suave first:rounded-l-lg last:rounded-r-lg"
                    >
                      {coluna}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="whitespace-nowrap border-b border-border px-3 py-3 text-marrom">
                      {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="border-b border-border px-3 py-3 text-marrom">{pedido.modalidade_nome}</td>
                    <td className="border-b border-border px-3 py-3 text-marrom">{pedido.quantidade}</td>
                    <td className="whitespace-nowrap border-b border-border px-3 py-3 text-marrom">
                      {formatCurrencyBRL(pedido.valor_total)}
                    </td>
                    <td className="border-b border-border px-3 py-3 text-marrom">{pedido.status_pagamento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
