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
      <h1>Dashboard</h1>
      {!data ? (
        <p>Carregando...</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 16 }}>
            <Stat label="Pedidos" value={data.totalPedidos} />
            <Stat label="Aguardando pagamento" value={data.aguardando} />
            <Stat label="Aprovados" value={data.aprovados} />
            <Stat label="Recusados" value={data.recusados} />
            <Stat label="Receita aprovada" value={formatCurrencyBRL(data.receitaAprovada)} />
          </div>

          <h2 style={{ marginTop: 32 }}>Vendas por modalidade</h2>
          <table style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", paddingRight: 24 }}>Modalidade</th>
                <th style={{ textAlign: "left" }}>Quantidade aprovada</th>
              </tr>
            </thead>
            <tbody>
              {data.vendasPorModalidade.map((row) => (
                <tr key={row.modalidade}>
                  <td style={{ paddingRight: 24 }}>{row.modalidade}</td>
                  <td>{row.quantidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </AdminLayout>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 16, minWidth: 160 }}>
      <p style={{ fontSize: 12, color: "#666" }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 700 }}>{value}</p>
    </div>
  );
}
