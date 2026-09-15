"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Palestrante = Database["public"]["Tables"]["palestrantes_encontro27"]["Row"];

export default function ConvidadosPage() {
  const [palestrantes, setPalestrantes] = useState<Palestrante[] | null | undefined>(undefined);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("palestrantes_encontro27")
        .select("*")
        .order("ordem", { ascending: true });
      setPalestrantes(data ?? null);
    }
    load();
  }, []);

  if (palestrantes === undefined) {
    return (
      <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
        <p>Carregando...</p>
      </main>
    );
  }

  if (!palestrantes || palestrantes.length === 0) {
    return (
      <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
        <h1>Convidados</h1>
        <p>Convidados em breve.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>Convidados</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {palestrantes.map((pessoa) => (
          <div key={pessoa.id} style={{ display: "flex", gap: 16, borderBottom: "1px solid #eee", paddingBottom: 16 }}>
            {pessoa.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pessoa.foto_url}
                alt={pessoa.nome}
                style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 8,
                  background: "#eee",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: "#888",
                }}
              >
                Foto em breve
              </div>
            )}
            <div>
              <h2 style={{ margin: 0 }}>{pessoa.nome}</h2>
              <p style={{ margin: "4px 0", color: "#555" }}>{pessoa.funcao ?? "Função a definir"}</p>
              <p style={{ margin: 0 }}>{pessoa.bio ?? "Biografia em breve."}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
