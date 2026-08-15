import { Link } from "@tanstack/react-router";

const ROWS: { feature: string; staticQr: string; dynamicQr: string }[] = [
  { feature: "Price", staticQr: "Free forever", dynamicQr: "Free 14-day trial, then Pro" },
  { feature: "Editable destination", staticQr: "No — fixed at creation", dynamicQr: "Yes — change it any time" },
  { feature: "Reprint needed after a change", staticQr: "Yes", dynamicQr: "Never" },
  { feature: "Scan analytics", staticQr: "Not available", dynamicQr: "Totals, timeline, device, country" },
  { feature: "Pause / resume", staticQr: "No", dynamicQr: "Yes" },
  { feature: "Types supported", staticQr: "URL, text, Wi-Fi, vCard, email, SMS, more", dynamicQr: "Web links" },
];

export function StaticVsDynamic() {
  return (
    <section aria-labelledby="static-vs-dynamic" className="mx-auto mt-24 max-w-6xl px-5">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Two ways to create</p>
        <h2
          id="static-vs-dynamic"
          className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          Static QR vs Dynamic QR
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          A static QR encodes your content directly — perfect and free for one-off use. A dynamic QR
          encodes a QRFUSE short link instead, so the artwork never changes even when the destination does.
        </p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <h3 className="text-lg font-semibold text-foreground">Static QR</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Generated entirely in your browser. Full customization, logo upload, and PNG, SVG or PDF export.
          </p>
          <a
            href="#qr-panel"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Create Free QR
          </a>
        </div>
        <div className="rounded-3xl border border-primary/40 bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">Dynamic QR</h3>
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
              Trial &amp; Pro
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Editable destinations, pause/resume, and privacy-friendly scan analytics — without ever
            reprinting your code.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Try Dynamic QR
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Feature comparison of static and dynamic QR codes</caption>
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="px-5 py-3 font-semibold">Feature</th>
              <th scope="col" className="px-5 py-3 font-semibold">Static</th>
              <th scope="col" className="px-5 py-3 font-semibold">Dynamic</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.feature} className="border-b border-border last:border-0">
                <th scope="row" className="px-5 py-3.5 font-semibold text-foreground">{row.feature}</th>
                <td className="px-5 py-3.5 text-muted-foreground">{row.staticQr}</td>
                <td className="px-5 py-3.5 text-foreground">{row.dynamicQr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
