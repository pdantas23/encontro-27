import { Suspense } from "react";
import { CheckoutPageContent } from "@/components/checkout/CheckoutPageContent";

export default function CheckoutPage() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <Suspense fallback={<p>Carregando...</p>}>
        <CheckoutPageContent />
      </Suspense>
    </main>
  );
}
