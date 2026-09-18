"use client";

import { QRCodeSVG } from "qrcode.react";
import { useMeusPedidos } from "@/hooks/useMeusPedidos";
import { useMeusIngressos } from "@/hooks/useMeusIngressos";
import { OfertaAlmocoStart } from "@/components/conta/OfertaAlmocoStart";
import { TransferirTitularidade } from "@/components/conta/TransferirTitularidade";
import { TransferenciaPendenteIndicador } from "@/components/conta/TransferenciaPendenteIndicador";
import { TransferenciasRecebidas } from "@/components/conta/TransferenciasRecebidas";

export default function MeusIngressosPage() {
  const { pedidos, loading: carregandoPedidos } = useMeusPedidos();
  const { ingressos, loading: carregandoIngressos, refetch } = useMeusIngressos();

  if (carregandoPedidos || carregandoIngressos) return null;

  return (
    <main id="conteudo" className="container-site py-10 sm:py-14">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="font-display text-2xl text-heading">Meus ingressos</h1>

        {pedidos && pedidos.length > 0 ? <OfertaAlmocoStart pedidos={pedidos} /> : null}

        <TransferenciasRecebidas onRespondida={refetch} />

        {!ingressos || ingressos.length === 0 ? (
          <p className="mt-6 text-[17px] leading-7 text-marrom">Nenhum ingresso ainda.</p>
        ) : (
          <ul className="mt-6 flex flex-col gap-5">
            {ingressos.map((ingresso) => (
              <li
                key={ingresso.identificador_unico}
                className="rounded-card border border-border bg-areia px-5 py-5 text-left"
              >
                <h2 className="font-display text-2xl text-heading leading-snug text-center">{ingresso.nome}</h2>
                <p className="rotulo-secao mt-2 text-ambar-texto text-[0.8rem] text-center">
                  {ingresso.modalidade_nome}
                </p>

                <dl className="mt-5 divide-y divide-border border-y border-border text-[15px]">
                  <div className="flex flex-wrap justify-between gap-2 py-3">
                    <dt className="text-marrom-suave">Status do pedido</dt>
                    <dd className="text-marrom">{ingresso.status_pagamento}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 py-3">
                    <dt className="text-marrom-suave">Check-in</dt>
                    <dd className="text-marrom">{ingresso.check_in_status ? "feito" : "ainda não realizado"}</dd>
                  </div>
                </dl>

                {ingresso.status_pagamento === "aprovado" ? (
                  <div className="mt-6 flex flex-col items-center">
                    <div className="rounded-card bg-papel p-4">
                      <QRCodeSVG value={ingresso.identificador_unico} size={160} />
                    </div>
                    <code className="mt-3 text-sm tracking-wide text-marrom-suave">
                      {ingresso.identificador_unico}
                    </code>

                    {ingresso.check_in_status ? (
                      <p className="mt-5 text-center text-[13px] leading-5 text-marrom-suave">
                        Check-in já feito. A transferência de titularidade não está mais disponível.
                      </p>
                    ) : ingresso.transferencia_pendente ? (
                      <TransferenciaPendenteIndicador
                        transferenciaId={ingresso.transferencia_pendente.id}
                        paraEmail={ingresso.transferencia_pendente.para_email}
                        onCancelada={refetch}
                      />
                    ) : (
                      <TransferirTitularidade identificadorUnico={ingresso.identificador_unico} onTransferido={refetch} />
                    )}
                  </div>
                ) : (
                  <p className="mt-5 text-center text-[15px] leading-6 text-marrom-suave">
                    O ingresso é liberado assim que o pagamento for aprovado.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
