import { PageHeader } from "@/components/layout/PageHeader";

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
    <>
      <PageHeader
        title="O Encontro"
        description="O Encontro 2027 é a edição comemorativa de 5 anos do evento. Essa celebração faz parte da identidade de toda a experiência — do conteúdo apresentado às interações ao vivo — e marca uma trajetória que reúne pessoas em torno de negócios e conexões."
      />

      <main id="conteudo" className="container-site py-10 sm:py-14">
        <div className="max-w-3xl divide-y divide-border border-y border-border">
          <section className="py-8">
            <h2 className="rotulo-secao text-ambar-texto">Histórico</h2>
            <span aria-hidden="true" className="filete mt-4" />
            <p className="mt-6 max-w-2xl text-[17px] leading-7 text-marrom text-pretty">
              Em breve. O histórico das edições anteriores (números, marcos e fotos) entra nesta página assim
              que a organização disponibilizar o material.
            </p>
          </section>

          <section className="py-8">
            <h2 className="rotulo-secao text-ambar-texto">Por que 5 anos</h2>
            <span aria-hidden="true" className="filete mt-4" />
            <p className="mt-6 max-w-2xl text-[17px] leading-7 text-marrom text-pretty">
              Em breve. Os detalhes sobre o significado da edição comemorativa ainda estão em validação com a
              organização.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
