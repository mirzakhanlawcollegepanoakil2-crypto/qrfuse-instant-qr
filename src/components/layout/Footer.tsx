import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-bold tracking-tight text-foreground">
            QR<span className="text-primary">FUSE</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Create QR codes instantly.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link to="/privacy" className="text-muted-foreground transition-colors hover:text-primary">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-muted-foreground transition-colors hover:text-primary">
            Terms of Use
          </Link>
          <Link to="/contact" className="text-muted-foreground transition-colors hover:text-primary">
            Contact
          </Link>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-muted-foreground">
          Copyright © 2026 QRFUSE.
        </p>
      </div>
    </footer>
  );
}