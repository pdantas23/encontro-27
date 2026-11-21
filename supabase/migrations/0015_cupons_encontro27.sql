-- ============================================================
-- Migration 0015 — Cupons de desconto
-- APLICADA em produção (sb.rcoacademy.com.br, vps-apps) em 2026-11-21.
-- Cupom = código + percentual. Sem tela de cadastro: os cupons são
-- inseridos aqui (ou direto no banco). O pedido guarda o código usado e
-- já nasce com o valor com desconto em valor_unitario_registrado e
-- valor_total; o resto do sistema (link da Hypercash, webhook, painéis)
-- lê valor_total e não muda.
--   * cupons_encontro27: RLS ligado e nenhuma policy, então o público não
--     lista os códigos; só consulta um código por vez pela RPC abaixo.
--   * cupom_encontro27(codigo): devolve o percentual do cupom ativo, ou null.
--   * pedido_insert_valido_encontro27 ganha p_cupom: com cupom válido o
--     valor exigido é o preço do lote com desconto; sem cupom, o preço cheio.
-- ============================================================

create table if not exists public.cupons_encontro27 (
  codigo     text primary key check (codigo = upper(btrim(codigo)) and codigo <> ''),
  percentual numeric(5, 2) not null check (percentual > 0 and percentual < 100),
  ativo      boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.cupons_encontro27 enable row level security;

insert into public.cupons_encontro27 (codigo, percentual) values
  ('VAL25', 25), ('ROSE25', 25), ('GABI25', 25), ('ELIANE25', 25), ('FERNANDA25', 25)
on conflict (codigo) do nothing;

alter table public.pedidos_encontro27
  add column if not exists cupom_codigo text references public.cupons_encontro27(codigo);

create or replace function public.cupom_encontro27(p_codigo text)
returns numeric
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return (select c.percentual from public.cupons_encontro27 c
           where c.codigo = upper(btrim(p_codigo)) and c.ativo);
end;
$$;

revoke all on function public.cupom_encontro27(text) from public;
grant execute on function public.cupom_encontro27(text) to anon, authenticated;

-- A policy referencia a função antiga (8 argumentos): troca as duas juntas.
drop policy if exists pedidos_encontro27_insert_public on public.pedidos_encontro27;
drop function if exists public.pedido_insert_valido_encontro27(uuid, int, numeric, numeric, text, uuid, timestamptz, boolean);

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
    v_pct := public.cupom_encontro27(p_cupom);
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

revoke all on function public.pedido_insert_valido_encontro27(uuid, int, numeric, numeric, text, uuid, timestamptz, boolean, text) from public;
grant execute on function public.pedido_insert_valido_encontro27(uuid, int, numeric, numeric, text, uuid, timestamptz, boolean, text) to anon, authenticated;

create policy pedidos_encontro27_insert_public on public.pedidos_encontro27
  for insert
  with check (
    public.pedido_insert_valido_encontro27(
      lote_id, quantidade, valor_unitario_registrado, valor_total,
      status_pagamento, confirmado_por, confirmado_em, tem_problema_estoque,
      cupom_codigo
    )
  );

-- ------------------------------------------------------------
-- ROLLBACK (executar manualmente se precisar voltar à 0005):
--   drop policy if exists pedidos_encontro27_insert_public on public.pedidos_encontro27;
--   drop function if exists public.pedido_insert_valido_encontro27(uuid, int, numeric, numeric, text, uuid, timestamptz, boolean, text);
--   -- recriar a função de 8 argumentos e a policy como em 0005/0003
--   alter table public.pedidos_encontro27 drop column if exists cupom_codigo;
--   drop function if exists public.cupom_encontro27(text);
--   drop table if exists public.cupons_encontro27;
-- ------------------------------------------------------------
