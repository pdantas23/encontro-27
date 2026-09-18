import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { assetPath } from "@/lib/utils";
import { CTAButton } from "@/components/ui/CTAButton";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
      <Link href="/" className="inline-flex" aria-label="O Encontro 2027 — página inicial">
        <Image
          src={assetPath("/brand/lockup-2027.webp")}
          alt="O Encontro 2027"
          width={875}
          height={168}
          loading="eager"
          className="h-9 w-auto"
        />
      </Link>

      <p className="eyebrow mt-10 text-ambar-texto">Erro 404</p>
      <h1 className="mt-3 font-display text-3xl text-heading sm:text-4xl">Página não encontrada</h1>
      <p className="mt-4 max-w-md text-[17px] leading-7 text-marrom">
        O endereço que você tentou acessar não existe ou foi movido.
      </p>

      <CTAButton href="/" className="mt-8">
        Voltar para a página inicial
      </CTAButton>
    </div>
  );
}
