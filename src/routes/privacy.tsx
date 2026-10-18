import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, LegalSection } from "../components/layout/LegalPage";
import { absoluteUrl } from "@/lib/brand";

const DESCRIPTION =
  "How QRFUSE handles your data: static QR codes are generated in your browser, what we store for accounts and dynamic QR codes, and which third parties we use.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy – QRFUSE" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Privacy Policy – QRFUSE" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: absoluteUrl("/privacy") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/privacy") }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="This page explains what QRFUSE processes, what it stores, and why. Last updated October 2026."
    >
      <LegalSection heading="Static QR codes">
        <p>
          Static QR codes are generated entirely in your browser. The URLs, text, Wi-Fi passwords,
          contact details and messages you enter are not sent to our servers. Generated PNG, SVG and
          PDF files are created on your device.
        </p>
        <p>
          To understand which features are used, we record an anonymous event each time a code is
          generated containing only the QR type (for example "wifi" or "url") and a timestamp — never
          the content of the code.
        </p>
      </LegalSection>
      <LegalSection heading="Accounts">
        <p>
          Accounts are optional and only needed for dynamic QR codes. If you create one, we store
          your email address, a securely hashed password handled by our authentication provider,
          and your plan or trial status.
        </p>
      </LegalSection>
      <LegalSection heading="Dynamic QR codes and scan analytics">
        <p>
          For dynamic codes we store the destination URL you set, the short redirect link, and its
          status. When someone scans a dynamic code we record the time, device category (for example
          mobile or desktop) and country where available. We do not store raw IP addresses.
        </p>
      </LegalSection>
      <LegalSection heading="Cookies and analytics">
        <p>
          We use Google Analytics to measure visits and improve the site; it may set cookies and
          process data as described in Google's privacy policy. Signed-in users also have a session
          stored in the browser to keep them logged in. We do not run advertising on QRFUSE.
        </p>
      </LegalSection>
      <LegalSection heading="Third parties">
        <p>
          QRFUSE loads fonts from Google Fonts, uses Google Analytics, and stores account and dynamic
          QR data with our hosting and database providers. We do not sell personal data.
        </p>
      </LegalSection>
      <LegalSection heading="Your choices">
        <p>
          You can delete your dynamic QR codes from your dashboard at any time. To delete your
          account or request a copy of your data, contact us at support@qrfuse.app.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
