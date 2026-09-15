import Link from "next/link";

export function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid #ddd", padding: "16px", marginTop: 48, fontSize: 14 }}>
      <p>O Encontro 2027 — edição comemorativa de 5 anos.</p>
      <p style={{ display: "flex", gap: 16 }}>
        <Link href="/privacidade">Política de privacidade</Link>
        <Link href="/termos">Termos</Link>
      </p>
    </footer>
  );
}
