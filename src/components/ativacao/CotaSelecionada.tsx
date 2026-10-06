"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isCotaId, type CotaId } from "./conteudo";

export const ID_INTERESSE = "interesse";
const PARAM = "cota";

interface CotaSelecionadaContexto {
  cotaId: CotaId | null;
  /** Só marca a cota (ex.: troca no seletor da área de interesse). */
  escolher: (id: CotaId) => void;
  /** Marca a cota e leva o visitante até a área de interesse (CTA dos cards). */
  escolherEIrParaInteresse: (id: CotaId) => void;
}

const Contexto = createContext<CotaSelecionadaContexto | null>(null);

/**
 * Estado da cota escolhida, compartilhado entre os cards e a área de
 * interesse. Fica espelhado em `?cota=cota-03` na URL: sobrevive a recarregar
 * a página e permite mandar o link já com a cota marcada. Nada é enviado
 * para fora — o mecanismo de contato ainda não foi definido.
 */
export function CotaSelecionadaProvider({ children }: { children: ReactNode }) {
  const [cotaId, setCotaId] = useState<CotaId | null>(null);

  // Export estático: a query só existe no navegador, depois da hidratação.
  useEffect(() => {
    const inicial = new URLSearchParams(window.location.search).get(PARAM);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com a URL uma única vez
    if (isCotaId(inicial)) setCotaId(inicial);
  }, []);

  const escolher = useCallback((id: CotaId) => {
    setCotaId(id);
    const url = new URL(window.location.href);
    url.searchParams.set(PARAM, id);
    window.history.replaceState(window.history.state, "", url);
  }, []);

  const escolherEIrParaInteresse = useCallback(
    (id: CotaId) => {
      escolher(id);
      const destino = document.getElementById(ID_INTERESSE);
      if (!destino) return;
      const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      destino.scrollIntoView({ behavior: reduzir ? "auto" : "smooth", block: "start" });
      // Leva o foco junto, para teclado e leitor de tela.
      destino.querySelector<HTMLElement>("[data-foco-interesse]")?.focus({ preventScroll: true });
    },
    [escolher],
  );

  const valor = useMemo(() => ({ cotaId, escolher, escolherEIrParaInteresse }), [cotaId, escolher, escolherEIrParaInteresse]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCotaSelecionada() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useCotaSelecionada precisa estar dentro de <CotaSelecionadaProvider>");
  return ctx;
}

/** CTA de cada cota: botão real (é ação, não navegação). */
export function BotaoInteresseCota({ id, nome, className }: { id: CotaId; nome: string; className?: string }) {
  const { escolherEIrParaInteresse } = useCotaSelecionada();
  return (
    <button type="button" onClick={() => escolherEIrParaInteresse(id)} data-cota={id} className={className}>
      Tenho interesse
      <span className="sr-only"> na {nome}</span>
    </button>
  );
}
