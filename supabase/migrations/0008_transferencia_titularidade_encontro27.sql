-- ============================================================
-- Migration 0008 — Transferência de titularidade de ingresso
-- Autoatendimento: o próprio comprador troca nome/e-mail do participante
-- de um ingresso já emitido, direto em "Meus ingressos". Bloqueado assim
-- que aquele ingresso já fez check-in (não faz sentido reescrever a
-- identidade de quem já está dentro do evento).
--
-- language plpgsql (não sql): função SECURITY DEFINER usada por baixo de
-- RLS — a versão "language sql" é inlineável pelo planner e vaza o
-- contexto de RLS do chamador pra dentro da função (ver migration 0005).
-- ============================================================

create or replace function public.transferir_titularidade_encontro27(
  p_identificador_unico uuid,
  p_novo_nome text,
  p_novo_email text
)
returns jsonb
language plpgsql
security definer
volatile
set search_path = public
as $$
declare
  v_email  text;
  v_pedido record;
begin
  v_email := auth.jwt() ->> 'email';
  if v_email is null then
    return jsonb_build_object('ok', false, 'erro', 'sem_sessao');
  end if;

  select p.id, p.status_pagamento, part.check_in_status
    into v_pedido
    from public.participantes_encontro27 part
    join public.pedidos_encontro27 p on p.id = part.pedido_id
    where part.identificador_unico = p_identificador_unico
      and lower(p.comprador_email) = lower(v_email);

  if not found then
    return jsonb_build_object('ok', false, 'erro', 'nao_encontrado');
  end if;

  if v_pedido.status_pagamento <> 'aprovado' then
    return jsonb_build_object('ok', false, 'erro', 'pedido_nao_aprovado');
  end if;

  if v_pedido.check_in_status then
    return jsonb_build_object('ok', false, 'erro', 'checkin_ja_feito');
  end if;

  if p_novo_nome is null or length(trim(p_novo_nome)) = 0 then
    return jsonb_build_object('ok', false, 'erro', 'nome_invalido');
  end if;

  if p_novo_email is null or p_novo_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return jsonb_build_object('ok', false, 'erro', 'email_invalido');
  end if;

  update public.participantes_encontro27
    set nome = trim(p_novo_nome),
        email = lower(trim(p_novo_email))
    where identificador_unico = p_identificador_unico;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.transferir_titularidade_encontro27(uuid, text, text) to authenticated;

-- ------------------------------------------------------------
-- ROLLBACK (executar manualmente se precisar voltar):
--   drop function if exists public.transferir_titularidade_encontro27(uuid, text, text);
-- ------------------------------------------------------------
