-- ============================================================
-- Migration 0007 — Storage da foto de perfil (Meus dados)
-- Bucket público (a foto só precisa ser vista, não é dado sensível);
-- cada usuário só grava/apaga dentro da própria pasta (<uid>/...),
-- garantido pelo path check nas policies de storage.objects — mesmo
-- padrão de bucket por usuário usado em qualquer projeto Supabase.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatares-encontro27',
  'avatares-encontro27',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists avatares_encontro27_select_public on storage.objects;
create policy avatares_encontro27_select_public on storage.objects
  for select
  using (bucket_id = 'avatares-encontro27');

drop policy if exists avatares_encontro27_insert_own on storage.objects;
create policy avatares_encontro27_insert_own on storage.objects
  for insert
  with check (
    bucket_id = 'avatares-encontro27'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatares_encontro27_update_own on storage.objects;
create policy avatares_encontro27_update_own on storage.objects
  for update
  using (
    bucket_id = 'avatares-encontro27'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatares_encontro27_delete_own on storage.objects;
create policy avatares_encontro27_delete_own on storage.objects
  for delete
  using (
    bucket_id = 'avatares-encontro27'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ------------------------------------------------------------
-- ROLLBACK (executar manualmente se precisar voltar):
--   drop policy if exists avatares_encontro27_select_public on storage.objects;
--   drop policy if exists avatares_encontro27_insert_own on storage.objects;
--   drop policy if exists avatares_encontro27_update_own on storage.objects;
--   drop policy if exists avatares_encontro27_delete_own on storage.objects;
--   delete from storage.buckets where id = 'avatares-encontro27';
-- ------------------------------------------------------------
