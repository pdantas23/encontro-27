import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import cadastro from './routes/cadastro.js'
import criarCheckout from './routes/criar-checkout.js'
import equipe from './routes/equipe.js'
import webhookHypercash from './routes/webhook-hypercash.js'

const app = new Hono()

// ---------------------------------------------------------------------------
// CORS — só as rotas chamadas pelo browser (criar-checkout, cadastro, equipe) precisam disso.
// ---------------------------------------------------------------------------

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

if (allowedOrigins.length === 0) {
  console.warn(
    '[CORS] CORS_ALLOWED_ORIGINS não definida ou vazia. ' +
      'Nenhuma origem cross-origin será aceita. ' +
      'Defina CORS_ALLOWED_ORIGINS no ambiente para liberar o frontend.',
  )
}

// No Hono, "*" dentro de uma lista NÃO é coringa (só casa com origem idêntica),
// então CORS_ALLOWED_ORIGINS=* precisa virar a string "*" pra valer.
const corsMiddleware = cors({
  origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
})

app.use('/criar-checkout/*', corsMiddleware)
app.use('/criar-checkout', corsMiddleware)
app.use('/cadastro/*', corsMiddleware)
app.use('/cadastro', corsMiddleware)
app.use('/equipe/*', corsMiddleware)
app.use('/equipe', corsMiddleware)

// ---------------------------------------------------------------------------
// Rotas
// ---------------------------------------------------------------------------

app.get('/health', (c) => c.json({ ok: true }))

app.route('/criar-checkout', criarCheckout)
app.route('/cadastro', cadastro)
app.route('/equipe', equipe)

// Server-to-server: a Hypercash chama esta rota, nenhum browser chama.
// Por isso fica fora do CORS — a autenticação é o segredo na URL.
app.route('/webhooks/hypercash', webhookHypercash)

// ---------------------------------------------------------------------------
// Servidor
// ---------------------------------------------------------------------------

const port = Number(process.env.PORT) || 3000

console.log(`[api] Iniciando na porta ${port}`)
serve({ fetch: app.fetch, port })
