import Image from "next/image";
import { CTAButton } from "@/components/ui/CTAButton";
import { assetPath, cn } from "@/lib/utils";
import {
  AFTERMOVIE,
  EVENTO,
  JORNADA,
  LOCAIS,
  PALESTRANTES,
  PILARES_ATIVACAO,
  PUBLICO,
  VIDEOS_VERTICAIS,
} from "./conteudo";
import { IconePilar, Ornamento } from "./Icones";
import { VideoSlot } from "./VideoSlot";
import { Megaphone, TrendingUp, Users } from "lucide-react";

/* Peças comuns ------------------------------------------------------ */

const TITULO = "font-display text-vermelho leading-[1.05] text-balance";
const CORPO = "font-serif text-base sm:text-[17px] leading-relaxed text-marrom text-pretty";

function Rotulo({ children, centro = false }: { children: string; centro?: boolean }) {
  return (
    <>
      <p className={cn("rotulo-secao text-ambar-texto text-sm", centro && "text-center")}>{children}</p>
      <span aria-hidden="true" className={cn("filete mt-4 w-16", centro && "mx-auto")} />
    </>
  );
}

/** Mancha de aquarela vermelha dos cantos do Canva. Decorativa. */
function Aquarela({ lado, className }: { lado: "esquerda" | "direita"; className?: string }) {
  return (
    <Image
      src={assetPath(lado === "esquerda" ? "/ativacao/aquarela-canto-a.webp" : "/ativacao/aquarela-canto-b.webp")}
      alt=""
      width={lado === "esquerda" ? 379 : 399}
      height={lado === "esquerda" ? 314 : 255}
      className={cn(
        "pointer-events-none absolute bottom-0 h-auto select-none opacity-90",
        lado === "esquerda" ? "left-0 w-40 sm:w-60 lg:w-72" : "right-0 w-44 sm:w-64 lg:w-80",
        className,
      )}
    />
  );
}

function GalhoCaju({ className }: { className?: string }) {
  return (
    <Image
      src={assetPath("/ativacao/caju-galho.webp")}
      alt=""
      width={458}
      height={549}
      className={cn("pointer-events-none h-auto select-none", className)}
    />
  );
}

/** Papel do Canva (p.2): creme com sombra de galhos. Fundo das seções claras. */
function FundoPapel({ className }: { className?: string }) {
  return (
    <Image
      src={assetPath("/ativacao/papel-galhos.webp")}
      alt=""
      width={1672}
      height={941}
      loading="lazy"
      className={cn("pointer-events-none absolute inset-0 -z-10 size-full object-cover object-right", className)}
    />
  );
}

/** Folhas em traço dourado que emolduram os slides do Canva. */
function FolhaDourada({ variante, className }: { variante: "a" | "b"; className?: string }) {
  return (
    <Image
      src={assetPath(variante === "a" ? "/ativacao/folha-dourada-a.webp" : "/ativacao/folha-dourada-b.webp")}
      alt=""
      width={variante === "a" ? 339 : 279}
      height={variante === "a" ? 393 : 295}
      loading="lazy"
      className={cn("pointer-events-none absolute h-auto select-none opacity-60", className)}
    />
  );
}

/** Losango dourado do Canva (ornamento entre filetes e nos cantos da moldura). */
function Losango({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("block size-2 rotate-45 border border-dourado bg-papel", className)} />;
}

/* 1. Hero ----------------------------------------------------------- */

const NAV = [
  { href: "#sobre", label: "O Encontro" },
  { href: "#convidados", label: "Convidados" },
  { href: "#videos", label: "Vídeos" },
  { href: "#ativacao", label: "Ativação" },
  { href: "#cotas", label: "Cotas" },
];

