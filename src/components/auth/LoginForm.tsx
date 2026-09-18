"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormValues } from "@/lib/validators/auth";
import { CTAButton } from "@/components/ui/CTAButton";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/minha-conta";

  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setEnviando(true);
    setErro(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.senha });

    if (error) {
      setErro("E-mail ou senha inválidos.");
      setEnviando(false);
      return;
    }

    router.push(redirect);
  }

  const linkCadastro = redirect === "/minha-conta" ? "/cadastro" : `/cadastro?redirect=${encodeURIComponent(redirect)}`;

  return (
    <div className="rounded-card border border-border bg-papel p-8 shadow-card">
      <h1 className="font-display text-2xl text-heading text-center">Entrar</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
        <label>
          E-mail
          <input type="email" autoComplete="email" {...register("email")} />
        </label>
        {errors.email && <p className="text-sm text-vermelho">{errors.email.message}</p>}

        <label>
          Senha
          <input type="password" autoComplete="current-password" {...register("senha")} />
        </label>
        {errors.senha && <p className="text-sm text-vermelho">{errors.senha.message}</p>}

        {erro && (
          <p role="alert" className="text-sm text-vermelho">
            {erro}
          </p>
        )}

        <CTAButton type="submit" disabled={enviando} className="mt-2 w-full justify-center">
          {enviando ? "Entrando…" : "Entrar"}
        </CTAButton>
      </form>

      <p className="mt-6 text-center text-[15px] text-marrom-suave">
        Ainda não tem conta?{" "}
        <Link href={linkCadastro} className="text-vinho underline underline-offset-4 decoration-ambar">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
