import type { Percurso } from "./types";
export const percursoMoto: Percurso = {
  id: "categoria-a-introducao", categoria: "A", titulo: "Exame prático — Categoria A",
  cenas: [{
    id: "inicio", titulo: "Início do exame", imagem: "", tipo: "foto",
    perguntas: [{ id: "capacete", enunciado: "O que fazer enquanto se desloca até a moto?",
      alternativas: ["Subir na moto diretamente e dar a partida", "Colocar o capacete, prender a correia jugular e abaixar a viseira", "Ligar a chave de ignição e subir na moto", "Ajustar apenas os retrovisores antes de ir"],
      correta: 1, explicacao: "Antes de iniciar a condução, coloque e ajuste corretamente o capacete e a viseira. Confira as orientações do examinador e as regras locais." }]
  }]
};
export const percursoCarro: Percurso = {
 id: "categoria-b-inicial", categoria: "B", titulo: "Reconhecimento do percurso — Categoria B",
 cenas: ["patio","1","2","3","4"].map((id, i) => ({
  id, titulo: i === 0 ? "Pátio de exame" : "Ponto " + i,
  imagem: "/percurso/carro/" + id + ".jpg", tipo: "foto" as const, perguntas: []
 }))
};
