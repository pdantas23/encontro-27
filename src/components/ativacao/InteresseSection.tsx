"use client";

import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { COTAS, cotaPorId, formatarValor, linkWhatsAppComercial, type Cota } from "./conteudo";
import { ID_INTERESSE, useCotaSelecionada } from "./CotaSelecionada";

/**
 * Contato comercial: WhatsApp "Encontro. Comercial". A mensagem já leva a cota
 * escolhida. Nada é gravado no site — a conversa acontece no WhatsApp.
 */
function CanalDeContato({ cota }: { cota: Cota | null }) {
  return (
    <div
      data-captacao="whatsapp"
      data-cota={cota?.id ?? ""}
      className="rounded-[1.25rem] border border-dourado-linha bg-papel/80 px-6 py-8 text-center sm:px-10"
    >
      <p className="eyebrow text-ambar-texto">Contato comercial</p>
      <p className="mt-3 font-display text-2xl text-vinho sm:text-[1.75rem]">Fale com o comercial no WhatsApp</p>
      <p className="mx-auto mt-3 max-w-md font-serif text-[15px] leading-relaxed text-marrom">
        {cota ? (
          <>
            A mensagem já vai com a {cota.nome} <span className="whitespace-nowrap">({formatarValor(cota.valor)})</span>.
          </>
        ) : (
          "Escolha uma cota acima e ela já vai junto na mensagem."
        )}
      </p>
      <a
        href={linkWhatsAppComercial(cota)}
        target="_blank"
        rel="noopener noreferrer"
        // Verde do WhatsApp um pouco mais fechado que o #25D366: texto branco grande em negrito = 3.1:1 (AA texto grande).
        className="brilho-whatsapp mt-6 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-pill bg-[#1DA851] px-7 font-sans text-xl font-bold text-white transition-colors hover:bg-[#178F44] sm:w-auto"
      >
        <WhatsAppIcon fill="currentColor" className="size-6 shrink-0" />
        Quero ativar minha marca
        <span className="sr-only"> (abre o WhatsApp)</span>
      </a>
    </div>
  );
}

export function InteresseSection() {
  const { cotaId, escolher } = useCotaSelecionada();
  const cota = cotaPorId(cotaId);

  return (
    <section id={ID_INTERESSE} aria-labelledby="interesse-titulo" className="scroll-mt-4 bg-areia py-16 sm:py-24">
      <div className="container-site grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <p className="rotulo-secao text-ambar-texto">Ativação de marca</p>
          <span aria-hidden="true" className="filete mt-4" />
          <h2
            id="interesse-titulo"
            tabIndex={-1}
            data-foco-interesse
            className="mt-5 font-display text-vermelho text-4xl sm:text-5xl leading-[1.05] text-balance outline-none focus-visible:outline-3"
          >
            Quero ativar minha marca
          </h2>
          <p className="mt-6 max-w-md font-serif text-[17px] leading-relaxed text-marrom">
            Escolha a cota de interesse e fale com o comercial pelo WhatsApp.
          </p>
        </div>

        <div className="space-y-6">
          <fieldset>
            <legend className="eyebrow text-marrom-suave">Cota de interesse</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {COTAS.map((c) => {
                const marcada = c.id === cotaId;
                return (
                  <label
                    key={c.id}
                    className={cn(
                      "flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border bg-papel px-4 py-3 font-normal transition-colors",
                      "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ambar",
                      marcada ? "border-ambar ring-1 ring-ambar" : "border-dourado-linha hover:border-ambar-texto",
                    )}
                  >
                    <input
                      type="radio"
                      name="cota-interesse"
                      value={c.id}
                      checked={marcada}
                      onChange={() => escolher(c.id)}
                      className="size-5 shrink-0 accent-ambar-escuro"
                    />
                    <span>
                      <span className="block font-display text-lg uppercase tracking-[0.06em] text-vinho">{c.nome}</span>
                      <span className="block font-serif text-base text-marrom">{formatarValor(c.valor)}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <p aria-live="polite" className="min-h-6 font-serif text-[15px] text-marrom" data-resumo-cota>
            {cota ? (
              <>
                Cota escolhida: <strong className="font-semibold text-vinho">{cota.nome}</strong> —{" "}
                <span className="whitespace-nowrap">{formatarValor(cota.valor)}</span>
              </>
            ) : (
              "Nenhuma cota escolhida ainda."
            )}
          </p>

          <CanalDeContato cota={cota} />
        </div>
      </div>
    </section>
  );
}
