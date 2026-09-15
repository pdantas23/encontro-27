/**
 * Página estática — não existe tabela para este conteúdo no banco.
 * O texto completo da política de privacidade depende de validação jurídica
 * da organização (capítulo 16 do levantamento de requisitos). Nenhuma
 * cláusula legal foi inventada aqui; esta é apenas uma estrutura básica de
 * seções que será preenchida quando o conteúdo definitivo chegar.
 */
export default function PrivacidadePage() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>Política de privacidade</h1>

      <p style={{ background: "#fff8e1", padding: 12, borderRadius: 4 }}>
        Este conteúdo ainda depende de validação da organização (capítulo 16
        do levantamento de requisitos). O texto abaixo é uma estrutura
        provisória e será substituído pelo conteúdo definitivo assim que
        estiver disponível.
      </p>

      <h2>Finalidade da coleta</h2>
      <p>A definir.</p>

      <h2>Quais dados coletamos</h2>
      <p>A definir.</p>

      <h2>Como usamos os dados</h2>
      <p>A definir.</p>

      <h2>Com quem compartilhamos</h2>
      <p>A definir.</p>

      <h2>Seus direitos</h2>
      <p>A definir.</p>

      <h2>Contato</h2>
      <p>A definir.</p>
    </main>
  );
}
