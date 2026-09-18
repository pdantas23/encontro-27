"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

/**
 * Select próprio (padrão "select-only combobox" do WAI-ARIA): o foco fica
 * sempre no botão e a opção ativa é apontada por aria-activedescendant.
 */
export function Dropdown<T extends string>({ value, options, onChange, ariaLabel, className }: Props<T>) {
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const raizRef = useRef<HTMLDivElement>(null);
  const gatilhoRef = useRef<HTMLButtonElement>(null);
  const listaId = useId();

  const indiceSelecionado = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  useEffect(() => {
    if (!aberto) return;

    function handleMouseDown(event: MouseEvent) {
      if (!raizRef.current?.contains(event.target as Node)) setAberto(false);
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [aberto]);

  function abrir() {
    setAtivo(indiceSelecionado);
    setAberto(true);
  }

  function escolher(indice: number) {
    onChange(options[indice].value);
    setAberto(false);
    gatilhoRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!aberto) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        abrir();
      }
      return;
    }

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        setAberto(false);
        break;
      case "ArrowDown":
        event.preventDefault();
        setAtivo((atual) => (atual + 1) % options.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setAtivo((atual) => (atual - 1 + options.length) % options.length);
        break;
      case "Home":
        event.preventDefault();
        setAtivo(0);
        break;
      case "End":
        event.preventDefault();
        setAtivo(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        escolher(ativo);
        break;
      case "Tab":
        setAberto(false);
        break;
    }
  }

  return (
    <div ref={raizRef} className={cn("relative", className)}>
      <button
        ref={gatilhoRef}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={listaId}
        aria-activedescendant={aberto ? `${listaId}-${ativo}` : undefined}
        onClick={() => (aberto ? setAberto(false) : abrir())}
        onKeyDown={handleKeyDown}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-dourado/70 bg-papel px-3 text-sm text-marrom transition-colors hover:bg-areia/60"
      >
        <span className="truncate">{options[indiceSelecionado]?.label}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 shrink-0 text-marrom-suave transition-transform duration-150", aberto && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.ul
            id={listaId}
            role="listbox"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-papel py-1 shadow-card"
          >
            {options.map((option, indice) => {
              const selecionado = option.value === value;
              return (
                <li
                  key={option.value}
                  id={`${listaId}-${indice}`}
                  role="option"
                  aria-selected={selecionado}
                  onMouseEnter={() => setAtivo(indice)}
                  onClick={() => escolher(indice)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm text-marrom",
                    indice === ativo && "bg-areia",
                    selecionado && "font-semibold text-vinho",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {selecionado && <Check aria-hidden="true" className="size-4 shrink-0 text-ambar-texto" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
