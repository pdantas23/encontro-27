import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-center text-marrom-suave">Carregando…</p>}>
      <LoginForm />
    </Suspense>
  );
}
