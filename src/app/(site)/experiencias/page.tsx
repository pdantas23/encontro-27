import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";

/**
 * Página estática — não existe tabela própria para "experiências" no banco.
 * O funcionamento detalhado de cada experiência (horários, regras) ainda é
 * PENDENTE DE VALIDAÇÃO pela organização — não foi inventado aqui.
 */
const EXPERIENCIAS = [
  {
    titulo: "Almoço de Negócios",
    href: "/ingressos/almoco-nao-participante",
  },
  {
    titulo: "Jantar de Conexões",
    href: "/ingressos/jantar-conexoes",
  },
];

export default function ExperienciasPage() {
  return (
    <>
      <PageHeader
        title="Experiências"
        description="O Encontro 2027 conta com duas experiências complementares à programação principal. Cada uma tem sua modalidade correspondente na página de ingressos."
      />

      <main id="conteudo" className="container-site py-10 sm:py-14">
        <div className="max-w-3xl divide-y divide-border border-y border-border">
          {EXPERIENCIAS.map((experiencia) => (
            <section key={experiencia.href} className="py-8">
              <h2 className="font-display text-2xl sm:text-3xl text-heading leading-snug">
                {experiencia.titulo}
              </h2>
              <p className="mt-4 max-w-2xl text-[17px] leading-7 text-marrom text-pretty">
                O funcionamento desta experiência (horário, formato e regras) ainda está sendo definido pela
                organização. Assim que confirmado, os detalhes entram aqui.
              </p>
              <Link
                href={experiencia.href}
                className="mt-5 inline-flex min-h-11 items-center text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro"
              >
                Ver modalidade de ingresso
              </Link>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
