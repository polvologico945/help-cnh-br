import {
  CheckCircle2,
  ClipboardCopy,
  Clock3,
  QrCode,
  RefreshCw,
  ScanLine,
  ShieldAlert,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";

import { getDemoInvitationStatus, issueDemoInvitation } from "@/lib/linking";

type LinkConfirmation = { instructorName: string; instructorId: string };

export function QrLinkPanel({
  studentId,
  studentName,
  onLinked,
}: {
  studentId: string;
  studentName: string;
  onLinked: (payload: LinkConfirmation) => void;
}) {
  const [invite, setInvite] = useState<{ token: string; expiresAt: number } | null>(null);
  const [origin, setOrigin] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const linkedRef = useRef(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    let disposed = false;
    setBusy(true);
    void issueDemoInvitation({ data: { studentId, studentName } })
      .then((result) => {
        if (!disposed) {
          setInvite(result);
          setError("");
        }
      })
      .catch(() => {
        if (!disposed) setError("Não foi possível criar o convite.");
      })
      .finally(() => {
        if (!disposed) setBusy(false);
      });
    return () => {
      disposed = true;
    };
  }, [studentId, studentName]);

  useEffect(() => {
    if (!invite) return;
    const countdown = () =>
      setRemaining(Math.max(0, Math.ceil((invite.expiresAt - Date.now()) / 1000)));
    countdown();
    const timer = window.setInterval(countdown, 1000);
    return () => window.clearInterval(timer);
  }, [invite]);

  useEffect(() => {
    if (!invite) return;
    let pending = false;
    let disposed = false;
    const check = async () => {
      if (pending || linkedRef.current) return;
      pending = true;
      try {
        const response = await getDemoInvitationStatus({
          data: { studentId, token: invite.token },
        });
        if (!disposed && response.status === "approved" && !linkedRef.current) {
          linkedRef.current = true;
          onLinked({
            instructorId: response.instructorId,
            instructorName: response.instructorName,
          });
        }
      } catch {
        if (!disposed) setError("Sem conexão com o servidor. O vínculo ainda não foi confirmado.");
      } finally {
        pending = false;
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), 2400);
    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, [invite, studentId, onLinked]);

  async function regenerate() {
    setError("");
    setBusy(true);
    setCopied(false);
    try {
      setInvite(await issueDemoInvitation({ data: { studentId, studentName } }));
    } catch {
      setError("Não foi possível renovar o convite. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  const url =
    invite && origin ? `${origin}/instrutor?convite=${encodeURIComponent(invite.token)}` : "";
  const expired = !invite || remaining <= 0;

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setError("Não foi possível copiar automaticamente. Use o endereço exibido abaixo.");
    }
  }

  return (
    <section
      className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]"
      aria-label="Vínculo com instrutor"
    >
      <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-elevated sm:p-8">
        <p className="text-caption text-accent">Etapa obrigatória</p>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Conecte-se ao seu instrutor</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Peça ao instrutor para ler este QR Code com a câmera do celular. A confirmação dele é
          necessária antes de abrir seu espaço de aprendizagem.
        </p>
        <div className="my-7 flex justify-center">
          <div className="rounded-2xl bg-white p-4 shadow-lg" aria-label="Convite para o instrutor">
            {url && !expired ? (
              <QRCodeSVG value={url} size={216} marginSize={1} level="M" />
            ) : (
              <div className="flex h-[216px] w-[216px] flex-col items-center justify-center gap-3 text-center text-slate-700">
                <QrCode className="h-12 w-12" />
                <span className="text-sm">{busy ? "Gerando convite..." : "Convite expirado"}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-4 w-4" />
            {expired
              ? "Prazo encerrado"
              : `Validade: ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ScanLine className="h-4 w-4" /> Leitura pela câmera do instrutor
          </span>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-primary" onClick={regenerate} disabled={busy}>
            <RefreshCw className="h-4 w-4" /> Gerar novo QR Code
          </button>
          <button type="button" className="btn-ghost" onClick={copyLink} disabled={!url || expired}>
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
            {copied ? "Copiado" : "Copiar convite"}
          </button>
        </div>
        {url ? (
          <p className="mt-4 break-all text-center text-xs text-muted-foreground">{url}</p>
        ) : null}
        {error ? (
          <p role="alert" className="mt-4 text-sm text-destructive-foreground">
            {error}
          </p>
        ) : null}
      </div>
      <div className="space-y-5">
        <div className="rounded-3xl border border-border bg-card/70 p-6 sm:p-8">
          <p className="text-caption text-accent">Como funciona</p>
          <ol className="mt-5 space-y-5">
            {[
              ["01", "Mostre o QR Code", "Abra esta tela perto do instrutor escolhido."],
              [
                "02",
                "Ele verifica o convite",
                "O celular abre a página de confirmação do ViaSegura.",
              ],
              [
                "03",
                "Acesse seu espaço",
                "Após a confirmação, este painel é liberado automaticamente.",
              ],
            ].map(([step, title, description]) => (
              <li key={step} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-display text-sm text-primary">
                  {step}
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-2xl border border-accent/30 bg-accent/10 p-5 text-sm">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="h-5 w-5" /> Protótipo funcional
          </div>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            A confirmação funciona entre dispositivos ligados ao mesmo servidor, mas ainda não
            autentica a identidade do instrutor e não sobrevive à reinicialização do servidor. Não
            use para alunos reais.
          </p>
        </div>
      </div>
    </section>
  );
}
