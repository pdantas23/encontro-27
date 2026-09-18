"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TicketGrid } from "@/components/ingressos/TicketGrid";
import { trackViewTickets } from "@/lib/tracking/events";

export default function IngressosPage() {
  useEffect(() => {
    trackViewTickets();
  }, []);

  return (
    <>
      <PageHeader
        title="Como você quer participar do O Encontro 2027?"
        description="Start e VIP dão acesso ao evento. Almoço e Jantar são vendidos à parte."
      />
      <main id="conteudo" className="container-site py-10 sm:py-14">
        <TicketGrid showFallbackLink={false} />
      </main>
    </>
  );
}
