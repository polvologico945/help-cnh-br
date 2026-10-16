export type Categoria = "A" | "B" | "AB";
export type Pergunta = { id: string; enunciado: string; alternativas: [string,string,string,string]; correta: number; explicacao: string };
export type Cena = { id: string; titulo: string; imagem: string; tipo: "foto" | "panorama"; perguntas: Pergunta[] };
export type Percurso = { id: string; categoria: Categoria; titulo: string; cenas: Cena[] };
export function validarPercurso(percurso: Percurso): void {
  const ids = new Set<string>();
  for (const cena of percurso.cenas) {
    if (ids.has(cena.id)) throw new Error("Cena duplicada: " + cena.id);
    ids.add(cena.id);
    for (const pergunta of cena.perguntas) {
      if (pergunta.alternativas.length !== 4 || pergunta.correta < 0 || pergunta.correta > 3) throw new Error("Pergunta inválida: " + pergunta.id);
    }
  }
}
