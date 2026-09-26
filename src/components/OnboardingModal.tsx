import { useState } from "react";
import { SERVICES, type Category, type ServiceKey } from "@/lib/mock/types";

/** Onboarding em modal com backdrop-blur: escolha de serviço e categoria. */
export function OnboardingModal({
  onConfirm,
}: {
  onConfirm: (service: ServiceKey, category: Category) => void;
}) {
  const [service, setService] = useState<ServiceKey | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  const keys = Object.keys(SERVICES) as ServiceKey[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xl">
      <div className="w-full max-w-3xl rounded-2xl glass-panel p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-accent">Onboarding</p>
        <h2 className="mt-2 text-2xl sm:text-3xl">Qual serviço você precisa?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A escolha define quais categorias de CNH ficam disponíveis para você.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {keys.map((key) => {
            const item = SERVICES[key];
            const selected = service === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setService(key);
                  setCategory(null);
                }}
                className={`rounded-xl border p-4 text-left transition-all duration-200 ${
                  selected
                    ? "border-accent bg-accent/15 shadow-glow"
                    : "border-border bg-white/5 hover:-translate-y-0.5 hover:border-accent/60"
                }`}
              >
                <p className="font-display text-base">{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                <p className="mt-3 text-xs text-accent">Categorias: {item.categories.join(", ")}</p>
              </button>
            );
          })}
        </div>

        {service ? (
          <div className="mt-6">
            <p className="text-sm font-medium">Escolha a categoria</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SERVICES[service].categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`h-11 min-w-14 rounded-lg border px-4 font-display text-sm transition-all ${
                    category === cat
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-white/5 hover:border-primary/70"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex justify-end">
          <button
            disabled={!service || !category}
            onClick={() => service && category && onConfirm(service, category)}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-40 hover:not-disabled:-translate-y-0.5"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
