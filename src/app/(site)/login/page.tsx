"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
    <main style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h1>Minha conta</h1>
      <p>Acesse com o e-mail usado na compra do seu ingresso — sem senha, você recebe um link por e-mail.</p>

      {status === "enviado" ? (
        <p>
          Enviamos um link de acesso para <strong>{email}</strong>. Abra seu e-mail e clique no link para entrar.
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
          <label>
            E-mail
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={{ display: "block", width: "100%" }}
            />
          </label>
          {status === "erro" && <p style={{ color: "crimson" }}>Não foi possível enviar o link. Tente novamente.</p>}
          <button type="submit" disabled={status === "enviando"}>
            {status === "enviando" ? "Enviando..." : "Receber link de acesso"}
          </button>
        </form>
      )}
    </main>
  );
}
