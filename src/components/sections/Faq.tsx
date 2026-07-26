export const FAQ_ITEMS = [
  {
    question: "Is QRFUSE free?",
    answer:
      "Yes. QRFUSE is completely free with no account, no usage limits and no watermarks on your QR codes.",
  },
  {
    question: "Do you store my QR codes?",
    answer:
      "No. Every QR code is generated locally in your browser, so the content you enter is never uploaded or stored.",
  },
  {
    question: "Can I use generated QR codes commercially?",
    answer:
      "Yes. The QR codes you create are yours to use in products, packaging, print and marketing without attribution.",
  },
  {
    question: "Do QR codes expire?",
    answer:
      "No. QRFUSE creates static QR codes that encode your content directly, so they keep working forever.",
  },
];

export function Faq() {
  return (
    <section aria-labelledby="faq" className="mx-auto mt-24 max-w-3xl px-5">
      <h2 id="faq" className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Frequently Asked Questions
      </h2>
      <dl className="mt-10 space-y-3">
        {FAQ_ITEMS.map((item) => (
          <div
            key={item.question}
            className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
          >
            <dt className="text-base font-semibold text-foreground">{item.question}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}