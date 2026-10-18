import { Link } from "@tanstack/react-router";

import { QrGenerator } from "../qr/QrGenerator";
import type { QrType } from "../qr/qr-types";
import { BRAND, absoluteUrl } from "@/lib/brand";

export interface LandingContent {
  path: string;
  type: QrType;
  title: string;
  description: string;
  h1: string;
  intro: string;
  steps: string[];
  uses: { title: string; body: string }[];
  tips: string[];
}

export function landingHead(c: LandingContent) {
  const url = absoluteUrl(c.path);
  return {
    meta: [
      { title: c.title },
      { name: "description", content: c.description },
      { property: "og:type", content: "website" },
      { property: "og:title", content: c.title },
      { property: "og:description", content: c.description },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: c.title },
      { name: "twitter:description", content: c.description },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: BRAND.name, item: BRAND.siteUrl },
            { "@type": "ListItem", position: 2, name: c.h1, item: url },
          ],
        }),
      },
    ],
  };
}

const RELATED = [
  { to: "/url-qr-code-generator", label: "URL QR codes" },
  { to: "/wifi-qr-code-generator", label: "Wi-Fi QR codes" },
  { to: "/vcard-qr-code-generator", label: "Contact (vCard) QR codes" },
  { to: "/text-qr-code-generator", label: "Text QR codes" },
  { to: "/dynamic-qr-codes", label: "Dynamic QR codes" },
] as const;

export function QrTypeLanding({ c }: { c: LandingContent }) {
  return (
    <div className="pb-4">
      <section className="mx-auto max-w-3xl px-5 pt-14 sm:pt-20">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {c.h1}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {c.intro}
          </p>
        </div>
        <div className="mt-10">
          <QrGenerator initialType={c.type} />
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-5xl gap-6 px-5 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-foreground">How to create one</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {c.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-foreground">Tips for reliable scans</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {c.tips.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-5xl px-5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Common uses</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {c.uses.map((u) => (
            <div key={u.title} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-semibold text-foreground">{u.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{u.body}</p>
            </div>
          ))}
        </div>
      </section>

      <nav aria-label="Related QR generators" className="mx-auto mt-12 max-w-5xl px-5">
        <h2 className="text-lg font-semibold text-foreground">More free QR generators</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {RELATED.filter((r) => r.to !== c.path).map((r) => (
            <li key={r.to}>
              <Link
                to={r.to}
                className="inline-flex rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
              >
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
