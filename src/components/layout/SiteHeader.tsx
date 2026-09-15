"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { cn, assetPath } from "@/lib/utils";
import { CTAButton } from "@/components/ui/CTAButton";

/** Só o que conduz à venda. "Minha conta" fica discreto no fim. */
const NAV_ITEMS = [
  { href: "/o-encontro", label: "O Encontro" },
  { href: "/experiencias", label: "Experiências" },
  { href: "/convidados", label: "Convidados" },
  { href: "/programacao", label: "Programação" },
  { href: "/faq", label: "FAQ" },
];


export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();
  // Na Home, âncora nativa (rola sempre); nas outras páginas, navega até a Home.
  const CTA_HREF = pathname === "/" ? "#ingressos" : "/#ingressos";

  const close = () => {
    setOpen(false);
    document.body.style.overflow = "";
  };

  // Trava o scroll enquanto o menu mobile está aberto.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-papel border-b border-border">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-pill focus:bg-ambar focus:px-4 focus:py-2 focus:text-papel"
      >
        Pular para o conteúdo
      </a>

      <div className="container-site flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link href="/" className="flex min-h-11 items-center gap-2 shrink-0">
          <Image src={assetPath("/brand/flor-ouro-sm.webp")} alt="" width={40} height={38} priority className="w-10 lg:w-9 h-auto" />
          <span className="font-display text-2xl lg:text-xl text-vinho tracking-wide">O Encontro</span>
          <span className="font-serif text-sm lg:text-xs text-ambar-texto tracking-[0.25em] mt-1">2027</span>
        </Link>

        <nav aria-label="Principal" className="hidden lg:flex items-center gap-5 xl:gap-7">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center whitespace-nowrap text-sm font-medium text-marrom hover:text-vinho",
                  active && "text-vinho underline underline-offset-8 decoration-dourado decoration-2",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden lg:inline-flex min-h-11 items-center whitespace-nowrap text-sm text-marrom-suave hover:text-vinho px-3">
            Minha conta
          </Link>
          <CTAButton href={CTA_HREF} className="hidden sm:inline-flex">
            Comprar ingresso
          </CTAButton>
          <button
            type="button"
            className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-pill text-vinho hover:bg-areia"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {/* Escurece o resto da página enquanto o menu está aberto; toque fecha. */}
      {open ? (
        <div aria-hidden="true" onClick={close} className="lg:hidden fixed inset-x-0 top-16 bottom-0 bg-vinho/40" />
      ) : null}
      {/* Sobreposto ao conteúdo (não empurra a página): fechar o menu não
          desloca o alvo de uma âncora recém-clicada. */}
      <div
        id={menuId}
        hidden={!open}
        className="lg:hidden absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-papel shadow-card"
      >
        <nav aria-label="Principal (celular)" className="container-site flex flex-col py-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={close}
              className="min-h-12 flex items-center text-lg font-medium text-vinho border-b border-border/60 last:border-0"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/login" onClick={close} className="min-h-12 flex items-center text-base text-marrom-suave">
            Minha conta
          </Link>
          <CTAButton
            href={CTA_HREF}
            size="lg"
            className="mt-3 w-full sm:hidden"
            onClick={(event) => {
              close();
              if (CTA_HREF.startsWith("#")) {
                event.preventDefault();
                requestAnimationFrame(() => {
                  document.getElementById("ingressos")?.scrollIntoView({ block: "start" });
                  window.history.replaceState(null, "", CTA_HREF);
                });
              }
            }}
          >
            Comprar ingresso
          </CTAButton>
        </nav>
      </div>
    </header>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}
