"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { formatCurrencyBRL } from "@/lib/utils";

interface DashboardData {
  totalPedidos: number;
  aguardando: number;
  aprovados: number;
  recusados: number;
  receitaAprovada: number;
  vendasPorModalidade: { modalidade: string; quantidade: number }[];
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const supabase = createClient();
      const { data: pedidos } = await supabase
        .from("pedidos_encontro27")
        .select("status_pagamento, quantidade, valor_total, lote_id, lotes_encontro27(modalidade_id, modalidades_encontro27(nome))");

      const rows = pedidos ?? [];
      const aguardando = rows.filter((p) => p.status_pagamento === "aguardando_pagamento").length;
      const aprovados = rows.filter((p) => p.status_pagamento === "aprovado").length;
      const recusados = rows.filter((p) => p.status_pagamento === "recusado").length;
      const receitaAprovada = rows
        .filter((p) => p.status_pagamento === "aprovado")
        .reduce((sum, p) => sum + Number(p.valor_total ?? 0), 0);

      const vendasPorModalidadeMap = new Map<string, number>();
      for (const p of rows) {
        if (p.status_pagamento !== "aprovado") continue;
        // @ts-expect-error -- nested select do supabase-js não tipa relações automaticamente aqui
        const nome: string | undefined = p.lotes_encontro27?.modalidades_encontro27?.nome;
        if (!nome) continue;
        vendasPorModalidadeMap.set(nome, (vendasPorModalidadeMap.get(nome) ?? 0) + p.quantidade);
      }

      setData({
        totalPedidos: rows.length,
        aguardando,
        aprovados,
        recusados,
        receitaAprovada,
        vendasPorModalidade: Array.from(vendasPorModalidadeMap.entries()).map(([modalidade, quantidade]) => ({
          modalidade,
          quantidade,
        })),
      });
    }

    load();
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <AdminLayout user={user}>
      <p className="eyebrow text-ambar-texto">Visão geral</p>
      <h1>Dashboard</h1>
      {!data ? (
        <ul aria-hidden="true" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5 animate-pulse">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="h-24 rounded-card bg-areia" />
          ))}
        </ul>
      ) : (
        <>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Stat label="Pedidos" value={data.totalPedidos} />
            <Stat label="Aguardando pagamento" value={data.aguardando} tone="pendente" />
            <Stat label="Aprovados" value={data.aprovados} tone="ok" />
            <Stat label="Recusados" value={data.recusados} tone="erro" />
            <Stat label="Receita aprovada" value={formatCurrencyBRL(data.receitaAprovada)} />
          </ul>

          <h2>Vendas por modalidade</h2>
          {data.vendasPorModalidade.length === 0 ? (
            <p className="text-marrom-suave">Nenhuma venda aprovada ainda.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Modalidade</th>
                  <th>Quantidade aprovada</th>
                </tr>
              </thead>
              <tbody>
                {data.vendasPorModalidade.map((row) => (
                  <tr key={row.modalidade}>
                    <td>{row.modalidade}</td>
                    <td>{row.quantidade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </AdminLayout>
  );
}

const TONES = {
  neutro: "text-vinho",
  pendente: "text-ambar-texto",
  ok: "text-verde",
  erro: "text-vermelho",
} as const;

function Stat({ label, value, tone = "neutro" }: { label: string; value: string | number; tone?: keyof typeof TONES }) {
  return (
    <li className="rounded-card border border-border bg-papel p-5 shadow-card">
      <p className="eyebrow text-[0.65rem] text-marrom-suave">{label}</p>
      <p className={`mt-2 font-display text-3xl leading-none ${TONES[tone]}`}>{value}</p>
    </li>
  );
}
