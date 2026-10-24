import { createFileRoute } from "@tanstack/react-router";

import { QrTypeLanding, landingHead, type LandingContent } from "@/components/layout/QrTypeLanding";

const C: LandingContent = {
  path: "/sms-qr-code-generator",
  type: "sms",
  title: "Free SMS QR Code Generator — Text Message QR | QRFUSE",
  description:
    "Create a free SMS QR code that opens a text message draft to your number. Also works as a phone number QR code. Download PNG, SVG or PDF, no sign-up needed.",
  h1: "SMS QR Code Generator",
  intro:
    "Let people start a text message to you with one scan. The code opens a new SMS with your number and an optional prefilled message, ready to review and send.",
  steps: [
    "Enter the phone number people should text, including the country code.",
    "Optionally add a prefilled message so the draft is ready to send.",
    "Download the code as PNG, SVG or PDF and scan it to test before printing.",
  ],
  tips: [
    "Use an international format for the number (for example +1 555 010 1234).",
    "Keep the prefilled message short — it makes the code less dense and easier to scan.",
    "SMS behavior varies by device; test on both iPhone and Android before printing.",
  ],
  faqs: [
    { question: "Can I make a QR code that just calls a phone number?", answer: "Yes. Switch the generator to the Phone tab to create a QR code that starts a call instead of a text message. Both are static and free." },
    { question: "Does the SMS send automatically when scanned?", answer: "No. Scanning opens a text message draft to your number. The person scanning reviews it and presses send themselves." },
    { question: "Why does nothing happen when some phones scan it?", answer: "Some camera apps display the encoded text instead of acting on it, and a device needs a working messaging plan. Test on the devices your audience uses." },
    { question: "Can I change the number after printing?", answer: "No. The number is stored inside the code. Generate and print a new code if the number changes." },
  ],
  uses: [
    { title: "Feedback & support", body: "Let customers text questions or feedback straight from a flyer or receipt." },
    { title: "Event check-ins", body: "Give attendees a quick way to message organizers during an event." },
    { title: "Vehicles & signage", body: "Put a text-to-contact code on wraps, notices or counter displays." },
  ],
};

export const Route = createFileRoute("/sms-qr-code-generator")({
  head: () => landingHead(C),
  component: () => <QrTypeLanding c={C} />,
});
