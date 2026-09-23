"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { formatCurrencyBRL } from "@/lib/utils";

interface DashboardData {
  aguardando: number;
  aprovados: number;
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
        aguardando,
        aprovados,
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
      <p className="text-xs font-semibold tracking-[0.14em] text-ambar-texto uppercase">Visão geral</p>
      <h1>Dashboard</h1>
      {!data ? (
        <ul aria-hidden="true" className="mt-6 grid gap-4 sm:grid-cols-3 animate-pulse">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="h-28 rounded-card bg-areia" />
          ))}
        </ul>
      ) : (
        <>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat label="Aprovados" value={data.aprovados} tone="ok" />
            <Stat label="Aguardando pagamento" value={data.aguardando} tone="pendente" />
            <Stat label="Receita aprovada" value={formatCurrencyBRL(data.receitaAprovada)} />
          </ul>

          <h2>Vendas por modalidade</h2>
          {data.vendasPorModalidade.length === 0 ? (
            <p className="text-marrom-suave">Nenhuma venda aprovada ainda.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={thStyle}>Modalidade</th>
                  <th style={thStyle}>Quantidade aprovada</th>
                </tr>
              </thead>
              <tbody>
                {data.vendasPorModalidade.map((row) => (
                  <tr key={row.modalidade}>
                    <td style={tdStyle}>{row.modalidade}</td>
                    <td style={tdNumeroStyle}>{row.quantidade}</td>
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

// Rótulo (texto) e valor (número) de cada estatística usam fontes diferentes
// e consistentes entre si: eyebrow (sans, caixa alta) pro texto, sans em
// negrito com tabular-nums pro número — nunca misturados. min-h no rótulo
// garante que ele ocupe sempre a mesma altura (mesmo quando quebra linha),
// pra os números ficarem alinhados entre os cards, não só dentro de cada um.
function Stat({ label, value, tone = "neutro" }: { label: string; value: string | number; tone?: keyof typeof TONES }) {
  return (
    <li className="min-w-0 overflow-hidden rounded-card border border-border bg-papel p-5 shadow-card">
      <p className="min-h-9 text-[0.65rem] font-semibold tracking-[0.14em] text-marrom-suave uppercase">{label}</p>
      <p className={`mt-1 truncate text-3xl leading-none font-bold tabular-nums ${TONES[tone]}`}>{value}</p>
    </li>
  );
}

const thStyle: React.CSSProperties = { textAlign: "center" };
const tdStyle: React.CSSProperties = { textAlign: "center" };
const tdNumeroStyle: React.CSSProperties = {
  textAlign: "center",
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
};
