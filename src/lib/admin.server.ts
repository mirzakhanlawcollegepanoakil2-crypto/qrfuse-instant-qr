import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export type AdminClient = SupabaseClient<Database>;

export interface PostInput {
  id?: string | null;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  image_url: string;
  image_alt: string;
  seo_title: string;
  seo_description: string;
  author: string;
  reading_time: number;
  published: boolean;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

export function normalizePostInput(raw: PostInput): PostInput {
  const title = String(raw.title ?? "").trim().slice(0, 200);
  if (!title) throw new Error("A title is required.");
  const slug = slugify(raw.slug || title);
  if (!slug) throw new Error("A valid slug is required.");
  return {
    id: raw.id ?? null,
    title,
    slug,
    description: String(raw.description ?? "").trim().slice(0, 500),
    content: String(raw.content ?? "").slice(0, 100000),
    category: String(raw.category ?? "General").trim().slice(0, 60) || "General",
    tags: (raw.tags ?? []).map((t) => String(t).trim().slice(0, 40)).filter(Boolean).slice(0, 12),
    image_url: String(raw.image_url ?? "").trim().slice(0, 1000),
    image_alt: String(raw.image_alt ?? "").trim().slice(0, 200),
    seo_title: String(raw.seo_title ?? "").trim().slice(0, 200),
    seo_description: String(raw.seo_description ?? "").trim().slice(0, 300),
    author: String(raw.author ?? "QRFUSE Team").trim().slice(0, 80) || "QRFUSE Team",
    reading_time: Math.min(60, Math.max(1, Number(raw.reading_time) || 4)),
    published: Boolean(raw.published),
  };
}

/** Throws unless the calling user holds the admin role. */
export async function assertAdmin(supabase: AdminClient, userId: string): Promise<void> {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || !data) throw new Error("Forbidden: admin access required.");
}

export interface DashboardStats {
  total: number;
  today: number;
  week: number;
  topType: string | null;
  byType: { type: string; count: number }[];
  recent: { id: string; qr_type: string; created_at: string }[];
}

export async function buildDashboardStats(supabase: AdminClient): Promise<DashboardStats> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalRes, todayRes, weekRes, typesRes, recentRes] = await Promise.all([
    supabase.from("qr_events").select("*", { count: "exact", head: true }),
    supabase
      .from("qr_events")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfDay.toISOString()),
    supabase
      .from("qr_events")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString()),
    supabase.from("qr_events").select("qr_type").limit(5000),
    supabase.from("qr_events").select("id, qr_type, created_at").order("created_at", { ascending: false }).limit(15),
  ]);

  const counts = new Map<string, number>();
  for (const row of typesRes.data ?? []) {
    counts.set(row.qr_type, (counts.get(row.qr_type) ?? 0) + 1);
  }
  const byType = [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total: totalRes.count ?? 0,
    today: todayRes.count ?? 0,
    week: weekRes.count ?? 0,
    topType: byType[0]?.type ?? null,
    byType: byType.slice(0, 8),
    recent: recentRes.data ?? [],
  };
}