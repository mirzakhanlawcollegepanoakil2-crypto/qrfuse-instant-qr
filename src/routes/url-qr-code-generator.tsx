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
