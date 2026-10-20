import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";

import { QrThumb } from "@/components/dashboard/QrThumb";
import { downloadBlob, exportPng, exportSvg } from "@/components/qr/qr-export";
import { defaultStyle } from "@/components/qr/qr-style";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";
import {
  deleteCode as deleteCodeFn,
  getCodeAnalytics as getCodeAnalyticsFn,
  getPlanState as getPlanStateFn,
  listMyCodes as listMyCodesFn,
  saveCode as saveCodeFn,
  startTrial as startTrialFn,
} from "@/lib/dynamic-codes.functions";
import type { CodeAnalytics, PlanState } from "@/lib/dynamic-codes.server";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: `Dashboard – ${BRAND.name}` },
      { name: "description", content: "Manage your dynamic QR codes and scan analytics." },
      { property: "og:title", content: `Dashboard – ${BRAND.name}` },
      { property: "og:description", content: "Manage your dynamic QR codes and scan analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Dashboard,
});

interface CodeRow {
  id: string;
  slug: string;
  name: string;
  destination_url: string;
  is_active: boolean;
  scan_count: number;
  created_at: string;
  updated_at: string;
}

const surface =
  "rounded-3xl border border-border bg-card shadow-[0_1px_2px_oklch(0_0_0/0.25),0_12px_36px_-24px_oklch(0_0_0/0.6)]";
const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary";
const ghostBtn =
  "inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-50";

