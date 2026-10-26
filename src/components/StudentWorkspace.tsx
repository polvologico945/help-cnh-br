import {
  BookOpenText, Check, CheckCircle2, ChevronRight, ClipboardList, Compass, Flag,
  GraduationCap, MapPinned, NotebookPen, Route, ShieldCheck, Sparkles, SteeringWheel,
} from "lucide-react";
import { useEffect, useState } from "react";
import { GearShifter } from "@/components/GearShifter";
import { SERVICES, type StudentUser } from "@/lib/mock/types";

type Page = "inicio" | "percurso" | "preparacao" | "evolucao" | "caderno";

const MODULES = [
  { id: "ambientacao", label: "Conhecer o veículo", detail: "Comandos, posição de dirigir e verificações iniciais." },
  { id: "observacao", label: "Observar o entorno", detail: "Espelhos, pontos cegos e atenção antes de qualquer movimento." },
  { id: "sinalizacao", label: "Ler a sinalização", detail: "Identificar placas e marcas presentes no trajeto." },
  { id: "antecipacao", label: "Antecipar decisões", detail: "Reconhecer curvas, cruzamentos e mudanças de velocidade." },
] as const;

const NAV: Array<{ id: Page; label: string; icon: typeof Compass }> = [
  { id: "inicio", label: "Início", icon: Compass },
  { id: "percurso", label: "Percurso virtual", icon: Route },
  { id: "preparacao", label: "Preparação", icon: SteeringWheel },
  { id: "evolucao", label: "Minha evolução", icon: ClipboardList },
  { id: "caderno", label: "Caderno de bordo", icon: NotebookPen },
];

