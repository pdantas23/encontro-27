"use client";

import Link from "next/link";
import { CTAButton } from "@/components/ui/CTAButton";
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
    <div className="max-w-2xl">
      <p className="rotulo-secao text-ambar-texto">Etapa {step} de 2</p>
      <span aria-hidden="true" className="filete mt-4" />

      <h1 className="font-display text-heading mt-5 text-3xl sm:text-4xl leading-[1.1]">{lote.modalidade.nome}</h1>
      <p className="mt-2 text-marrom-suave">{lote.nome}</p>

      {/* Resumo sempre visível — preço e total nunca ficam só na última etapa */}
      <dl className="mt-8 rounded-card border border-border bg-areia px-5 py-4 text-[15px]">
        <div className="flex justify-between gap-4 py-1">
          <dt className="text-marrom">Valor</dt>
          <dd className="text-marrom">{formatCurrencyBRL(precoUnitario)}</dd>
        </div>
        <div className="flex justify-between gap-4 py-1">
          <dt className="text-marrom">Quantidade</dt>
          <dd className="text-marrom">1 ingresso por pedido</dd>
        </div>
        <div className="mt-2 flex justify-between gap-4 border-t border-border pt-3">
          <dt className="font-display text-lg text-vinho">Total</dt>
          <dd className="font-display text-lg text-vinho">{formatCurrencyBRL(valorTotal)}</dd>
        </div>
      </dl>

      {step === 1 && (
        <form onSubmit={handleSubmitComprador(handleComprador)} className="mt-10">
          <h2 className="font-display text-2xl text-heading">Seus dados</h2>
          <p className="mt-2 text-marrom">O ingresso será emitido em seu nome.</p>

          <div className="mt-6 flex flex-col gap-4">
            <div>
              <label>
                Nome completo
                <input autoComplete="name" {...registerComprador("nome")} />
              </label>
              {compradorErrors.nome && <p className="mt-2 border-l-2 border-vermelho pl-3 text-sm text-marrom">{compradorErrors.nome.message}</p>}
            </div>
            <div>
              <label>
                E-mail
                <input type="email" autoComplete="email" {...registerComprador("email")} />
              </label>
              {compradorErrors.email && <p className="mt-2 border-l-2 border-vermelho pl-3 text-sm text-marrom">{compradorErrors.email.message}</p>}
            </div>
            <div>
              <label>
                WhatsApp (com DDD)
                <input inputMode="tel" autoComplete="tel" {...registerComprador("whatsapp")} />
              </label>
              {compradorErrors.whatsapp && <p className="mt-2 border-l-2 border-vermelho pl-3 text-sm text-marrom">{compradorErrors.whatsapp.message}</p>}
            </div>
          </div>

          <CTAButton type="submit" size="lg" className="mt-8 w-full sm:w-auto">
            Continuar
          </CTAButton>
        </form>
      )}

      {step === 2 && comprador && (
        <div className="mt-10">
          <h2 className="font-display text-2xl text-heading">Resumo e pagamento</h2>

          <dl className="mt-6 divide-y divide-border border-y border-border text-[15px]">
            <div className="flex flex-wrap justify-between gap-2 py-3">
              <dt className="text-marrom-suave">Comprador</dt>
              <dd className="text-marrom">{comprador.nome} ({comprador.email})</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2 py-3">
              <dt className="text-marrom-suave">Participante</dt>
              <dd className="text-marrom">{comprador.nome}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2 py-3">
              <dt className="text-marrom-suave">Valor total</dt>
              <dd className="font-display text-lg text-vinho">{formatCurrencyBRL(valorTotal)}</dd>
            </div>
          </dl>

          <p className="mt-6 text-[17px] leading-7 text-marrom">
            Ao confirmar, você será direcionado para o pagamento seguro na Hypercash. O ingresso é liberado assim
            que o pagamento for aprovado.
          </p>

          <label className="mt-6 flex items-start gap-3 font-normal text-marrom">
            <input
              type="checkbox"
              checked={aceiteTermos}
              onChange={(event) => setAceiteTermos(event.target.checked)}
              className="mt-1 size-5 shrink-0 accent-[var(--color-ambar-escuro)]"
            />
            <span>
              Li e aceito os{" "}
              <Link href="/termos" className="text-vinho underline underline-offset-4 decoration-ambar">
                termos de compra
              </Link>
              .
            </span>
          </label>

          {erro && (
            <p role="alert" className="mt-5 border-l-2 border-vermelho pl-4 text-marrom">
              {erro}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse sm:justify-end">
            <CTAButton
              type="button"
              size="lg"
              onClick={handleConfirmar}
              disabled={enviando || !aceiteTermos}
            >
              {enviando ? "Enviando…" : pedidoPendente ? "Tentar novamente" : "Confirmar e ir para pagamento"}
            </CTAButton>
            <CTAButton
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => setStep(1)}
              disabled={enviando || pedidoPendente !== null}
            >
              Voltar
            </CTAButton>
          </div>
        </div>
      )}
    </div>
  );
}
