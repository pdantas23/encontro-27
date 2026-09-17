"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { compradorSchema, type CompradorFormValues } from "@/lib/validators/checkout";
import { getStoredUtms } from "@/lib/tracking/utms";
import { trackBeginCheckout, trackAddPaymentInfo } from "@/lib/tracking/events";
import { formatCurrencyBRL } from "@/lib/utils";
import type { LoteComModalidade } from "@/types/checkout";

/**
 * REGRA TEMPORÁRIA — quantidade fixa em 1.
 * O pagamento usa links fixos da Hypercash (um valor por lote), então cada
 * pedido cobre exatamente 1 unidade. A mesma regra vale no banco
 * (migration 0003, policy de insert). Quando a integração Hypercash cobrar
 * por pedido (API + webhook), revisar a policy antes de liberar quantidade > 1.
 */
const QUANTIDADE = 1;

type Step = 1 | 2;

export function CheckoutWizard({ lote }: { lote: LoteComModalidade }) {
  const [step, setStep] = useState<Step>(1);
  const [comprador, setComprador] = useState<CompradorFormValues | null>(null);
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Pedido já gravado (talvez até com participante) mas sem link de
  // pagamento ainda: o "tentar novamente" completa a partir daqui em vez
  // de criar um pedido/participante duplicado.
  const [pedidoPendente, setPedidoPendente] = useState<string | null>(null);
  const [participanteRegistrado, setParticipanteRegistrado] = useState(false);

  const precoUnitario = lote.preco ?? 0;
  const valorTotal = precoUnitario * QUANTIDADE;

  const {
    register: registerComprador,
    handleSubmit: handleSubmitComprador,
    formState: { errors: compradorErrors },
  } = useForm<CompradorFormValues>({
    resolver: zodResolver(compradorSchema),
    defaultValues: comprador ?? undefined,
  });

  function handleComprador(values: CompradorFormValues) {
    if (!comprador) trackBeginCheckout(lote.modalidade.slug, QUANTIDADE);
    setComprador(values);
    setErro(null);
    setStep(2);
  }

  async function irParaPagamento(pedidoId: string) {
    trackAddPaymentInfo(lote.modalidade.slug);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL não configurada");

    const response = await fetch(`${apiUrl}/criar-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pedidoId }),
    });
    const data = (await response.json().catch(() => null)) as { checkoutUrl?: string; error?: string } | null;

    if (!response.ok || !data?.checkoutUrl) {
      throw new Error(data?.error ?? "falha_ao_criar_checkout");
    }

    // Navegação de página inteira proposital: output "export" não tem
    // servidor, e o destino é externo (checkout hospedado pela Hypercash).
    window.location.href = data.checkoutUrl;
  }

  async function handleConfirmar() {
    if (!comprador || !aceiteTermos || enviando) return;
    setEnviando(true);
    setErro(null);

    const supabase = createClient();

    // Espelha pedidoPendente para uso no catch: setPedidoPendente só vale no
    // próximo render, então ler o state aqui diria "não registrado" para um
    // pedido que acabou de ser gravado — e o comprador veria "não foi possível
    // registrar seu pedido" quando na verdade só o link de pagamento falhou.
    let pedidoRegistrado = pedidoPendente;

    try {
      // O id é gerado aqui: o comprador anônimo pode inserir, mas não pode
      // ler pedidos (RLS), então um insert com ".select()" falharia.
      let pedidoId = pedidoPendente;

      if (!pedidoId) {
        const novoId = crypto.randomUUID();
        const utms = getStoredUtms();
        const { error: pedidoError } = await supabase.from("pedidos_encontro27").insert({
          id: novoId,
          comprador_nome: comprador.nome,
          comprador_email: comprador.email,
          comprador_whatsapp: comprador.whatsapp,
          lote_id: lote.id,
          quantidade: QUANTIDADE,
          valor_unitario_registrado: precoUnitario,
          valor_total: valorTotal,
          hypercash_url_usado: lote.hypercash_checkout_url,
          utm_source: utms.utm_source,
          utm_medium: utms.utm_medium,
          utm_campaign: utms.utm_campaign,
          utm_term: utms.utm_term,
          utm_content: utms.utm_content,
          aceite_termos: true,
          aceite_termos_em: new Date().toISOString(),
        });
        if (pedidoError) throw pedidoError;
        pedidoId = novoId;
        pedidoRegistrado = novoId;
        setPedidoPendente(novoId);
      }

      // Com 1 ingresso, o participante é o próprio comprador.
      if (!participanteRegistrado) {
        const { error: participantesError } = await supabase.from("participantes_encontro27").insert({
          pedido_id: pedidoId,
          nome: comprador.nome,
          email: comprador.email,
        });
        if (participantesError) throw participantesError;
        setParticipanteRegistrado(true);
      }

      // Não limpa pedidoPendente antes daqui: se irParaPagamento falhar
      // (Hypercash fora do ar, por exemplo), "Tentar novamente" precisa
      // pular direto pra criação do link, sem duplicar pedido/participante.
      await irParaPagamento(pedidoId);
    } catch {
      setErro(
        pedidoRegistrado
          ? "Seu pedido está registrado, mas não conseguimos gerar o link de pagamento agora. Tente novamente."
          : "Não foi possível registrar seu pedido. Verifique sua conexão e tente novamente.",
      );
      setEnviando(false);
    }
  }

  return (
    <div>
      <h1>{lote.modalidade.nome}</h1>
      <p>{lote.nome}</p>
      <p>Etapa {step} de 2</p>

      {/* Resumo sempre visível — preço e total nunca ficam só na última etapa */}
      <div style={{ border: "1px solid #ddd", padding: 12, margin: "16px 0" }}>
        <p>Valor: {formatCurrencyBRL(precoUnitario)}</p>
        <p>Quantidade: 1 ingresso por pedido</p>
        <p>Total: {formatCurrencyBRL(valorTotal)}</p>
      </div>

      {step === 1 && (
        <form onSubmit={handleSubmitComprador(handleComprador)}>
          <h2>Seus dados</h2>
          <p>O ingresso será emitido em seu nome.</p>
          <label>
            Nome completo
            <input autoComplete="name" {...registerComprador("nome")} />
          </label>
          {compradorErrors.nome && <p style={{ color: "crimson" }}>{compradorErrors.nome.message}</p>}
          <label>
            E-mail
            <input type="email" autoComplete="email" {...registerComprador("email")} />
          </label>
          {compradorErrors.email && <p style={{ color: "crimson" }}>{compradorErrors.email.message}</p>}
          <label>
            WhatsApp (com DDD)
            <input inputMode="tel" autoComplete="tel" {...registerComprador("whatsapp")} />
          </label>
          {compradorErrors.whatsapp && <p style={{ color: "crimson" }}>{compradorErrors.whatsapp.message}</p>}
          <p>
            <button type="submit">Continuar</button>
          </p>
        </form>
      )}

      {step === 2 && comprador && (
        <div>
          <h2>Resumo e pagamento</h2>
          <p>
            Comprador: {comprador.nome} ({comprador.email})
          </p>
          <p>Participante: {comprador.nome}</p>
          <p>Valor total: {formatCurrencyBRL(valorTotal)}</p>
          <p>
            Ao confirmar, você será direcionado para o pagamento seguro na Hypercash. O ingresso é liberado assim
            que o pagamento for aprovado.
          </p>
          <label>
            <input type="checkbox" checked={aceiteTermos} onChange={(event) => setAceiteTermos(event.target.checked)} />{" "}
            Li e aceito os <Link href="/termos">termos de compra</Link>.
          </label>
          {erro && (
            <p role="alert" style={{ color: "crimson" }}>
              {erro}
            </p>
          )}
          <p>
            <button type="button" onClick={() => setStep(1)} disabled={enviando || pedidoPendente !== null}>
              Voltar
            </button>{" "}
            <button type="button" onClick={handleConfirmar} disabled={enviando || !aceiteTermos}>
              {enviando ? "Enviando..." : pedidoPendente ? "Tentar novamente" : "Confirmar e ir para pagamento"}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
