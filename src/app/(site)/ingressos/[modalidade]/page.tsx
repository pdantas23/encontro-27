import { ModalidadeDetalhe } from "@/components/ingressos/ModalidadeDetalhe";

/**
 * Export estático (output: "export") exige generateStaticParams() para
 * rotas dinâmicas — sem isso o build falha. As 4 modalidades abaixo são as
 * únicas confirmadas no seed (migration 0002); nenhuma modalidade adicional
 * deve ser criada sem confirmação da organização.
 */
export function generateStaticParams() {
  return [
    { modalidade: "start" },
    { modalidade: "almoco-nao-participante" },
    { modalidade: "jantar-conexoes" },
    { modalidade: "vip" },
  ];
}

export default async function ModalidadePage(props: PageProps<"/ingressos/[modalidade]">) {
  const { modalidade } = await props.params;
  return <ModalidadeDetalhe slug={modalidade} />;
}
