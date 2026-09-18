import { Hono } from 'hono'
import { getSupabase } from '../lib/supabase.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SENHA_MIN = 6 // = minimum_password_length do Supabase Auth

// Limite simples por IP (memória do processo): rota pública que cria contas.
const JANELA_MS = 15 * 60 * 1000
const MAX_POR_JANELA = 10
const tentativas = new Map<string, { total: number; expiraEm: number }>()

function excedeuLimite(ip: string): boolean {
  const agora = Date.now()
  const atual = tentativas.get(ip)
  if (!atual || atual.expiraEm < agora) {
    tentativas.set(ip, { total: 1, expiraEm: agora + JANELA_MS })
    return false
  }
  atual.total += 1
  return atual.total > MAX_POR_JANELA
}

const app = new Hono()

// Cria a conta do participante já com o e-mail marcado como confirmado.
// Existe porque o signUp público do Supabase exige mandar e-mail de
// confirmação, e o SMTP do servidor de autenticação (compartilhado com outros
// projetos) hoje é o de teste — não entrega, então o signUp responde 500.
//
// ATENÇÃO: sem confirmação, quem cadastra o e-mail de outra pessoa passa a ver
// os ingressos e a receber transferências daquele e-mail. Decisão consciente do
// dono do projeto; trocar por SMTP real + confirmação assim que houver SMTP.
app.post('/', async (c) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'desconhecido'
  if (excedeuLimite(ip)) {
    return c.json({ error: 'muitas_tentativas' }, 429)
  }

  let body: Record<string, unknown>
  try {
    body = (await c.req.json()) as Record<string, unknown>
  } catch {
    return c.json({ error: 'invalid_json' }, 400)
  }

  const { email, senha, nome, whatsapp } = body ?? {}

  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return c.json({ error: 'email_invalido' }, 400)
  }
  if (typeof senha !== 'string' || senha.length < SENHA_MIN) {
    return c.json({ error: 'senha_curta' }, 400)
  }
  if (typeof nome !== 'string' || nome.trim().length < 3) {
    return c.json({ error: 'nome_invalido' }, 400)
  }
  if (typeof whatsapp !== 'string' || whatsapp.replace(/\D/g, '').length < 10) {
    return c.json({ error: 'whatsapp_invalido' }, 400)
  }

  const { error } = await getSupabase().auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password: senha,
    email_confirm: true,
    user_metadata: { nome: nome.trim(), whatsapp: whatsapp.trim() },
  })

  if (error) {
    if (error.code === 'email_exists' || /already|registered|exists/i.test(error.message)) {
      return c.json({ error: 'email_ja_cadastrado' }, 409)
    }
    if (error.code === 'weak_password') {
      return c.json({ error: 'senha_fraca' }, 400)
    }
    console.error('[cadastro] falha ao criar usuário:', error.message)
    return c.json({ error: 'falha_ao_criar_conta' }, 500)
  }

  return c.json({ ok: true }, 201)
})

export default app
