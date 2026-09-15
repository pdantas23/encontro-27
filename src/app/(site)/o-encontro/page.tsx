/**
 * Página institucional "O Encontro". Texto estático — não existe tabela para
 * este conteúdo no banco. Baseado no que já está confirmado no levantamento
 * de requisitos: 2027 é a edição comemorativa de 5 anos do evento, e essa
 * identidade comemorativa atravessa a experiência do site inteiro.
 *
 * Histórico, números e fotos de edições anteriores (capítulos ainda
 * PENDENTES DE VALIDAÇÃO no levantamento) entram aqui assim que a
 * organização fornecer o material — não foram inventados.
 */
export default function OEncontroPage() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>O Encontro</h1>

      <p>
        O Encontro 2027 é a edição comemorativa de 5 anos do evento. Essa
        celebração faz parte da identidade de toda a experiência — do
        conteúdo apresentado às interações ao vivo — e marca uma trajetória
        que reúne pessoas em torno de negócios e conexões.
      </p>

      <h2>Histórico</h2>
      <p>
        Em breve. O histórico das edições anteriores (números, marcos e
        fotos) entra nesta página assim que a organização disponibilizar o
        material.
      </p>

      <h2>Por que 5 anos</h2>
      <p>
        Em breve. Os detalhes sobre o significado da edição comemorativa
        ainda estão em validação com a organização.
      </p>
    </main>
  );
}
