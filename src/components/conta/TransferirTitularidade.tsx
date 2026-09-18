"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const ERROS: Record<string, string> = {
  sem_sessao: "Sua sessão expirou. Entre novamente para transferir o ingresso.",
  nao_encontrado: "Não foi possível localizar este ingresso.",
  pedido_nao_aprovado: "Este ingresso ainda não está aprovado.",
  checkin_ja_feito: "Este ingresso já fez check-in e não pode mais ser transferido.",
  email_invalido: "Informe um e-mail válido.",
  mesmo_email: "Esse já é o seu e-mail.",
  destino_nao_cadastrado: "Esse e-mail ainda não tem conta cadastrada no site. A pessoa precisa criar uma conta antes.",
  ja_pendente: "Já existe uma transferência pendente para este ingresso.",
};

interface Props {
  identificadorUnico: string;
  onTransferido: () => void;
}

export function TransferirTitularidade({ identificadorUnico, onTransferido }: Props) {
  const [aberto, setAberto] = useState(false);
  const [email, setEmail] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function handleAbrirModal(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setModalAberto(true);
  }

  async function handleConfirmar() {
    setEnviando(true);
    setErro(null);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("solicitar_transferencia_titularidade_encontro27", {
      p_identificador_unico: identificadorUnico,
      p_email_destino: email,
    });

    setEnviando(false);

    const resultado = data as { ok: boolean; erro?: string } | null;

    if (error || !resultado?.ok) {
      setModalAberto(false);
      setErro(ERROS[resultado?.erro ?? ""] ?? "Não foi possível solicitar a transferência. Tente novamente.");
      return;
    }

    setModalAberto(false);
    setAberto(false);
    setEmail("");
    onTransferido();
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-5 inline-flex min-h-11 cursor-pointer items-center text-[15px] text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro"
      >
        Transferir titularidade
      </button>
    );
  }

  return (
    <>
      <motion.form
        onSubmit={handleAbrirModal}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="mt-5 overflow-hidden rounded-lg border border-border bg-papel p-4 text-left"
      >
        <p className="text-[14px] text-marrom-suave">
          Informe o e-mail cadastrado no site de quem vai receber este ingresso. A transferência só se confirma
          quando essa pessoa aceitar.
        </p>

        <label className="mt-3 block text-[14px]">
          E-mail de quem vai receber
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-areia px-3 py-2 text-[15px]"
          />
        </label>

        {erro && (
          <p role="alert" className="mt-3 text-sm text-vermelho">
            {erro}
          </p>
        )}

        <div className="mt-4 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              setAberto(false);
              setErro(null);
            }}
            className="cursor-pointer text-[15px] text-marrom-suave hover:text-vinho"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex min-h-11 cursor-pointer items-center rounded-pill bg-ambar-escuro px-5 font-semibold text-papel hover:bg-ambar-pressed"
          >
            Confirmar transferência
          </button>
        </div>
      </motion.form>

      <ConfirmModal
        aberto={modalAberto}
        titulo="Transferir este ingresso"
        descricao={`Vamos enviar um convite de transferência para ${email}. O ingresso só muda de nome quando essa pessoa aceitar, e você pode cancelar o convite enquanto ele estiver pendente.`}
        textoConfirmar="Confirmar transferência"
        textoCancelar="Cancelar"
        confirmando={enviando}
        onConfirmar={handleConfirmar}
        onCancelar={() => setModalAberto(false)}
      />
    </>
  );
}
