import { z } from "zod";

// Dados obrigatórios do comprador: nome, e-mail, whatsapp. CPF propositalmente
// fora daqui — o documento de requisitos orienta evitar CPF sem necessidade real.
export const compradorSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo"),
  email: z.string().trim().email("E-mail inválido"),
  whatsapp: z
    .string()
    .trim()
    .min(10, "Informe um WhatsApp válido com DDD")
    .regex(/^[\d\s()+-]+$/, "Use apenas números"),
});

export const participanteSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome completo do participante"),
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .optional()
    .or(z.literal("")),
});

export const participantesSchema = z.object({
  participantes: z.array(participanteSchema).min(1, "Informe ao menos um participante"),
});

export type CompradorFormValues = z.infer<typeof compradorSchema>;
export type ParticipanteFormValues = z.infer<typeof participanteSchema>;
export type ParticipantesFormValues = z.infer<typeof participantesSchema>;
