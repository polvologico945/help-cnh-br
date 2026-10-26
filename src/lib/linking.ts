import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Contrato de demonstracao: dados efemeros no mesmo servidor.
// Nao utilizar para associar pessoas de verdade sem autenticacao server-side.
const tokenSchema = z.string().uuid();

export const issueDemoInvitation = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ studentId: z.string().uuid(), studentName: z.string().min(2).max(120) }),
  )
  .handler(async ({ data }) => {
    const { issueInvitation } = await import("./linking-store.server");
    return issueInvitation(data.studentId, data.studentName);
  });

export const inspectDemoInvitation = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: tokenSchema }))
  .handler(async ({ data }) => {
    const { inspectInvitation } = await import("./linking-store.server");
    return inspectInvitation(data.token);
  });

export const getDemoInvitationStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: tokenSchema, studentId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { invitationStatus } = await import("./linking-store.server");
    return invitationStatus(data.token, data.studentId);
  });

export const approveDemoInvitation = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ token: tokenSchema, instructorName: z.string().trim().min(3).max(80) }),
  )
  .handler(async ({ data }) => {
    const { approveInvitation } = await import("./linking-store.server");
    return approveInvitation(data.token, data.instructorName);
  });
