import Link from "next/link";
import { EventoSecao } from "@/components/landing/EventoSecao";

const LINK = "text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro";

/**
 * Sobre o evento: o que acontece e o conceito dos 5 anos. Só o que é
 * oficial (levantamento e manual, p.3). Não afirmar "quinta edição": não
 * confirmado. Benefícios detalhados seguem pendentes (cap. 16).
 */
export function SobreSection() {
  return (
    <EventoSecao id="sobre" titulo="Sobre o evento">
      <div className="space-y-5 text-[17px] leading-8 text-marrom">
        <p>
          O Encontro reúne cerimonialistas e profissionais do mercado de eventos em torno de negócios e conexões.
        </p>
        <p>
          A{" "}
          <Link href="/programacao" className={LINK}>
            programação
          </Link>{" "}
          traz convidados e palestrantes. Duas{" "}
          <Link href="/experiencias" className={LINK}>
            experiências
          </Link>{" "}
          acontecem à parte dela: o Almoço de Negócios e o Jantar de Conexões.
        </p>

        <blockquote className="border-l-2 border-dourado pl-5 font-display text-vinho text-xl sm:text-2xl leading-snug text-balance">
          Inspirado no cajueiro: da flor à castanha, da folha larga à força das raízes.
        </blockquote>

        <p>
          Em 2027, O Encontro celebra 5 anos. A identidade desta edição nasce do cajueiro, símbolo piauiense de
          origem, encontro e transformação.
        </p>
      </div>
      <Link href="/o-encontro" className={`mt-4 inline-flex min-h-11 items-center ${LINK}`}>
        A história do evento
      </Link>
    </EventoSecao>
  );
}
