import { Suspense } from "react";
import { CheckoutPageContent } from "@/components/checkout/CheckoutPageContent";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CheckoutPage() {
  return (
    <>
      <PageHeader />
      <main id="conteudo" className="container-site py-10 sm:py-14">
        <Suspense fallback={<p className="text-marrom-suave">Carregando…</p>}>
          <CheckoutPageContent />
        </Suspense>
      </main>
    </>
  );
}
