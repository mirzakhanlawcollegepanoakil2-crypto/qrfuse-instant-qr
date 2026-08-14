import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export type Client = SupabaseClient<Database>;

export interface CodeInput {
  id?: string | null;
  name: string;
  destination_url: string;
  slug?: string | null;
  is_active?: boolean;
  style?: Record<string, unknown>;
}

const SLUG_RE = /^[a-z0-9-]{4,32}$/;

export function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
}

export function randomSlug(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  for (const byte of bytes) out += alphabet[byte % alphabet.length];
  return out;
}

export function normalizeDestination(value: string): string {
  const url = String(value ?? "").trim();
  if (!/^https?:\/\//i.test(url)) throw new Error("Destination must start with http:// or https://");
  if (url.length > 2000) throw new Error("Destination link is too long.");
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes(".")) throw new Error("Destination host looks invalid.");
  } catch {
    throw new Error("Destination must be a valid link.");
  }
  return url;
}

export function normalizeCodeInput(raw: CodeInput): Required<Pick<CodeInput, "name" | "destination_url">> & {
  id: string | null;
  slug: string | null;
  is_active: boolean;
  style: Record<string, unknown>;
} {
  const name = String(raw.name ?? "").trim().slice(0, 80) || "Untitled code";
  const slugCandidate = raw.slug ? normalizeSlug(raw.slug) : null;
  if (slugCandidate && !SLUG_RE.test(slugCandidate)) {
    throw new Error("Short link must be 4-32 characters using letters, numbers or hyphens.");
  }
  return {
    id: raw.id ?? null,
    name,
    destination_url: normalizeDestination(raw.destination_url),
    slug: slugCandidate,
    is_active: raw.is_active === undefined ? true : Boolean(raw.is_active),
    style: (raw.style ?? {}) as Record<string, unknown>,
  };
}

export interface PlanState {
  plan: "free" | "trial" | "pro";
  trialEndsAt: string | null;
  trialUsed: boolean;
  limit: number;
  used: number;
  hasPremium: boolean;
}

export async function loadPlanState(supabase: Client, userId: string): Promise<PlanState> {
  const [{ data: ent }, { data: premium }, { count }] = await Promise.all([
    supabase
      .from("entitlements")
      .select("plan, trial_ends_at, trial_started_at, dynamic_qr_limit")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.rpc("has_premium_access", { _user_id: userId }),
    supabase.from("dynamic_codes").select("*", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  return {
    plan: (ent?.plan ?? "free") as PlanState["plan"],
    trialEndsAt: ent?.trial_ends_at ?? null,
    trialUsed: Boolean(ent?.trial_started_at),
    limit: ent?.dynamic_qr_limit ?? 0,
    used: count ?? 0,
    hasPremium: Boolean(premium),
  };
}

/** Premium gate for every dynamic-code mutation. */
export async function assertCanUseDynamic(supabase: Client, userId: string): Promise<PlanState> {
  const state = await loadPlanState(supabase, userId);
  if (!state.hasPremium) {
    throw new Error("Dynamic QR codes need an active trial or Pro plan.");
  }
  return state;
}

export interface CodeAnalytics {
  total: number;
  last7: number;
  last30: number;
  daily: { date: string; count: number }[];
  devices: { label: string; count: number }[];
  countries: { label: string; count: number }[];
}

export async function buildCodeAnalytics(
  supabase: Client,
  codeId: string,
): Promise<CodeAnalytics> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const { data, error } = await supabase
    .from("scans")
    .select("scanned_at, device, country")
    .eq("code_id", codeId)
    .gte("scanned_at", since.toISOString())
    .order("scanned_at", { ascending: false })
    .limit(5000);
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const dayBuckets = new Map<string, number>();
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    dayBuckets.set(d, 0);
  }
  const devices = new Map<string, number>();
  const countries = new Map<string, number>();
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let last7 = 0;

  for (const row of rows) {
    const day = row.scanned_at.slice(0, 10);
    if (dayBuckets.has(day)) dayBuckets.set(day, (dayBuckets.get(day) ?? 0) + 1);
    if (new Date(row.scanned_at).getTime() >= weekAgo) last7 += 1;
    const device = row.device || "unknown";
    devices.set(device, (devices.get(device) ?? 0) + 1);
    const country = row.country || "unknown";
    countries.set(country, (countries.get(country) ?? 0) + 1);
  }

  const rank = (map: Map<string, number>) =>
    [...map.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

  const { count: total } = await supabase
    .from("scans")
    .select("*", { count: "exact", head: true })
    .eq("code_id", codeId);

  return {
    total: total ?? rows.length,
    last7,
    last30: rows.length,
    daily: [...dayBuckets.entries()].map(([date, count]) => ({ date, count })),
    devices: rank(devices),
    countries: rank(countries),
  };
}
