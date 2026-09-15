import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const STORAGE_KEY = "encontro27-auth";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 1 dia — sessão expira sozinha após esse período

/**
 * Wrapper sobre localStorage que expira a sessão salva após SESSION_TTL_MS,
 * mesmo que o navegador nunca seja fechado. Sem servidor (output: export),
 * este é o único lugar onde a sessão do Supabase Auth vive.
 */
function createTTLStorage() {
  return {
    getItem(key: string) {
      if (typeof window === "undefined") return null;
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      try {
        const { value, expiresAt } = JSON.parse(raw) as { value: string; expiresAt: number };
        if (Date.now() > expiresAt) {
          window.localStorage.removeItem(key);
          return null;
        }
        return value;
      } catch {
        window.localStorage.removeItem(key);
        return null;
      }
    },
    setItem(key: string, value: string) {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(key, JSON.stringify({ value, expiresAt: Date.now() + SESSION_TTL_MS }));
    },
    removeItem(key: string) {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(key);
    },
  };
}

let client: SupabaseClient<Database> | undefined;

/** Cliente Supabase do browser. Singleton — sempre a mesma instância na aba. */
export function createClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórios.");
  }

  client = createSupabaseClient<Database>(url, anonKey, {
    auth: {
      storageKey: STORAGE_KEY,
      storage: createTTLStorage(),
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return client;
}
