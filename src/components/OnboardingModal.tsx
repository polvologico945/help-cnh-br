import { useState } from "react";

import { Button } from "@/components/ui/button";
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
  const categories = service ? SERVICES[service].categories : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 px-4 py-8 backdrop-blur-xl">
      <div className="glass-panel w-full max-w-2xl overflow-hidden rounded-3xl p-6 sm:p-9">
        <p className="text-caption text-brand-yellow">Primeiro acesso</p>
        <h2 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
          Qual serviço você precisa?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua escolha define as categorias de CNH disponíveis para você.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {keys.map((key) => {
            const item = SERVICES[key];
            const selected = service === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setService(key);
                  setCategory(null);
                }}
                className={`group rounded-2xl border p-4 text-left transition-all duration-300 ${
                  selected
                    ? "border-brand-green bg-brand-green/15 shadow-glow-green"
                    : "border-border/60 bg-white/5 hover:-translate-y-1 hover:border-brand-yellow/60"
                }`}
              >
                <span className="block text-sm font-semibold text-foreground">{item.label}</span>
                <span className="mt-2 block text-xs text-muted-foreground">{item.description}</span>
                <span className="mt-3 block text-xs text-brand-yellow/80">
                  Categorias: {item.categories.join(", ")}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className={`mt-7 transition-all duration-500 ${
            service ? "max-h-64 opacity-100" : "pointer-events-none max-h-0 opacity-0"
          }`}
        >
          <p className="text-caption text-muted-foreground">Categoria</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`h-12 min-w-14 rounded-xl border px-4 text-base font-semibold transition-all ${
                  category === cat
                    ? "border-brand-yellow bg-brand-yellow text-black"
                    : "border-border/60 bg-white/5 text-foreground hover:border-brand-yellow/70"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            variant="hero"
            size="lg"
            disabled={!service || !category}
            onClick={() => service && category && onConfirm(service, category)}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;