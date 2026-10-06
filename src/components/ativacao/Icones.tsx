import { Coffee, FileText, Gem, Gift, Lightbulb, Megaphone, Monitor, SquarePlay, Store, Ticket, Users } from "lucide-react";
import type { IconeBeneficio } from "./conteudo";

/** lucide 1.x não tem mais ícones de marca; este é o glifo do Instagram usado no Canva. */
function InstagramGlifo(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.25" cy="6.75" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

const BENEFICIO = {
  tela: Monitor,
  folheto: FileText,
  instagram: InstagramGlifo,
  video: SquarePlay,
  brinde: Gift,
  espaco: Store,
  passaporte: Ticket,
  cafe: Coffee,
} as const;

export function IconeBeneficio({ tipo, className }: { tipo: IconeBeneficio; className?: string }) {
  const Icone = BENEFICIO[tipo];
  return <Icone aria-hidden="true" strokeWidth={1.5} className={className} />;
}

const PILAR = { ideia: Lightbulb, pessoas: Users, diamante: Gem, megafone: Megaphone } as const;

export function IconePilar({ tipo, className }: { tipo: keyof typeof PILAR; className?: string }) {
  const Icone = PILAR[tipo];
  return <Icone aria-hidden="true" strokeWidth={1.25} className={className} />;
}

/** Flor da marca em traço — o ornamento entre filetes do Canva. */
export function Ornamento({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`flex items-center justify-center gap-3 ${className ?? ""}`}>
      <span className="h-px w-10 bg-dourado-linha" />
      <svg viewBox="0 0 20 20" className="size-3.5 text-dourado" fill="currentColor">
        <path d="M10 0 12 8 20 10 12 12 10 20 8 12 0 10 8 8Z" />
      </svg>
      <span className="h-px w-10 bg-dourado-linha" />
    </span>
  );
}
