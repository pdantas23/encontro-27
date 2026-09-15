import Link from "next/link";

/**
 * O que é o evento, em prosa. Fontes: levantamento (público, programação,
 * experiências). A frase oficial do manual fica só no CTA final.
 * Benefícios detalhados seguem pendentes (cap. 16) e não são prometidos aqui.
 */
export function PorQueParticiparSection() {
  return (
    <section aria-labelledby="porque-titulo" className="container-site py-16 sm:py-24">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <h2 id="porque-titulo" className="font-display text-heading text-3xl sm:text-4xl leading-[1.1] lg:col-span-5 text-balance">
          O que acontece no Encontro
        </h2>
        <div className="lg:col-span-7 space-y-5 text-[19px] leading-8 sm:text-lg sm:leading-relaxed text-marrom">
          <p>
            O Encontro reúne cerimonialistas e profissionais do mercado de eventos em torno de negócios e
            conexões.
          </p>
          <p>
            A{" "}
            <Link href="/programacao" className="text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro">
              programação
            </Link>{" "}
            traz convidados e palestrantes. Duas{" "}
            <Link href="/experiencias" className="text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro">
              experiências
            </Link>{" "}
            acontecem à parte dela: o Almoço de Negócios e o Jantar de Conexões.
          </p>
        </div>
      </div>
    </section>
  );
}
