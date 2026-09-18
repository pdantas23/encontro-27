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

// ⚠️ TEMPORÁRIO — só pra pré-visualização local do painel admin, pedido pelo
// usuário. NÃO COMMITAR assim. Pula a checagem de sessão/perfil e libera
// /admin/** direto. Ver PENDENCIAS-PREVIEW.md. Voltar pra false (ou apagar o
// bloco) assim que a visualização acabar.
const PREVIEW_FAKE = true;
const ADMIN_FAKE: AdminUser = { userId: "00000000-0000-0000-0000-000000000000", email: "preview@oencontro.com.br", role: "comercial" };

/**
 * Guarda de acesso para páginas de /admin. Sem sessão, ou sem um perfil
 * válido em profiles_encontro27, redireciona para /admin/login. A role
 * 'staff' só entra nas páginas que pedem `permitirStaff` (hoje, o check-in);
 * em qualquer outra é levada pro check-in. Usa window.location.replace (não
 * router.replace) porque o build é export estático — ver RCO-LP-BLUEPRINT.md.
 */
export function useAdminAuth({ permitirStaff = false }: { permitirStaff?: boolean } = {}) {
  const [user, setUser] = useState<AdminUser | null>(PREVIEW_FAKE ? ADMIN_FAKE : null);
  const [loading, setLoading] = useState(!PREVIEW_FAKE);

  useEffect(() => {
    if (PREVIEW_FAKE) return;

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

      if (!profile || (profile.role !== "comercial" && profile.role !== "marketing" && profile.role !== "staff")) {
        window.location.replace(`${basePath}/admin/login`);
        return;
      }

      if (profile.role === "staff" && !permitirStaff) {
        window.location.replace(`${basePath}/admin/check-in`);
        return;
      }

      setUser({ userId: authUser.id, email: authUser.email ?? "", role: profile.role as PerfilRole });
      setLoading(false);
    }

    checkAuth();

    return () => {
      active = false;
    };
  }, [permitirStaff]);

  return { user, loading };
}
