import type { ReactNode } from "react";

/**
 * Bloco da descrição do evento na página de ingressos: título curto e
 * conteúdo, separados por filete — a coluna da esquerda do desenho de
 * bilheteria. Seções client podem usá-lo (não tem estado).
 */
export function EventoSecao({ id, titulo, children }: { id: string; titulo: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-6 border-t border-border py-10 sm:py-12">
      <h2 id={`${id}-titulo`} className="font-display text-heading text-2xl sm:text-3xl leading-tight text-balance">
        {titulo}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
