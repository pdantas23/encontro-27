import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-sans font-semibold " +
  "transition-colors duration-150 select-none whitespace-nowrap " +
  "disabled:opacity-50 disabled:pointer-events-none";

// Só o primário é pill (é o botão de compra, o único que precisa se destacar).
const variants: Record<Variant, string> = {
  // Âmbar Cajuína escurecido só o necessário para AA: papel sobre #a4622b = 4.63:1.
  primary: "rounded-pill bg-ambar-escuro text-papel hover:bg-ambar-pressed active:bg-ambar-pressed",
  // Contorno fino, canto discreto: ação secundária.
  secondary: "rounded-lg border border-dourado text-vinho bg-transparent hover:bg-areia active:bg-areia",
  // Link de texto com o mesmo tamanho de toque.
  ghost: "text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro",
};

// Alturas ≥ 44px em todos os tamanhos (área de toque mínima).
const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 text-base",
  lg: "min-h-14 sm:min-h-13 px-8 sm:px-7 text-lg",
};

interface StyleProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type LinkProps = StyleProps & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;
type ButtonProps = StyleProps & { href?: undefined } & Omit<ComponentProps<"button">, "className" | "children">;

/**
 * CTA do site público. Com `href` renderiza um Link (navegação); sem `href`,
 * um <button>. Variantes explícitas em vez de booleans.
 */
export function CTAButton({ variant = "primary", size = "md", className, children, ...rest }: LinkProps | ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (rest.href !== undefined) {
    // Âncora na própria página: <a> nativo. O Link do Next não rola de novo
    // quando o hash já está na URL (ex.: clicar "Comprar ingresso" no header e
    // depois "Ver ingressos" no fim da página).
    if (rest.href.startsWith("#")) {
      const { href, ...anchorRest } = rest as LinkProps;
      return (
        <a {...(anchorRest as ComponentProps<"a">)} href={href} className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link {...rest} href={rest.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { href: _omit, type = "button", ...buttonRest } = rest as ButtonProps;
  void _omit;
  return (
    <button {...buttonRest} type={type} className={classes}>
      {children}
    </button>
  );
}
