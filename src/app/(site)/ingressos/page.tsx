"use client";

import { useEffect } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TicketGrid } from "@/components/ingressos/TicketGrid";
import { trackViewTickets } from "@/lib/tracking/events";

export default function IngressosPage() {
  useEffect(() => {
    trackViewTickets();
  }, []);

  return (
    <main id="conteudo" className="container-site py-12 sm:py-16">
      <SectionHeading
        title="Como você quer participar do O Encontro 2027?"
        description="Start e VIP dão acesso ao evento. Almoço e Jantar são vendidos à parte."
      />
      <div className="mt-10">
        <TicketGrid showFallbackLink={false} />
      </div>
    </main>
  );
}
