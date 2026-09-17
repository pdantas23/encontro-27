// Edge Function: encontro27-criar-checkout
//
// Cria (ou reaproveita) o link de pagamento hospedado da Hypercash para um
// pedido já gravado em pedidos_encontro27. Existe porque criar o link exige
// a chave secreta da API de Produtos e Pagamentos (HYPERCASH_PRODUCTS_API_KEY),
// que nunca pode rodar no navegador do comprador — ver conversa/plano.
//
// Chamada pelo checkout (src/components/checkout/CheckoutWizard.tsx) logo
// após o insert em pedidos_encontro27, passando { pedidoId }.
//
// Variáveis de ambiente:
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — injetadas automaticamente pelo
//     runtime de Edge Functions do Supabase, não precisam ser configuradas.
//   HYPERCASH_PRODUCTS_API_KEY — chave "hcp_live_..." da API de Produtos e
//     Pagamentos (painel Hypercash → Integrações → API de Produtos e
//     Pagamentos). Configurar com `supabase secrets set` (self-hosted).

import { createClient } from "jsr:@supabase/supabase-js@2";

const HYPERCASH_API_BASE = "https://api-hypercash.fly.dev";

// CORS liberado pra qualquer origem por enquanto — domínio de produção
// ainda é PENDENTE (capítulo 16). Restringir a Access-Control-Allow-Origin
// ao domínio real assim que ele existir.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  let pedidoId: string | undefined;
  try {
    const body = await req.json();
    pedidoId = body?.pedidoId;
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  if (!pedidoId || typeof pedidoId !== "string") {
    return jsonResponse({ error: "pedidoId_obrigatorio" }, 400);
  }

  const hypercashApiKey = Deno.env.get("HYPERCASH_PRODUCTS_API_KEY");
  if (!hypercashApiKey) {
    console.error("HYPERCASH_PRODUCTS_API_KEY não configurada.");
    return jsonResponse({ error: "configuracao_ausente" }, 500);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos_encontro27")
    .select(
      "id, status_pagamento, hypercash_url_usado, hypercash_payment_link_id, lotes_encontro27(nome, preco, modalidades_encontro27(nome))",
    )
    .eq("id", pedidoId)
    .maybeSingle();

  if (pedidoError || !pedido) {
    return jsonResponse({ error: "pedido_nao_encontrado" }, 404);
  }

  // Idempotência: se já criamos um link pra esse pedido, devolve o mesmo —
  // evita gerar cobranças duplicadas em caso de retry do client.
  if (pedido.hypercash_payment_link_id && pedido.hypercash_url_usado) {
    return jsonResponse({ checkoutUrl: pedido.hypercash_url_usado });
  }

  if (pedido.status_pagamento !== "aguardando_pagamento") {
    return jsonResponse({ error: "pedido_ja_processado" }, 409);
  }

  interface LoteAninhado {
    nome: string;
    preco: number | null;
    modalidades_encontro27: { nome: string } | null;
  }
  const lote = pedido.lotes_encontro27 as unknown as LoteAninhado | null;
  const modalidadeNome = lote?.modalidades_encontro27?.nome;
  const loteNome = lote?.nome;
  const preco = lote?.preco ?? null;

  if (!preco || !modalidadeNome) {
    return jsonResponse({ error: "lote_sem_preco" }, 422);
  }

  const precoEmCentavos = Math.round(preco * 100);

  const hypercashResponse = await fetch(`${HYPERCASH_API_BASE}/v1/payment-links`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hypercashApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `${modalidadeNome} — ${loteNome ?? "O Encontro 2027"}`,
      availablePaymentMethods: ["pix", "credit_card", "boleto"],
      price: precoEmCentavos,
    }),
  });

  if (!hypercashResponse.ok) {
    const detalhe = await hypercashResponse.text();
    console.error("Erro ao criar payment-link na Hypercash:", hypercashResponse.status, detalhe);
    return jsonResponse({ error: "hypercash_falhou" }, 502);
  }

  const hypercashData = await hypercashResponse.json();
  const checkoutUrl: string | undefined = hypercashData?.data?.checkoutUrl;
  const paymentLinkId: string | undefined = hypercashData?.data?.id;

  if (!checkoutUrl || !paymentLinkId) {
    console.error("Resposta da Hypercash sem checkoutUrl/id:", JSON.stringify(hypercashData));
    return jsonResponse({ error: "hypercash_resposta_invalida" }, 502);
  }

  const { error: updateError } = await supabase
    .from("pedidos_encontro27")
    .update({
      hypercash_url_usado: checkoutUrl,
      hypercash_payment_link_id: paymentLinkId,
      hypercash_checkout_criado_em: new Date().toISOString(),
    })
    .eq("id", pedidoId);

  if (updateError) {
    console.error("Falha ao salvar checkoutUrl no pedido:", updateError.message);
    return jsonResponse({ error: "falha_ao_salvar" }, 500);
  }

  return jsonResponse({ checkoutUrl });
});
