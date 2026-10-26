import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { adminLogin, seedAdminStudents } from "@/lib/mock/api";
import { SERVICES, type AdminStudent } from "@/lib/mock/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo — ViaSegura" },
      {
        name: "description",
        content: "Área restrita para gestão de alunos, progresso e vínculos do ViaSegura.",
      },
      { property: "og:title", content: "Painel administrativo — ViaSegura" },
      { property: "og:description", content: "Gestão de alunos e progresso do ViaSegura." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Sidebar = { mode: "edit" | "delete"; student: AdminStudent } | null;

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [user, setUserField] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<AdminStudent[]>(() => seedAdminStudents());
  const [sidebar, setSidebar] = useState<Sidebar>(null);
  const [draft, setDraft] = useState({ name: "", progress: 0 });

  if (!authed) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <form
            className="w-full max-w-sm rounded-2xl glass-panel p-7"
            onSubmit={(event) => {
              event.preventDefault();
              // MOCK: no backend real, verificação server-side com hash + MFA,
              // rate limiting por IP e sessão em cookie HttpOnly.
              if (adminLogin(user, pass)) {
                setAuthed(true);
                setError(null);
              } else {
                setError("Credenciais administrativas inválidas.");
              }
            }}
          >
            <p className="text-xs uppercase tracking-[0.35em] text-accent">Área restrita</p>
            <h1 className="mt-2 text-2xl">Painel administrativo</h1>

            <label className="mt-6 block">
              <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                Usuário
              </span>
              <input
                className="field-input focus:field-input-focus"
                value={user}
                onChange={(e) => setUserField(e.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                Senha
              </span>
              <input
                type="password"
                className="field-input focus:field-input-focus"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            {error ? (
              <p className="mt-4 rounded-lg border border-destructive/50 bg-destructive/15 px-3 py-2 text-xs text-destructive-foreground">
                {error}
              </p>
            ) : null}

            <button type="submit" className="btn-primary mt-6 w-full hover:-translate-y-0.5">
              Acessar
            </button>
          </form>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background/80 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="font-display text-lg">Alunos cadastrados</p>
            <p className="text-xs text-muted-foreground">
              {students.length} registros em ordem alfabética
            </p>
          </div>
          <button className="btn-ghost px-4 py-2 text-sm" onClick={() => setAuthed(false)}>
            Encerrar sessão
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">CPF</th>
                <th className="px-5 py-3 w-[34%]">Progresso</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-t border-border/70 hover:bg-white/5">
                  <td className="px-5 py-3">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {SERVICES[student.service].label}
                    </p>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">{student.cpf}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-secondary via-primary to-accent transition-[width] duration-500"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs text-muted-foreground">
                        {student.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        aria-label={`Editar ${student.name}`}
                        className="rounded-lg border border-border p-2 transition-colors hover:border-accent hover:text-accent"
                        onClick={() => {
                          setDraft({ name: student.name, progress: student.progress });
                          setSidebar({ mode: "edit", student });
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4 fill-current"
                          aria-hidden="true"
                        >
                          <path d="M12 5c-5 0-9 4.5-9 7s4 7 9 7 9-4.5 9-7-4-7-9-7zm0 11a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </button>
                      <button
                        aria-label={`Excluir ${student.name}`}
                        className="rounded-lg border border-border p-2 transition-colors hover:border-destructive hover:text-destructive"
                        onClick={() => setSidebar({ mode: "delete", student })}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4 fill-current"
                          aria-hidden="true"
                        >
                          <path d="M9 3h6l1 2h4v2H4V5h4l1-2zM6 9h12l-1 11a2 2 0 01-2 2H9a2 2 0 01-2-2L6 9zm4 2v9h1.5v-9H10zm3.5 0v9H15v-9h-1.5z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {sidebar ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebar(null)}
          />
          <aside className="fixed right-0 top-0 z-50 h-full w-[min(420px,92vw)] border-l border-border bg-card p-6 shadow-glow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-accent">
                  {sidebar.mode === "edit" ? "Editar aluno" : "Exclusão permanente"}
                </p>
                <h2 className="mt-2 text-xl">{sidebar.student.name}</h2>
              </div>
              <button
                aria-label="Fechar"
                className="rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent"
                onClick={() => setSidebar(null)}
              >
                X
              </button>
            </div>

            {sidebar.mode === "edit" ? (
              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                    Nome
                  </span>
                  <input
                    className="field-input focus:field-input-focus"
                    value={draft.name}
                    maxLength={120}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                    Progresso: {draft.progress}%
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={draft.progress}
                    className="w-full accent-[var(--color-primary)]"
                    onChange={(e) => setDraft({ ...draft, progress: Number(e.target.value) })}
                  />
                </label>
                <button
                  className="btn-primary w-full"
                  onClick={() => {
                    setStudents((list) =>
                      [...list]
                        .map((s) =>
                          s.id === sidebar.student.id
                            ? { ...s, name: draft.name.trim() || s.name, progress: draft.progress }
                            : s,
                        )
                        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
                    );
                    setSidebar(null);
                  }}
                >
                  Salvar alterações
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Esta ação remove o aluno e todo o histórico de aulas. Não pode ser desfeita.
                </p>
                <p className="rounded-lg border border-destructive/50 bg-destructive/15 px-3 py-2 text-xs">
                  CPF {sidebar.student.cpf} · progresso {sidebar.student.progress}%
                </p>
                <button
                  className="w-full rounded-md bg-destructive px-4 py-2.5 font-semibold text-destructive-foreground transition-transform hover:-translate-y-0.5"
                  onClick={() => {
                    setStudents((list) => list.filter((s) => s.id !== sidebar.student.id));
                    setSidebar(null);
                  }}
                >
                  Excluir permanentemente
                </button>
              </div>
            )}
          </aside>
        </>
      ) : null}

      <SiteFooter />
    </div>
  );
}
