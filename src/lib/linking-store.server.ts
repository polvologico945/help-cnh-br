/**
 * Armazenamento TEMPORARIO de convites para demonstracao.
 * Funciona entre navegadores conectados ao MESMO processo do servidor,
 * mas perde os dados quando o processo reinicia ou quando ha mais instancias.
 *
 * NAO e autenticacao nem autorizacao de producao.
 * Em producao: banco de dados + sessoes assinadas + instrutor verificado,
 * registro de auditoria, aprovacao transacional e expiracao.
 */
import { randomUUID } from "node:crypto";

const TTL_MS = 120_000;

type Invitation = {
  token: string;
  studentId: string;
  studentName: string;
  expiresAt: number;
  approvedBy: { instructorId: string; instructorName: string } | null;
};

const invitations = new Map<string, Invitation>();

function prune() {
  const now = Date.now();
  for (const [token, request] of invitations) {
    if (request.expiresAt < now) invitations.delete(token);
  }
}

export function issueInvitation(studentId: string, studentName: string) {
  prune();
  for (const [token, request] of invitations) {
    if (request.studentId === studentId && !request.approvedBy) invitations.delete(token);
  }
  const token = randomUUID();
  const expiresAt = Date.now() + TTL_MS;
  invitations.set(token, { token, studentId, studentName, expiresAt, approvedBy: null });
  return { token, expiresAt };
}

export function inspectInvitation(token: string) {
  prune();
  const invitation = invitations.get(token);
  if (!invitation) return { status: "expired" as const };
  return {
    status: invitation.approvedBy ? ("approved" as const) : ("pending" as const),
    studentName: invitation.studentName,
    expiresAt: invitation.expiresAt,
  };
}

export function invitationStatus(token: string, studentId: string) {
  prune();
  const invitation = invitations.get(token);
  if (!invitation || invitation.studentId !== studentId) return { status: "expired" as const };
  if (!invitation.approvedBy) return { status: "pending" as const };
  return { status: "approved" as const, ...invitation.approvedBy };
}

export function approveInvitation(token: string, instructorName: string) {
  prune();
  const invitation = invitations.get(token);
  if (!invitation) return { ok: false as const, message: "Convite expirado ou desconhecido." };
  if (invitation.approvedBy)
    return { ok: false as const, message: "Este convite ja foi utilizado." };
  // Identidade de DEMONSTRACAO. Nao e um cadastro de instrutor verificado.
  invitation.approvedBy = { instructorId: randomUUID(), instructorName };
  return { ok: true as const, studentName: invitation.studentName };
}
