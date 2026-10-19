import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/vcard-qr-code-generator")({
  beforeLoad: () => {
    throw redirect({ to: "/contact-qr-code-generator", statusCode: 301 });
  },
});
