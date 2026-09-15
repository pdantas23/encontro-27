"use client";

import { useEffect, useState } from "react";
import { publicSelectOne } from "@/lib/supabase/publicRest";
import { cn } from "@/lib/utils";

/**
 * Link de suporte via WhatsApp. Só aparece quando `whatsapp_support` estiver
 * cadastrado em event_config (hoje null — cap. 16 "canal de suporte").
 */
export function SupportLink({ className }: { className?: string }) {
  const [numero, setNumero] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    publicSelectOne<{ whatsapp_support: string | null }>("event_config_encontro27", "select=whatsapp_support")
      .then((data) => {
        if (!cancelled && data?.whatsapp_support) setNumero(data.whatsapp_support);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!numero) return null;

  const digits = numero.replace(/\D/g, "");
  if (!digits) return null;

  return (
    <p className={cn("text-sm", className)}>
      <span className="text-marrom-suave">Suporte: </span>
      <a
        href={`https://wa.me/${digits}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-10 items-center font-semibold text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro"
      >
        WhatsApp {numero}
      </a>
    </p>
  );
}
