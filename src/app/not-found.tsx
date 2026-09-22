import type { Metadata } from "next";
import { CTAButton } from "@/components/ui/CTAButton";
import { BrandSignature } from "@/components/brand/BrandSignature";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
      <BrandSignature size="md" vertical />

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
