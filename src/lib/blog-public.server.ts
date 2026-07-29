import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { BLOG_POSTS, type BlogPost } from "./blog";

type PostRow = Database["public"]["Tables"]["blog_posts"]["Row"];

function publicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
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
export async function listPublishedPosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await publicClient()
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (error) throw error;
    const dbPosts = (data ?? []).map(rowToPost);
    const slugs = new Set(dbPosts.map((p) => p.slug));
    return sortByDate([...dbPosts, ...BLOG_POSTS.filter((p) => !slugs.has(p.slug))]);
  } catch {
    return sortByDate(BLOG_POSTS);
  }
}

export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  const posts = await listPublishedPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}