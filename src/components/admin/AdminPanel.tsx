import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  adminSetupAvailable,
  checkAdminAccess,
  claimFirstAdmin,
  deletePost,
  getDashboardStats,
  listAdminPosts,
  savePost,
} from "@/lib/admin.functions";

type PostRow = Awaited<ReturnType<typeof listAdminPosts>>[number];
type Stats = Awaited<ReturnType<typeof getDashboardStats>>;

const input =
  "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15";
const primaryBtn =
  "inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50";
const ghostBtn =
  "inline-flex min-h-11 items-center justify-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-secondary disabled:opacity-50";

const emptyPost = {
  id: null as string | null,
  title: "",
  slug: "",
  description: "",
  content: "",
  category: "General",
  tags: [] as string[],
  image_url: "",
  image_alt: "",
  seo_title: "",
  seo_description: "",
  author: "QRFUSE Team",
  reading_time: 4,
  published: false,
};
type PostDraft = typeof emptyPost;

export function AdminPanel({
  signedIn,
  onAuthChange,
}: {
  signedIn: boolean;
  onAuthChange: () => Promise<void> | void;
}) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [setupAvailable, setSetupAvailable] = useState(false);
  const [tab, setTab] = useState<"dashboard" | "posts">("dashboard");
  const [error, setError] = useState("");

  const evaluate = useCallback(async () => {
    if (!signedIn) {
      setIsAdmin(null);
      const { available } = await adminSetupAvailable();
      setSetupAvailable(available);
      return;
    }
    try {
      const { isAdmin: ok } = await checkAdminAccess();
      if (!ok) {
        const { available } = await adminSetupAvailable();
        if (available) {
          await claimFirstAdmin();
          setIsAdmin(true);
          return;
        }
      }
      setIsAdmin(ok);
    } catch {
      setIsAdmin(false);
    }
  }, [signedIn]);

  useEffect(() => {
    void evaluate();
  }, [evaluate]);

  if (!signedIn) {
    return <AdminLogin setupAvailable={setupAvailable} onAuthChange={onAuthChange} />;
  }

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-sm text-muted-foreground">This account does not have admin access.</p>
        <button
          type="button"
          className={ghostBtn}
          onClick={async () => {
            await supabase.auth.signOut();
            await onAuthChange();
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground">QRFUSE Admin</h1>
          <div className="flex gap-2">
            <button
              type="button"
              className={tab === "dashboard" ? primaryBtn : ghostBtn}
              onClick={() => setTab("dashboard")}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={tab === "posts" ? primaryBtn : ghostBtn}
              onClick={() => setTab("posts")}
            >
              Blog CMS
            </button>
            <button
              type="button"
              className={ghostBtn}
              onClick={async () => {
                await supabase.auth.signOut();
                await onAuthChange();
              }}
            >
              Sign out
            </button>
          </div>
        </div>
        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
        {tab === "dashboard" ? <Dashboard onError={setError} /> : <PostsManager onError={setError} />}
      </div>
    </div>
  );
}

