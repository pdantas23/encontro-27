"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type EventConfigRow = Database["public"]["Tables"]["event_config_encontro27"]["Row"];

interface FormState {
  name: string;
  date: string;
  location: string;
  description: string;
  saleStatus: string;
  whatsappSupport: string;
  ga4Id: string;
  gtmId: string;
  metaPixelId: string;
  googleAdsId: string;
}

const SALE_STATUS_OPTIONS = ["open", "closed", "soldout"];

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

function toFormState(config: EventConfigRow): FormState {
  return {
    name: config.name ?? "",
    date: isoToDatetimeLocal(config.date),
    location: config.location ?? "",
    description: config.description ?? "",
    saleStatus: config.sale_status,
    whatsappSupport: config.whatsapp_support ?? "",
    ga4Id: config.ga4_id ?? "",
    gtmId: config.gtm_id ?? "",
    metaPixelId: config.meta_pixel_id ?? "",
    googleAdsId: config.google_ads_id ?? "",
  };
}

export default function AdminConfiguracoesPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [configId, setConfigId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("event_config_encontro27").select("*").limit(1).maybeSingle();
      if (data) {
        setConfigId(data.id);
        setForm(toFormState(data));
      }
    }

    load();
  }, [user]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!configId || !form) return;

    setSaving(true);
    setFeedback(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("event_config_encontro27")
      .update({
        name: form.name.trim() || null,
        date: datetimeLocalToIso(form.date),
        location: form.location.trim() || null,
        description: form.description.trim() || null,
        sale_status: form.saleStatus,
        whatsapp_support: form.whatsappSupport.trim() || null,
        ga4_id: form.ga4Id.trim() || null,
        gtm_id: form.gtmId.trim() || null,
        meta_pixel_id: form.metaPixelId.trim() || null,
        google_ads_id: form.googleAdsId.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", configId);
    setSaving(false);

    if (error) {
      setFeedback(`Erro ao salvar: ${error.message}`);
      return;
    }

    setFeedback("Configurações salvas.");
  }

  if (authLoading || !user) return null;

  return (
    <AdminLayout user={user}>
      <h1>Configurações do evento</h1>

      {feedback && <p style={{ marginTop: 12 }}>{feedback}</p>}

      {!form ? (
        <p style={{ marginTop: 16 }}>Carregando...</p>
      ) : (
        <form onSubmit={handleSave} style={{ marginTop: 16, maxWidth: 560, display: "flex", flexDirection: "column", gap: 12 }}>
          <label>
            Nome do evento
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            Data
            <input
              type="datetime-local"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            Local
            <input
              type="text"
              value={form.location}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            Descrição
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={3}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            Status das vendas
            <select
              value={form.saleStatus}
              onChange={(event) => setForm({ ...form, saleStatus: event.target.value })}
              style={{ display: "block", width: "100%" }}
            >
              {SALE_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            WhatsApp de suporte
            <input
              type="text"
              value={form.whatsappSupport}
              onChange={(event) => setForm({ ...form, whatsappSupport: event.target.value })}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            GA4 ID
            <input
              type="text"
              value={form.ga4Id}
              onChange={(event) => setForm({ ...form, ga4Id: event.target.value })}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            GTM ID
            <input
              type="text"
              value={form.gtmId}
              onChange={(event) => setForm({ ...form, gtmId: event.target.value })}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            Meta Pixel ID
            <input
              type="text"
              value={form.metaPixelId}
              onChange={(event) => setForm({ ...form, metaPixelId: event.target.value })}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            Google Ads ID
            <input
              type="text"
              value={form.googleAdsId}
              onChange={(event) => setForm({ ...form, googleAdsId: event.target.value })}
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </form>
      )}
    </AdminLayout>
  );
}
