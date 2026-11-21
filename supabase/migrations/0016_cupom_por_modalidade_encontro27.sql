-- ============================================================
-- Migration 0016 — Cupom vale só para certas modalidades
-- APLICADA em produção (sb.rcoacademy.com.br, vps-apps) em 2026-11-21.
-- Os cupons da 0015 passam a valer só no passaporte (modalidade VIP).
--   * cupons_encontro27.modalidade_id: null = vale para todas; preenchido = só essa.
--   * cupom_encontro27(codigo, lote_id default null): com o lote, devolve null
--     se o cupom não vale para a modalidade dele. Sem o lote (chamada atual do
--     site), continua devolvendo o percentual.
--   * pedido_insert_valido_encontro27 confere a modalidade do lote: o desconto
--     num ingresso fora da regra é barrado no banco.
-- ============================================================

alter table public.cupons_encontro27
  add column if not exists modalidade_id uuid references public.modalidades_encontro27(id);

update public.cupons_encontro27
   set modalidade_id = (select id from public.modalidades_encontro27 where slug = 'vip')
 where codigo in ('VAL25', 'ROSE25', 'GABI25', 'ELIANE25', 'FERNANDA25');

drop function if exists public.cupom_encontro27(text);

create or replace function public.cupom_encontro27(p_codigo text, p_lote_id uuid default null)
returns numeric
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return (select c.percentual
            from public.cupons_encontro27 c
           where c.codigo = upper(btrim(p_codigo))
             and c.ativo
             and (p_lote_id is null
                  or c.modalidade_id is null
                  or c.modalidade_id = (select l.modalidade_id from public.lotes_encontro27 l where l.id = p_lote_id)));
end;
$$;

revoke all on function public.cupom_encontro27(text, uuid) from public;
grant execute on function public.cupom_encontro27(text, uuid) to anon, authenticated;

create or replace function public.pedido_insert_valido_encontro27(
  p_lote_id           uuid,
  p_quantidade        int,
  p_valor_unitario    numeric,
  p_valor_total       numeric,
  p_status            text,
  p_confirmado_por    uuid,
  p_confirmado_em     timestamptz,
  p_tem_problema      boolean,
  p_cupom             text
)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_pct numeric;
begin
  if p_cupom is not null then
    v_pct := public.cupom_encontro27(p_cupom, p_lote_id);
    if v_pct is null or p_cupom <> upper(btrim(p_cupom)) then
      return false;
    end if;
  end if;

  return exists (
    select 1
      from public.lotes_encontro27 l
     where l.id = p_lote_id
       and l.status = 'ativo'
       and l.preco is not null
       and p_quantidade = 1
       and p_valor_unitario = round(l.preco * (1 - coalesce(v_pct, 0) / 100), 2)
       and p_valor_total = p_valor_unitario
       and p_status = 'aguardando_pagamento'
       and p_confirmado_por is null
       and p_confirmado_em is null
       and p_tem_problema = false
  );
end;
$$;

-- ------------------------------------------------------------
-- ROLLBACK (executar manualmente se precisar voltar à 0015):
--   update public.cupons_encontro27 set modalidade_id = null;
--   (e recriar cupom_encontro27(text) e a validação como em 0015)
-- ------------------------------------------------------------
