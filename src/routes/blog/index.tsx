import { createFileRoute } from "@tanstack/react-router";
import { BlogGrid } from "@/components/blog/BlogGrid";
import {
  generateOGTags,
  generateTwitterTags,
  generateOrganizationSchema,
} from "@/lib/seo";

const BLOG_DESCRIPTION =
  "Explore QR code tips, tutorials, and guides to help you make the most of QR codes in your business and personal projects.";

export const Route = createFileRoute("/blog/")({
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
        </div>
        <BlogGrid />
      </div>
    </div>
  );
}