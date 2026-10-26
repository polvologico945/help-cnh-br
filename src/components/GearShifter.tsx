import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

/**
 * <GearShifter /> — câmbio manual de carro (vista de cima, grade em H), interativo.
 *
 * Interação:
 * - Arraste a manopla: ela só anda pelos trilhos (sai da marcha → ponto morto → outra coluna).
 *   Ao soltar, engata a marcha mais próxima ou volta para o ponto morto, como uma mola.
 * - Toque/clique num número: a manopla vai sozinha até aquela marcha.
 * - Teclado (com foco no câmbio): 1–5, R, N, ou ↑/↓ para subir/reduzir.
 *
 * Automático:
 * - `autoPlay` (padrão: ligado quando `gear` não é passado) troca as marchas sozinho,
 *   mas PAUSA assim que a pessoa interage e só retoma após `resumeAfter` ms parado.
 *
 * Controlado: passe `gear` + `onShift` para usar como seletor de verdade.
 * Respeita prefers-reduced-motion. Autocontido (SVG + Tailwind).
 */

export type Gear = "N" | "1" | "2" | "3" | "4" | "5" | "R";

type GearShifterProps = {
  /** Marcha controlada de fora. */
  gear?: Gear;
  /** Chamado quando a PESSOA troca de marcha (arrasto, clique ou teclado). */
  onShift?: (gear: Gear) => void;
  /** Troca automática. Padrão: true se `gear` não for passado. */
  autoPlay?: boolean;
  /** Intervalo entre trocas automáticas (ms). */
  interval?: number;
  /** Tempo parado após uma interação até o automático voltar (ms). */
  resumeAfter?: number;
  /** Texto abaixo do câmbio. */
  label?: string;
  /** Mostra a dica "arraste a manopla…". */
  hint?: boolean;
  /** Tamanho em px. */
  size?: number;
};

type Point = { x: number; y: number };

// ---------- Geometria (viewBox 200x200) ----------
const COLS = [60, 100, 140] as const;
const SCREW_POSITIONS = [[30, 30], [170, 30], [30, 170], [170, 170]] as const;
const TOP = 54;
const MID = 100; // linha do ponto morto
const BOT = 146;
const KNOB_R = 17;

const GEAR_POS: Record<Gear, Point> = {
  N: { x: COLS[1], y: MID },
  "1": { x: COLS[0], y: TOP },
  "2": { x: COLS[0], y: BOT },
  "3": { x: COLS[1], y: TOP },
  "4": { x: COLS[1], y: BOT },
  "5": { x: COLS[2], y: TOP },
  R: { x: COLS[2], y: BOT },
};

const LABELS: Exclude<Gear, "N">[] = ["1", "2", "3", "4", "5", "R"];
const TOP_GEARS: Gear[] = ["1", "3", "5"];
const BOT_GEARS: Gear[] = ["2", "4", "R"];
const KEY_ORDER: Gear[] = ["R", "N", "1", "2", "3", "4", "5"];

/** Sobe as marchas e reduz de volta — carro acelerando e freando. */
const LOADING_SEQUENCE: Gear[] = ["1", "2", "3", "4", "5", "4", "3", "2"];

const GATE_PATH =
  `M${COLS[0]} ${TOP}V${BOT}` +
  `M${COLS[1]} ${TOP}V${BOT}` +
  `M${COLS[2]} ${TOP}V${BOT}` +
  `M${COLS[0]} ${MID}H${COLS[2]}`;

