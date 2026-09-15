import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: `${basePath}/`, disallow: [`${basePath}/admin`, `${basePath}/minha-conta`, `${basePath}/checkout`] },
    ],
    sitemap: siteUrl ? `${siteUrl}${basePath}/sitemap.xml` : undefined,
  };
}
