-- ============================================================
-- Migration 0009 — Transferência de titularidade com aceite
-- Substitui a transferência direta (0008) por um fluxo de solicitação:
-- o comprador pede a transferência para um e-mail JÁ CADASTRADO no site;
-- o ingresso só muda de dono quando esse destinatário aceita. Enquanto
-- pendente, o remetente pode cancelar. Bloqueado após check-in.
--
-- language plpgsql (não sql) nas funções SECURITY DEFINER usadas sob RLS —
-- a versão "language sql" é inlineável pelo planner e vaza o contexto de
-- RLS do chamador pra dentro da função (ver migration 0005).
-- ============================================================

create table if not exists public.transferencias_titularidade_encontro27 (
  id             uuid primary key default gen_random_uuid(),
  participante_id uuid not null references public.participantes_encontro27(id) on delete cascade,
  pedido_id      uuid not null references public.pedidos_encontro27(id) on delete cascade,
  de_email       text not null,
  de_nome        text not null,
  para_email     text not null,
  status         text not null default 'pendente' check (status in ('pendente', 'aceita', 'cancelada', 'recusada')),
  created_at     timestamptz not null default now(),
  respondida_em  timestamptz
);

create index if not exists idx_transferencias_encontro27_participante
  on public.transferencias_titularidade_encontro27(participante_id);
create index if not exists idx_transferencias_encontro27_para_email
  on public.transferencias_titularidade_encontro27(para_email);

-- Só um pedido de transferência pendente por ingresso de cada vez.
create unique index if not exists idx_transferencias_encontro27_pendente_unica
  on public.transferencias_titularidade_encontro27(participante_id)
  where status = 'pendente';

alter table public.transferencias_titularidade_encontro27 enable row level security;

drop policy if exists transferencias_encontro27_select_admin on public.transferencias_titularidade_encontro27;
create policy transferencias_encontro27_select_admin on public.transferencias_titularidade_encontro27
  for select using (public.is_admin_encontro27());

-- ------------------------------------------------------------
-- drop da função antiga de transferência direta (migration 0008):
-- foi substituída por este fluxo de solicitação + aceite.
-- ------------------------------------------------------------
drop function if exists public.transferir_titularidade_encontro27(uuid, text, text);

-- ------------------------------------------------------------
-- solicitar_transferencia_titularidade_encontro27
-- ------------------------------------------------------------
create or replace function public.solicitar_transferencia_titularidade_encontro27(
  p_identificador_unico uuid,
  p_email_destino text
)
returns jsonb
language plpgsql
security definer
volatile
set search_path = public
as $$
declare
  v_email     text;
  v_destino   text;
  v_pedido    record;
  v_transf_id uuid;
begin
  v_email := auth.jwt() ->> 'email';
  if v_email is null then
    return jsonb_build_object('ok', false, 'erro', 'sem_sessao');
  end if;

  v_destino := lower(trim(p_email_destino));
  if v_destino is null or v_destino = '' or v_destino !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return jsonb_build_object('ok', false, 'erro', 'email_invalido');
  end if;

  if v_destino = lower(v_email) then
    return jsonb_build_object('ok', false, 'erro', 'mesmo_email');
  end if;

  select part.id as participante_id, p.id as pedido_id, p.status_pagamento, part.check_in_status,
         p.comprador_nome
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

  if not exists (select 1 from auth.users u where lower(u.email) = v_destino) then
    return jsonb_build_object('ok', false, 'erro', 'destino_nao_cadastrado');
  end if;

  if exists (
    select 1 from public.transferencias_titularidade_encontro27
    where participante_id = v_pedido.participante_id and status = 'pendente'
  ) then
    return jsonb_build_object('ok', false, 'erro', 'ja_pendente');
  end if;

  insert into public.transferencias_titularidade_encontro27
    (participante_id, pedido_id, de_email, de_nome, para_email)
  values
    (v_pedido.participante_id, v_pedido.pedido_id, lower(v_email), v_pedido.comprador_nome, v_destino)
  returning id into v_transf_id;

  return jsonb_build_object('ok', true, 'id', v_transf_id);
end;
$$;

grant execute on function public.solicitar_transferencia_titularidade_encontro27(uuid, text) to authenticated;

-- ------------------------------------------------------------
-- cancelar_transferencia_titularidade_encontro27 — pelo remetente
-- ------------------------------------------------------------
create or replace function public.cancelar_transferencia_titularidade_encontro27(
  p_transferencia_id uuid
)
returns jsonb
language plpgsql
security definer
volatile
set search_path = public
as $$
declare
  v_email text;
  v_linhas int;
begin
  v_email := auth.jwt() ->> 'email';
  if v_email is null then
    return jsonb_build_object('ok', false, 'erro', 'sem_sessao');
  end if;

  update public.transferencias_titularidade_encontro27
    set status = 'cancelada', respondida_em = now()
    where id = p_transferencia_id
      and lower(de_email) = lower(v_email)
      and status = 'pendente';

  get diagnostics v_linhas = row_count;
  if v_linhas = 0 then
    return jsonb_build_object('ok', false, 'erro', 'nao_encontrado');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.cancelar_transferencia_titularidade_encontro27(uuid) to authenticated;

-- ------------------------------------------------------------
-- minhas_transferencias_pendentes_encontro27 — pedidos de transferência
-- que EU (sessão atual) posso aceitar ou recusar.
-- ------------------------------------------------------------
create or replace function public.minhas_transferencias_pendentes_encontro27()
returns jsonb
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_email  text;
  v_result jsonb;
