import { ModalidadeDetalhe } from "@/components/ingressos/ModalidadeDetalhe";

/**
 * Export estático (output: "export") exige generateStaticParams() para
 * rotas dinâmicas — sem isso o build falha. 4 modalidades vêm do seed
 * (migration 0002); "almoco-start" foi aprovada pela organização em
 * 15/09/2026 (preço especial do almoço para quem tem Start).
 */
export function generateStaticParams() {
  return [
    { modalidade: "start" },
    { modalidade: "almoco-nao-participante" },
    { modalidade: "almoco-start" },
    { modalidade: "jantar-conexoes" },
    { modalidade: "vip" },
  ];
}

export default async function ModalidadePage(props: PageProps<"/ingressos/[modalidade]">) {
  const { modalidade } = await props.params;
  return <ModalidadeDetalhe slug={modalidade} />;
}
