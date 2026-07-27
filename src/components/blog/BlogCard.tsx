import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { formatBlogDate } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link to="/blog/$slug" params={{ slug: post.slug }}>
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-105 cursor-pointer h-full">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={post.image}
            alt={post.imageAlt}
            className="w-full h-full object-cover transition-transform hover:scale-110"
          />
        </div>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {post.category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {post.readingTime} min read
            </span>
          </div>
          <CardTitle className="line-clamp-2 text-lg">{post.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {post.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {formatBlogDate(post.date)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
