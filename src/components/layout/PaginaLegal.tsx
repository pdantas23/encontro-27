import { PageHeader } from "@/components/layout/PageHeader";

interface PaginaLegalProps {
  titulo: string;
  secoes: string[];
}

/**
 * Casca das páginas jurídicas (privacidade e termos). O conteúdo depende de
 * validação da organização (capítulo 16 do levantamento) — aqui só existe a
 * estrutura de seções, com o aviso provisório em Areia Clara e Dourado Fosco
 * em vez do amarelo de biblioteca que estava fora da paleta.
 */
export function PaginaLegal({ titulo, secoes }: PaginaLegalProps) {
  return (
    <>
      <PageHeader title={titulo} />

      <main id="conteudo" className="container-site py-10 sm:py-14">
        <div className="max-w-3xl">
          <p className="rounded-card border border-dourado/50 bg-areia px-5 py-4 text-[15px] leading-6 text-marrom">
            Este conteúdo ainda depende de validação da organização (capítulo 16 do levantamento de
            requisitos). O texto abaixo é uma estrutura provisória e será substituído pelo conteúdo
            definitivo assim que estiver disponível.
          </p>

          <div className="mt-10 divide-y divide-border border-y border-border">
            {secoes.map((secao) => (
              <section key={secao} className="py-7">
                <h2 className="rotulo-secao text-ambar-texto">{secao}</h2>
                <span aria-hidden="true" className="filete mt-4" />
                <p className="mt-6 text-[17px] leading-7 text-marrom">A definir.</p>
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
