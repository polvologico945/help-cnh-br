import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Download,
  Filter,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  MapPinned,
  Menu,
  NotebookPen,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { adminLogin, persistDemoAdminStudents, seedAdminStudents } from "@/lib/mock/api";
import { SERVICES, type AdminStudent, type ServiceKey } from "@/lib/mock/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administração — ViaSegura" },
      {
        name: "description",
        content: "Gestão demonstrativa de alunos e planejamento do ambiente de aprendizagem.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type View = "resumo" | "alunos" | "conteudos" | "operacao";
type Editor = { mode: "edit" | "delete"; student: AdminStudent } | null;
type StatusFilter = "all" | "linked" | "pending";

const NAV: Array<{ id: View; label: string; icon: typeof Users }> = [
  { id: "resumo", label: "Visão geral", icon: LayoutDashboard },
  { id: "alunos", label: "Alunos", icon: Users },
  { id: "conteudos", label: "Conteúdos e percursos", icon: MapPinned },
  { id: "operacao", label: "Operação", icon: Activity },
];

const CATALOG = [
  {
    icon: MapPinned,
    title: "Passeio pelo percurso real",
    category: "Percurso",
    description: "Panoramas e pontos de decisão a partir de imagens reais, ainda não recebidas.",
    status: "Aguardando captura",
  },
  {
    icon: GraduationCap,
    title: "Preparação para dirigir",
    category: "Aprendizagem",
    description: "Boas práticas antes da aula, reconhecimento de comandos e atenção ao entorno.",
    status: "Disponível na demonstração",
  },
  {
    icon: ClipboardList,
    title: "Checklist de preparação",
    category: "Acompanhamento",
    description: "Autoavaliação do aluno, separada da avaliação oficial do instrutor.",
    status: "Disponível na demonstração",
  },
  {
    icon: NotebookPen,
    title: "Caderno de bordo",
    category: "Aprendizagem",
    description: "Anotações pessoais salvas no navegador do aluno.",
    status: "Disponível na demonstração",
  },
  {
    icon: BookOpen,
    title: "Revisão de sinalização e decisões",
    category: "Planejado",
    description: "Questões contextualizadas por pontos e situações observadas no percurso.",
    status: "Planejado",
  },
  {
    icon: ShieldCheck,
    title: "Feedback do instrutor",
    category: "Planejado",
    description: "Orientações por etapa e revisão conjunta dos treinos.",
    status: "Planejado",
  },
];

function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [view, setView] = useState<View>("resumo");
  const [students, setStudents] = useState<AdminStudent[]>(() => seedAdminStudents());
  const [query, setQuery] = useState("");
  const [service, setService] = useState<"all" | ServiceKey>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [editor, setEditor] = useState<Editor>(null);
  const [draft, setDraft] = useState({ name: "", progress: 0 });
  const [mobileNav, setMobileNav] = useState(false);

  const filtered = useMemo(
    () =>
      students.filter((student) => {
        const text = `${student.name} ${student.cpf}`.toLocaleLowerCase("pt-BR");
        const matchesSearch = text.includes(query.trim().toLocaleLowerCase("pt-BR"));
        const matchesService = service === "all" || student.service === service;
        const matchesStatus =
          status === "all" ||
          (status === "linked" ? Boolean(student.instructorName) : !student.instructorName);
        return matchesSearch && matchesService && matchesStatus;
      }),
    [students, query, service, status],
  );

  const linked = students.filter((student) => Boolean(student.instructorName)).length;
  const pending = students.length - linked;
  const avgProgress = students.length
    ? Math.round(students.reduce((sum, student) => sum + student.progress, 0) / students.length)
    : 0;

  function saveList(next: AdminStudent[]) {
    const sorted = [...next].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    setStudents(sorted);
    persistDemoAdminStudents(sorted);
  }

  function openEditor(student: AdminStudent, mode: "edit" | "delete") {
    setDraft({ name: student.name, progress: student.progress });
    setEditor({ student, mode });
  }

  function exportCsv() {
    const escapeField = (value: string) => {
      // Evita formula injection ao abrir CSV em planilhas.
      const safe = /^[=+@\-\t\r]/.test(value) ? `'${value}` : value;
      return `"${safe.replaceAll('"', '""')}"`;
    };
    const rows = [
      ["Nome", "CPF", "Serviço", "Instrutor", "Progresso demonstrativo"].map(escapeField).join(";"),
      ...filtered.map((student) =>
        [
          student.name,
          student.cpf,
          SERVICES[student.service].label,
          student.instructorName ?? "Sem vínculo",
          String(student.progress),
        ]
          .map(escapeField)
          .join(";"),
      ),
    ];
    const blob = new Blob(["\ufeff" + rows.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "viasegura-alunos-demonstracao.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-5 py-12">
          <div className="grid w-full overflow-hidden rounded-3xl border border-border bg-card/80 shadow-elevated md:grid-cols-2">
            <section className="flex flex-col justify-center bg-gradient-to-br from-primary/20 via-background/40 to-card p-8 sm:p-12">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                <LayoutDashboard className="h-7 w-7" />
              </div>
              <p className="text-caption mt-7 text-accent">ViaSegura · Gestão</p>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                Organize toda a jornada de aprendizagem.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Acompanhe alunos, prepare conteúdos e configure a operação dos percursos em um só
                lugar.
              </p>
              <p className="mt-8 rounded-xl border border-accent/30 bg-accent/10 p-4 text-xs text-muted-foreground">
                Ambiente de demonstração, com dados fictícios e autenticação ainda não adequada à
                produção.
              </p>
            </section>
            <section className="flex flex-col justify-center p-8 sm:p-12">
              <LockKeyhole className="h-8 w-8 text-accent" />
              <h2 className="mt-4 text-2xl font-bold">Acesso administrativo</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Entre com as credenciais de demonstração do projeto.
              </p>
              <form
                className="mt-7 space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (adminLogin(username, password)) {
                    setAuthenticated(true);
                    setLoginError("");
                    setStudents(seedAdminStudents());
                  } else setLoginError("Credenciais administrativas inválidas.");
                }}
              >
                <label className="block text-sm font-semibold">
                  Usuário
                  <input
                    className="field-input mt-2"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Senha
                  <input
                    className="field-input mt-2"
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </label>
                {loginError ? (
                  <p className="text-sm text-destructive-foreground" role="alert">
                    {loginError}
                  </p>
                ) : null}
                <button className="btn-primary w-full py-3" type="submit">
                  Entrar no painel <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </section>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[255px_minmax(0,1fr)]">
      <aside className="border-b border-border bg-card/80 lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display font-bold">ViaSegura</p>
              <p className="text-xs text-muted-foreground">Painel de gestão</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg border border-border p-2 lg:hidden"
            onClick={() => setMobileNav(!mobileNav)}
            aria-label="Alternar menu"
            aria-expanded={mobileNav}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <nav
          aria-label="Menu administrativo"
          className={`space-y-1 px-3 py-4 ${mobileNav ? "block" : "hidden lg:block"}`}
        >
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setView(item.id);
                  setMobileNav(false);
                }}
                aria-current={view === item.id ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                  view === item.id
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" /> {item.label}
              </button>
            );
          })}
          <div className="border-t border-border pt-4">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                setAuthenticated(false);
                setPassword("");
                setLoginError("");
              }}
            >
              <LogOut className="h-5 w-5" /> Encerrar sessão
            </button>
          </div>
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-border bg-background/60 px-5 py-5 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-caption text-accent">Administração</p>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                {NAV.find((item) => item.id === view)?.label}
              </h1>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent">
              <CircleAlert className="h-4 w-4" /> Dados demonstrativos
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-7 px-5 py-8 sm:px-8">
          {view === "resumo" ? (
            <>
              <section className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
                <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-background p-7 sm:p-9">
                  <p className="text-caption text-accent">Centro de operações</p>
                  <h2 className="mt-3 max-w-xl text-3xl font-bold leading-tight">
                    Da conexão ao percurso: acompanhe cada etapa.
                  </h2>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                    A nova experiência organiza alunos, vínculo com instrutores, preparação de aulas
                    e publicação futura de percursos.
                  </p>
                  <button
                    type="button"
                    className="btn-primary mt-6"
                    onClick={() => setView("alunos")}
                  >
                    Gerenciar alunos <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="rounded-3xl border border-border bg-card/70 p-7">
                  <p className="text-caption text-muted-foreground">Atenção da operação</p>
                  <div className="mt-5 flex items-start gap-3">
                    <CircleAlert className="h-6 w-6 shrink-0 text-accent" />
                    <p className="text-sm leading-relaxed">
                      A validação de instrutores e o armazenamento em banco de dados precisam ser
                      implementados antes do uso real.
                    </p>
                  </div>
                  <button
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent"
                    type="button"
                    onClick={() => setView("operacao")}
                  >
                    Ver próximos passos <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric
                  label="Perfis no protótipo"
                  value={students.length.toString()}
                  icon={Users}
                  detail="Inclui registros de exemplo"
                />
                <Metric
                  label="Com vínculo registrado"
                  value={linked.toString()}
                  icon={CheckCircle2}
                  detail="Apenas dados acessíveis aqui"
                />
                <Metric
                  label="Sem vínculo registrado"
                  value={pending.toString()}
                  icon={LockKeyhole}
                  detail="Solicitam confirmação"
                />
                <Metric
                  label="Progresso médio"
                  value={`${avgProgress}%`}
                  icon={Activity}
                  detail="Percentuais demonstrativos"
                />
              </section>

              <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
                <div className="rounded-3xl border border-border bg-card/70 p-6 sm:p-8">
                  <h3 className="text-xl font-bold">Distribuição por serviço</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Resumo calculado a partir dos registros deste navegador.
                  </p>
                  <div className="mt-7 space-y-6">
                    {(Object.keys(SERVICES) as ServiceKey[]).map((key) => {
                      const count = students.filter((student) => student.service === key).length;
                      const pct = students.length ? Math.round((count / students.length) * 100) : 0;
                      return (
                        <div key={key}>
                          <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                            <span className="font-medium">{SERVICES[key].label}</span>
                            <span className="text-muted-foreground">
                              {count} · {pct}%
                            </span>
                          </div>
                          <div className="h-2.5 rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-3xl border border-border bg-card/70 p-6 sm:p-8">
                  <h3 className="text-xl font-bold">Prioridades do produto</h3>
                  <ul className="mt-6 space-y-5">
                    {[
                      ["01", "Vínculo por convite", "Demonstração com QR Code e confirmação."],
                      ["02", "Espaço do aluno", "Módulos didáticos e caderno pessoal."],
                      ["03", "Percurso real", "Aguardando fotos e pontos de navegação."],
                      [
                        "04",
                        "Backend definitivo",
                        "Autenticação, papéis e histórico centralizado.",
                      ],
                    ].map(([index, title, detail]) => (
                      <li key={index} className="flex gap-4">
                        <span className="font-display text-xl text-primary">{index}</span>
                        <div>
                          <p className="font-semibold">{title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </>
          ) : null}

          {view === "alunos" ? (
            <section className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Gestão de alunos</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {filtered.length} de {students.length} perfis · edição salva somente neste
                    navegador
                  </p>
                </div>
                <button
                  onClick={exportCsv}
                  className="btn-ghost text-sm"
                  type="button"
                  disabled={!filtered.length}
                >
                  <Download className="h-4 w-4" /> Exportar CSV
                </button>
              </div>
              <div className="grid gap-3 rounded-2xl border border-border bg-card/70 p-4 md:grid-cols-[1fr_220px_190px]">
                <label className="relative">
                  <span className="sr-only">Buscar alunos por nome ou CPF</span>
                  <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    className="field-input w-full pl-10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por nome ou CPF"
                  />
                </label>
                <label>
                  <span className="sr-only">Filtrar serviço</span>
                  <select
                    className="field-input w-full"
                    value={service}
                    onChange={(e) => setService(e.target.value as "all" | ServiceKey)}
                  >
                    <option value="all">Todos os serviços</option>
                    {(Object.keys(SERVICES) as ServiceKey[]).map((key) => (
                      <option value={key} key={key}>
                        {SERVICES[key].label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="sr-only">Filtrar vínculo</span>
                  <select
                    className="field-input w-full"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusFilter)}
                  >
                    <option value="all">Todos os vínculos</option>
                    <option value="linked">Com vínculo</option>
                    <option value="pending">Sem vínculo</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-3 xl:grid-cols-2">
                {filtered.map((student) => (
                  <article
                    key={student.id}
                    className="rounded-2xl border border-border bg-card/70 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-1 gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-bold text-primary">
                          {student.name
                            .split(" ")
                            .slice(0, 2)
                            .map((name) => name[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">{student.name}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {SERVICES[student.service].label} · CPF {student.cpf}
                          </p>
                          <span className="mt-2 inline-flex rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                            {student.instructorName
                              ? `Instrutor: ${student.instructorName}`
                              : "Sem vínculo registrado"}
                          </span>
                        </div>
                      </div>
                      <span className="rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground">
                        {student.source === "navegador" ? "Local" : "Exemplo"}
                      </span>
                    </div>
                    <div className="mt-5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progresso demonstrativo</span>
                      <span className="font-semibold">{student.progress}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <div className="mt-5 flex gap-3">
                      <button
                        className="btn-ghost flex-1 px-4 py-2 text-sm"
                        type="button"
                        onClick={() => openEditor(student, "edit")}
                      >
                        Editar
                      </button>
                      <button
                        className="rounded-xl border border-destructive/40 px-4 py-2 text-sm hover:bg-destructive/10"
                        type="button"
                        onClick={() => openEditor(student, "delete")}
                      >
                        Excluir
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {!filtered.length ? (
                <p className="rounded-2xl border border-border bg-card/70 p-10 text-center text-muted-foreground">
                  Nenhum perfil encontrado com os filtros escolhidos.
                </p>
              ) : null}
            </section>
          ) : null}

          {view === "conteudos" ? (
            <section>
              <div className="mb-6">
                <h2 className="text-xl font-bold">Biblioteca e planejamento</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Cada área terá seu próprio conteúdo. O percurso virtual será integrado somente
                  após validação das capturas.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {CATALOG.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={item.title}
                      className="flex min-h-64 flex-col rounded-2xl border border-border bg-card/70 p-6"
                    >
                      <Icon className="h-8 w-8 text-primary" />
                      <p className="text-caption mt-5 text-accent">{item.category}</p>
                      <h3 className="mt-2 text-xl font-bold">{item.title}</h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="mt-5 border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
                        {item.status}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {view === "operacao" ? (
            <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
              <div className="rounded-3xl border border-border bg-card/70 p-7">
                <h2 className="text-xl font-bold">Fluxo de vínculo com instrutor</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  O protótipo usa convites com validade de dois minutos. A página do instrutor ainda
                  não possui login verificado.
                </p>
                <ol className="mt-7 space-y-5">
                  {[
                    "Aluno escolhe serviço e categoria.",
                    "Servidor gera um convite temporário e um QR Code legível.",
                    "Câmera do instrutor abre a página de confirmação.",
                    "A confirmação libera o espaço no painel do aluno.",
                  ].map((item, index) => (
                    <li className="flex items-start gap-4" key={item}>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 font-bold text-primary">
                        0{index + 1}
                      </span>
                      <span className="pt-2 text-sm">{item}</span>
                    </li>
                  ))}
                </ol>
                <Link to="/instrutor" className="btn-ghost mt-7 text-sm">
                  Página de demonstração do instrutor <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-5">
                <div className="rounded-3xl border border-accent/30 bg-accent/10 p-7">
                  <div className="flex gap-3">
                    <CircleAlert className="h-6 w-6 shrink-0 text-accent" />
                    <h3 className="text-xl font-bold">Antes de usar com pessoas reais</h3>
                  </div>
                  <ul className="mt-5 space-y-3 text-sm text-foreground">
                    {[
                      "Login real para alunos, instrutores e administradores.",
                      "Autorização de papéis verificada no servidor.",
                      "Banco de dados e trilha de auditoria dos vínculos.",
                      "Convites de uso único e transações persistentes.",
                      "Políticas de privacidade e acesso a informações pessoais.",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-primary" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl border border-border bg-card/70 p-7">
                  <h3 className="text-lg font-bold">Estado da infraestrutura</h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <p>
                      Interface: <strong>React + TypeScript</strong>
                    </p>
                    <p>
                      QR Code: <strong>SVG válido</strong>
                    </p>
                    <p>
                      Convites: <strong>memória do servidor (temporária)</strong>
                    </p>
                    <p>
                      Dados de alunos: <strong>navegador (mock)</strong>
                    </p>
                    <p>
                      Percurso: <strong>sem imagens publicadas</strong>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </main>
        <div className="mx-auto mt-8 max-w-7xl px-5 pb-8 text-xs text-muted-foreground sm:px-8">
          ViaSegura · Ambiente de gestão demonstrativo. Nenhuma métrica representa operação em
          produção.
        </div>
      </div>

      {editor ? (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/70"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditor(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="editor-title"
            className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-card p-6 shadow-elevated sm:p-8"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-caption text-accent">Dados locais de demonstração</p>
              <button
                type="button"
                aria-label="Fechar"
                className="rounded-lg border border-border p-2"
                onClick={() => setEditor(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <h2 id="editor-title" className="mt-4 text-2xl font-bold">
              {editor.mode === "edit" ? "Editar perfil" : "Excluir perfil"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{editor.student.name}</p>
            {editor.mode === "edit" ? (
              <form
                className="mt-7 space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveList(
                    students.map((student) =>
                      student.id === editor.student.id
                        ? { ...student, name: draft.name.trim(), progress: draft.progress }
                        : student,
                    ),
                  );
                  setEditor(null);
                }}
              >
                <label className="block text-sm font-semibold">
                  Nome
                  <input
                    className="field-input mt-2"
                    value={draft.name}
                    required
                    minLength={3}
                    maxLength={120}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  <span className="flex justify-between">
                    <span>Progresso demonstrativo</span>
                    <span>{draft.progress}%</span>
                  </span>
                  <input
                    className="mt-4 w-full accent-green-500"
                    type="range"
                    min={0}
                    max={100}
                    value={draft.progress}
                    onChange={(e) => setDraft({ ...draft, progress: Number(e.target.value) })}
                  />
                </label>
                <p className="text-xs text-muted-foreground">
                  Esta edição altera somente a lista local do painel de gestão.
                </p>
                <button type="submit" className="btn-primary w-full">
                  <Check className="h-4 w-4" /> Salvar alterações
                </button>
              </form>
            ) : (
              <div className="mt-7 space-y-5">
                <p className="text-sm text-muted-foreground">
                  A exclusão remove este registro da lista local deste navegador. Não há
                  sincronização com servidor de produção.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="btn-ghost flex-1"
                    onClick={() => setEditor(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-xl bg-destructive px-4 py-2 font-semibold text-destructive-foreground"
                    onClick={() => {
                      saveList(students.filter((student) => student.id !== editor.student.id));
                      setEditor(null);
                    }}
                  >
                    Confirmar exclusão
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  detail,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6">
      <Icon className="h-6 w-6 text-primary" />
      <p className="mt-4 text-caption text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
