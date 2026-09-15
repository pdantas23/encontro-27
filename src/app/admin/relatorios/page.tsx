"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { formatCurrencyBRL } from "@/lib/utils";
import type { StatusPagamento } from "@/types/database";

const STATUS_LIST: StatusPagamento[] = [
  "aguardando_pagamento",
  "aprovado",
  "recusado",
  "cancelado",
  "reembolsado",
];

interface RelatorioData {
  porStatus: Record<StatusPagamento, number>;
  receitaAprovada: number;
  vendasPorModalidade: { modalidade: string; quantidade: number; receita: number }[];
  totalParticipantesAprovados: number;
  totalCheckins: number;
}

export default function AdminRelatoriosPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [data, setData] = useState<RelatorioData | null>(null);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const supabase = createClient();

      const { data: pedidos } = await supabase
        .from("pedidos_encontro27")
        .select("status_pagamento, quantidade, valor_total, lotes_encontro27(modalidades_encontro27(nome))");

      const rows = pedidos ?? [];

      const porStatus = STATUS_LIST.reduce(
        (acc, status) => {
          acc[status] = rows.filter((p) => p.status_pagamento === status).length;
          return acc;
        },
        {} as Record<StatusPagamento, number>
      );

      const aprovados = rows.filter((p) => p.status_pagamento === "aprovado");
      const receitaAprovada = aprovados.reduce((sum, p) => sum + Number(p.valor_total ?? 0), 0);

      const vendasPorModalidadeMap = new Map<string, { quantidade: number; receita: number }>();
      for (const p of aprovados) {
        // @ts-expect-error -- nested select do supabase-js não tipa relações automaticamente aqui
        const nome: string | undefined = p.lotes_encontro27?.modalidades_encontro27?.nome;
        if (!nome) continue;
        const atual = vendasPorModalidadeMap.get(nome) ?? { quantidade: 0, receita: 0 };
        atual.quantidade += p.quantidade;
        atual.receita += Number(p.valor_total ?? 0);
        vendasPorModalidadeMap.set(nome, atual);
      }

      const { data: participantes } = await supabase
        .from("participantes_encontro27")
        .select("check_in_status, pedidos_encontro27(status_pagamento)");

      const participantesAprovados = (participantes ?? []).filter(
        // @ts-expect-error -- nested select do supabase-js não tipa relações automaticamente aqui
        (p) => p.pedidos_encontro27?.status_pagamento === "aprovado"
      );
      const totalCheckins = participantesAprovados.filter((p) => p.check_in_status).length;

      setData({
        porStatus,
        receitaAprovada,
        vendasPorModalidade: Array.from(vendasPorModalidadeMap.entries()).map(([modalidade, valores]) => ({
          modalidade,
          ...valores,
        })),
        totalParticipantesAprovados: participantesAprovados.length,
        totalCheckins,
      });
    }

    load();
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <AdminLayout user={user}>
      <h1>Relatórios</h1>

      {!data ? (
        <p style={{ marginTop: 16 }}>Carregando...</p>
      ) : (
        <>
          <h2 style={{ marginTop: 24 }}>Pedidos por status</h2>
          <table style={{ marginTop: 8, borderCollapse: "collapse" }}>
            <tbody>
              {STATUS_LIST.map((status) => (
                <tr key={status}>
                  <td style={tdStyle}>{status}</td>
                  <td style={tdStyle}>{data.porStatus[status]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ marginTop: 24 }}>Receita</h2>
          <p>Receita total (pedidos aprovados): {formatCurrencyBRL(data.receitaAprovada)}</p>

          <h2 style={{ marginTop: 24 }}>Vendas por modalidade (aprovados)</h2>
          <table style={{ marginTop: 8, borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={thStyle}>Modalidade</th>
                <th style={thStyle}>Quantidade</th>
                <th style={thStyle}>Receita</th>
              </tr>
            </thead>
            <tbody>
              {data.vendasPorModalidade.map((row) => (
                <tr key={row.modalidade}>
                  <td style={tdStyle}>{row.modalidade}</td>
                  <td style={tdStyle}>{row.quantidade}</td>
                  <td style={tdStyle}>{formatCurrencyBRL(row.receita)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ marginTop: 24 }}>Check-in</h2>
          <p>
            {data.totalCheckins} de {data.totalParticipantesAprovados} participante(s) com pedido aprovado já fizeram
            check-in.
          </p>
        </>
      )}
    </AdminLayout>
  );
}

const thStyle: React.CSSProperties = { textAlign: "left", padding: "4px 8px", borderBottom: "1px solid #ddd" };
const tdStyle: React.CSSProperties = { padding: "4px 8px", borderBottom: "1px solid #eee" };
