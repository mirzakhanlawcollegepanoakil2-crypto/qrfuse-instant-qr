import { createFileRoute } from "@tanstack/react-router";

import { QrTypeLanding, landingHead, type LandingContent } from "@/components/layout/QrTypeLanding";

const C: LandingContent = {
  path: "/social-qr-code-generator",
  type: "social",
  title: "Social Media QR Code Generator — YouTube, Instagram & More | QRFUSE",
  description:
    "Create a free social media QR code for YouTube, Instagram, TikTok, Facebook, LinkedIn, X or GitHub. Add your logo and download PNG, SVG or PDF without sign-up.",
  h1: "Social Media QR Code Generator",
  intro:
    "Point scanners straight at your profile. Enter your handle, pick a platform — YouTube, Instagram, TikTok, Facebook, LinkedIn, X or GitHub — and download a free QR code that opens it.",
  steps: [
    "Choose the platform your profile lives on, such as YouTube or Instagram.",
    "Enter your username or handle, or paste the full profile link.",
    "Customize the design, download the code and scan it to confirm it opens your profile.",
  ],
  tips: [
    "For YouTube, the @handle format works; you can also paste the full channel or video link.",
    "Add your logo in the customize panel but keep strong contrast so the code stays scannable.",
    "If you paste a full link, check it opens the exact profile before printing.",
  ],
  faqs: [
    { question: "Can I make a QR code for my YouTube channel?", answer: "Yes. Select YouTube in the generator and enter your @handle, or paste your full channel URL. The code is static and free." },
    { question: "Which platforms are supported?", answer: "YouTube, Instagram, Facebook, LinkedIn, TikTok, X (Twitter) and GitHub. You can also paste any other profile link directly." },
    { question: "What happens when someone scans the code?", answer: "Their phone opens the profile link. On most devices this launches the installed app or opens the profile in a browser." },
    { question: "Can I change the linked profile later?", answer: "No — the profile link is stored inside a static code. Generate a new code if your handle changes." },
  ],
  uses: [
    { title: "Menus & table cards", body: "Link diners to your Instagram or TikTok so they follow and tag you." },
    { title: "Business cards", body: "Replace a list of handles with one scan that opens your profile." },
    { title: "Merch & packaging", body: "Send buyers to your channel or profile to keep them engaged." },
  ],
};

export const Route = createFileRoute("/social-qr-code-generator")({
  head: () => landingHead(C),
  component: () => <QrTypeLanding c={C} />,
});
