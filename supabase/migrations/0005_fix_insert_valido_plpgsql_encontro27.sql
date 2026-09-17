-- ============================================================
-- Migration 0005 — Corrige pedido_insert_valido_encontro27 (SQL → plpgsql)
-- Bug encontrado em produção: funções SECURITY DEFINER escritas em
-- `language sql` podem ser "inlined" pelo planner do Postgres e, nesse
-- caso, a subquery interna roda com o RLS do CHAMADOR (anon), não do
-- dono da função — fazendo a validação falhar mesmo quando todas as
-- condições são satisfeitas (confirmado manualmente: a mesma função
-- retornava true quando chamada direto via SELECT, mas o INSERT via
-- PostgREST/anon era barrado com "row-level security policy").
-- `language plpgsql` não sofre esse inlining e resolve o problema.
-- Mesma assinatura de 0003/0004 — grants e a policy que a referencia
-- não precisam mudar.
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
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return exists (
    select 1
      from public.lotes_encontro27 l
     where l.id = p_lote_id
       and l.status = 'ativo'
       and l.preco is not null
       and p_quantidade = 1
       and p_valor_unitario = l.preco
       and p_valor_total = l.preco
       and p_status = 'aguardando_pagamento'
       and p_confirmado_por is null
       and p_confirmado_em is null
       and p_tem_problema = false
  );
end;
$$;
