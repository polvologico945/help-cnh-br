import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, LockKeyhole, LogOut, Route as RouteIcon, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { GearShifter } from "@/components/GearShifter";
import { OnboardingModal } from "@/components/OnboardingModal";
import { QrLinkPanel } from "@/components/QrLinkPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { StudentWorkspace } from "@/components/StudentWorkspace";
import { SERVICES, type Category, type ServiceKey } from "@/lib/mock/types";
import { patchUser, setUser, useSession } from "@/lib/session";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Meu espaço — ViaSegura" },
      {
        name: "description",
        content: "Aprendizado de direção, vínculo com instrutor e percurso virtual.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PainelPage,
});

function PainelPage() {
  const navigate = useNavigate();
  const { user, hydrated } = useSession();

  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/", replace: true });
  }, [hydrated, user, navigate]);

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <GearShifter activeGear={1} label="Carregando" />
      </div>
    );
  }

  const service = user.service;
  const linked = Boolean(user.linkedInstructorId && user.instructorName);

  function confirmOnboarding(selected: ServiceKey, category: Category) {
    patchUser({ service: selected, category, progress: 0 });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <RouteIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold leading-tight">ViaSegura</p>
              <p className="text-xs text-muted-foreground">Olá, {user.name.split(" ")[0]}</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-ghost px-4 py-2 text-sm"
            onClick={() => {
              setUser(null);
              navigate({ to: "/", replace: true });
            }}
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-7 px-5 py-8 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-caption text-accent">Área do aluno</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              {linked ? "Seu espaço de aprendizagem" : "Prepare seu primeiro acesso"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {service
                ? `${SERVICES[service].label} · Categoria ${user.category ?? "não informada"}`
                : "Escolha seu serviço e sua categoria para começar."}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${
              linked
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-accent/30 bg-accent/10 text-accent"
            }`}
          >
            {linked ? <CheckCircle2 className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
            {linked ? "Instrutor vinculado" : "Aguardando instrutor"}
          </span>
        </div>

        {!service ? (
          <section className="rounded-3xl border border-border bg-card/70 p-8 text-center">
            <p className="text-muted-foreground">
              A seleção de serviço é necessária para continuar.
            </p>
          </section>
        ) : linked ? (
          <StudentWorkspace user={user} />
        ) : (
          <>
            <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-semibold">
                  Seu conteúdo ainda está protegido nesta demonstração
                </p>
                <p className="mt-1 text-muted-foreground">
                  A página de aprendizagem aparece somente depois da confirmação do vínculo por quem
                  abrir o convite de instrutor.
                </p>
              </div>
            </div>
            <QrLinkPanel
              studentId={user.id}
              studentName={user.name}
              onLinked={(confirmation) =>
                patchUser({
                  instructorName: confirmation.instructorName,
                  linkedInstructorId: confirmation.instructorId,
                })
              }
            />
          </>
        )}
      </main>

      {!service ? <OnboardingModal onConfirm={confirmOnboarding} /> : null}
      <SiteFooter />
    </div>
  );
}
