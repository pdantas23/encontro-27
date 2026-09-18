"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { cadastroSchema, type CadastroFormValues } from "@/lib/validators/auth";
import { CTAButton } from "@/components/ui/CTAButton";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { formatarTelefone } from "@/lib/utils";

const MENSAGENS_ERRO: Record<string, string> = {
  email_ja_cadastrado: "Já existe uma conta com esse e-mail.",
  muitas_tentativas: "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",
  senha_fraca: "Escolha uma senha mais forte.",
};

export function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/minha-conta/ingressos";

  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CadastroFormValues>({ resolver: zodResolver(cadastroSchema) });

  // Máscara aplicada no próprio evento, antes do react-hook-form ler o valor, pra
  // o que fica guardado ser o texto já formatado.
  const { onChange: onChangeWhatsapp, ...campoWhatsapp } = register("whatsapp");

  const linkLogin =
    redirect === "/minha-conta/ingressos" ? "/login" : `/login?redirect=${encodeURIComponent(redirect)}`;

  async function onSubmit(values: CadastroFormValues) {
    setEnviando(true);
    setErro(null);

    // A conta é criada pela nossa API (e-mail já confirmado): o signUp público do
    // Supabase exige e-mail de confirmação e o SMTP do servidor não está em uso.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    let resposta: Response | null = null;
    if (apiUrl) {
      resposta = await fetch(`${apiUrl}/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          senha: values.senha,
          nome: values.nome,
          whatsapp: values.whatsapp,
        }),
      }).catch(() => null);
    }

    if (!resposta?.ok) {
      const dados = (await resposta?.json().catch(() => null)) as { error?: string } | null;
      setErro(MENSAGENS_ERRO[dados?.error ?? ""] ?? "Não foi possível criar sua conta. Tente novamente.");
      setEnviando(false);
      return;
    }

    const supabase = createClient();
    const { error: erroLogin } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.senha,
    });

    // Conta criada, mas a entrada automática falhou: a pessoa entra pela tela de login.
    router.push(erroLogin ? linkLogin : redirect);
  }

  return (
    <div className="rounded-card border border-border bg-papel p-8 shadow-card">
      <h1 className="font-display text-2xl text-heading text-center">Criar conta</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
        <label>
          Nome completo
          <input autoComplete="name" {...register("nome")} />
        </label>
        {errors.nome && <p className="text-sm text-vermelho">{errors.nome.message}</p>}

        <label>
          E-mail
          <input type="email" autoComplete="email" {...register("email")} />
        </label>
        {errors.email && <p className="text-sm text-vermelho">{errors.email.message}</p>}

        <label>
          WhatsApp (com DDD)
          <input
            inputMode="tel"
            autoComplete="tel"
            {...campoWhatsapp}
            onChange={(event) => {
              event.target.value = formatarTelefone(event.target.value);
              onChangeWhatsapp(event);
            }}
          />
        </label>
        {errors.whatsapp && <p className="text-sm text-vermelho">{errors.whatsapp.message}</p>}

        <div>
          <label htmlFor="cadastro-senha">Senha</label>
          <PasswordInput id="cadastro-senha" autoComplete="new-password" {...register("senha")} />
        </div>
        {errors.senha && <p className="text-sm text-vermelho">{errors.senha.message}</p>}

        <div>
          <label htmlFor="cadastro-confirmar-senha">Confirmar senha</label>
          <PasswordInput id="cadastro-confirmar-senha" autoComplete="new-password" {...register("confirmarSenha")} />
        </div>
        {errors.confirmarSenha && <p className="text-sm text-vermelho">{errors.confirmarSenha.message}</p>}

        {erro && (
          <p role="alert" className="text-sm text-vermelho">
            {erro}
          </p>
        )}

        <CTAButton type="submit" disabled={enviando} className="mt-2 w-full justify-center">
          {enviando ? "Criando conta…" : "Criar conta"}
        </CTAButton>
      </form>

      <p className="mt-6 text-center text-[15px] text-marrom-suave">
        Já tem conta?{" "}
        <Link href={linkLogin} className="text-vinho underline underline-offset-4 decoration-ambar">
          Entrar
        </Link>
      </p>
    </div>
  );
}
