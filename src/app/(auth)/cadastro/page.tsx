import { Suspense } from "react";
import { CadastroForm } from "@/components/auth/CadastroForm";

export default function CadastroPage() {
  return (
    <Suspense fallback={<p className="text-center text-marrom-suave">Carregando…</p>}>
      <CadastroForm />
    </Suspense>
  );
}
