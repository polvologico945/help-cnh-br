import { useEffect, useMemo, useState } from "react";
import { emitMockSocketLink, scanQrCode } from "@/lib/mock/api";
import type { Role } from "@/lib/mock/types";
import { GearShifter } from "./GearShifter";

/** Matriz determinística a partir do token — visual de QR Code, sem dependências. */
function useQrMatrix(token: string, size = 21) {
  return useMemo(() => {
    const cells: boolean[] = [];
    let hash = 2166136261;
    for (const ch of token) {
      hash ^= ch.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    for (let i = 0; i < size * size; i += 1) {
      hash ^= hash << 13;
      hash ^= hash >>> 17;
      hash ^= hash << 5;
      cells.push(((hash >>> 0) % 100) < 46);
    }
    return cells;
  }, [token, size]);
}

const FINDER = (row: number, col: number, size: number) => {
  const inBox = (r0: number, c0: number) =>
    row >= r0 && row < r0 + 7 && col >= c0 && col < c0 + 7;
  return inBox(0, 0) || inBox(0, size - 7) || inBox(size - 7, 0);
};

export function QrLinkPanel({
  studentName,
  onLinked,
}: {
  studentName: string;
  onLinked: (payload: { instructorName: string; instructorId: string }) => void;
}) {
  const [token, setToken] = useState("");
  const [readerRole, setReaderRole] = useState<Role>("INSTRUCTOR");
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    // UUID temporário: no backend real seria emitido pelo servidor com TTL curto,
    // assinado e de uso único (one-time token) para impedir replay.
    setToken(crypto.randomUUID());
    const interval = setInterval(() => setToken(crypto.randomUUID()), 120_000);
    return () => clearInterval(interval);
  }, []);

  const size = 21;
  const cells = useQrMatrix(token || "init", size);

  async function handleScan() {
    setError(null);
    setScanning(true);
    const result = await scanQrCode({ token, readerRole });
    setScanning(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    emitMockSocketLink({ instructorName: result.instructorName, instructorId: result.instructorId });
    onLinked({ instructorName: result.instructorName, instructorId: result.instructorId });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-2xl glass-panel p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-accent">Vínculo com instrutor</p>
        <h2 className="mt-2 text-2xl">Mostre este QR Code ao seu instrutor</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Token temporário de <span className="font-mono text-accent">{studentName}</span>, renovado
          a cada 2 minutos.
        </p>

        <div className="mt-6 flex justify-center">
          <div className="rounded-2xl bg-white p-4 shadow-glow">
            <div
              className="grid gap-[2px]"
              style={{ gridTemplateColumns: `repeat(${size}, 10px)` }}
              role="img"
              aria-label="QR Code de vínculo"
            >
              {cells.map((filled, index) => {
                const row = Math.floor(index / size);
                const col = index % size;
                const finder = FINDER(row, col, size);
                const on = finder
                  ? (row % 7 === 0 || row % 7 === 6 || col % 7 === 0 || col % 7 === 6 ||
                      (row % 7 >= 2 && row % 7 <= 4 && col % 7 >= 2 && col % 7 <= 4))
                  : filled;
                return (
                  <span
                    key={index}
                    className="h-[10px] w-[10px] rounded-[2px]"
                    style={{ background: on ? "#050a18" : "transparent" }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-4 break-all text-center font-mono text-xs text-muted-foreground">
          {token}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-accent">Simulador de leitura</p>
        <h3 className="mt-2 text-xl">Quem está lendo o QR Code?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Somente a role INSTRUCTOR tem permissão. Qualquer outra role recebe 403.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {(["INSTRUCTOR", "STUDENT", "ADMIN"] as Role[]).map((role) => (
            <button
              key={role}
              onClick={() => setReaderRole(role)}
              className={`rounded-lg border px-4 py-2 text-sm transition-all ${
                readerRole === role
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border bg-white/5 hover:border-accent/60"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <button
          onClick={handleScan}
          disabled={scanning}
          className="btn-primary mt-6 w-full disabled:opacity-60"
        >
          {scanning ? "Lendo QR Code..." : "Simular leitura"}
        </button>

        {error ? (
          <p className="mt-4 rounded-lg border border-destructive/50 bg-destructive/15 px-3 py-2 text-sm text-destructive-foreground">
            {error}
          </p>
        ) : null}

        {scanning ? (
          <div className="mt-6 flex justify-center">
            <div className="scale-75">
              <GearShifter activeGear={2} label="Conectando" />
            </div>
          </div>
        ) : null}

        <p className="mt-6 text-xs text-muted-foreground">
          Mock de WebSocket: ao ler com sucesso, um evento destrava a tela do aluno com o nome do
          instrutor. No backend real, canal autenticado por JWT (cookie HttpOnly) e autorização da
          role validada no servidor.
        </p>
      </div>
    </div>
  );
}
