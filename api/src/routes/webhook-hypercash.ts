import { Hono } from 'hono'
import { timingSafeEqual } from 'node:crypto'
import { getSupabase } from '../lib/supabase.js'

/**
 * Recebedor do webhook de transação da Hypercash.
 *
 * Formato do POST (docs.hypercash.com.br/docs/webhook/transaction):
 *   { type, objectId, url, data: { id, status, amount, currency,
 *     paymentMethod, paidAt, customer: { id, name, email } } }
 *
 * A Hypercash NÃO assina o request — não há header de assinatura para
 * conferir. Por isso a autenticação é um segredo na própria URL
 * (/webhooks/hypercash/<segredo>), que é o que registramos lá; e por isso
 * também nada aqui aprova um pedido só porque o corpo disse "paid": o
 * valor pago tem de bater com o valor do pedido.
 */

const app = new Hono()

// A Hypercash manda o status ora em maiúsculas (lista da doc) ora em
// minúsculas (exemplo da doc). Normaliza antes de decidir qualquer coisa.
const STATUS_APROVA = new Set(['paid', 'authorized'])
const STATUS_NEGA = new Set(['refused', 'canceled', 'chargedback', 'refunded', 'in_protest'])

function segredoConfere(recebido: string, esperado: string) {
  const a = Buffer.from(recebido)
  const b = Buffer.from(esperado)
  // timingSafeEqual exige o mesmo tamanho; comparar antes vaza só o
  // comprimento, não o conteúdo.
  return a.length === b.length && timingSafeEqual(a, b)
}

interface PayloadHypercash {
  type?: string
  objectId?: string
  data?: {
    id?: string
    status?: string
    amount?: number
    paidAt?: string
    customer?: { email?: string; name?: string }
  }
}

app.post('/:segredo', async (c) => {
  const segredoEsperado = process.env.HYPERCASH_WEBHOOK_SECRET
  if (!segredoEsperado) {
    console.error('[webhook-hypercash] HYPERCASH_WEBHOOK_SECRET não configurada.')
    return c.json({ error: 'configuracao_ausente' }, 500)
  }

  if (!segredoConfere(c.req.param('segredo'), segredoEsperado)) {
    return c.json({ error: 'nao_autorizado' }, 401)
  }

  let payload: PayloadHypercash
  try {
    payload = await c.req.json()
  } catch {
    return c.json({ error: 'invalid_json' }, 400)
  }

  const supabase = getSupabase()
  const transacaoId = payload?.data?.id ?? payload?.objectId ?? null
  const statusBruto = payload?.data?.status ?? null
  const status = statusBruto?.toLowerCase() ?? null

  // Grava o evento ANTES de agir. O índice único (object_id, status) é o
  // que segura o retry da Hypercash: se o insert falhar por duplicidade,
  // este evento já foi processado e sair daqui é o certo.
  const registrar = async (resultado: string, detalhe: string | null, pedidoId: string | null) => {
    const { error } = await supabase.from('webhooks_hypercash_encontro27').insert({
      tipo: payload?.type ?? null,
      object_id: transacaoId,
      status: statusBruto,
      payload: payload as unknown as Record<string, unknown>,
      pedido_id: pedidoId,
      resultado,
      detalhe,
    })
    return error
  }

  if (payload?.type && payload.type !== 'transaction') {
    await registrar('ignorado', `tipo não tratado: ${payload.type}`, null)
    return c.json({ ok: true, resultado: 'ignorado' })
  }

  if (!transacaoId || !status) {
    await registrar('erro', 'payload sem id de transação ou sem status', null)
    return c.json({ error: 'payload_incompleto' }, 400)
  }

  // Marca o evento como em processamento. Duplicado = retry, encerra aqui.
  const erroRegistro = await registrar('recebido', null, null)
  if (erroRegistro) {
    if (erroRegistro.code === '23505') {
      return c.json({ ok: true, resultado: 'duplicado' })
    }
    console.error('[webhook-hypercash] Falha ao registrar evento:', erroRegistro.message)
    return c.json({ error: 'falha_ao_registrar' }, 500)
  }

  const concluir = async (resultado: string, detalhe: string | null, pedidoId: string | null) => {
    await supabase
      .from('webhooks_hypercash_encontro27')
      .update({ resultado, detalhe, pedido_id: pedidoId })
      .eq('object_id', transacaoId)
      .eq('status', statusBruto)
  }

  if (!STATUS_APROVA.has(status) && !STATUS_NEGA.has(status)) {
    // processing, waiting_payment, in_analysis: a Hypercash ainda vai
    // mandar outro evento. Fica registrado e nada muda no pedido.
    await concluir('ignorado', `status intermediário: ${statusBruto}`, null)
    return c.json({ ok: true, resultado: 'ignorado' })
  }

  const pedido = await encontrarPedido(supabase, transacaoId, payload)

  if (!pedido.ok) {
    await concluir(pedido.erro, pedido.detalhe, null)
    // 200 de propósito: o evento é válido, só não achamos o dono. Pedir
    // retry à Hypercash não resolveria — quem resolve é o admin.
    return c.json({ ok: true, resultado: pedido.erro })
  }

  const novoStatus = STATUS_APROVA.has(status) ? 'aprovado' : 'recusado'

  const { error: updateError } = await supabase
    .from('pedidos_encontro27')
    .update({
      status_pagamento: novoStatus,
      confirmado_em: new Date().toISOString(),
      hypercash_transaction_id: transacaoId,
      hypercash_status_bruto: statusBruto,
      aprovado_via: novoStatus === 'aprovado' ? 'webhook' : null,
    })
    .eq('id', pedido.id)
    // Só sai de aguardando_pagamento: evita que um evento atrasado
    // desfaça uma decisão já tomada pelo admin.
    .eq('status_pagamento', 'aguardando_pagamento')

  if (updateError) {
    console.error('[webhook-hypercash] Falha ao atualizar pedido:', updateError.message)
    await concluir('erro', updateError.message, pedido.id)
    // 500 aqui é proposital: foi falha nossa, o retry da Hypercash ajuda.
    return c.json({ error: 'falha_ao_atualizar' }, 500)
  }

  await concluir(novoStatus === 'aprovado' ? 'aprovado' : 'recusado', null, pedido.id)
  return c.json({ ok: true, resultado: novoStatus })
})

