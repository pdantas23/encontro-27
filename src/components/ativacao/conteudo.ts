/**
 * Conteúdo da página de Ativação de Marca.
 *
 * Fonte única: "Plano de Ativação de Marcas - O Encontro 2027" (Canva,
 * 12 páginas, design DAHUzkNCLJ4). Textos copiados do material; só foram
 * corrigidos erros de digitação evidentes ("conteído" → "conteúdo",
 * "negícios" → "negócios"). Nada aqui foi criado para preencher lacuna:
 * o que não está no Canva fica `null` e aparece como pendente na página.
 */

export const EVENTO = {
  nome: "O Encontro 2027",
  assinatura: "Onde o mercado de eventos se encontra para evoluir",
  cidade: "Teresina - PI",
  datas: "23, 24 e 25 de agosto de 2027",
} as const;

/* ------------------------------------------------------------------ */
/* Cotas (p.9 do Canva — "Cotas para Ativação de Marca")               */
/* ------------------------------------------------------------------ */

/**
 * Tipos de benefício, na ordem em que aparecem nas quatro colunas do Canva.
 * Servem para alinhar a tabela comparativa; o texto de cada célula é o da
 * própria cota, sem reescrita.
 */
export const CATEGORIAS = [
  { id: "logo", rotulo: "Logomarca em tela", icone: "tela" },
  { id: "folheto", rotulo: "Folheto no kit", icone: "folheto" },
  { id: "stories", rotulo: "Stories no Instagram", icone: "instagram" },
  { id: "videoFeed", rotulo: "Vídeo institucional no feed", icone: "video" },
  { id: "kit", rotulo: "Ativação nos kits ou brinde", icone: "brinde" },
  { id: "vt", rotulo: "VT no Instagram em collab", icone: "instagram" },
  { id: "presencial", rotulo: "Ativação presencial", icone: "espaco" },
  { id: "intervalo", rotulo: "Vídeo no intervalo", icone: "video" },
  { id: "passaporte", rotulo: "Passaporte para a Imersão", icone: "passaporte" },
  { id: "cafe", rotulo: "Café da manhã de negócios", icone: "cafe" },
] as const;

export type CategoriaId = (typeof CATEGORIAS)[number]["id"];
export type IconeBeneficio = (typeof CATEGORIAS)[number]["icone"];

/** Cor do cabeçalho da cota no Canva: areia, vermelho, âmbar/dourado, vinho. */
export type TomCota = "areia" | "vermelho" | "ambar" | "vinho";

export interface Cota {
  id: "cota-01" | "cota-02" | "cota-03" | "cota-04";
  nome: string;
  valor: number;
  /** Frase em caixa alta no rodapé de cada coluna do Canva. */
  assinatura: string;
  tom: TomCota;
  beneficios: Partial<Record<CategoriaId, string>>;
}

export type CotaId = Cota["id"];

