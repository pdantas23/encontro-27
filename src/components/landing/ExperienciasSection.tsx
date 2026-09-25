import Link from "next/link";
import { EventoSecao } from "@/components/landing/EventoSecao";

/**
 * Experiências confirmadas (cap. 05). Funcionamento é pendente; os textos
 * afirmam só o que os dados de ingresso sustentam.
 */
const EXPERIENCIAS = [
  {
    nome: "Almoço de Negócios",
    texto: "Aberto também a quem não participa do evento. Quem tem ingresso Start paga menos.",
    slug: "almoco-nao-participante",
  },
  {
    nome: "Jantar de Conexões",
    texto: "O Jantar de Conexões possui ingresso próprio.",
    slug: "jantar-conexoes",
  },
] as const;

export function ExperienciasSection() {
  return (
    <EventoSecao id="experiencias" titulo="Experiências">
      <p className="text-[17px] leading-7 text-marrom">
        Almoço de Negócios e Jantar de Conexões são vendidos separadamente do ingresso do evento. Horários e formato
        serão divulgados em breve.
      </p>

      <dl className="mt-6 divide-y divide-border border-t border-border">
        {EXPERIENCIAS.map((e) => (
          <div key={e.slug} className="grid gap-2 py-5 sm:grid-cols-12 sm:gap-6">
            <dt className="font-display text-vinho text-xl sm:col-span-5">{e.nome}</dt>
            <dd className="sm:col-span-7">
              <p className="text-[17px] leading-7 text-marrom">{e.texto}</p>
              <Link
                href={`/ingressos/${e.slug}`}
                className="mt-2 inline-flex min-h-11 items-center text-sm text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro"
              >
                Ver ingresso
              </Link>
            </dd>
          </div>
        ))}
      </dl>
    </EventoSecao>
  );
}
