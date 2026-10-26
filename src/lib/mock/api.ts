/**
 * SERVIÇOS MOCKADOS (100% no navegador).
 * Veja src/lib/security-notes.ts para o contrato do backend real:
 * JWT em cookie HttpOnly, ORM parametrizado, rate limiting, WAF e sanitização.
 */
import { isValidCpf, onlyDigits } from "../cpf";
import { validatePassword } from "../password";
import type { AdminStudent, Role, StudentUser } from "./types";

const DB_KEY = "cnh.mock.users.v1";
const SESSION_KEY = "cnh.mock.session.v1";

type StoredUser = StudentUser & { password: string };

const latency = (ms = 550) => new Promise((resolve) => setTimeout(resolve, ms));

function readDb(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(DB_KEY) ?? "[]") as StoredUser[];
  } catch {
    return [];
  }
}

function writeDb(users: StoredUser[]) {
  window.localStorage.setItem(DB_KEY, JSON.stringify(users));
}

function publicUser(user: StoredUser): StudentUser {
  const { password: _password, ...rest } = user;
  return rest;
}

export type AuthResult = { ok: true; user: StudentUser } | { ok: false; errors: string[] };

export async function signUp(input: {
  name: string;
  email: string;
  cpf: string;
  password: string;
}): Promise<AuthResult> {
  await latency();
  const errors: string[] = [];
  const cpf = onlyDigits(input.cpf);

  if (input.name.trim().length < 3) errors.push("Informe seu nome completo.");
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(input.email.trim()))
    errors.push("Informe um e-mail válido.");
  if (!isValidCpf(cpf)) errors.push("CPF inválido (dígitos verificadores não conferem).");
  errors.push(...validatePassword(input.password, cpf));

  if (errors.length) return { ok: false, errors };

  const users = readDb();
  if (users.some((u) => u.cpf === cpf)) {
    return { ok: false, errors: ["Este CPF já possui cadastro."] };
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    cpf,
    password: input.password,
    role: "STUDENT",
    service: null,
    category: null,
    instructorName: null,
    linkedInstructorId: null,
    progress: 0,
  };

  writeDb([...users, user]);

  // MOCK de envio de e-mail (no backend real: fila + provedor transacional).
  console.info(
    `[mock:email] Para: ${user.email}\nAssunto: Confirme seu cadastro\nCorpo: Olá ${user.name}, confirme sua conta em /verify?token=${crypto.randomUUID()}`,
  );

  return { ok: true, user: publicUser(user) };
}

export async function signIn(input: { cpf: string; password: string }): Promise<AuthResult> {
  await latency();
  const cpf = onlyDigits(input.cpf);
  const user = readDb().find((u) => u.cpf === cpf && u.password === input.password);
  // Mensagem genérica de propósito: não revelar se o CPF existe (enumeration).
  if (!user) return { ok: false, errors: ["CPF ou senha inválidos."] };
  return { ok: true, user: publicUser(user) };
}

export async function signInWithGoogle(): Promise<AuthResult> {
  await latency(800);
  // MOCK OAuth: no backend real, fluxo Authorization Code + PKCE e sessão
  // devolvida em cookie HttpOnly — nunca token no localStorage.
  const users = readDb();
  const existing = users.find((u) => u.email === "aluno.google@exemplo.com");
  if (existing) return { ok: true, user: publicUser(existing) };

  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: "Aluno Google",
    email: "aluno.google@exemplo.com",
    cpf: "39053344705",
    password: "",
    role: "STUDENT",
    service: null,
    category: null,
    instructorName: null,
    linkedInstructorId: null,
    progress: 0,
  };
  writeDb([...users, user]);
  return { ok: true, user: publicUser(user) };
}

export function persistSession(user: StudentUser | null) {
  if (typeof window === "undefined") return;
  if (!user) window.localStorage.removeItem(SESSION_KEY);
  else window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function readSession(): StudentUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StudentUser) : null;
  } catch {
    return null;
  }
}

export function updateUser(user: StudentUser) {
  const users = readDb().map((u) => (u.id === user.id ? { ...u, ...user } : u));
  writeDb(users);
  persistSession(user);
}

/** MOCK de leitura de QR Code. Somente INSTRUCTOR pode ler. */
export async function scanQrCode(input: {
  token: string;
  readerRole: Role;
}): Promise<
  | { ok: true; instructorId: string; instructorName: string }
  | { ok: false; status: 403; message: string }
> {
  await latency(700);
  if (input.readerRole !== "INSTRUCTOR") {
    console.warn("[mock:api] 403 Forbidden — role sem permissão para ler QR:", input.readerRole);
    return { ok: false, status: 403, message: "403 — Apenas instrutores podem ler este QR Code." };
  }
  return {
    ok: true,
    instructorId: crypto.randomUUID(),
    instructorName: "Instrutor Marcos Andrade",
  };
}

/** MOCK de WebSocket: avisa a tela do aluno que o vínculo foi criado. */
export function mockSocketOnLink(
  callback: (payload: { instructorName: string; instructorId: string }) => void,
) {
  const listener = (event: Event) => {
    const detail = (event as CustomEvent).detail as {
      instructorName: string;
      instructorId: string;
    };
    callback(detail);
  };
  window.addEventListener("mock:ws:student-linked", listener);
  return () => window.removeEventListener("mock:ws:student-linked", listener);
}

export function emitMockSocketLink(payload: { instructorName: string; instructorId: string }) {
  console.info("[mock:ws] evento student-linked enviado:", payload);
  window.dispatchEvent(new CustomEvent("mock:ws:student-linked", { detail: payload }));
}

const SEED_STUDENTS: AdminStudent[] = [
  {
    id: "s1",
    name: "Ana Beatriz Lopes",
    cpf: "529.982.247-25",
    progress: 82,
    service: "PRIMEIRA_HABILITACAO",
  },
  {
    id: "s2",
    name: "Bruno Carvalho Dias",
    cpf: "390.533.447-05",
    progress: 47,
    service: "INCLUSAO",
  },
  {
    id: "s3",
    name: "Carla Menezes Rocha",
    cpf: "111.444.777-35",
    progress: 96,
    service: "AVULSAS",
  },
  {
    id: "s4",
    name: "Diego Ferreira Alves",
    cpf: "168.995.350-09",
    progress: 13,
    service: "PRIMEIRA_HABILITACAO",
  },
  {
    id: "s5",
    name: "Eduarda Nunes Prado",
    cpf: "263.446.100-05",
    progress: 65,
    service: "INCLUSAO",
  },
  {
    id: "s6",
    name: "Felipe Santana Lima",
    cpf: "298.880.150-05",
    progress: 34,
    service: "PRIMEIRA_HABILITACAO",
  },
  { id: "s7", name: "Gabriela Torres Sá", cpf: "457.213.680-08", progress: 58, service: "AVULSAS" },
  {
    id: "s8",
    name: "Henrique Barbosa Pinto",
    cpf: "630.026.230-20",
    progress: 71,
    service: "INCLUSAO",
  },
];

export function seedAdminStudents(): AdminStudent[] {
  return [...SEED_STUDENTS].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

/** Credenciais do painel administrativo (MOCK). No backend real: hash + MFA. */
export function adminLogin(user: string, pass: string): boolean {
  return user === "polvologico" && pass === "000-9-9-9+21~C.E";
}
