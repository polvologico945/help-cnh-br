/**
 * <SVGBoundary /> — cenário de fundo 100% SVG inline (sem imagens externas):
 * estrada em perspectiva, 3 carros prata, 3 motos vermelhas e uma CNH estilizada.
 */
export function SVGBoundary() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <radialGradient id="glow" cx="50%" cy="20%" r="60%">
              <stop offset="0%" stopColor="#0A31A6" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#040814" stopOpacity="0" />
            </radialGradient>
            <stop offset="0%" stopColor="#081235" />
            <stop offset="60%" stopColor="#050A1C" />
            <stop offset="100%" stopColor="#03060F" />
          </linearGradient>
          <linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b2030" />
            <stop offset="100%" stopColor="#2f3542" />
          </linearGradient>
          <linearGradient id="silver" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2f5f7" />
            <stop offset="100%" stopColor="#8b949c" />
          </linearGradient>
          <linearGradient id="red" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff5a4d" />
            <stop offset="100%" stopColor="#b4170c" />
          </linearGradient>
          <linearGradient id="cnh" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#009C3B" />
            <stop offset="55%" stopColor="#0A31A6" />
            <stop offset="100%" stopColor="#061134" />
          </linearGradient>
        </defs>

        <rect width="1440" height="900" fill="url(#sky)" />
        <rect width="1440" height="900" fill="url(#glow)" />

        {/* Horizonte e estrada em perspectiva */}
        <path d="M0 470 H1440" stroke="#0A31A6" strokeOpacity="0.5" strokeWidth="2" />
        <path d="M600 470 L300 900 H1140 L840 470 Z" fill="url(#asphalt)" />
        <path d="M600 470 L300 900" stroke="#FFDF00" strokeOpacity="0.85" strokeWidth="5" />
        <path d="M840 470 L1140 900" stroke="#FFDF00" strokeOpacity="0.85" strokeWidth="5" />
        <path
          className="road-dash"
          d="M720 470 V900"
          stroke="#f4f7fa"
          strokeOpacity="0.9"
          strokeWidth="7"
        />
        <path d="M660 470 L510 900" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="3" />
        <path d="M780 470 L930 900" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="3" />

        {/* 3 carros prata */}
        <g className="drift-slow">
          <Car x={250} y={620} scale={1} />
          <Car x={1090} y={700} scale={1.15} />
          <Car x={170} y={790} scale={1.3} />
        </g>

        {/* 3 motos vermelhas */}
        <g className="drift-fast">
          <Moto x={430} y={560} scale={0.85} />
          <Moto x={980} y={600} scale={0.95} />
          <Moto x={620} y={830} scale={1.2} />
        </g>

        {/* CNH estilizada */}
        <g className="float-card" transform="translate(1080 220) rotate(-6)">
          <rect width="260" height="164" rx="18" fill="url(#cnh)" opacity="0.95" />
          <rect x="14" y="14" width="232" height="136" rx="12" fill="none" stroke="#FFDF00" strokeOpacity="0.7" />
          <rect x="30" y="38" width="64" height="80" rx="8" fill="#e9eef2" opacity="0.85" />
          <circle cx="62" cy="66" r="16" fill="#0A31A6" opacity="0.6" />
          <path d="M38 112c6-18 42-18 48 0z" fill="#0A31A6" opacity="0.6" />
          <rect x="110" y="40" width="118" height="10" rx="5" fill="#FFDF00" opacity="0.9" />
          <rect x="110" y="60" width="96" height="8" rx="4" fill="#ffffff" opacity="0.65" />
          <rect x="110" y="78" width="110" height="8" rx="4" fill="#ffffff" opacity="0.45" />
          <rect x="110" y="96" width="70" height="8" rx="4" fill="#ffffff" opacity="0.45" />
          <text x="110" y="128" fill="#FFDF00" fontSize="14" fontWeight="700" letterSpacing="3">
            CNH
          </text>
        </g>

        {/* Semáforo decorativo */}
        <g transform="translate(120 240)">
          <rect x="0" y="0" width="46" height="120" rx="14" fill="#10141f" stroke="#2c3345" />
          <circle cx="23" cy="28" r="12" fill="#b4170c" opacity="0.5" />
          <circle cx="23" cy="60" r="12" fill="#FFDF00" opacity="0.6" />
          <circle cx="23" cy="92" r="12" fill="#009C3B" />
          <rect x="18" y="120" width="10" height="120" fill="#10141f" />
        </g>
      </svg>
    </div>
  );
}

function Car({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="60" cy="58" rx="62" ry="10" fill="#000" opacity="0.35" />
      <path
        d="M8 46c0-10 6-14 14-16l10-14c3-4 8-6 13-6h30c5 0 10 2 13 6l10 14c8 2 14 6 14 16 0 6-4 8-9 8H17c-5 0-9-2-9-8z"
        fill="url(#silver)"
      />
      <path d="M36 20h48l8 12H28z" fill="#0A31A6" opacity="0.55" />
      <circle cx="30" cy="54" r="9" fill="#12151c" />
      <circle cx="30" cy="54" r="4" fill="#9aa3ab" />
      <circle cx="92" cy="54" r="9" fill="#12151c" />
      <circle cx="92" cy="54" r="4" fill="#9aa3ab" />
      <rect x="6" y="38" width="8" height="5" rx="2" fill="#FFDF00" />
      <rect x="108" y="38" width="8" height="5" rx="2" fill="#b4170c" />
    </g>
  );
}

function Moto({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="44" cy="50" rx="42" ry="7" fill="#000" opacity="0.3" />
      <circle cx="16" cy="42" r="12" fill="#12151c" />
      <circle cx="16" cy="42" r="5" fill="#8f979e" />
      <circle cx="72" cy="42" r="12" fill="#12151c" />
      <circle cx="72" cy="42" r="5" fill="#8f979e" />
      <path d="M16 42 L36 24 H56 L72 42" stroke="url(#red)" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M34 24c6-8 18-8 24 0z" fill="url(#red)" />
      <rect x="28" y="16" width="16" height="6" rx="3" fill="#e9eef2" />
      <path d="M58 22 L68 12" stroke="#d8dee3" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}
