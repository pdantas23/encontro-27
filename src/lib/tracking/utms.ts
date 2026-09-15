const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
type UtmKey = (typeof UTM_KEYS)[number];
export type Utms = Partial<Record<UtmKey, string>>;

const STORAGE_KEY = "encontro27-utms";

/** Chamar uma vez ao carregar o site (ex.: no layout raiz) para capturar UTMs da URL. */
export function captureUtmsFromUrl() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const found: Utms = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) found[key] = value;
  }
  if (Object.keys(found).length > 0) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  }
}

/** UTMs capturadas na primeira visita da sessão — usadas ao criar o pedido. */
export function getStoredUtms(): Utms {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Utms) : {};
  } catch {
    return {};
  }
}
