import { Hono } from 'hono'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabase } from '../lib/supabase.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SENHA_MIN = 6 // = minimum_password_length do Supabase Auth
const ROLES_VALIDAS = ['comercial', 'marketing', 'staff']

const app = new Hono()

// Confere que quem chama está autenticado e é admin (comercial/marketing).
// Usado por todas as rotas deste arquivo — criar, remover e trocar senha de
// pessoas da equipe exigem a chave de serviço, que nunca vai pro navegador.
async function exigirAdmin(
  supabase: SupabaseClient,
  token: string | undefined,
): Promise<{ ok: true; uuid: string } | { ok: false; error: string; status: 401 | 403 }> {
  if (!token) {
    return { ok: false, error: 'nao_autenticado', status: 401 }
  }

  const { data: sessao, error: sessaoError } = await supabase.auth.getUser(token)
  if (sessaoError || !sessao.user) {
    return { ok: false, error: 'nao_autenticado', status: 401 }
  }

  const { data: perfil } = await supabase
    .from('profiles_encontro27')
    .select('role')
    .eq('uuid', sessao.user.id)
    .maybeSingle()

  if (!perfil || (perfil.role !== 'comercial' && perfil.role !== 'marketing')) {
    return { ok: false, error: 'nao_autorizado', status: 403 }
  }

  return { ok: true, uuid: sessao.user.id }
}

// Cadastra uma pessoa da equipe, com a role escolhida por quem cadastra
// ('comercial'/'marketing' têm acesso total ao painel; 'staff' só ao check-in,
// ver useAdminAuth). Só admin (comercial/marketing) pode chamar: o navegador
// manda o access_token da sessão em Authorization e a rota confere o perfil
// no banco. Existe na API porque criar usuário exige a chave de serviço, que
// nunca vai pro navegador.
app.post('/', async (c) => {
  const token = c.req.header('authorization')?.replace(/^Bearer\s+/i, '')
  const supabase = getSupabase()

  const auth = await exigirAdmin(supabase, token)
  if (!auth.ok) {
    return c.json({ error: auth.error }, auth.status)
  }

  let body: Record<string, unknown>
  try {
    body = (await c.req.json()) as Record<string, unknown>
  } catch {
    return c.json({ error: 'invalid_json' }, 400)
  }

  const { email, senha, role } = body ?? {}
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return c.json({ error: 'email_invalido' }, 400)
  }
  if (typeof senha !== 'string' || senha.length < SENHA_MIN) {
    return c.json({ error: 'senha_curta' }, 400)
  }
  if (typeof role !== 'string' || !ROLES_VALIDAS.includes(role)) {
    return c.json({ error: 'role_invalida' }, 400)
  }

  const emailNormalizado = email.trim().toLowerCase()

  const { data: criado, error: criarError } = await supabase.auth.admin.createUser({
    email: emailNormalizado,
    password: senha,
    email_confirm: true,
  })

  if (criarError || !criado.user) {
    if (criarError?.code === 'email_exists' || /already|registered|exists/i.test(criarError?.message ?? '')) {
      return c.json({ error: 'email_ja_cadastrado' }, 409)
    }
    if (criarError?.code === 'weak_password') {
      return c.json({ error: 'senha_fraca' }, 400)
    }
    console.error('[equipe] falha ao criar usuário:', criarError?.message)
    return c.json({ error: 'falha_ao_criar_conta' }, 500)
  }

  const { error: perfilError } = await supabase
    .from('profiles_encontro27')
    .insert({ uuid: criado.user.id, email: emailNormalizado, role })

  if (perfilError) {
    // Sem perfil a conta não serve pra nada e ainda ocuparia o e-mail: desfaz.
    await supabase.auth.admin.deleteUser(criado.user.id)
    console.error('[equipe] falha ao criar perfil:', perfilError.message)
    return c.json({ error: 'falha_ao_criar_conta' }, 500)
  }

  return c.json({ ok: true, id: criado.user.id }, 201)
})

// Remove o acesso de uma pessoa ao painel. Apaga só a linha em
// profiles_encontro27 — nunca a conta em auth.users, porque o mesmo login
// pode ser usado por outro projeto irmão na mesma Supabase (ex.:
// encontrocomercial@royalhub.com.br também é usado no Encontro 26).
// Quem chama não pode remover a si mesmo (evita ficar trancado fora).
app.delete('/:uuid', async (c) => {
  const token = c.req.header('authorization')?.replace(/^Bearer\s+/i, '')
  const supabase = getSupabase()

  const auth = await exigirAdmin(supabase, token)
  if (!auth.ok) {
    return c.json({ error: auth.error }, auth.status)
  }

  const alvo = c.req.param('uuid')
  if (alvo === auth.uuid) {
    return c.json({ error: 'nao_pode_remover_a_si_mesmo' }, 400)
  }

  const { error: deleteError } = await supabase.from('profiles_encontro27').delete().eq('uuid', alvo)
  if (deleteError) {
    console.error('[equipe] falha ao remover perfil:', deleteError.message)
    return c.json({ error: 'falha_ao_remover' }, 500)
  }

  return c.json({ ok: true })
})

// Troca a senha de uma pessoa da equipe. Exige a chave de serviço
// (auth.admin.updateUserById), por isso vive na API.
app.patch('/:uuid/senha', async (c) => {
  const token = c.req.header('authorization')?.replace(/^Bearer\s+/i, '')
  const supabase = getSupabase()

  const auth = await exigirAdmin(supabase, token)
  if (!auth.ok) {
    return c.json({ error: auth.error }, auth.status)
  }

  const alvo = c.req.param('uuid')

  let body: Record<string, unknown>
  try {
    body = (await c.req.json()) as Record<string, unknown>
  } catch {
    return c.json({ error: 'invalid_json' }, 400)
  }

  const { senha } = body ?? {}
  if (typeof senha !== 'string' || senha.length < SENHA_MIN) {
    return c.json({ error: 'senha_curta' }, 400)
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(alvo, { password: senha })
  if (updateError) {
    if (updateError.code === 'weak_password') {
      return c.json({ error: 'senha_fraca' }, 400)
    }
    console.error('[equipe] falha ao trocar senha:', updateError.message)
    return c.json({ error: 'falha_ao_trocar_senha' }, 500)
  }

  return c.json({ ok: true })
})

export default app
