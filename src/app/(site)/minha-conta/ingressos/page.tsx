"use client";

import { QRCodeSVG } from "qrcode.react";
import { MinhaContaNav } from "@/components/layout/MinhaContaNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { useMeusPedidos } from "@/hooks/useMeusPedidos";

export default function MeusIngressosPage() {
  const { pedidos, loading } = useMeusPedidos();

  if (loading) return null;

  const ingressos = (pedidos ?? []).flatMap((pedido) =>
    pedido.participantes.map((participante) => ({ pedido, participante })),
  );

  return (
    <>
      <MinhaContaNav />
      <PageHeader title="Meus ingressos" />

      <main id="conteudo" className="container-site py-10 sm:py-14">
        <div className="max-w-2xl">
          {ingressos.length === 0 ? (
            <p className="text-[17px] leading-7 text-marrom">Nenhum ingresso ainda.</p>
          ) : (
            <ul className="flex flex-col gap-5">
              {ingressos.map(({ pedido, participante }) => (
                <li
                  key={participante.identificador_unico}
                  className="rounded-card border border-border bg-areia px-5 py-5"
                >
                  <h2 className="font-display text-2xl text-heading leading-snug">{participante.nome}</h2>
                  <p className="rotulo-secao mt-2 text-ambar-texto text-[0.8rem]">{pedido.modalidade_nome}</p>

                  <dl className="mt-5 divide-y divide-border border-y border-border text-[15px]">
                    <div className="flex flex-wrap justify-between gap-2 py-3">
                      <dt className="text-marrom-suave">Status do pedido</dt>
                      <dd className="text-marrom">{pedido.status_pagamento}</dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 py-3">
                      <dt className="text-marrom-suave">Check-in</dt>
                      <dd className="text-marrom">
                        {participante.check_in_status ? "feito" : "ainda não realizado"}
                      </dd>
                    </div>
                  </dl>

                  {pedido.status_pagamento === "aprovado" ? (
                    <div className="mt-6 flex flex-col items-center">
                      <div className="rounded-card bg-papel p-4">
                        <QRCodeSVG value={participante.identificador_unico} size={160} />
                      </div>
                      <code className="mt-3 text-sm tracking-wide text-marrom-suave">
                        {participante.identificador_unico}
                      </code>
                    </div>
                  ) : (
                    <p className="mt-5 text-[15px] leading-6 text-marrom-suave">
                      O ingresso é liberado assim que o pagamento for aprovado.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
