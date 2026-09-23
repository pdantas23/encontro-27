# O Encontro 2027

Landing page de vendas do evento: página pública, checkout e painel administrativo.

- **Front:** Next.js 16 (App Router, `output: "export"`) + Tailwind v4
- **Dados:** Supabase (Postgres + Auth + RLS)
- **Pagamento:** Hypercash, via uma API própria em [`api/`](api)

## Antes de rodar

**O site vive em `/encontro27`, não na raiz.** O `basePath` está fixo em
[`next.config.ts`](next.config.ts), então `http://localhost:3000` responde 404 —
o endereço certo é `http://localhost:3000/encontro27/`.

Você vai precisar das credenciais do Supabase do projeto. Sem elas o site sobe,
mas todas as modalidades aparecem como "Em breve": preço e link de pagamento
vêm da tabela `lotes_encontro27`, não do código.

## Começando

```bash
npm install
cp .env.example .env.local   # preencha os valores
npm run dev
```

Abra <http://localhost:3000/encontro27/>.

Cada variável está explicada em [`.env.example`](.env.example). As duas
obrigatórias para o site aparecer com preços são `NEXT_PUBLIC_SUPABASE_URL` e
`NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Testando uma compra localmente

O botão "Comprar" leva ao checkout, que grava o pedido no Supabase e então pede
à API o link de pagamento. Esse último passo precisa de uma API alcançável.

A API de produção (`https://api.oencontropi.com.br`) aceita apenas as origens
listadas em `CORS_ALLOWED_ORIGINS`, e `http://localhost:3000` não está entre
elas — o navegador bloqueia a chamada. Duas saídas:

**Proxy de desenvolvimento** (não mexe em produção):

```bash
node scripts/dev-api-proxy.mjs          # sobe na porta 3001
# e no .env.local:
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Rodar a API inteira local**, se for mexer nela:

```bash
cd api && npm install && npm run dev
# e no .env.local:
NEXT_PUBLIC_API_URL=http://localhost:3002
```

A API precisa de `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`HYPERCASH_PRODUCTS_API_KEY`, `CORS_ALLOWED_ORIGINS` e `PORT` — ela carrega o
mesmo `.env.local` da raiz.

Dois detalhes que custam tempo quando pegam de surpresa:

- **A Hypercash recusa cobranças abaixo de R$ 8,00**, com
  `{"price":["Preço mínimo é R$ 8,00"]}`. Um produto de teste de R$ 0,01 não
  gera link.
- **Pagar aprova o pedido pelo webhook**, não pelo retorno do navegador. Em
  desenvolvimento a Hypercash não alcança sua máquina: use ngrok, ou simule o
  POST com `curl` (veja "Aprovação do pagamento"). Sem isso o pedido fica em
  `aguardando_pagamento` indefinidamente — a aprovação é só automática, não há
  botão para forçá-la no painel.

## Aprovação do pagamento

Quem aprova o pedido é o webhook de transação da Hypercash, recebido em
`POST /webhooks/hypercash/<segredo>` ([api/src/routes/webhook-hypercash.ts](api/src/routes/webhook-hypercash.ts)).
Ao aprovar, o trigger `trg_pedido_aprovado_encontro27` reserva a vaga no lote
e o ingresso com QR Code aparece em "Minha conta".

A Hypercash **não assina** os requests. Duas consequências de projeto:

- a autenticação é o segredo na própria URL registrada lá
  (`HYPERCASH_WEBHOOK_SECRET`, comparado em tempo constante);
- nada é aprovado no escuro: o valor pago tem de bater com o valor do pedido.

O webhook também não devolve o id do payment-link que criamos por pedido, então
a ligação transação → pedido é reconstruída por e-mail do comprador + valor
exato, entre os pedidos ainda aguardando. Quando isso não fecha em exatamente
um pedido, **nada é aprovado**: o evento fica em
`webhooks_hypercash_encontro27` com resultado `nao_correlacionado` ou `ambiguo`.
Não existe aprovação manual pelo painel (`/admin/pedidos` é só leitura) — esses
casos exigem intervenção direta no banco. Todo payload recebido é gravado
nessa tabela, e o índice único `(object_id, status)` é o que impede que um
retry da Hypercash aprove duas vezes.

Para simular sem a Hypercash, com a API rodando local:

```bash
curl -X POST http://localhost:3002/webhooks/hypercash/$HYPERCASH_WEBHOOK_SECRET \
  -H 'Content-Type: application/json' \
  -d '{"type":"transaction","objectId":"tx-1","data":{"id":"tx-1","status":"paid",
       "amount":38700,"customer":{"email":"comprador@example.com"}}}'
```

`amount` é em centavos e precisa bater com o `valor_total` do pedido.

## Painel administrativo

Fica em `/encontro27/admin`, atrás de login do Supabase Auth. Para criar o
primeiro usuário:

```bash
node --env-file=.env.local scripts/seed-admin.mjs <email> <senha> [comercial|marketing]
```

## Banco

As migrations estão em [`supabase/migrations`](supabase/migrations), numeradas e
aplicadas em ordem. O RLS é o que protege as tabelas: o comprador anônimo pode
inserir um pedido, mas não pode lê-lo de volta nem alterar preço — a validação
roda numa função `SECURITY DEFINER` chamada pela policy de insert.

## Testes

```bash
npm run test:e2e   # Playwright, contra o next dev e o Supabase real
npm run lint
```

Os testes E2E esperam o servidor rodando em `http://localhost:3000/encontro27/`.

## Deploy

O front é exportado como site estático (`npm run build` gera `out/`). A API roda
como serviço próprio no EasyPanel, a partir do [`api/Dockerfile`](api/Dockerfile).
