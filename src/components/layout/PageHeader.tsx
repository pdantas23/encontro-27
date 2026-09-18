import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { assetPath } from "@/lib/utils";

interface PageHeaderProps {
  /** Sem título, o cabeçalho é só a barra com a marca. */
  title?: string;
  /** Uma frase de apoio, quando o título não basta. */
  description?: ReactNode;
}

/**
 * Cabeçalho das páginas internas. A home assina a marca no hero; as demais
 * páginas não tinham assinatura nenhuma — quem chegava de anúncio só via o
 * logo no rodapé. Traz o lockup oficial e o título no desenho do manual
 * (serifa + filete dourado, p.4-10).
 */
export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="container-site py-6 sm:py-8">
        <Link href="/" className="inline-block" aria-label="O Encontro 2027 — página inicial">
          <Image
            src={assetPath("/brand/lockup-2027.webp")}
            alt="O Encontro 2027"
            width={875}
            height={168}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </Link>
      </div>

      {title ? (
        <div className="container-site pb-10 sm:pb-12">
          <h1 className="font-display text-heading text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.1] text-balance">
            {title}
          </h1>
          <span aria-hidden="true" className="filete mt-5" />
          {description ? (
            <p className="mt-6 max-w-2xl text-[17px] leading-7 sm:text-lg sm:leading-relaxed text-marrom text-pretty">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
