import { useState } from "react";
import type { Percurso } from "@/lib/percurso/types";
import { validarPercurso } from "@/lib/percurso/types";

export function SimuladorPercurso({ percurso }: { percurso: Percurso }) {
  validarPercurso(percurso);
  const [indice, setIndice] = useState(0);
  const [questao, setQuestao] = useState(0);
  const [resposta, setResposta] = useState<number | null>(null);
  const [iniciado, setIniciado] = useState(false);
  const cena = percurso.cenas[indice];
  const pergunta = cena?.perguntas[questao];
  if (!cena) return <p>Este percurso ainda não possui cenas.</p>;
  const avancar = () => { setResposta(null); if (questao + 1 < cena.perguntas.length) setQuestao(questao + 1); else { setQuestao(0); setIndice(Math.min(indice + 1, percurso.cenas.length - 1)); } };
  return <section className="mx-auto flex min-h-screen max-w-4xl flex-col bg-slate-950 text-white">
    <header className="flex items-center justify-between p-4"><h1 className="text-lg font-bold">{percurso.titulo}</h1><span>{indice + 1} / {percurso.cenas.length}</span></header>
    <div className="relative flex min-h-[50vh] flex-1 items-center justify-center overflow-hidden bg-slate-900">
      {cena.imagem ? <img src={cena.imagem} alt={cena.titulo} className="h-full max-h-[75vh] w-full object-contain" /> : <p className="p-8 text-center text-slate-300">Imagem do local ainda não cadastrada.</p>}
      <div className="absolute bottom-3 flex gap-4">
        <button className="rounded-full bg-black/70 px-5 py-3 disabled:opacity-30" disabled={!iniciado || indice === 0} onClick={() => {setIndice(indice-1);setQuestao(0);setResposta(null);}}>← Anterior</button>
        <button className="rounded-full bg-black/70 px-5 py-3 disabled:opacity-30" disabled={!iniciado || indice === percurso.cenas.length-1 || (!!pergunta && resposta === null)} onClick={avancar}>Próximo →</button>
      </div>
    </div>
    <div className="rounded-t-3xl bg-slate-800 p-5">
      <h2 className="mb-3 text-center text-xl font-semibold">{cena.titulo}</h2>
      {!iniciado ? <button className="w-full rounded-xl bg-green-600 p-4 font-bold" onClick={()=>setIniciado(true)}>Iniciar percurso</button> :
       pergunta ? <div><p className="mb-4 text-lg">{pergunta.enunciado}</p><div className="grid gap-3">{pergunta.alternativas.map((a,i)=><button key={i} disabled={resposta!==null} onClick={()=>setResposta(i)} className={`rounded-xl border p-3 text-left ${resposta!==null && i===pergunta.correta?"border-green-400 bg-green-900/50":resposta===i?"border-red-400":"border-slate-500"}`}>{String.fromCharCode(65+i)}) {a}</button>)}</div>{resposta!==null && <div role="status" className="mt-4"><p>{resposta===pergunta.correta?"Resposta correta!":"Vamos revisar."} {pergunta.explicacao}</p><button className="mt-3 rounded-xl bg-green-600 px-6 py-3" onClick={avancar}>Continuar</button></div>}</div> :
       <p className="text-center text-slate-300">Observe o cenário e avance quando estiver pronto.</p>}
    </div>
  </section>;
}
