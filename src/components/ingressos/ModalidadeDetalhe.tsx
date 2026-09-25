"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database, Json } from "@/types/database";
import { formatCurrencyBRL } from "@/lib/utils";
import { trackSelectTicket } from "@/lib/tracking/events";
import { CTAButton } from "@/components/ui/CTAButton";
import { PageHeader } from "@/components/layout/PageHeader";

type Modalidade = Database["public"]["Tables"]["modalidades_encontro27"]["Row"] & {
  lotes_encontro27: Database["public"]["Tables"]["lotes_encontro27"]["Row"][];
};

/** itens_incluidos/itens_nao_incluidos são jsonb — hoje vêm null, mas quando
 * preenchidos esperamos uma lista simples de strings. Qualquer outro formato
 * é tratado como "sem itens" em vez de quebrar a página. */
function toStringList(value: Json | null): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function ModalidadeDetalhe({ slug }: { slug: string }) {
  const [modalidade, setModalidade] = useState<Modalidade | null | undefined>(undefined);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("modalidades_encontro27")
        .select("*, lotes_encontro27(*)")
        .eq("slug", slug)
        .maybeSingle();
      setModalidade((data as unknown as Modalidade | null) ?? null);
    }
    load();
  }, [slug]);

  if (modalidade === undefined) {
    return (
      <main id="conteudo" className="container-site py-12 sm:py-16">
        <p className="text-marrom-suave">Carregando…</p>
      </main>
    );
  }

  if (!modalidade) {
    return (
      <>
        <PageHeader title="Modalidade não encontrada" />
        <main id="conteudo" className="container-site py-10 sm:py-14">
          <Link
            href="/ingressos"
            className="inline-flex min-h-11 items-center text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro"
          >
            Voltar para ingressos
          </Link>
        </main>
      </>
    );
  }

  const loteAtivo = modalidade.lotes_encontro27.find((lote) => lote.status === "ativo") ?? null;
  const compravel = Boolean(loteAtivo?.preco != null && loteAtivo?.hypercash_checkout_url);
  const disponibilidade =
    loteAtivo?.quantidade != null ? loteAtivo.quantidade - loteAtivo.quantidade_vendida : null;

  const itensIncluidos = toStringList(modalidade.itens_incluidos);

  const secoes: { titulo: string; itens?: string[]; texto?: string | null }[] = [
    { titulo: "O que está incluído", itens: itensIncluidos },
  ];

  return (
    <>
      <PageHeader title={modalidade.nome} description={modalidade.descricao ?? undefined} />

      <main id="conteudo" className="container-site py-10 sm:py-14">
        <div className="max-w-3xl">
          <Link
            href="/ingressos"
            className="inline-flex min-h-11 items-center text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro"
          >
            ← Voltar para ingressos
          </Link>

          <div className="mt-6 divide-y divide-border border-y border-border">
            {secoes.map((secao) => (
              <section key={secao.titulo} className="py-7">
                <h2 className="rotulo-secao text-ambar-texto">{secao.titulo}</h2>
                <span aria-hidden="true" className="filete mt-4" />

                {secao.itens ? (
                  secao.itens.length > 0 ? (
                    <ul className="mt-6 flex flex-col gap-2">
                      {secao.itens.map((item) => (
                        <li key={item} className="flex gap-3 text-[17px] leading-7 text-marrom">
                          <span aria-hidden="true" className="text-dourado">
                            ✦
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-6 text-[17px] leading-7 text-marrom-suave">Em breve</p>
                  )
                ) : (
                  <p className="mt-6 text-[17px] leading-7 text-marrom">{secao.texto ?? "A definir"}</p>
                )}
              </section>
            ))}
          </div>

          <section aria-labelledby="preco-titulo" className="mt-10 rounded-card border border-border bg-areia px-5 py-6">
            <h2 id="preco-titulo" className="rotulo-secao text-ambar-texto">
              Preço e disponibilidade
            </h2>
            <p className="mt-4 font-display text-3xl text-vinho">
              {loteAtivo?.preco != null ? formatCurrencyBRL(loteAtivo.preco) : "Preço a definir"}
            </p>
            <p className="mt-2 text-[15px] text-marrom-suave">
              {disponibilidade != null ? `${disponibilidade} vaga(s) disponível(is)` : "Disponibilidade a definir"}
            </p>

            {compravel && loteAtivo ? (
              <CTAButton
                href={`/checkout?lote=${loteAtivo.id}`}
                size="lg"
                onClick={() => trackSelectTicket(modalidade.slug, modalidade.nome)}
                className="mt-6 w-full sm:w-auto"
              >
                Comprar
              </CTAButton>
            ) : (
              <p className="mt-6 text-marrom-suave">Em breve</p>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
