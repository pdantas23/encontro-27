import { z } from "zod";

// 6 caracteres = minimum_password_length do Supabase Auth self-hosted
// (config.toml) — abaixo disso o signUp já rejeita, então validar aqui
// só adianta o feedback pro usuário.
const senhaSchema = z.string().min(6, "A senha precisa ter pelo menos 6 caracteres");

export const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  senha: senhaSchema,
});

export const cadastroSchema = z
  .object({
    nome: z.string().trim().min(3, "Informe seu nome completo"),
    email: z.string().trim().email("E-mail inválido"),
    whatsapp: z
      .string()
      .trim()
      .min(10, "Informe um WhatsApp válido com DDD")
      .regex(/^[\d\s()+-]+$/, "Use apenas números"),
    senha: senhaSchema,
    confirmarSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type CadastroFormValues = z.infer<typeof cadastroSchema>;
