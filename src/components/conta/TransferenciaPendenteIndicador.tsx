"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  transferenciaId: string;
  paraEmail: string;
  onCancelada: () => void;
}

export function TransferenciaPendenteIndicador({ transferenciaId, paraEmail, onCancelada }: Props) {
  const [cancelando, setCancelando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleCancelar() {
    setCancelando(true);
    setErro(null);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("cancelar_transferencia_titularidade_encontro27", {
      p_transferencia_id: transferenciaId,
    });

    setCancelando(false);

    const resultado = data as { ok: boolean } | null;
    if (error || !resultado?.ok) {
      setErro("Não foi possível cancelar a transferência. Tente novamente.");
      return;
    }

    onCancelada();
  }

  return (
    <div className="mt-5 rounded-lg border border-dourado-linha bg-areia px-4 py-3 text-center">
      <p className="text-[14px] text-marrom">
        Transferência pendente para <strong className="text-vinho">{paraEmail}</strong>, aguardando aceite.
      </p>

      {erro && (
        <p role="alert" className="mt-2 text-sm text-vermelho">
          {erro}
        </p>
      )}

      <div className="mt-2 flex justify-center">
        <button
          type="button"
          onClick={handleCancelar}
          disabled={cancelando}
          className="cursor-pointer text-[14px] text-marrom-suave underline underline-offset-4 decoration-ambar hover:text-vermelho disabled:opacity-50"
        >
          {cancelando ? "Cancelando…" : "Cancelar transferência"}
        </button>
      </div>
    </div>
  );
}
