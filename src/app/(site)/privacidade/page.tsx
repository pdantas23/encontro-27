import { PaginaLegal } from "@/components/layout/PaginaLegal";

/**
 * Página estática — não existe tabela para este conteúdo no banco.
 * O texto completo da política de privacidade depende de validação jurídica
 * da organização (capítulo 16 do levantamento de requisitos). Nenhuma
 * cláusula legal foi inventada aqui; esta é apenas uma estrutura básica de
 * seções que será preenchida quando o conteúdo definitivo chegar.
 */
export default function PrivacidadePage() {
  return (
    <PaginaLegal
      titulo="Política de privacidade"
      secoes={[
        "Finalidade da coleta",
        "Quais dados coletamos",
        "Como usamos os dados",
        "Com quem compartilhamos",
        "Seus direitos",
        "Contato",
      ]}
    />
  );
}
