-- ============================================================
-- Migration 0002 — RLS, funções, RPCs e seed | O Encontro 2027
-- ============================================================

alter table public.profiles_encontro27       enable row level security;
alter table public.event_config_encontro27    enable row level security;
alter table public.modalidades_encontro27     enable row level security;
alter table public.lotes_encontro27           enable row level security;
alter table public.pedidos_encontro27         enable row level security;
alter table public.participantes_encontro27   enable row level security;
alter table public.palestrantes_encontro27    enable row level security;
alter table public.programacao_encontro27     enable row level security;
alter table public.faq_encontro27             enable row level security;
alter table public.tracking_events_encontro27 enable row level security;

-- ------------------------------------------------------------
-- is_admin_encontro27()
-- ------------------------------------------------------------
create or replace function public.is_admin_encontro27()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles_encontro27
    where uuid = auth.uid()
    and role in ('comercial', 'marketing')
  )
$$;

-- profiles_encontro27: tudo restrito a admin
create policy profiles_encontro27_select_admin on public.profiles_encontro27
  for select using (public.is_admin_encontro27());
create policy profiles_encontro27_insert_admin on public.profiles_encontro27
  for insert with check (public.is_admin_encontro27());
create policy profiles_encontro27_update_admin on public.profiles_encontro27
  for update using (public.is_admin_encontro27());

-- event_config_encontro27: leitura pública, escrita admin
create policy event_config_encontro27_select_public on public.event_config_encontro27
  for select using (true);
create policy event_config_encontro27_update_admin on public.event_config_encontro27
  for update using (public.is_admin_encontro27());

-- modalidades_encontro27
create policy modalidades_encontro27_select_public on public.modalidades_encontro27
  for select using (true);
create policy modalidades_encontro27_insert_admin on public.modalidades_encontro27
  for insert with check (public.is_admin_encontro27());
create policy modalidades_encontro27_update_admin on public.modalidades_encontro27
  for update using (public.is_admin_encontro27());
create policy modalidades_encontro27_delete_admin on public.modalidades_encontro27
  for delete using (public.is_admin_encontro27());

-- lotes_encontro27
create policy lotes_encontro27_select_public on public.lotes_encontro27
  for select using (true);
create policy lotes_encontro27_insert_admin on public.lotes_encontro27
  for insert with check (public.is_admin_encontro27());
create policy lotes_encontro27_update_admin on public.lotes_encontro27
  for update using (public.is_admin_encontro27());
create policy lotes_encontro27_delete_admin on public.lotes_encontro27
  for delete using (public.is_admin_encontro27());

-- palestrantes_encontro27
create policy palestrantes_encontro27_select_public on public.palestrantes_encontro27
  for select using (true);
create policy palestrantes_encontro27_insert_admin on public.palestrantes_encontro27
  for insert with check (public.is_admin_encontro27());
create policy palestrantes_encontro27_update_admin on public.palestrantes_encontro27
  for update using (public.is_admin_encontro27());
create policy palestrantes_encontro27_delete_admin on public.palestrantes_encontro27
  for delete using (public.is_admin_encontro27());

-- programacao_encontro27
create policy programacao_encontro27_select_public on public.programacao_encontro27
  for select using (true);
create policy programacao_encontro27_insert_admin on public.programacao_encontro27
  for insert with check (public.is_admin_encontro27());
create policy programacao_encontro27_update_admin on public.programacao_encontro27
  for update using (public.is_admin_encontro27());
create policy programacao_encontro27_delete_admin on public.programacao_encontro27
  for delete using (public.is_admin_encontro27());

-- faq_encontro27
create policy faq_encontro27_select_public on public.faq_encontro27
  for select using (true);
create policy faq_encontro27_insert_admin on public.faq_encontro27
  for insert with check (public.is_admin_encontro27());
create policy faq_encontro27_update_admin on public.faq_encontro27
  for update using (public.is_admin_encontro27());
create policy faq_encontro27_delete_admin on public.faq_encontro27
  for delete using (public.is_admin_encontro27());

-- pedidos_encontro27: criação pública (checkout sem login), leitura/edição só admin
-- (o comprador nunca lê esta tabela direto — só via as RPCs abaixo)
create policy pedidos_encontro27_insert_public on public.pedidos_encontro27
  for insert with check (true);
