import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Prefixa um caminho de `public/` com o basePath do deploy (`/encontro27`). */
export function assetPath(path: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

/** Máscara de telefone brasileiro: (11) 98888-7777 (celular) ou (11) 3333-4444 (fixo). */
export function formatarTelefone(valor: string): string {
  let digitos = valor.replace(/\D/g, "");
  // Autopreenchimento/colagem costuma trazer o código do país (+55).
  if (digitos.length > 11 && digitos.startsWith("55")) digitos = digitos.slice(2);
  digitos = digitos.slice(0, 11);

  if (digitos.length === 0) return "";
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}
