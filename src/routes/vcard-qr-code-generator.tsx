import { createFileRoute } from "@tanstack/react-router";

import { QrTypeLanding, landingHead, type LandingContent } from "@/components/layout/QrTypeLanding";

const C: LandingContent = {
  path: "/vcard-qr-code-generator",
  type: "vcard",
  title: "Free vCard QR Code Generator — Contact Card QR | QRFUSE",
  description:
    "Create a free vCard QR code that saves your name, phone, email and company to a phone's contacts in one scan. Download PNG, SVG or PDF.",
  h1: "Contact (vCard) QR Code Generator",
  intro:
    "Put your contact details in a QR code. When scanned, phones offer to save you as a new contact — no typing needed.",
  steps: [
    "Fill in your name and any details you want to share: phone, email, company, website.",
    "Customize the look to match your brand if you like.",
    "Download and add it to business cards, badges or email signatures.",
  ],
  tips: [
    "Fewer fields make a smaller, easier-to-scan code.",
    "Print business-card codes at least 2 cm (0.8 in) wide.",
    "Scan the code and check every field before printing in bulk.",
  ],
  uses: [
    { title: "Business cards", body: "Let people save your details instantly instead of typing them in." },
    { title: "Conference badges", body: "Make networking faster at events and trade shows." },
    { title: "Email signatures", body: "Give recipients a quick way to add you to their contacts." },
  ],
};

export const Route = createFileRoute("/vcard-qr-code-generator")({
  head: () => landingHead(C),
  component: () => <QrTypeLanding c={C} />,
});
