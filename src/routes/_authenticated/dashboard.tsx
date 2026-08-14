import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";

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

const card = "rounded-2xl border border-border bg-card p-5";
const input =
  "mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary";

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
  const [editing, setEditing] = useState<CodeRow | null>(null);
  const [form, setForm] = useState({ name: "", destination_url: "", slug: "" });
  const [saving, setSaving] = useState(false);
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

  function edit(row: CodeRow) {
    setEditing(row);
    setForm({ name: row.name, destination_url: row.destination_url, slug: row.slug });
  }

  function resetForm() {
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
      resetForm();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the code.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(row: CodeRow) {
    setError(null);
    try {
      await saveCode({
        data: {
          id: row.id,
          name: row.name,
          destination_url: row.destination_url,
          slug: row.slug,
          is_active: !row.is_active,
        },
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the code.");
    }
  }

  async function destroy(row: CodeRow) {
    setError(null);
    try {
      await removeCode({ data: { id: row.id } });
      if (editing?.id === row.id) resetForm();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the code.");
    }
  }

  async function openAnalytics(row: CodeRow) {
    setError(null);
    try {
      const result = await loadAnalytics({ data: { id: row.id } });
      setSelected({ name: row.name, analytics: result.analytics });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load analytics.");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading your dashboard…
      </div>
    );
  }

  const canCreate = Boolean(plan?.hasPremium) && (plan?.used ?? 0) < (plan?.limit ?? 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dynamic QR dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit destinations any time without reprinting your code.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          className="ml-auto h-10 rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Sign out
        </button>
      </div>

      {error ? (
        <p className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className={`mt-6 ${card}`}>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Current plan</p>
            <p className="text-lg font-semibold capitalize text-foreground">{plan?.plan ?? "free"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Dynamic codes</p>
            <p className="text-lg font-semibold text-foreground">
              {plan?.used ?? 0} / {plan?.limit ?? 0}
            </p>
          </div>
          {plan?.trialEndsAt ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Trial ends</p>
              <p className="text-lg font-semibold text-foreground">
                {new Date(plan.trialEndsAt).toLocaleDateString()}
              </p>
            </div>
          ) : null}
          {!plan?.hasPremium && !plan?.trialUsed ? (
            <button
              type="button"
              onClick={async () => {
                setError(null);
                try {
                  setPlan(await startTrial({}));
                  await refresh();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Could not start the trial.");
                }
              }}
              className="ml-auto h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start 14-day free trial
            </button>
          ) : null}
        </div>
        {!plan?.hasPremium ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Static QR codes stay free forever on the{" "}
            <a href="/" className="text-primary hover:underline">
              generator
            </a>
            . Dynamic codes with editable destinations and scan analytics need an active trial or Pro
            plan.
          </p>
        ) : null}
      </section>

      <section className={`mt-6 ${card}`}>
        <h2 className="text-base font-semibold text-foreground">
          {editing ? "Edit dynamic code" : "New dynamic code"}
        </h2>
        <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-foreground">
            Name
            <input
              className={input}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Menu poster"
              required
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Short link
            <input
              className={input}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto-generated"
            />
          </label>
          <label className="block text-sm font-medium text-foreground sm:col-span-2">
            Destination URL
            <input
              className={input}
              value={form.destination_url}
              onChange={(e) => setForm({ ...form, destination_url: e.target.value })}
              placeholder="https://example.com/menu"
              required
            />
          </label>
          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={saving || (!editing && !canCreate)}
              className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Create dynamic code"}
            </button>
            {editing ? (
              <button
                type="button"
                onClick={resetForm}
                className="h-11 rounded-xl border border-border px-5 text-sm font-medium text-muted-foreground"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-semibold text-foreground">Your codes</h2>
        {codes.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No dynamic codes yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {codes.map((row) => (
              <li key={row.id} className={`${card} flex flex-wrap items-center gap-4`}>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{row.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {shortBase}/r/{row.slug} → {row.destination_url}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">{row.scan_count} scans</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    row.is_active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {row.is_active ? "Active" : "Paused"}
                </span>
                <div className="flex gap-2 text-sm">
                  <button type="button" onClick={() => void openAnalytics(row)} className="text-primary hover:underline">
                    Analytics
                  </button>
                  <button type="button" onClick={() => edit(row)} className="text-muted-foreground hover:text-primary">
                    Edit
                  </button>
                  <button type="button" onClick={() => void toggleActive(row)} className="text-muted-foreground hover:text-primary">
                    {row.is_active ? "Pause" : "Resume"}
                  </button>
                  <button type="button" onClick={() => void destroy(row)} className="text-destructive hover:underline">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected ? (
        <section className={`mt-6 ${card}`}>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-foreground">Scans — {selected.name}</h2>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="ml-auto text-sm text-muted-foreground hover:text-primary"
            >
              Close
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Stat label="All time" value={selected.analytics.total} />
            <Stat label="Last 7 days" value={selected.analytics.last7} />
            <Stat label="Last 30 days" value={selected.analytics.last30} />
          </div>
          <div className="mt-5 flex h-24 items-end gap-1" aria-hidden="true">
            {selected.analytics.daily.map((day) => {
              const max = Math.max(1, ...selected.analytics.daily.map((d) => d.count));
              return (
                <span
                  key={day.date}
                  title={`${day.date}: ${day.count}`}
                  className="flex-1 rounded-t bg-primary/70"
                  style={{ height: `${Math.max(2, (day.count / max) * 100)}%` }}
                />
              );
            })}
          </div>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <Breakdown title="Devices" rows={selected.analytics.devices} />
            <Breakdown title="Countries" rows={selected.analytics.countries} />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {rows.map((row) => (
            <li key={row.label} className="flex justify-between gap-3">
              <span className="truncate">{row.label}</span>
              <span className="text-foreground">{row.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
