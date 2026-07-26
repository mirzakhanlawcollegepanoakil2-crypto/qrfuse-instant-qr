import { createFileRoute } from "@tanstack/react-router";
import { getAllBlogPosts } from "@/lib/blog";

const SITE_URL = "https://qrfuse.vercel.app";

function generateSitemapXml() {
  const blogPosts = getAllBlogPosts();

  const staticPages = [
    { url: "/", changefreq: "weekly", priority: "1.0" },
    { url: "/blog", changefreq: "weekly", priority: "0.9" },
    { url: "/privacy", changefreq: "monthly", priority: "0.5" },
    { url: "/terms", changefreq: "monthly", priority: "0.5" },
    { url: "/contact", changefreq: "monthly", priority: "0.6" },
  ];

  const blogEntries = blogPosts.map((post) => ({
    url: `/blog/${post.slug}`,
    changefreq: "monthly",
    priority: "0.8",
    lastmod: post.date,
  }));

  const allEntries = [...staticPages, ...blogEntries];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const entry of allEntries) {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}${entry.url}</loc>\n`;
    if ('lastmod' in entry) {
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    }
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>';

  return xml;
}

export const Route = createFileRoute("/sitemap[.]xml")({\n  beforeLoad: async () => {
    return { xml: generateSitemapXml() };
  },
  component: () => null,
});

Route.addRoute({
  getHtml: async () => {
    const xml = generateSitemapXml();
    return {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
      body: xml,
    };
  },
});