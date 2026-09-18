-- ============================================================
-- Migration 0010 — RPC dedicada para "Meus ingressos"
-- meus_pedidos_encontro27 (0002) lista por comprador_email — é o
-- histórico de COMPRA ("Minhas compras"), não deve mudar com transferências.
-- "Meus ingressos" precisa listar por participantes_encontro27.email — quem
-- SEGURA o ingresso agora, o que muda quando uma transferência é aceita
-- (migration 0009). Por isso vira uma RPC própria, e meus_pedidos_encontro27
-- volta à forma original (sem o campo de transferência pendente que a 0009
-- tinha adicionado nela por engano).
-- ============================================================

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

-- ------------------------------------------------------------
-- meus_ingressos_encontro27 — ingressos que a sessão atual SEGURA,
-- independente de quem pagou (por participante.email, não comprador_email).
-- ------------------------------------------------------------
create or replace function public.meus_ingressos_encontro27()
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
           'identificador_unico', part.identificador_unico,
           'nome', part.nome,
           'check_in_status', part.check_in_status,
           'status_pagamento', p.status_pagamento,
           'modalidade_nome', m.nome,
           'transferencia_pendente', (
             select jsonb_build_object('id', t.id, 'para_email', t.para_email)
             from public.transferencias_titularidade_encontro27 t
             where t.participante_id = part.id and t.status = 'pendente'
             limit 1
           )
         ) order by p.created_at desc), '[]'::jsonb)
    into v_result
    from public.participantes_encontro27 part
    join public.pedidos_encontro27 p on p.id = part.pedido_id
    join public.lotes_encontro27 l on l.id = p.lote_id
    join public.modalidades_encontro27 m on m.id = l.modalidade_id
    where lower(part.email) = lower(v_email);

  return v_result;
end;
$$;

grant execute on function public.meus_ingressos_encontro27() to authenticated;

-- ------------------------------------------------------------
-- ROLLBACK (executar manualmente se precisar voltar):
--   drop function if exists public.meus_ingressos_encontro27();
--   (meus_pedidos_encontro27 já está na forma "original" — nada a reverter)
-- ------------------------------------------------------------
