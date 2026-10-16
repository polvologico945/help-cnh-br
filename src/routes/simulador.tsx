import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SimuladorPercurso } from "@/components/percurso/SimuladorPercurso";
import { percursoCarro, percursoMoto } from "@/lib/percurso/dados";
export const Route = createFileRoute("/simulador")({ component: Pagina });
function Pagina() {
 const [categoria,setCategoria]=useState<"A"|"B">("B");
 return <main><nav className="flex justify-center gap-3 bg-slate-950 p-4 text-white"><button onClick={()=>setCategoria("A")} aria-pressed={categoria==="A"}>Categoria A</button><button onClick={()=>setCategoria("B")} aria-pressed={categoria==="B"}>Categoria B</button></nav><SimuladorPercurso key={categoria} percurso={categoria==="A"?percursoMoto:percursoCarro}/></main>;
}
