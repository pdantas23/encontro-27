// Proxy só de desenvolvimento. A API de produção (api.oencontropi.com.br) não
// tem http://localhost:3000 em CORS_ALLOWED_ORIGINS, então o navegador barra o
// fetch do checkout rodando local. Este proxy repassa a chamada e devolve os
// headers de CORS que faltam. Nada disso vai para produção: o build usa a URL
// real da API via NEXT_PUBLIC_API_URL.
import { createServer } from "node:http";

const TARGET = "https://api.oencontropi.com.br";
const PORT = 3001;

const cors = (origin) => ({
  "Access-Control-Allow-Origin": origin ?? "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  Vary: "Origin",
});

createServer(async (req, res) => {
  const origin = req.headers.origin;

  if (req.method === "OPTIONS") {
    res.writeHead(204, cors(origin));
    return res.end();
  }

  const chunks = [];
  for await (const c of req) chunks.push(c);

  try {
    const upstream = await fetch(`${TARGET}${req.url}`, {
      method: req.method,
      headers: { "Content-Type": req.headers["content-type"] ?? "application/json" },
      body: chunks.length ? Buffer.concat(chunks) : undefined,
    });
    const body = Buffer.from(await upstream.arrayBuffer());
    res.writeHead(upstream.status, {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      ...cors(origin),
    });
    res.end(body);
    console.log(`${req.method} ${req.url} → ${upstream.status}`);
  } catch (err) {
    res.writeHead(502, { "Content-Type": "application/json", ...cors(origin) });
    res.end(JSON.stringify({ error: "proxy_falhou", detalhe: String(err) }));
  }
}).listen(PORT, () => console.log(`proxy de dev → ${TARGET} em http://localhost:${PORT}`));