export const COTAS: readonly Cota[] = [
  {
    id: "cota-01",
    nome: "Cota 01",
    valor: 2000,
    assinatura: "Sua marca faz parte dessa história.",
    tom: "areia",
    beneficios: {
      folheto: "Folheto da empresa dentro do kit dos participantes",
      stories: "01 story no Instagram oficial do evento durante a entrega do serviço",
      kit: "01 ativação de marca dentro dos kits dos participantes ou distribuição de brinde",
    },
  },
  {
    id: "cota-02",
    nome: "Cota 02",
    valor: 5000,
    assinatura: "Mais visibilidade para grandes relações.",
    tom: "vermelho",
    beneficios: {
      logo: "Logomarca do patrocinador em TV, em arte conjunta com os demais patrocinadores na mesma categoria",
      folheto: "Folheto da empresa dentro do kit dos participantes",
      stories: "02 postagens nos stories no Instagram oficial do O Encontro (01 antes do evento e 01 durante o evento)",
      kit: "01 ativação de marca dentro dos kits dos participantes ou distribuição de brinde",
      passaporte: "01 passaporte Start para a Imersão (não inclui almoço de negócios nem jantar de VIPs)",
    },
  },
  {
    id: "cota-03",
    nome: "Cota 03",
    valor: 15000,
    assinatura: "Experiências que fortalecem marcas.",
    tom: "ambar",
    beneficios: {
      logo: "Logomarca do patrocinador no painel principal durante o intervalo",
      folheto: "Folheto da empresa dentro do kit dos participantes",
      stories: "03 postagens nos stories do Instagram oficial do O Encontro (01 antes do evento e 02 durante o evento)",
      videoFeed:
        "01 vídeo institucional de 15s, fornecido pelo patrocinador, para postagem no feed do O Encontro em collab com o patrocinador",
      kit: "01 ativação de marca dentro dos kits dos participantes ou distribuição de brindes",
      vt: "01 vídeo em formato de VT para Instagram oficial do evento em collab com o patrocinador",
      presencial: "01 ativação de marca presencial no espaço 2x2",
      intervalo: "Vídeo de 15s passando durante o intervalo do evento em TVs",
      passaporte: "01 passaporte Start para a Imersão (não contempla almoço de negócios nem jantar com VIPs)",
      cafe: "Café da manhã de negócios",
    },
  },
  {
    id: "cota-04",
    nome: "Cota 04",
    valor: 25000,
    assinatura: "Posicionamento premium para grandes resultados.",
    tom: "vinho",
    beneficios: {
      logo: "Logomarca do patrocinador no painel principal durante o intervalo, de forma individual",
      folheto: "Folheto da empresa dentro do kit dos participantes",
      videoFeed:
        "01 vídeo institucional de 25s, fornecido pelo patrocinador, para postagem no feed do O Encontro em collab com o patrocinador",
      kit: "01 ativação de marca dentro dos kits dos participantes ou distribuição de brindes",
      vt: "02 vídeos em formato de VT para Instagram oficial do evento em collab com o patrocinador",
      presencial: "01 ativação de marca presencial no espaço 2x4",
      intervalo: "01 vídeo de 20s passando durante o intervalo do evento no painel principal",
      passaporte: "02 passaportes Start para a Imersão (não incluem almoço de negócios nem jantar VIP)",
      cafe: "Café da manhã de negócios",
    },
  },
];

export function isCotaId(valor: string | null | undefined): valor is CotaId {
  return COTAS.some((c) => c.id === valor);
}

export function cotaPorId(id: CotaId | null) {
  return COTAS.find((c) => c.id === id) ?? null;
}

/** Benefícios da cota na ordem do Canva. */
export function beneficiosDaCota(cota: Cota) {
  return CATEGORIAS.flatMap((cat) => {
    const texto = cota.beneficios[cat.id];
    return texto ? [{ categoria: cat, texto }] : [];
  });
}

/** "R$ 2.000,00" — o mesmo formato do Canva. */
export function formatarValor(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor).replace(/ /g, " ");
}

/* ------------------------------------------------------------------ */
/* Contato comercial — WhatsApp "Encontro. Comercial"                   */
/* ------------------------------------------------------------------ */

export const WHATSAPP_COMERCIAL = { numero: "5586999811935", exibicao: "+55 86 99981-1935" } as const;

/** Link do WhatsApp com mensagem pronta; cita a cota quando o visitante escolheu uma. */
export function linkWhatsAppComercial(cota: Cota | null) {
  const mensagem = cota
    ? `Olá! Tenho interesse em ativar minha marca no O Encontro 2027 com a ${cota.nome} (${formatarValor(cota.valor)}).`
    : "Olá! Tenho interesse em ativar minha marca no O Encontro 2027.";
  return `https://wa.me/${WHATSAPP_COMERCIAL.numero}?text=${encodeURIComponent(mensagem)}`;
}

/* ------------------------------------------------------------------ */
/* Vídeos — PENDENTES. Para publicar, preencha `src` (e `poster`)       */
/* com o caminho do arquivo em public/ativacao/videos/.                */
/* ------------------------------------------------------------------ */

export interface VideoAtivacao {
  id: string;
  /** Nome usado no placeholder e no aria-label do player. */
  titulo: string;
  formato: "vertical" | "horizontal";
  /** Caminho em public/, ex.: "/ativacao/videos/aftermovie.mp4". `null` = pendente. */
  src: string | null;
  /** Quadro de capa em public/ (webp). Opcional, mas evita tela preta antes do play. */
  poster: string | null;
}

/** "Teaser de Todo Evento" (71s), convertido de HEVC 1080p para H.264 720p (~2,8 Mbps) — toca em qualquer navegador. */
export const AFTERMOVIE: VideoAtivacao = {
  id: "aftermovie",
  titulo: "Aftermovie",
  formato: "horizontal",
  src: "/ativacao/videos/aftermovie.mp4",
  poster: "/ativacao/videos/aftermovie-capa.webp",
};