export function StudentWorkspace({ user }: { user: StudentUser }) {
  const [page, setPage] = useState<Page>("inicio");
  const [done, setDone] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const storageKey = `viasegura.demo.learning.${user.id}`;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const value = JSON.parse(raw) as { done?: string[]; notes?: string };
      setDone(Array.isArray(value.done) ? value.done.filter((id) => MODULES.some((m) => m.id === id)) : []);
      setNotes(typeof value.notes === "string" ? value.notes : "");
    } catch { /* dados de demo nao devem impedir o acesso */ }
  }, [storageKey]);

  function updateDone(id: string) {
    const updated = done.includes(id) ? done.filter((item) => item !== id) : [...done, id];
    setDone(updated);
    window.localStorage.setItem(storageKey, JSON.stringify({ done: updated, notes }));
  }

  function saveNotes() {
    window.localStorage.setItem(storageKey, JSON.stringify({ done, notes }));
    setSaved(true);
  }

  const percentage = Math.round((done.length / MODULES.length) * 100);

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap gap-2" role="navigation" aria-label="Áreas de aprendizagem">
        {NAV.map((nav) => {
          const Icon = nav.icon;
          return (
            <button key={nav.id} type="button" aria-current={page === nav.id ? "page" : undefined}
              onClick={() => setPage(nav.id)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${page === nav.id
                ? "border-primary bg-primary/15 text-foreground"
                : "border-border bg-card/60 text-muted-foreground hover:border-accent/60 hover:text-foreground"}`}>
              <Icon className="h-4 w-4" /> {nav.label}
            </button>
          );
        })}
      </div>

      {page === "inicio" ? (
        <>
          <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-background p-7 sm:p-9">
              <p className="text-caption text-accent">Sua jornada começou</p>
              <h2 className="mt-4 max-w-lg text-3xl font-bold leading-tight sm:text-4xl">
                Preparar, reconhecer e praticar — no seu ritmo.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Seu instrutor está vinculado. Aqui você poderá explorar locais reais capturados
                para o percurso e fortalecer sua preparação entre as aulas.
              </p>
              <button onClick={() => setPage("preparacao")} className="btn-primary mt-6">
                Começar preparação <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-3xl border border-border bg-card/80 p-7">
              <p className="text-caption text-muted-foreground">Seu instrutor</p>
              <GraduationCap className="mt-5 h-9 w-9 text-primary" />
              <h3 className="mt-3 text-xl font-bold">{user.instructorName}</h3>
              <p className="mt-1 text-xs text-muted-foreground">Vinculado nesta demonstração</p>
              <div className="mt-5 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Acesso ao ambiente liberado
              </div>
            </div>
          </section>
          <section className="grid gap-4 md:grid-cols-3">
            <FeatureCard icon={MapPinned} title="Percurso virtual"
              text="Um passeio com imagens reais, paradas e decisões no caminho."
              label="Em preparação" onClick={() => setPage("percurso")} />
            <FeatureCard icon={SteeringWheel} title="Treino pré-aula"
              text="Revise os comandos do veículo e hábitos de observação."
              label="Explorar agora" onClick={() => setPage("preparacao")} />
            <FeatureCard icon={NotebookPen} title="Caderno de bordo"
              text="Guarde suas dúvidas e anotações depois de cada treino."
              label="Fazer anotações" onClick={() => setPage("caderno")} />
          </section>
        </>
      ) : null}

      {page === "percurso" ? (
        <section className="grid gap-6 rounded-3xl border border-border bg-card/70 p-7 md:grid-cols-[1fr_0.8fr] sm:p-9">
          <div>
            <p className="text-caption text-accent">Módulo 01 · Caminho real</p>
            <h2 className="mt-3 text-3xl font-bold">Percurso virtual supervisionado</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              O percurso ainda não possui imagens verificadas. Esta área está pronta para receber
              panoramas 360°, pontos de parada, sinalização observada e orientações do instrutor,
              quando forem fornecidos os registros reais do local.
            </p>
            <div className="mt-6 space-y-3 text-sm">
              {["Explorar a via por etapas", "Rever decisões e pontos de atenção", "Comparar o que foi observado com as orientações do instrutor"].map((label) => (
                <div key={label} className="flex gap-3"><Check className="h-5 w-5 shrink-0 text-primary" /> {label}</div>
              ))}
            </div>
            <span className="mt-7 inline-flex rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent">
              Aguardando captura e validação do local
            </span>
          </div>
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/60 p-8 text-center">
            <MapPinned className="h-14 w-14 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum percurso publicado</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Não serão exibidas ruas ou imagens inventadas.
            </p>
          </div>
        </section>
      ) : null}

      {page === "preparacao" ? (
        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-border bg-card/70 p-7">
            <p className="text-caption text-accent">Preparação guiada</p>
            <h2 className="mt-3 text-2xl font-bold">Antes de iniciar o movimento</h2>
            <div className="mt-6 space-y-4">
              {[
                ["Ajuste do posto de condução", "Posicione banco, encosto e espelhos de acordo com a orientação do instrutor."],
                ["Reconhecimento dos comandos", "Localize pedais, câmbio, indicadores e comandos básicos com o veículo parado."],
                ["Observação e comunicação", "Observe o entorno e sinalize suas intenções antes de manobrar."],
              ].map(([title, text], index) => (
                <div key={title} className="flex gap-4 rounded-xl border border-border p-4">
                  <span className="text-lg font-bold text-primary">0{index + 1}</span>
                  <div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>
                </div>
              ))}
            </div>
            <button onClick={() => setPage("evolucao")} className="btn-accent mt-6">Abrir checklist <ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card/70 p-7">
            <p className="text-caption self-start text-accent">Exploração interativa</p>
            <h3 className="mt-2 self-start text-lg font-bold">Conheça o câmbio</h3>
            <div className="mt-4"><GearShifter activeGear={0} label="Treino do câmbio" /></div>
            <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
              Visualização didática. Não substitui a prática acompanhada de um instrutor.
            </p>
          </div>
        </section>
      ) : null}

      {page === "evolucao" ? (
        <section className="rounded-3xl border border-border bg-card/70 p-6 sm:p-9">
          <p className="text-caption text-accent">Autoavaliação</p>
          <h2 className="mt-2 text-3xl font-bold">Minha preparação</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Marque o que já revisou. Esta lista é pessoal e não é uma avaliação oficial.
          </p>
          <div className="mt-6 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">{done.length} de {MODULES.length} tópicos revisados</span>
            <span className="font-display text-2xl text-accent">{percentage}%</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percentage}%` }} /></div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {MODULES.map((module) => (
              <label key={module.id} className="flex cursor-pointer gap-3 rounded-xl border border-border bg-background/40 p-4">
                <input type="checkbox" className="mt-1 h-5 w-5 accent-green-500"
                  checked={done.includes(module.id)} onChange={() => updateDone(module.id)} />
                <span><span className="block font-semibold">{module.label}</span><span className="mt-1 block text-sm text-muted-foreground">{module.detail}</span></span>
              </label>
            ))}
          </div>
        </section>
      ) : null}

      {page === "caderno" ? (
        <section className="rounded-3xl border border-border bg-card/70 p-6 sm:p-9">
          <p className="text-caption text-accent">Anotações pessoais</p>
          <h2 className="mt-2 text-3xl font-bold">Caderno de bordo</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Anote dúvidas para conversar com o instrutor, referências importantes e observações
            da aula. Dados salvos apenas neste navegador, nesta fase de demonstração.
          </p>
          <label className="mt-6 block text-sm font-semibold" htmlFor="notes">Minhas anotações</label>
          <textarea id="notes" className="field-input mt-2 min-h-56 resize-y"
            value={notes} onChange={(event) => { setNotes(event.target.value); setSaved(false); }}
            maxLength={4000} placeholder="O que quero revisar na próxima aula?" />
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button className="btn-primary" type="button" onClick={saveNotes}>
              <NotebookPen className="h-4 w-4" /> Salvar anotações
            </button>
            {saved ? <span role="status" className="inline-flex items-center gap-2 text-sm text-primary"><CheckCircle2 className="h-4 w-4" /> Salvas neste dispositivo</span> : null}
          </div>
        </section>
      ) : null}

      <div className="flex items-center gap-2 border-t border-border pt-6 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-primary" />
        Conteúdos demonstrativos · {SERVICES[user.service ?? "PRIMEIRA_HABILITACAO"].label}
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon, title, text, label, onClick,
}: {
  icon: typeof Compass; title: string; text: string; label: string; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className="group rounded-2xl border border-border bg-card/70 p-6 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50">
      <Icon className="h-8 w-8 text-primary" />
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      <p className="mt-2 min-h-14 text-sm leading-relaxed text-muted-foreground">{text}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">{label}<ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
    </button>
  );
}
