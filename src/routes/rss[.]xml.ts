import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import type { BlogPost } from "@/lib/blog";

const SITE_URL = "https://qrfuse.vercel.app";
const SITE_TITLE = "QRFUSE Blog";
const SITE_DESCRIPTION =
  "Explore QR code tips, tutorials, and guides to help you make the most of QR codes in your business and personal projects.";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822Date(dateString: string): string {
  const date = new Date(dateString);
  return date.toUTCString();
}

function generateRssXml(posts: BlogPost[]): string {
  const lastBuildDate = posts.length > 0 ? toRfc822Date(posts[0].date) : toRfc822Date(new Date().toISOString());

  const items = posts
    .map((post) => {
      const link = `${SITE_URL}/blog/${post.slug}`;
      const description = escapeXml(post.description);
      const category = escapeXml(post.category);
      const author = escapeXml(post.author);
      const title = escapeXml(post.title);
      const pubDate = toRfc822Date(post.date);
      const imageEnclosure = post.image
        ? `    <enclosure url="${escapeXml(post.image)}" type="image/jpeg" />`
        : "";

      return [
        "  <item>",
        `    <title>${title}</title>`,
        `    <link>${link}</link>`,
        `    <guid isPermaLink="true">${link}</guid>`,
        `    <pubDate>${pubDate}</pubDate>`,
        `    <category>${category}</category>`,
        `    <author>${author}</author>`,
        `    <description>${description}</description>`,
        imageEnclosure,
        "  </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(SITE_TITLE)}</title>`,
    `    <link>${SITE_URL}/blog</link>`,
    `    <description>${escapeXml(SITE_DESCRIPTION)}</description>`,
    "    <language>en-us</language>",
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");
}

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { listPublishedPosts } = await import("@/lib/blog-public.server");
        return new Response(generateRssXml(await listPublishedPosts()), {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
