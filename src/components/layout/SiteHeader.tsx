import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Início" },
  { href: "/o-encontro", label: "O Encontro" },
  { href: "/programacao", label: "Programação" },
  { href: "/convidados", label: "Convidados" },
  { href: "/experiencias", label: "Experiências" },
  { href: "/ingressos", label: "Ingressos" },
  { href: "/faq", label: "FAQ" },
  { href: "/login", label: "Minha conta" },
];

export function SiteHeader() {
  return (
    <header style={{ borderBottom: "1px solid #ddd", padding: "12px 16px" }}>
      <nav style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
