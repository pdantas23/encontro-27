"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import { CircleCheck, CircleX, QrCode, Search, TriangleAlert } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface CheckinResultado {
  ok: boolean;
  motivo?: string;
  nome?: string;
  fora_do_dia?: boolean;
}

interface ParticipanteBusca {
  identificador_unico: string;
  nome: string;
  modalidade_nome: string;
  check_in_status: boolean;
}

const MOTIVO_MENSAGENS: Record<string, string> = {
  ingresso_nao_encontrado: "Ingresso não encontrado. Confira o QR Code.",
  pagamento_nao_aprovado: "O pagamento deste pedido ainda não foi aprovado.",
  check_in_duplicado: "Este ingresso já foi utilizado — o check-in já tinha sido feito.",
};

// Repetir o mesmo código antes disso é ignorado: enquanto o cartão continua no
// quadro da câmera, ela decodifica o mesmo QR várias vezes por segundo.
const REPETICAO_IGNORADA_MS = 4000;

export default function AdminCheckInPage() {
  const { user, loading: authLoading } = useAdminAuth({ permitirStaff: true });

  const [nomeBusca, setNomeBusca] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<ParticipanteBusca[]>([]);
  const [buscando, setBuscando] = useState(false);

  const [qrAberto, setQrAberto] = useState(false);
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ sucesso: boolean; mensagem: string; aviso?: string } | null>(null);

  const [cameraErro, setCameraErro] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const ultimoCodigoRef = useRef<{ valor: string; em: number } | null>(null);
  // Guarda síncrona: o estado processandoId só atualiza no próximo render, o que não
  // basta pra bloquear duas chamadas disparadas no mesmo instante (ex.: a câmera decodifica
  // o mesmo quadro duas vezes antes de re-renderizar) — é assim que garantimos um check-in
  // de cada vez, nunca dois em paralelo.
  const processandoRef = useRef(false);

  async function confirmarCheckin(identificador: string) {
    if (processandoRef.current) return;
    processandoRef.current = true;
    setProcessandoId(identificador);
    setResultado(null);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("checkin_encontro27", { p_identificador: identificador });
    processandoRef.current = false;
    setProcessandoId(null);

    if (error) {
      setResultado({ sucesso: false, mensagem: "Erro ao registrar check-in. Tente novamente." });
      return;
    }

    const resposta = data as unknown as CheckinResultado;
    if (resposta.ok) {
      setResultado({
        sucesso: true,
        mensagem: `Check-in confirmado: ${resposta.nome ?? "participante"}.`,
        aviso: resposta.fora_do_dia ? "Hoje não é um dos dias configurados do evento." : undefined,
      });
    } else {
      setResultado({
        sucesso: false,
        mensagem: MOTIVO_MENSAGENS[resposta.motivo ?? ""] ?? "Não foi possível registrar o check-in.",
      });
    }

    // Reflete na lista de busca (sem precisar buscar de novo) que esse ingresso acabou de ser usado.
    setResultadosBusca((atual) =>
      atual.map((p) => (p.identificador_unico === identificador ? { ...p, check_in_status: true } : p)),
    );
  }

  // Câmera: só liga o stream enquanto o modal está aberto.
  useEffect(() => {
    if (!qrAberto) return;

    let cancelado = false;
    const reader = new BrowserQRCodeReader();

    reader
      .decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } } },
        videoRef.current ?? undefined,
        (result) => {
          if (!result || cancelado) return;
          const valor = result.getText();
          const agora = Date.now();
          const ultimo = ultimoCodigoRef.current;
          if (ultimo && ultimo.valor === valor && agora - ultimo.em < REPETICAO_IGNORADA_MS) return;
          ultimoCodigoRef.current = { valor, em: agora };
          confirmarCheckin(valor);
        },
      )
      .then((controls) => {
        if (cancelado) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
      })
      .catch(() => {
        if (!cancelado) setCameraErro("Não foi possível acessar a câmera. Confira a permissão do navegador.");
      });

    return () => {
      cancelado = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [qrAberto]);

  // Nome: busca com debounce, sempre que o texto muda. Abaixo de 2 caracteres não busca — a
  // lista exibida é derivada no render (resultadosExibidos), não zerada aqui.
  useEffect(() => {
    const termo = nomeBusca.trim();
    if (termo.length < 2) return;

    const id = setTimeout(async () => {
      setBuscando(true);
      const supabase = createClient();
      const { data } = await supabase.rpc("buscar_participantes_checkin_encontro27", { p_nome: termo });
      setResultadosBusca((data as unknown as ParticipanteBusca[] | null) ?? []);
      setBuscando(false);
    }, 300);

    return () => clearTimeout(id);
  }, [nomeBusca]);

  function abrirQr() {
    setCameraErro(null);
    setQrAberto(true);
  }

  if (authLoading || !user) return null;

  const resultadosExibidos = nomeBusca.trim().length < 2 ? [] : resultadosBusca;

  return (
    <AdminLayout user={user}>
      <h1>Check-in</h1>

      <div className="mt-6">
        <div className="flex items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-marrom-suave"
            />
            <input
              type="search"
              autoFocus
              value={nomeBusca}
              onChange={(event) => setNomeBusca(event.target.value)}
              placeholder="Nome do participante"
              className="pl-9"
            />
          </div>
          <button
            type="button"
            onClick={abrirQr}
            aria-label="Ler QR Code pela câmera"
            title="Ler QR Code pela câmera"
            className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-ambar-escuro text-papel transition-colors hover:bg-ambar-pressed"
          >
            <QrCode aria-hidden="true" className="size-5" />
          </button>
        </div>

        {buscando && <p className="mt-3 text-center text-sm text-marrom-suave">Buscando…</p>}

        {!buscando && nomeBusca.trim().length >= 2 && resultadosExibidos.length === 0 && (
          <p className="mt-3 text-center text-sm text-marrom-suave">Ninguém encontrado com esse nome.</p>
        )}

        {nomeBusca.trim().length < 2 && (
          <p className="mt-3 text-center text-sm text-marrom-suave">
            Digite o nome do participante ou use o QR Code do ingresso.
          </p>
        )}

        {resultadosExibidos.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {resultadosExibidos.map((participante) => (
              <li
                key={participante.identificador_unico}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-papel px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-vinho">{participante.nome}</p>
                  <p className="truncate text-xs text-marrom-suave">{participante.modalidade_nome}</p>
                </div>
                {participante.check_in_status ? (
                  <span className="shrink-0 rounded-pill bg-areia px-3 py-1.5 text-xs font-semibold text-marrom-suave">
                    Já utilizado
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => confirmarCheckin(participante.identificador_unico)}
                    disabled={processandoId !== null}
                    className="inline-flex min-h-9 shrink-0 cursor-pointer items-center rounded-pill bg-ambar-escuro px-4 text-xs font-semibold text-papel transition-colors hover:bg-ambar-pressed disabled:cursor-default disabled:opacity-50"
                  >
                    {processandoId === participante.identificador_unico ? "Confirmando…" : "Confirmar"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {!qrAberto && <ResultadoBanner resultado={resultado} />}
      </div>

      <Modal aberto={qrAberto} titulo="Ler QR Code" onFechar={() => setQrAberto(false)} larguraMax="max-w-sm">
        <div className="relative aspect-square w-full overflow-hidden rounded-card bg-marrom">
          <video ref={videoRef} className="size-full object-cover" muted playsInline />
          {!cameraErro && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-papel/70" />
          )}
          {cameraErro && (
            <div className="absolute inset-0 flex items-center justify-center bg-marrom px-6 text-center text-[15px] text-papel">
              {cameraErro}
            </div>
          )}
        </div>
        {!cameraErro && (
          <p className="mt-3 text-center text-[15px] text-marrom-suave">Aponte a câmera para o QR Code do ingresso.</p>
        )}
        <ResultadoBanner resultado={resultado} />
      </Modal>
    </AdminLayout>
  );
}

function ResultadoBanner({ resultado }: { resultado: { sucesso: boolean; mensagem: string; aviso?: string } | null }) {
  if (!resultado) return null;

  return (
    <div className="mt-4">
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-center text-[15px] font-medium",
          resultado.sucesso
            ? "border-verde/30 bg-verde/10 text-[color-mix(in_srgb,var(--color-verde)_70%,black)]"
            : "border-vermelho/30 bg-vermelho/10 text-vermelho",
        )}
      >
        {resultado.sucesso ? (
          <CircleCheck aria-hidden="true" className="size-5 shrink-0" />
        ) : (
          <CircleX aria-hidden="true" className="size-5 shrink-0" />
        )}
        {resultado.mensagem}
      </div>
      {resultado.aviso && (
        <div className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-ambar/30 bg-ambar/10 px-4 py-2 text-center text-sm text-ambar-texto">
          <TriangleAlert aria-hidden="true" className="size-4 shrink-0" />
          {resultado.aviso}
        </div>
      )}
    </div>
  );
}
