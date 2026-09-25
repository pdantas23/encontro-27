"use client";

import Link from "next/link";
import { CTAButton } from "@/components/ui/CTAButton";
import { formatCurrencyBRL } from "@/lib/utils";
import { trackSelectTicket } from "@/lib/tracking/events";
import { resumirIngresso, type Modalidade, type ModalidadesState } from "@/hooks/useModalidades";

/** Start e VIP dão acesso ao evento; o resto são experiências (cap. 06). */
const SLUGS_EVENTO = new Set(["start", "vip"]);

const ESTADO: Record<ReturnType<typeof resumirIngresso>["disponibilidade"], string | null> = {
  compravel: null,
  em_breve: "Em breve",
  esgotado: "Esgotado",
  encerrado: "Vendas encerradas",
};

/**
 * Lista de ingressos no formato de bilheteria: uma linha por modalidade, com
 * lote, preço e botão de compra. Estados: carregando / erro / vazio / lista.
 * Recebe o estado pronto para quem a usa poder derivar outras coisas dos
 * mesmos dados (ex.: a barra de compra do celular) sem buscar de novo.
 */
export function IngressosLista({ state, showFallbackLink = true }: { state: ModalidadesState; showFallbackLink?: boolean }) {
  if (state.status === "loading") {
    return (
      <ul aria-hidden="true" className="divide-y divide-border animate-pulse">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i} className="flex items-center justify-between gap-4 py-4">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/2 rounded bg-areia" />
              <div className="h-6 w-2/3 rounded bg-areia/70" />
            </div>
            <div className="h-11 w-24 rounded-pill bg-areia" />
          </li>
        ))}
      </ul>
    );
  }

  if (state.status === "error") {
    return (
      <p role="alert" className="border-l-2 border-vermelho pl-4 text-marrom">
        Não foi possível carregar os ingressos agora. Tente novamente em instantes
        {showFallbackLink ? (
          <>
            {" "}
            ou acesse a{" "}
            <Link href="/ingressos" className="text-vinho underline underline-offset-4">
              página de ingressos
            </Link>
          </>
        ) : null}
        .
      </p>
    );
  }

  if (state.modalidades.length === 0) {
    return <p className="text-marrom">Os ingressos serão disponibilizados em breve.</p>;
  }

  const evento = state.modalidades.filter((m) => SLUGS_EVENTO.has(m.slug));
  const experiencias = state.modalidades.filter((m) => !SLUGS_EVENTO.has(m.slug));

  return (
    <div className="space-y-6">
      <Grupo titulo="Ingressos do evento" itens={evento} />
      <Grupo titulo="Experiências (vendidas à parte)" itens={experiencias} />
    </div>
  );
}

function Grupo({ titulo, itens }: { titulo: string; itens: Modalidade[] }) {
  if (itens.length === 0) return null;
  return (
    <div>
      <p className="eyebrow text-marrom-suave">{titulo}</p>
      <ul className="mt-1 divide-y divide-border">
        {itens.map((m) => (
          <IngressoLinha key={m.id} modalidade={m} />
        ))}
      </ul>
    </div>
  );
}

function IngressoLinha({ modalidade }: { modalidade: Modalidade }) {
  const { disponibilidade, lote, restantes } = resumirIngresso(modalidade);
  const compravel = disponibilidade === "compravel" && lote;
  const detalhes = [
    lote?.nome,
    restantes != null && restantes > 0 && compravel ? `${restantes} ${restantes === 1 ? "vaga restante" : "vagas restantes"}` : null,
  ].filter(Boolean);

  return (
    <li className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <h3 className="font-semibold text-vinho leading-snug">{modalidade.nome}</h3>
        {detalhes.length > 0 ? <p className="mt-0.5 text-sm text-marrom-suave">{detalhes.join(" · ")}</p> : null}
        {compravel && lote.preco != null ? (
          <p className="mt-1 font-display text-2xl text-vinho">{formatCurrencyBRL(lote.preco)}</p>
        ) : null}
      </div>

      {compravel ? (
        <CTAButton
          href={`/checkout?lote=${lote.id}`}
          className="shrink-0"
          onClick={() => trackSelectTicket(modalidade.slug, modalidade.nome)}
          aria-label={`Comprar ${modalidade.nome}`}
        >
          Comprar
        </CTAButton>
      ) : (
        <CTAButton className="shrink-0" disabled aria-disabled="true">
          {ESTADO[disponibilidade]}
        </CTAButton>
      )}
    </li>
  );
}

/** Menor preço entre os ingressos compráveis, para o "a partir de". */
export function menorPrecoCompravel(state: ModalidadesState): number | null {
  if (state.status !== "ready") return null;
  const precos = state.modalidades
    .map((m) => resumirIngresso(m))
    .filter((r) => r.disponibilidade === "compravel" && r.lote?.preco != null)
    .map((r) => r.lote!.preco as number);
  return precos.length > 0 ? Math.min(...precos) : null;
}