// ---------- Helpers ----------
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const near = (a: number, b: number, tol = 0.5) => Math.abs(a - b) < tol;
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const nearestColIndex = (x: number) => {
  let best = 0;
  COLS.forEach((c, i) => {
    if (Math.abs(x - c) < Math.abs(x - (COLS[best] ?? COLS[1]))) best = i;
  });
  return best;
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Caminho válido dentro da grade: sai para o ponto morto, atravessa, entra na marcha. */
function route(from: Point, to: Point): Point[] {
  const pts: Point[] = [];
  if (!near(from.x, to.x)) {
    if (!near(from.y, MID)) pts.push({ x: from.x, y: MID });
    pts.push({ x: to.x, y: MID });
  }
  const last = pts[pts.length - 1] ?? from;
  if (!near(last.x, to.x) || !near(last.y, to.y)) pts.push(to);
  return pts;
}

/**
 * Move a manopla em direção ao ponteiro SEM sair dos trilhos, em passos de até 4 unidades.
 * O ponteiro "escolhe" a coluna pela posição X dele:
 * - dentro de uma coluna: se o ponteiro está na mesma coluna, anda na vertical até ele;
 *   se está em outra coluna, a manopla desce/sobe até o ponto morto para poder virar.
 * - no ponto morto: anda na horizontal até a coluna do ponteiro e então entra nela.
 * Resultado: arrastar na diagonal do 1 para o 3 faz o "L" pela grade, como num carro.
 */
function dragAlongGate(start: Point, target: Point): Point {
  const STEP = 4;
  const lane = COLS[nearestColIndex(target.x)] ?? COLS[1];
  const targetOnNeutral = Math.abs(target.y - MID) < 12;
  let cur = { ...start };

  for (let i = 0; i < 120; i += 1) {
    const prev = cur;

    if (near(cur.y, MID)) {
      // No ponto morto
      if (targetOnNeutral) {
        // ponteiro na linha do neutro: acompanha livremente na horizontal
        const gx = clamp(target.x, COLS[0], COLS[2]);
        cur = { x: cur.x + clamp(gx - cur.x, -STEP, STEP), y: MID };
      } else if (!near(cur.x, lane)) {
        // vai até a coluna escolhida pelo ponteiro
        cur = { x: cur.x + clamp(lane - cur.x, -STEP, STEP), y: MID };
      } else {
        // alinhado: entra na coluna
        const gy = clamp(target.y, TOP, BOT);
        cur = { x: lane, y: cur.y + clamp(gy - cur.y, -STEP, STEP) };
      }
    } else {
      // Dentro de uma coluna: só vertical
      const col = COLS[nearestColIndex(cur.x)] ?? COLS[1];
      const gy = near(col, lane) && !targetOnNeutral ? clamp(target.y, TOP, BOT) : MID;
      let ny = cur.y + clamp(gy - cur.y, -STEP, STEP);
      if ((cur.y - MID) * (ny - MID) < 0) ny = MID; // para no neutro para poder virar
      cur = { x: col, y: ny };
    }

    if (dist(prev, cur) < 0.01) break; // chegou ou encostou no fim do trilho
  }
  return cur;
}

/** Ao soltar: engata se passou do meio do caminho, senão a mola volta ao ponto morto. */
function settle(p: Point): Gear {
  if (Math.abs(p.y - MID) > 20) {
    const i = nearestColIndex(p.x);
    return p.y < MID ? (TOP_GEARS[i] ?? "1") : (BOT_GEARS[i] ?? "2");
  }
  return "N";
}

/** Toque em um número ou na ponta do trilho. */
function gearAt(p: Point): Gear | null {
  for (const g of LABELS) {
    const gp = GEAR_POS[g];
    const labelY = gp.y < MID ? gp.y - 20 : gp.y + 24;
    if (dist(p, gp) < 18 || dist(p, { x: gp.x, y: labelY }) < 14) return g;
  }
  return null;
}

// ---------- Componente ----------
export function GearShifter({
  gear,
  onShift,
  autoPlay,
  interval = 1100,
  resumeAfter = 4000,
  label,
  hint = true,
  size = 240,
}: GearShifterProps) {
  const auto = autoPlay ?? gear === undefined;

  const [pos, setPos] = useState<Point>(GEAR_POS.N);
  const [current, setCurrent] = useState<Gear>(gear ?? "N");
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);

  const posRef = useRef<Point>(GEAR_POS.N);
  const currentRef = useRef<Gear>(gear ?? "N");
  const rafRef = useRef(0);
  const draggingRef = useRef(false);
  const grabOffset = useRef<Point>({ x: 0, y: 0 });
  const lastInteraction = useRef(0);
  const stepRef = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);

  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const place = useCallback((p: Point) => {
    posRef.current = p;
    setPos(p);
  }, []);

  /** Anima a manopla até a marcha, trecho a trecho pela grade. */
  const animateTo = useCallback(
    (goal: Gear, msPerStep = 240) => {
      cancelAnimationFrame(rafRef.current);
      const target = GEAR_POS[goal];
      if (prefersReducedMotion()) {
        place(target);
        return;
      }
      const legs = route(posRef.current, target);
      if (legs.length === 0) return;

      let leg = 0;
      let from = posRef.current;
      let start: number | null = null;
      let duration = 0;

      const tick = (now: number) => {
        const to = legs[leg];
        if (!to) return;
        if (start === null) {
          start = now;
          duration = Math.max(110, (msPerStep * dist(from, to)) / 46);
        }
        const t = Math.min(1, (now - start) / duration);
        const e = easeInOut(t);
        place({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e });

        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        leg += 1;
        if (leg < legs.length) {
          from = to;
          start = null;
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [place],
  );

  const shift = useCallback(
    (next: Gear, byUser: boolean) => {
      currentRef.current = next;
      setCurrent(next);
      animateTo(next, byUser ? 160 : 240);
      if (byUser) {
        lastInteraction.current = Date.now();
        setTouched(true);
        // retoma o automático a partir da marcha escolhida
        const i = LOADING_SEQUENCE.indexOf(next);
        stepRef.current = i >= 0 ? i : -1;
        if (next !== "N") navigator.vibrate?.(12);
        onShift?.(next);
      }
    },
    [animateTo, onShift],
  );

  // Modo controlado
  useEffect(() => {
    if (gear !== undefined && gear !== currentRef.current) shift(gear, false);
  }, [gear, shift]);

  // Automático (pausa enquanto a pessoa mexe)
  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => {
      if (draggingRef.current) return;
      if (Date.now() - lastInteraction.current < resumeAfter) return;
      stepRef.current = (stepRef.current + 1) % LOADING_SEQUENCE.length;
      shift(LOADING_SEQUENCE[stepRef.current] ?? "N", false);
    }, interval);
    return () => window.clearInterval(id);
  }, [auto, interval, resumeAfter, shift]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // ---------- Ponteiro (mouse e toque) ----------
  function toSvg(e: ReactPointerEvent<SVGSVGElement>): Point {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return posRef.current;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: pt.x, y: pt.y };
  }

  function onPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    const p = toSvg(e);
    lastInteraction.current = Date.now();

    if (dist(p, posRef.current) <= KNOB_R + 8) {
      cancelAnimationFrame(rafRef.current);
      grabOffset.current = { x: posRef.current.x - p.x, y: posRef.current.y - p.y };
      draggingRef.current = true;
      setDragging(true);
      setTouched(true);
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    const g = gearAt(p);
    if (g) shift(g, true);
  }

  function onPointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    if (!draggingRef.current) return;
    lastInteraction.current = Date.now();
    const p = toSvg(e);
    const target = { x: p.x + grabOffset.current.x, y: p.y + grabOffset.current.y };
    place(dragAlongGate(posRef.current, target));
  }

  function endDrag(e: ReactPointerEvent<SVGSVGElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    shift(settle(posRef.current), true);
  }

  // ---------- Teclado ----------
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const key = e.key.toUpperCase();
    let next: Gear | null = null;
    if (["1", "2", "3", "4", "5", "R", "N"].includes(key)) next = key as Gear;
    const i = KEY_ORDER.indexOf(currentRef.current);
    if (e.key === "ArrowUp" || e.key === "ArrowRight")
      next = KEY_ORDER[Math.min(i + 1, KEY_ORDER.length - 1)] ?? "N";
    if (e.key === "ArrowDown" || e.key === "ArrowLeft") next = KEY_ORDER[Math.max(i - 1, 0)] ?? "N";
    if (next) {
      e.preventDefault();
      shift(next, true);
    }
  }

  // ---------- Render ----------
  const goal = GEAR_POS[current];
  const engaged = current !== "N" && !dragging && dist(pos, goal) < 1;
  const lean = { x: (pos.x - MID) / 46, y: (pos.y - MID) / 46 };
  const lift = dragging ? 1.08 : 1;

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        tabIndex={0}
        role="group"
        aria-label={`Câmbio, marcha ${current === "N" ? "ponto morto" : current}. Use 1 a 5, R, N ou as setas.`}
        onKeyDown={onKeyDown}
        className="glass-panel rounded-3xl p-5 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-brand-yellow/70"
      >
        <svg
          ref={svgRef}
          viewBox="0 0 200 200"
          width={size}
          height={size}
          aria-hidden="true"
          className="block select-none"
          style={{ touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <defs>
            <linearGradient id={`${uid}-plate`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2f3136" />
              <stop offset="55%" stopColor="#1a1b1f" />
              <stop offset="100%" stopColor="#101114" />
            </linearGradient>
            <radialGradient id={`${uid}-knob`} cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#56585e" />
              <stop offset="50%" stopColor="#1e1f22" />
              <stop offset="100%" stopColor="#070708" />
            </radialGradient>
            <filter id={`${uid}-blur`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
          </defs>

          {/* Console */}
          <rect
            x={12}
            y={12}
            width={176}
            height={176}
            rx={30}
            fill={`url(#${uid}-plate)`}
            stroke="rgba(255,255,255,0.08)"
          />
          {SCREW_POSITIONS.map(([cx, cy]) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx} cy={cy} r={3.5} fill="#0b0b0d" stroke="rgba(255,255,255,0.12)" />
              <path
                d={`M${cx - 2} ${cy + 2}L${cx + 2} ${cy - 2}`}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth={0.8}
              />
            </g>
          ))}

          {/* Grade em H */}
          <path
            d={GATE_PATH}
            transform="translate(0 1.2)"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={16}
            strokeLinecap="round"
            fill="none"
          />
          <path d={GATE_PATH} stroke="#050506" strokeWidth={13} strokeLinecap="round" fill="none" />

          {/* Trilho engatado acende */}
          {engaged ? (
            <path
              d={`M${goal.x} ${MID}V${goal.y}`}
              strokeWidth={3}
              strokeLinecap="round"
              className="stroke-brand-yellow"
              opacity={0.7}
              filter={`url(#${uid}-glow)`}
            />
          ) : null}

          {/* Números (clicáveis) */}
          {LABELS.map((g) => {
            const p = GEAR_POS[g];
            const active = engaged && current === g;
            return (
              <text
                key={g}
                x={p.x}
                y={p.y < MID ? p.y - 20 : p.y + 29}
                textAnchor="middle"
                fontSize={14}
                fontWeight={700}
                className={`cursor-pointer ${
                  active ? "fill-brand-yellow" : "fill-white/35 hover:fill-brand-yellow/70"
                }`}
                style={{ transition: "fill 200ms" }}
              >
                {g}
              </text>
            );
          })}

          {/* Sombra (maior quando a manopla está "levantada" no arrasto) */}
          <ellipse
            cx={pos.x + 3 + lean.x * 3 + (dragging ? 2 : 0)}
            cy={pos.y + 6 + lean.y * 3 + (dragging ? 3 : 0)}
            rx={KNOB_R * lift}
            ry={(KNOB_R - 2) * lift}
            fill="#000"
            opacity={dragging ? 0.45 : 0.55}
            filter={`url(#${uid}-blur)`}
            pointerEvents="none"
          />

          {/* Manopla */}
          <g
            transform={`translate(${pos.x} ${pos.y}) scale(${lift})`}
            className={dragging ? "cursor-grabbing" : "cursor-grab"}
            style={{ transition: "transform 120ms" }}
          >
            {/* área de toque maior que a manopla (dedo no celular) */}
            <circle r={KNOB_R + 8} fill="transparent" />
            <circle r={KNOB_R} fill={`url(#${uid}-knob)`} />
            <circle
              r={KNOB_R}
              fill="none"
              strokeWidth={1.5}
              className={engaged || dragging ? "stroke-brand-yellow" : "stroke-white/10"}
              style={{ transition: "stroke 200ms" }}
            />
            <circle r={12.5} fill="none" stroke="rgba(255,255,255,0.06)" />
            <path
              d="M-5.5 -5.5V5.5M0 -5.5V5.5M5.5 -5.5V5.5M-5.5 0H5.5"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={1.3}
              strokeLinecap="round"
              fill="none"
            />
            <ellipse
              cx={-6}
              cy={-7}
              rx={6}
              ry={3.2}
              fill="#fff"
              opacity={0.16}
              transform="rotate(-30 -6 -7)"
            />
          </g>
        </svg>
      </div>

      {/* Painel digital */}
      <div className="flex flex-col items-center gap-1" aria-live="polite">
        <span className="font-display text-3xl tabular-nums text-brand-yellow">{current}</span>
        {label ? <p className="text-caption text-muted-foreground">{label}</p> : null}
        {hint && !touched ? (
          <p className="text-xs text-muted-foreground/70">Arraste a manopla ou toque numa marcha</p>
        ) : null}
      </div>
    </div>
  );
}

export default GearShifter;
