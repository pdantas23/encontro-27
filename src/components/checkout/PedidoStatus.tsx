"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CTAButton } from "@/components/ui/CTAButton";
import { createClient } from "@/lib/supabase/client";
import { formatCurrencyBRL } from "@/lib/utils";
import type { PedidoResumo } from "@/types/checkout";

/**
 * Usada pelas 3 rotas de resultado (/checkout/pendente, /sucesso, /erro).
 * O status real é sempre buscado ao vivo pela RPC obter_pedido_encontro27 —
 * a rota pela qual o comprador chegou aqui não decide a mensagem, o status
 * atual decide.
 *
 * Enquanto o pedido estiver aguardando, refaz a consulta de poucos em
 * poucos segundos: o webhook da Hypercash costuma aprovar logo depois do
 * pagamento, e sem isso o comprador ficaria olhando "aguardando" numa tela
 * que já está desatualizada. Desiste depois de POLL_LIMITE tentativas para
 * não consultar para sempre numa aba esquecida aberta.
 */
const POLL_INTERVALO_MS = 4000;
const POLL_LIMITE = 20; // ~80 segundos
export function PedidoStatus() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedido");
  const email = searchParams.get("email");

  const [pedido, setPedido] = useState<PedidoResumo | null | undefined>(undefined);

  useEffect(() => {
    if (!pedidoId || !email) return;
    const id = pedidoId;
    const emailNarrowed = email;

    let tentativas = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let ativo = true;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase.rpc("obter_pedido_encontro27", {
        p_pedido_id: id,
        p_email: emailNarrowed,
      });
      if (!ativo) return;

      const atual = (data as unknown as PedidoResumo | null) ?? null;
      setPedido(atual);

      tentativas += 1;
      if (atual?.status_pagamento === "aguardando_pagamento" && tentativas < POLL_LIMITE) {
        timer = setTimeout(load, POLL_INTERVALO_MS);
      }
    }

    load();
    return () => {
      ativo = false;
      if (timer) clearTimeout(timer);
    };
  }, [pedidoId, email]);

  const naoEncontrado = (
    <div className="max-w-2xl">
      <h2 className="font-display text-2xl sm:text-3xl text-heading">Pedido não encontrado</h2>
      <p className="mt-4 text-[17px] leading-7 text-marrom">
        Confira o link enviado por e-mail, ou acesse pela sua área do participante.
      </p>
      <Link
        href="/login"
        className="mt-5 inline-flex min-h-11 items-center text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro"
      >
        Ir para minha conta
      </Link>
    </div>
  );

  if (!pedidoId || !email) return naoEncontrado;
  if (pedido === undefined) return <p className="text-marrom-suave">Carregando…</p>;
  if (pedido === null) return naoEncontrado;

  return (
    <div className="max-w-2xl">
      {pedido.status_pagamento === "aprovado" && (
        <>
          <h2 className="font-display text-2xl sm:text-3xl text-heading leading-snug">Pagamento aprovado</h2>
          <p className="mt-4 text-[17px] leading-7 text-marrom">
            Obrigado, {pedido.comprador_nome}! Seu ingresso para <strong>{pedido.modalidade_nome}</strong> já está
            confirmado.
          </p>
        </>
      )}

      {pedido.status_pagamento === "aguardando_pagamento" && (
        <>
          <h2 className="font-display text-2xl sm:text-3xl text-heading leading-snug">Pagamento aguardando confirmação</h2>
          <p className="mt-4 text-[17px] leading-7 text-marrom">
            Seu pedido foi registrado. Finalize o pagamento na Hypercash — assim que for aprovado, seu ingresso é
            liberado aqui e você recebe a confirmação.
          </p>
          {pedido.hypercash_url_usado && (
            <CTAButton href={pedido.hypercash_url_usado} size="lg" className="mt-6">
              Ir para o pagamento na Hypercash
            </CTAButton>
          )}
        </>
      )}

      {(pedido.status_pagamento === "recusado" || pedido.status_pagamento === "cancelado") && (
        <>
          <h2 className="font-display text-2xl sm:text-3xl text-heading leading-snug">Pagamento não concluído</h2>
          <p className="mt-4 text-[17px] leading-7 text-marrom">Não conseguimos confirmar o pagamento deste pedido.</p>
          {pedido.hypercash_url_usado && (
            <CTAButton href={pedido.hypercash_url_usado} size="lg" className="mt-6">
              Tentar novamente
            </CTAButton>
          )}
        </>
      )}

      {pedido.status_pagamento === "reembolsado" && (
        <>
          <h2 className="font-display text-2xl sm:text-3xl text-heading leading-snug">Pedido reembolsado</h2>
        </>
      )}

      <h3 className="rotulo-secao mt-12 text-ambar-texto">Resumo do pedido</h3>
      <span aria-hidden="true" className="filete mt-4" />

      <dl className="mt-6 divide-y divide-border border-y border-border text-[15px]">
        <div className="flex flex-wrap justify-between gap-2 py-3">
          <dt className="text-marrom-suave">Modalidade</dt>
          <dd className="text-marrom">{pedido.modalidade_nome}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2 py-3">
          <dt className="text-marrom-suave">Lote</dt>
          <dd className="text-marrom">{pedido.lote_nome}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2 py-3">
          <dt className="text-marrom-suave">Quantidade</dt>
          <dd className="text-marrom">{pedido.quantidade}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2 py-3">
          <dt className="text-marrom-suave">Valor total</dt>
          <dd className="font-display text-lg text-vinho">{formatCurrencyBRL(pedido.valor_total)}</dd>
        </div>
      </dl>

      {pedido.participantes.length > 0 && (
        <>
          <h3 className="rotulo-secao mt-10 text-ambar-texto">Participantes</h3>
          <span aria-hidden="true" className="filete mt-4" />
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {pedido.participantes.map((p) => (
              <li key={p.identificador_unico} className="py-3 text-marrom">
                {p.nome} — ingresso {p.identificador_unico}
                {p.check_in_status ? " (check-in feito)" : ""}
              </li>
            ))}
          </ul>
        </>
      )}

      <Link
        href="/login"
        className="mt-10 inline-flex min-h-11 items-center text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro"
      >
        Acessar minha conta
      </Link>
    </div>
  );
}
