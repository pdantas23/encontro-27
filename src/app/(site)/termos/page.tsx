/**
 * Página estática — não existe tabela para este conteúdo no banco.
 * O texto completo dos termos de compra depende de validação jurídica da
 * organização (capítulo 16 do levantamento de requisitos). Nenhuma cláusula
 * legal foi inventada aqui; esta é apenas uma estrutura básica de seções que
 * será preenchida quando o conteúdo definitivo chegar.
 */
export default function TermosPage() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>Termos</h1>

      <p style={{ background: "#fff8e1", padding: 12, borderRadius: 4 }}>
        Este conteúdo ainda depende de validação da organização (capítulo 16
        do levantamento de requisitos). O texto abaixo é uma estrutura
        provisória e será substituído pelo conteúdo definitivo assim que
        estiver disponível.
      </p>

      <h2>Condições de compra</h2>
      <p>A definir.</p>

      <h2>Cancelamento e reembolso</h2>
      <p>A definir.</p>

      <h2>Transferência de titularidade</h2>
      <p>A definir.</p>

      <h2>Uso do ingresso</h2>
      <p>A definir.</p>

      <h2>Contato</h2>
      <p>A definir.</p>
    </main>
  );
}