create policy pedidos_encontro27_select_admin on public.pedidos_encontro27
  for select using (public.is_admin_encontro27());
create policy pedidos_encontro27_update_admin on public.pedidos_encontro27
  for update using (public.is_admin_encontro27());

-- participantes_encontro27: mesmo padrão de pedidos_encontro27
create policy participantes_encontro27_insert_public on public.participantes_encontro27
  for insert with check (true);
create policy participantes_encontro27_select_admin on public.participantes_encontro27
  for select using (public.is_admin_encontro27());
create policy participantes_encontro27_update_admin on public.participantes_encontro27
  for update using (public.is_admin_encontro27());

-- tracking_events_encontro27: insert público, leitura só admin
create policy tracking_events_encontro27_insert_public on public.tracking_events_encontro27
  for insert with check (true);
create policy tracking_events_encontro27_select_admin on public.tracking_events_encontro27
  for select using (public.is_admin_encontro27());

-- ------------------------------------------------------------
-- RPC: reservar_vaga_lote_encontro27
-- Incrementa quantidade_vendida de forma atômica, respeitando o
-- limite do lote. Não é exposta ao cliente (sem grant a
-- anon/authenticated) — só é chamada internamente pelo trigger
-- abaixo, quando um pedido é aprovado.
-- ------------------------------------------------------------
create or replace function public.reservar_vaga_lote_encontro27(
  p_lote_id uuid,
  p_quantidade int
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_quantidade_maxima  int;
  v_quantidade_vendida int;
begin
  select quantidade, quantidade_vendida
    into v_quantidade_maxima, v_quantidade_vendida
    from public.lotes_encontro27
    where id = p_lote_id
    for update;

  if v_quantidade_maxima is not null
     and v_quantidade_vendida + p_quantidade > v_quantidade_maxima then
    return false;
  end if;

  update public.lotes_encontro27
    set quantidade_vendida = quantidade_vendida + p_quantidade,
        updated_at = now()
    where id = p_lote_id;

  return true;
end;
$$;

-- ------------------------------------------------------------
-- Trigger: ao aprovar um pedido (mudança feita manualmente pelo
-- admin, ver capítulo 07), reserva a vaga no lote correspondente.
-- Se o lote já estiver sem vagas (oversell), a venda é mantida
-- como aprovada — o pagamento já aconteceu fora do sistema — mas
-- o pedido é marcado com tem_problema_estoque para revisão manual,
-- mesmo padrão usado no Encontro 26.
-- ------------------------------------------------------------
create or replace function public.on_pedido_aprovado_encontro27()
returns trigger
language plpgsql
security definer
as $$
declare
  v_sucesso boolean;
begin
  if new.status_pagamento = 'aprovado' and old.status_pagamento is distinct from 'aprovado' then
    v_sucesso := public.reservar_vaga_lote_encontro27(new.lote_id, new.quantidade);
    if not v_sucesso then
      update public.pedidos_encontro27
        set tem_problema_estoque = true
        where id = new.id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_pedido_aprovado_encontro27 on public.pedidos_encontro27;
create trigger trg_pedido_aprovado_encontro27
  after update on public.pedidos_encontro27
  for each row
  execute function public.on_pedido_aprovado_encontro27();

-- ------------------------------------------------------------
-- RPC: obter_pedido_encontro27
-- Expõe só os campos necessários ao comprador sem exigir login —
-- usada em /checkout/pendente logo após a compra, validando por
-- pedido_id + e-mail (quem não sabe as duas coisas não acessa).
-- ------------------------------------------------------------
create or replace function public.obter_pedido_encontro27(
  p_pedido_id uuid,
  p_email text
)
returns jsonb
language plpgsql
security definer
stable
as $$
declare
  v_pedido record;
  v_participantes jsonb;
begin
  select p.id, p.status_pagamento, p.quantidade, p.valor_total, p.comprador_nome,
         p.hypercash_url_usado, m.nome as modalidade_nome, l.nome as lote_nome
    into v_pedido
    from public.pedidos_encontro27 p
    join public.lotes_encontro27 l on l.id = p.lote_id
    join public.modalidades_encontro27 m on m.id = l.modalidade_id
    where p.id = p_pedido_id
      and lower(p.comprador_email) = lower(p_email);

  if not found then
    return null;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'nome', nome,
           'identificador_unico', identificador_unico,
           'check_in_status', check_in_status
         )), '[]'::jsonb)
    into v_participantes
    from public.participantes_encontro27
    where pedido_id = p_pedido_id;

  return jsonb_build_object(
    'id', v_pedido.id,
    'status_pagamento', v_pedido.status_pagamento,
    'quantidade', v_pedido.quantidade,
    'valor_total', v_pedido.valor_total,
    'comprador_nome', v_pedido.comprador_nome,
    'hypercash_url_usado', v_pedido.hypercash_url_usado,
    'modalidade_nome', v_pedido.modalidade_nome,
    'lote_nome', v_pedido.lote_nome,
    'participantes', v_participantes
  );
