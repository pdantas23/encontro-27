"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CTAButton } from "@/components/ui/CTAButton";
import { assetPath } from "@/lib/utils";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const errorId = useId();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !data.user) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles_encontro27")
      .select("role")
      .eq("uuid", data.user.id)
      .maybeSingle();

    if (!profile || (profile.role !== "comercial" && profile.role !== "marketing")) {
      await supabase.auth.signOut();
      setError("Acesso não autorizado para este e-mail.");
      setLoading(false);
      return;
    }

    window.location.replace(`${basePath}/admin/dashboard`);
  }

  return (
    <main className="min-h-screen bg-botanico flex items-center justify-center px-4 py-12">
      <div aria-hidden="true" className="fixed inset-0 bg-papel/75" />
      <section className="relative w-full max-w-sm rounded-card border border-border bg-papel p-8 shadow-card">
        <div className="flex flex-col items-center text-center">
          <Image src={assetPath("/brand/flor-ouro-sm.webp")} alt="" width={40} height={38} priority className="size-12" />
          <p className="eyebrow text-ambar-texto mt-4">O Encontro 2027</p>
          <h1 className="font-display text-vinho text-3xl mt-1">Painel administrativo</h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" aria-describedby={error ? errorId : undefined}>
          <label>
            E-mail
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? (
            <p id={errorId} role="alert" className="rounded-xl border border-vermelho/30 bg-vermelho/5 px-4 py-3 text-sm text-vermelho">
              {error}
            </p>
          ) : null}

          <CTAButton type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </CTAButton>
        </form>

        <p className="mt-6 text-center text-xs text-marrom-suave">Acesso restrito à organização do evento.</p>
      </section>
    </main>
  );
}
