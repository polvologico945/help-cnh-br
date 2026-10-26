import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, CircleAlert, ClipboardCheck, GraduationCap, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { approveDemoInvitation, inspectDemoInvitation } from "@/lib/linking";

export const Route = createFileRoute("/instrutor")({
  head: () => ({ meta: [
    { title: "Leitura de convite — ViaSegura" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: InstructorInvitationPage,
});

type Inspection = Awaited<ReturnType<typeof inspectDemoInvitation>>;

function InstructorInvitationPage() {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("convite") ?? "");
  }, []);

  useEffect(() => {
    if (!/^[0-9a-f-]{36}$/i.test(token)) {
      setInspection(null);
      return;
    }
    let disposed = false;
    void inspectDemoInvitation({ data: { token } })
      .then((result) => {
        if (!disposed) setInspection(result);
      })
      .catch(() => {
        if (!disposed) setMessage("Não foi possível consultar o convite.");
      });
    return () => { disposed = true; };
  }, [token]);

  async function approve() {
    if (busy || !inspection || inspection.status !== "pending") return;
    setBusy(true);
    setMessage("");
    try {
      const result = await approveDemoInvitation({
        data: { token, instructorName: name.trim() },
      });
      if (result.ok) setApproved(true);
      else setMessage(result.message);
    } catch {
      setMessage("Não foi possível confirmar. Verifique a conexão e o convite.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/70">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2 font-display text-lg">
            <GraduationCap className="h-6 w-6 text-accent" /> ViaSegura
          </div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Voltar ao início</Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-5 py-12">
        <p className="text-caption text-accent">Ambiente de demonstração</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Confirmação do instrutor</h1>
        <p className="mt-3 text-muted-foreground">
          Este convite foi aberto pelo QR Code do aluno. O instrutor confere a solicitação e confirma
          o vínculo para liberar a experiência de aprendizagem.
        </p>
        <div className="mt-8 rounded-3xl border border-border bg-card/80 p-6 sm:p-8">
          {approved ? (
            <div role="status" className="space-y-4">
              <CheckCircle2 className="h-11 w-11 text-primary" />
              <h2 className="text-2xl">Vínculo registrado nesta demonstração</h2>
              <p className="text-sm text-muted-foreground">
                O painel do aluno reconhecerá a confirmação automaticamente enquanto o servidor estiver ativo.
              </p>
              <Link to="/" className="btn-primary">Concluído</Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <p className="text-sm text-foreground">
                  Fluxo experimental: ainda não há contas verificadas de instrutores.
                  Informar um nome <strong>não comprova identidade</strong>. Não use com dados reais.
                </p>
              </div>
              {inspection?.status === "pending" ? (
                <>
                  <div className="rounded-xl border border-border bg-background/60 p-4">
                    <p className="text-xs text-muted-foreground">Pedido de vínculo de</p>
                    <p className="mt-1 text-xl font-semibold">{inspection.studentName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Confira pessoalmente com o aluno antes de confirmar.
                    </p>
                  </div>
                  <label className="block text-sm font-semibold">
                    Nome do instrutor (simulação)
                    <input className="field-input mt-2" value={name} maxLength={80}
                      onChange={(event) => setName(event.target.value)} placeholder="Nome e sobrenome"
                      autoComplete="name" />
                  </label>
                  <button type="button" className="btn-primary w-full py-3"
                    disabled={busy || name.trim().length < 3} onClick={approve}>
                    <ClipboardCheck className="h-4 w-4" />
                    {busy ? "Confirmando..." : "Confirmar vínculo de demonstração"}
                  </button>
                </>
              ) : inspection?.status === "expired" ? (
                <div role="alert" className="flex gap-3 text-sm">
                  <CircleAlert className="h-5 w-5 shrink-0 text-accent" />
                  O convite expirou ou já não está disponível. Peça ao aluno um novo QR Code.
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {token ? "Verificando o convite..." : "Aponte a câmera para o QR Code do aluno para abrir um convite."}
                </p>
              )}
              {message ? <p role="alert" className="text-sm text-destructive-foreground">{message}</p> : null}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
