import { PainelFooter } from "@/components/layout/PainelFooter";
import { PageTransition } from "@/components/layout/PageTransition";
import { MinhaContaNav } from "@/components/layout/MinhaContaNav";

/**
 * Área do participante: mesmo rodapé mínimo da administração, sem o rodapé
 * completo do site público. Nav fica aqui (fixa) para não entrar na transição
 * de troca de aba — só o conteúdo abaixo dela anima.
 */
export default function ContaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-pill focus:bg-ambar focus:px-4 focus:py-2 focus:text-papel"
      >
        Pular para o conteúdo
      </a>
      <div className="flex-1">
        <MinhaContaNav />
        <PageTransition>{children}</PageTransition>
      </div>
      <PainelFooter />
    </>
  );
}
