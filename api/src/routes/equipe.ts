import { Hono } from 'hono'
import { getSupabase } from '../lib/supabase.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SENHA_MIN = 6 // = minimum_password_length do Supabase Auth
const ROLES_VALIDAS = ['comercial', 'marketing', 'staff']

const app = new Hono()

// Cadastra uma pessoa da equipe, com a role escolhida por quem cadastra
// ('comercial'/'marketing' têm acesso total ao painel; 'staff' só ao check-in,
// ver useAdminAuth). Só admin (comercial/marketing) pode chamar: o navegador
// manda o access_token da sessão em Authorization e a rota confere o perfil
// no banco. Existe na API porque criar usuário exige a chave de serviço, que
// nunca vai pro navegador.
app.post('/', async (c) => {
  const token = c.req.header('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return c.json({ error: 'nao_autenticado' }, 401)
  }

  const supabase = getSupabase()

  const { data: sessao, error: sessaoError } = await supabase.auth.getUser(token)
  if (sessaoError || !sessao.user) {
    return c.json({ error: 'nao_autenticado' }, 401)
  }

  const { data: perfil } = await supabase
    .from('profiles_encontro27')
    .select('role')
    .eq('uuid', sessao.user.id)
    .maybeSingle()

  if (!perfil || (perfil.role !== 'comercial' && perfil.role !== 'marketing')) {
    return c.json({ error: 'nao_autorizado' }, 403)
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

export default app
