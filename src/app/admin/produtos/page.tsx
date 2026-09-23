"use client";

import { useEffect, useState } from "react";
import { Pencil, Search } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import type { Database } from "@/types/database";

type ModalidadeRow = Database["public"]["Tables"]["modalidades_encontro27"]["Row"];
type LoteRow = Database["public"]["Tables"]["lotes_encontro27"]["Row"];

// Select aninhado não é tipado automaticamente pelo supabase-js — tipamos à mão
// e convertemos com `as unknown as` (mesma ideia do admin/pedidos).
type ModalidadeComLotes = ModalidadeRow & { lotes_encontro27: LoteRow[] };

/** Uma linha da tabela = um lote de um produto (produto sem lote aparece com lote = null). */
interface Linha {
  modalidade: ModalidadeComLotes;
  lote: LoteRow | null;
}

const STATUS_LOTE = [
  { value: "ativo", label: "Ativo" },
  { value: "encerrado", label: "Encerrado" },
  { value: "esgotado", label: "Esgotado" },
] as const;
type StatusLote = (typeof STATUS_LOTE)[number]["value"];

const FILTRO_OPCOES: { value: StatusLote | "todos"; label: string }[] = [
  { value: "todos", label: "Todos os status" },
  ...STATUS_LOTE,
];

const STATUS_BADGE: Record<string, string> = {
  ativo: "bg-verde/10 text-[color-mix(in_srgb,var(--color-verde)_70%,black)]",
  encerrado: "bg-areia text-marrom-suave",
  esgotado: "bg-vermelho/10 text-vermelho",
};
const STATUS_LABEL: Record<string, string> = Object.fromEntries(STATUS_LOTE.map((s) => [s.value, s.label]));

function isoToDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function datetimeLocalToIso(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

// Números são digitados (campos de texto, sem setas de incremento): estas funções
// só deixam passar o que faz sentido e convertem na hora de salvar.
function soDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}
function precoDigitado(valor: string): string {
  const limpo = valor.replace(/[^\d.,]/g, "");
  const ultimo = Math.max(limpo.lastIndexOf(","), limpo.lastIndexOf("."));
  if (ultimo === -1) return limpo;
  const antes = limpo.slice(0, ultimo);
  const inteira = antes.replace(/[.,]/g, "");
  const decimais = limpo.slice(ultimo + 1);
  if (decimais.length <= 2) return `${inteira}${limpo[ultimo]}${decimais}`;
  // 3 dígitos depois do separador e um agrupamento válido antes ("3.300", "1.000.000"): era milhar.
  if (decimais.length === 3 && /^\d{1,3}([.,]\d{3})*$/.test(antes)) return inteira + decimais;
  // Senão é dígito a mais nos centavos ("2397,509"): descarta.
  return `${inteira}${limpo[ultimo]}${decimais.slice(0, 2)}`;
}
function numeroOuNulo(valor: string): number | null {
  const texto = valor.trim().replace(",", ".");
  return texto === "" ? null : Number(texto);
}

interface FormLote {
  /** null = lote que ainda não existe (é criado ao salvar). */
  id: string | null;
  nome: string;
  preco: string;
  quantidade: string;
  inicioVenda: string;
  fimVenda: string;
  status: StatusLote;
  hypercashCheckoutUrl: string;
  ordem: string;
}
const NOVO = "novo";

interface Edicao {
  modalidadeId: string;
  produto: string;
  /** Lotes que o produto já tem, em ordem. */
  lotes: LoteRow[];
  /** Id do lote escolhido no seletor, ou NOVO. */
  selecionado: string;
  lote: FormLote;
  vendidos: number;
}

function formLote(l: LoteRow): FormLote {
  return {
    id: l.id,
    nome: l.nome,
    preco: l.preco === null ? "" : String(l.preco).replace(".", ","),
    quantidade: l.quantidade === null ? "" : String(l.quantidade),
    inicioVenda: isoToDatetimeLocal(l.inicio_venda),
    fimVenda: isoToDatetimeLocal(l.fim_venda),
    status: (STATUS_LOTE.some((s) => s.value === l.status) ? l.status : "ativo") as StatusLote,
    hypercashCheckoutUrl: l.hypercash_checkout_url ?? "",
    ordem: String(l.ordem),
  };
}

// Lote novo: nome e ordem seguem a sequência do produto. Começa "Encerrado" pra não
// entrar à venda sozinho (o site vende o lote ativo — dois ativos no mesmo produto
// deixariam o preço ambíguo); quem abre o lote muda o status.
function loteNovo(lotes: LoteRow[]): FormLote {
  const maiorOrdem = Math.max(0, ...lotes.map((l) => l.ordem));
  return {
    id: null,
    nome: `Lote ${lotes.length + 1}`,
    preco: "",
    quantidade: "",
    inicioVenda: "",
    fimVenda: "",
    status: "encerrado",
    hypercashCheckoutUrl: "",
    ordem: String(maiorOrdem + 1),
  };
}

