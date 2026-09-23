-- ============================================================
-- Migration 0013 — Aviso de "fora do dia do evento" no check-in
-- O Encontro é um evento de vários dias; event_config_encontro27.date guarda
-- só uma data (o primeiro dia). Esta migration acrescenta date_fim (o último
-- dia) e faz checkin_encontro27 avisar quando o check-in acontece fora desse
-- período — sem bloquear (a data pode estar errada ou, como hoje, nem
-- configurada; é aviso pra equipe, não trava a porta do evento).
-- ============================================================

alter table public.event_config_encontro27
  add column if not exists date_fim timestamptz;

comment on column public.event_config_encontro27.date is
  'Data de início do evento (dia 1). Evento de um dia só: deixar date_fim nulo.';
comment on column public.event_config_encontro27.date_fim is
  'Data do último dia do evento. Nulo = evento de um dia só (usa só "date").';

create or replace function public.checkin_encontro27(p_identificador uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_participante public.participantes_encontro27%rowtype;
  v_pedido       public.pedidos_encontro27%rowtype;
  v_evento       record;
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

  -- Sem data configurada ainda, não tem com o que comparar: não avisa.
  select date, date_fim into v_evento from public.event_config_encontro27 limit 1;
  if v_evento.date is not null then
    v_fora_do_dia := (now() at time zone 'America/Sao_Paulo')::date
      not between (v_evento.date at time zone 'America/Sao_Paulo')::date
              and (coalesce(v_evento.date_fim, v_evento.date) at time zone 'America/Sao_Paulo')::date;
  end if;

  update public.participantes_encontro27
    set check_in_status = true,
        check_in_em = now(),
        check_in_por = auth.uid()
    where id = v_participante.id;

  return jsonb_build_object('ok', true, 'nome', v_participante.nome, 'fora_do_dia', v_fora_do_dia);
end;
$$;

grant execute on function public.checkin_encontro27(uuid) to authenticated;

-- ------------------------------------------------------------
-- ROLLBACK (executar manualmente se precisar voltar):
--   (recriar checkin_encontro27 da migration 0011, sem o aviso de dia)
--   alter table public.event_config_encontro27 drop column if exists date_fim;
-- ------------------------------------------------------------
