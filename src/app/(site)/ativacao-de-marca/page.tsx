import type { Metadata } from "next";
import { CotaSelecionadaProvider } from "@/components/ativacao/CotaSelecionada";
import { CotasSection } from "@/components/ativacao/CotasSection";
import { ComparativoCotas } from "@/components/ativacao/ComparativoCotas";
import { InteresseSection } from "@/components/ativacao/InteresseSection";
import { WhatsAppFlutuante } from "@/components/ativacao/WhatsAppFlutuante";
import {
  Ativacao,
  Congresso,
  Encerramento,
  HeroAtivacao,
  Locais,
  Publico,
  SobreEncontro,
  Videos,
} from "@/components/ativacao/Secoes";

export const metadata: Metadata = {
  title: "Ativação de Marca",
  description:
    "Ative sua marca no O Encontro 2027, em Teresina - PI, de 23 a 25 de agosto de 2027. Conheça as quatro cotas de ativação de marca e demonstre seu interesse.",
};

/**
 * Landing para empresas: ativação de marca no O Encontro 2027.
 * Conteúdo: "Plano de Ativação de Marcas" (Canva) — ver components/ativacao/conteudo.ts.
 * Contato comercial: WhatsApp (área de interesse + botão flutuante), com a cota escolhida na mensagem.
 */
export default function AtivacaoDeMarcaPage() {
  return (
    <main id="conteudo" className="overflow-x-clip">
      <CotaSelecionadaProvider>
        <HeroAtivacao />
        <SobreEncontro />
        <Congresso />
        <Locais />
        <Publico />
        <Videos />
        <Ativacao />
        <CotasSection />
        <ComparativoCotas />
        <Encerramento />
        <InteresseSection />
        <WhatsAppFlutuante />
      </CotaSelecionadaProvider>
    </main>
  );
}
