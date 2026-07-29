import { createFileRoute } from "@tanstack/react-router";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { fetchPublishedPosts } from "@/lib/blog-public.functions";
import {
  generateOGTags,
  generateTwitterTags,
  generateOrganizationSchema,
} from "@/lib/seo";

const BLOG_DESCRIPTION =
  "Explore QR code tips, tutorials, and guides to help you make the most of QR codes in your business and personal projects.";

export const Route = createFileRoute("/blog/")({
  loader: () => fetchPublishedPosts(),
  errorComponent: () => (
    <div className="p-16 text-center text-sm text-muted-foreground">
      We couldn't load the blog right now. Please refresh.
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-16 text-center text-sm text-muted-foreground">Nothing here yet.</div>
  ),
  head: () => ({
    meta: [
      { title: "QR Code Blog - Tips, Guides & Tutorials | QRFUSE" },
      { name: "description", content: BLOG_DESCRIPTION },
      { name: "keywords", content: "QR code blog, QR code tutorial, QR code guide, QR code tips" },
      ...generateOGTags({
        title: "QR Code Blog - Tips, Guides & Tutorials | QRFUSE",
        description: BLOG_DESCRIPTION,
        url: "https://qrfuse.vercel.app/blog",
        type: "website",
      }),
      ...generateTwitterTags({
        title: "QR Code Blog - Tips, Guides & Tutorials | QRFUSE",
        description: BLOG_DESCRIPTION,
        url: "https://qrfuse.vercel.app/blog",
      }),
    ],
    links: [
      { rel: "canonical", href: "https://qrfuse.vercel.app/blog" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(generateOrganizationSchema()),
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const posts = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            QR Code Blog
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Learn everything about QR codes, from basics to advanced strategies. Get tips, tutorials, and best practices.
          </p>
          <a
            href="/rss.xml"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
            aria-label="Subscribe to the QRFUSE blog RSS feed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 11a9 9 0 0 1 9 9" />
              <path d="M4 4a16 16 0 0 1 16 16" />
              <circle cx="5" cy="19" r="1" />
            </svg>
            Subscribe via RSS
          </a>
        </div>
        <BlogGrid posts={posts} />
      </div>
    </div>
  );
}