"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type ProgramacaoRow = Database["public"]["Tables"]["programacao_encontro27"]["Row"] & {
  palestrantes_encontro27: { nome: string } | null;
};

export default function ProgramacaoPage() {
  const [itens, setItens] = useState<ProgramacaoRow[] | null | undefined>(undefined);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("programacao_encontro27")
        .select("*, palestrantes_encontro27(nome)")
        .order("dia", { ascending: true })
        .order("ordem", { ascending: true });
      setItens((data as unknown as ProgramacaoRow[]) ?? null);
    }
    load();
  }, []);

  if (itens === undefined) {
    return (
      <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
        <p>Carregando...</p>
      </main>
    );
  }

  if (!itens || itens.length === 0) {
    return (
      <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
        <h1>Programação</h1>
        <p>Programação em breve.</p>
      </main>
    );
  }

  const porDia = new Map<number, ProgramacaoRow[]>();
  for (const item of itens) {
    const lista = porDia.get(item.dia) ?? [];
    lista.push(item);
    porDia.set(item.dia, lista);
  }
  const dias = Array.from(porDia.keys()).sort((a, b) => a - b);

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>Programação</h1>

      {dias.map((dia) => (
        <section key={dia} style={{ marginBottom: 32 }}>
          <h2>Dia {dia}</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 4 }}>Horário</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 4 }}>Atividade</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 4 }}>Palestrante</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 4 }}>Local</th>
              </tr>
            </thead>
            <tbody>
              {(porDia.get(dia) ?? []).map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: 4, borderBottom: "1px solid #eee" }}>
                    {item.horario ?? "A definir"}
                  </td>
                  <td style={{ padding: 4, borderBottom: "1px solid #eee" }}>{item.atividade}</td>
                  <td style={{ padding: 4, borderBottom: "1px solid #eee" }}>
                    {item.palestrantes_encontro27?.nome ?? "—"}
                  </td>
                  <td style={{ padding: 4, borderBottom: "1px solid #eee" }}>{item.local ?? "A definir"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </main>
  );
}