// Discriminado por `ok`: um `erro` de string vazia não é distinguível por
// truthiness, e aí o TypeScript não estreita o ramo de sucesso.
type Achado =
  | { ok: true; id: string }
  | { ok: false; erro: string; detalhe: string }

/**
 * Descobre de qual pedido é a transação.
 *
 * A Hypercash não devolve no webhook o id do payment-link que criamos por
 * pedido (criar-checkout.ts), então a ligação é reconstruída aqui, da
 * pista mais forte para a mais fraca. Se nenhuma delas fecha sozinha, o
 * evento é parado como 'nao_correlacionado'/'ambiguo' e vai para
 * conferência manual — aprovar por palpite é pior que não aprovar.
 */
async function encontrarPedido(
  supabase: ReturnType<typeof getSupabase>,
  transacaoId: string,
  payload: PayloadHypercash,
): Promise<Achado> {
  // 1. A transação já foi vista antes (evento anterior do mesmo pagamento).
  const { data: porTransacao } = await supabase
    .from('pedidos_encontro27')
    .select('id')
    .eq('hypercash_transaction_id', transacaoId)
    .maybeSingle()

  if (porTransacao?.id) return { ok: true, id: porTransacao.id as string }

  // 2. E-mail do comprador + valor exato, entre os que ainda aguardam.
  //    O valor vem em centavos no webhook e em reais no pedido.
  const email = payload?.data?.customer?.email?.trim().toLowerCase()
  const centavos = payload?.data?.amount

  if (!email || typeof centavos !== 'number') {
    return { ok: false, erro: 'nao_correlacionado', detalhe: 'webhook sem e-mail do cliente ou sem valor' }
  }

  const { data: candidatos, error } = await supabase
    .from('pedidos_encontro27')
    .select('id, valor_total')
    .ilike('comprador_email', email)
    .eq('status_pagamento', 'aguardando_pagamento')

  if (error) return { ok: false, erro: 'erro', detalhe: error.message }

  const doValor = (candidatos ?? []).filter(
    (p) => Math.round(Number(p.valor_total) * 100) === centavos,
  )

  if (doValor.length === 1) return { ok: true, id: doValor[0].id as string }

  if (doValor.length === 0) {
    return {
      ok: false,
      erro: 'nao_correlacionado',
      detalhe: `nenhum pedido aguardando de ${email} no valor de ${centavos} centavos`,
    }
  }

  return {
    ok: false,
    erro: 'ambiguo',
    detalhe: `${doValor.length} pedidos aguardando de ${email} no mesmo valor — aprovar manualmente`,
  }
}

export default app
