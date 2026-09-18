import { PaginaLegal } from "@/components/layout/PaginaLegal";

/**
 * Página estática — não existe tabela para este conteúdo no banco.
 * O texto completo dos termos depende de validação jurídica da organização
 * (capítulo 16 do levantamento de requisitos). Nenhuma cláusula legal foi
 * inventada aqui; esta é apenas a estrutura de seções.
 */
export default function TermosPage() {
  return (
    <PaginaLegal
      titulo="Termos"
      secoes={[
        "Condições de compra",
        "Cancelamento e reembolso",
        "Transferência de titularidade",
        "Uso do ingresso",
        "Contato",
      ]}
    />
  );
}
