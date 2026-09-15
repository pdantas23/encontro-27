"use client";

import { MinhaContaNav } from "@/components/layout/MinhaContaNav";
import { useMeusPedidos } from "@/hooks/useMeusPedidos";

export default function MeusDadosPage() {
  const { email, pedidos, loading } = useMeusPedidos();

  if (loading) return null;

  const maisRecente = pedidos?.[0];

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <MinhaContaNav />
      <h1>Meus dados</h1>

      {!maisRecente ? (
        <p>Nenhum dado de compra encontrado.</p>
      ) : (
        <div style={{ border: "1px solid #ddd", padding: 16 }}>
          <p>Nome: {maisRecente.comprador_nome}</p>
          <p>E-mail: {email}</p>
          <p>WhatsApp: {maisRecente.comprador_whatsapp}</p>
        </div>
      )}

      <p style={{ marginTop: 16, color: "#666" }}>
        Edição de dados e transferência de titularidade ainda dependem de definições da organização (ver capítulo 16
        do levantamento de requisitos). Por enquanto, esta tela é somente consulta.
      </p>
    </main>
  );
}