begin
  v_email := auth.jwt() ->> 'email';
  if v_email is null then
    return '[]'::jsonb;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'id', t.id,
           'de_nome', t.de_nome,
           'de_email', t.de_email,
           'modalidade_nome', m.nome,
           'created_at', t.created_at
         ) order by t.created_at desc), '[]'::jsonb)
    into v_result
    from public.transferencias_titularidade_encontro27 t
    join public.pedidos_encontro27 p on p.id = t.pedido_id
    join public.lotes_encontro27 l on l.id = p.lote_id
    join public.modalidades_encontro27 m on m.id = l.modalidade_id
    where t.status = 'pendente'
      and lower(t.para_email) = lower(v_email);

  return v_result;
end;
$$;

grant execute on function public.minhas_transferencias_pendentes_encontro27() to authenticated;

-- ------------------------------------------------------------
-- aceitar_transferencia_titularidade_encontro27 — pelo destinatário
-- ------------------------------------------------------------
create or replace function public.aceitar_transferencia_titularidade_encontro27(
  p_transferencia_id uuid
)
returns jsonb
language plpgsql
security definer
volatile
set search_path = public
as $$
declare
  v_email      text;
  v_novo_nome  text;
  v_transf     record;
begin
  v_email := auth.jwt() ->> 'email';
  if v_email is null then
    return jsonb_build_object('ok', false, 'erro', 'sem_sessao');
  end if;

  select t.id, t.participante_id
    into v_transf
    from public.transferencias_titularidade_encontro27 t
    join public.participantes_encontro27 part on part.id = t.participante_id
    where t.id = p_transferencia_id
      and lower(t.para_email) = lower(v_email)
      and t.status = 'pendente'
      and part.check_in_status = false;

  if not found then
    return jsonb_build_object('ok', false, 'erro', 'nao_encontrado');
  end if;

  v_novo_nome := coalesce(auth.jwt() -> 'user_metadata' ->> 'nome', split_part(v_email, '@', 1));

  update public.participantes_encontro27
    set nome = v_novo_nome, email = lower(v_email)
    where id = v_transf.participante_id;

  update public.transferencias_titularidade_encontro27
    set status = 'aceita', respondida_em = now()
    where id = v_transf.id;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.aceitar_transferencia_titularidade_encontro27(uuid) to authenticated;

-- ------------------------------------------------------------
-- recusar_transferencia_titularidade_encontro27 — pelo destinatário
-- ------------------------------------------------------------
create or replace function public.recusar_transferencia_titularidade_encontro27(
  p_transferencia_id uuid
)
returns jsonb
language plpgsql
security definer
volatile
set search_path = public
as $$
declare
  v_email text;
  v_linhas int;
begin
  v_email := auth.jwt() ->> 'email';
  if v_email is null then
    return jsonb_build_object('ok', false, 'erro', 'sem_sessao');
  end if;

  update public.transferencias_titularidade_encontro27
    set status = 'recusada', respondida_em = now()
    where id = p_transferencia_id
      and lower(para_email) = lower(v_email)
      and status = 'pendente';

  get diagnostics v_linhas = row_count;
  if v_linhas = 0 then
    return jsonb_build_object('ok', false, 'erro', 'nao_encontrado');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.recusar_transferencia_titularidade_encontro27(uuid) to authenticated;

-- ------------------------------------------------------------
-- meus_pedidos_encontro27 — agora também expõe, por participante, se há
-- uma transferência pendente enviada (pra mostrar o indicativo e permitir
-- cancelar em "Meus ingressos").
-- ------------------------------------------------------------
create or replace function public.meus_pedidos_encontro27()
returns jsonb
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_email  text;
  v_result jsonb;
begin
  v_email := auth.jwt() ->> 'email';
  if v_email is null then
    return '[]'::jsonb;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'id', p.id,
           'status_pagamento', p.status_pagamento,
           'quantidade', p.quantidade,
           'valor_total', p.valor_total,
           'comprador_nome', p.comprador_nome,
           'comprador_whatsapp', p.comprador_whatsapp,
           'modalidade_nome', m.nome,
           'lote_nome', l.nome,
           'created_at', p.created_at,
           'participantes', (
             select coalesce(jsonb_agg(jsonb_build_object(
                      'nome', part.nome,
                      'identificador_unico', part.identificador_unico,
                      'check_in_status', part.check_in_status,
                      'transferencia_pendente', (
                        select jsonb_build_object('id', t.id, 'para_email', t.para_email)
                        from public.transferencias_titularidade_encontro27 t
                        where t.participante_id = part.id and t.status = 'pendente'
                        limit 1
                      )
                    )), '[]'::jsonb)
             from public.participantes_encontro27 part
             where part.pedido_id = p.id
           )
         ) order by p.created_at desc), '[]'::jsonb)
    into v_result
    from public.pedidos_encontro27 p
    join public.lotes_encontro27 l on l.id = p.lote_id
    join public.modalidades_encontro27 m on m.id = l.modalidade_id
    where lower(p.comprador_email) = lower(v_email);

  return v_result;
end;
$$;

-- ------------------------------------------------------------
-- ROLLBACK (executar manualmente se precisar voltar):
--   drop function if exists public.recusar_transferencia_titularidade_encontro27(uuid);
--   drop function if exists public.aceitar_transferencia_titularidade_encontro27(uuid);
--   drop function if exists public.minhas_transferencias_pendentes_encontro27();
--   drop function if exists public.cancelar_transferencia_titularidade_encontro27(uuid);
--   drop function if exists public.solicitar_transferencia_titularidade_encontro27(uuid, text);
--   drop table if exists public.transferencias_titularidade_encontro27;
--   (e restaurar a versão anterior de meus_pedidos_encontro27 da migration 0002/0006, se necessário)
-- ------------------------------------------------------------
