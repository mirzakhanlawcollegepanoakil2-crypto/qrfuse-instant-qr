const FEATURES = [
  {
    icon: "⚡",
    title: "Instant Generation",
    body: "QR codes render the moment you hit generate — no waiting, no uploads, no server round trips.",
  },
  {
    icon: "🔒",
    title: "Privacy Friendly",
    body: "Everything runs in your browser. Your links, passwords and messages never leave your device.",
  },
  {
    icon: "📱",
    title: "Works Everywhere",
    body: "Scannable by every modern phone camera, and downloadable as PNG or crisp vector SVG.",
  },
  {
    icon: "🆓",
    title: "Completely Free",
    body: "No account, no limits, no watermark. Generate as many codes as you need, whenever you need them.",
  },
];

export function Features() {
  return (
    <section aria-labelledby="why-qrfuse" className="mx-auto mt-24 max-w-6xl px-5">
      <h2 id="why-qrfuse" className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Why QRFUSE?
      </h2>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <li
            key={feature.title}
            className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
          >
            <span aria-hidden="true" className="grid size-11 place-items-center rounded-2xl bg-secondary text-xl">
              {feature.icon}
            </span>
            <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}