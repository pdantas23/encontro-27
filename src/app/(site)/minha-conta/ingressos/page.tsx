"use client";

import { QRCodeSVG } from "qrcode.react";
import { MinhaContaNav } from "@/components/layout/MinhaContaNav";
import { useMeusPedidos } from "@/hooks/useMeusPedidos";

export default function MeusIngressosPage() {
  const { pedidos, loading } = useMeusPedidos();

  if (loading) return null;

  const ingressos = (pedidos ?? []).flatMap((pedido) =>
    pedido.participantes.map((participante) => ({ pedido, participante })),
  );

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <MinhaContaNav />
      <h1>Meus ingressos</h1>

      {ingressos.length === 0 ? (
        <p>Nenhum ingresso ainda.</p>
      ) : (
        ingressos.map(({ pedido, participante }) => (
          <div key={participante.identificador_unico} style={{ border: "1px solid #ddd", padding: 16, marginBottom: 12 }}>
            <p>Participante: {participante.nome}</p>
            <p>Modalidade: {pedido.modalidade_nome}</p>
            <p>Status do pedido: {pedido.status_pagamento}</p>
            <p>Check-in: {participante.check_in_status ? "feito" : "ainda não realizado"}</p>
            {pedido.status_pagamento === "aprovado" ? (
              <div>
                <QRCodeSVG value={participante.identificador_unico} size={160} />
                <p>
                  <code>{participante.identificador_unico}</code>
                </p>
              </div>
            ) : (
              <p>O ingresso é liberado assim que o pagamento for aprovado.</p>
            )}
          </div>
        ))
      )}
    </main>
  );
}
