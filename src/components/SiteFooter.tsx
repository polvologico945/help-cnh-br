import { Link } from "@tanstack/react-router";

/** Footer institucional com espaço reservado para o LinkedIn do autor. */
export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-primary" />
          <span className="h-3 w-3 rounded-full bg-accent" />
          <span className="h-3 w-3 rounded-full bg-secondary" />
          <p className="font-display text-sm tracking-wide">
            Via<span className="text-accent">Segura</span> — educação de trânsito
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-accent">
            Entrar
          </Link>
          <Link to="/admin" className="transition-colors hover:text-accent">
            Painel Admin
          </Link>
          <a
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 transition-colors hover:border-accent hover:text-accent"
            aria-label="Perfil no LinkedIn"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21H17.6v-5.3c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H9z" />
            </svg>
            LinkedIn
          </a>
        </nav>
      </div>
      <p className="px-6 pb-6 text-center text-xs text-muted-foreground/70">
        Protótipo com serviços mockados no navegador — nenhum dado real é enviado a servidores.
      </p>
    </footer>
  );
}
