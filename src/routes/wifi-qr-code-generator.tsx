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
  faqs: [
    { question: "Which Wi-Fi security options are supported?", answer: "Choose WPA/WPA2, WEP or an open network. The network name and password must match your router settings exactly." },
    { question: "Can someone read the password from the QR code?", answer: "Yes. A Wi-Fi QR code contains the network credentials; it does not encrypt or hide them. Share a guest network rather than a private network." },
    { question: "Will every phone join the network automatically?", answer: "Compatible phones offer to join after scanning, but behavior depends on the camera app and device. Test on the devices your guests use; some scanners only display the encoded text." },
    { question: "What happens when I change the Wi-Fi password?", answer: "The printed code still contains the old password. Generate and distribute a new code after changing the network name, password or security setting." },
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
