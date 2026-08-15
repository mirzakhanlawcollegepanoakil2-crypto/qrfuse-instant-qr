import { Link, createFileRoute } from "@tanstack/react-router";

import { StaticVsDynamic } from "@/components/sections/StaticVsDynamic";
import { BRAND, absoluteUrl } from "@/lib/brand";

const TITLE = `Dynamic QR Codes with Editable Links – ${BRAND.name}`;
const DESCRIPTION =
  "Create dynamic QR codes you can edit after printing. Change the destination URL any time, pause codes, and track scans with privacy-friendly analytics.";

export const Route = createFileRoute("/dynamic-qr-codes")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: absoluteUrl("/dynamic-qr-codes") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/dynamic-qr-codes") }],
  }),
  component: DynamicQrPage,
});

const STEPS = [
  {
    title: "Add your destination",
    body: "Paste the link the code should open. We generate a short QRFUSE link and encode that instead.",
  },
  {
    title: "Print once",
    body: "Download a high-resolution PNG or vector SVG. The artwork stays valid for the life of the code.",
  },
  {
    title: "Edit and measure",
    body: "Repoint the destination whenever a campaign changes, pause the code, and watch scans roll in.",
  },
];

function DynamicQrPage() {
  return (
    <div className="pb-16">
      <section className="mx-auto max-w-3xl px-5 pt-14 text-center sm:pt-20">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Dynamic QR codes you can edit after printing
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {DESCRIPTION}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex h-12 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try Dynamic QR
          </Link>
          <Link
            to="/"
            className="inline-flex h-12 items-center rounded-xl border border-border px-6 text-sm font-semibold text-foreground transition-colors hover:border-primary/50"
          >
            Create Free QR
          </Link>
        </div>
      </section>

      <section aria-labelledby="how-it-works" className="mx-auto mt-20 max-w-6xl px-5">
        <h2 id="how-it-works" className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          How dynamic QR codes work
        </h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-3xl border border-border bg-card p-6">
              <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-sm font-bold text-primary">
                {index + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <StaticVsDynamic />
    </div>
  );
}
