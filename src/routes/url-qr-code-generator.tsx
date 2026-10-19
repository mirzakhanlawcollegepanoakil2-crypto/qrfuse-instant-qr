import { createFileRoute } from "@tanstack/react-router";

import { QrTypeLanding, landingHead, type LandingContent } from "@/components/layout/QrTypeLanding";

const C: LandingContent = {
  path: "/url-qr-code-generator",
  type: "url",
  title: "Free URL QR Code Generator — Link to Any Website | QRFUSE",
  description:
    "Turn any website link into a free QR code. Customize colors, add a logo and download PNG, SVG or PDF. No sign-up needed for static codes.",
  h1: "URL QR Code Generator",
  intro:
    "Paste a link and get a QR code that opens it when scanned. Static URL codes are free, never expire and need no account.",
  steps: [
    "Paste the full web address, including https://.",
    "Optionally customize colors, dot style or add your logo.",
    "Download and scan it once to confirm it opens the right page.",
  ],
  tips: [
    "Static codes can't be changed after printing — use a dynamic QR code if the link may change.",
    "Shorter URLs produce simpler, easier-to-scan codes.",
    "Keep strong contrast between the code and its background.",
  ],
  faqs: [
    { question: "Does a static URL QR code expire?", answer: "The code itself has no expiry. It continues to encode the same website address, but the destination must remain available for the link to work." },
    { question: "Can I change the link after printing?", answer: "Not with a static QR code. Create a new code for a different link, or use the separate account-based dynamic URL feature if you need an editable destination." },
    { question: "Does scanning a website QR need internet access?", answer: "A camera can read the address offline, but opening the website normally requires an internet connection." },
    { question: "Are scans tracked for free static URL codes?", answer: "No. Static codes link directly to the address you enter rather than a QRFUSE redirect. QRFUSE scan analytics are part of the separate dynamic feature." },
  ],
  uses: [
    { title: "Flyers & posters", body: "Send readers straight to an event page, menu or sign-up form." },
    { title: "Packaging", body: "Link to setup guides, product videos or warranty registration." },
    { title: "Business cards", body: "Point people to your website or portfolio." },
  ],
};

export const Route = createFileRoute("/url-qr-code-generator")({
  head: () => landingHead(C),
  component: () => <QrTypeLanding c={C} />,
});
