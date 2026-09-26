import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** Install prompt do PWA (manifest-based, sem service worker em preview). */
export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!promptEvent || dismissed) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 w-[min(420px,92vw)] -translate-x-1/2 rounded-xl glass-panel p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-accent/20 p-2 text-accent">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
            <path d="M12 3a1 1 0 011 1v9.6l3.3-3.3a1 1 0 011.4 1.42l-5 5a1 1 0 01-1.4 0l-5-5A1 1 0 017.7 10.3L11 13.6V4a1 1 0 011-1zM5 19a1 1 0 011-1h12a1 1 0 110 2H6a1 1 0 01-1-1z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-display text-sm">Instale o ViaSegura</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Acesse suas aulas direto da tela inicial, com abertura instantânea.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              className="btn-accent px-3 py-1.5 text-xs hover:scale-[1.02]"
              onClick={async () => {
                await promptEvent.prompt();
                setDismissed(true);
              }}
            >
              Instalar
            </button>
            <button
              className="btn-ghost px-3 py-1.5 text-xs hover:bg-white/10"
              onClick={() => setDismissed(true)}
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
