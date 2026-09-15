import { SectionHeading } from "@/components/ui/SectionHeading";
import { TicketGrid } from "@/components/ingressos/TicketGrid";

/**
 * Ingressos na Home. Abertura sugerida pelo levantamento (cap. 06):
 * "Como você quer participar do O Encontro 2027?". Dados: TicketGrid.
 */
export function IngressosSection() {
  return (
    <section id="ingressos" aria-labelledby="ingressos-titulo" className="container-site py-16 sm:py-24 border-t border-border scroll-mt-20">
      <SectionHeading
        id="ingressos-titulo"
        title="Como você quer participar do O Encontro 2027?"
        description="Start e VIP dão acesso ao evento. Almoço e Jantar são vendidos à parte."
      />
      <div className="mt-10">
        <TicketGrid />
      </div>
    </section>
  );
}
