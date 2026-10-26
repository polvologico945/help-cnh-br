import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { emitMockSocketLink, scanQrCode } from "@/lib/mock/api";
import type { Role } from "@/lib/mock/types";

import { GearShifter } from "./GearShifter";

const QR_SIZE = 21;
const TOKEN_TTL_MS = 120_000;
const READER_ROLES: Role[] = ["INSTRUCTOR", "STUDENT", "ADMIN"];

/** Matriz determinística a partir do token — visual de QR Code, sem dependências. */
function useQrMatrix(token: string, size = QR_SIZE) {
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
      cells.push((hash >>> 0) % 100 < 46);
    }
    return cells;
  }, [token, size]);
}

/** Os 3 quadrados de posicionamento (cantos) de um QR Code. */
function isFinder(row: number, col: number, size: number) {
  const inBox = (r0: number, c0: number) => row >= r0 && row < r0 + 7 && col >= c0 && col < c0 + 7;
  return inBox(0, 0) || inBox(0, size - 7) || inBox(size - 7, 0);
}

function finderOn(row: number, col: number) {
  const r = row % 7;
  const c = col % 7;
  const border = r === 0 || r === 6 || c === 0 || c === 6;
  const center = r >= 2 && r <= 4 && c >= 2 && c <= 4;
  return border || center;
}

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
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    // UUID temporário: no backend real seria emitido pelo servidor com TTL curto,
    // assinado e de uso único (one-time token) para impedir replay.
    setToken(crypto.randomUUID());
    const interval = window.setInterval(() => setToken(crypto.randomUUID()), TOKEN_TTL_MS);
    return () => {
      mounted.current = false;
      window.clearInterval(interval);
    };
  }, []);

  const cells = useQrMatrix(token || "init", QR_SIZE);

  async function handleScan() {
    if (!token || scanning) return;
    setError(null);
    setScanning(true);
    try {
      const result = await scanQrCode({ token, readerRole });
      if (!mounted.current) return;
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const payload = { instructorName: result.instructorName, instructorId: result.instructorId };
      emitMockSocketLink(payload);
      onLinked(payload);
    } catch {
      if (mounted.current) setError("Não foi possível ler o QR Code. Tente novamente.");
    } finally {
      if (mounted.current) setScanning(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* QR Code do aluno */}
      <div className="glass-panel rounded-3xl p-6 sm:p-9">
        <p className="text-caption text-brand-yellow">Vínculo com instrutor</p>
        <h2 className="mt-3 font-display text-3xl leading-tight text-foreground">
          Mostre este QR Code ao seu instrutor
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Token temporário de <span className="font-semibold text-foreground">{studentName}</span>,
          renovado a cada 2 minutos.
        </p>

        <div className="mt-7 flex justify-center">
          <div className="rounded-2xl bg-white p-4 shadow-glow-green">
            <div
              className="grid gap-[2px]"
              style={{ gridTemplateColumns: `repeat(${QR_SIZE}, 10px)` }}
              role="img"
              aria-label="QR Code de vínculo"
            >
              {cells.map((filled, index) => {
                const row = Math.floor(index / QR_SIZE);
                const col = index % QR_SIZE;
                const on = isFinder(row, col, QR_SIZE) ? finderOn(row, col) : filled;
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
          {token || "Gerando token..."}
        </p>
      </div>

      {/* Simulador de leitura */}
      <div className="glass-panel rounded-3xl p-6 sm:p-9">
        <p className="text-caption text-brand-yellow">Simulador de leitura</p>
        <h3 className="mt-3 font-display text-2xl leading-tight text-foreground">
          Quem está lendo o QR Code?
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Somente a role INSTRUCTOR tem permissão. Qualquer outra role recebe 403.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {READER_ROLES.map((role) => {
            const selected = readerRole === role;
            return (
              <button
                key={role}
                type="button"
                aria-pressed={selected}
                disabled={scanning}
                onClick={() => {
                  setReaderRole(role);
                  setError(null);
                }}
                className={`h-11 rounded-xl border px-4 text-sm font-semibold transition-all duration-300 disabled:opacity-50 ${
                  selected
                    ? "border-brand-yellow bg-brand-yellow text-black"
                    : "border-border/60 bg-white/5 text-foreground hover:-translate-y-0.5 hover:border-brand-yellow/70"
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>

        <Button
          variant="hero"
          size="lg"
          className="mt-7 w-full"
          disabled={scanning || !token}
          onClick={handleScan}
        >
          {scanning ? "Lendo QR Code..." : "Simular leitura"}
        </Button>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-destructive/50 bg-destructive/15 px-3 py-2 text-sm text-destructive-foreground"
          >
            {error}
          </p>
        ) : null}

        {scanning ? (
          <div className="mt-7 flex justify-center">
            <GearShifter size={160} interval={700} label="Conectando" />
          </div>
        ) : null}

        <p className="mt-7 text-xs text-muted-foreground">
          Mock de WebSocket: ao ler com sucesso, um evento destrava a tela do aluno com o nome do
          instrutor. No backend real, canal autenticado por JWT (cookie HttpOnly) e autorização da
          role validada no servidor.
        </p>
      </div>
    </div>
  );
}

export default QrLinkPanel;
