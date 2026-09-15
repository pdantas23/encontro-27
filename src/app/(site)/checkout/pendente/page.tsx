import { Suspense } from "react";
import { PedidoStatus } from "@/components/checkout/PedidoStatus";

export default function CheckoutPendentePage() {
  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: 16 }}>
      <Suspense fallback={<p>Carregando...</p>}>
        <PedidoStatus />
      </Suspense>
    </main>
  );
}
