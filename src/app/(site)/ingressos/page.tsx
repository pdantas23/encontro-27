"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { formatCurrencyBRL } from "@/lib/utils";
import { trackViewTickets, trackSelectTicket } from "@/lib/tracking/events";

type Modalidade = Database["public"]["Tables"]["modalidades_encontro27"]["Row"] & {
  lotes_encontro27: Database["public"]["Tables"]["lotes_encontro27"]["Row"][];
};

export default function IngressosPage() {
  const [modalidades, setModalidades] = useState<Modalidade[] | null | undefined>(undefined);

  useEffect(() => {
    trackViewTickets();
  }, []);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("modalidades_encontro27")
        .select("*, lotes_encontro27(*)")
        .order("ordem", { ascending: true });
      setModalidades((data as unknown as Modalidade[]) ?? null);
    }
    load();
  }, []);

  if (modalidades === undefined) {
    return (
      <main style={{ maxWidth: 960, margin: "40px auto", padding: 16 }}>
        <p>Carregando...</p>
      </main>
    );
  }

  if (!modalidades || modalidades.length === 0) {
    return (
      <main style={{ maxWidth: 960, margin: "40px auto", padding: 16 }}>
        <h1>Ingressos</h1>
        <p>Ingressos em breve.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 960, margin: "40px auto", padding: 16 }}>
      <h1>Ingressos</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {modalidades.map((modalidade) => {
          const loteAtivo = modalidade.lotes_encontro27.find((lote) => lote.status === "ativo") ?? null;
          const compravel = Boolean(loteAtivo?.preco != null && loteAtivo?.hypercash_checkout_url);

          return (
            <div key={modalidade.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
              <h2 style={{ marginTop: 0 }}>
                <Link href={`/ingressos/${modalidade.slug}`}>{modalidade.nome}</Link>
              </h2>
              <p>{modalidade.descricao ?? "Em breve"}</p>
              <p style={{ fontWeight: "bold" }}>
                {loteAtivo?.preco != null ? formatCurrencyBRL(loteAtivo.preco) : "Preço a definir"}
              </p>

              {compravel && loteAtivo ? (
                <Link
                  href={`/checkout?lote=${loteAtivo.id}`}
                  onClick={() => trackSelectTicket(modalidade.slug, modalidade.nome)}
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    background: "#111",
                    color: "#fff",
                    borderRadius: 4,
                    textDecoration: "none",
                  }}
                >
                  Comprar
                </Link>
              ) : (
                <span style={{ color: "#888" }}>Em breve</span>
              )}

              <div style={{ marginTop: 8 }}>
                <Link href={`/ingressos/${modalidade.slug}`}>Ver detalhes</Link>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
