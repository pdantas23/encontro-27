"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { AdminUser } from "@/hooks/useAdminAuth";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/participantes", label: "Participantes" },
  { href: "/admin/ingressos", label: "Modalidades" },
  { href: "/admin/lotes", label: "Lotes" },
  { href: "/admin/check-in", label: "Check-in" },
  { href: "/admin/relatorios", label: "Relatórios" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export function AdminLayout({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.replace(`${basePath}/admin/login`);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 220, borderRight: "1px solid #ddd", padding: 16 }}>
        <p style={{ fontWeight: 700, marginBottom: 16 }}>O Encontro 2027 — Admin</p>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <hr style={{ margin: "16px 0" }} />
        <p style={{ fontSize: 12, wordBreak: "break-all" }}>{user.email}</p>
        <p style={{ fontSize: 12, color: "#666" }}>{user.role}</p>
        <button onClick={handleLogout} style={{ marginTop: 8 }}>
          Sair
        </button>
      </aside>
      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}
