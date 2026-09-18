"use client";

import { useRef, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { createClient } from "@/lib/supabase/client";

interface CheckinResultado {
  ok: boolean;
  motivo?: string;
  nome?: string;
}

const MOTIVO_MENSAGENS: Record<string, string> = {
  ingresso_nao_encontrado: "Ingresso não encontrado. Confira o código digitado.",
  pagamento_nao_aprovado: "O pagamento deste pedido ainda não foi aprovado.",
  check_in_duplicado: "Este participante já fez check-in anteriormente.",
};

export default function AdminCheckInPage() {
  const { user, loading: authLoading } = useAdminAuth({ permitirStaff: true });
  const [identificador, setIdentificador] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{ sucesso: boolean; mensagem: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const valor = identificador.trim();
    if (!valor) return;

    setLoading(true);
    setResultado(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("checkin_encontro27", { p_identificador: valor });
    setLoading(false);
    setIdentificador("");
    inputRef.current?.focus();

    if (error) {
      setResultado({ sucesso: false, mensagem: `Erro ao registrar check-in: ${error.message}` });
      return;
    }

    const resposta = data as unknown as CheckinResultado;
    if (resposta.ok) {
      setResultado({ sucesso: true, mensagem: `Check-in confirmado: ${resposta.nome ?? "participante"}.` });
    } else {
      setResultado({
        sucesso: false,
        mensagem: MOTIVO_MENSAGENS[resposta.motivo ?? ""] ?? "Não foi possível registrar o check-in.",
      });
    }
  }

  if (authLoading || !user) return null;

  return (
    <AdminLayout user={user}>
      <h1>Check-in</h1>
      <p style={{ color: "#666" }}>Cole ou digite o código do QR Code (identificador único do ingresso).</p>

      <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "flex", gap: 8, maxWidth: 480 }}>
        <input
          ref={inputRef}
          type="text"
          autoFocus
          value={identificador}
          onChange={(event) => setIdentificador(event.target.value)}
          placeholder="Identificador único do ingresso"
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={loading || !identificador.trim()}>
          {loading ? "Registrando..." : "Registrar check-in"}
        </button>
      </form>

      {resultado && (
        <p style={{ marginTop: 16, fontSize: 18, color: resultado.sucesso ? "green" : "crimson" }}>
          {resultado.mensagem}
        </p>
      )}
    </AdminLayout>
  );
}
