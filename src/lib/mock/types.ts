export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export type ServiceKey = "PRIMEIRA_HABILITACAO" | "INCLUSAO" | "AVULSAS";

export type Category = "A" | "B" | "AB" | "C" | "D" | "E";

export type StudentUser = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: Role;
  service: ServiceKey | null;
  category: Category | null;
  instructorName: string | null;
  linkedInstructorId: string | null;
  progress: number;
};

export type AdminStudent = {
  id: string;
  name: string;
  cpf: string;
  progress: number;
  service: ServiceKey;
};

export const SERVICES: Record<
  ServiceKey,
  { label: string; description: string; categories: Category[]; requiresQr: boolean }
> = {
  PRIMEIRA_HABILITACAO: {
    label: "Primeira Habilitação",
    description: "Processo completo, do exame teórico às aulas práticas.",
    categories: ["A", "B", "AB"],
    requiresQr: true,
  },
  INCLUSAO: {
    label: "Inclusão de Categoria",
    description: "Adicione novas categorias à CNH que você já possui.",
    categories: ["A", "B", "C", "D", "E"],
    requiresQr: false,
  },
  AVULSAS: {
    label: "Aulas Avulsas",
    description: "Aulas extras de direção para ganhar confiança ao volante.",
    categories: ["A", "B", "C", "D", "E"],
    requiresQr: false,
  },
};
