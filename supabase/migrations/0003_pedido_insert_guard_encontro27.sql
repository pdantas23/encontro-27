-- ============================================================
-- Migration 0003 — Guarda de insert em pedidos_encontro27
-- Contexto: enquanto o pagamento usa links fixos da Hypercash (um valor
-- por lote), o banco precisa garantir que um pedido criado pelo público:
--   * tenha quantidade = 1 (o link cobra 1 unidade);
--   * registre exatamente o preço do lote (não o que o cliente mandar);
--   * aponte para um lote ativo, com preço e link de pagamento;
--   * nasça sempre como 'aguardando_pagamento', sem confirmação.
-- Antes, a policy de insert era `with check (true)`.
-- Aditiva: só troca a policy de INSERT de pedidos_encontro27 e cria
-- uma função de validação. Nenhuma outra tabela, policy, trigger ou
-- RPC é alterada.
-- ============================================================

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
       and l.hypercash_checkout_url is not null
       -- venda temporária por link fixo: 1 unidade por pedido
       and p_quantidade = 1
       and p_valor_unitario = l.preco
       and p_valor_total = l.preco
       -- pedido público nunca nasce aprovado/confirmado
       and p_status = 'aguardando_pagamento'
       and p_confirmado_por is null
       and p_confirmado_em is null
       and p_tem_problema = false
  );
$$;

revoke all on function public.pedido_insert_valido_encontro27(uuid, int, numeric, numeric, text, uuid, timestamptz, boolean) from public;
grant execute on function public.pedido_insert_valido_encontro27(uuid, int, numeric, numeric, text, uuid, timestamptz, boolean) to anon, authenticated;

drop policy if exists pedidos_encontro27_insert_public on public.pedidos_encontro27;

create policy pedidos_encontro27_insert_public on public.pedidos_encontro27
  for insert
  with check (
    public.pedido_insert_valido_encontro27(
      lote_id, quantidade, valor_unitario_registrado, valor_total,
      status_pagamento, confirmado_por, confirmado_em, tem_problema_estoque
    )
  );

-- ------------------------------------------------------------
-- ROLLBACK (executar manualmente se precisar voltar):
--   drop policy if exists pedidos_encontro27_insert_public on public.pedidos_encontro27;
--   create policy pedidos_encontro27_insert_public on public.pedidos_encontro27
--     for insert with check (true);
--   drop function if exists public.pedido_insert_valido_encontro27(uuid, int, numeric, numeric, text, uuid, timestamptz, boolean);
-- ------------------------------------------------------------
