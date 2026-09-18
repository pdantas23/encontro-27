"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import type { Database, StatusPagamento } from "@/types/database";

type ParticipanteRow = Database["public"]["Tables"]["participantes_encontro27"]["Row"];

// Select aninhado não é tipado automaticamente pelo supabase-js (ver nota em
// admin/pedidos/page.tsx) — tipamos manualmente e convertemos com `as unknown as`.
type ParticipanteComPedido = ParticipanteRow & {
  pedidos_encontro27: {
    comprador_email: string;
    status_pagamento: StatusPagamento;
    lotes_encontro27: { modalidades_encontro27: { nome: string } | null } | null;
  } | null;
};

// ⚠️ TEMPORÁRIO — ver aviso em src/hooks/useAdminAuth.ts / PENDENCIAS-PREVIEW.md.
const PREVIEW_FAKE = true;
const PARTICIPANTES_FAKE: ParticipanteComPedido[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    pedido_id: "00000000-0000-0000-0000-000000000001",
    nome: "Maria da Silva",
    email: "maria@example.com",
    identificador_unico: "11111111-2222-3333-4444-555555555555",
    check_in_status: true,
    check_in_em: new Date().toISOString(),
    check_in_por: null,
    created_at: new Date().toISOString(),
    pedidos_encontro27: {
      comprador_email: "maria@example.com",
      status_pagamento: "aprovado",
      lotes_encontro27: { modalidades_encontro27: { nome: "VIP" } },
    },
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    pedido_id: "00000000-0000-0000-0000-000000000002",
    nome: "João Pereira",
    email: "joao@example.com",
    identificador_unico: "22222222-3333-4444-5555-666666666666",
    check_in_status: false,
    check_in_em: null,
    check_in_por: null,
    created_at: new Date().toISOString(),
    pedidos_encontro27: {
      comprador_email: "joao@example.com",
      status_pagamento: "aguardando_pagamento",
      lotes_encontro27: { modalidades_encontro27: { nome: "Start" } },
    },
  },
];

export default function AdminParticipantesPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [participantes, setParticipantes] = useState<ParticipanteComPedido[] | null>(
    PREVIEW_FAKE ? PARTICIPANTES_FAKE : null,
  );
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (PREVIEW_FAKE) return;
    if (!user) return;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("participantes_encontro27")
        .select(
          "*, pedidos_encontro27(comprador_email, status_pagamento, lotes_encontro27(modalidades_encontro27(nome)))"
        )
        .order("nome", { ascending: true });
      setParticipantes((data ?? []) as unknown as ParticipanteComPedido[]);
    }

    load();
  }, [user]);

  const filtrados = useMemo(() => {
    if (!participantes) return [];
    const termo = busca.trim().toLowerCase();
    if (!termo) return participantes;
    return participantes.filter((participante) => {
      const email = participante.pedidos_encontro27?.comprador_email ?? "";
      return (
        participante.nome.toLowerCase().includes(termo) ||
        (participante.email ?? "").toLowerCase().includes(termo) ||
        email.toLowerCase().includes(termo)
      );
    });
  }, [participantes, busca]);

  if (authLoading || !user) return null;

  return (
    <AdminLayout user={user}>
      <h1>Participantes</h1>

      <label style={{ display: "block", marginTop: 16 }}>
        Buscar por nome ou e-mail
        <input
          type="text"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Digite para filtrar..."
          style={{ display: "block", marginTop: 4, width: 320 }}
        />
      </label>

      {!participantes ? (
        <p style={{ marginTop: 16 }}>Carregando...</p>
      ) : (
        <>
          <p style={{ marginTop: 16, color: "#666" }}>
            {filtrados.length} de {participantes.length} participante(s)
          </p>
          <table style={{ marginTop: 8, borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={thStyle}>Nome</th>
                <th style={thStyle}>E-mail do pedido</th>
                <th style={thStyle}>Modalidade</th>
                <th style={thStyle}>Status do pedido</th>
                <th style={thStyle}>Check-in</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((participante) => (
                <tr key={participante.id}>
                  <td style={tdStyle}>{participante.nome}</td>
                  <td style={tdStyle}>{participante.pedidos_encontro27?.comprador_email ?? "-"}</td>
                  <td style={tdStyle}>
                    {participante.pedidos_encontro27?.lotes_encontro27?.modalidades_encontro27?.nome ?? "-"}
                  </td>
                  <td style={tdStyle}>{participante.pedidos_encontro27?.status_pagamento ?? "-"}</td>
                  <td style={tdStyle}>
                    {participante.check_in_status
                      ? `Sim${participante.check_in_em ? ` (${new Date(participante.check_in_em).toLocaleString("pt-BR")})` : ""}`
                      : "Não"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </AdminLayout>
  );
}

const thStyle: React.CSSProperties = { textAlign: "left", padding: "4px 8px", borderBottom: "1px solid #ddd" };
const tdStyle: React.CSSProperties = { padding: "4px 8px", borderBottom: "1px solid #eee" };
