import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, LegalSection } from "../components/layout/LegalPage";

const DESCRIPTION =
  "Get in touch with the QRFUSE team about bugs, feature requests or general questions.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact – QRFUSE" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Contact – QRFUSE" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
    scripts: [
      {
        async: true,
        src: "https://www.googletagmanager.com/gtag/js?id=G-F23SZRV217",
      },
      {
        children: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-F23SZRV217');`,
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <LegalPage
      title="Contact"
      intro="Questions, bug reports and feature requests are all welcome. We read every message."
    >
      <LegalSection heading="Email">
        <p>
          Write to{" "}
          <a
            href="mailto:support@qrfuse.app"
            className="font-medium text-primary underline underline-offset-4"
          >
            support@qrfuse.app
          </a>{" "}
          and we will reply within two business days.
        </p>
      </LegalSection>
      <LegalSection heading="Reporting a problem">
        <p>
          Include the QR type you were using, the browser and device you were on, and what you
          expected to happen. That detail lets us reproduce and fix issues quickly.
        </p>
      </LegalSection>
      <LegalSection heading="Privacy note">
        <p>
          Please do not send Wi-Fi passwords or other sensitive values in a support email. A
          description of the problem is enough.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