/** Aftermovies 1–3 (pasta "Aftermovie's" no Drive), de 4K vertical para H.264 720×1280 (~2,2 Mbps). */
export const VIDEOS_VERTICAIS: readonly VideoAtivacao[] = [
  {
    id: "vertical-01",
    titulo: "Aftermovie 1 - Almoço de Negócios",
    formato: "vertical",
    src: "/ativacao/videos/aftermovie-1.mp4",
    poster: "/ativacao/videos/aftermovie-1-capa.webp",
  },
  {
    id: "vertical-02",
    titulo: "Aftermovie 2 - Imersão + Jantar dos VIPs",
    formato: "vertical",
    src: "/ativacao/videos/aftermovie-2.mp4",
    poster: "/ativacao/videos/aftermovie-2-capa.webp",
  },
  {
    id: "vertical-03",
    titulo: "Aftermovie 3 - Imersão + Festa de Encerramento",
    formato: "vertical",
    src: "/ativacao/videos/aftermovie-3.mp4",
    poster: "/ativacao/videos/aftermovie-3-capa.webp",
  },
];

/* ------------------------------------------------------------------ */
/* Textos institucionais (p.2–p.8, p.10, p.11)                         */
/* ------------------------------------------------------------------ */

export const PUBLICO = [
  "Empresários e empreendedores do setor de eventos.",
  "Assessores, cerimonialistas, decoradores e produtores.",
  "Fornecedores e prestadores de serviços.",
  "Formadores de opinião e profissionais com poder de indicação.",
] as const;

/**
 * Palestrantes do congresso (p.4), na ordem do Canva. Fotos recortadas da
 * arte do congresso no Canva (1672px, a maior resolução que existe lá:
 * ~250px por retrato), ampliadas 3× com Lanczos + nitidez leve. O Esquadrão
 * do Altar é um trio: foto horizontal, card mais largo — como no Canva.
 * `alt` vazio nos retratos individuais: o nome já está na legenda logo abaixo.
 */
export const PALESTRANTES = [
  {
    nome: "Esquadrão do Altar",
    foto: "/ativacao/convidados/esquadrao-do-altar.webp",
    largura: 1296,
    altura: 588,
    alt: "As três integrantes do Esquadrão do Altar, rindo juntas",
    destaque: true,
  },
  { nome: "Jaeder Barreto", foto: "/ativacao/convidados/jaeder-barreto.webp", largura: 630, altura: 588, alt: "", destaque: false },
  { nome: "Taís Vaz", foto: "/ativacao/convidados/tais-vaz.webp", largura: 663, altura: 588, alt: "", destaque: false },
  { nome: "Fabi Moura", foto: "/ativacao/convidados/fabi-moura.webp", largura: 669, altura: 588, alt: "", destaque: false },
  { nome: "Daniel Del Rio", foto: "/ativacao/convidados/daniel-del-rio.webp", largura: 756, altura: 588, alt: "", destaque: false },
] as const;

export const PILARES_ATIVACAO = [
  { icone: "ideia", texto: "Ativação criativa e sensorial durante a imersão" },
  { icone: "pessoas", texto: "Conexões estratégicas com profissionais e empresas influentes" },
  { icone: "diamante", texto: "Posicionamento como referência de qualidade e confiança" },
  { icone: "megafone", texto: "Mais visibilidade nas campanhas de mídia e comunicação digital do evento" },
] as const;

export const JORNADA = [
  { etapa: "Antes", texto: "Campanhas de divulgação, posts, mídia e aquecimento." },
  { etapa: "Durante", texto: "Ativações, experiência presencial, relacionamento e visibilidade." },
  { etapa: "Depois", texto: "Conteúdos de memória, agradecimentos e relacionamento contínuo." },
] as const;

/** p.11 — legendas exatamente como no Canva. */
export const LOCAIS = [
  { foto: "/ativacao/local-vignoli.webp", alt: "Fachada do Vignoli", legenda: ["Almoço de Negócios - Vignoli"] },
  {
    foto: "/ativacao/local-finess-dia1.webp",
    alt: "Palco montado no salão do Finess Buffet",
    legenda: ["Imersão Dia 1 - Finess Buffet", "Jantar dos Vips - Grand Cru"],
  },
  {
    foto: "/ativacao/local-finess-dia2.webp",
    alt: "Salão do Finess Buffet com lounge de sofás vermelhos",
    legenda: ["Imersão Dia 2 - Finess Buffet", "Festa de Encerramento - Azuza"],
  },
] as const;
