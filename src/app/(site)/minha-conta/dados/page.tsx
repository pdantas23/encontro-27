"use client";

import { useEffect, useRef, useState } from "react";
import { UserCircle } from "lucide-react";
import { MinhaContaNav } from "@/components/layout/MinhaContaNav";
import { useMeusPedidos } from "@/hooks/useMeusPedidos";
import { createClient } from "@/lib/supabase/client";

const AVATAR_BUCKET = "avatares-encontro27";
const AVATAR_MAX_MB = 5;
const AVATAR_EXTENSOES = ["jpg", "jpeg", "png", "webp"];

export default function MeusDadosPage() {
  const { email, pedidos, loading } = useMeusPedidos();
  const maisRecente = pedidos?.[0];

  const [userId, setUserId] = useState<string | null>(null);
  const [nome, setNome] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function carregarPerfil() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      setNome((user.user_metadata?.nome as string | undefined) ?? null);
      setWhatsapp((user.user_metadata?.whatsapp as string | undefined) ?? null);
      setAvatarUrl((user.user_metadata?.avatar_url as string | undefined) ?? null);
    }

    carregarPerfil();
  }, []);

  async function handleFotoSelecionada(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    event.target.value = ""; // permite escolher o mesmo arquivo de novo depois, se precisar

    if (!arquivo || !userId) return;

    if (arquivo.size > AVATAR_MAX_MB * 1024 * 1024) {
      setErroFoto(`A imagem precisa ter até ${AVATAR_MAX_MB}MB.`);
      return;
    }

    setEnviandoFoto(true);
    setErroFoto(null);

    const supabase = createClient();
    const extensao = arquivo.name.split(".").pop()?.toLowerCase() || "jpg";
    const caminho = `${userId}/avatar.${extensao}`;

    const { error: erroUpload } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(caminho, arquivo, { upsert: true, cacheControl: "3600" });

    if (erroUpload) {
      setErroFoto("Não foi possível enviar a foto. Tente novamente.");
      setEnviandoFoto(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(caminho);
    // Sem o parâmetro de versão, o navegador continuaria mostrando a foto
    // antiga em cache — o nome do arquivo não muda numa atualização.
    const urlComCacheBust = `${publicUrlData.publicUrl}?v=${Date.now()}`;

    const { error: erroUpdate } = await supabase.auth.updateUser({ data: { avatar_url: urlComCacheBust } });

    setEnviandoFoto(false);

    if (erroUpdate) {
      setErroFoto("Foto enviada, mas não foi possível salvar no seu perfil. Tente novamente.");
      return;
    }

    setAvatarUrl(urlComCacheBust);
  }

  async function handleRemoverFoto() {
    if (!userId || !avatarUrl) return;

    setEnviandoFoto(true);
    setErroFoto(null);

    const supabase = createClient();
    // Não sabemos qual extensão está salva agora — remove todas as possíveis.
    await supabase.storage.from(AVATAR_BUCKET).remove(AVATAR_EXTENSOES.map((ext) => `${userId}/avatar.${ext}`));

    const { error } = await supabase.auth.updateUser({ data: { avatar_url: null } });

    setEnviandoFoto(false);

    if (error) {
      setErroFoto("Não foi possível remover a foto. Tente novamente.");
      return;
    }

    setAvatarUrl(null);
  }

  if (loading) return null;

  const nomeExibido = nome ?? maisRecente?.comprador_nome ?? null;
  const whatsappExibido = whatsapp ?? maisRecente?.comprador_whatsapp ?? null;

  return (
    <>
      <MinhaContaNav />

      <main id="conteudo" className="container-site py-10 sm:py-14">
        <div className="mx-auto max-w-sm">
          <div className="rounded-card border border-border bg-papel p-8 shadow-card">
            <h1 className="font-display text-2xl text-heading text-center">Meus dados</h1>

            <div className="mt-6 flex flex-col items-center">
              <div className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-areia">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- URL do Storage, sem domínio fixo pra configurar no next/image
                  <img src={avatarUrl} alt="" className="size-full object-cover" />
                ) : (
                  <UserCircle className="size-14 text-marrom-suave" strokeWidth={1} />
                )}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFotoSelecionada}
                className="hidden"
              />

              <div className="mt-4 flex items-center gap-4 text-[15px]">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={enviandoFoto}
                  className="text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro disabled:opacity-50"
                >
                  {enviandoFoto ? "Enviando…" : avatarUrl ? "Atualizar foto" : "Adicionar foto"}
                </button>
                {avatarUrl ? (
                  <button
                    type="button"
                    onClick={handleRemoverFoto}
                    disabled={enviandoFoto}
                    className="text-marrom-suave underline underline-offset-4 decoration-ambar hover:text-vermelho disabled:opacity-50"
                  >
                    Remover
                  </button>
                ) : null}
              </div>

              {erroFoto && (
                <p role="alert" className="mt-2 text-center text-sm text-vermelho">
                  {erroFoto}
                </p>
              )}
            </div>

            <dl className="mt-8 divide-y divide-border border-y border-border text-[15px]">
              <div className="flex flex-wrap justify-between gap-2 py-3">
                <dt className="text-marrom-suave">Nome</dt>
                <dd className="text-marrom">{nomeExibido ?? "—"}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2 py-3">
                <dt className="text-marrom-suave">E-mail</dt>
                <dd className="text-marrom">{email}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2 py-3">
                <dt className="text-marrom-suave">WhatsApp</dt>
                <dd className="text-marrom">{whatsappExibido ?? "—"}</dd>
              </div>
            </dl>
          </div>

          <p className="mt-6 text-center text-[13px] leading-5 text-marrom-suave">
            Edição de nome e WhatsApp e transferência de titularidade ainda dependem de definições da organização
            (capítulo 16 do levantamento de requisitos).
          </p>
        </div>
      </main>
    </>
  );
}
