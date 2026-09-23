"use client";

import { useEffect, useState } from "react";
import { Eye, Search } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { createClient } from "@/lib/supabase/client";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import type { Database, StatusPagamento } from "@/types/database";

type PedidoRow = Database["public"]["Tables"]["pedidos_encontro27"]["Row"];
type ParticipanteRow = Database["public"]["Tables"]["participantes_encontro27"]["Row"];

// O select aninhado do supabase-js não é tipado automaticamente (Relationships
// vazio em src/types/database.ts), então tipamos manualmente o formato esperado
// e convertemos com `as unknown as` — mesma ideia do @ts-expect-error usado em
// dashboard/page.tsx, só que aplicado uma vez por fetch em vez de por acesso.
type PedidoComLote = PedidoRow & {
  lotes_encontro27: {
    nome: string;
    modalidades_encontro27: { nome: string } | null;
  } | null;
};

// ⚠️ TEMPORÁRIO — ver aviso em src/hooks/useAdminAuth.ts / PENDENCIAS-PREVIEW.md.
// Datas fixas (e não new Date()) pra HTML do servidor e do navegador baterem.
const PREVIEW_FAKE = true;
function pedidoFake(n: number, criadoEm: string, overrides: Partial<PedidoComLote>): PedidoComLote {
  return {
    id: `00000000-0000-0000-0000-00000000000${n}`,
    comprador_nome: "Maria da Silva",
    comprador_email: "maria@example.com",
    comprador_whatsapp: "(11) 98888-7777",
    lote_id: "00000000-0000-0000-0000-0000000000a1",
    quantidade: 1,
    valor_unitario_registrado: 890,
    valor_total: 890,
    status_pagamento: "aprovado",
    hypercash_url_usado: null,
    hypercash_payment_link_id: null,
    hypercash_checkout_criado_em: null,
    hypercash_transaction_id: null,
    hypercash_status_bruto: null,
    aprovado_via: "webhook",
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    aceite_termos: true,
    aceite_termos_em: criadoEm,
    tem_problema_estoque: false,
    confirmado_por: null,
    confirmado_em: criadoEm,
    created_at: criadoEm,
    updated_at: criadoEm,
    lotes_encontro27: { nome: "Lote 1", modalidades_encontro27: { nome: "VIP" } },
    ...overrides,
  };
}
const PEDIDOS_FAKE: PedidoComLote[] = [
  pedidoFake(1, "2026-09-18T17:30:00.000Z", {}),
  pedidoFake(2, "2026-09-18T13:05:00.000Z", {
    comprador_nome: "João Pereira",
    comprador_email: "joao@example.com",
    comprador_whatsapp: "(21) 97777-6666",
    valor_unitario_registrado: 390,
    valor_total: 390,
    status_pagamento: "aguardando_pagamento",
    confirmado_em: null,
    aprovado_via: null,
    lotes_encontro27: { nome: "Lote 1", modalidades_encontro27: { nome: "Start" } },
  }),
  pedidoFake(3, "2026-09-17T20:45:00.000Z", {
    comprador_nome: "Ana Beatriz",
    comprador_email: "ana@example.com",
    comprador_whatsapp: "(31) 96666-5555",
    valor_unitario_registrado: 450,
    valor_total: 450,
    status_pagamento: "recusado",
    confirmado_em: null,
    aprovado_via: null,
    lotes_encontro27: { nome: "Lote 1", modalidades_encontro27: { nome: "Jantar de Conexões" } },
  }),
  pedidoFake(4, "2026-09-16T11:20:00.000Z", {
    comprador_nome: "Carlos Mendes",
    comprador_email: "carlos@example.com",
    comprador_whatsapp: "(41) 95555-4444",
    valor_unitario_registrado: 390,
    valor_total: 390,
    aprovado_via: "admin",
    tem_problema_estoque: true,
    lotes_encontro27: { nome: "Lote 1", modalidades_encontro27: { nome: "Start" } },
  }),
];
const PARTICIPANTES_FAKE: Record<string, ParticipanteRow[]> = Object.fromEntries(
  PEDIDOS_FAKE.map((pedido, indice) => [
    pedido.id,
    [
      {
        id: `10000000-0000-0000-0000-00000000000${indice + 1}`,
        pedido_id: pedido.id,
        nome: pedido.comprador_nome,
        email: pedido.comprador_email,
        identificador_unico: `20000000-0000-0000-0000-00000000000${indice + 1}`,
        check_in_status: indice === 0,
        check_in_em: null,
        check_in_por: null,
        created_at: pedido.created_at,
      },
    ],
  ]),
);

