import Link from "next/link";

/**
 * Rodapé mínimo das áreas internas (conta do participante e, futuramente,
 * administração) — sem colunas de navegação como o SiteFooter público, só o
 * essencial de copyright e políticas.
 */
export function PainelFooter() {
  return (
    <footer className="border-t border-border">
      <div className="container-site flex flex-col items-center gap-2 py-6 text-center text-xs text-marrom-suave">
        <p>© {new Date().getFullYear()} O Encontro. Todos os direitos reservados.</p>
        <nav aria-label="Políticas" className="flex items-center gap-4">
          <Link href="/privacidade" className="hover:text-vinho">
            Política de privacidade
          </Link>
          <Link href="/termos" className="hover:text-vinho">
            Termos de uso
          </Link>
        </nav>
      </div>
    </footer>
  );
}
