import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SVGBoundary } from "@/components/SVGBoundary";
import { SiteFooter } from "@/components/SiteFooter";
import { GearShifter } from "@/components/GearShifter";
import { formatCpf, isValidCpf } from "@/lib/cpf";
import { validatePassword } from "@/lib/password";
import { signIn, signInWithGoogle, signUp } from "@/lib/mock/api";
import { setUser, useSession } from "@/lib/session";
import { SECURITY_NOTES } from "@/lib/security-notes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ViaSegura — Sua CNH começa aqui" },
      {
        name: "description",
        content:
          "PWA educacional de trânsito: primeira habilitação, inclusão de categoria e aulas avulsas com acompanhamento do instrutor.",
      },
      { property: "og:title", content: "ViaSegura — Sua CNH começa aqui" },
      {
        property: "og:description",
        content:
          "Estude, acompanhe seu progresso e conecte-se ao seu instrutor em um app de trânsito feito para mobile.",
      },
    ],
  }),
  component: LoginPage,
});

type Mode = "login" | "signup";

function LoginPage() {
  const navigate = useNavigate();
  const { user, hydrated } = useSession();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (hydrated && user) navigate({ to: "/painel", replace: true });
  }, [hydrated, user, navigate]);

  const liveErrors: string[] = [];
  if (cpf.length > 0 && !isValidCpf(cpf)) liveErrors.push("CPF inválido.");
  if (mode === "signup" && password.length > 0)
    liveErrors.push(...validatePassword(password, cpf));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors([]);
    setLoading(true);
    const result =
      mode === "login"
        ? await signIn({ cpf, password })
        : await signUp({ name, email, cpf, password });
    setLoading(false);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setUser(result.user);
    navigate({ to: "/painel" });
  }

  async function handleGoogle() {
    setErrors([]);
    setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);
    if (result.ok) {
      setUser(result.user);
      navigate({ to: "/painel" });
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <SVGBoundary />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-14">
        <div className="w-full max-w-md rounded-3xl glass-panel p-7 sm:p-9">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
            <p className="ml-1 text-xs uppercase tracking-[0.35em] text-accent">ViaSegura</p>
          </div>

          <h1 className="mt-5 text-3xl leading-tight">
            {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Entre com CPF e senha para continuar seu processo."
              : "Cadastro rápido com validação real de CPF e senha de 6 dígitos."}
          </p>

          {loading ? (
            <div className="mt-8 flex justify-center">
              <div className="scale-[0.8]">
                <GearShifter activeGear={1} label="Engatando" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              {mode === "signup" ? (
                <>
                  <Field label="Nome completo">
                    <input
                      className="field-input focus:field-input-focus"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      maxLength={120}
                      required
                    />
                  </Field>
                  <Field label="E-mail">
                    <input
                      type="email"
                      className="field-input focus:field-input-focus"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      maxLength={255}
                      required
                    />
                  </Field>
                </>
              ) : null}

              <Field label="CPF">
                <input
                  inputMode="numeric"
                  className="field-input focus:field-input-focus"
                  value={formatCpf(cpf)}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  autoComplete="username"
                  required
                />
              </Field>

              <Field label="Senha (6 dígitos)">
                <input
                  type="password"
                  inputMode="numeric"
                  className="field-input focus:field-input-focus tracking-[0.5em]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />
              </Field>

              {[...liveErrors, ...errors].length ? (
                <ul className="space-y-1 rounded-lg border border-destructive/50 bg-destructive/15 px-3 py-2 text-xs text-destructive-foreground">
                  {[...new Set([...liveErrors, ...errors])].map((msg) => (
                    <li key={msg}>• {msg}</li>
                  ))}
                </ul>
              ) : null}

              <button type="submit" className="btn-primary w-full hover:-translate-y-0.5">
                {mode === "login" ? "Entrar" : "Cadastrar"}
              </button>

              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">ou</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <button type="button" onClick={handleGoogle} className="btn-ghost w-full hover:bg-white/12">
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.73 4.1-5.5 4.1A6.2 6.2 0 015.8 12 6.2 6.2 0 0112 5.8c1.7 0 2.9.7 3.6 1.4l2.6-2.5A9.6 9.6 0 0012 2a10 10 0 100 20c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.3-.2-2z" />
                </svg>
                Continuar com Google (mock)
              </button>

              <p className="pt-1 text-center text-sm text-muted-foreground">
                {mode === "login" ? "Ainda não tem conta?" : "Já tem cadastro?"}{" "}
                <button
                  type="button"
                  className="font-medium text-accent underline-offset-4 hover:underline"
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setErrors([]);
                  }}
                >
                  {mode === "login" ? "Cadastre-se" : "Entrar"}
                </button>
              </p>
            </form>
          )}

          <details className="mt-7 rounded-xl border border-border bg-black/20 p-3 text-xs text-muted-foreground">
            <summary className="cursor-pointer text-foreground">Notas de segurança</summary>
            <ul className="mt-2 space-y-1">
              {SECURITY_NOTES.map((note) => (
                <li key={note.title}>
                  <span className="text-accent">{note.title}:</span> {note.detail}
                </li>
              ))}
            </ul>
          </details>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