const STATUS_OPTIONS: { value: StatusPagamento | "todos"; label: string }[] = [
  { value: "todos", label: "Todos os status" },
  { value: "aguardando_pagamento", label: "Aguardando pagamento" },
  { value: "aprovado", label: "Aprovado" },
  { value: "recusado", label: "Recusado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "reembolsado", label: "Reembolsado" },
];

// O que aparece na tela: um status só. "Lote sem vaga" é exclusivo (nunca ao lado de outro).
type StatusExibido = StatusPagamento | "sem_vaga";

const STATUS_LABEL: Record<StatusExibido, string> = {
  ...(Object.fromEntries(STATUS_OPTIONS.map((option) => [option.value, option.label])) as Record<
    StatusPagamento,
    string
  >),
  sem_vaga: "Lote sem vaga",
};

// Texto sempre bem mais escuro que o fundo (tom a 10%) pra manter contraste AA em corpo pequeno.
const STATUS_BADGE: Record<StatusExibido, string> = {
  aguardando_pagamento: "bg-ambar/10 text-ambar-texto",
  aprovado: "bg-verde/10 text-[color-mix(in_srgb,var(--color-verde)_70%,black)]",
  recusado: "bg-vermelho/10 text-vermelho",
  cancelado: "bg-areia text-marrom-suave",
  reembolsado: "bg-areia text-marrom-suave",
  sem_vaga: "bg-vermelho/10 text-vermelho",
};

const FORMATO_DATA = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" });
const FORMATO_HORA = new Intl.DateTimeFormat("pt-BR", { timeStyle: "short", timeZone: "America/Sao_Paulo" });

const APROVADO_VIA_LABEL: Record<string, string> = {
  webhook: "Automática (Hypercash)",
  admin: "Manual (equipe)",
};

export default function AdminPedidosPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [pedidos, setPedidos] = useState<PedidoComLote[] | null>(PREVIEW_FAKE ? PEDIDOS_FAKE : null);
  const [filtro, setFiltro] = useState<StatusPagamento | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [detalheId, setDetalheId] = useState<string | null>(null);
  const [participantesPorPedido, setParticipantesPorPedido] = useState<Record<string, ParticipanteRow[]>>(
    PREVIEW_FAKE ? PARTICIPANTES_FAKE : {},
  );

  useEffect(() => {
    if (PREVIEW_FAKE) return;
    if (!user) return;

    async function load() {
      const supabase = createClient();
      let query = supabase
        .from("pedidos_encontro27")
        .select("*, lotes_encontro27(nome, modalidades_encontro27(nome))")
        .order("created_at", { ascending: false });

      if (filtro !== "todos") {
        query = query.eq("status_pagamento", filtro);
      }

      const { data } = await query;
      setPedidos((data ?? []) as unknown as PedidoComLote[]);
    }

    load();
  }, [user, filtro]);

  async function abrirDetalhes(pedido: PedidoComLote) {
    setDetalheId(pedido.id);
    if (!participantesPorPedido[pedido.id]) {
      const supabase = createClient();
      const { data } = await supabase
        .from("participantes_encontro27")
        .select("*")
        .eq("pedido_id", pedido.id)
        .order("nome", { ascending: true });
      setParticipantesPorPedido((prev) => ({ ...prev, [pedido.id]: data ?? [] }));
    }
  }

  if (authLoading || !user) return null;

  // Busca nos dados do nosso sistema (o que o comprador preencheu no checkout).
  const termo = busca.trim().toLowerCase();
  const digitos = termo.replace(/\D/g, "");
  const pedidosVisiveis = (pedidos ?? []).filter((pedido) => {
    if (filtro !== "todos" && pedido.status_pagamento !== filtro) return false;
    if (!termo) return true;
    return (
      pedido.comprador_nome.toLowerCase().includes(termo) ||
      pedido.comprador_email.toLowerCase().includes(termo) ||
      (digitos !== "" && pedido.comprador_whatsapp.replace(/\D/g, "").includes(digitos))
    );
  });

  const detalhe = pedidos?.find((pedido) => pedido.id === detalheId) ?? null;
  const participantesDetalhe = detalhe ? participantesPorPedido[detalhe.id] : undefined;

  return (
    <AdminLayout user={user}>
      <h1>Pedidos</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-marrom-suave"
          />
          <input
            type="search"
            aria-label="Buscar pedidos"
            placeholder="Buscar"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            className="pl-9"
          />
        </div>
        <Dropdown
          ariaLabel="Filtrar por status"
          value={filtro}
          options={STATUS_OPTIONS}
          onChange={setFiltro}
          className="w-28 shrink-0 sm:w-52"
        />
      </div>

      {!pedidos ? (
        <p className="mt-6">Carregando...</p>
      ) : pedidosVisiveis.length === 0 ? (
        <p className="mt-6 text-marrom-suave">Nenhum pedido encontrado.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table style={{ minWidth: 780 }}>
            <thead>
              <tr>
                <th style={thStyle}>Data</th>
                <th style={thStyle}>Comprador</th>
                <th style={thStyle}>Modalidade</th>
                <th style={thStyle}>Qtd.</th>
                <th style={thStyle}>Valor total</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {pedidosVisiveis.map((pedido) => (
                <tr key={pedido.id}>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{FORMATO_DATA.format(new Date(pedido.created_at))}</td>
                  <td style={tdStyle}>
                    <div className="font-semibold text-vinho">{pedido.comprador_nome}</div>
                    <div className="text-xs text-marrom-suave">{pedido.comprador_email}</div>
                  </td>
                  <td style={tdStyle}>
                    <div>{pedido.lotes_encontro27?.modalidades_encontro27?.nome ?? "-"}</div>
                    <div className="text-xs text-marrom-suave">{pedido.lotes_encontro27?.nome ?? "-"}</div>
                  </td>
                  <td style={tdStyle}>{pedido.quantidade}</td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {formatCurrencyBRL(Number(pedido.valor_total))}
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge status={statusExibido(pedido)} />
                  </td>
                  <td style={tdStyle}>
                    <button
                      type="button"
                      onClick={() => abrirDetalhes(pedido)}
                      aria-label={`Detalhes do pedido de ${pedido.comprador_nome}`}
                      title="Detalhes"
                      className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-marrom-suave transition-colors hover:bg-areia hover:text-vinho"
                    >
                      <Eye aria-hidden="true" className="size-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        aberto={detalheId !== null}
        titulo="Detalhes do pedido"
        tituloExtra={detalhe && <StatusBadge status={statusExibido(detalhe)} />}
        rodape={
          detalhe && (
            <>
              Feito em {FORMATO_DATA.format(new Date(detalhe.created_at))} às{" "}
              {FORMATO_HORA.format(new Date(detalhe.created_at))}
            </>
          )
        }
        onFechar={() => setDetalheId(null)}
        larguraMax="max-w-lg"
      >
        {detalhe && (
          <div className="text-sm">
            <div>
              <Secao titulo="Comprador">
                <Linha rotulo="Nome">{detalhe.comprador_nome}</Linha>
                <Linha rotulo="E-mail">{detalhe.comprador_email}</Linha>
                <Linha rotulo="WhatsApp">
                  <LinkWhatsApp numero={detalhe.comprador_whatsapp} />
                </Linha>
              </Secao>

              <Secao titulo="Compra">
                <Linha rotulo="Modalidade">{detalhe.lotes_encontro27?.modalidades_encontro27?.nome ?? "-"}</Linha>
                <Linha rotulo="Lote">{detalhe.lotes_encontro27?.nome ?? "-"}</Linha>
                <Linha rotulo="Quantidade">{detalhe.quantidade}</Linha>
                <Linha rotulo="Valor unitário">{formatCurrencyBRL(Number(detalhe.valor_unitario_registrado))}</Linha>
                <Linha rotulo="Valor total">{formatCurrencyBRL(Number(detalhe.valor_total))}</Linha>
              </Secao>
            </div>

            <div>
              {detalhe.confirmado_em && (
                <Secao titulo="Confirmação">
                  <Linha rotulo="Confirmado em">
                    {FORMATO_DATA.format(new Date(detalhe.confirmado_em))} às{" "}
                    {FORMATO_HORA.format(new Date(detalhe.confirmado_em))}
                  </Linha>
                  {detalhe.aprovado_via && (
                    <Linha rotulo="Forma">{APROVADO_VIA_LABEL[detalhe.aprovado_via] ?? detalhe.aprovado_via}</Linha>
                  )}
                </Secao>
              )}

              <section className="mt-5">
                <div className="text-xs font-semibold tracking-[0.14em] text-marrom-suave uppercase">
                  Participantes
                </div>
                {!participantesDetalhe ? (
                  <div className="mt-2 text-marrom-suave">Carregando participantes...</div>
                ) : participantesDetalhe.length === 0 ? (
                  <div className="mt-2 text-marrom-suave">Nenhum participante cadastrado neste pedido.</div>
                ) : (
                  <ul className="mt-1">
                    {participantesDetalhe.map((participante) => (
                      <li
                        key={participante.id}
                        className="flex items-center justify-between gap-3 border-b border-border py-1.5 last:border-b-0"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium text-marrom">{participante.nome}</div>
                          {participante.email && (
                            <div className="truncate text-xs text-marrom-suave">{participante.email}</div>
                          )}
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-pill px-2.5 py-0.5 text-xs font-semibold",
                            participante.check_in_status
                              ? "bg-verde/10 text-[color-mix(in_srgb,var(--color-verde)_70%,black)]"
                              : "bg-areia text-marrom-suave",
                          )}
                        >
                          {participante.check_in_status ? "Check-in feito" : "Sem check-in"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

// "Lote sem vaga" ocupa o lugar do status de pagamento (nunca aparece junto dele),
// e "Aguardando pagamento" sempre prevalece sobre ele.
function statusExibido(pedido: PedidoComLote): StatusExibido {
  return pedido.tem_problema_estoque && pedido.status_pagamento !== "aguardando_pagamento"
    ? "sem_vaga"
    : pedido.status_pagamento;
}

// O comprador digita o número livremente (com ou sem +55, máscara, zero à esquerda);
// o wa.me exige só dígitos e com código do país. Sem código (DDD + número = 10 ou 11
// dígitos), assume Brasil.
function urlWhatsApp(numero: string): string | null {
  const digitos = numero.replace(/\D/g, "").replace(/^0+/, "");
  if (digitos.length < 10) return null;
  return `https://wa.me/${digitos.length <= 11 ? `55${digitos}` : digitos}`;
}

function LinkWhatsApp({ numero }: { numero: string }) {
  const conteudo = (
    <>
      <WhatsAppIcon className="size-4 shrink-0" />
      {numero}
    </>
  );
  const url = urlWhatsApp(numero);
  if (!url) return <span className="inline-flex items-center gap-1.5">{conteudo}</span>;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="Abrir conversa no WhatsApp"
      className="inline-flex items-center gap-1.5"
      // Inline porque `.admin-content a` em globals.css (sublinhado) tem especificidade maior que uma utility.
      style={{ textDecoration: "none" }}
    >
      {conteudo}
    </a>
  );
}

function StatusBadge({ status }: { status: StatusExibido }) {
  return (
    <span className={cn("inline-block rounded-pill px-2.5 py-0.5 text-xs font-semibold", STATUS_BADGE[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <div className="text-xs font-semibold tracking-[0.14em] text-marrom-suave uppercase">{titulo}</div>
      <dl className="mt-1">{children}</dl>
    </section>
  );
}

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-1.5 last:border-b-0">
      <dt className="text-marrom-suave">{rotulo}</dt>
      <dd className="text-right font-medium text-marrom">{children}</dd>
    </div>
  );
}

// Inline (e não classes) porque `.admin-content th/td` em globals.css tem
// especificidade maior que uma utility e força alinhamento à esquerda / topo.
const thStyle: React.CSSProperties = { textAlign: "center", whiteSpace: "nowrap" };
const tdStyle: React.CSSProperties = { textAlign: "center", verticalAlign: "middle" };
