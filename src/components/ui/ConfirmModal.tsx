"use client";

import { AnimatePresence, motion } from "framer-motion";

interface Props {
  aberto: boolean;
  titulo: string;
  descricao?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  confirmando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmModal({
  aberto,
  titulo,
  descricao,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  confirmando = false,
  onConfirmar,
  onCancelar,
}: Props) {
  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onCancelar}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-titulo"
            className="w-full max-w-sm rounded-card bg-papel p-6 shadow-card"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="confirm-modal-titulo" className="font-display text-xl text-heading">
              {titulo}
            </h2>
            {descricao && <p className="mt-3 text-[15px] leading-6 text-marrom">{descricao}</p>}

            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={onCancelar}
                disabled={confirmando}
                className="cursor-pointer text-marrom-suave hover:text-vinho disabled:cursor-default disabled:opacity-50"
              >
                {textoCancelar}
              </button>
              <button
                type="button"
                onClick={onConfirmar}
                disabled={confirmando}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-pill bg-ambar-escuro px-5 font-semibold text-papel hover:bg-ambar-pressed disabled:cursor-default disabled:opacity-50"
              >
                {confirmando ? "Confirmando…" : textoConfirmar}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
