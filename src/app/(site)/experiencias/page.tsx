import Link from "next/link";

/**
 * Página estática — não existe tabela própria para "experiências" no banco.
 * O funcionamento detalhado de cada experiência (horários, regras) ainda é
 * PENDENTE DE VALIDAÇÃO pela organização — não foi inventado aqui.
 */
export default function ExperienciasPage() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>Experiências</h1>

      <p>
        O Encontro 2027 conta com duas experiências complementares à
        programação principal. Cada uma tem sua modalidade correspondente na
        página de ingressos.
      </p>

      <section style={{ marginTop: 24 }}>
        <h2>Almoço de Negócios</h2>
        <p>
          O funcionamento desta experiência (horário, formato e regras) ainda
          está sendo definido pela organização. Assim que confirmado, os
          detalhes entram aqui.
        </p>
        <p>
          <Link href="/ingressos/almoco-nao-participante">Ver modalidade de ingresso</Link>
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Jantar de Conexões</h2>
        <p>
          O funcionamento desta experiência (horário, formato e regras) ainda
          está sendo definido pela organização. Assim que confirmado, os
          detalhes entram aqui.
        </p>
        <p>
          <Link href="/ingressos/jantar-conexoes">Ver modalidade de ingresso</Link>
        </p>
      </section>
    </main>
  );
}
