/**
 * SEO utilities for generating meta tags and schema markup
 */

export interface SEOConfig {
  title: string;
  description: string;
  url: string;
  image?: string;
  imageAlt?: string;
  author?: string;
  publishedDate?: string;
  updatedDate?: string;
  type?: "website" | "article" | "blog";
  keywords?: string;
}

/**
 * Generate Open Graph meta tags
 */
export function generateOGTags(config: SEOConfig) {
  return [
    { property: "og:type", content: config.type || "website" },
    { property: "og:title", content: config.title },
    { property: "og:description", content: config.description },
    { property: "og:url", content: config.url },
    ...(config.image
      ? [
          { property: "og:image", content: config.image },
          { property: "og:image:alt", content: config.imageAlt || config.title },
        ]
      : []),
    { property: "og:site_name", content: "QRFUSE" },
  ];
}

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterTags(config: SEOConfig) {
  return [
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: config.title },
    { name: "twitter:description", content: config.description },
    ...(config.image ? [{ name: "twitter:image", content: config.image }] : []),
  ];
}

/**
 * Generate Article schema markup
 */
export function generateArticleSchema(config: SEOConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: config.title,
    description: config.description,
    image: config.image,
    author: {
      "@type": "Organization",
      name: config.author || "QRFUSE",
    },
    publisher: {
      "@type": "Organization",
      name: "QRFUSE",
      logo: {
        "@type": "ImageObject",
        url: "https://qrfuse.vercel.app/favicon.png",
      },
    },
    datePublished: config.publishedDate,
    dateModified: config.updatedDate || config.publishedDate,
  };
}

/**
 * Generate BlogPosting schema markup
 */
export function generateBlogPostingSchema(config: SEOConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: config.title,
    description: config.description,
    image: config.image,
    author: {
      "@type": "Organization",
      name: config.author || "QRFUSE",
    },
    publisher: {
      "@type": "Organization",
      name: "QRFUSE",
      logo: {
        "@type": "ImageObject",
        url: "https://qrfuse.vercel.app/favicon.png",
      },
    },
    datePublished: config.publishedDate,
    dateModified: config.updatedDate || config.publishedDate,
  };
}

/**
 * Generate Organization schema markup
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "QRFUSE",
    url: "https://qrfuse.vercel.app",
    logo: "https://qrfuse.vercel.app/favicon.png",
    sameAs: [
      "https://www.facebook.com/qrfuse",
      "https://www.twitter.com/qrfuse",
      "https://www.linkedin.com/company/qrfuse",
    ],
    description:
      "Generate QR codes instantly for URLs, text, Wi-Fi, email, phone numbers, and SMS.",
  };
}

/**
 * Generate breadcrumb schema markup
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
