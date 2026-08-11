import { createClient } from "@supabase/supabase-js";
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import type { Database } from "@/integrations/supabase/types";

function createPublicKeyFetch(publicKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }
    if (publicKey.startsWith("sb_") && headers.get("Authorization") === `Bearer ${publicKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", publicKey);
    return fetch(input, { ...init, headers });
  };
}

export const requireVercelCompatibleAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
    const publicKey =
      process.env["SUPABASE_PUBLISHABLE_KEY"] ??
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
      process.env["VITE_SUPABASE_ANON_KEY"];

    if (!url || !publicKey) {
      throw new Error(
        "The database connection is missing from this deployment. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel, then redeploy.",
      );
    }

    const authHeader = getRequest().headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Unauthorized: sign in again and retry.");
    }
    const token = authHeader.slice(7);
    if (!token) throw new Error("Unauthorized: sign in again and retry.");

    const supabase = createClient<Database>(url, publicKey, {
      global: {
        fetch: createPublicKeyFetch(publicKey),
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) throw new Error("Unauthorized: your session has expired.");

    return next({
      context: {
        supabase,
        userId: data.user.id,
      },
    });
  },
);