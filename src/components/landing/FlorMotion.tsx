"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { assetPath } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/**
 * Camada de motion: a flor do hero acompanha o scroll até o artwork da
 * seção "5 anos".
 *
 * Arquitetura: uma cópia da flor em `position: fixed`. Como o scroll não
 * move um elemento fixo, todo o deslocamento vem do transform, e o
 * transform é 100 % do progresso do ScrollTrigger (scrub). Origem = rect da
 * flor original; destino = rect do artwork convertido para a viewport no
 * scroll em que o trigger termina. Ao chegar, a cópia é "ancorada"
 * (vira absolute no documento) para seguir o artwork; ao voltar, é
 * desancorada. Tudo é recalculado em cada refresh, nunca por frame.
 */
const ORIGEM = "[data-flor-origem]";
const DESTINO = "[data-flor-destino]";

type Caixa = { x: number; y: number; w: number; h: number };

export function FlorMotion() {
  const cloneRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const clone = cloneRef.current;
    const main = clone?.parentElement;
    const origem = document.querySelector<HTMLElement>(ORIGEM);
    const destino = document.querySelector<HTMLElement>(DESTINO);
    if (!clone || !main || !origem || !destino) return;

    const mm = gsap.matchMedia();

    /** Caixa em coordenadas do documento. */
    const doc = (el: Element): Caixa => {
      const r = el.getBoundingClientRect();
      return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
    };
    const centro = (c: Caixa) => ({ x: c.x + c.w / 2, y: c.y + c.h / 2 });

    /** Ponto de encaixe no artwork (canto superior direito), em coordenadas do documento. */
    const encaixeDoc = (escala: number) => {
      const o = doc(origem);
      const d = doc(destino);
      const w = o.w * escala;
      return { x: d.x + d.w - w * 0.65, y: d.y + w * 0.7 };
    };

    /**
     * Cópia fixa sobre a original. Com scroll 0 a viewport coincide com o
     * documento, então a caixa da original serve de base para o fixed.
     */
    const alinhar = () => {
      const o = doc(origem);
      gsap.set(clone, {
        position: "fixed",
        left: o.x,
        top: o.y,
        width: o.w,
        height: o.h,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
      });
      clone.style.visibility = "visible";
      origem.style.visibility = "hidden";
    };

    /** Ancora a cópia no documento, exatamente onde o trajeto termina. */
    const ancorar = (escala: number, rotation: number, opacity: number) => {
      const o = doc(origem);
      const m = doc(main);
      const e = encaixeDoc(escala);
      gsap.set(clone, {
        position: "absolute",
        left: e.x - o.w / 2 - m.x,
        top: e.y - o.h / 2 - m.y,
        x: 0,
        y: 0,
        scale: escala,
        rotation,
        opacity,
      });
    };

    const heroEl = origem.closest("section") ?? origem;

    mm.add(
      {
        // Abaixo de 1200 px a margem direita fica apertada: usa o comportamento de tablet.
        desktop: "(min-width: 1200px) and (prefers-reduced-motion: no-preference)",
        tablet: "(min-width: 640px) and (max-width: 1199px) and (prefers-reduced-motion: no-preference)",
        mobile: "(max-width: 639px) and (prefers-reduced-motion: no-preference)",
      },
      (ctx) => {
        const { desktop, tablet, mobile } = ctx.conditions as Record<string, boolean>;
        alinhar();

        if (desktop) {
          const ESCALA_FINAL = 0.6;
          const ESCALA_ROTA = 0.42;
          const prosa = document.querySelector<HTMLElement>("#porque-titulo + div");

          // Geometria do trajeto, em deslocamento a partir do centro da origem
          // (viewport). Lida a cada refresh via function-values.
          let fim = 0; // scroll em que o trigger termina (preenchido no refresh)
          const oc = () => centro(doc(origem));
          // margem direita: meio do espaço livre entre o fim do texto e a borda da tela
          const xDireita = () => {
            const limite = prosa ? doc(prosa).x + doc(prosa).w : window.innerWidth * 0.85;
            return (limite + window.innerWidth) / 2 - oc().x;
          };
          const yDescida = () => window.innerHeight * 0.48 - oc().y; // desce até ~metade da tela
          const fimX = () => encaixeDoc(ESCALA_FINAL).x - oc().x;
          const fimY = () => encaixeDoc(ESCALA_FINAL).y - fim - oc().y;

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: heroEl,
              start: 0, // scroll 0: viewport == documento, a cópia coincide com a original
              endTrigger: destino,
              end: "top 25%",
              scrub: true,
              invalidateOnRefresh: true,
              onRefresh: (self) => {
                fim = self.end;
                if (self.progress >= 1) ancorar(ESCALA_FINAL, -12, 0.96);
              },
              onLeave: () => ancorar(ESCALA_FINAL, -12, 0.96),
              onEnterBack: () => {
                // Desancora: volta a fixed já no estado final do trajeto, e o
                // scrub reverte a partir daí (sem invalidar valores gravados).
                const o = doc(origem);
                gsap.set(clone, {
                  position: "fixed",
                  left: o.x,
                  top: o.y,
                  x: fimX(),
                  y: fimY(),
                  scale: ESCALA_FINAL,
                  rotation: -12,
                  opacity: 0.96,
                });
              },
            },
          });

          // 0–15 %: sai da coluna central para a direita, encolhendo (curva suave)
          // (arco: sobe um pouco enquanto sai para a direita, depois desce)
          tl.to(clone, { x: xDireita, scale: ESCALA_ROTA, ease: "power1.out", duration: 0.15 }, 0)
            .to(clone, { y: -30, rotation: -3, opacity: 0.82, ease: "sine.out", duration: 0.15 }, 0)
            // 15–75 %: desce pela margem direita
            .to(clone, { y: yDescida, rotation: -8, duration: 0.6 }, 0.15)
            // 75–100 %: atravessa pela faixa livre (entre a prosa e o título de 5 anos) até o artwork
            .to(clone, { x: fimX, ease: "sine.inOut", duration: 0.25 }, 0.75)
            .to(clone, { y: fimY, scale: ESCALA_FINAL, rotation: -12, opacity: 0.96, ease: "sine.inOut", duration: 0.25 }, 0.75);
        } else if (tablet) {
          // Sai junto com o hero (em fixed, "acompanhar a página" = subir na
          // mesma proporção do scroll), um pouco mais rápido, e some.
          // Reaparece já ancorada no artwork.
          const distSaida = () => heroEl.getBoundingClientRect().height * 0.6;
          const saida = { x: 0, y: () => -distSaida() - 60, scale: 0.85, rotation: 0, opacity: 0 };
          gsap.to(clone, {
            ...saida,
            ease: "none",
            scrollTrigger: { trigger: heroEl, start: 0, end: distSaida, scrub: true, invalidateOnRefresh: true },
          });
          const chegada = { escala: 0.5, rotation: -12 };
          gsap.fromTo(
            clone,
            { opacity: 0 },
            {
              opacity: 0.96,
              immediateRender: false,
              ease: "none",
              scrollTrigger: {
                trigger: destino,
                start: "top 75%",
                end: "top 45%",
                scrub: true,
                onEnter: () => ancorar(chegada.escala, chegada.rotation, 0),
                onRefresh: (self) => {
                  if (self.progress > 0) ancorar(chegada.escala, chegada.rotation, self.progress * 0.96);
                },
                onLeaveBack: () => {
                  const o = doc(origem);
                  gsap.set(clone, { position: "fixed", left: o.x, top: o.y, ...saida, y: saida.y() });
                },
              },
            },
          );
        } else if (mobile) {
          // Acompanha o hero para cima (1:1 com o scroll) mais um deslize curto, e some.
          const distHero = () => heroEl.getBoundingClientRect().height;
          gsap.to(clone, {
            y: () => -distHero() - 40,
            scale: 0.85,
            opacity: 0,
            ease: "none",
            scrollTrigger: { trigger: heroEl, start: 0, end: distHero, scrub: true, invalidateOnRefresh: true },
          });
        }
      },
    );

    // Base recalculada antes de cada refresh (fontes, imagens, resize).
    const onRefreshInit = () => {
      if (clone.style.visibility === "visible") alinhar();
    };
    ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    if (document.readyState === "complete") refresh();
    else window.addEventListener("load", refresh, { once: true });

    return () => {
      window.removeEventListener("load", refresh);
      ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
      mm.revert();
      clone.style.visibility = "hidden";
      origem.style.visibility = "";
    };
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={cloneRef}
      src={assetPath("/brand/flor-ouro.webp")}
      alt=""
      aria-hidden="true"
      width={600}
      height={571}
      decoding="async"
      className="pointer-events-none z-10 select-none"
      style={{ position: "fixed", visibility: "hidden", transformOrigin: "50% 50%" }}
    />
  );
}
