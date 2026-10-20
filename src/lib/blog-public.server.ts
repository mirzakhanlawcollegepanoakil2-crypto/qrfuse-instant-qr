import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { BLOG_POSTS, type BlogPost } from "./blog";
import { PUBLIC_BACKEND_KEY, PUBLIC_BACKEND_URL } from "./public-backend-config";
import { collectPages } from "./pagination";

type PostRow = Database["public"]["Tables"]["blog_posts"]["Row"];

function publicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || PUBLIC_BACKEND_KEY;
  const url = process.env.SUPABASE_URL || PUBLIC_BACKEND_URL;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
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
  });
}

export function rowToPost(row: PostRow): BlogPost {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    content: row.content,
    date: (row.published_at ?? row.created_at).slice(0, 10),
    category: row.category,
    image: row.image_url,
    imageAlt: row.image_alt || row.title,
    author: row.author,
    readingTime: row.reading_time,
    slug: row.slug,
  };
}

function sortByDate(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** Published posts from the CMS, merged with the built-in starter articles. */
export async function listPublishedPosts(options: { strict?: boolean } = {}): Promise<BlogPost[]> {
  try {
    const client = publicClient();
    const rows = await collectPages<PostRow>(async (from, to) => {
      const { data, error } = await client
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .order("id", { ascending: true })
        .range(from, to);
      if (error) throw error;
      return data ?? [];
    });
    const dbPosts = rows.map(rowToPost);
    const slugs = new Set(dbPosts.map((p) => p.slug));
    return sortByDate([...dbPosts, ...BLOG_POSTS.filter((p) => !slugs.has(p.slug))]);
  } catch (error) {
    if (options.strict) throw error;
    return sortByDate(BLOG_POSTS);
  }
}

export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  const posts = await listPublishedPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}