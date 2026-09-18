"use client";

import Link from "next/link";
import Image from "next/image";
import { UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { assetPath } from "@/lib/utils";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const LINKS = [
  { href: "/minha-conta", label: "Resumo" },
  { href: "/minha-conta/ingressos", label: "Meus ingressos" },
  { href: "/minha-conta/compras", label: "Minhas compras" },
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
        <Link href="/" className="inline-flex" aria-label="O Encontro 2027 — página inicial">
          <Image src={assetPath("/brand/flor-ouro-sm.webp")} alt="" width={64} height={64} className="h-9 w-9" />
        </Link>

        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex min-h-11 items-center text-[15px] text-marrom hover:text-vinho"
          >
            {link.label}
          </Link>
        ))}

        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/minha-conta/dados"
            aria-label="Meu perfil"
            title="Meu perfil"
            className="inline-flex size-11 items-center justify-center rounded-full text-vinho hover:bg-areia"
          >
            <UserCircle className="size-7" strokeWidth={1.5} />
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex min-h-11 items-center text-[15px] text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
