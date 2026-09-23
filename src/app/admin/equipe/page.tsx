"use client";

import { useEffect, useState } from "react";
import { Key, Search, Trash2, UserPlus } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Database, PerfilRole } from "@/types/database";

type PerfilRow = Database["public"]["Tables"]["profiles_encontro27"]["Row"];

const ROLE_LABEL: Record<PerfilRole, string> = {
  comercial: "Comercial",
  marketing: "Marketing",
  staff: "Staff",
};
const ROLE_OPTIONS: { value: PerfilRole; label: string }[] = [
  { value: "staff", label: "Staff" },
  { value: "comercial", label: "Comercial" },
  { value: "marketing", label: "Marketing" },
];
const ROLE_BADGE: Record<PerfilRole, string> = {
  comercial: "bg-areia text-marrom-suave",
  marketing: "bg-areia text-marrom-suave",
  staff: "bg-ambar/10 text-ambar-texto",
};

const FORMATO_DATA = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" });

const MENSAGENS_ERRO: Record<string, string> = {
  nao_autenticado: "Sua sessão expirou. Entre novamente para continuar.",
  nao_autorizado: "Você não tem permissão para gerenciar a equipe.",
  email_invalido: "Informe um e-mail válido.",
  senha_curta: "A senha precisa ter pelo menos 6 caracteres.",
  senha_fraca: "Escolha uma senha mais forte.",
  email_ja_cadastrado: "Já existe uma conta com esse e-mail.",
  role_invalida: "Escolha uma role válida.",
  nao_pode_remover_a_si_mesmo: "Você não pode remover o seu próprio acesso.",
  falha_ao_remover: "Não foi possível remover agora. Tente novamente.",
  falha_ao_trocar_senha: "Não foi possível trocar a senha agora. Tente novamente.",
};

