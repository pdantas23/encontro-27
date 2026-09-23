-- ============================================================
-- Migration 0012 — Check-in por nome
-- A tela de check-in passa a buscar participante por nome, não só pelo
-- identificador do QR. Staff não pode ler participantes_encontro27 direto
-- (RLS), então essa busca também precisa de uma RPC SECURITY DEFINER, com o
-- mesmo guarda de acesso do checkin_encontro27 (pode_fazer_checkin_encontro27,
-- migration 0011).
--
-- language plpgsql (não sql): ver migration 0005.
-- ============================================================

create or replace function public.buscar_participantes_checkin_encontro27(p_nome text)
returns jsonb
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.pode_fazer_checkin_encontro27() then
    raise exception 'Não autorizado';
  end if;

  if p_nome is null or length(trim(p_nome)) < 2 then
    return '[]'::jsonb;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'identificador_unico', part.identificador_unico,
           'nome', part.nome,
           'modalidade_nome', m.nome,
           'check_in_status', part.check_in_status
         ) order by part.nome), '[]'::jsonb)
    into v_result
    from public.participantes_encontro27 part
    join public.pedidos_encontro27 p on p.id = part.pedido_id
    join public.lotes_encontro27 l on l.id = p.lote_id
    join public.modalidades_encontro27 m on m.id = l.modalidade_id
    where p.status_pagamento = 'aprovado'
      and part.nome ilike '%' || trim(p_nome) || '%'
    limit 10;

  return v_result;
end;
$$;

grant execute on function public.buscar_participantes_checkin_encontro27(text) to authenticated;

-- ------------------------------------------------------------
-- ROLLBACK (executar manualmente se precisar voltar):
--   drop function if exists public.buscar_participantes_checkin_encontro27(text);
-- ------------------------------------------------------------
