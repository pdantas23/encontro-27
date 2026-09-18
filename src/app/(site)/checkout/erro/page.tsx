import { Suspense } from "react";
import { PedidoStatus } from "@/components/checkout/PedidoStatus";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CheckoutErroPage() {
  return (
    <>
      <PageHeader title="Seu pedido" />
      <main id="conteudo" className="container-site py-10 sm:py-14">
        <Suspense fallback={<p className="text-marrom-suave">Carregando…</p>}>
          <PedidoStatus />
        </Suspense>
      </main>
    </>
  );
}
