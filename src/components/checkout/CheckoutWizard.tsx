"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CTAButton } from "@/components/ui/CTAButton";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getStoredUtms } from "@/lib/tracking/utms";
import { trackBeginCheckout, trackAddPaymentInfo, trackSelectTicket } from "@/lib/tracking/events";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import type { LoteComModalidade } from "@/types/checkout";
import type { PerfilComprador } from "./CheckoutAuthGate";

/**
 * REGRA TEMPORÁRIA — quantidade fixa em 1.
 * O pagamento usa links fixos da Hypercash (um valor por lote), então cada
 * pedido cobre exatamente 1 unidade. A mesma regra vale no banco
 * (migration 0003, policy de insert). Quando a integração Hypercash cobrar
 * por pedido (API + webhook), revisar a policy antes de liberar quantidade > 1.
 */
const QUANTIDADE = 1;

type Step = 1 | 2;

interface Props {
  lote: LoteComModalidade;
  /** Lote do VIP, oferecido só a quem está comprando o Start. */
  upgrade: LoteComModalidade | null;
  perfil: PerfilComprador;
}

export function CheckoutWizard({ lote, upgrade, perfil }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loteEscolhido, setLoteEscolhido] = useState<LoteComModalidade>(lote);
  const [checkoutIniciado, setCheckoutIniciado] = useState(false);
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Pedido já gravado (talvez até com participante) mas sem link de
  // pagamento ainda: o "tentar novamente" completa a partir daqui em vez
  // de criar um pedido/participante duplicado.
  const [pedidoPendente, setPedidoPendente] = useState<string | null>(null);
  const [participanteRegistrado, setParticipanteRegistrado] = useState(false);

  const precoUnitario = loteEscolhido.preco ?? 0;
  const valorTotal = precoUnitario * QUANTIDADE;

  // Nome e WhatsApp vêm do cadastro da conta (não são mais pedidos aqui). Contas
  // antigas, criadas sem esses dados, precisam completar o perfil antes de comprar.
  const comprador =
    perfil.nome && perfil.whatsapp ? { email: perfil.email, nome: perfil.nome, whatsapp: perfil.whatsapp } : null;

  function escolherIngresso(escolhido: LoteComModalidade) {
    if (escolhido.id === loteEscolhido.id) return;
    setLoteEscolhido(escolhido);
    trackSelectTicket(escolhido.modalidade.slug, escolhido.modalidade.nome);
  }

  function handleContinuar() {
    if (!checkoutIniciado) {
      trackBeginCheckout(loteEscolhido.modalidade.slug, QUANTIDADE);
      setCheckoutIniciado(true);
    }
    setErro(null);
    setStep(2);
  }

  async function irParaPagamento(pedidoId: string, email: string, abaPagamento: Window | null) {
    trackAddPaymentInfo(loteEscolhido.modalidade.slug);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL não configurada");

    const response = await fetch(`${apiUrl}/criar-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pedidoId }),
    });
    const data = (await response.json().catch(() => null)) as { checkoutUrl?: string; error?: string } | null;

    if (!response.ok || !data?.checkoutUrl) {
      abaPagamento?.close();
      throw new Error(data?.error ?? "falha_ao_criar_checkout");
    }

    // Paga numa aba nova; a aba atual fica na nossa tela de status, que já
    // consulta sozinha até o webhook aprovar (ver PedidoStatus) — a Hypercash
    // não devolve o comprador pra uma URL nossa depois do pagamento.
    if (abaPagamento) {
      abaPagamento.location.href = data.checkoutUrl;
    } else {
      // Bloqueador de pop-up impediu abrir a aba (raro, já que window.open
      // roda no mesmo clique do usuário): cai pro comportamento antigo.
      window.location.href = data.checkoutUrl;
      return;
    }

    router.push(`/checkout/pendente?pedido=${pedidoId}&email=${encodeURIComponent(email)}`);
  }

  async function handleConfirmar() {
    if (!comprador || !aceiteTermos || enviando) return;
    setEnviando(true);
    setErro(null);

    // Abre a aba já aqui, ainda síncrono dentro do clique do usuário — depois
    // de um `await`, o navegador não reconhece mais como ação direta e
    // bloqueia o window.open como pop-up.
    const abaPagamento = window.open("", "_blank");

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
          lote_id: loteEscolhido.id,
          quantidade: QUANTIDADE,
          valor_unitario_registrado: precoUnitario,
          valor_total: valorTotal,
          hypercash_url_usado: loteEscolhido.hypercash_checkout_url,
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
      await irParaPagamento(pedidoId, comprador.email, abaPagamento);
    } catch {
      abaPagamento?.close();
      setErro(
        pedidoRegistrado
          ? "Seu pedido está registrado, mas não conseguimos gerar o link de pagamento agora. Tente novamente."
          : "Não foi possível registrar seu pedido. Verifique sua conexão e tente novamente.",
      );
      setEnviando(false);
    }
  }

  if (!comprador) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-heading text-3xl sm:text-4xl leading-[1.1]">Complete seu cadastro</h1>
        <p className="mt-4 text-[17px] leading-7 text-marrom">
          Para emitir o ingresso, precisamos do seu nome e WhatsApp, e a sua conta ainda não tem esses dados.
        </p>
        <CTAButton href="/minha-conta/dados" size="lg" className="mt-8">
          Completar meus dados
        </CTAButton>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <p className="eyebrow text-marrom-suave">Finalizar compra</p>
      <p className="rotulo-secao mt-2 text-ambar-texto">Etapa {step} de 2</p>
      <span aria-hidden="true" className="filete mt-4" />

      <h1 className="font-display text-heading mt-5 text-3xl sm:text-4xl leading-[1.1]">
        {loteEscolhido.modalidade.nome}
      </h1>
      <p className="mt-2 text-marrom-suave">{loteEscolhido.nome}</p>

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
        <div className="mt-10">
          <h2 className="font-display text-2xl text-heading">Escolha do ingresso</h2>
          <p className="mt-2 text-marrom">
            {upgrade
              ? "Confirme o Start ou faça upgrade para o VIP."
              : "Confirme o ingresso que você quer comprar."}
          </p>

          <fieldset className="mt-6">
            <legend className="sr-only">Ingresso</legend>
            <div className="flex flex-col gap-4">
              <OpcaoIngresso
                lote={lote}
                selecionado={loteEscolhido.id === lote.id}
                escolhivel={upgrade !== null}
                onEscolher={() => escolherIngresso(lote)}
              />
              {upgrade && (
                <OpcaoIngresso
                  lote={upgrade}
                  selecionado={loteEscolhido.id === upgrade.id}
                  escolhivel
                  rotulo="Upgrade"
                  onEscolher={() => escolherIngresso(upgrade)}
                />
              )}
            </div>
          </fieldset>

          <CTAButton type="button" size="lg" onClick={handleContinuar} className="mt-8 w-full sm:w-auto">
            Continuar
          </CTAButton>
        </div>
      )}

      {step === 2 && (
        <div className="mt-10">
          <h2 className="font-display text-2xl text-heading">Resumo e pagamento</h2>

          <dl className="mt-6 divide-y divide-border border-y border-border text-[15px]">
            <div className="flex flex-wrap justify-between gap-2 py-3">
              <dt className="text-marrom-suave">Ingresso</dt>
              <dd className="text-marrom">{loteEscolhido.modalidade.nome}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2 py-3">
              <dt className="text-marrom-suave">Comprador</dt>
              <dd className="text-marrom">
                {comprador.nome} ({comprador.email})
              </dd>
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
            Ao confirmar, o pagamento seguro na Hypercash abre numa nova aba. Pode voltar pra esta aba depois de
            pagar — ela atualiza sozinha e o ingresso é liberado assim que o pagamento for aprovado.
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
            <CTAButton type="button" size="lg" onClick={handleConfirmar} disabled={enviando || !aceiteTermos}>
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

interface OpcaoIngressoProps {
  lote: LoteComModalidade;
  selecionado: boolean;
  /** Só há o que escolher quando existe upgrade; sozinho, o ingresso aparece só como confirmação. */
  escolhivel: boolean;
  rotulo?: string;
  onEscolher: () => void;
}

function OpcaoIngresso({ lote, selecionado, escolhivel, rotulo, onEscolher }: OpcaoIngressoProps) {
  return (
    <label
      className={cn(
        "flex gap-4 rounded-card border px-5 py-5 font-normal transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ambar",
        selecionado ? "border-ambar-escuro bg-areia" : "border-border bg-papel hover:bg-areia/50",
        escolhivel ? "cursor-pointer" : "cursor-default",
      )}
    >
      <input type="radio" name="ingresso" checked={selecionado} onChange={onEscolher} className="sr-only" />

      {escolhivel && (
        <span
          aria-hidden="true"
          className={cn(
            "mt-1.5 grid size-5 shrink-0 place-items-center rounded-full border",
            selecionado ? "border-ambar-escuro bg-ambar-escuro" : "border-dourado",
          )}
        >
          {selecionado && <span className="size-2 rounded-full bg-papel" />}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <div>
            {rotulo && <span className="rotulo-secao text-ambar-texto text-[0.8rem]">{rotulo}</span>}
            <div className="font-display text-2xl leading-snug text-heading">{lote.modalidade.nome}</div>
          </div>
          <div className="font-display text-xl text-vinho">{formatCurrencyBRL(lote.preco ?? 0)}</div>
        </div>

        {lote.modalidade.descricao && (
          <p className="mt-2 text-[15px] leading-6 text-marrom">{lote.modalidade.descricao}</p>
        )}

        <Link
          href={`/ingressos/${lote.modalidade.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-11 items-center text-[15px] text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro"
        >
          Ver o que inclui
        </Link>
      </div>
    </label>
  );
}
