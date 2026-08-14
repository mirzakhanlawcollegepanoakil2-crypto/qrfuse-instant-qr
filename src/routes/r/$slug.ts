import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";

import type { Database } from "@/integrations/supabase/types";
import { PUBLIC_BACKEND_KEY, PUBLIC_BACKEND_URL } from "@/lib/public-backend-config";

function publicClient() {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? PUBLIC_BACKEND_URL;
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ??
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
    PUBLIC_BACKEND_KEY;
  return createClient<Database>(url, key, {
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

function deviceFrom(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobi|iphone|android/.test(ua)) return "mobile";
  if (!ua) return "unknown";
  return "desktop";
}

/** Coarse, non-reversible visitor fingerprint: rotates daily, never stores IPs. */
async function visitorHash(ip: string, userAgent: string): Promise<string> {
  const day = new Date().toISOString().slice(0, 10);
  const data = new TextEncoder().encode(`${ip}|${userAgent}|${day}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

export const Route = createFileRoute("/r/$slug")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const headers = request.headers;
        const userAgent = headers.get("user-agent") ?? "";
        const ip =
          headers.get("cf-connecting-ip") ??
          headers.get("x-real-ip") ??
          (headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() ??
          "";
        const country = headers.get("cf-ipcountry") ?? headers.get("x-vercel-ip-country") ?? "";
        const referrer = headers.get("referer") ?? "";

        const { data, error } = await publicClient().rpc("record_scan", {
          _slug: params.slug,
          _visitor_hash: await visitorHash(ip, userAgent),
          _country: country.slice(0, 8),
          _device: deviceFrom(userAgent),
          _referrer: referrer,
        });

        if (error || !data) {
          return new Response("This short link is not active.", {
            status: 404,
            headers: { "content-type": "text/plain; charset=utf-8" },
          });
        }

        return new Response(null, {
          status: 302,
          headers: { location: data, "cache-control": "no-store" },
        });
      },
    },
  },
});
