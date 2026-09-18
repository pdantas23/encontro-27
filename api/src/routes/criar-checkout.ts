import { Hono } from 'hono'
import { getSupabase } from '../lib/supabase.js'

const HYPERCASH_API_BASE = 'https://api-hypercash.fly.dev'

interface LoteAninhado {
  nome: string
  preco: number | null
  modalidades_encontro27: { nome: string } | null
}

const app = new Hono()

// Cria (ou reaproveita) o link de pagamento hospedado da Hypercash para um
// pedido já gravado em pedidos_encontro27. Existe porque criar o link exige
// a chave secreta da API de Produtos e Pagamentos, que nunca pode rodar no
// navegador do comprador. Chamada pelo checkout (CheckoutWizard.tsx) logo
// após o insert do pedido, passando { pedidoId }.
app.post('/', async (c) => {
  const hypercashApiKey = process.env.HYPERCASH_PRODUCTS_API_KEY
  if (!hypercashApiKey) {
    console.error('[criar-checkout] HYPERCASH_PRODUCTS_API_KEY não configurada.')
    return c.json({ error: 'configuracao_ausente' }, 500)
  }

  let pedidoId: string | undefined
  try {
    const body = await c.req.json()
    pedidoId = body?.pedidoId
  } catch {
    return c.json({ error: 'invalid_json' }, 400)
  }

  if (!pedidoId || typeof pedidoId !== 'string') {
    return c.json({ error: 'pedidoId_obrigatorio' }, 400)
  }

  const supabase = getSupabase()

  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos_encontro27')
    .select(
      'id, status_pagamento, hypercash_url_usado, hypercash_payment_link_id, lotes_encontro27(nome, preco, modalidades_encontro27(nome))',
    )
    .eq('id', pedidoId)
    .maybeSingle()

  if (pedidoError || !pedido) {
    return c.json({ error: 'pedido_nao_encontrado' }, 404)
  }

  // Idempotência: se já criamos um link pra esse pedido, devolve o mesmo —
  // evita gerar cobranças duplicadas em caso de retry do client.
  if (pedido.hypercash_payment_link_id && pedido.hypercash_url_usado) {
    return c.json({ checkoutUrl: pedido.hypercash_url_usado })
  }

  if (pedido.status_pagamento !== 'aguardando_pagamento') {
    return c.json({ error: 'pedido_ja_processado' }, 409)
  }

  const lote = pedido.lotes_encontro27 as unknown as LoteAninhado | null
  const modalidadeNome = lote?.modalidades_encontro27?.nome
  const loteNome = lote?.nome
  const preco = lote?.preco ?? null

  if (!preco || !modalidadeNome) {
    return c.json({ error: 'lote_sem_preco' }, 422)
  }

  const precoEmCentavos = Math.round(preco * 100)

  const hypercashResponse = await fetch(`${HYPERCASH_API_BASE}/v1/payment-links`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${hypercashApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `${modalidadeNome} — ${loteNome ?? 'O Encontro 2027'}`,
      availablePaymentMethods: ['pix', 'credit_card', 'boleto'],
      price: precoEmCentavos,
    }),
  })

  if (!hypercashResponse.ok) {
    const detalhe = await hypercashResponse.text()
    console.error('[criar-checkout] Erro ao criar payment-link na Hypercash:', hypercashResponse.status, detalhe)
    return c.json({ error: 'hypercash_falhou' }, 502)
  }

  const hypercashData = (await hypercashResponse.json()) as {
    data?: { checkoutUrl?: string; id?: string }
  }
  const checkoutUrl = hypercashData?.data?.checkoutUrl
  const paymentLinkId = hypercashData?.data?.id

  if (!checkoutUrl || !paymentLinkId) {
    console.error('[criar-checkout] Resposta da Hypercash sem checkoutUrl/id:', JSON.stringify(hypercashData))
    return c.json({ error: 'hypercash_resposta_invalida' }, 502)
  }

  const { error: updateError } = await supabase
    .from('pedidos_encontro27')
    .update({
      hypercash_url_usado: checkoutUrl,
      hypercash_payment_link_id: paymentLinkId,
      hypercash_checkout_criado_em: new Date().toISOString(),
    })
    .eq('id', pedidoId)

  if (updateError) {
    console.error('[criar-checkout] Falha ao salvar checkoutUrl no pedido:', updateError.message)
    return c.json({ error: 'falha_ao_salvar' }, 500)
  }

  return c.json({ checkoutUrl })
})

export default app
