import { createFileRoute } from "@tanstack/react-router";
import { QrTypeLanding, landingHead, type LandingContent } from "@/components/layout/QrTypeLanding";

const C: LandingContent = {
  path: "/email-qr-code-generator",
  type: "email",
  title: "Free Email QR Code Generator — Mailto QR Creator | QRFUSE",
  description: "Create a free email QR code with a recipient, optional subject and message. Prepare an email draft when scanned and export PNG, SVG or PDF without sign-up.",
  h1: "Email QR Code Generator",
  intro: "Create a QR code that prepares an email to your chosen recipient. Add an optional subject and message so the person scanning can review a draft before sending.",
  steps: [
    "Enter the recipient email address.",
    "Optionally add a subject and message, then customize the QR design.",
    "Download and scan the code on a device with an email app configured. Check the draft before sharing.",
  ],
  tips: [
    "Use a public contact address instead of a private personal inbox.",
    "Keep the prefilled message short to avoid a dense QR pattern.",
    "Test the recipient, subject and message in the email apps your audience uses.",
  ],
  uses: [
    { title: "Customer enquiries", body: "Put a contact email on packaging or product information sheets." },
    { title: "Event feedback", body: "Prefill an event-specific subject so incoming feedback is easier to organize." },
    { title: "Service requests", body: "Provide a short draft for visitors to review and send from their own inbox." },
  ],
  faqs: [
    { question: "Does the QR code send an email automatically?", answer: "No. It encodes a mailto link that opens a draft in a compatible email app. The person scanning reviews it and chooses whether to send." },
    { question: "Are the subject and message required?", answer: "No. Only a valid recipient email address is required. You can leave both optional fields blank." },
    { question: "Why does scanning not open an email draft on some devices?", answer: "The device needs a compatible email app and an email account configured. Some scanners display the mailto link instead of opening it directly." },
    { question: "Can I include an attachment or change the recipient later?", answer: "Attachments are not supported by this generator. The recipient and draft are embedded in a static code; generate a new code to change them." },
  ],
};

export const Route = createFileRoute("/email-qr-code-generator")({
  head: () => landingHead(C),
  component: () => <QrTypeLanding c={C} />,
});