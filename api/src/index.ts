import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import criarCheckout from './routes/criar-checkout.js'
import webhookHypercash from './routes/webhook-hypercash.js'

const app = new Hono()

// ---------------------------------------------------------------------------
// CORS — só a rota chamada pelo browser (criar-checkout) precisa disso.
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

const corsMiddleware = cors({
  origin: allowedOrigins,
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
})

app.use('/criar-checkout/*', corsMiddleware)
app.use('/criar-checkout', corsMiddleware)

// ---------------------------------------------------------------------------
// Rotas
// ---------------------------------------------------------------------------

app.get('/health', (c) => c.json({ ok: true }))

app.route('/criar-checkout', criarCheckout)

// Server-to-server: a Hypercash chama esta rota, nenhum browser chama.
// Por isso fica fora do CORS — a autenticação é o segredo na URL.
app.route('/webhooks/hypercash', webhookHypercash)

// ---------------------------------------------------------------------------
// Servidor
// ---------------------------------------------------------------------------

const port = Number(process.env.PORT) || 3000

console.log(`[api] Iniciando na porta ${port}`)
serve({ fetch: app.fetch, port })
