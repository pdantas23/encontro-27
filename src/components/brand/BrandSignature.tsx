import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/utils";

interface BrandSignatureProps {
  /** Tamanho da assinatura. `sm` para cabeçalho e rodapé, `md` para telas centradas (login, 404). */
  size?: "sm" | "md";
  /** Empilha flor em cima do wordmark (como no hero); padrão é lado a lado. */
  vertical?: boolean;
  className?: string;
}

const TAMANHOS = {
  sm: { flor: "w-8", wordmark: "w-[150px]", ano: "text-[10px] tracking-[0.42em] indent-[0.42em]", linha: "w-5", gap: "gap-3" },
  md: { flor: "w-12", wordmark: "w-[220px]", ano: "text-xs tracking-[0.42em] indent-[0.42em]", linha: "w-7", gap: "gap-4" },
} as const;

/**
 * Assinatura da marca fora do hero (cabeçalho interno, rodapé, login, 404):
 * flor + wordmark oficial em serifa + "2027" entre filetes, o mesmo desenho
 * do hero. Substitui o lockup "VINTEVINTESETE" (decisão do Aerton, 18/09/2026).
 * O wordmark é imagem oficial — não recriar em fonte de sistema.
 */
export function BrandSignature({ size = "sm", vertical = false, className = "" }: BrandSignatureProps) {
  const t = TAMANHOS[size];
  return (
    <Link
      href="/"
      aria-label="O Encontro 2027 — página inicial"
      className={`inline-flex items-center ${vertical ? "flex-col" : "flex-row"} ${t.gap} ${className}`}
    >
      <Image src={assetPath("/brand/flor-ouro-sm.webp")} alt="" width={64} height={64} loading="eager" className={`${t.flor} h-auto`} />
      <span className="flex flex-col items-center">
        <Image src={assetPath("/brand/wordmark-ouro.webp")} alt="O Encontro" width={900} height={135} loading="eager" className={`${t.wordmark} h-auto`} />
        <span aria-hidden="true" className={`mt-1.5 flex items-center justify-center gap-2 font-display text-dourado ${t.ano}`}>
          <span className={`h-px ${t.linha} bg-dourado-linha`} />
          2027
          <span className={`h-px ${t.linha} bg-dourado-linha`} />
        </span>
      </span>
    </Link>
  );
}
