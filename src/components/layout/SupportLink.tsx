import { cn } from "@/lib/utils";

const numero = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT ?? "";

/** Link de suporte via WhatsApp. Só aparece quando NEXT_PUBLIC_WHATSAPP_SUPPORT estiver definido. */
export function SupportLink({ className }: { className?: string }) {
  const digits = numero.replace(/\D/g, "");
  if (!digits) return null;

  return (
    <p className={cn("text-sm", className)}>
      <span className="text-marrom-suave">Suporte: </span>
      <a
        href={`https://wa.me/${digits}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-10 items-center font-semibold text-vinho underline underline-offset-4 decoration-ambar hover:decoration-ambar-escuro"
      >
        WhatsApp {numero}
      </a>
    </p>
  );
}
