"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import type { Database, Json } from "@/types/database";

type ModalidadeRow = Database["public"]["Tables"]["modalidades_encontro27"]["Row"];

interface FormState {
  nome: string;
  descricao: string;
  paraQuemE: string;
  condicoes: string;
  itensIncluidos: string;
  itensNaoIncluidos: string;
  ativo: boolean;
  ordem: string;
}

// itens_incluidos/itens_nao_incluidos são jsonb (array de strings). O admin edita
// como um item por linha num textarea; convertemos pros dois lados aqui.
function jsonToLinhas(value: Json | null): string {
  if (!Array.isArray(value)) return "";
  return value.filter((item): item is string => typeof item === "string").join("\n");
}

function linhasToJson(texto: string): string[] {
  return texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);
}

function toFormState(modalidade: ModalidadeRow): FormState {
  return {
    nome: modalidade.nome,
    descricao: modalidade.descricao ?? "",
    paraQuemE: modalidade.para_quem_e ?? "",
    condicoes: modalidade.condicoes ?? "",
    itensIncluidos: jsonToLinhas(modalidade.itens_incluidos),
    itensNaoIncluidos: jsonToLinhas(modalidade.itens_nao_incluidos),
    ativo: modalidade.ativo,
    ordem: String(modalidade.ordem),
  };
}

export default function AdminIngressosPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [modalidades, setModalidades] = useState<ModalidadeRow[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("modalidades_encontro27").select("*").order("ordem", { ascending: true });
      setModalidades(data ?? []);
    }

    load();
  }, [user, refreshKey]);

  function startEdit(modalidade: ModalidadeRow) {
    setEditingId(modalidade.id);
    setForm(toFormState(modalidade));
    setFeedback(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(null);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!editingId || !form) return;

    setSaving(true);
    setFeedback(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("modalidades_encontro27")
      .update({
        nome: form.nome,
        descricao: form.descricao.trim() || null,
        para_quem_e: form.paraQuemE.trim() || null,
        condicoes: form.condicoes.trim() || null,
        itens_incluidos: linhasToJson(form.itensIncluidos),
        itens_nao_incluidos: linhasToJson(form.itensNaoIncluidos),
        ativo: form.ativo,
        ordem: Number(form.ordem) || 0,
      })
      .eq("id", editingId);
    setSaving(false);

    if (error) {
      setFeedback(`Erro ao salvar: ${error.message}`);
      return;
    }

    setFeedback("Modalidade atualizada.");
    cancelEdit();
    setRefreshKey((key) => key + 1);
  }

  if (authLoading || !user) return null;

  return (
    <AdminLayout user={user}>
      <h1>Modalidades</h1>
      <p style={{ color: "#666" }}>
        As 4 modalidades confirmadas do evento. Não é possível criar novas modalidades nem excluir as existentes
        nesta tela — apenas editar seus dados.
      </p>

      {feedback && <p style={{ marginTop: 12 }}>{feedback}</p>}

      {!modalidades ? (
        <p style={{ marginTop: 16 }}>Carregando...</p>
      ) : (
        <table style={{ marginTop: 16, borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={thStyle}>Ordem</th>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Slug</th>
              <th style={thStyle}>Ativo</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {modalidades.map((modalidade) => (
              <tr key={modalidade.id}>
                <td style={tdStyle}>{modalidade.ordem}</td>
                <td style={tdStyle}>{modalidade.nome}</td>
                <td style={tdStyle}>{modalidade.slug}</td>
                <td style={tdStyle}>{modalidade.ativo ? "Sim" : "Não"}</td>
                <td style={tdStyle}>
                  <button onClick={() => startEdit(modalidade)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {form && (
        <form onSubmit={handleSave} style={{ marginTop: 24, maxWidth: 560, display: "flex", flexDirection: "column", gap: 12 }}>
          <h2>Editando modalidade</h2>

          <label>
            Nome
            <input
              type="text"
              required
              value={form.nome}
              onChange={(event) => setForm({ ...form, nome: event.target.value })}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            Descrição
            <textarea
              value={form.descricao}
              onChange={(event) => setForm({ ...form, descricao: event.target.value })}
              rows={3}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            Para quem é
            <textarea
              value={form.paraQuemE}
              onChange={(event) => setForm({ ...form, paraQuemE: event.target.value })}
              rows={2}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            Condições
            <textarea
              value={form.condicoes}
              onChange={(event) => setForm({ ...form, condicoes: event.target.value })}
              rows={2}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            Itens incluídos (um por linha)
            <textarea
              value={form.itensIncluidos}
              onChange={(event) => setForm({ ...form, itensIncluidos: event.target.value })}
              rows={4}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            Itens não incluídos (um por linha)
            <textarea
              value={form.itensNaoIncluidos}
              onChange={(event) => setForm({ ...form, itensNaoIncluidos: event.target.value })}
              rows={4}
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

          <label>
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(event) => setForm({ ...form, ativo: event.target.checked })}
            />{" "}
            Ativo
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
