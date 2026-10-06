"use client";

import { useEffect, useRef } from "react";
import { assetPath, cn } from "@/lib/utils";
import type { VideoAtivacao } from "./conteudo";

/** Fração do vídeo que precisa estar na tela para ele tocar sozinho. */
const VISIVEL = 0.6;

/**
 * Player dos vídeos da página. Com `tocarAoAparecer`, o vídeo toca sozinho
 * (mudo — regra dos navegadores para autoplay) quando entra na tela e pausa
 * quando sai. Se o visitante pausar, ele não volta a tocar sozinho; quem pede
 * movimento reduzido no sistema não recebe autoplay. Sem a opção, é um player
 * comum que só baixa o arquivo no play.
 */
export function VideoPlayer({
  video,
  src,
  className,
  tocarAoAparecer = false,
}: {
  video: VideoAtivacao;
  src: string;
  className?: string;
  tocarAoAparecer?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !tocarAoAparecer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visivel = false;
    let pausadoPeloVisitante = false;
    let pausandoPorScroll = false;

    // O atributo `muted` do React não vale para a política de autoplay: precisa da propriedade.
    el.muted = true;

    const aoPausar = () => {
      if (pausandoPorScroll) {
        pausandoPorScroll = false;
        return;
      }
      if (visivel && !el.ended) pausadoPeloVisitante = true;
    };
    const aoTocar = () => {
      pausadoPeloVisitante = false;
    };
    el.addEventListener("pause", aoPausar);
    el.addEventListener("play", aoTocar);

    const observer = new IntersectionObserver(
      ([entrada]) => {
        visivel = entrada.intersectionRatio >= VISIVEL;
        if (visivel && el.paused && !pausadoPeloVisitante) {
          el.play().catch(() => {
            // Navegador bloqueou (ex.: economia de dados): fica o player parado com a capa.
          });
        } else if (!visivel && !el.paused) {
          pausandoPorScroll = true;
          el.pause();
        }
      },
      { threshold: [0, VISIVEL] },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      el.removeEventListener("pause", aoPausar);
      el.removeEventListener("play", aoTocar);
    };
  }, [tocarAoAparecer]);

  return (
    <video
      ref={ref}
      controls
      playsInline
      loop={tocarAoAparecer}
      preload="none"
      poster={video.poster ? assetPath(video.poster) : undefined}
      aria-label={video.titulo}
      data-autoplay={tocarAoAparecer || undefined}
      // contain: na página a caixa já tem a proporção do vídeo; em tela cheia o vertical
      // aparece inteiro (com faixas laterais) em vez de ser cortado.
      className={cn(
        "w-full rounded-[1.25rem] bg-vinho object-contain [&:fullscreen]:rounded-none [&:fullscreen]:bg-black",
        className,
      )}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
