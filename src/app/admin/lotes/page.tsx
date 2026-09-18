"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { formatCurrencyBRL } from "@/lib/utils";
import type { Database } from "@/types/database";

type LoteRow = Database["public"]["Tables"]["lotes_encontro27"]["Row"];
type ModalidadeRow = Database["public"]["Tables"]["modalidades_encontro27"]["Row"];

// Select aninhado não é tipado automaticamente pelo supabase-js (ver nota em
// admin/pedidos/page.tsx) — tipamos manualmente e convertemos com `as unknown as`.
type LoteComModalidade = LoteRow & {
  modalidades_encontro27: { nome: string } | null;
};

interface FormState {
  id: string | null;
  modalidadeId: string;
  nome: string;
  preco: string;
  quantidade: string;
  inicioVenda: string;
  fimVenda: string;
  status: string;
  hypercashCheckoutUrl: string;
  ordem: string;
}

const STATUS_OPTIONS = ["ativo", "encerrado", "esgotado"];

function blankForm(defaultModalidadeId: string): FormState {
  return {
    id: null,
    modalidadeId: defaultModalidadeId,
    nome: "Lote 1",
    preco: "",
    quantidade: "",
    inicioVenda: "",
    fimVenda: "",
    status: "ativo",
    hypercashCheckoutUrl: "",
    ordem: "0",
  };
}

function isoToDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToIso(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

function toFormState(lote: LoteRow): FormState {
  return {
    id: lote.id,
    modalidadeId: lote.modalidade_id,
    nome: lote.nome,
    preco: lote.preco === null ? "" : String(lote.preco),
    quantidade: lote.quantidade === null ? "" : String(lote.quantidade),
    inicioVenda: isoToDatetimeLocal(lote.inicio_venda),
    fimVenda: isoToDatetimeLocal(lote.fim_venda),
    status: lote.status,
    hypercashCheckoutUrl: lote.hypercash_checkout_url ?? "",
    ordem: String(lote.ordem),
  };
}

// ⚠️ TEMPORÁRIO — ver aviso em src/hooks/useAdminAuth.ts / PENDENCIAS-PREVIEW.md.
const PREVIEW_FAKE = true;
function modalidadeFake(overrides: Partial<ModalidadeRow>): ModalidadeRow {
  return {
    id: crypto.randomUUID(),
    slug: "start",
    nome: "Start",
    descricao: null,
    para_quem_e: null,
    itens_incluidos: null,
    itens_nao_incluidos: null,
    condicoes: null,
    ordem: 1,
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}
const MODALIDADES_FAKE: ModalidadeRow[] = [
  modalidadeFake({ slug: "start", nome: "Start", ordem: 1 }),
  modalidadeFake({ slug: "almoco-nao-participante", nome: "Almoço Não Participante", ordem: 2 }),
  modalidadeFake({ slug: "jantar-conexoes", nome: "Jantar de Conexões", ordem: 3 }),
  modalidadeFake({ slug: "vip", nome: "VIP", ordem: 4 }),
];
function loteFake(modalidade: ModalidadeRow, overrides: Partial<LoteComModalidade>): LoteComModalidade {
  return {
    id: crypto.randomUUID(),
    modalidade_id: modalidade.id,
    nome: "Lote 1",
    preco: 390,
    quantidade: 100,
    quantidade_vendida: 14,
    inicio_venda: null,
    fim_venda: null,
    status: "ativo",
    hypercash_checkout_url: "https://pay.hypercash.com.br/pt/checkout/exemplo",
    ordem: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    modalidades_encontro27: { nome: modalidade.nome },
    ...overrides,
  };
}
const LOTES_FAKE: LoteComModalidade[] = [
  loteFake(MODALIDADES_FAKE[0], { preco: 390, quantidade_vendida: 14 }),
  loteFake(MODALIDADES_FAKE[1], { preco: 190, quantidade_vendida: 6 }),
  loteFake(MODALIDADES_FAKE[2], { preco: 450, quantidade_vendida: 5 }),
  loteFake(MODALIDADES_FAKE[3], { preco: 890, quantidade: 30, quantidade_vendida: 5 }),
];

export default function AdminLotesPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [lotes, setLotes] = useState<LoteComModalidade[] | null>(PREVIEW_FAKE ? LOTES_FAKE : null);
  const [modalidades, setModalidades] = useState<ModalidadeRow[] | null>(PREVIEW_FAKE ? MODALIDADES_FAKE : null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (PREVIEW_FAKE) return;
    if (!user) return;

    async function load() {
      const supabase = createClient();
      const [{ data: lotesData }, { data: modalidadesData }] = await Promise.all([
        supabase
          .from("lotes_encontro27")
          .select("*, modalidades_encontro27(nome)")
          .order("ordem", { ascending: true }),
        supabase.from("modalidades_encontro27").select("*").order("ordem", { ascending: true }),
      ]);
      setLotes((lotesData ?? []) as unknown as LoteComModalidade[]);
      setModalidades(modalidadesData ?? []);
    }

    load();
  }, [user, refreshKey]);

  function startEdit(lote: LoteRow) {
    setForm(toFormState(lote));
    setFeedback(null);
  }

  function startNew() {
    const defaultModalidadeId = modalidades?.[0]?.id ?? "";
    setForm(blankForm(defaultModalidadeId));
    setFeedback(null);
  }

  function cancelEdit() {
    setForm(null);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;

    setSaving(true);
    setFeedback(null);
    const supabase = createClient();

    const payload = {
      modalidade_id: form.modalidadeId,
      nome: form.nome,
      preco: form.preco.trim() === "" ? null : Number(form.preco),
      quantidade: form.quantidade.trim() === "" ? null : Number(form.quantidade),
      inicio_venda: datetimeLocalToIso(form.inicioVenda),
      fim_venda: datetimeLocalToIso(form.fimVenda),
      status: form.status,
      hypercash_checkout_url: form.hypercashCheckoutUrl.trim() || null,
      ordem: Number(form.ordem) || 0,
    };

    const { error } = form.id
      ? await supabase.from("lotes_encontro27").update(payload).eq("id", form.id)
      : await supabase.from("lotes_encontro27").insert(payload);

    setSaving(false);

    if (error) {
      setFeedback(`Erro ao salvar: ${error.message}`);
      return;
    }

    setFeedback(form.id ? "Lote atualizado." : "Lote criado.");
    cancelEdit();
    setRefreshKey((key) => key + 1);
  }

  if (authLoading || !user) return null;

  return (
    <AdminLayout user={user}>
      <h1>Lotes</h1>
      <p style={{ color: "#666" }}>
        Preço e link de checkout da Hypercash de cada modalidade são configurados aqui.
      </p>

      {feedback && <p style={{ marginTop: 12 }}>{feedback}</p>}

      <button style={{ marginTop: 16 }} onClick={startNew} disabled={!modalidades || modalidades.length === 0}>
        Novo lote
      </button>

      {!lotes ? (
        <p style={{ marginTop: 16 }}>Carregando...</p>
      ) : (
        <table style={{ marginTop: 16, borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={thStyle}>Modalidade</th>
              <th style={thStyle}>Lote</th>
              <th style={thStyle}>Preço</th>
              <th style={thStyle}>Vendidos / Qtd.</th>
              <th style={thStyle}>Período</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Checkout Hypercash</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {lotes.map((lote) => (
              <tr key={lote.id}>
                <td style={tdStyle}>{lote.modalidades_encontro27?.nome ?? "-"}</td>
                <td style={tdStyle}>{lote.nome}</td>
                <td style={tdStyle}>{lote.preco === null ? "-" : formatCurrencyBRL(Number(lote.preco))}</td>
                <td style={tdStyle}>
                  {lote.quantidade_vendida} / {lote.quantidade ?? "sem limite"}
                </td>
                <td style={tdStyle}>
                  {lote.inicio_venda ? new Date(lote.inicio_venda).toLocaleString("pt-BR") : "-"}
                  {" até "}
                  {lote.fim_venda ? new Date(lote.fim_venda).toLocaleString("pt-BR") : "-"}
                </td>
                <td style={tdStyle}>{lote.status}</td>
                <td style={{ ...tdStyle, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {lote.hypercash_checkout_url ?? "-"}
                </td>
                <td style={tdStyle}>
                  <button onClick={() => startEdit(lote)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {form && (
        <form onSubmit={handleSave} style={{ marginTop: 24, maxWidth: 560, display: "flex", flexDirection: "column", gap: 12 }}>
          <h2>{form.id ? "Editando lote" : "Novo lote"}</h2>

          <label>
            Modalidade
            <select
              required
              value={form.modalidadeId}
              onChange={(event) => setForm({ ...form, modalidadeId: event.target.value })}
              style={{ display: "block", width: "100%" }}
            >
              {(modalidades ?? []).map((modalidade) => (
                <option key={modalidade.id} value={modalidade.id}>
                  {modalidade.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            Nome do lote
            <input
              type="text"
              required
              value={form.nome}
              onChange={(event) => setForm({ ...form, nome: event.target.value })}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            Preço (R$, deixe vazio se ainda não definido)
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.preco}
              onChange={(event) => setForm({ ...form, preco: event.target.value })}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            Quantidade (deixe vazio para sem limite)
            <input
              type="number"
              min="0"
              value={form.quantidade}
              onChange={(event) => setForm({ ...form, quantidade: event.target.value })}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          {form.id && (
            <p style={{ color: "#666" }}>
              Quantidade vendida (somente leitura, controlada automaticamente):{" "}
              {lotes?.find((l) => l.id === form.id)?.quantidade_vendida ?? 0}
            </p>
          )}

          <label>
            Início da venda
            <input
              type="datetime-local"
              value={form.inicioVenda}
              onChange={(event) => setForm({ ...form, inicioVenda: event.target.value })}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            Fim da venda
            <input
              type="datetime-local"
              value={form.fimVenda}
              onChange={(event) => setForm({ ...form, fimVenda: event.target.value })}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
              style={{ display: "block", width: "100%" }}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            Link de checkout da Hypercash
            <input
              type="text"
              placeholder="https://pay.hypercash.com.br/pt/checkout/..."
              value={form.hypercashCheckoutUrl}
              onChange={(event) => setForm({ ...form, hypercashCheckoutUrl: event.target.value })}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            Ordem
            <input
              type="number"
              value={form.ordem}
              onChange={(event) => setForm({ ...form, ordem: event.target.value })}
              style={{ display: "block" }}
            />
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={cancelEdit} disabled={saving}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}

const thStyle: React.CSSProperties = { textAlign: "left", padding: "4px 8px", borderBottom: "1px solid #ddd" };
const tdStyle: React.CSSProperties = { padding: "4px 8px", borderBottom: "1px solid #eee" };
