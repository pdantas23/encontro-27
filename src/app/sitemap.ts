import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

/** Só páginas públicas de apresentação e venda (cap. 12). */
const ROTAS: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/ingressos/", priority: 0.9 },
  { path: "/ingressos/start/", priority: 0.8 },
  { path: "/ingressos/vip/", priority: 0.8 },
  { path: "/ingressos/almoco-nao-participante/", priority: 0.7 },
  { path: "/ingressos/jantar-conexoes/", priority: 0.7 },
  { path: "/experiencias/", priority: 0.7 },
  { path: "/convidados/", priority: 0.6 },
  { path: "/programacao/", priority: 0.6 },
  { path: "/o-encontro/", priority: 0.6 },
  { path: "/faq/", priority: 0.5 },
  { path: "/privacidade/", priority: 0.2 },
  { path: "/termos/", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROTAS.map((r) => ({ url: `${siteUrl}${basePath}${r.path}`, priority: r.priority, changeFrequency: "weekly" }));
}
