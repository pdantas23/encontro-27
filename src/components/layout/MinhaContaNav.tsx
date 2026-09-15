"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function MinhaContaNav() {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.replace(`${basePath}/`);
  }

  return (
    <nav style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
      <Link href="/minha-conta">Resumo</Link>
      <Link href="/minha-conta/ingressos">Meus ingressos</Link>
      <Link href="/minha-conta/compras">Minhas compras</Link>
      <Link href="/minha-conta/dados">Meus dados</Link>
      <button onClick={handleLogout}>Sair</button>
    </nav>
  );
}
