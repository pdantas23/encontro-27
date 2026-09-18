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
    // A máscara do formulário já garante só dígitos/pontuação; o que importa é ter DDD + número.
    whatsapp: z
      .string()
      .trim()
      .refine((valor) => valor.replace(/\D/g, "").length >= 10, "Informe um WhatsApp válido com DDD"),
    senha: senhaSchema,
    confirmarSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type CadastroFormValues = z.infer<typeof cadastroSchema>;
