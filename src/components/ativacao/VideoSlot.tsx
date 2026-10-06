import Image from "next/image";
import { assetPath, cn } from "@/lib/utils";
import type { VideoAtivacao } from "./conteudo";
import { VideoPlayer } from "./VideoPlayer";

/**
 * Espaço de vídeo. Com `src` preenchido em conteudo.ts vira o VideoPlayer
 * (`preload="none"`: não pesa no carregamento inicial; `tocarAoAparecer`
 * liga o autoplay mudo ao rolar até ele). Sem `src`, mostra o placeholder na
 * mesma proporção — trocar o arquivo não move o layout.
 */
export function VideoSlot({
  video,
  className,
  tocarAoAparecer,
}: {
  video: VideoAtivacao;
  className?: string;
  tocarAoAparecer?: boolean;
}) {
  const proporcao = video.formato === "vertical" ? "aspect-[9/16]" : "aspect-video";

  if (video.src) {
    return (
      <VideoPlayer
        video={video}
        src={assetPath(video.src)}
        tocarAoAparecer={tocarAoAparecer}
        className={cn(proporcao, className)}
      />
    );
  }

  return (
    <figure
      data-video-pendente={video.id}
      className={cn(
        proporcao,
        "relative grid w-full place-items-center overflow-hidden rounded-[1.25rem] border border-dourado-linha bg-areia",
        className,
      )}
    >
      <Image
        src={assetPath("/brand/flor-flat.webp")}
        alt=""
        width={400}
        height={369}
        sizes="160px"
        className="pointer-events-none absolute w-[38%] max-w-40 opacity-25"
      />
      <figcaption className="relative px-4 text-center">
        <span className="eyebrow block text-ambar-texto">{video.titulo}</span>
        <span className="mt-2 block font-serif text-sm text-marrom-suave">Vídeo em breve</span>
      </figcaption>
    </figure>
  );
}
