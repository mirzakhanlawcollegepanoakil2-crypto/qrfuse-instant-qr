import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-5">
        <Link to="/" className="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <span aria-hidden="true" className="grid size-8 place-items-center rounded-lg bg-primary">
            <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" className="text-primary-foreground" />
              <rect x="7.5" y="7.5" width="4" height="4" rx="0.6" className="text-primary-foreground" />
              <path d="M15 8.5h1.5M15 15.5h1.5M8.5 15.5H10" className="text-primary-foreground" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">
            QR<span className="text-primary">FUSE</span>
          </span>
        </Link>
        <nav aria-label="Main" className="ml-auto flex items-center gap-6 text-sm font-medium">
          <Link
            to="/blog"
            className="text-muted-foreground transition-colors hover:text-primary"
            activeProps={{ className: "text-primary" }}
          >
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
}