"use client";

import { useCallback, useEffect, useState } from "react";
import { assetPath } from "@/lib/utils";

/**
 * Fotos reais de edições anteriores (material oficial do site de 2026),
 * reaproveitadas como prova social logo depois do banner, antes dos ingressos. Carrossel simples: avança sozinho a cada
 * 6 s, para com o mouse/foco em cima e não avança com prefers-reduced-motion.
 */
const TOTAL = 8;
const FOTOS = Array.from({ length: TOTAL }, (_, i) => ({
  src: assetPath(`/brand/edicoes/foto-${String(i + 1).padStart(2, "0")}.webp`),
  alt: `Participantes em uma edição anterior do O Encontro, foto ${i + 1} de ${TOTAL}`,
}));

export function EdicoesAnterioresSection() {
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);

  const irPara = useCallback((i: number) => setAtual((i + TOTAL) % TOTAL), []);

  useEffect(() => {
    if (pausado || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setAtual((a) => (a + 1) % TOTAL), 6000);
    return () => clearInterval(t);
  }, [pausado]);

  return (
    <section id="edicoes" aria-labelledby="edicoes-titulo" className="container-site pt-8 sm:pt-10">
      <h2 id="edicoes-titulo" className="font-display text-heading text-2xl sm:text-3xl leading-tight text-balance">
        Edições anteriores
      </h2>
      <p className="mt-2 text-[17px] leading-7 text-marrom">
        Experiências, conexões e histórias construídas em cada edição.
      </p>

      <div
        className="relative mt-5"
        role="region"
        aria-roledescription="carrossel"
        aria-label="Fotos de edições anteriores"
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
        onFocus={() => setPausado(true)}
        onBlur={() => setPausado(false)}
      >
        <div className="overflow-hidden rounded-lg">
          <div
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${atual * 100}%)` }}
          >
            {FOTOS.map((foto, i) => (
              <div
                key={foto.src}
                className="w-full shrink-0"
                role="group"
                aria-roledescription="slide"
                aria-label={`Foto ${i + 1} de ${TOTAL}`}
                aria-hidden={i !== atual}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto.src}
                  alt={foto.alt}
                  width={1400}
                  height={934}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="aspect-[3/2] lg:aspect-[21/9] w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => irPara(atual - 1)}
          aria-label="Foto anterior"
          className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-pill bg-papel/85 text-vinho shadow-card hover:bg-papel"
        >
          <Seta direcao="esq" />
        </button>
        <button
          type="button"
          onClick={() => irPara(atual + 1)}
          aria-label="Próxima foto"
          className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-pill bg-papel/85 text-vinho shadow-card hover:bg-papel"
        >
          <Seta direcao="dir" />
        </button>

        <ol className="mt-4 flex justify-center gap-2" aria-label="Escolher foto">
          {FOTOS.map((_, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => irPara(i)}
                aria-label={`Foto ${i + 1}`}
                aria-current={i === atual ? "true" : undefined}
                className="flex size-6 items-center justify-center"
              >
                <span className={`block size-2 rounded-pill transition-colors ${i === atual ? "bg-ambar-escuro" : "bg-dourado/60"}`} />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Seta({ direcao }: { direcao: "esq" | "dir" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direcao === "esq" ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
    </svg>
  );
}
