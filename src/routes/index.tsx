import { Link, createFileRoute } from "@tanstack/react-router";
import { BRAND, absoluteUrl } from "@/lib/brand";

import { QrGenerator } from "../components/qr/QrGenerator";
import { Faq, FAQ_ITEMS } from "../components/sections/Faq";
import { Features } from "../components/sections/Features";
import { StaticVsDynamic } from "../components/sections/StaticVsDynamic";
import { QrTools } from "../components/sections/QrTools";

const TITLE = "Free QR Code Generator — Static & Dynamic QR | QRFUSE";
const DESCRIPTION =
  "Create free QR codes for URLs, Wi-Fi, contacts, text and email. A free online QR code maker with custom colors, logos and PNG, SVG or PDF downloads. Dynamic QR codes require a trial or plan.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: absoluteUrl("/") },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": `${absoluteUrl("/")}#generator`,
          name: `${BRAND.name} Free Static QR Code Generator`,
          url: absoluteUrl("/"),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          description: "Create and download free static QR codes in your browser. No account required.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${absoluteUrl("/")}#website`,
          name: BRAND.name,
          alternateName: "QR Fuse",
          url: absoluteUrl("/"),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="pb-4">
      <section className="mx-auto max-w-3xl px-5 pt-14 sm:pt-20">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
            Free QR Code Generator
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Generate QR codes instantly for websites, text, Wi-Fi, email, phone numbers, SMS, and
            more. Static QR codes are free with no account required. Dynamic QR codes need an
            account and an active trial or plan.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#qr-panel"
              className="inline-flex h-12 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:-translate-y-0.5 hover:opacity-95"
            >
              Create Free QR
            </a>
            <Link
              to="/dynamic-qr-codes"
              className="inline-flex h-12 items-center rounded-xl border border-border px-6 text-sm font-semibold text-foreground transition-colors hover:border-primary/50"
            >
              Try Dynamic QR
            </Link>
          </div>
        </div>
        <div className="mt-10">
          <QrGenerator />
        </div>
      </section>
      <StaticVsDynamic />
      <QrTools />
      <Features />
      <Faq />
    </div>
  );
}