end;
$$;

grant execute on function public.obter_pedido_encontro27(uuid, text) to anon, authenticated;

-- ------------------------------------------------------------
-- RPC: meus_pedidos_encontro27
-- Usada em /minha-conta após login por e-mail (OTP). Retorna os
-- pedidos do e-mail autenticado na sessão atual.
-- ------------------------------------------------------------
create or replace function public.meus_pedidos_encontro27()
returns jsonb
language plpgsql
security definer
stable
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
                      'check_in_status', part.check_in_status
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

grant execute on function public.meus_pedidos_encontro27() to authenticated;

-- ------------------------------------------------------------
-- RPC: checkin_encontro27
-- Faz o check-in de um participante pelo identificador_unico
-- (valor do QR Code). Bloqueia reuso e exige pagamento aprovado.
-- A checagem de admin é feita dentro da função (não pela RLS).
-- ------------------------------------------------------------
create or replace function public.checkin_encontro27(p_identificador uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_participante public.participantes_encontro27%rowtype;
  v_pedido       public.pedidos_encontro27%rowtype;
begin
  if not public.is_admin_encontro27() then
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
-- Seed: as 4 modalidades confirmadas do Lote 1 + 1 lote cada.
-- Preço, quantidade e período ficam NULL até o capítulo 16 ser
-- resolvido pela organização. Não criar modalidades adicionais.
-- ------------------------------------------------------------
insert into public.modalidades_encontro27 (slug, nome, ordem)
values
  ('start', 'Start', 1),
  ('almoco-nao-participante', 'Almoço Não Participante', 2),
  ('jantar-conexoes', 'Jantar de Conexões', 3),
  ('vip', 'VIP', 4)
on conflict (slug) do nothing;

insert into public.lotes_encontro27 (modalidade_id, nome, ordem)
select m.id, 'Lote 1', 1
from public.modalidades_encontro27 m
where m.slug in ('start', 'almoco-nao-participante', 'jantar-conexoes', 'vip')
  and not exists (
    select 1 from public.lotes_encontro27 l where l.modalidade_id = m.id
  );

-- ------------------------------------------------------------
-- Links Hypercash recebidos (4 em uso + 1 reserva). O mapeamento
-- link -> modalidade ainda não foi confirmado pela organização.
-- Preencher lotes_encontro27.hypercash_checkout_url via
-- /admin/lotes assim que confirmado — NÃO ativar o 5º link.
--
-- Links recebidos (uso pendente de mapeamento):
--   https://pay.hypercash.com.br/pt/checkout/38470b0a-5191-440f-b7c5-78ff06b7a81e
--   https://pay.hypercash.com.br/pt/checkout/78aab22d-3313-4f68-a457-d1a08bf64b07
--   https://pay.hypercash.com.br/pt/checkout/9a951195-d765-47e8-82e4-c939157951aa
--   https://pay.hypercash.com.br/pt/checkout/c490c4d4-8556-4f46-bf48-7345623a25f9
--
-- Reserva — NÃO usar ainda:
--   https://pay.hypercash.com.br/pt/checkout/28d70d70-9f6e-46bf-a15a-1c717a1524a0
-- ------------------------------------------------------------
