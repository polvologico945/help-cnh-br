import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GearShifter } from "@/components/GearShifter";
import { OnboardingModal } from "@/components/OnboardingModal";
import { QrLinkPanel } from "@/components/QrLinkPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { mockSocketOnLink } from "@/lib/mock/api";
import { SERVICES, type Category, type ServiceKey } from "@/lib/mock/types";
import { patchUser, setUser, useSession } from "@/lib/session";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Meu painel — ViaSegura" },
      {
        name: "description",
        content:
          "Acompanhe seu progresso, escolha o serviço de habilitação e vincule-se ao seu instrutor pelo QR Code.",
      },
      { property: "og:title", content: "Meu painel — ViaSegura" },
      {
        property: "og:description",
        content: "Progresso das aulas, categoria escolhida e vínculo com instrutor em tempo real.",
      },
    ],
  }),
  component: PainelPage,
});

function PainelPage() {
  const navigate = useNavigate();
  const { user, hydrated } = useSession();
  const [socketInstructor, setSocketInstructor] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/", replace: true });
  }, [hydrated, user, navigate]);

  useEffect(() => {
    return mockSocketOnLink((payload) => setSocketInstructor(payload.instructorName));
  }, []);

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <GearShifter activeGear={1} label="Carregando" />
      </div>
    );
  }

  const service = user.service;
  const needsQr = service ? SERVICES[service].requiresQr : false;
  const locked = needsQr && !user.instructorName;

  function confirmOnboarding(selected: ServiceKey, category: Category) {
    patchUser({ service: selected, category, progress: 8 });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-sm text-primary-foreground">
              VS
            </div>
            <div>
              <p className="font-display text-sm leading-tight">ViaSegura</p>
              <p className="text-xs text-muted-foreground">Olá, {user.name.split(" ")[0]}</p>
            </div>
          </div>
          <button
            className="btn-ghost px-4 py-2 text-sm hover:bg-white/12"
            onClick={() => {
              setUser(null);
              navigate({ to: "/", replace: true });
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Serviço" value={service ? SERVICES[service].label : "—"} />
          <StatCard label="Categoria" value={user.category ?? "—"} accent />
          <StatCard label="Instrutor" value={user.instructorName ?? "Aguardando vínculo"} />
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg">Progresso do processo</p>
            <p className="font-display text-2xl text-accent">{user.progress}%</p>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-700"
              style={{ width: `${user.progress}%` }}
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "Exame médico",
              "Aulas teóricas",
              "Prova teórica",
              "Aulas práticas",
              "Prova prática",
            ].map((step, index) => (
              <span
                key={step}
                className={`rounded-full border px-3 py-1.5 text-xs ${
                  user.progress >= (index + 1) * 20
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                {step}
              </span>
            ))}
          </div>
        </section>

        {locked ? (
          <section className="mt-8">
            <QrLinkPanel
              studentName={user.name}
              onLinked={(payload) =>
                patchUser({
                  instructorName: payload.instructorName,
                  linkedInstructorId: payload.instructorId,
                  progress: Math.max(user.progress, 22),
                })
              }
            />
          </section>
        ) : (
          <section className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card/60 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-accent">Próxima aula</p>
              <h2 className="mt-2 text-2xl">Direção defensiva — módulo 3</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {user.instructorName
                  ? `Com ${user.instructorName}, tela liberada via WebSocket.`
                  : "Conteúdo liberado para o seu serviço."}
              </p>
              <button
                className="btn-accent mt-5 hover:-translate-y-0.5"
                onClick={() => patchUser({ progress: Math.min(100, user.progress + 12) })}
              >
                Concluir etapa
              </button>
            </div>
            <div className="flex items-center justify-center rounded-2xl border border-border bg-card/60 p-6">
              <div className="scale-90">
                <GearShifter activeGear={0} label="Treine o câmbio" />
              </div>
            </div>
          </section>
        )}

        {socketInstructor ? (
          <p className="mt-6 rounded-xl border border-primary/60 bg-primary/15 px-4 py-3 text-sm">
            Vínculo confirmado: <strong>{socketInstructor}</strong> agora acompanha o seu processo.
          </p>
        ) : null}
      </main>

      {!service ? <OnboardingModal onConfirm={confirmOnboarding} /> : null}

      <SiteFooter />
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className={`mt-2 font-display text-xl ${accent ? "text-accent" : ""}`}>{value}</p>
    </div>
  );
}
