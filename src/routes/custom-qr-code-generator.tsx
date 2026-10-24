import { createFileRoute } from "@tanstack/react-router";

import { QrTypeLanding, landingHead, type LandingContent } from "@/components/layout/QrTypeLanding";

const C: LandingContent = {
  path: "/custom-qr-code-generator",
  type: "url",
  title: "Custom QR Code Generator — Colors, Logo & Styles | QRFUSE",
  description:
    "Design a custom QR code with your logo, brand colors, gradients, dot styles and templates. Free custom QR code design in your browser with PNG, SVG or PDF downloads.",
  h1: "Custom QR Code Generator",
  intro:
    "Make a QR code that matches your brand. Add your logo, pick custom colors or a gradient, choose dot and corner styles, or start from a template — then download it in high resolution.",
  steps: [
    "Enter the content to encode, such as your website address.",
    "Open the customize panel to add a logo, set colors or a gradient, and pick dot and corner styles.",
    "Download your custom QR code as PNG, SVG or PDF and scan it before printing.",
  ],
  tips: [
    "Keep strong contrast between the code and background — light-on-dark or low-contrast designs scan poorly.",
    "Place your logo in the center at a moderate size; an oversized logo makes the code unreliable.",
    "Always scan-test a customized code at its final print size before mass production.",
    "Shorter content produces less dense codes, which tolerate more design freedom.",
  ],
  faqs: [
    { question: "Can I put my logo in a QR code?", answer: "Yes. Upload your logo in the customize panel and it is placed in the center of the code. Keep it reasonably small and scan-test the result before printing." },
    { question: "Can I change the colors of a QR code?", answer: "Yes. You can set custom foreground and background colors or a gradient. Keep a strong difference in brightness between them so scanners still read the code." },
    { question: "Are custom QR codes free here?", answer: "Yes. Customization is part of the free static generator — logo, colors, styles and high-resolution PNG, SVG or PDF downloads included, with no account required." },
    { question: "Does a custom design affect scannability?", answer: "It can. Error correction lets a QR code survive some visual changes, but low contrast, inverted colors or a very large logo reduce reliability. Always test at final size." },
    { question: "What export formats do you support?", answer: "High-resolution PNG, scalable vector SVG and PDF, so the same design works for screens and print." },
  ],
  uses: [
    { title: "Brand campaigns", body: "Put a logo-coded link on flyers, posters and packaging that matches your identity." },
    { title: "Menus & table cards", body: "Match the code to a restaurant's colors so it looks designed, not pasted on." },
    { title: "Business cards", body: "Finish a card with a branded code pointing to your website or portfolio." },
  ],
};

export const Route = createFileRoute("/custom-qr-code-generator")({
  head: () => landingHead(C),
  component: () => <QrTypeLanding c={C} />,
});
