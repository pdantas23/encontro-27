-- ============================================================
-- Migration 0011 — role 'staff' (só faz check-in)
-- profiles_encontro27.role passa a aceitar 'comercial' | 'marketing' | 'staff'.
-- 'staff' NÃO é admin: is_admin_encontro27() (0002) continua listando só
-- comercial/marketing, então RLS de pedidos, lotes, etc. segue fechada pra ela.
-- O que a staff ganha: (1) ler o PRÓPRIO perfil, pro painel saber quem é, e
-- (2) chamar o check-in. Nada além disso.
--
-- language plpgsql (não sql) na função nova: ver migration 0005.
-- ============================================================

drop policy if exists profiles_encontro27_select_own on public.profiles_encontro27;
create policy profiles_encontro27_select_own on public.profiles_encontro27
  for select using (uuid = auth.uid());

create or replace function public.pode_fazer_checkin_encontro27()
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles_encontro27
    where uuid = auth.uid()
      and role in ('comercial', 'marketing', 'staff')
  );
end;
$$;

-- Mesma função da 0002; só o guarda de acesso mudou (is_admin -> pode_fazer_checkin).
create or replace function public.checkin_encontro27(p_identificador uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_participante public.participantes_encontro27%rowtype;
  v_pedido       public.pedidos_encontro27%rowtype;
begin
  if not public.pode_fazer_checkin_encontro27() then
    raise exception 'Não autorizado';
  end if;

  select * into v_participante
    from public.participantes_encontro27
    where identificador_unico = p_identificador
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'motivo', 'ingresso_nao_encontrado');
  end if;

  select * into v_pedido
    from public.pedidos_encontro27
    where id = v_participante.pedido_id;

  if v_pedido.status_pagamento is distinct from 'aprovado' then
    return jsonb_build_object('ok', false, 'motivo', 'pagamento_nao_aprovado');
  end if;

  if v_participante.check_in_status then
    return jsonb_build_object('ok', false, 'motivo', 'check_in_duplicado');
  end if;

  update public.participantes_encontro27
    set check_in_status = true,
        check_in_em = now(),
        check_in_por = auth.uid()
    where id = v_participante.id;

  return jsonb_build_object('ok', true, 'nome', v_participante.nome);
end;
$$;

grant execute on function public.checkin_encontro27(uuid) to authenticated;

-- ------------------------------------------------------------
-- ROLLBACK (executar manualmente se precisar voltar):
--   drop policy if exists profiles_encontro27_select_own on public.profiles_encontro27;
--   (recriar checkin_encontro27 da migration 0002, com is_admin_encontro27() no guarda)
--   drop function if exists public.pode_fazer_checkin_encontro27();
-- ------------------------------------------------------------
