"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { publicSelectOne } from "@/lib/supabase/publicRest";
import { cn } from "@/lib/utils";

interface Info {
  date: string | null;
  location: string | null;
}

/**
 * Data e local do evento — só renderiza o que estiver confirmado no banco.
 * Enquanto `date`/`location` forem null (cap. 16 do levantamento), não
 * mostra nada: nem "a definir", nem placeholder.
 */
export function EventInfo({ className }: { className?: string }) {
  const [info, setInfo] = useState<Info | null>(null);

  useEffect(() => {
    let cancelled = false;
    publicSelectOne<Info>("event_config_encontro27", "select=date,location")
      .then((data) => {
        if (!cancelled && data) setInfo(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const dataFormatada = info?.date
    ? new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(info.date))
    : null;
  const local = info?.location?.trim() || null;

  if (!dataFormatada && !local) return null;

  return (
    <dl className={cn("flex flex-col gap-3 text-marrom", className)}>
      {dataFormatada ? (
        <Item icone={<CalendarDays aria-hidden="true" className="size-5" />} rotulo="Data">
          {info?.date ? <time dateTime={info.date}>{dataFormatada}</time> : null}
        </Item>
      ) : null}
      {local ? (
        <Item icone={<MapPin aria-hidden="true" className="size-5" />} rotulo="Local">
          {local}
        </Item>
      ) : null}
    </dl>
  );
}

function Item({ icone, rotulo, children }: { icone: React.ReactNode; rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-areia text-ambar-texto">{icone}</span>
      <div>
        <dt className="eyebrow text-marrom-suave">{rotulo}</dt>
        <dd className="font-semibold text-vinho">{children}</dd>
      </div>
    </div>
  );
}
