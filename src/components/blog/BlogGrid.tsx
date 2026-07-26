import { getAllBlogPosts, getBlogCategories } from "@/lib/blog";
import { BlogCard } from "./BlogCard";
import type { BlogPost } from "@/lib/blog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BlogGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const allPosts = getAllBlogPosts();
  const categories = getBlogCategories();

  const filteredPosts: BlogPost[] = selectedCategory
    ? allPosts.filter((post) => post.category === selectedCategory)
    : allPosts;

  return (
    <div className="w-full">
      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          size="sm"
        >
          All Articles
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Blog Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No articles found in this category.
          </p>
        </div>
      )}
    </div>
  );
}
