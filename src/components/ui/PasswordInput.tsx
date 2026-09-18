"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** Campo de senha com botão de olho pra mostrar/ocultar. Repassa ref e demais props ao <input> (serve pro register do react-hook-form). */
export function PasswordInput({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="relative mt-1.5">
      <input {...props} type={visivel ? "text" : "password"} className={cn("pr-11", className)} />
      <button
        type="button"
        onClick={() => setVisivel((atual) => !atual)}
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visivel}
        className="absolute inset-y-0 right-0 inline-flex w-11 cursor-pointer items-center justify-center rounded-r-xl text-marrom-suave transition-colors hover:text-vinho"
      >
        {visivel ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
      </button>
    </div>
  );
}
