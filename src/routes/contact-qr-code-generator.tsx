import { createFileRoute } from "@tanstack/react-router";
import { QrTypeLanding, landingHead, type LandingContent } from "@/components/layout/QrTypeLanding";

const C: LandingContent = {
  path: "/contact-qr-code-generator",
  type: "vcard",
  title: "Free Contact QR Code Generator — vCard QR Creator | QRFUSE",
  description: "Create a free contact QR code with your name, phone, email and company. A vCard QR code generator for business cards and event badges — download PNG, SVG or PDF.",
  h1: "Contact QR Code Generator",
  intro: "Share your contact details as a vCard QR code. Compatible scanners let recipients review and save your details without typing them out.",
  steps: [
    "Enter a first or last name, then add any phone, email, company, job title, website or address you want to share.",
    "Choose colors, a logo or a frame while keeping the code easy to read.",
    "Download your QR code and scan it to check the contact fields before printing.",
  ],
  tips: [
    "Use an international country code for phone numbers and check your email for typos.",
    "Only include contact details you are comfortable sharing publicly.",
    "Start with a print size of at least 2 cm and test at the final size; dense contact codes may need more space.",
  ],
  uses: [
    { title: "Business cards", body: "Give new connections a convenient way to save your professional details." },
    { title: "Event badges", body: "Share your name, role and company during conferences and networking events." },
    { title: "Printed profiles", body: "Add a contact code to brochures or professional introductions." },
  ],
  faqs: [
    { question: "Which contact format does the code use?", answer: "QRFUSE creates a vCard 3.0 payload. It supports names, company, job title, phone, email, website and address; it does not create a hosted profile page." },
    { question: "Does scanning save the contact automatically?", answer: "Compatible scanners offer a contact preview or import action. Recipients choose whether to save it. Camera and contacts app support varies, so test on both iPhone and Android." },
    { question: "Do I need to fill in every field?", answer: "No. Enter at least a first or last name. The other fields are optional, and fewer details can make the code easier to scan." },
    { question: "Can I update my phone number after printing?", answer: "Not inside this static vCard code. Generate a new code when details change. Dynamic website redirects are a separate feature and do not edit embedded vCard data." },
  ],
};

export const Route = createFileRoute("/contact-qr-code-generator")({
  head: () => landingHead(C),
  component: () => <QrTypeLanding c={C} />,
});