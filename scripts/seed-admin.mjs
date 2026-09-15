// Cria o primeiro usuário admin do painel (/admin) — Supabase Auth + profiles_encontro27.
// Uso: node --env-file=.env.local scripts/seed-admin.mjs <email> <senha> [comercial|marketing]
//
// Precisa de SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL no ambiente
// (por isso o --env-file=.env.local). Nunca rodar isso no browser.

import { createClient } from "@supabase/supabase-js";

const [, , email, password, role = "comercial"] = process.argv;

if (!email || !password) {
  console.error("Uso: node --env-file=.env.local scripts/seed-admin.mjs <email> <senha> [comercial|marketing]");
  process.exit(1);
}

if (!["comercial", "marketing"].includes(role)) {
  console.error("role deve ser 'comercial' ou 'marketing'");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios (verifique .env.local).");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (createError) {
  console.error("Erro ao criar usuário:", createError.message);
  process.exit(1);
}

const { error: profileError } = await supabase
  .from("profiles_encontro27")
  .insert({ uuid: created.user.id, email, role });

if (profileError) {
  console.error("Usuário criado no Auth, mas falhou ao criar o perfil:", profileError.message);
  process.exit(1);
}

console.log(`Admin criado: ${email} (role: ${role}). Já pode logar em /admin/login.`);
