import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";

const DESCRIPTION =
  "Sign in to manage dynamic QR codes, edit destinations at any time and track scan analytics.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: `Sign in – ${BRAND.name}` },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: `Sign in – ${BRAND.name}` },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) void navigate({ to: "/dashboard", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) void navigate({ to: "/dashboard", replace: true });
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (signUpError) throw signUpError;
        setNotice("Account created. Check your inbox if confirmation is required, then sign in.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-5 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {mode === "signin" ? "Sign in" : "Create your account"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{DESCRIPTION}</p>

      <form onSubmit={submit} className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>
        <label className="block text-sm font-medium text-foreground">
          Password
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {notice ? <p className="text-sm text-primary">{notice}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-5 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        {mode === "signin" ? "No account? Create one" : "Already have an account? Sign in"}
      </button>

      <Link to="/" className="mt-8 text-sm text-muted-foreground transition-colors hover:text-primary">
        ← Back to the free generator
      </Link>
    </div>
  );
}
