import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: ReactNode;
  /** Uma frase de apoio, quando o título não basta. */
  description?: ReactNode;
  /** Label curto acima do título. Usar com parcimônia: no máximo uma ou duas seções por página. */
  eyebrow?: string;
  align?: "left" | "center";
  id?: string;
  className?: string;
}

/** Título de seção: serifa grande, sem ornamentos. */
export function SectionHeading({ title, description, eyebrow, align = "left", id, className }: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div className={cn("max-w-2xl", centered && "mx-auto text-center", className)}>
      {eyebrow ? <p className="eyebrow text-ambar-texto mb-3">{eyebrow}</p> : null}
      <h2 id={id} className="font-display text-heading text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.1] text-balance">
        {title}
      </h2>
      {description ? <p className="mt-4 text-[17px] leading-7 sm:text-lg sm:leading-relaxed text-marrom">{description}</p> : null}
    </div>
  );
}
