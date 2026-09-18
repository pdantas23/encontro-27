"use client";

import { MinhaContaNav } from "@/components/layout/MinhaContaNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { useMeusPedidos } from "@/hooks/useMeusPedidos";

export default function MeusDadosPage() {
  const { email, pedidos, loading } = useMeusPedidos();

  if (loading) return null;

  const maisRecente = pedidos?.[0];

  return (
    <>
      <MinhaContaNav />
      <PageHeader title="Meus dados" />

      <main id="conteudo" className="container-site py-10 sm:py-14">
        <div className="max-w-2xl">
          {!maisRecente ? (
            <p className="text-[17px] leading-7 text-marrom">Nenhum dado de compra encontrado.</p>
          ) : (
            <dl className="divide-y divide-border rounded-card border border-border bg-areia px-5 text-[15px]">
              <div className="flex flex-wrap justify-between gap-2 py-3">
                <dt className="text-marrom-suave">Nome</dt>
                <dd className="text-marrom">{maisRecente.comprador_nome}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2 py-3">
                <dt className="text-marrom-suave">E-mail</dt>
                <dd className="text-marrom">{email}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2 py-3">
                <dt className="text-marrom-suave">WhatsApp</dt>
                <dd className="text-marrom">{maisRecente.comprador_whatsapp}</dd>
              </div>
            </dl>
          )}

          <p className="mt-8 text-[15px] leading-6 text-marrom-suave">
            Edição de dados e transferência de titularidade ainda dependem de definições da organização (ver
            capítulo 16 do levantamento de requisitos). Por enquanto, esta tela é somente consulta.
          </p>
        </div>
      </main>
    </>
  );
}
