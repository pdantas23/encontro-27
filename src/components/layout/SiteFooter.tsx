import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/utils";
import { SupportLink } from "@/components/layout/SupportLink";

const LINKS_EVENTO = [
  { href: "/o-encontro", label: "O Encontro" },
  { href: "/programacao", label: "Programação" },
  { href: "/convidados", label: "Convidados" },
  { href: "/experiencias", label: "Experiências" },
  { href: "/ingressos", label: "Ingressos" },
  { href: "/faq", label: "Perguntas frequentes" },
];

const LINKS_CONTA = [
  { href: "/login", label: "Minha conta" },
  { href: "/privacidade", label: "Política de privacidade" },
  { href: "/termos", label: "Termos de uso" },
];

/**
 * Rodapé só com informação real. Redes sociais e canal de suporte são
 * PENDENTES (cap. 16): o suporte aparece sozinho quando `whatsapp_support`
 * for preenchido no painel.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-papel">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex min-h-11 items-center" aria-label="O Encontro 2027">
            <Image src={assetPath("/brand/lockup-2027.webp")} alt="O Encontro 2027" width={875} height={168} loading="lazy" className="h-10 w-auto" />
          </Link>
          <p className="mt-4 max-w-xs text-sm text-marrom-suave leading-relaxed">
            Edição comemorativa de 5 anos.
          </p>
          <SupportLink className="mt-4" />
        </div>

        <nav aria-label="Evento">
          <p className="eyebrow text-marrom-suave">Evento</p>
          <ul className="mt-4 space-y-1">
            {LINKS_EVENTO.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center text-marrom hover:text-vinho">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Conta e políticas">
          <p className="eyebrow text-marrom-suave">Conta e políticas</p>
          <ul className="mt-4 space-y-1">
            {LINKS_CONTA.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center text-marrom hover:text-vinho">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border/60">
        <p className="container-site py-5 text-xs text-marrom-suave">© {new Date().getFullYear()} O Encontro. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
