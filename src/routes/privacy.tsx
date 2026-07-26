import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, LegalSection } from "../components/layout/LegalPage";

const DESCRIPTION =
  "QRFUSE generates every QR code inside your browser. Learn what data we do and do not process.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy – QRFUSE" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Privacy Policy – QRFUSE" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="QRFUSE is built to work without collecting your data. This page explains exactly how that works."
    >
      <LegalSection heading="What we process">
        <p>
          QR codes are generated entirely in your browser using client-side JavaScript. The URLs,
          text, Wi-Fi credentials, email addresses, phone numbers and messages you enter are never
          transmitted to us and are never stored.
        </p>
      </LegalSection>
      <LegalSection heading="Accounts and cookies">
        <p>
          QRFUSE has no accounts, no sign-up and no login. We do not set advertising or tracking
          cookies, and we do not build profiles of visitors.
        </p>
      </LegalSection>
      <LegalSection heading="Downloads">
        <p>
          PNG and SVG files are created on your device and saved directly through your browser. No
          copy of a generated QR code is kept by QRFUSE.
        </p>
      </LegalSection>
      <LegalSection heading="Third parties">
        <p>
          The site loads the Inter typeface from Google Fonts. Aside from that request, QRFUSE makes
          no third-party calls while you generate a code.
        </p>
      </LegalSection>
    </LegalPage>
  );
}