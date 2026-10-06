"use client";

import { cn } from "@/lib/utils";
import { COTAS, beneficiosDaCota, formatarValor, type Cota, type TomCota } from "./conteudo";
import { BotaoInteresseCota, useCotaSelecionada } from "./CotaSelecionada";
import { IconeBeneficio, Ornamento } from "./Icones";

/** Cabeçalho de cada cota com a cor do Canva (p.9). Textos grandes: contraste AA para texto grande. */
const TOM: Record<TomCota, string> = {
  areia: "bg-areia text-vinho",
  vermelho: "bg-vermelho text-papel",
  ambar: "bg-linear-to-r from-ambar to-ambar-escuro text-papel",
  vinho: "bg-caju-profundo text-papel",
};

function Preco({ valor }: { valor: number }) {
  // "R$ 15.000,00" → "R$" pequeno, "15.000" grande, ",00" pequeno — como no Canva.
  const [, inteiro, centavos] = formatarValor(valor).match(/^R\$ ([\d.]+)(,\d{2})$/) ?? [];
  return (
    <p className="font-serif leading-none">
      <span className="sr-only">{formatarValor(valor)}</span>
      <span aria-hidden="true">
        <span className="text-xl align-[0.55em]">R$</span>{" "}
        <span className="text-[2.6rem] sm:text-5xl xl:text-[2.6rem] tracking-tight">{inteiro}</span>
        <span className="text-xl">{centavos}</span>
      </span>
    </p>
  );
}

function CotaCard({ cota }: { cota: Cota }) {
  const { cotaId } = useCotaSelecionada();
  const escolhida = cotaId === cota.id;
  const beneficios = beneficiosDaCota(cota);

  return (
    <article
      id={cota.id}
      aria-labelledby={`${cota.id}-nome`}
      data-escolhida={escolhida || undefined}
      className={cn(
        "flex scroll-mt-6 flex-col overflow-hidden rounded-[1.25rem] border bg-papel transition-shadow",
        escolhida ? "border-ambar ring-2 ring-ambar" : "border-dourado-linha",
      )}
    >
      <header className={cn("px-5 pt-5 pb-6 text-center", TOM[cota.tom])}>
        <h3 id={`${cota.id}-nome`} className="font-display text-2xl tracking-[0.08em] uppercase">
          {cota.nome}
        </h3>
        <div className="mt-3">
          <Preco valor={cota.valor} />
        </div>
        {escolhida ? <p className="eyebrow mt-3 text-[0.65rem]">Cota escolhida</p> : null}
      </header>

      <Ornamento className="-mt-px pt-5" />

      <ul className="flex-1 space-y-4 px-5 pt-5 pb-6" aria-label={`Benefícios da ${cota.nome}`}>
        {beneficios.map(({ categoria, texto }) => (
          <li key={categoria.id} className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-areia text-vinho">
              <IconeBeneficio tipo={categoria.icone} className="size-[18px]" />
            </span>
            <span className="pt-1.5 font-serif text-[15px] leading-snug text-marrom">{texto}</span>
          </li>
        ))}
      </ul>

      <footer className="border-t border-dourado-linha/60 px-5 pt-5 pb-5 text-center">
        <p className="eyebrow text-[0.65rem] leading-relaxed text-marrom-suave">{cota.assinatura}</p>
        <BotaoInteresseCota
          id={cota.id}
          nome={cota.nome}
          className="relative mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-pill bg-ambar-escuro px-5 font-sans font-semibold text-papel transition-colors hover:bg-ambar-pressed"
        />
      </footer>
    </article>
  );
}

/**
 * As quatro cotas lado a lado (xl), em duas colunas (md) ou empilhadas.
 * Valor e benefícios sempre à vista — nada escondido em modal ou acordeão.
 * Nenhuma cota recebe selo de "recomendada": não há instrução oficial para isso.
 */
export function CotasSection() {
  return (
    <section id="cotas" aria-labelledby="cotas-titulo" className="relative scroll-mt-4 py-16 sm:py-24">
      <div className="container-site">
        <div className="mx-auto max-w-2xl text-center">
          <p className="rotulo-secao text-ambar-texto">Investimento</p>
          <span aria-hidden="true" className="filete mx-auto mt-4" />
          <h2 id="cotas-titulo" className="mt-5 font-display text-vermelho text-4xl sm:text-5xl leading-[1.05] text-balance">
            Cotas para Ativação de Marca
          </h2>
          <p className="mt-4 eyebrow text-marrom-suave">O Encontro 2027 • O Congresso</p>
        </div>

        {/* Atalho de comparação no celular/tablet: os quatro valores de uma vez. */}
        <nav aria-label="Ir para uma cota" className="mt-10 xl:hidden">
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-dourado-linha bg-dourado-linha sm:grid-cols-4">
            {COTAS.map((c) => (
              <li key={c.id}>
                <a href={`#${c.id}`} className="flex min-h-16 flex-col items-center justify-center bg-papel px-2 py-3 text-center hover:bg-areia">
                  <span className="eyebrow text-[0.65rem] text-marrom-suave">{c.nome}</span>
                  <span className="mt-1 font-serif text-base text-vinho">{formatarValor(c.valor)}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:mt-14 xl:grid-cols-4 xl:gap-4">
          {COTAS.map((c) => (
            <CotaCard key={c.id} cota={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
