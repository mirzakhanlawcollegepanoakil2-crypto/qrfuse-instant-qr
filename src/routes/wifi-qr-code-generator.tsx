import { createFileRoute } from "@tanstack/react-router";

import { QrTypeLanding, landingHead, type LandingContent } from "@/components/layout/QrTypeLanding";

const C: LandingContent = {
  path: "/wifi-qr-code-generator",
  type: "wifi",
  title: "Free Wi-Fi QR Code Generator — Share Your Network | QRFUSE",
  description:
    "Create a free Wi-Fi QR code so guests can join your network with one scan. Supports WPA/WPA2, WEP and open networks. Generated in your browser.",
  h1: "Wi-Fi QR Code Generator",
  intro:
    "Let guests join your Wi-Fi by scanning a code instead of typing a long password. The code is generated in your browser — your password is not sent to our servers.",
  steps: [
    "Enter your network name (SSID) exactly as it appears on your devices.",
    "Choose the security type (usually WPA/WPA2) and type the password.",
    "Download the code as PNG, SVG or PDF and print or display it.",
  ],
  tips: [
    "SSIDs and passwords are case-sensitive — double-check them.",
    "If you change your Wi-Fi password, create and print a new code.",
    "Test with both an iPhone and an Android camera before printing.",
  ],
  uses: [
    { title: "Cafés & restaurants", body: "Put a table card or wall sign up so customers connect without asking staff." },
    { title: "Rentals & hotels", body: "Add the code to a welcome guide so guests are online in seconds." },
    { title: "Home & office", body: "Share a guest network with visitors without reading out the password." },
  ],
};

export const Route = createFileRoute("/wifi-qr-code-generator")({
  head: () => landingHead(C),
  component: () => <QrTypeLanding c={C} />,
});