export default function AdminProdutosPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [modalidades, setModalidades] = useState<ModalidadeComLotes[] | null>(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<StatusLote | "todos">("todos");
  const [edicao, setEdicao] = useState<Edicao | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("modalidades_encontro27")
        .select("*, lotes_encontro27(*)")
        .order("ordem", { ascending: true });
      setModalidades((data ?? []) as unknown as ModalidadeComLotes[]);
    }

    load();
  }, [user, refreshKey]);

  function editar(modalidade: ModalidadeComLotes, lote: LoteRow | null) {
    const lotes = [...modalidade.lotes_encontro27].sort((a, b) => a.ordem - b.ordem);
    setErro(null);
    setFeedback(null);
    setEdicao({
      modalidadeId: modalidade.id,
      produto: modalidade.nome,
      lotes,
      selecionado: lote?.id ?? NOVO,
      lote: lote ? formLote(lote) : loteNovo(lotes),
      vendidos: lote?.quantidade_vendida ?? 0,
    });
  }

  // Cada lote tem os próprios dados: trocar o lote mostra os valores dele (sem salvar o que
  // estava aberto). "novo" abre em branco e só passa a existir ao salvar.
  function escolherLote(id: string) {
    setErro(null);
    setEdicao((atual) => {
      if (!atual) return atual;
      if (id === NOVO) return { ...atual, selecionado: NOVO, lote: loteNovo(atual.lotes), vendidos: 0 };
      const existente = atual.lotes.find((l) => l.id === id);
      if (!existente) return atual;
      return { ...atual, selecionado: id, lote: formLote(existente), vendidos: existente.quantidade_vendida };
    });
  }

  // Só o lote é gerenciado aqui: os dados do produto (nome, descrição, itens...) são fixos.
  async function salvar(event: React.FormEvent) {
    event.preventDefault();
    if (!edicao) return;

    setSalvando(true);
    setErro(null);
    const { lote } = edicao;
    const supabase = createClient();

    const dados = {
      preco: numeroOuNulo(lote.preco),
      quantidade: numeroOuNulo(lote.quantidade),
      inicio_venda: datetimeLocalToIso(lote.inicioVenda),
      fim_venda: datetimeLocalToIso(lote.fimVenda),
      status: lote.status,
      hypercash_checkout_url: lote.hypercashCheckoutUrl.trim() || null,
      ordem: Number(lote.ordem) || 0,
    };
    const { error } = lote.id
      ? await supabase.from("lotes_encontro27").update(dados).eq("id", lote.id)
      : await supabase.from("lotes_encontro27").insert({ ...dados, modalidade_id: edicao.modalidadeId, nome: lote.nome });

    setSalvando(false);

    if (error) {
      setErro(`Erro ao salvar o lote: ${error.message}`);
      return;
    }

    setEdicao(null);
    setFeedback(lote.id ? "Lote atualizado." : "Lote criado.");
    setRefreshKey((key) => key + 1);
  }

  if (authLoading || !user) return null;

  const termo = busca.trim().toLowerCase();
  const linhas = (modalidades ?? []).flatMap((modalidade): Linha[] => {
    const lotes = [...modalidade.lotes_encontro27].sort((a, b) => a.ordem - b.ordem);
    return lotes.length > 0 ? lotes.map((lote) => ({ modalidade, lote })) : [{ modalidade, lote: null }];
  });
  const linhasVisiveis = linhas.filter(({ modalidade, lote }) => {
    if (filtro !== "todos" && lote?.status !== filtro) return false;
    if (!termo) return true;
    return modalidade.nome.toLowerCase().includes(termo) || (lote?.nome.toLowerCase().includes(termo) ?? false);
  });

  const atualizarLote = (parte: Partial<FormLote>) =>
    setEdicao((atual) => (atual ? { ...atual, lote: { ...atual.lote, ...parte } } : atual));

  return (
    <AdminLayout user={user}>
      <h1>Produtos</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-marrom-suave"
          />
          <input
            type="search"
            aria-label="Buscar produtos"
            placeholder="Buscar"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            className="pl-9"
          />
        </div>
        <Dropdown ariaLabel="Filtrar por status" value={filtro} options={FILTRO_OPCOES} onChange={setFiltro} className="w-52" />
      </div>

      {feedback && <p className="mt-4 text-sm">{feedback}</p>}

      {!modalidades ? (
        <p className="mt-6">Carregando...</p>
      ) : linhasVisiveis.length === 0 ? (
        <p className="mt-6 text-marrom-suave">Nenhum produto encontrado.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th style={thStyle}>Produto</th>
                <th style={thStyle}>Lote</th>
                <th style={thStyle}>Preço</th>
                <th style={thStyle}>Vendidos</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {linhasVisiveis.map(({ modalidade, lote }) => (
                <tr key={lote?.id ?? `sem-lote-${modalidade.id}`}>
                  <td style={tdStyle}>
                    <div className="font-semibold text-vinho">{modalidade.nome}</div>
                    {!modalidade.ativo && <div className="text-xs text-marrom-suave">Oculto no site</div>}
                  </td>
                  <td style={tdStyle}>{lote?.nome ?? "-"}</td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {lote?.preco != null ? formatCurrencyBRL(Number(lote.preco)) : "-"}
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {lote ? (lote.quantidade === null ? lote.quantidade_vendida : `${lote.quantidade_vendida} / ${lote.quantidade}`) : "-"}
                  </td>
                  <td style={tdStyle}>
                    {lote ? (
                      <span
                        className={cn(
                          "inline-block rounded-pill px-2.5 py-0.5 text-xs font-semibold",
                          STATUS_BADGE[lote.status] ?? STATUS_BADGE.encerrado,
                        )}
                      >
                        {STATUS_LABEL[lote.status] ?? lote.status}
                      </span>
                    ) : (
                      <span className="inline-block rounded-pill bg-areia px-2.5 py-0.5 text-xs font-semibold text-marrom-suave">
                        Sem lote
                      </span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <button
                      type="button"
                      onClick={() => editar(modalidade, lote)}
                      aria-label={`Editar ${modalidade.nome}${lote ? ` (${lote.nome})` : ""}`}
                      title="Editar"
                      className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-marrom-suave transition-colors hover:bg-areia hover:text-vinho"
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        aberto={edicao !== null}
        titulo="Editar lote"
        tituloExtra={edicao ? <span className="text-sm text-marrom-suave">{edicao.produto}</span> : undefined}
        onFechar={() => !salvando && setEdicao(null)}
        larguraMax="max-w-lg"
      >
        {edicao && (
          <form onSubmit={salvar} className="text-sm" style={{ marginTop: 0 }}>
            <div className="mt-2 flex flex-col gap-4">
              <div>
                <span className="font-semibold text-vinho">Lote</span>
                <Dropdown
                  ariaLabel="Lote"
                  value={edicao.selecionado}
                  options={[
                    ...edicao.lotes.map((l) => ({ value: l.id, label: l.nome })),
                    { value: NOVO, label: `${loteNovo(edicao.lotes).nome} (novo)` },
                  ]}
                  onChange={escolherLote}
                  className="mt-1.5"
                />
              </div>

              <label className="block">
                Preço (R$)
                <input
                  inputMode="decimal"
                  autoComplete="off"
                  value={edicao.lote.preco}
                  onChange={(e) => atualizarLote({ preco: precoDigitado(e.target.value) })}
                />
              </label>

              <label className="block">
                Quantidade
                <input
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Sem limite"
                  value={edicao.lote.quantidade}
                  onChange={(e) => atualizarLote({ quantidade: soDigitos(e.target.value) })}
                />
              </label>
              {edicao.lote.id && (
                <p className="text-xs text-marrom-suave" style={{ marginTop: -8 }}>
                  Vendidos: {edicao.vendidos} (controlado automaticamente)
                </p>
              )}

              <label className="block">
                Início da venda
                <input
                  type="datetime-local"
                  value={edicao.lote.inicioVenda}
                  onChange={(e) => atualizarLote({ inicioVenda: e.target.value })}
                />
              </label>

              <label className="block">
                Fim da venda
                <input
                  type="datetime-local"
                  value={edicao.lote.fimVenda}
                  onChange={(e) => atualizarLote({ fimVenda: e.target.value })}
                />
              </label>

              <div>
                <span className="font-semibold text-vinho">Status</span>
                <Dropdown
                  ariaLabel="Status do lote"
                  value={edicao.lote.status}
                  options={[...STATUS_LOTE]}
                  onChange={(status) => atualizarLote({ status })}
                  className="mt-1.5"
                />
              </div>

              <label className="block">
                Ordem
                <input
                  inputMode="numeric"
                  autoComplete="off"
                  value={edicao.lote.ordem}
                  onChange={(e) => atualizarLote({ ordem: soDigitos(e.target.value) })}
                />
              </label>

              <label className="block">
                Link de pagamento (Hypercash)
                <input
                  placeholder="https://pay.hypercash.com.br/pt/checkout/..."
                  value={edicao.lote.hypercashCheckoutUrl}
                  onChange={(e) => atualizarLote({ hypercashCheckoutUrl: e.target.value })}
                />
              </label>
            </div>

            {erro && (
              <div role="alert" className="mt-4 text-right text-vermelho">
                {erro}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setEdicao(null)}
                disabled={salvando}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-pill border border-dourado px-5 font-semibold text-vinho transition-colors hover:bg-areia disabled:cursor-default disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-pill bg-ambar-escuro px-5 font-semibold text-papel transition-colors hover:bg-ambar-pressed disabled:cursor-default disabled:opacity-50"
              >
                {salvando ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </AdminLayout>
  );
}

// Inline (e não classes) porque `.admin-content th/td` em globals.css tem
// especificidade maior que uma utility e força alinhamento à esquerda / topo.
const thStyle: React.CSSProperties = { textAlign: "center", whiteSpace: "nowrap" };
const tdStyle: React.CSSProperties = { textAlign: "center", verticalAlign: "middle" };