export function HeroAtivacao() {
  return (
    <header className="relative isolate overflow-hidden bg-papel">
      {/* Capa do Canva (p.1): ponte estaiada de Teresina ao pôr do sol. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assetPath("/ativacao/hero-ponte.webp")}
        alt=""
        width={1672}
        height={941}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 -z-10 size-full object-cover object-[30%_100%]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-papel/90 via-papel/70 to-papel/0" />

      <nav aria-label="Seções da página" className="container-site flex items-center justify-end gap-1 pt-4 sm:pt-6">
        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="inline-flex min-h-11 items-center px-3 eyebrow text-vinho hover:text-ambar-texto">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a href="#cotas" className="inline-flex min-h-11 items-center px-3 eyebrow text-vinho md:hidden">
          Cotas
        </a>
        <a
          href="#interesse"
          className="ml-1 inline-flex min-h-11 items-center rounded-pill border border-ambar-texto px-4 eyebrow text-vinho hover:bg-papel"
        >
          Tenho interesse
        </a>
      </nav>

      <div className="container-site flex flex-col items-center pt-8 pb-40 text-center sm:pt-10 sm:pb-56 lg:pb-64">
        <Image
          src={assetPath("/brand/flor-ouro.webp")}
          alt=""
          width={600}
          height={571}
          priority
          className="h-auto w-16 sm:w-24"
        />
        <Image
          src={assetPath("/brand/wordmark-ouro.webp")}
          alt="O Encontro"
          width={900}
          height={135}
          priority
          className="mt-3 h-auto w-[200px] sm:w-[300px]"
        />
        <span aria-hidden="true" className="mt-2 flex items-center gap-3 font-display text-xs tracking-[0.42em] indent-[0.42em] text-ambar-texto">
          <span className="h-px w-8 bg-dourado-linha" />
          2027
          <span className="h-px w-8 bg-dourado-linha" />
        </span>

        <p className="mt-8 rotulo-secao text-sm text-ambar-texto sm:text-base">Plano de ativação de marcas</p>
        <h1 className="mt-3 max-w-3xl font-display text-vinho text-[2.5rem] leading-[1.02] sm:text-6xl lg:text-7xl text-balance">
          Ative sua marca no Encontro 2027
        </h1>
        <p className="mt-4 eyebrow text-[0.7rem] text-vermelho sm:text-xs">{EVENTO.assinatura}</p>

        <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <CTAButton href="#cotas" size="lg" className="w-full sm:w-auto">
            Conhecer as cotas
          </CTAButton>
          <CTAButton href="#interesse" size="lg" variant="secondary" className="w-full bg-papel/70 sm:w-auto">
            Quero ativar minha marca
          </CTAButton>
        </div>
      </div>

      <p className="absolute inset-x-0 bottom-0 bg-linear-to-t from-vinho/70 to-transparent px-4 pt-10 pb-4 text-center font-sans text-xs font-bold tracking-[0.12em] text-papel uppercase sm:text-sm">
        {EVENTO.cidade} | {EVENTO.datas}
      </p>
    </header>
  );
}

/* 2. O Encontro: sobre, edição 2027, congresso, locais, público ------- */

export function SobreEncontro() {
  return (
    <section id="sobre" aria-labelledby="sobre-titulo" className="relative isolate scroll-mt-4 overflow-hidden">
      <FundoPapel />
      <FolhaDourada variante="a" className="-top-6 -left-16 w-40 sm:w-52" />
      {/* O recorte do Canva termina reto na direita: fica colado na borda da tela. */}
      <GalhoCaju className="absolute top-10 right-0 hidden w-52 lg:block xl:w-60" />
      <div className="container-site relative grid gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end">
        <div>
          <Rotulo>Sobre o Encontro</Rotulo>
          <h2 id="sobre-titulo" className={cn(TITULO, "mt-6 text-4xl sm:text-5xl lg:text-[3.5rem]")}>
            O maior e mais inspirador evento do mercado de eventos do Piauí.
          </h2>
          <p className={cn(CORPO, "mt-6 max-w-xl")}>
            Realizado anualmente em Teresina, o Encontro nasceu para <strong className="font-semibold text-vinho">fortalecer o setor</strong>,{" "}
            <strong className="font-semibold text-vinho">gerar conexões reais</strong> e{" "}
            <strong className="font-semibold text-vinho">impulsionar o crescimento</strong> de profissionais e empresas que vivem de
            criar experiências inesquecíveis.
          </p>
        </div>
        {/* Selo com moldura dupla e divisória, como no Canva (p.2). */}
        <div className="rounded-2xl border border-dourado-linha p-1.5 lg:mb-2">
          <div className="flex items-center gap-5 rounded-xl border border-dourado-linha/60 bg-papel/60 px-5 py-5 sm:px-6">
            <Image src={assetPath("/brand/flor-ouro-sm.webp")} alt="" width={160} height={152} className="h-auto w-11 shrink-0" />
            <span aria-hidden="true" className="h-14 w-px shrink-0 bg-dourado-linha" />
            <p className="font-serif text-lg leading-snug text-vinho">
              Conteúdo, networking, posicionamento e experiências memoráveis em um só lugar.
            </p>
          </div>
        </div>
      </div>

      <div className="container-site relative grid gap-10 pb-16 sm:pb-24 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <Rotulo>Edição 2027</Rotulo>
          <h3 className={cn(TITULO, "mt-6 text-3xl sm:text-4xl text-ambar-texto")}>
            A 5ª edição consolida o Encontro como referência nacional.
          </h3>
          <p className={cn(CORPO, "mt-6")}>
            Em 2027, o Encontro chega à sua 5ª edição como um congresso para empresários, assessores, cerimonialistas,
            decoradores, fornecedores e prestadores de serviços que desejam elevar o padrão de entrega e de posicionamento no
            mercado.
          </p>
        </div>
        {/* Citação em moldura arredondada com aspas douradas (p.3). */}
        <figure className="relative rounded-[1.75rem] border border-dourado-linha bg-papel/50 px-7 pt-14 pb-8 text-center sm:px-10">
          <span aria-hidden="true" className="absolute top-3 left-6 font-serif text-7xl leading-none font-bold text-ambar">
            “
          </span>
          <blockquote className="font-serif text-xl italic leading-relaxed text-vinho sm:text-[1.35rem]">
            Uma experiência de transformação para renovar ideias, fortalecer conexões e inspirar novas formas de criar, servir e
            crescer.
          </blockquote>
          <span aria-hidden="true" className="mx-auto mt-6 block h-px w-12 bg-ambar" />
        </figure>
      </div>
    </section>
  );
}

/**
 * Convidados — réplica da p.4 do Canva: papel com moldura dourada fina e
 * losangos, marca no topo, "O CONGRESSO", faixa "Palestrantes do congresso"
 * e os retratos em moldura com o selo da flor.
 */
export function Congresso() {
  return (
    <section id="convidados" aria-labelledby="congresso-titulo" className="relative isolate scroll-mt-4 overflow-hidden py-16 sm:py-20">
      <FundoPapel className="object-left" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-3 border border-dourado-linha sm:inset-5">
        <Losango className="absolute -top-1 left-1/2 -translate-x-1/2" />
        <Losango className="absolute -bottom-1 left-1/2 -translate-x-1/2" />
      </div>
      <FolhaDourada variante="b" className="bottom-6 left-0 hidden w-44 sm:block lg:w-56" />
      <GalhoCaju className="absolute top-5 right-0 hidden w-40 lg:block xl:w-52" />

      <div className="container-site relative text-center">
        <Image src={assetPath("/brand/flor-ouro.webp")} alt="" width={600} height={571} loading="lazy" className="mx-auto h-auto w-14 sm:w-16" />
        <Image
          src={assetPath("/brand/wordmark-ouro.webp")}
          alt=""
          width={900}
          height={135}
          loading="lazy"
          className="mx-auto mt-2 h-auto w-36 sm:w-44"
        />
        <h2 id="congresso-titulo" className="mt-4 font-display text-vermelho text-5xl uppercase tracking-[0.03em] sm:text-7xl">
          O Congresso
        </h2>
        <p className="mt-2 flex items-center justify-center gap-4 font-serif text-xl italic text-vinho sm:text-2xl">
          <span aria-hidden="true" className="hidden h-px w-16 bg-dourado-linha sm:block lg:w-28" />
          <span>
            Edição especial de <strong className="font-bold text-vermelho">5 anos</strong>
          </span>
          <span aria-hidden="true" className="hidden h-px w-16 bg-dourado-linha sm:block lg:w-28" />
        </p>
        <p className={cn(CORPO, "mx-auto mt-6 max-w-2xl")}>
          Em 2027, o O Encontro celebra sua 5ª edição com uma experiência ainda mais marcante, reunindo conteúdo, conexão e
          inspiração para os profissionais do mercado de eventos.
        </p>

        <div className="mt-10 flex items-center justify-center gap-3">
          <Losango className="hidden sm:block" />
          <h3 className="px-2 font-sans text-xs font-bold tracking-[0.22em] text-vinho uppercase sm:text-sm">
            Palestrantes do congresso
          </h3>
          <Losango className="hidden sm:block" />
        </div>

        <ul className="mx-auto mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-[2.1fr_repeat(4,minmax(0,1fr))] lg:gap-x-5 xl:-mx-10">
          {PALESTRANTES.map((p) => (
            <li key={p.nome} className={cn(p.destaque && "col-span-2 lg:col-span-1")}>
              <figure>
                <div className="relative rounded-[1.25rem] border border-dourado-linha bg-papel p-1.5">
                  <Image
                    src={assetPath(p.foto)}
                    alt={p.alt}
                    width={p.largura}
                    height={p.altura}
                    loading="lazy"
                    className={cn(
                      "h-auto w-full rounded-[0.95rem] object-cover object-[50%_20%]",
                      // Trio inteiro, sem corte; retratos quadrados, cortando só as laterais.
                      // Desktop: coluna do trio 2.1× a dos retratos (descontada a moldura) = mesma altura.
                      !p.destaque && "aspect-square",
                    )}
                  />
                </div>
                <figcaption className="mt-4 font-serif text-lg leading-tight text-vinho sm:text-xl">{p.nome}</figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <p className="mt-14 flex items-center justify-center gap-4 font-serif text-sm text-marrom sm:text-base">
          <span aria-hidden="true" className="hidden h-px w-14 bg-dourado-linha sm:block" />
          <span>{EVENTO.datas}</span>
          <span aria-hidden="true" className="text-dourado">
            •
          </span>
          <span>{EVENTO.cidade}</span>
          <span aria-hidden="true" className="hidden h-px w-14 bg-dourado-linha sm:block" />
        </p>
      </div>
    </section>
  );
}

export function Locais() {
  return (
    <section aria-labelledby="locais-titulo" className="py-16 sm:py-24">
      <div className="container-site">
        <Rotulo>Onde acontece</Rotulo>
        <h2 id="locais-titulo" className="sr-only">
          Onde acontece
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-5 lg:gap-8">
          {LOCAIS.map((l, i) => (
            <li key={l.foto} className={cn(i === 1 && "sm:translate-y-8")}>
              <figure>
                <Image
                  src={assetPath(l.foto)}
                  alt={l.alt}
                  width={720}
                  height={1280}
                  loading="lazy"
                  className="aspect-[4/5] h-auto w-full rounded-[1.25rem] object-cover sm:aspect-[3/4]"
                />
                <figcaption className="mt-3 font-serif text-[15px] italic leading-snug text-vinho">
                  {l.legenda.map((linha) => (
                    <span key={linha} className="block">
                      {linha}
                    </span>
                  ))}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Publico() {
  return (
    <section aria-labelledby="publico-titulo" className="relative isolate overflow-hidden pt-16 pb-28 sm:pt-20 sm:pb-36">
      <FundoPapel />
      <Aquarela lado="esquerda" />
      <div className="container-site relative grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div>
          <Rotulo>Público</Rotulo>
          <h2 id="publico-titulo" className={cn(TITULO, "mt-6 text-4xl sm:text-5xl")}>
            Sua marca ao lado de quem <span className="text-ambar-texto">decide</span>,{" "}
            <span className="text-ambar-texto">recomenda</span> e <span className="text-ambar-texto">movimenta</span> o mercado.
          </h2>
          <ul className="mt-8 space-y-3">
            {PUBLICO.map((p) => (
              <li key={p} className="flex gap-3">
                <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-1.5 size-3.5 shrink-0 text-ambar" fill="currentColor">
                  <path d="M10 0 12 8 20 10 12 12 10 20 8 12 0 10 8 8Z" />
                </svg>
                <span className={CORPO}>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[1.75rem] border border-dourado-linha bg-papel/50 px-8 py-10 text-center">
          <Ornamento />
          <p className="mt-5 font-serif text-2xl leading-snug text-vinho sm:text-[1.75rem]">
            Um público altamente qualificado e influente.
          </p>
          <Ornamento className="mt-5" />
        </div>
      </div>
    </section>
  );
}

/* 3. Vídeos --------------------------------------------------------- */

export function Videos() {
  return (
    <section id="videos" aria-labelledby="videos-titulo" className="scroll-mt-4 bg-areia/60 py-16 sm:py-24">
      <div className="container-site">
        <Rotulo>Vídeos</Rotulo>
        <h2 id="videos-titulo" className={cn(TITULO, "mt-6 text-4xl sm:text-5xl")}>
          O Encontro em vídeo
        </h2>

        <VideoSlot video={AFTERMOVIE} className="mt-10" tocarAoAparecer />

        {/* Celular: carrossel com rolagem própria. Tablet+: três colunas com ritmo escalonado. */}
        <ul
          aria-label="Vídeos verticais"
          className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-auto sm:max-w-3xl sm:snap-none sm:overflow-visible sm:px-0 sm:pb-8"
        >
          {VIDEOS_VERTICAIS.map((v, i) => (
            <li key={v.id} className={cn("w-[62%] shrink-0 snap-center sm:w-auto sm:flex-1", i === 1 && "sm:translate-y-8")}>
              <figure>
                <VideoSlot video={v} />
                {/* Legenda como na p.11 do Canva: nome do momento, sem o "Aftermovie N". */}
                <figcaption className="mt-3 font-serif text-[15px] italic leading-snug text-vinho">
                  {v.titulo.replace(/^Aftermovie \d+ - /, "")}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* 4. Ativação de marca: posicionamento, pilares, jornada ---------------- */

const ICONES_JORNADA = [Megaphone, Users, TrendingUp];

export function Ativacao() {
  return (
    <section id="ativacao" aria-labelledby="ativacao-titulo" className="relative isolate scroll-mt-4 overflow-hidden">
      <FundoPapel />
      <GalhoCaju className="absolute top-12 right-0 hidden w-60 lg:block xl:w-72" />
      <div className="container-site relative py-16 sm:py-24">
        <div className="max-w-2xl lg:max-w-[38rem]">
          <Rotulo>Posicionamento</Rotulo>
          <h2 id="ativacao-titulo" className={cn(TITULO, "mt-6 text-4xl sm:text-5xl lg:text-[3.5rem]")}>
            Ser parceiro do Encontro é associar sua marca à <span className="text-ambar-texto">excelência</span>.
          </h2>
          <p className={cn(CORPO, "mt-6 max-w-lg")}>
            Sofisticação, inovação e presença estratégica em um dos segmentos mais promissores e em constante crescimento: o
            mercado de eventos.
          </p>
        </div>
      </div>

      <div className="container-site pb-16 sm:pb-24">
        <Rotulo>Ativação de marca</Rotulo>
        <h3 className={cn(TITULO, "mt-6 max-w-2xl text-3xl text-vinho sm:text-[2.6rem]")}>
          Além da exposição institucional, sua marca pode ser <strong className="font-normal text-vermelho">vivida</strong>.
        </h3>
        {/* Quatro cards com ícone em círculo e filete, como no Canva (p.7). */}
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {PILARES_ATIVACAO.map((p) => (
            <li
              key={p.icone}
              className="flex flex-col items-center rounded-[1.25rem] border border-dourado-linha/80 bg-papel/70 px-6 pt-8 pb-9 text-center"
            >
              <span className="grid size-16 place-items-center rounded-full border border-dourado-linha bg-areia text-vinho">
                <IconePilar tipo={p.icone} className="size-7" />
              </span>
              <span aria-hidden="true" className="mt-5 block h-px w-7 bg-dourado" />
              <p className="mt-5 max-w-[15rem] font-serif text-[17px] leading-snug text-marrom">{p.texto}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative border-t border-dourado-linha/60 bg-areia/50 pt-16 pb-28 sm:pt-24 sm:pb-36">
        <Aquarela lado="direita" />
        <div className="container-site relative">
          <Rotulo centro>Jornada de visibilidade</Rotulo>
          <h3 className={cn(TITULO, "mx-auto mt-6 max-w-2xl text-center text-3xl text-vinho sm:text-[2.6rem]")}>
            A presença da sua marca antes, durante e depois.
          </h3>
          <ol className="relative mx-auto mt-12 grid max-w-4xl gap-10 sm:grid-cols-3 sm:gap-6">
            <span aria-hidden="true" className="absolute top-8 right-[16.5%] left-[16.5%] hidden h-px bg-dourado-linha sm:block" />
            {JORNADA.map((j, i) => {
              const Icone = ICONES_JORNADA[i];
              return (
                <li key={j.etapa} className="relative text-center">
                  <span className="mx-auto grid size-16 place-items-center rounded-full bg-linear-to-br from-dourado to-ambar-escuro text-papel">
                    <Icone aria-hidden="true" strokeWidth={1.5} className="size-7" />
                  </span>
                  <p className="mt-5 font-display text-2xl uppercase tracking-[0.12em] text-vinho">{j.etapa}</p>
                  <span aria-hidden="true" className="mx-auto mt-3 block h-px w-8 bg-dourado-linha" />
                  <p className="mx-auto mt-3 max-w-[16rem] font-serif text-[15px] leading-relaxed text-marrom">{j.texto}</p>
                </li>
              );
            })}
          </ol>
          <div className="mt-12 flex justify-center">
            <CTAButton href="#cotas" size="lg">
              Ver possibilidades de ativação
            </CTAButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Encerramento (p.10) ------------------------------------------------ */

export function Encerramento() {
  return (
    <section aria-label="Mensagem final" className="relative isolate overflow-hidden">
      <Image
        src={assetPath("/ativacao/ponte-por-do-sol.webp")}
        alt=""
        width={1672}
        height={941}
        loading="lazy"
        className="absolute inset-0 -z-10 size-full object-cover object-[70%_100%]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-papel/85 via-papel/60 to-papel/10" />
      <div className="container-site flex flex-col items-center pt-16 pb-40 text-center sm:pt-24 sm:pb-56">
        <Image src={assetPath("/brand/flor-ouro.webp")} alt="" width={600} height={571} loading="lazy" className="h-auto w-14 sm:w-20" />
        <p className="mt-8 max-w-3xl font-display text-2xl uppercase leading-snug text-ambar-texto sm:text-[2rem] text-balance">
          No Encontro 2027, sua marca não apenas aparece — ela é vivida, lembrada e associada à experiência que transforma o
          mercado de eventos.
        </p>
      </div>
    </section>
  );
}
