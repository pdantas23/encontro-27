"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const LINKS = [
  { href: "/minha-conta", label: "Resumo" },
  { href: "/minha-conta/ingressos", label: "Meus ingressos" },
  { href: "/minha-conta/compras", label: "Minhas compras" },
  { href: "/minha-conta/dados", label: "Meus dados" },
];

export function MinhaContaNav() {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.replace(`${basePath}/`);
  }

  return (
    <nav aria-label="Minha conta" className="border-b border-border">
      <div className="container-site flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex min-h-11 items-center text-[15px] text-marrom hover:text-vinho"
          >
            {link.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="ml-auto inline-flex min-h-11 items-center text-[15px] text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro"
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
