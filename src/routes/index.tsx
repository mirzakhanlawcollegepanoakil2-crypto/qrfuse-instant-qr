import { createFileRoute } from "@tanstack/react-router";

import { QrGenerator } from "../components/qr/QrGenerator";
import { Faq, FAQ_ITEMS } from "../components/sections/Faq";
import { Features } from "../components/sections/Features";

const DESCRIPTION =
  "Generate QR codes instantly for URLs, text, Wi-Fi, email, phone numbers, and SMS. Fast, free, secure, and mobile-friendly.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QRFUSE – Free QR Code Generator" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "QRFUSE – Free QR Code Generator" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/" },
      { name: "twitter:title", content: "QRFUSE – Free QR Code Generator" },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Free QR Code Generator
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Generate QR codes instantly for websites, text, Wi-Fi, email, phone numbers, SMS, and
            more. No signup required.
          </p>
        </div>
        <div className="mt-10">
          <QrGenerator />
        </div>
      </section>
      <Features />
      <Faq />
    </div>
  );
}
