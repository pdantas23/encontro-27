declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** Único ponto que escreve no dataLayer. Nunca chamar window.dataLayer.push fora daqui. */
export function gtmPush(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}
