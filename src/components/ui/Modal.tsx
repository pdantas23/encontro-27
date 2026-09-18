"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  aberto: boolean;
  titulo: string;
  /** Aparece na mesma linha, logo depois do título (ex.: um selo de status). */
  tituloExtra?: React.ReactNode;
  /** Faixa de texto miúdo no fim da janela. */
  rodape?: React.ReactNode;
  onFechar: () => void;
  larguraMax?: string;
  children: React.ReactNode;
}

/**
 * Janela sobreposta genérica: fecha com Esc, clique fora ou no X; trava a
 * rolagem da página enquanto aberta. Fundo só com blur (sem cor); a janela
 * não rola por dentro — se a tela for baixa demais, é o fundo que rola.
 */
export function Modal({ aberto, titulo, tituloExtra, rodape, onFechar, larguraMax = "max-w-lg", children }: Props) {
  const tituloId = useId();
  const painelRef = useRef<HTMLDivElement>(null);
  const onFecharRef = useRef(onFechar);

  useEffect(() => {
    onFecharRef.current = onFechar;
  });

  useEffect(() => {
    if (!aberto) return;

    const focoAnterior = document.activeElement as HTMLElement | null;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    painelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onFecharRef.current();
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflowAnterior;
      focoAnterior?.focus();
    };
  }, [aberto]);

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onFechar}
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              ref={painelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby={tituloId}
              className={cn(
                "w-full rounded-card border border-border bg-papel p-6 shadow-2xl outline-none",
                larguraMax,
              )}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                  <div id={tituloId} role="heading" aria-level={2} className="text-lg font-bold text-vinho">
                    {titulo}
                  </div>
                  {tituloExtra}
                </div>
                <button
                  type="button"
                  onClick={onFechar}
                  aria-label="Fechar"
                  className="-mt-1 -mr-2 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-marrom-suave transition-colors hover:bg-areia hover:text-vinho"
                >
                  <X aria-hidden="true" className="size-5" />
                </button>
              </div>

              <div className="mt-2">{children}</div>

              {rodape && <div className="mt-5 border-t border-border pt-3 text-xs text-marrom-suave">{rodape}</div>}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
