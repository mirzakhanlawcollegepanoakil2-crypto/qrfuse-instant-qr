import { createServerFn } from "@tanstack/react-start";

import { getPublishedPost, listPublishedPosts } from "./blog-public.server";

export const fetchPublishedPosts = createServerFn({ method: "GET" }).handler(async () =>
  listPublishedPosts(),
);

export const fetchPublishedPost = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => ({ slug: String(input.slug).slice(0, 200) }))
  .handler(async ({ data }) => getPublishedPost(data.slug));