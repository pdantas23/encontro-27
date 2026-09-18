import type { NextConfig } from "next";

// Pasta onde o site é publicado. Padrão /encontro27 (dev local); no deploy da
// Hostinger o site vive em /oencontro2027 — passe BASE_PATH no build.
const basePath = process.env.BASE_PATH ?? "/encontro27";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
