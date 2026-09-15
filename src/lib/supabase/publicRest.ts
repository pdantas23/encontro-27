/**
 * Leitura pública (anon) via PostgREST, sem carregar o supabase-js no bundle.
 *
 * A Home só lê tabelas públicas (event_config, modalidades/lotes, palestrantes,
 * faq); o cliente completo (auth, realtime, storage) custa ~240 KB de JS e só é
 * necessário no checkout e nas áreas logadas. A RLS do banco continua sendo
 * a barreira — aqui vai apenas a chave anon, que já é pública no browser.
 */
export async function publicSelect<T>(table: string, query: string): Promise<T[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórios.");
  }

  const res = await fetch(`${url}/rest/v1/${table}?${query}`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`PostgREST ${res.status} em ${table}`);
  return (await res.json()) as T[];
}

/** Primeira linha ou null. */
export async function publicSelectOne<T>(table: string, query: string): Promise<T | null> {
  const rows = await publicSelect<T>(table, `${query}&limit=1`);
  return rows[0] ?? null;
}
