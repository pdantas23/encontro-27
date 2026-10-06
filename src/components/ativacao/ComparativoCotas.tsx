import { CATEGORIAS, COTAS, formatarValor } from "./conteudo";
import { IconeBeneficio } from "./Icones";

/**
 * Comparação lado a lado. Cada célula traz o texto do próprio Canva para
 * aquela cota (não há texto reescrito nem benefício replicado); "—" quando a
 * cota não inclui aquele tipo de benefício. No celular a tabela rola dentro
 * do próprio quadro, com a coluna de benefícios fixa — a página não estoura.
 */
export function ComparativoCotas() {
  return (
    <section aria-labelledby="comparativo-titulo" className="pb-16 sm:pb-24">
      <div className="container-site">
        <h2 id="comparativo-titulo" className="font-display text-vermelho text-3xl sm:text-4xl leading-tight">
          Compare o que cada cota inclui
        </h2>
        <span aria-hidden="true" className="filete mt-4" />

        <div
          role="region"
          aria-labelledby="comparativo-titulo"
          tabIndex={0}
          className="relative mt-8 overflow-x-auto rounded-[1.25rem] border border-dourado-linha bg-papel"
        >
          <table className="w-full min-w-[56rem] border-collapse text-left">
            <caption className="sr-only">Benefícios de cada cota de ativação de marca, com o valor de cada uma</caption>
            <thead>
              <tr className="bg-areia">
                <th scope="col" className="sticky left-0 z-10 w-28 bg-areia sm:w-44 px-4 py-4 align-bottom">
                  <span className="eyebrow text-[0.65rem] text-marrom-suave">Benefício</span>
                </th>
                {COTAS.map((c) => (
                  <th key={c.id} scope="col" className="px-4 py-4 align-bottom">
                    <span className="block font-display text-lg uppercase tracking-[0.08em] text-vinho">{c.nome}</span>
                    <span className="mt-1 block font-serif text-xl text-vermelho">{formatarValor(c.valor)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIAS.map((cat) => (
                <tr key={cat.id} className="border-t border-dourado-linha/50">
                  <th scope="row" className="sticky left-0 z-10 bg-papel px-3 py-4 align-top font-normal sm:px-4">
                    <span className="flex items-start gap-2">
                      <IconeBeneficio tipo={cat.icone} className="mt-0.5 hidden size-4 shrink-0 text-ambar-texto sm:block" />
                      <span className="font-sans text-sm font-semibold leading-snug text-vinho">{cat.rotulo}</span>
                    </span>
                  </th>
                  {COTAS.map((c) => {
                    const texto = c.beneficios[cat.id];
                    return (
                      <td key={c.id} className="px-4 py-4 align-top font-serif text-sm leading-snug text-marrom">
                        {texto ?? (
                          <>
                            <span aria-hidden="true" className="text-dourado">
                              —
                            </span>
                            <span className="sr-only">Não incluído</span>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-marrom-suave lg:hidden">Deslize a tabela para o lado para ver as quatro cotas.</p>
      </div>
    </section>
  );
}
