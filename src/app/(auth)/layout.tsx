import { BrandSignature } from "@/components/brand/BrandSignature";

/**
 * Login e cadastro: só a marca em cima (clicável, volta pra home) e o card
 * do formulário — sem menu, sem rodapé. É uma tarefa (entrar/criar conta),
 * não uma página de conteúdo.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:py-20">
      <BrandSignature size="md" vertical />

      <div className="mt-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
