-- ============================================================
-- Migration 0001 — Schema inicial | O Encontro 2027
-- Convenção: todas as tabelas usam sufixo _encontro27
-- (mesma Supabase do projeto "Encontro 26", que usa sufixo _encontro)
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- profiles_encontro27
-- Perfis com acesso ao painel administrativo.
-- uuid é PK e FK para auth.users (mesmo uuid do Supabase Auth).
-- role: 'comercial' | 'marketing'
-- ------------------------------------------------------------
create table if not exists public.profiles_encontro27 (
  uuid       uuid primary key references auth.users(id) on delete cascade,
  email      text not null unique,
  role       text not null default 'comercial',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- event_config_encontro27
-- Configuração global do evento (linha única).
-- ------------------------------------------------------------
create table if not exists public.event_config_encontro27 (
  id               uuid primary key default gen_random_uuid(),
  name             text default 'O Encontro 2027',
  date             timestamptz,                    -- PENDENTE DE VALIDAÇÃO (capítulo 16)
  location         text,                           -- PENDENTE DE VALIDAÇÃO
  description      text,
  sale_status      text not null default 'open',   -- open | closed | soldout
  whatsapp_support text,                           -- PENDENTE DE VALIDAÇÃO
  ga4_id           text,                           -- PENDENTE DE VALIDAÇÃO
  gtm_id           text,                           -- PENDENTE DE VALIDAÇÃO
  meta_pixel_id    text,                           -- PENDENTE DE VALIDAÇÃO
  google_ads_id    text,                           -- PENDENTE DE VALIDAÇÃO
  updated_at       timestamptz
);

insert into public.event_config_encontro27 (name, sale_status)
values ('O Encontro 2027', 'open')
on conflict do nothing;

-- ------------------------------------------------------------
-- modalidades_encontro27
-- Tipo de ingresso. Confirmado no Lote 1: exatamente 4 modalidades.
-- Não criar modalidades adicionais sem confirmação da organização.
-- ------------------------------------------------------------
create table if not exists public.modalidades_encontro27 (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  nome                text not null,
  descricao           text,             -- PENDENTE DE VALIDAÇÃO
  para_quem_e         text,             -- PENDENTE DE VALIDAÇÃO
  itens_incluidos     jsonb,            -- PENDENTE DE VALIDAÇÃO
  itens_nao_incluidos jsonb,
  condicoes           text,             -- PENDENTE DE VALIDAÇÃO
  ordem               int not null default 0,
  ativo               boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ------------------------------------------------------------
-- lotes_encontro27
-- Fase comercial de uma modalidade (preço, quantidade, período).
-- Uma modalidade pode ter vários lotes; preço/link sempre vêm daqui,
-- nunca fixos no front-end.
-- ------------------------------------------------------------
create table if not exists public.lotes_encontro27 (
  id                     uuid primary key default gen_random_uuid(),
  modalidade_id          uuid not null references public.modalidades_encontro27(id) on delete cascade,
  nome                   text not null default 'Lote 1',
  preco                  numeric(10, 2),              -- PENDENTE DE VALIDAÇÃO
  quantidade             int,                         -- PENDENTE DE VALIDAÇÃO (null = sem limite definido)
  quantidade_vendida     int not null default 0,
  inicio_venda           timestamptz,
  fim_venda              timestamptz,
  status                 text not null default 'ativo', -- ativo | encerrado | esgotado
  hypercash_checkout_url text,                        -- PENDENTE DE VALIDAÇÃO: link hospedado da Hypercash
  ordem                  int not null default 0,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint lotes_encontro27_quantidade_check
    check (quantidade is null or quantidade_vendida <= quantidade)
);

create index if not exists idx_lotes_encontro27_modalidade on public.lotes_encontro27(modalidade_id);

-- ------------------------------------------------------------
-- pedidos_encontro27
-- Pedido de compra. Guarda o valor no momento da compra — alterações
-- futuras de preço no lote não afetam pedidos já criados.
-- ------------------------------------------------------------
create table if not exists public.pedidos_encontro27 (
  id                        uuid primary key default gen_random_uuid(),
  comprador_nome            text not null,
  comprador_email           text not null,
  comprador_whatsapp        text not null,
  lote_id                   uuid not null references public.lotes_encontro27(id),
  quantidade                int not null default 1,
  valor_unitario_registrado numeric(10, 2) not null,
  valor_total               numeric(10, 2) not null,
  status_pagamento          text not null default 'aguardando_pagamento',
                            -- aguardando_pagamento | aprovado | recusado | cancelado | reembolsado
  hypercash_url_usado       text,
  utm_source                text,
  utm_medium                text,
  utm_campaign              text,
  utm_term                  text,
  utm_content               text,
  aceite_termos             boolean not null default false,
  aceite_termos_em          timestamptz,
  tem_problema_estoque      boolean not null default false, -- oversell detectado na aprovação; revisar manualmente, não reverte a venda
  confirmado_por            uuid references public.profiles_encontro27(uuid),
  confirmado_em             timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint pedidos_encontro27_quantidade_check check (quantidade > 0 and quantidade <= 20),
  -- Tolerância de 1 centavo em vez de igualdade exata: evita falha de insert por
  -- arredondamento de ponto flutuante no cálculo feito no client (JS).
  constraint pedidos_encontro27_valor_total_check
    check (abs(valor_total - round(quantidade * valor_unitario_registrado, 2)) < 0.01)
);

create index if not exists idx_pedidos_encontro27_email  on public.pedidos_encontro27(comprador_email);
create index if not exists idx_pedidos_encontro27_status on public.pedidos_encontro27(status_pagamento);
create index if not exists idx_pedidos_encontro27_lote   on public.pedidos_encontro27(lote_id);

-- ------------------------------------------------------------
-- participantes_encontro27
-- Um participante = um ingresso emitido. identificador_unico é o
-- próprio conteúdo do QR Code — não existe tabela separada de QR.
-- ------------------------------------------------------------
create table if not exists public.participantes_encontro27 (
  id                  uuid primary key default gen_random_uuid(),
  pedido_id           uuid not null references public.pedidos_encontro27(id) on delete cascade,
  nome                text not null,
  email               text,
  identificador_unico uuid not null unique default gen_random_uuid(),
  check_in_status     boolean not null default false,
  check_in_em         timestamptz,
  check_in_por        uuid references public.profiles_encontro27(uuid),
  created_at          timestamptz not null default now()
);

create index if not exists idx_participantes_encontro27_pedido on public.participantes_encontro27(pedido_id);

-- ------------------------------------------------------------
-- Conteúdo do site público (editável pelo admin)
-- ------------------------------------------------------------
create table if not exists public.palestrantes_encontro27 (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  funcao     text,
  bio        text,
  foto_url   text,
  ordem      int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.programacao_encontro27 (
  id             uuid primary key default gen_random_uuid(),
  dia            int not null default 1,
  horario        time,
  atividade      text not null,
  palestrante_id uuid references public.palestrantes_encontro27(id) on delete set null,
  local          text,
  ordem          int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.faq_encontro27 (
  id         uuid primary key default gen_random_uuid(),
  pergunta   text not null,
  resposta   text,             -- PENDENTE DE VALIDAÇÃO
  tema       text,
  ordem      int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- tracking_events_encontro27
-- Funil próprio, complementar ao GA4/GTM (capítulo 10).
-- ------------------------------------------------------------
create table if not exists public.tracking_events_encontro27 (
  id         uuid primary key default gen_random_uuid(),
  event_name text not null,
  pedido_id  uuid references public.pedidos_encontro27(id) on delete set null,
  session_id text,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tracking_events_encontro27_name on public.tracking_events_encontro27(event_name);
