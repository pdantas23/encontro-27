import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: ReactNode;
  /** Uma frase de apoio, quando o título não basta. */
  description?: ReactNode;
  /** Rótulo curto acima do título. Usar com parcimônia: no máximo uma ou duas seções por página. */
  eyebrow?: string;
  align?: "left" | "center";
  id?: string;
  className?: string;
}

/**
 * Título de seção no desenho do manual (p.4-10): rótulo em serifa caixa alta,
 * filete dourado e, abaixo, a manchete em serifa caixa baixa — como a p.3
 * ("Natureza que conecta. Cultura que transforma."). Sem rótulo, o filete
 * assina o próprio título.
 */
export function SectionHeading({ title, description, eyebrow, align = "left", id, className }: SectionHeadingProps) {
  const centered = align === "center";
  const filete = <span aria-hidden="true" className={cn("filete", centered && "mx-auto")} />;

  return (
    <div className={cn("max-w-2xl", centered && "mx-auto text-center", className)}>
      {eyebrow ? (
        <>
          <p className="rotulo-secao text-ambar-texto">{eyebrow}</p>
          <span className="mt-4 block">{filete}</span>
        </>
      ) : null}

      <h2
        id={id}
        className={cn(
          "font-display text-heading text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.1] text-balance",
          eyebrow && "mt-5",
        )}
      >
        {title}
      </h2>

      {eyebrow ? null : <span className="mt-5 block">{filete}</span>}

      {description ? <p className="mt-6 text-[17px] leading-7 sm:text-lg sm:leading-relaxed text-marrom">{description}</p> : null}
    </div>
  );
}
