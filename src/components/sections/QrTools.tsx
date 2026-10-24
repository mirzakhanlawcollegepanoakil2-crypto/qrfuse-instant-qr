import { Link } from "@tanstack/react-router";

export const QR_TOOLS = [
  { to: "/wifi-qr-code-generator", label: "Wi-Fi QR codes", description: "Share a network with guests." },
  { to: "/url-qr-code-generator", label: "URL QR codes", description: "Open a website with a scan." },
  { to: "/custom-qr-code-generator", label: "Custom QR codes", description: "Add your logo, colors and styles." },
  { to: "/contact-qr-code-generator", label: "Contact QR codes", description: "Share contact details as a vCard." },
  { to: "/text-qr-code-generator", label: "Text QR codes", description: "Encode a message that works offline." },
  { to: "/email-qr-code-generator", label: "Email QR codes", description: "Prepare an email with a recipient and message." },
  { to: "/sms-qr-code-generator", label: "SMS & phone QR codes", description: "Open a text message or a call with a scan." },
  { to: "/social-qr-code-generator", label: "Social media QR codes", description: "Link your YouTube, Instagram or TikTok." },
  { to: "/location-qr-code-generator", label: "Location QR codes", description: "Open a map pin when scanned." },
] as const;

export function QrTools() {
  return (
    <section aria-labelledby="qr-tools-heading" className="mx-auto mt-20 max-w-5xl px-5">
      <h2 id="qr-tools-heading" className="text-2xl font-bold text-foreground">Free QR tools</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QR_TOOLS.map((tool) => (
          <Link key={tool.to} to={tool.to} className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <h3 className="font-semibold text-foreground">{tool.label}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}