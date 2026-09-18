"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { usePathname } from "next/navigation";
import { ChartColumn, LayoutDashboard, LogOut, Package, QrCode, ShoppingBag, Users, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AdminUser } from "@/hooks/useAdminAuth";
import { cn, assetPath } from "@/lib/utils";
import { PageTransition } from "@/components/layout/PageTransition";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** A role 'staff' (equipe de campo) só enxerga os itens marcados aqui. */
  staff?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/check-in", label: "Check-in", icon: QrCode, staff: true },
  { href: "/admin/relatorios", label: "Relatórios", icon: ChartColumn },
  { href: "/admin/equipe", label: "Equipe", icon: Users },
];

export function AdminLayout({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navId = useId();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.replace(`${basePath}/admin/login`);
  }

  const staff = user.role === "staff";
  const itens = staff ? NAV_ITEMS.filter((item) => item.staff) : NAV_ITEMS;
  const inicio = staff ? "/admin/check-in" : "/admin/dashboard";

  const nav = (
    <nav aria-label="Painel" className="flex flex-col gap-1">
      {itens.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={() => setOpen(false)}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
              active ? "bg-areia text-vinho" : "text-marrom hover:bg-areia/60 hover:text-vinho",
            )}
          >
            <item.icon aria-hidden="true" className="size-[18px] shrink-0" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const userBox = (
    <div className="flex items-center gap-2 border-t border-border pt-4">
      <p className="min-w-0 flex-1 truncate text-xs font-semibold text-vinho" title={user.email}>
        {user.email}
      </p>
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Sair"
        title="Sair"
        className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-marrom-suave transition-colors hover:bg-areia hover:text-vinho"
      >
        <LogOut className="size-4" strokeWidth={1.75} />
      </button>
    </div>
  );

  return (
    <div className="admin-shell min-h-screen bg-papel lg:grid lg:grid-cols-[240px_1fr]">
      {/* Barra superior (mobile) */}
      <header className="sticky top-0 z-30 grid h-14 grid-cols-[2.75rem_1fr_2.75rem] items-center border-b border-border bg-papel/95 px-4 backdrop-blur lg:hidden">
        <span aria-hidden="true" />
        <div className="flex justify-center">
          <Brand href={inicio} />
        </div>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-pill text-vinho hover:bg-areia"
          aria-expanded={open}
          aria-controls={navId}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </header>
      <div id={navId} hidden={!open} className="border-b border-border bg-papel px-4 py-4 lg:hidden">
        {nav}
        <div className="mt-4">{userBox}</div>
      </div>

      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:flex-col lg:border-r lg:border-border lg:bg-areia/30 lg:p-5">
        <div className="mb-6 flex justify-center">
          <Brand href={inicio} />
        </div>
        <div className="flex-1">{nav}</div>
        {userBox}
      </aside>

      <main className="admin-content min-w-0 px-4 py-6 sm:px-8 sm:py-8">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}

function Brand({ href }: { href: string }) {
  return (
    <Link href={href} aria-label="O Encontro, painel administrativo" className="inline-flex min-h-11 items-center">
      <Image src={assetPath("/brand/flor-ouro-sm.webp")} alt="" width={64} height={64} className="size-9" />
    </Link>
  );
}
