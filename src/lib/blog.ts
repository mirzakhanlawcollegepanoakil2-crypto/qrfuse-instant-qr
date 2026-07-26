/**
 * Blog data and utilities
 * Easy to add new posts - just add to BLOG_POSTS array
 */

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string; // ISO format: YYYY-MM-DD
  category: string;
  image: string;
  imageAlt: string;
  author: string;
  readingTime: number; // in minutes
  slug: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "What Is a QR Code? A Simple Guide for Beginners",
    description:
      "Learn what QR codes are, how they work, and why they're becoming essential in our digital world.",
    slug: "what-is-qr-code-guide-beginners",
    date: "2025-01-15",
    category: "Basics",
    author: "QRFUSE Team",
    readingTime: 5,
    image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop",
    imageAlt: "QR code on smartphone screen",
    content: `
# What Is a QR Code? A Simple Guide for Beginners

QR codes have become ubiquitous in our daily lives, yet many people don't fully understand what they are or how they work. This comprehensive guide will demystify QR codes and show you why they're so powerful.

## Understanding QR Codes

A QR code (Quick Response code) is a two-dimensional barcode that stores information in a machine-readable format. Unlike traditional barcodes that only read horizontally, QR codes can encode data both horizontally and vertically, making them more efficient and capable of storing significantly more information.

### Key Characteristics

- **Square Shape**: QR codes are always square
- **Three Corner Markers**: The three distinctive squares in the corners help readers orient the code
- **Scalable**: They work at any size, from postage stamps to billboards
- **Error Correction**: QR codes can be read even if partially damaged or obscured
- **Fast Recognition**: Smartphones can scan them instantly

## What Information Can QR Codes Store?

QR codes can encode various types of information:

1. **URLs**: Direct users to websites
2. **Text**: Simple messages or information
3. **Contact Information**: vCard format with phone, email, address
4. **Wi-Fi Credentials**: Connect to networks automatically
5. **Email Addresses**: Pre-fill email recipients
6. **Phone Numbers**: Initiate calls or SMS
7. **Calendar Events**: Add events to calendars
8. **Location Data**: Maps and GPS coordinates

## How Do QR Codes Work?

The process is surprisingly simple:

1. **Encoding**: Data is converted into a QR code using special algorithms
2. **Scanning**: A camera or QR code reader captures the code
3. **Processing**: The device's software decodes the pattern
4. **Action**: The stored information is retrieved and executed

## Why Are QR Codes So Popular?

### Efficiency
QR codes can store 100 times more information than traditional barcodes, all in a smaller physical space.

### Contactless Interaction
In our post-pandemic world, QR codes offer a touchless way to access information and services—perfect for menus, payments, and ticketing.

### Easy to Create
With tools like QRFUSE, anyone can generate QR codes instantly without technical knowledge.

### Trackable
QR codes can include analytics, allowing businesses to track scans and engagement metrics.

### Versatile
From marketing campaigns to inventory management, QR codes have endless applications.

## Common Real-World Applications

- **Retail**: Product information and pricing
- **Restaurants**: Digital menus and contactless ordering
- **Events**: Ticketing and check-ins
- **Payments**: Mobile payment processing
- **Marketing**: Campaign tracking and lead generation
- **Healthcare**: Patient information and appointment scheduling
- **Education**: Course materials and interactive lessons
- **Logistics**: Package tracking

## QR Code Best Practices

### Size and Placement
- Ensure the code is at least 2cm x 2cm for reliable scanning
- Place codes where they're easily visible
- Avoid placing codes at awkward angles

### Design Considerations
- Maintain high contrast between the code and background
- Test the code before printing or publishing
- Include clear instructions or context

### Testing
- Always scan QR codes before distributing
- Test from various distances and angles
- Verify the destination URL or action works correctly

## The Future of QR Codes

QR codes continue to evolve with new standards and applications. Dynamic QR codes (which can be updated after creation) are becoming increasingly popular, and they're being integrated into loyalty programs, augmented reality experiences, and IoT devices.

## Conclusion

QR codes are more than just a trendy technology—they're a practical solution for connecting the physical and digital worlds. Whether you're a business owner looking to engage customers or an individual wanting to share information efficiently, understanding QR codes is increasingly important in our connected world.

Ready to create your first QR code? Use QRFUSE to generate custom QR codes instantly!
    `,
  },
];

/**
 * Get all blog posts
 */
export function getAllBlogPosts(): BlogPost[] {
  return BLOG_POSTS.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Get a single blog post by slug
 */
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

/**
 * Get blog posts by category
 */
export function getBlogPostsByCategory(category: string): BlogPost[] {
  return BLOG_POSTS.filter((post) => post.category === category).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Get unique categories
 */
export function getBlogCategories(): string[] {
  const categories = new Set(BLOG_POSTS.map((post) => post.category));
  return Array.from(categories).sort();
}

/**
 * Format date for display
 */
export function formatBlogDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
