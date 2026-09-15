"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <main style={{ maxWidth: 360, margin: "80px auto", padding: 16 }}>
      <h1>Painel administrativo</h1>
      <p>O Encontro 2027</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
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
        <label>
          Senha
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{ display: "block", width: "100%" }}
          />
        </label>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
