"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type EventConfig = Database["public"]["Tables"]["event_config_encontro27"]["Row"];

const LINKS = [
  { href: "/o-encontro", label: "O Encontro", description: "Conheça a edição comemorativa de 5 anos." },
  { href: "/programacao", label: "Programação", description: "Veja os dias, horários e atividades." },
  { href: "/convidados", label: "Convidados", description: "Conheça quem vai estar com a gente." },
  { href: "/experiencias", label: "Experiências", description: "Almoço de Negócios e Jantar de Conexões." },
  { href: "/faq", label: "FAQ", description: "Tire suas dúvidas sobre o evento." },
];

export default function HomePage() {
  const [config, setConfig] = useState<EventConfig | null | undefined>(undefined);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("event_config_encontro27")
        .select("*")
        .limit(1)
        .maybeSingle();
      setConfig(data ?? null);
    }
    load();
  }, []);

  const dataFormatada =
    config?.date != null
      ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(config.date))
      : "Data a definir";
  const local = config?.location ?? "Local a definir";

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>O Encontro 2027</h1>
      <p>Edição comemorativa de 5 anos</p>

      <p>
        {config === undefined ? "Carregando informações do evento..." : `${dataFormatada} • ${local}`}
      </p>

      <p>
        <Link href="/ingressos">Comprar ingressos</Link>
      </p>

      <h2>Explore</h2>
      <ul>
        {LINKS.map((link) => (
          <li key={link.href} style={{ marginBottom: 8 }}>
            <Link href={link.href}>{link.label}</Link> — {link.description}
          </li>
        ))}
      </ul>
    </main>
  );
}
