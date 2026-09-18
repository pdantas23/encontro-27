"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CTAButton } from "@/components/ui/CTAButton";
import { PageHeader } from "@/components/layout/PageHeader";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "enviando" | "enviado" | "erro">("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("enviando");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}${basePath}/minha-conta`,
      },
    });

    setStatus(error ? "erro" : "enviado");
  }

  return (
    <>
      <PageHeader
        title="Minha conta"
        description="Acesse com o e-mail usado na compra do seu ingresso — sem senha, você recebe um link por e-mail."
      />

      <main id="conteudo" className="container-site py-10 sm:py-14">
        <div className="max-w-md">
          {status === "enviado" ? (
            <p className="rounded-card border border-dourado/50 bg-areia px-5 py-4 text-[17px] leading-7 text-marrom">
              Enviamos um link de acesso para <strong className="text-vinho">{email}</strong>. Abra seu e-mail e
              clique no link para entrar.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label>
                E-mail
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              {status === "erro" ? (
                <p role="alert" className="border-l-2 border-vermelho pl-4 text-marrom">
                  Não foi possível enviar o link. Tente novamente.
                </p>
              ) : null}

              <CTAButton type="submit" disabled={status === "enviando"} className="mt-2">
                {status === "enviando" ? "Enviando…" : "Receber link de acesso"}
              </CTAButton>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
