import { createFileRoute } from "@tanstack/react-router";
import { PUBLIC_BACKEND_KEY, PUBLIC_BACKEND_URL } from "@/lib/public-backend-config";

/** Serves blog featured images via the public-read storage policy (works without server secrets). */
export const Route = createFileRoute("/api/public/blog-image/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params._splat ?? "").replace(/^\/+/, "");
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });

        const base = process.env.SUPABASE_URL || PUBLIC_BACKEND_URL;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY || PUBLIC_BACKEND_KEY;
        const res = await fetch(
          `${base}/storage/v1/object/authenticated/blog-images/${path.split("/").map(encodeURIComponent).join("/")}`,
          { headers: { apikey: key } },
        );
        if (!res.ok || !res.body) return new Response("Not found", { status: 404 });

        return new Response(res.body, {
          headers: {
            "Content-Type": res.headers.get("content-type") || "image/jpeg",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
