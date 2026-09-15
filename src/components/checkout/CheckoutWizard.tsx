"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { compradorSchema, type CompradorFormValues } from "@/lib/validators/checkout";
import { getStoredUtms } from "@/lib/tracking/utms";
import { trackBeginCheckout, trackAddPaymentInfo } from "@/lib/tracking/events";
import { formatCurrencyBRL } from "@/lib/utils";
import type { LoteComModalidade } from "@/types/checkout";

type Step = 1 | 2 | 3 | 4;

interface ParticipanteInput {
  nome: string;
  email: string;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function CheckoutWizard({
  lote,
  disponivel,
}: {
  lote: LoteComModalidade;
  disponivel: number | null;
}) {
  const [step, setStep] = useState<Step>(1);
  const [quantidade, setQuantidade] = useState(1);
  const [comprador, setComprador] = useState<CompradorFormValues | null>(null);
  const [participantes, setParticipantes] = useState<ParticipanteInput[]>([{ nome: "", email: "" }]);
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const maxQuantidade = disponivel !== null ? Math.max(1, Math.min(disponivel, 20)) : 20;
  const precoUnitario = lote.preco ?? 0;

  const {
    register: registerComprador,
    handleSubmit: handleSubmitComprador,
    formState: { errors: compradorErrors },
  } = useForm<CompradorFormValues>({
    resolver: zodResolver(compradorSchema),
    defaultValues: comprador ?? undefined,
  });

  function handleQuantidadeSubmit() {
    trackBeginCheckout(lote.modalidade.slug, quantidade);
    setParticipantes((prev) => Array.from({ length: quantidade }, (_, i) => prev[i] ?? { nome: "", email: "" }));
    setStep(2);
  }

  function handleComprador(values: CompradorFormValues) {
    setComprador(values);
    setStep(3);
  }

  function handleParticipantesSubmit() {
    const invalido = participantes.some((p) => p.nome.trim().length < 3);
    if (invalido) {
      setErro("Preencha o nome completo de todos os participantes.");
      return;
    }
    setErro(null);
    setStep(4);
  }

  function updateParticipante(index: number, field: keyof ParticipanteInput, value: string) {
    setParticipantes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function handleConfirmar() {
    if (!comprador || !aceiteTermos) return;
    setEnviando(true);
    setErro(null);

    try {
      const supabase = createClient();
      const utms = getStoredUtms();
      const valorTotal = Math.round(quantidade * precoUnitario * 100) / 100;

      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos_encontro27")
        .insert({
          comprador_nome: comprador.nome,
          comprador_email: comprador.email,
          comprador_whatsapp: comprador.whatsapp,
          lote_id: lote.id,
          quantidade,
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
        })
        .select("id")
        .single();

      if (pedidoError || !pedido) throw pedidoError ?? new Error("Falha ao criar o pedido");

      const { error: participantesError } = await supabase.from("participantes_encontro27").insert(
        participantes.map((p) => ({
          pedido_id: pedido.id,
          nome: p.nome,
          email: p.email || null,
        })),
      );

      if (participantesError) throw participantesError;

      trackAddPaymentInfo(lote.modalidade.slug);

      // Navegação de página inteira proposital (não router.push): output "export" não tem
      // servidor, e uma troca de estado tão grande (fim do checkout) fica mais confiável com
      // reload completo do que com transição client-side — mesma convenção usada no admin.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `${basePath}/checkout/pendente?pedido=${pedido.id}&email=${encodeURIComponent(comprador.email)}`;
    } catch {
      setErro("Não foi possível registrar seu pedido. Tente novamente em instantes.");
      setEnviando(false);
    }
  }

  return (
    <div>
      <h1>{lote.modalidade.nome}</h1>
      <p>{lote.nome}</p>
      <p>Etapa {step} de 4</p>

      {/* Resumo sempre visível — preço, quantidade e subtotal nunca ficam só na última etapa */}
      <div style={{ border: "1px solid #ddd", padding: 12, margin: "16px 0" }}>
        <p>Valor unitário: {formatCurrencyBRL(precoUnitario)}</p>
        <p>Quantidade: {quantidade}</p>
        <p>Subtotal: {formatCurrencyBRL(quantidade * precoUnitario)}</p>
      </div>

      {step === 1 && (
        <div>
          <h2>Quantidade de ingressos</h2>
          <input
            type="number"
            min={1}
            max={maxQuantidade}
            value={quantidade}
            onChange={(event) =>
              setQuantidade(Math.max(1, Math.min(maxQuantidade, Number(event.target.value) || 1)))
            }
          />
          <p>
            <button onClick={handleQuantidadeSubmit}>Continuar</button>
          </p>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmitComprador(handleComprador)}>
          <h2>Seus dados</h2>
          <label>
            Nome completo
            <input {...registerComprador("nome")} />
          </label>
          {compradorErrors.nome && <p style={{ color: "crimson" }}>{compradorErrors.nome.message}</p>}
          <label>
            E-mail
            <input type="email" {...registerComprador("email")} />
          </label>
          {compradorErrors.email && <p style={{ color: "crimson" }}>{compradorErrors.email.message}</p>}
          <label>
            WhatsApp (com DDD)
            <input {...registerComprador("whatsapp")} />
          </label>
          {compradorErrors.whatsapp && <p style={{ color: "crimson" }}>{compradorErrors.whatsapp.message}</p>}
          <p>
            <button type="button" onClick={() => setStep(1)}>
              Voltar
            </button>{" "}
            <button type="submit">Continuar</button>
          </p>
        </form>
      )}

      {step === 3 && (
        <div>
          <h2>Dados dos participantes</h2>
          {participantes.map((participante, index) => (
            <fieldset key={index} style={{ marginBottom: 12 }}>
              <legend>Participante {index + 1}</legend>
              <label>
                Nome completo
                <input
                  value={participante.nome}
                  onChange={(event) => updateParticipante(index, "nome", event.target.value)}
                />
              </label>
              <label>
                E-mail (opcional)
                <input
                  type="email"
                  value={participante.email}
                  onChange={(event) => updateParticipante(index, "email", event.target.value)}
                />
              </label>
            </fieldset>
          ))}
          {erro && <p style={{ color: "crimson" }}>{erro}</p>}
          <button onClick={() => setStep(2)}>Voltar</button>{" "}
          <button onClick={handleParticipantesSubmit}>Continuar</button>
        </div>
      )}

      {step === 4 && comprador && (
        <div>
          <h2>Resumo e pagamento</h2>
          <p>
            Comprador: {comprador.nome} ({comprador.email})
          </p>
          <p>Participantes: {participantes.map((p) => p.nome).join(", ")}</p>
          <p>Valor total: {formatCurrencyBRL(quantidade * precoUnitario)}</p>
          <p>
            Ao confirmar, você será direcionado para o pagamento seguro na Hypercash. O ingresso é liberado assim
            que o pagamento for aprovado.
          </p>
          <label>
            <input type="checkbox" checked={aceiteTermos} onChange={(event) => setAceiteTermos(event.target.checked)} />{" "}
            Li e aceito os <a href="/termos">termos de compra</a>.
          </label>
          {erro && <p style={{ color: "crimson" }}>{erro}</p>}
          <p>
            <button onClick={() => setStep(3)} disabled={enviando}>
              Voltar
            </button>{" "}
            <button onClick={handleConfirmar} disabled={enviando || !aceiteTermos}>
              {enviando ? "Enviando..." : "Confirmar e ir para pagamento"}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