function Dashboard() {
  const navigate = useNavigate();
  const listCodes = useServerFn(listMyCodesFn);
  const getPlan = useServerFn(getPlanStateFn);
  const startTrial = useServerFn(startTrialFn);
  const saveCode = useServerFn(saveCodeFn);
  const removeCode = useServerFn(deleteCodeFn);
  const loadAnalytics = useServerFn(getCodeAnalyticsFn);

  const [plan, setPlan] = useState<PlanState | null>(null);
  const [codes, setCodes] = useState<CodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<CodeRow | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [form, setForm] = useState({ name: "", destination_url: "", slug: "" });
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ name: string; analytics: CodeAnalytics } | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [planState, rows] = await Promise.all([getPlan({}), listCodes({})]);
      setPlan(planState);
      setCodes(rows as CodeRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, [getPlan, listCodes]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const shortBase = useMemo(
    () => (typeof window === "undefined" ? BRAND.siteUrl : window.location.origin),
    [],
  );

  const totals = useMemo(() => {
    const scans = codes.reduce((sum, row) => sum + (row.scan_count ?? 0), 0);
    return {
      total: codes.length,
      dynamic: codes.length,
      scans,
      active: codes.filter((row) => row.is_active).length,
    };
  }, [codes]);

  const canCreate = Boolean(plan?.hasPremium) && (plan?.used ?? 0) < (plan?.limit ?? 0);
  const redirectUrl = (slug: string) => `${shortBase}/r/${slug}`;

  function openComposer(row?: CodeRow) {
    setNotice(null);
    setError(null);
    setEditing(row ?? null);
    setForm(
      row
        ? { name: row.name, destination_url: row.destination_url, slug: row.slug }
        : { name: "", destination_url: "", slug: "" },
    );
    setComposerOpen(true);
  }

  function closeComposer() {
    setComposerOpen(false);
    setEditing(null);
    setForm({ name: "", destination_url: "", slug: "" });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await saveCode({
        data: {
          id: editing?.id ?? null,
          name: form.name,
          destination_url: form.destination_url,
          slug: form.slug || null,
          is_active: editing ? editing.is_active : true,
        },
      });
      setNotice(editing ? "Destination updated — the printed QR keeps working." : "Dynamic QR created.");
      closeComposer();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the code.");
    } finally {
      setSaving(false);
    }
  }

  async function mutate(row: CodeRow, patch: Partial<CodeRow>, message: string) {
    setError(null);
    setNotice(null);
    setPendingId(row.id);
    try {
      await saveCode({
        data: {
          id: row.id,
          name: patch.name ?? row.name,
          destination_url: patch.destination_url ?? row.destination_url,
          slug: row.slug,
          is_active: patch.is_active ?? row.is_active,
        },
      });
      setNotice(message);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the code.");
    } finally {
      setPendingId(null);
    }
  }

  async function duplicate(row: CodeRow) {
    setError(null);
    setNotice(null);
    setPendingId(row.id);
    try {
      await saveCode({
        data: {
          id: null,
          name: `${row.name} copy`.slice(0, 80),
          destination_url: row.destination_url,
          slug: null,
          is_active: row.is_active,
        },
      });
      setNotice("Duplicated with a fresh short link.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not duplicate the code.");
    } finally {
      setPendingId(null);
    }
  }

  async function destroy(row: CodeRow) {
    setError(null);
    setNotice(null);
    setPendingId(row.id);
    try {
      await removeCode({ data: { id: row.id } });
      if (editing?.id === row.id) closeComposer();
      if (selected?.name === row.name) setSelected(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the code.");
    } finally {
      setPendingId(null);
    }
  }

  async function download(row: CodeRow, format: "png" | "svg") {
    setError(null);
    setPendingId(row.id);
    try {
      const value = redirectUrl(row.slug);
      const blob =
        format === "png"
          ? await exportPng(value, defaultStyle, 1024)
          : await exportSvg(value, defaultStyle, 1024);
      downloadBlob(blob, `${row.slug}.${format}`);
      setNotice(`Downloaded ${row.name} as ${format.toUpperCase()}.`);
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setPendingId(null);
    }
  }

  async function openAnalytics(row: CodeRow) {
    setError(null);
    setPendingId(row.id);
    try {
      const result = await loadAnalytics({ data: { id: row.id } });
      setSelected({ name: row.name, analytics: result.analytics });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load analytics.");
    } finally {
      setPendingId(null);
    }
  }

  async function copyLink(row: CodeRow) {
    try {
      await navigator.clipboard.writeText(redirectUrl(row.slug));
      setNotice("Short link copied.");
    } catch {
      setError("Clipboard is unavailable in this browser.");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="h-8 w-52 animate-pulse rounded-xl bg-muted" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
        <div className="mt-6 h-64 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
      <header className="flex flex-wrap items-end gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your QR library
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Dynamic codes keep the same printed artwork forever — change the destination, pause it, or
            follow scans in real time.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Static generator
          </Link>
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </header>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-3.5 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {notice ? (
        <p aria-live="polite" className="mt-6 rounded-2xl border border-primary/30 bg-primary/10 p-3.5 text-sm text-primary">
          {notice}
        </p>
      ) : null}

      <section aria-label="Overview" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total QR codes" value={totals.total} hint="Saved in your library" />
        <StatCard label="Dynamic QR codes" value={totals.dynamic} hint="Editable destinations" />
        <StatCard label="Total scans" value={totals.scans} hint="All time, all codes" />
        <StatCard label="Active codes" value={totals.active} hint="Currently redirecting" />
      </section>

      <section className={`mt-6 ${surface} p-6 sm:p-7`}>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Plan</p>
            <p className="mt-1 text-lg font-semibold capitalize text-foreground">{plan?.plan ?? "free"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Dynamic allowance
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {plan?.used ?? 0} <span className="text-muted-foreground">/ {plan?.limit ?? 0}</span>
            </p>
          </div>
          {plan?.trialEndsAt ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Trial ends
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {new Date(plan.trialEndsAt).toLocaleDateString()}
              </p>
            </div>
          ) : null}
          <div className="ml-auto flex flex-wrap gap-2">
            {!plan?.hasPremium && !plan?.trialUsed ? (
              <button
                type="button"
                onClick={async () => {
                  setError(null);
                  try {
                    setPlan(await startTrial({}));
                    setNotice("Trial started — dynamic QR codes unlocked for 14 days.");
                    await refresh();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Could not start the trial.");
                  }
                }}
                className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Start 14-day free trial
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => openComposer()}
              disabled={!canCreate}
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              New dynamic QR
            </button>
          </div>
        </div>
        {!plan?.hasPremium ? (
          <p className="mt-5 border-t border-border pt-5 text-sm leading-relaxed text-muted-foreground">
            Static QR codes stay free forever in the{" "}
            <Link to="/" className="font-semibold text-primary hover:underline">
              generator
            </Link>
            . Dynamic codes — editable destinations plus scan analytics — need an active trial or Pro plan.
          </p>
        ) : null}
      </section>

      {composerOpen ? (
        <section className={`mt-6 ${surface} p-6 sm:p-7`}>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              {editing ? `Edit “${editing.name}”` : "New dynamic QR code"}
            </h2>
            <button
              type="button"
              onClick={closeComposer}
              className="ml-auto text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
          <form onSubmit={submit} className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-foreground">
              Name
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Menu poster"
                required
              />
            </label>
            <label className="block text-sm font-semibold text-foreground">
              Short link
              <input
                className={inputClass}
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="auto-generated"
              />
              <span className="mt-1.5 block text-xs font-normal text-muted-foreground">
                {shortBase}/r/{form.slug || "your-code"}
              </span>
            </label>
            <label className="block text-sm font-semibold text-foreground sm:col-span-2">
              Destination URL
              <input
                className={inputClass}
                value={form.destination_url}
                onChange={(e) => setForm({ ...form, destination_url: e.target.value })}
                placeholder="https://example.com/menu"
                required
              />
              <span className="mt-1.5 block text-xs font-normal text-muted-foreground">
                The QR encodes your {BRAND.name} short link, so you can change this any time.
              </span>
            </label>
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={saving || (!editing && !canCreate)}
                className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving…" : editing ? "Save changes" : "Create dynamic code"}
              </button>
              <button
                type="button"
                onClick={closeComposer}
                className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section aria-label="Your dynamic codes" className="mt-10">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">Dynamic codes</h2>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {codes.length}
          </span>
        </div>

        {codes.length === 0 ? (
          <div className={`mt-4 ${surface} flex flex-col items-center px-6 py-14 text-center`}>
            <span aria-hidden="true" className="grid size-14 place-items-center rounded-2xl bg-secondary text-2xl">
              ⧉
            </span>
            <h3 className="mt-5 text-base font-semibold text-foreground">No dynamic codes yet</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {plan?.hasPremium
                ? "Create your first dynamic code — print it once, then repoint it whenever your campaign changes."
                : "Start your free trial to create codes whose destination you can edit after printing."}
            </p>
            <button
              type="button"
              onClick={() => openComposer()}
              disabled={!canCreate}
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Create dynamic QR
            </button>
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 lg:grid-cols-2">
            {codes.map((row) => (
              <li key={row.id} className={`${surface} p-5`}>
                <div className="flex gap-5">
                  <QrThumb data={redirectUrl(row.slug)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className="truncate text-base font-semibold text-foreground">{row.name}</p>
                      <span
                        className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          row.is_active
                            ? "bg-primary/15 text-primary"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {row.is_active ? "Active" : "Paused"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void copyLink(row)}
                      className="mt-1.5 block max-w-full truncate text-left text-sm font-medium text-primary hover:underline"
                    >
                      /r/{row.slug}
                    </button>
                    <p className="mt-1 truncate text-sm text-muted-foreground">→ {row.destination_url}</p>
                    <p className="mt-3 text-sm text-muted-foreground">
                      <span className="text-lg font-bold text-foreground">{row.scan_count}</span> scans ·
                      created {new Date(row.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                  <button type="button" onClick={() => void openAnalytics(row)} className={ghostBtn} disabled={pendingId === row.id}>
                    Analytics
                  </button>
                  <button type="button" onClick={() => openComposer(row)} className={ghostBtn}>
                    Edit
                  </button>
                  <button type="button" onClick={() => void download(row, "png")} className={ghostBtn} disabled={pendingId === row.id}>
                    PNG
                  </button>
                  <button type="button" onClick={() => void download(row, "svg")} className={ghostBtn} disabled={pendingId === row.id}>
                    SVG
                  </button>
                  <button type="button" onClick={() => void duplicate(row)} className={ghostBtn} disabled={pendingId === row.id}>
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => void mutate(row, { is_active: !row.is_active }, row.is_active ? "Code paused." : "Code resumed.")}
                    className={ghostBtn}
                    disabled={pendingId === row.id}
                  >
                    {row.is_active ? "Pause" : "Resume"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void destroy(row)}
                    className="inline-flex h-9 items-center rounded-xl border border-destructive/40 px-3 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                    disabled={pendingId === row.id}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected ? (
        <section className={`mt-8 ${surface} p-6 sm:p-7`}>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Scan analytics — {selected.name}</h2>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="ml-auto text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <StatCard label="All time" value={selected.analytics.total} />
            <StatCard label="Last 7 days" value={selected.analytics.last7} />
            <StatCard label="Last 30 days" value={selected.analytics.last30} />
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground">Last 30 days</h3>
            <div className="mt-3 flex h-28 items-end gap-1" aria-hidden="true">
              {selected.analytics.daily.map((day) => {
                const max = Math.max(1, ...selected.analytics.daily.map((d) => d.count));
                return (
                  <span
                    key={day.date}
                    title={`${day.date}: ${day.count}`}
                    className="flex-1 rounded-t bg-primary/70 transition-[height]"
                    style={{ height: `${Math.max(3, (day.count / max) * 100)}%` }}
                  />
                );
              })}
            </div>
          </div>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <Breakdown title="Devices" rows={selected.analytics.devices} />
            <Breakdown title="Countries" rows={selected.analytics.countries} />
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Privacy first: {BRAND.name} never stores raw IP addresses — only coarse, rotating visitor
            hashes.
          </p>
        </section>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className={`${surface} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No scans recorded yet.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex justify-between gap-3 text-sm">
                <span className="truncate capitalize text-muted-foreground">{row.label}</span>
                <span className="font-semibold text-foreground">{row.count}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                <span className="block h-full rounded-full bg-primary" style={{ width: `${(row.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
