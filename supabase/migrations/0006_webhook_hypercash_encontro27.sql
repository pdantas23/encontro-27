-- ============================================================
-- Migration 0006 — Aprovação automática pelo webhook da Hypercash
-- Contexto: até aqui o pedido nascia 'aguardando_pagamento' e só saía
-- disso quando um admin clicava em /admin/pedidos. A Hypercash dispara
-- um POST de transação (docs.hypercash.com.br/docs/webhook/transaction)
-- quando o pagamento muda de estado; esta migration dá ao recebedor o
-- que ele precisa para aprovar sem repetir e sem chutar.
--
-- Duas garantias que moram aqui, não no código da API:
--   * idempotência — a Hypercash reenvia o mesmo evento em retry, e o
--     índice único (object_id, status) faz o segundo insert falhar em
--     vez de aprovar duas vezes;
--   * rastro — todo payload recebido fica gravado, inclusive os que não
--     casaram com nenhum pedido, para conferência manual.
--
-- A aprovação em si continua sendo um update de status_pagamento para
-- 'aprovado': o trigger trg_pedido_aprovado_encontro27 (migration 0002)
-- já reserva a vaga no lote a partir daí. Nada desse caminho muda.
--
-- Aditiva: novas colunas em pedidos_encontro27 + tabela nova.
-- ============================================================

alter table public.pedidos_encontro27
  add column if not exists hypercash_transaction_id text,
  add column if not exists aprovado_via text,
  add column if not exists hypercash_status_bruto text;

comment on column public.pedidos_encontro27.aprovado_via is
  'Quem aprovou: ''webhook'' (automático) ou ''admin'' (manual em /admin/pedidos). Null = ainda não aprovado.';

create index if not exists idx_pedidos_encontro27_transaction
  on public.pedidos_encontro27(hypercash_transaction_id);

-- ------------------------------------------------------------
-- Log de webhooks recebidos. Guarda o payload cru: quando algo não
-- casar, é isto que diz o que a Hypercash mandou de verdade.
-- ------------------------------------------------------------
create table if not exists public.webhooks_hypercash_encontro27 (
  id            uuid primary key default gen_random_uuid(),
  recebido_em   timestamptz not null default now(),
  tipo          text,
  object_id     text,
  status        text,
  payload       jsonb not null,
  pedido_id     uuid references public.pedidos_encontro27(id),
  -- aprovado | ignorado | nao_correlacionado | ambiguo | erro
  resultado     text not null,
  detalhe       text
);

-- Idempotência: o mesmo evento (mesma transação, mesmo status) entra
-- uma vez só. O recebedor insere ANTES de aprovar; se este índice
-- rejeitar, é retry e nada é reprocessado.
create unique index if not exists uq_webhooks_hypercash_encontro27_evento
  on public.webhooks_hypercash_encontro27(object_id, status)
  where object_id is not null and status is not null;

create index if not exists idx_webhooks_hypercash_encontro27_resultado
  on public.webhooks_hypercash_encontro27(resultado, recebido_em desc);

-- ------------------------------------------------------------
-- RLS: ninguém do lado público toca nesta tabela. A API escreve com a
-- service_role (que ignora RLS) e o admin logado pode ler para
-- conferir os eventos que não casaram.
-- ------------------------------------------------------------
alter table public.webhooks_hypercash_encontro27 enable row level security;

drop policy if exists webhooks_hypercash_encontro27_select_admin on public.webhooks_hypercash_encontro27;
create policy webhooks_hypercash_encontro27_select_admin on public.webhooks_hypercash_encontro27
  for select
  using (public.is_admin_encontro27());

-- ------------------------------------------------------------
-- ROLLBACK (executar manualmente se precisar voltar):
--   drop table if exists public.webhooks_hypercash_encontro27;
--   alter table public.pedidos_encontro27
--     drop column if exists hypercash_transaction_id,
--     drop column if exists aprovado_via,
--     drop column if exists hypercash_status_bruto;
-- ------------------------------------------------------------
