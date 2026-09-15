import { gtmPush } from "./gtm";

/**
 * Eventos do funil (capítulo 10 do levantamento de requisitos).
 * IDs de GA4/GTM/Meta Pixel ainda são PENDENTE DE VALIDAÇÃO — os eventos já
 * disparam para o dataLayer, e as tags que os consomem entram quando os IDs
 * chegarem (nada aqui depende deles).
 */

export function trackPageView(path: string) {
  gtmPush("page_view", { page_path: path });
}

export function trackViewTickets() {
  gtmPush("view_tickets");
}

export function trackSelectTicket(modalidadeSlug: string, modalidadeNome: string) {
  gtmPush("select_ticket", { modalidade_slug: modalidadeSlug, modalidade_nome: modalidadeNome });
}

export function trackBeginCheckout(modalidadeSlug: string, quantidade: number) {
  gtmPush("begin_checkout", { modalidade_slug: modalidadeSlug, quantidade });
}

export function trackAddPaymentInfo(modalidadeSlug: string) {
  gtmPush("add_payment_info", { modalidade_slug: modalidadeSlug });
}

export function trackPurchase(params: {
  pedidoId: string;
  valor: number;
  modalidadeSlug: string;
  loteNome: string;
}) {
  gtmPush("purchase", {
    transaction_id: params.pedidoId,
    value: params.valor,
    currency: "BRL",
    modalidade_slug: params.modalidadeSlug,
    lote: params.loteNome,
  });
}

export function trackFaqInteraction(pergunta: string) {
  gtmPush("faq_interaction", { pergunta });
}

export function trackCheckoutError(motivo: string) {
  gtmPush("checkout_error", { motivo });
}
