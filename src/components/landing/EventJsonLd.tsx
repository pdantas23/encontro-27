"use client";

import { useEffect, useState } from "react";
import { publicSelectOne } from "@/lib/supabase/publicRest";

/**
 * Structured data do evento. `Event` do schema.org exige startDate e
 * location — só é emitido quando esses dados existirem no banco (cap. 16).
 * Sem eles, emite apenas o Organization/WebSite, que não têm campos pendentes.
 */
export function EventJsonLd() {
  const [evento, setEvento] = useState<{ name: string | null; date: string | null; location: string | null; description: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    publicSelectOne<{ name: string | null; date: string | null; location: string | null; description: string | null }>(
      "event_config_encontro27",
      "select=name,date,location,description",
    )
      .then((data) => {
        if (!cancelled && data) setEvento(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const url = siteUrl ? `${siteUrl}${basePath}/` : undefined;

  const graph: Record<string, unknown>[] = [
    { "@type": "Organization", name: "O Encontro", url },
  ];

  if (evento?.date && evento.location) {
    graph.push({
      "@type": "Event",
      name: evento.name ?? "O Encontro 2027",
      description: evento.description ?? undefined,
      startDate: evento.date,
      location: { "@type": "Place", name: evento.location },
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      organizer: { "@type": "Organization", name: "O Encontro" },
      url,
    });
  }

  return (
    <script
      type="application/ld+json"
      // `<` escapado: o conteúdo vem do banco e não pode fechar a tag <script>.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c"),
      }}
    />
  );
}
