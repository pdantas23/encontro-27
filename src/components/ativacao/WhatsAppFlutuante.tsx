"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { cn } from "@/lib/utils";
import { cotaPorId, linkWhatsAppComercial } from "./conteudo";
import { useCotaSelecionada } from "./CotaSelecionada";

/**
 * Botão redondo do WhatsApp comercial, fixo no canto. Aparece depois que o
 * visitante sai do topo da página (no hero já há os botões de ação) e leva a
 * cota escolhida na mensagem, igual à área de interesse.
 */
export function WhatsAppFlutuante() {
  const { cotaId } = useCotaSelecionada();
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const atualizar = () => setVisivel(window.scrollY > window.innerHeight * 0.6);
    atualizar();
    window.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    return () => {
      window.removeEventListener("scroll", atualizar);
      window.removeEventListener("resize", atualizar);
    };
  }, []);

  return (
    <a
      href={linkWhatsAppComercial(cotaPorId(cotaId))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o comercial no WhatsApp (abre o WhatsApp)"
      aria-hidden={!visivel || undefined}
      tabIndex={visivel ? undefined : -1}
      data-whatsapp-flutuante
      className={cn(
        "fixed right-4 bottom-4 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_-6px_rgb(0_0_0/0.35)] ring-1 ring-black/5",
        "transition-[opacity,transform] duration-200 hover:scale-105 motion-reduce:transition-none sm:right-6 sm:bottom-6 sm:size-16",
        visivel ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <WhatsAppIcon fill="currentColor" className="size-7 sm:size-8" />
    </a>
  );
}
