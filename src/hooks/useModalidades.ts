"use client";

import { useEffect, useState } from "react";
import { publicSelect } from "@/lib/supabase/publicRest";
import type { Database } from "@/types/database";

export type Lote = Database["public"]["Tables"]["lotes_encontro27"]["Row"];
export type Modalidade = Database["public"]["Tables"]["modalidades_encontro27"]["Row"] & {
  lotes_encontro27: Lote[];
};

export type ModalidadesState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; modalidades: Modalidade[] };

/**
 * Modalidades ativas com seus lotes, na ordem do painel. Fonte única para a
 * seção de ingressos da Home e para /ingressos.
 */
export function useModalidades(): ModalidadesState {
  const [state, setState] = useState<ModalidadesState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    publicSelect<Modalidade>("modalidades_encontro27", "select=*,lotes_encontro27(*)&ativo=eq.true&order=ordem.asc")
      .then((modalidades) => {
        if (!cancelled) setState({ status: "ready", modalidades });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export type DisponibilidadeIngresso = "compravel" | "em_breve" | "esgotado" | "encerrado";

export interface ResumoIngresso {
  disponibilidade: DisponibilidadeIngresso;
  lote: Lote | null;
  /** Vagas restantes quando o lote tem quantidade definida. */
  restantes: number | null;
}

/**
 * Lê o estado comercial de uma modalidade a partir dos lotes — a mesma regra
 * usada no checkout: só é comprável com lote ativo, preço e link de checkout.
 */
export function resumirIngresso(modalidade: Modalidade): ResumoIngresso {
  const lotes = [...modalidade.lotes_encontro27].sort((a, b) => a.ordem - b.ordem);
  const agora = Date.now();

  const ativo =
    lotes.find((l) => {
      if (l.status !== "ativo") return false;
      if (l.inicio_venda && new Date(l.inicio_venda).getTime() > agora) return false;
      if (l.fim_venda && new Date(l.fim_venda).getTime() < agora) return false;
      return true;
    }) ?? null;

  if (ativo) {
    const restantes = ativo.quantidade != null ? Math.max(0, ativo.quantidade - ativo.quantidade_vendida) : null;
    if (restantes === 0) return { disponibilidade: "esgotado", lote: ativo, restantes };
    if (ativo.preco != null && ativo.hypercash_checkout_url) {
      return { disponibilidade: "compravel", lote: ativo, restantes };
    }
    return { disponibilidade: "em_breve", lote: ativo, restantes };
  }

  // Sem lote ativo: se todos os lotes já foram encerrados, a venda acabou;
  // se ainda não há lote (ou só futuros), está por vir.
  const houveVenda = lotes.length > 0 && lotes.every((l) => l.status === "encerrado" || (l.fim_venda && new Date(l.fim_venda).getTime() < agora));
  return { disponibilidade: houveVenda ? "encerrado" : "em_breve", lote: null, restantes: null };
}
