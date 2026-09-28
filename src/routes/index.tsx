import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import { GearShifter } from "@/components/GearShifter";
import { SiteFooter } from "@/components/SiteFooter";
import { SVGBoundary } from "@/components/SVGBoundary";
import { Button } from "@/components/ui/button";
import { formatCpf, isValidCpf } from "@/lib/cpf";
import { signIn, signInWithGoogle, signUp } from "@/lib/mock/api";
import { validatePassword } from "@/lib/password";
import { SECURITY_NOTES } from "@/lib/security-notes";
import { setUser, useSession } from "@/lib/session";

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

const CPF_DIGITS = 11;
const PASSWORD_DIGITS = 6;
const onlyDigits = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

function LoginPage() {
  const navigate = useNavigate();
  const { user, hydrated } = useSession();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState(""); // só dígitos; a máscara é aplicada apenas na exibição
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (hydrated && user) navigate({ to: "/painel", replace: true });
  }, [hydrated, user, navigate]);

  // Validação ao vivo só quando o campo está completo — não acusa erro no 1º dígito.
  const liveErrors: string[] = [];
  if (cpf.length === CPF_DIGITS && !isValidCpf(cpf)) liveErrors.push("CPF inválido.");
  if (mode === "signup" && password.length === PASSWORD_DIGITS) {
    liveErrors.push(...validatePassword(password, cpf));
  }
  const shownErrors = [...new Set([...liveErrors, ...errors])];

  const canSubmit =
    cpf.length === CPF_DIGITS &&
    password.length === PASSWORD_DIGITS &&
    liveErrors.length === 0 &&
    (mode === "login" || (name.trim().length > 0 && email.trim().length > 0));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit || loading) return;
    setErrors([]);
    setLoading(true);
    try {
      const result =
        mode === "login"
          ? await signIn({ cpf, password })
          : await signUp({ name: name.trim(), email: email.trim(), cpf, password });
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setUser(result.user); // o useEffect acima redireciona para /painel
    } catch {
      setErrors(["Não foi possível conectar. Tente novamente."]);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (loading) return;
    setErrors([]);
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.ok) {
        setErrors(["Não foi possível entrar com o Google."]);
        return;
      }
      setUser(result.user);
    } catch {
      setErrors(["Não foi possível entrar com o Google."]);
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setErrors([]);
    setPassword("");
  }

  // Já logado: não pisca o formulário antes do redirecionamento.
  if (hydrated && user) return null;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <SVGBoundary />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-14">
        <div className="glass-panel w-full max-w-md overflow-hidden rounded-3xl p-7 sm:p-9">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-green" />
            <span className="h-2.5 w-2.5 rounded-full bg-brand-yellow" />
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/40" />
            <p className="ml-1 text-caption text-brand-yellow">ViaSegura</p>
          </div>

          <h1 className="mt-5 font-display text-3xl leading-tight text-foreground sm:text-4xl">
            {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Entre com CPF e senha para continuar seu processo."
              : "Cadastro rápido com validação real de CPF e senha de 6 dígitos."}
          </p>

          {loading ? (
            <div className="mt-8 flex justify-center">
              <GearShifter size={190} interval={700} label="Engatando" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
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
                  onChange={(e) => setCpf(onlyDigits(e.target.value, CPF_DIGITS))}
                  placeholder="000.000.000-00"
                  autoComplete="username"
                  aria-invalid={cpf.length === CPF_DIGITS && !isValidCpf(cpf)}
                  required
                />
              </Field>

              <Field label="Senha (6 dígitos)">
                <input
                  type="password"
                  inputMode="numeric"
                  className="field-input focus:field-input-focus tracking-[0.5em]"
                  value={password}
                  onChange={(e) => setPassword(onlyDigits(e.target.value, PASSWORD_DIGITS))}
                  placeholder="••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />
              </Field>

              {shownErrors.length ? (
                <ul
                  role="alert"
                  className="space-y-1 rounded-xl border border-destructive/50 bg-destructive/15 px-3 py-2 text-xs text-destructive-foreground"
                >
                  {shownErrors.map((msg) => (
                    <li key={msg}>• {msg}</li>
                  ))}
                </ul>
              ) : null}

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={!canSubmit}
              >
                {mode === "login" ? "Entrar" : "Cadastrar"}
              </Button>

              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-border/60" />
                <span className="text-xs text-muted-foreground">ou</span>
                <span className="h-px flex-1 bg-border/60" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-white/5 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-yellow/60"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M12 10.2v3.9h5.5c-.24 1.4-1.73 4.1-5.5 4.1A6.2 6.2 0 015.8 12 6.2 6.2 0 0112 5.8c1.7 0 2.9.7 3.6 1.4l2.6-2.5A9.6 9.6 0 0012 2a10 10 0 100 20c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.3-.2-2z"
                  />
                </svg>
                Continuar com Google (mock)
              </button>

              <p className="pt-1 text-center text-sm text-muted-foreground">
                {mode === "login" ? "Ainda não tem conta?" : "Já tem cadastro?"}{" "}
                <button
                  type="button"
                  className="font-semibold text-brand-yellow underline-offset-4 hover:underline"
                  onClick={switchMode}
                >
                  {mode === "login" ? "Cadastre-se" : "Entrar"}
                </button>
              </p>
            </form>
          )}

          <details className="mt-7 rounded-2xl border border-border/60 bg-white/5 p-3 text-xs text-muted-foreground">
            <summary className="cursor-pointer text-foreground">Notas de segurança</summary>
            <ul className="mt-2 space-y-1">
              {SECURITY_NOTES.map((note) => (
                <li key={note.title}>
                  <span className="text-brand-yellow">{note.title}:</span> {note.detail}
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-caption mb-1.5 block text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
