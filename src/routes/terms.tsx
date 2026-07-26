import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, LegalSection } from "../components/layout/LegalPage";

const DESCRIPTION =
  "The terms that apply when you use QRFUSE to create free QR codes for personal or commercial projects.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use – QRFUSE" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Terms of Use – QRFUSE" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      intro="By using QRFUSE you agree to the straightforward terms below."
    >
      <LegalSection heading="Your QR codes">
        <p>
          QR codes you generate belong to you. You may use them for personal and commercial purposes,
          including print, packaging and marketing, with no attribution required.
        </p>
      </LegalSection>
      <LegalSection heading="Acceptable use">
        <p>
          Do not use QRFUSE to encode content that is unlawful, deceptive, or that distributes
          malware or phishing links. You are responsible for the content you encode and for where you
          publish it.
        </p>
      </LegalSection>
      <LegalSection heading="Availability">
        <p>
          QRFUSE is provided as-is and free of charge. We aim for continuous availability but cannot
          guarantee uninterrupted access, and we may update the tool at any time.
        </p>
      </LegalSection>
      <LegalSection heading="Liability">
        <p>
          Always scan a generated QR code before publishing it. To the extent permitted by law,
          QRFUSE is not liable for losses arising from the use of codes created with this tool.
        </p>
      </LegalSection>
    </LegalPage>
  );
}