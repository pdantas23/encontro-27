"use client";

import { useEffect, useState } from "react";
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
    <dl className={cn("flex flex-wrap justify-center gap-x-8 gap-y-2 text-marrom", className)}>
      {dataFormatada ? (
        <div className="flex items-baseline gap-2">
          <dt className="eyebrow text-marrom-suave">Data</dt>
          <dd className="font-medium">
            {info?.date ? <time dateTime={info.date}>{dataFormatada}</time> : null}
          </dd>
        </div>
      ) : null}
      {local ? (
        <div className="flex items-baseline gap-2">
          <dt className="eyebrow text-marrom-suave">Local</dt>
          <dd className="font-medium">{local}</dd>
        </div>
      ) : null}
    </dl>
  );
}
