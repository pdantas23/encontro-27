-- ============================================================
-- Migration 0004 — Checkout dinâmico via API de Produtos e Pagamentos
-- Contexto: em vez de um link fixo por lote (hypercash_checkout_url em
-- lotes_encontro27), cada pedido agora gera seu próprio link via
-- POST /v1/payment-links (Edge Function `encontro27-criar-checkout`,
-- que usa a service_role — por isso não precisa de nova policy de RLS).
-- lotes_encontro27.hypercash_checkout_url deixa de ser obrigatório para
-- a venda acontecer (fica como override manual/fallback, se algum dia
-- for preciso); o preço do lote continua sendo a única coisa exigida.
-- Aditiva: novas colunas em pedidos_encontro27 + troca da função de
-- validação do insert (mesma que a migration 0003 criou).
-- ============================================================

alter table public.pedidos_encontro27
  add column if not exists hypercash_payment_link_id text,
  add column if not exists hypercash_checkout_criado_em timestamptz;

create or replace function public.pedido_insert_valido_encontro27(
  p_lote_id           uuid,
  p_quantidade        int,
  p_valor_unitario    numeric,
  p_valor_total       numeric,
  p_status            text,
  p_confirmado_por    uuid,
  p_confirmado_em     timestamptz,
  p_tem_problema      boolean
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
      from public.lotes_encontro27 l
     where l.id = p_lote_id
       and l.status = 'ativo'
       and l.preco is not null
       -- o link de pagamento agora é criado por pedido (ver Edge Function
       -- encontro27-criar-checkout), não precisa mais existir de antemão no lote
       and p_quantidade = 1
       and p_valor_unitario = l.preco
       and p_valor_total = l.preco
       and p_status = 'aguardando_pagamento'
       and p_confirmado_por is null
       and p_confirmado_em is null
       and p_tem_problema = false
  );
$$;

-- ------------------------------------------------------------
-- ROLLBACK (executar manualmente se precisar voltar à 0003):
--   alter table public.pedidos_encontro27
--     drop column if exists hypercash_payment_link_id,
--     drop column if exists hypercash_checkout_criado_em;
--   -- e recriar a função com "and l.hypercash_checkout_url is not null"
--   -- de volta na condição (ver 0003_pedido_insert_guard_encontro27.sql).
-- ------------------------------------------------------------