function AdminLogin({
  setupAvailable,
  onAuthChange,
}: {
  setupAvailable: boolean;
  onAuthChange: () => Promise<void> | void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        setMessage("Account created. Sign in to continue.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await onAuthChange();
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)]"
      >
        <h1 className="text-xl font-bold text-foreground">
          {mode === "signup" ? "Create admin account" : "Admin sign in"}
        </h1>
        <input
          type="email"
          required
          placeholder="Email"
          className={input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password"
          className={input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={busy} className={`${primaryBtn} w-full`}>
          {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
        {setupAvailable ? (
          <button
            type="button"
            className="w-full text-xs text-muted-foreground underline"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          >
            {mode === "signup" ? "Back to sign in" : "First time? Create the admin account"}
          </button>
        ) : null}
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </form>
    </div>
  );
}

function Dashboard({ onError }: { onError: (message: string) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err: unknown) => onError(err instanceof Error ? err.message : "Failed to load stats."));
  }, [onError]);

  if (!stats) return <p className="text-sm text-muted-foreground">Loading statistics…</p>;

  const cards = [
    { label: "Total QR codes", value: stats.total },
    { label: "Generated today", value: stats.today },
    { label: "Last 7 days", value: stats.week },
    { label: "Most used type", value: stats.topType ?? "—" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">By type</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {stats.byType.length === 0 ? <li>No data yet.</li> : null}
            {stats.byType.map((row) => (
              <li key={row.type} className="flex justify-between">
                <span className="capitalize">{row.type}</span>
                <span className="tabular-nums text-foreground">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Recent activity</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {stats.recent.length === 0 ? <li>No activity yet.</li> : null}
            {stats.recent.map((row) => (
              <li key={row.id} className="flex justify-between gap-3">
                <span className="capitalize">{row.qr_type}</span>
                <span className="tabular-nums">{new Date(row.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PostsManager({ onError }: { onError: (message: string) => void }) {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [draft, setDraft] = useState<PostDraft | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    listAdminPosts()
      .then(setPosts)
      .catch((err: unknown) => onError(err instanceof Error ? err.message : "Failed to load posts."));
  }, [onError]);

  useEffect(load, [load]);

  const edit = (post: PostRow) =>
    setDraft({
      id: post.id,
      title: post.title,
      slug: post.slug,
      description: post.description,
      content: post.content,
      category: post.category,
      tags: post.tags ?? [],
      image_url: post.image_url,
      image_alt: post.image_alt,
      seo_title: post.seo_title,
      seo_description: post.seo_description,
      author: post.author,
      reading_time: post.reading_time,
      published: post.published,
    });

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error } = await supabase.storage.from("blog-images").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      setDraft((prev) => (prev ? { ...prev, image_url: `/api/public/blog-image/${path}` } : prev));
    } catch (err) {
      onError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    setBusy(true);
    try {
      await savePost({ data: draft });
      setDraft(null);
      load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Saving failed.");
    } finally {
      setBusy(false);
    }
  };

  if (draft) {
    const field = <K extends keyof PostDraft>(key: K, value: PostDraft[K]) =>
      setDraft({ ...draft, [key]: value });

    return (
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm text-muted-foreground">
            Title
            <input className={input} value={draft.title} onChange={(e) => field("title", e.target.value)} required />
          </label>
          <label className="space-y-1 text-sm text-muted-foreground">
            Slug
            <input className={input} value={draft.slug} onChange={(e) => field("slug", e.target.value)} placeholder="auto from title" />
          </label>
          <label className="space-y-1 text-sm text-muted-foreground">
            Category
            <input className={input} value={draft.category} onChange={(e) => field("category", e.target.value)} />
          </label>
          <label className="space-y-1 text-sm text-muted-foreground">
            Tags (comma separated)
            <input
              className={input}
              value={draft.tags.join(", ")}
              onChange={(e) => field("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
            />
          </label>
          <label className="space-y-1 text-sm text-muted-foreground">
            Author
            <input className={input} value={draft.author} onChange={(e) => field("author", e.target.value)} />
          </label>
          <label className="space-y-1 text-sm text-muted-foreground">
            Reading time (min)
            <input
              type="number"
              min={1}
              max={60}
              className={input}
              value={draft.reading_time}
              onChange={(e) => field("reading_time", Number(e.target.value))}
            />
          </label>
        </div>

        <label className="block space-y-1 text-sm text-muted-foreground">
          Short description
          <textarea rows={2} className={input} value={draft.description} onChange={(e) => field("description", e.target.value)} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm text-muted-foreground">
            SEO title
            <input className={input} value={draft.seo_title} onChange={(e) => field("seo_title", e.target.value)} />
          </label>
          <label className="space-y-1 text-sm text-muted-foreground">
            Meta description
            <input className={input} value={draft.seo_description} onChange={(e) => field("seo_description", e.target.value)} />
          </label>
          <label className="space-y-1 text-sm text-muted-foreground">
            Featured image
            <input
              type="file"
              accept="image/*"
              className={input}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
              }}
            />
          </label>
          <label className="space-y-1 text-sm text-muted-foreground">
            Image alt text
            <input className={input} value={draft.image_alt} onChange={(e) => field("image_alt", e.target.value)} />
          </label>
        </div>
        <label className="block space-y-1 text-sm text-muted-foreground">
          Image URL
          <input className={input} value={draft.image_url} onChange={(e) => field("image_url", e.target.value)} />
        </label>

        <label className="block space-y-1 text-sm text-muted-foreground">
          Content (Markdown)
          <textarea rows={14} className={`${input} font-mono`} value={draft.content} onChange={(e) => field("content", e.target.value)} />
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={draft.published} onChange={(e) => field("published", e.target.checked)} />
          Published
        </label>

        <div className="flex gap-3">
          <button type="submit" disabled={busy} className={primaryBtn}>
            {busy ? "Saving…" : "Save post"}
          </button>
          <button type="button" className={ghostBtn} onClick={() => setDraft(null)}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <button type="button" className={primaryBtn} onClick={() => setDraft({ ...emptyPost })}>
        New post
      </button>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card">
        {posts.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No posts yet.</p>
        ) : null}
        {posts.map((post) => (
          <div key={post.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">{post.title}</p>
              <p className="text-xs text-muted-foreground">
                /blog/{post.slug} · {post.category} · {post.published ? "Published" : "Draft"}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" className={ghostBtn} onClick={() => edit(post)}>
                Edit
              </button>
              <button
                type="button"
                className={ghostBtn}
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await savePost({
                      data: {
                        id: post.id,
                        title: post.title,
                        slug: post.slug,
                        description: post.description,
                        content: post.content,
                        category: post.category,
                        tags: post.tags ?? [],
                        image_url: post.image_url,
                        image_alt: post.image_alt,
                        seo_title: post.seo_title,
                        seo_description: post.seo_description,
                        author: post.author,
                        reading_time: post.reading_time,
                        published: !post.published,
                      },
                    });
                    load();
                  } catch (err) {
                    onError(err instanceof Error ? err.message : "Update failed.");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {post.published ? "Unpublish" : "Publish"}
              </button>
              <button
                type="button"
                className={ghostBtn}
                disabled={busy}
                onClick={async () => {
                  if (!confirm(`Delete "${post.title}"?`)) return;
                  setBusy(true);
                  try {
                    await deletePost({ data: { id: post.id } });
                    load();
                  } catch (err) {
                    onError(err instanceof Error ? err.message : "Delete failed.");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}