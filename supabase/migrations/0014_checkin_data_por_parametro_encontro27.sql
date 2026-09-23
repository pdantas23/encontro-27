-- ============================================================
-- Migration 0014 — Data do evento para o check-in vem de fora do banco
-- A aba "Configurações" do admin foi removida: não existe mais tela para
-- editar event_config_encontro27.date/date_fim. Em vez de checkin_encontro27
-- ler essas colunas, passa a receber a data de início/fim como parâmetro —
-- o front-end lê de NEXT_PUBLIC_EVENT_DATE_INICIO/NEXT_PUBLIC_EVENT_DATE_FIM
-- (ver .env.example) e envia em cada chamada.
-- ============================================================

drop function if exists public.checkin_encontro27(uuid);

create or replace function public.checkin_encontro27(
  p_identificador uuid,
  p_data_inicio date default null,
  p_data_fim date default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_participante public.participantes_encontro27%rowtype;
  v_pedido       public.pedidos_encontro27%rowtype;
  v_fora_do_dia  boolean := false;
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

  -- Sem data configurada (env var vazia), não tem com o que comparar: não avisa.
  if p_data_inicio is not null then
    v_fora_do_dia := (now() at time zone 'America/Sao_Paulo')::date
      not between p_data_inicio and coalesce(p_data_fim, p_data_inicio);
  end if;

  update public.participantes_encontro27
    set check_in_status = true,
        check_in_em = now(),
        check_in_por = auth.uid()
    where id = v_participante.id;

  return jsonb_build_object('ok', true, 'nome', v_participante.nome, 'fora_do_dia', v_fora_do_dia);
end;
$$;

grant execute on function public.checkin_encontro27(uuid, date, date) to authenticated;

-- ------------------------------------------------------------
-- ROLLBACK (executar manualmente se precisar voltar):
--   drop function if exists public.checkin_encontro27(uuid, date, date);
--   (recriar checkin_encontro27 da migration 0013, lendo event_config_encontro27)
-- ------------------------------------------------------------