export default function AdminEquipePage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [equipe, setEquipe] = useState<PerfilRow[] | null>(null);
  const [busca, setBusca] = useState("");
  const [cadastrando, setCadastrando] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<PerfilRole>("staff");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [senhaAlvo, setSenhaAlvo] = useState<PerfilRow | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [trocandoSenha, setTrocandoSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState<string | null>(null);

  const [removendoAlvo, setRemovendoAlvo] = useState<PerfilRow | null>(null);
  const [removendo, setRemovendo] = useState(false);
  const [erroRemover, setErroRemover] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("profiles_encontro27").select("*").order("created_at", { ascending: true });
      setEquipe(data ?? []);
    }

    load();
  }, [user, refreshKey]);

  function abrirCadastro() {
    setEmail("");
    setSenha("");
    setRole("staff");
    setErro(null);
    setFeedback(null);
    setCadastrando(true);
  }

  async function cadastrar(event: React.FormEvent) {
    event.preventDefault();
    setEnviando(true);
    setErro(null);

    // Criar usuário exige a chave de serviço, então passa pela API (que confere
    // no banco se quem chama é admin).
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setEnviando(false);
      setErro(MENSAGENS_ERRO.nao_autenticado);
      return;
    }

    const resposta = apiUrl
      ? await fetch(`${apiUrl}/equipe`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ email, senha, role }),
        }).catch(() => null)
      : null;

    setEnviando(false);

    if (!resposta?.ok) {
      const dados = (await resposta?.json().catch(() => null)) as { error?: string } | null;
      setErro(MENSAGENS_ERRO[dados?.error ?? ""] ?? "Não foi possível cadastrar agora. Tente novamente.");
      return;
    }

    setCadastrando(false);
    setFeedback(`${email.trim().toLowerCase()} cadastrado(a) na equipe como ${ROLE_LABEL[role]}.`);
    setRefreshKey((key) => key + 1);
  }

  function abrirTrocaSenha(pessoa: PerfilRow) {
    setSenhaAlvo(pessoa);
    setNovaSenha("");
    setErroSenha(null);
  }

  async function trocarSenha(event: React.FormEvent) {
    event.preventDefault();
    if (!senhaAlvo) return;
    setTrocandoSenha(true);
    setErroSenha(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setTrocandoSenha(false);
      setErroSenha(MENSAGENS_ERRO.nao_autenticado);
      return;
    }

    const resposta = apiUrl
      ? await fetch(`${apiUrl}/equipe/${senhaAlvo.uuid}/senha`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ senha: novaSenha }),
        }).catch(() => null)
      : null;

    setTrocandoSenha(false);

    if (!resposta?.ok) {
      const dados = (await resposta?.json().catch(() => null)) as { error?: string } | null;
      setErroSenha(MENSAGENS_ERRO[dados?.error ?? ""] ?? "Não foi possível trocar a senha agora. Tente novamente.");
      return;
    }

    setFeedback(`Senha de ${senhaAlvo.email} atualizada.`);
    setSenhaAlvo(null);
  }

  async function confirmarRemocao() {
    if (!removendoAlvo) return;
    setRemovendo(true);
    setErroRemover(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setRemovendo(false);
      setErroRemover(MENSAGENS_ERRO.nao_autenticado);
      return;
    }

    const resposta = apiUrl
      ? await fetch(`${apiUrl}/equipe/${removendoAlvo.uuid}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        }).catch(() => null)
      : null;

    setRemovendo(false);

    if (!resposta?.ok) {
      const dados = (await resposta?.json().catch(() => null)) as { error?: string } | null;
      setErroRemover(MENSAGENS_ERRO[dados?.error ?? ""] ?? "Não foi possível remover agora. Tente novamente.");
      return;
    }

    setFeedback(`${removendoAlvo.email} removido(a) da equipe.`);
    setRemovendoAlvo(null);
    setRefreshKey((key) => key + 1);
  }

  if (authLoading || !user) return null;

  const termo = busca.trim().toLowerCase();
  const equipeVisivel = (equipe ?? []).filter((pessoa) => !termo || pessoa.email.toLowerCase().includes(termo));

  return (
    <AdminLayout user={user}>
      <h1>Equipe</h1>
      <p className="text-marrom-suave">
        Quem tem acesso ao painel. A role <strong>staff</strong> só enxerga o check-in.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-marrom-suave"
          />
          <input
            type="search"
            aria-label="Buscar por e-mail"
            placeholder="Buscar"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            className="pl-9"
          />
        </div>
        <button
          type="button"
          onClick={abrirCadastro}
          aria-label="Cadastrar pessoa"
          title="Cadastrar pessoa"
          className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-ambar-escuro text-papel transition-colors hover:bg-ambar-pressed"
        >
          <UserPlus aria-hidden="true" className="size-[18px]" />
        </button>
      </div>

      {feedback && <p className="mt-4 text-sm">{feedback}</p>}

      {!equipe ? (
        <p className="mt-6">Carregando...</p>
      ) : equipeVisivel.length === 0 ? (
        <p className="mt-6 text-marrom-suave">
          {equipe.length === 0 ? "Nenhuma pessoa cadastrada." : "Nenhuma pessoa encontrada."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table style={{ minWidth: 520 }}>
            <thead>
              <tr>
                <th style={thStyle}>E-mail</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Desde</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {equipeVisivel.map((pessoa) => {
                const mesmaPessoa = pessoa.uuid === user.userId;
                return (
                  <tr key={pessoa.uuid}>
                    <td style={tdStyle}>{pessoa.email}</td>
                    <td style={tdStyle}>
                      <span
                        className={cn(
                          "inline-block rounded-pill px-2.5 py-0.5 text-xs font-semibold",
                          ROLE_BADGE[pessoa.role] ?? ROLE_BADGE.comercial,
                        )}
                      >
                        {ROLE_LABEL[pessoa.role] ?? pessoa.role}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{FORMATO_DATA.format(new Date(pessoa.created_at))}</td>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => abrirTrocaSenha(pessoa)}
                          aria-label={`Trocar senha de ${pessoa.email}`}
                          title="Trocar senha"
                          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-marrom-suave transition-colors hover:bg-areia hover:text-vinho"
                        >
                          <Key aria-hidden="true" className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => !mesmaPessoa && setRemovendoAlvo(pessoa)}
                          disabled={mesmaPessoa}
                          aria-label={`Remover ${pessoa.email} da equipe`}
                          title={mesmaPessoa ? "Você não pode remover o seu próprio acesso" : "Remover"}
                          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-marrom-suave transition-colors hover:bg-vermelho/10 hover:text-vermelho disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-marrom-suave"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        aberto={cadastrando}
        titulo="Cadastrar pessoa"
        onFechar={() => !enviando && setCadastrando(false)}
        larguraMax="max-w-md"
      >
        <form onSubmit={cadastrar} className="text-sm" style={{ marginTop: 0 }}>
          <p className="text-marrom-suave">
            A pessoa entra em <strong>/admin/login</strong> com esse e-mail e senha.
          </p>

          <div className="mt-4 flex flex-col gap-4">
            <label className="block">
              E-mail
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <div>
              <label htmlFor="equipe-senha">Senha inicial</label>
              <PasswordInput
                id="equipe-senha"
                required
                minLength={6}
                autoComplete="new-password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
              />
            </div>

            <div>
              <span className="font-semibold text-vinho">Role</span>
              <Dropdown ariaLabel="Role" value={role} options={ROLE_OPTIONS} onChange={setRole} className="mt-1.5" />
            </div>
          </div>

          {erro && (
            <div role="alert" className="mt-4 text-center text-vermelho">
              {erro}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setCadastrando(false)}
              disabled={enviando}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-pill border border-dourado px-5 font-semibold text-vinho transition-colors hover:bg-areia disabled:cursor-default disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-pill bg-ambar-escuro px-5 font-semibold text-papel transition-colors hover:bg-ambar-pressed disabled:cursor-default disabled:opacity-50"
            >
              {enviando ? "Cadastrando…" : "Cadastrar"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        aberto={senhaAlvo !== null}
        titulo="Trocar senha"
        onFechar={() => !trocandoSenha && setSenhaAlvo(null)}
        larguraMax="max-w-md"
      >
        <form onSubmit={trocarSenha} className="text-sm" style={{ marginTop: 0 }}>
          {senhaAlvo && (
            <p className="text-marrom-suave">
              Nova senha para <strong>{senhaAlvo.email}</strong>.
            </p>
          )}

          <div className="mt-4">
            <label htmlFor="equipe-nova-senha">Nova senha</label>
            <PasswordInput
              id="equipe-nova-senha"
              required
              minLength={6}
              autoComplete="new-password"
              value={novaSenha}
              onChange={(event) => setNovaSenha(event.target.value)}
            />
          </div>

          {erroSenha && (
            <div role="alert" className="mt-4 text-center text-vermelho">
              {erroSenha}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setSenhaAlvo(null)}
              disabled={trocandoSenha}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-pill border border-dourado px-5 font-semibold text-vinho transition-colors hover:bg-areia disabled:cursor-default disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={trocandoSenha}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-pill bg-ambar-escuro px-5 font-semibold text-papel transition-colors hover:bg-ambar-pressed disabled:cursor-default disabled:opacity-50"
            >
              {trocandoSenha ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        aberto={removendoAlvo !== null}
        titulo="Remover pessoa da equipe"
        descricao={erroRemover ?? (removendoAlvo ? `${removendoAlvo.email} perde o acesso ao painel.` : undefined)}
        textoConfirmar="Remover"
        confirmando={removendo}
        onConfirmar={confirmarRemocao}
        onCancelar={() => !removendo && setRemovendoAlvo(null)}
      />
    </AdminLayout>
  );
}

// Inline (e não classes) porque `.admin-content th/td` em globals.css tem
// especificidade maior que uma utility e força alinhamento à esquerda / topo.
const thStyle: React.CSSProperties = { textAlign: "center", whiteSpace: "nowrap" };
const tdStyle: React.CSSProperties = { textAlign: "center", verticalAlign: "middle" };
