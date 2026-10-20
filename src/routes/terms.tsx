import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, LegalSection } from "../components/layout/LegalPage";
import { absoluteUrl } from "@/lib/brand";

const DESCRIPTION =
  "The terms that apply when you use QRFUSE: free static QR codes, dynamic QR trials, accounts and acceptable use.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use – QRFUSE" },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Terms of Use – QRFUSE" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: absoluteUrl("/terms") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/terms") }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      intro="By using QRFUSE you agree to the terms below. Last updated October 2026."
    >
      <LegalSection heading="Static QR codes are free">
        <p>
          Static QR codes require no account and are free for personal and commercial use, including
          print, packaging and marketing, with no attribution required. Their content is fixed inside
          the code and keeps working without QRFUSE.
        </p>
      </LegalSection>
      <LegalSection heading="Dynamic QR codes">
        <p>
          Dynamic QR codes point to a QRFUSE redirect link so the destination can be edited later.
          They require an account and an active trial or plan. New accounts can start a one-time
          14-day trial. Because dynamic codes depend on our redirect service, they stop redirecting if
          paused, deleted, or if the trial or plan ends.
        </p>
      </LegalSection>
      <LegalSection heading="Your account">
        <p>
          Keep your login details secure. You are responsible for activity on your account. We may
          suspend accounts that break these terms.
        </p>
      </LegalSection>
      <LegalSection heading="Acceptable use">
        <p>
          Do not use QRFUSE to encode or redirect to content that is unlawful, deceptive, or that
          distributes malware or phishing. We may disable dynamic codes that do.
        </p>
      </LegalSection>
      <LegalSection heading="Availability and liability">
        <p>
          QRFUSE is provided as-is. We aim for continuous availability but cannot guarantee
          uninterrupted access. Always scan a code before publishing it. To the extent permitted by
          law, QRFUSE is not liable for losses arising from the use of codes created with this tool.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
