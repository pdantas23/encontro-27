"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PerfilRole } from "@/types/database";

export interface AdminUser {
  userId: string;
  email: string;
  role: PerfilRole;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Guarda de acesso para páginas de /admin. Sem sessão, ou sem um perfil
 * válido em profiles_encontro27 (role comercial|marketing), redireciona
 * para /admin/login. Usa window.location.replace (não router.replace)
 * porque o build é export estático — ver RCO-LP-BLUEPRINT.md.
 */
export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        window.location.replace(`${basePath}/admin/login`);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles_encontro27")
        .select("role")
        .eq("uuid", authUser.id)
        .maybeSingle();

      if (!active) return;

      if (!profile || (profile.role !== "comercial" && profile.role !== "marketing")) {
        window.location.replace(`${basePath}/admin/login`);
        return;
      }

      setUser({ userId: authUser.id, email: authUser.email ?? "", role: profile.role as PerfilRole });
      setLoading(false);
    }

    checkAuth();

    return () => {
      active = false;
    };
  }, []);

  return { user, loading };
}
