import Link from "next/link";
import Image from "next/image";
import { assetPath } from "@/lib/utils";

/**
 * Login e cadastro: só a marca em cima (clicável, volta pra home) e o card
 * do formulário — sem menu, sem rodapé. É uma tarefa (entrar/criar conta),
 * não uma página de conteúdo.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:py-20">
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

      <div className="mt-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
