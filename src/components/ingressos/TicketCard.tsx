"use client";

import { CTAButton } from "@/components/ui/CTAButton";
import { formatCurrencyBRL } from "@/lib/utils";
import { trackSelectTicket } from "@/lib/tracking/events";
import { resumirIngresso, type Modalidade } from "@/hooks/useModalidades";
import type { Json } from "@/types/database";

function toStringList(value: Json | null): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

const ESTADO: Record<ReturnType<typeof resumirIngresso>["disponibilidade"], string | null> = {
  compravel: null,
  em_breve: "Em breve",
  esgotado: "Esgotado",
  encerrado: "Vendas encerradas",
};

/**
 * Card de modalidade: nome, valor e botão de compra. Sem link de detalhe
 * (decisão do Aerton, 15/09/2026). Preço e disponibilidade vêm do lote ativo.
 */
export function TicketCard({ modalidade }: { modalidade: Modalidade }) {
  const { disponibilidade, lote, restantes } = resumirIngresso(modalidade);
  const estado = ESTADO[disponibilidade];
  const itens = toStringList(modalidade.itens_incluidos).slice(0, 5);
  const compravel = disponibilidade === "compravel" && lote;
  // O nome do lote só informa algo quando há mais de um lote na modalidade.
  const mostraLote = modalidade.lotes_encontro27.length > 1 && lote;

  return (
    <li className="flex flex-col rounded-card border border-border bg-papel p-6">
      <h4 className="font-display text-vinho text-2xl">{modalidade.nome}</h4>

      {modalidade.descricao ? <p className="mt-3 text-marrom leading-relaxed">{modalidade.descricao}</p> : null}
      {modalidade.para_quem_e ? <p className="mt-3 text-marrom leading-relaxed">{modalidade.para_quem_e}</p> : null}

      {itens.length > 0 ? (
        <ul className="mt-4 space-y-1.5 text-sm text-marrom">
          {itens.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-dourado">✦</span>
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto pt-5">
        {lote?.preco != null ? (
          <p className="flex items-baseline gap-2">
            <span className="font-display text-3xl text-vinho">{formatCurrencyBRL(lote.preco)}</span>
            {mostraLote ? <span className="text-xs text-marrom-suave">{lote.nome}</span> : null}
          </p>
        ) : (
          <p className="text-sm text-marrom-suave">Valor será divulgado em breve.</p>
        )}
        {restantes != null && restantes > 0 && disponibilidade === "compravel" ? (
          <p className="mt-1 text-xs text-marrom-suave">
            {restantes} {restantes === 1 ? "vaga restante" : "vagas restantes"}
          </p>
        ) : null}

        {compravel ? (
          <CTAButton
            href={`/checkout?lote=${lote.id}`}
            size="lg"
            className="mt-4 w-full"
            onClick={() => trackSelectTicket(modalidade.slug, modalidade.nome)}
            aria-label={`Comprar ${modalidade.nome}`}
          >
            Comprar
          </CTAButton>
        ) : (
          <CTAButton size="lg" className="mt-4 w-full" disabled aria-disabled="true">
            {estado}
          </CTAButton>
        )}
      </div>
    </li>
  );
}

export function TicketCardSkeleton() {
  return (
    <li aria-hidden="true" className="rounded-card border border-border bg-papel p-6 animate-pulse">
      <div className="h-7 w-2/3 rounded bg-areia" />
      <div className="mt-3 h-4 w-full rounded bg-areia/70" />
      <div className="mt-8 h-9 w-1/2 rounded bg-areia" />
      <div className="mt-4 h-13 w-full rounded-pill bg-areia" />
    </li>
  );
}
