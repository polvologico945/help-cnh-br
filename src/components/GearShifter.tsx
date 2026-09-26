/**
 * <GearShifter /> — micro-interação de câmbio 3D usada como estado de loading.
 * Conversão fiel do HTML/CSS original: hovers direcionais em .gear-touch e
 * ícones que acendem conforme a "marcha" engatada.
 */
type GearShifterProps = {
  /** Marcha destacada automaticamente (0 = nenhuma, 1..4 = topo/direita/baixo/esquerda). */
  activeGear?: 0 | 1 | 2 | 3 | 4;
  label?: string;
};

const CHEVRON_UP =
  "M512 330.66c14.93 0 29.86 4.26 40.53 14.93l277.33 234.66c27.73 23.46 29.86 64 8.53 89.6-23.46 27.73-64 29.86-89.6 8.53L512 477.86l-236.8 200.53c-27.73 23.46-68.26 19.2-89.6-8.53-23.46-27.73-19.2-68.26 8.53-89.6l277.33-234.66c10.66-10.66 25.6-14.93 40.53-14.93z";
const CHEVRON_RIGHT =
  "M135.41 100c0 2.91-.83 5.83-2.91 7.91L86.66 162.08c-4.58 5.41-12.5 5.83-17.5 1.66-5.41-4.58-5.83-12.5-1.66-17.5L106.66 100 67.5 53.75c-4.58-5.41-3.75-13.33 1.66-17.5 5.41-4.58 13.33-3.75 17.5 1.66L132.5 92.08c2.08 2.08 2.91 5 2.91 7.91z";
const CHEVRON_DOWN =
  "M100 135.41c-2.91 0-5.83-.83-7.91-2.91L37.91 86.66c-5.41-4.58-5.83-12.5-1.66-17.5 4.58-5.41 12.5-5.83 17.5-1.66L100 106.66l46.25-39.16c5.41-4.58 13.33-3.75 17.5 1.66 4.58 5.41 3.75 13.33-1.66 17.5l-54.16 45.83c-2.08 2.08-5 2.91-7.91 2.91z";
const CHEVRON_LEFT =
  "M64.58 100c0-2.91.83-5.83 2.91-7.91L113.33 37.91c4.58-5.41 12.5-5.83 17.5-1.66 5.41 4.58 5.83 12.5 1.66 17.5L93.33 100l39.16 46.25c4.58 5.41 3.75 13.33-1.66 17.5-5.41 4.58-13.33 3.75-17.5-1.66L67.5 107.91c-2.08-2.08-2.91-5-2.91-7.91z";

export function GearShifter({ activeGear = 0, label }: GearShifterProps) {
  const cls = (gear: 1 | 2 | 3 | 4) =>
    `gear-icon${activeGear === gear ? " active" : ""}`;

  return (
    <div className="flex flex-col items-center gap-10">
      <section className="gear-row h-[260px] w-[260px]">
        <div className="gear-touch" aria-hidden="true">
          <div className="t t1" />
          <div className="t t2" />
          <div className="t t3" />
          <div className="t t4" />
        </div>
        <div className="gear-container" role="img" aria-label="Alavanca de câmbio">
          <div className="around">
            <div className="handle">
              <div className="button-wrapper">
                <div className="inside">
                  <div className="dot" />
                  <div className="dot" />
                  <div className="dot" />
                  <div className="dot" />
                </div>
              </div>
            </div>
          </div>
          <svg className={cls(1)} viewBox="0 0 1024 1024" aria-hidden="true">
            <path d={CHEVRON_UP} />
          </svg>
          <svg className={cls(2)} viewBox="0 0 200 200" fill="none" aria-hidden="true">
            <path d={CHEVRON_RIGHT} />
          </svg>
          <svg className={cls(3)} viewBox="0 0 200 200" fill="none" aria-hidden="true">
            <path d={CHEVRON_DOWN} />
          </svg>
          <svg className={cls(4)} viewBox="0 0 200 200" fill="none" aria-hidden="true">
            <path d={CHEVRON_LEFT} />
          </svg>
        </div>
      </section>
      {label ? (
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      ) : null}
    </div>
  );
}
