"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { cadastroSchema, type CadastroFormValues } from "@/lib/validators/auth";
import { CTAButton } from "@/components/ui/CTAButton";

export function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/minha-conta";

  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CadastroFormValues>({ resolver: zodResolver(cadastroSchema) });

  async function onSubmit(values: CadastroFormValues) {
    setEnviando(true);
    setErro(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.senha,
      // Prefill de checkouts futuros: CheckoutWizard ainda pede nome/WhatsApp de
      // novo hoje, mas já fica disponível aqui pra quando isso for reaproveitado.
      options: { data: { nome: values.nome, whatsapp: values.whatsapp } },
    });

    if (error) {
      setErro(
        error.message.toLowerCase().includes("registered") || error.message.toLowerCase().includes("exists")
          ? "Já existe uma conta com esse e-mail."
          : "Não foi possível criar sua conta. Tente novamente.",
      );
      setEnviando(false);
      return;
    }

    router.push(redirect);
  }

  const linkLogin = redirect === "/minha-conta" ? "/login" : `/login?redirect=${encodeURIComponent(redirect)}`;

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
          <input inputMode="tel" autoComplete="tel" {...register("whatsapp")} />
        </label>
        {errors.whatsapp && <p className="text-sm text-vermelho">{errors.whatsapp.message}</p>}

        <label>
          Senha
          <input type="password" autoComplete="new-password" {...register("senha")} />
        </label>
        {errors.senha && <p className="text-sm text-vermelho">{errors.senha.message}</p>}

        <label>
          Confirmar senha
          <input type="password" autoComplete="new-password" {...register("confirmarSenha")} />
        </label>
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
