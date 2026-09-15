import { SiteFooter } from "@/components/layout/SiteFooter";

/** Site público sem faixa superior: a marca vive no hero, como no site de 2026. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-pill focus:bg-ambar focus:px-4 focus:py-2 focus:text-papel"
      >
        Pular para o conteúdo
      </a>
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </>
  );
}
