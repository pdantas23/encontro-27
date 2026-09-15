"use client";

import { Fragment, useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { formatCurrencyBRL } from "@/lib/utils";
import type { Database, StatusPagamento } from "@/types/database";

type PedidoRow = Database["public"]["Tables"]["pedidos_encontro27"]["Row"];
type ParticipanteRow = Database["public"]["Tables"]["participantes_encontro27"]["Row"];

// O select aninhado do supabase-js não é tipado automaticamente (Relationships
// vazio em src/types/database.ts), então tipamos manualmente o formato esperado
// e convertemos com `as unknown as` — mesma ideia do @ts-expect-error usado em
// dashboard/page.tsx, só que aplicado uma vez por fetch em vez de por acesso.
type PedidoComLote = PedidoRow & {
  lotes_encontro27: {
    nome: string;
    modalidades_encontro27: { nome: string } | null;
  } | null;
};

const STATUS_OPTIONS: { value: StatusPagamento | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "aguardando_pagamento", label: "Aguardando pagamento" },
  { value: "aprovado", label: "Aprovado" },
  { value: "recusado", label: "Recusado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "reembolsado", label: "Reembolsado" },
];

export default function AdminPedidosPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [pedidos, setPedidos] = useState<PedidoComLote[] | null>(null);
  const [filtro, setFiltro] = useState<StatusPagamento | "todos">("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [participantesPorPedido, setParticipantesPorPedido] = useState<Record<string, ParticipanteRow[]>>({});
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const supabase = createClient();
      let query = supabase
        .from("pedidos_encontro27")
        .select("*, lotes_encontro27(nome, modalidades_encontro27(nome))")
        .order("created_at", { ascending: false });

      if (filtro !== "todos") {
        query = query.eq("status_pagamento", filtro);
      }

      const { data } = await query;
      setPedidos((data ?? []) as unknown as PedidoComLote[]);
    }

    load();
  }, [user, filtro, refreshKey]);

  async function toggleExpand(pedidoId: string) {
    if (expandedId === pedidoId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(pedidoId);
    if (!participantesPorPedido[pedidoId]) {
      const supabase = createClient();
      const { data } = await supabase
        .from("participantes_encontro27")
        .select("*")
        .eq("pedido_id", pedidoId)
        .order("nome", { ascending: true });
      setParticipantesPorPedido((prev) => ({ ...prev, [pedidoId]: data ?? [] }));
    }
  }

  async function handleAprovar(pedido: PedidoComLote) {
    if (!user) return;
    setActionLoadingId(pedido.id);
    setFeedback(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("pedidos_encontro27")
      .update({
        status_pagamento: "aprovado",
        confirmado_por: user.userId,
        confirmado_em: new Date().toISOString(),
      })
      .eq("id", pedido.id);
    setActionLoadingId(null);
    if (error) {
      setFeedback(`Erro ao aprovar pedido: ${error.message}`);
      return;
    }
    setFeedback("Pagamento confirmado como aprovado.");
    setRefreshKey((key) => key + 1);
  }

  async function handleRecusar(pedido: PedidoComLote) {
    setActionLoadingId(pedido.id);
    setFeedback(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("pedidos_encontro27")
      .update({ status_pagamento: "recusado" })
      .eq("id", pedido.id);
    setActionLoadingId(null);
    if (error) {
      setFeedback(`Erro ao recusar pedido: ${error.message}`);
      return;
    }
    setFeedback("Pedido marcado como recusado.");
    setRefreshKey((key) => key + 1);
  }

  if (authLoading || !user) return null;

  return (
    <AdminLayout user={user}>
      <h1>Pedidos</h1>

      <label style={{ display: "block", marginTop: 16 }}>
        Filtrar por status
        <select
          value={filtro}
          onChange={(event) => setFiltro(event.target.value as StatusPagamento | "todos")}
          style={{ display: "block", marginTop: 4 }}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {feedback && <p style={{ marginTop: 12 }}>{feedback}</p>}

      {!pedidos ? (
        <p style={{ marginTop: 16 }}>Carregando...</p>
      ) : pedidos.length === 0 ? (
        <p style={{ marginTop: 16 }}>Nenhum pedido encontrado.</p>
      ) : (
        <table style={{ marginTop: 16, borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={thStyle}>Data</th>
              <th style={thStyle}>Comprador</th>
              <th style={thStyle}>Modalidade / Lote</th>
              <th style={thStyle}>Qtd.</th>
              <th style={thStyle}>Valor total</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <Fragment key={pedido.id}>
                <tr>
                  <td style={tdStyle}>{new Date(pedido.created_at).toLocaleString("pt-BR")}</td>
                  <td style={tdStyle}>
                    {pedido.comprador_nome}
                    <br />
                    <span style={{ fontSize: 12, color: "#666" }}>{pedido.comprador_email}</span>
                  </td>
                  <td style={tdStyle}>
                    {pedido.lotes_encontro27?.modalidades_encontro27?.nome ?? "-"}
                    {" / "}
                    {pedido.lotes_encontro27?.nome ?? "-"}
                  </td>
                  <td style={tdStyle}>{pedido.quantidade}</td>
                  <td style={tdStyle}>{formatCurrencyBRL(Number(pedido.valor_total))}</td>
                  <td style={tdStyle}>
                    {pedido.status_pagamento}
                    {pedido.tem_problema_estoque && (
                      <span style={{ color: "crimson", display: "block", fontSize: 12 }}>⚠ lote sem vaga</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => toggleExpand(pedido.id)}>
                      {expandedId === pedido.id ? "Fechar" : "Detalhes"}
                    </button>
                  </td>
                </tr>
                {expandedId === pedido.id && (
                  <tr key={`${pedido.id}-detalhe`}>
                    <td colSpan={7} style={{ ...tdStyle, background: "#fafafa" }}>
                      <p>
                        <strong>WhatsApp:</strong> {pedido.comprador_whatsapp}
                      </p>
                      <p>
                        <strong>Valor unitário registrado:</strong>{" "}
                        {formatCurrencyBRL(Number(pedido.valor_unitario_registrado))}
                      </p>
                      <p>
                        <strong>Confirmado por:</strong> {pedido.confirmado_por ?? "-"}{" "}
                        {pedido.confirmado_em ? `em ${new Date(pedido.confirmado_em).toLocaleString("pt-BR")}` : ""}
                      </p>

                      <p style={{ marginTop: 8 }}>
                        <strong>Participantes</strong>
                      </p>
                      {!participantesPorPedido[pedido.id] ? (
                        <p>Carregando participantes...</p>
                      ) : participantesPorPedido[pedido.id].length === 0 ? (
                        <p>Nenhum participante cadastrado neste pedido.</p>
                      ) : (
                        <ul>
                          {participantesPorPedido[pedido.id].map((participante) => (
                            <li key={participante.id}>
                              {participante.nome} {participante.email ? `(${participante.email})` : ""} —{" "}
                              {participante.check_in_status ? "check-in feito" : "sem check-in"}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button
                          onClick={() => handleAprovar(pedido)}
                          disabled={actionLoadingId === pedido.id || pedido.status_pagamento === "aprovado"}
                        >
                          Confirmar pagamento aprovado
                        </button>
                        <button
                          onClick={() => handleRecusar(pedido)}
                          disabled={actionLoadingId === pedido.id || pedido.status_pagamento === "recusado"}
                        >
                          Marcar recusado
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}

const thStyle: React.CSSProperties = { textAlign: "left", padding: "4px 8px", borderBottom: "1px solid #ddd" };
const tdStyle: React.CSSProperties = { padding: "4px 8px", borderBottom: "1px solid #eee", verticalAlign: "top" };
