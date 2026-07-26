import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { getBlogPostBySlug, getAllBlogPosts, formatBlogDate } from "@/lib/blog";
import {
  generateOGTags,
  generateTwitterTags,
  generateBlogPostingSchema,
} from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({\n  beforeLoad: async ({ params }) => {
    const post = getBlogPostBySlug(params.slug);
    if (!post) {
      throw new Error("Post not found");
    }
    return { post };
  },
  head: ({ context }) => {
    const post = context.post;
    return {
      meta: [
        { title: `${post.title} | QRFUSE Blog` },
        { name: "description", content: post.description },
        { name: "keywords", content: `${post.category}, QR code, ${post.title}` },
        { name: "author", content: post.author },
        { property: "article:published_time", content: post.date },
        { property: "article:author", content: post.author },
        { property: "article:section", content: post.category },
        ...generateOGTags({
          title: post.title,
          description: post.description,
          url: `https://qrfuse.vercel.app/blog/${post.slug}`,
          image: post.image,
          imageAlt: post.imageAlt,
          type: "article",
        }),
        ...generateTwitterTags({
          title: post.title,
          description: post.description,
          url: `https://qrfuse.vercel.app/blog/${post.slug}`,
          image: post.image,
        }),
      ],
      links: [
        { rel: "canonical", href: `https://qrfuse.vercel.app/blog/${post.slug}` },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            generateBlogPostingSchema({
              title: post.title,
              description: post.description,
              url: `https://qrfuse.vercel.app/blog/${post.slug}`,
              image: post.image,
              imageAlt: post.imageAlt,
              author: post.author,
              publishedDate: post.date,
            })
          ),
        },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useContext();
  const allPosts = getAllBlogPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === post.slug);
  const previousPost = allPosts[currentIndex + 1];
  const nextPost = allPosts[currentIndex - 1];

  return (
    <article className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
          <Link to="/blog">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
          <div className="mb-6 flex items-center gap-2">
            <Badge variant="secondary">{post.category}</Badge>
            <span className="text-sm text-muted-foreground">
              {post.readingTime} min read
            </span>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {post.title}
          </h1>
          <p className="text-lg text-muted-foreground">{post.description}</p>
          <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">{post.author}</p>
              <p>{formatBlogDate(post.date)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="mx-auto max-w-3xl px-5 py-8">
        <img
          src={post.image}
          alt={post.imageAlt}
          className="aspect-video w-full rounded-lg object-cover shadow-lg"
        />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-5 py-8 pb-16">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {post.content.split('\n').map((paragraph, index) => {
            if (paragraph.startsWith('#')) {
              const level = paragraph.match(/^#+/)![0].length;
              const text = paragraph.replace(/^#+\s/, '');
              const Component = (
                ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const
              )[Math.min(level - 1, 5)];
              return (
                <Component key={index} className="mt-6 mb-3 font-bold">
                  {text}
                </Component>
              );
            }
            if (paragraph.startsWith('- ')) {
              return (
                <ul key={index} className="list-disc pl-6">
                  <li>{paragraph.substring(2)}</li>
                </ul>
              );
            }
            if (paragraph.startsWith('1.')) {
              return (
                <ol key={index} className="list-decimal pl-6">
                  <li>{paragraph.substring(3)}</li>
                </ol>
              );
            }
            if (paragraph.trim()) {
              return (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-3xl px-5 py-12">
          <div className="grid gap-6 sm:grid-cols-2">
            {previousPost ? (
              <Link to={`/blog/${previousPost.slug}`}>
                <div className="group cursor-pointer">
                  <p className="mb-2 text-sm font-semibold text-primary">
                    ← Previous Post
                  </p>
                  <p className="text-base font-semibold text-foreground group-hover:underline">
                    {previousPost.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextPost ? (
              <Link to={`/blog/${nextPost.slug}`}>
                <div className="group cursor-pointer text-right">
                  <p className="mb-2 text-sm font-semibold text-primary">
                    Next Post →
                  </p>
                  <p className="text-base font-semibold text-foreground group-hover:underline">
                    {nextPost.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}