"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatCurrencyBRL } from "@/lib/utils";
import type { PedidoResumo } from "@/types/checkout";

/**
 * Usada pelas 3 rotas de resultado (/checkout/pendente, /sucesso, /erro).
 * Como a Hypercash não tem webhook/retorno automático ainda, o status real
 * é sempre buscado ao vivo pela RPC obter_pedido_encontro27 — a rota pela
 * qual o comprador chegou aqui não decide a mensagem, o status atual decide.
 */
export function PedidoStatus() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedido");
  const email = searchParams.get("email");

  const [pedido, setPedido] = useState<PedidoResumo | null | undefined>(undefined);

  useEffect(() => {
    if (!pedidoId || !email) return;
    const id = pedidoId;
    const emailNarrowed = email;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase.rpc("obter_pedido_encontro27", {
        p_pedido_id: id,
        p_email: emailNarrowed,
      });
      setPedido((data as unknown as PedidoResumo | null) ?? null);
    }

    load();
  }, [pedidoId, email]);

  const naoEncontrado = (
    <div>
      <h1>Pedido não encontrado</h1>
      <p>Confira o link enviado por e-mail, ou acesse pela sua área do participante.</p>
      <Link href="/login">Ir para minha conta</Link>
    </div>
  );

  if (!pedidoId || !email) return naoEncontrado;
  if (pedido === undefined) return <p>Carregando...</p>;
  if (pedido === null) return naoEncontrado;

  return (
    <div>
      {pedido.status_pagamento === "aprovado" && (
        <>
          <h1>Pagamento aprovado</h1>
          <p>
            Obrigado, {pedido.comprador_nome}! Seu ingresso para <strong>{pedido.modalidade_nome}</strong> já está
            confirmado.
          </p>
        </>
      )}

      {pedido.status_pagamento === "aguardando_pagamento" && (
        <>
          <h1>Pagamento aguardando confirmação</h1>
          <p>
            Seu pedido foi registrado. Finalize o pagamento na Hypercash — assim que for aprovado, seu ingresso é
            liberado aqui e você recebe a confirmação.
          </p>
          {pedido.hypercash_url_usado && (
            <p>
              <a href={pedido.hypercash_url_usado}>Ir para o pagamento na Hypercash</a>
            </p>
          )}
        </>
      )}

      {(pedido.status_pagamento === "recusado" || pedido.status_pagamento === "cancelado") && (
        <>
          <h1>Pagamento não concluído</h1>
          <p>Não conseguimos confirmar o pagamento deste pedido.</p>
          {pedido.hypercash_url_usado && <a href={pedido.hypercash_url_usado}>Tentar novamente</a>}
        </>
      )}

      {pedido.status_pagamento === "reembolsado" && (
        <>
          <h1>Pedido reembolsado</h1>
        </>
      )}

      <hr style={{ margin: "24px 0" }} />

      <h2>Resumo do pedido</h2>
      <p>Modalidade: {pedido.modalidade_nome}</p>
      <p>Lote: {pedido.lote_nome}</p>
      <p>Quantidade: {pedido.quantidade}</p>
      <p>Valor total: {formatCurrencyBRL(pedido.valor_total)}</p>

      {pedido.participantes.length > 0 && (
        <>
          <h3>Participantes</h3>
          <ul>
            {pedido.participantes.map((p) => (
              <li key={p.identificador_unico}>
                {p.nome} — ingresso {p.identificador_unico}
                {p.check_in_status ? " (check-in feito)" : ""}
              </li>
            ))}
          </ul>
        </>
      )}

      <p style={{ marginTop: 24 }}>
        <Link href="/login">Acessar minha conta</Link>
      </p>
    </div>
  );
}
