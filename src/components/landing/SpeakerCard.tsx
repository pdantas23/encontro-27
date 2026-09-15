interface SpeakerCardProps {
  nome: string;
  funcao: string | null;
  fotoUrl: string | null;
}

/** Card simples de convidado: foto, nome e função (quando existir). */
export function SpeakerCard({ nome, funcao, fotoUrl }: SpeakerCardProps) {
  return (
    <li className="flex flex-col items-center text-center">
      <div className="size-28 sm:size-32 rounded-full overflow-hidden bg-areia border border-border">
        {fotoUrl ? (
          // Fotos vêm de URL externa cadastrada no painel; sem otimização (output: export).
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fotoUrl} alt="" width={128} height={128} loading="lazy" className="size-full object-cover" />
        ) : (
          <span aria-hidden="true" className="flex size-full items-center justify-center font-display text-3xl text-dourado">
            {nome.trim().charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <h3 className="mt-4 font-display text-xl text-vinho">{nome}</h3>
      {funcao ? <p className="mt-1 text-sm text-marrom-suave">{funcao}</p> : null}
    </li>
  );
}

/** Estado de carregamento com o mesmo tamanho do card, para não deslocar o layout. */
export function SpeakerCardSkeleton() {
  return (
    <li aria-hidden="true" className="flex flex-col items-center animate-pulse">
      <div className="size-28 sm:size-32 rounded-full bg-areia" />
      <div className="mt-4 h-5 w-28 rounded bg-areia" />
      <div className="mt-2 h-4 w-20 rounded bg-areia/70" />
    </li>
  );
}
