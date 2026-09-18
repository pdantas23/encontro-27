import type { StatusPagamento } from "@/types/database";

export interface ParticipanteResumo {
  nome: string;
  identificador_unico: string;
  check_in_status: boolean;
}

/** Formato retornado pela RPC obter_pedido_encontro27. */
export interface PedidoResumo {
  id: string;
  status_pagamento: StatusPagamento;
  quantidade: number;
  valor_total: number;
  comprador_nome: string;
  hypercash_url_usado: string | null;
  modalidade_nome: string;
  lote_nome: string;
  participantes: ParticipanteResumo[];
}

/** Formato de cada item retornado pela RPC meus_pedidos_encontro27 (histórico de compra). */
export interface MeuPedido extends Omit<PedidoResumo, "hypercash_url_usado"> {
  comprador_whatsapp: string;
  created_at: string;
}

/** Formato de cada item retornado pela RPC meus_ingressos_encontro27 (o que a sessão segura hoje). */
export interface MeuIngresso {
  identificador_unico: string;
  nome: string;
  check_in_status: boolean;
  status_pagamento: StatusPagamento;
  modalidade_nome: string;
  transferencia_pendente: { id: string; para_email: string } | null;
}

/** Formato de cada item retornado pela RPC minhas_transferencias_pendentes_encontro27. */
export interface TransferenciaPendenteRecebida {
  id: string;
  de_nome: string;
  de_email: string;
  modalidade_nome: string;
  created_at: string;
}

export interface LoteComModalidade {
  id: string;
  nome: string;
  preco: number | null;
  quantidade: number | null;
  quantidade_vendida: number;
  status: string;
  hypercash_checkout_url: string | null;
  modalidade: { slug: string; nome: string; descricao?: string | null };
}
