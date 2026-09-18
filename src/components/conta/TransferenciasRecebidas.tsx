"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TransferenciaPendenteRecebida } from "@/types/checkout";

// ⚠️ TEMPORÁRIO — mesmo preview local do useMeusPedidos (ver o aviso lá).
// Some junto quando o bypass for removido.
const PREVIEW_FAKE = true;
const RECEBIDA_FAKE: TransferenciaPendenteRecebida = {
  id: "22222222-3333-4444-5555-666666666666",
  de_nome: "João Pereira",
  de_email: "joao@example.com",
  modalidade_nome: "Start",
  created_at: new Date().toISOString(),
};

interface Props {
  onRespondida: () => void;
}

export function TransferenciasRecebidas({ onRespondida }: Props) {
  const [recebidas, setRecebidas] = useState<TransferenciaPendenteRecebida[]>(PREVIEW_FAKE ? [RECEBIDA_FAKE] : []);
  const [respondendoId, setRespondendoId] = useState<string | null>(null);
  const [erroId, setErroId] = useState<string | null>(null);

  useEffect(() => {
    if (PREVIEW_FAKE) return;

    let ativo = true;

    async function carregar() {
      const supabase = createClient();
      const { data } = await supabase.rpc("minhas_transferencias_pendentes_encontro27");
      if (!ativo) return;
      setRecebidas((data as unknown as TransferenciaPendenteRecebida[] | null) ?? []);
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, []);

  async function responder(id: string, funcao: "aceitar_transferencia_titularidade_encontro27" | "recusar_transferencia_titularidade_encontro27") {
    setRespondendoId(id);
    setErroId(null);

    const supabase = createClient();
    const { data, error } = await supabase.rpc(funcao, { p_transferencia_id: id });

    setRespondendoId(null);

    const resultado = data as { ok: boolean } | null;
    if (error || !resultado?.ok) {
      setErroId(id);
      return;
    }

    setRecebidas((atual) => atual.filter((r) => r.id !== id));
    onRespondida();
  }

  if (recebidas.length === 0) return null;

  return (
    <ul className="mt-6 flex flex-col gap-4">
      {recebidas.map((recebida) => (
        <li key={recebida.id} className="rounded-card border border-dourado-linha bg-areia px-5 py-5">
          <p className="text-[15px] leading-6 text-marrom">
            <strong className="text-vinho">{recebida.de_nome}</strong> quer transferir o ingresso{" "}
            <strong className="text-vinho">{recebida.modalidade_nome}</strong> para você.
          </p>

          {erroId === recebida.id && (
            <p role="alert" className="mt-2 text-sm text-vermelho">
              Não foi possível responder agora. Tente novamente.
            </p>
          )}

          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => responder(recebida.id, "recusar_transferencia_titularidade_encontro27")}
              disabled={respondendoId === recebida.id}
              className="cursor-pointer text-[15px] text-marrom-suave hover:text-vermelho disabled:opacity-50"
            >
              Recusar
            </button>
            <button
              type="button"
              onClick={() => responder(recebida.id, "aceitar_transferencia_titularidade_encontro27")}
              disabled={respondendoId === recebida.id}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-pill bg-ambar-escuro px-5 font-semibold text-papel hover:bg-ambar-pressed disabled:opacity-50"
            >
              {respondendoId === recebida.id ? "Aceitando…" : "Aceitar"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
