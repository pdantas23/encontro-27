import Link from "next/link";
import { assetPath } from "@/lib/utils";

/**
 * 5 anos. Só o que é oficial: "5 anos" (levantamento, cap. 01) e o conceito
 * do cajueiro (manual, p.3). Não afirmar "quinta edição": não confirmado.
 * Histórico, números e fotos de edições anteriores entram quando chegarem.
 */
export function CincoAnosSection() {
  return (
    <section aria-labelledby="cinco-anos-titulo" className="container-site pb-16 sm:pb-24">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 lg:items-center">
        {/* Line-art oficial do cajueiro (manual), recorte vertical */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assetPath("/brand/fundo-botanico-sm.webp")}
          alt=""
          width={720}
          height={788}
          loading="lazy"
          data-flor-destino=""
          className="w-full aspect-[16/9] lg:aspect-[4/5] object-cover rounded-lg lg:col-span-5 order-last lg:order-first"
        />
        <div className="lg:col-span-7">
          <p className="eyebrow text-ambar-texto">5 anos</p>
          <h2 id="cinco-anos-titulo" className="font-display text-heading mt-3 text-[1.75rem] sm:text-4xl lg:text-[2.75rem] leading-[1.15] sm:leading-[1.1] text-balance">
            Inspirado no cajueiro: da flor à castanha, da folha larga à força das raízes.
          </h2>
          <p className="mt-5 sm:mt-6 max-w-xl text-[19px] leading-8 sm:text-lg sm:leading-relaxed text-marrom">
            Em 2027, O Encontro celebra 5 anos. A identidade desta edição nasce do cajueiro, símbolo piauiense
            de origem, encontro e transformação.
          </p>
          <Link
            href="/o-encontro"
            className="mt-6 inline-flex min-h-11 items-center text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro"
          >
            A história do evento
          </Link>
        </div>
      </div>
    </section>
  );
}
