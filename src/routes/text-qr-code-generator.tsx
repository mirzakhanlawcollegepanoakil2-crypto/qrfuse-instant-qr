import { createFileRoute } from "@tanstack/react-router";

import { QrTypeLanding, landingHead, type LandingContent } from "@/components/layout/QrTypeLanding";

const C: LandingContent = {
  path: "/text-qr-code-generator",
  type: "text",
  title: "Free Text QR Code Generator — Plain Text QR | QRFUSE",
  description:
    "Encode a message, note or instructions as a free plain-text QR code that works offline. Generated in your browser, downloadable as PNG, SVG or PDF.",
  h1: "Text QR Code Generator",
  intro:
    "Store a short message directly inside a QR code. Scanning shows the text on screen — no internet connection or website needed.",
  steps: [
    "Type or paste your text into the box.",
    "Adjust colors or style if you want.",
    "Download the code and scan it to confirm the text displays correctly.",
  ],
  tips: [
    "Keep it short — long text creates dense codes that are harder to scan.",
    "Use a URL QR code instead if you want to share a lot of content.",
    "Text codes are static: the message can't be edited after printing.",
  ],
  faqs: [
    { question: "How much text can I enter?", answer: "The generator accepts up to 1,500 characters. Short messages produce less dense codes and are generally easier to scan, especially when printed small." },
    { question: "Does reading a text QR require internet?", answer: "No. The message is stored inside the code itself. Your scanner must support displaying plain text; behavior varies by camera app." },
    { question: "Can I keep the message private?", answer: "A plain-text QR code is not password-protected. Anyone who can scan it can read its content, so avoid passwords and sensitive personal information." },
    { question: "Can I edit the message on an existing printout?", answer: "No. A static text code contains the original message. Generate a new code when your text changes." },
  ],
  uses: [
    { title: "Instructions", body: "Attach setup steps or care instructions to equipment and products." },
    { title: "Labels & inventory", body: "Encode serial numbers or item details for quick lookups." },
    { title: "Games & events", body: "Hide clues or messages for scavenger hunts and activities." },
  ],
};

export const Route = createFileRoute("/text-qr-code-generator")({
  head: () => landingHead(C),
  component: () => <QrTypeLanding c={C} />,
});
