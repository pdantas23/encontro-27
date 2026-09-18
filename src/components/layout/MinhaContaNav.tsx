"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { assetPath, cn } from "@/lib/utils";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const LINKS = [
  { href: "/minha-conta/ingressos", label: "Meus ingressos" },
  { href: "/minha-conta/compras", label: "Minhas compras" },
];

export function MinhaContaNav() {
  const pathname = usePathname();

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

        {LINKS.map((link) => {
          const active = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-flex min-h-11 items-center text-[15px] transition-colors duration-200",
                active ? "font-semibold text-vinho" : "text-marrom hover:text-vinho",
              )}
            >
              {link.label}
              {active && (
                <motion.span
                  layoutId="minha-conta-nav-indicador"
                  className="absolute inset-x-0 -bottom-4 h-0.5 rounded-full bg-ambar-escuro"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </Link>
          );
        })}

        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/minha-conta/dados"
            aria-label="Meu perfil"
            title="Meu perfil"
            className="inline-flex size-11 items-center justify-center rounded-full text-vinho transition-colors hover:bg-areia"
          >
            <UserCircle className="size-7" strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-11 cursor-pointer items-center text-[15px] text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
