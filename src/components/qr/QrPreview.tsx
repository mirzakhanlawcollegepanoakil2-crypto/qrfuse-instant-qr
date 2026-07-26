import { useState } from "react";

interface QrPreviewProps {
  pngUrl: string;
  svgMarkup: string;
  filename: string;
  onReset: () => void;
}

function download(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function QrPreview({ pngUrl, svgMarkup, filename, onReset }: QrPreviewProps) {
  const [status, setStatus] = useState("");

  const handleSvg = () => {
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    download(objectUrl, `${filename}.svg`);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    setStatus("SVG downloaded.");
  };

  const handleCopy = async () => {
    try {
      const blob = await (await fetch(pngUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setStatus("QR code image copied to clipboard.");
    } catch {
      setStatus("Copying isn't supported in this browser. Use Download PNG instead.");
    }
  };

  const buttonBase =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  return (
    <section
      aria-label="Generated QR code"
      className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="rounded-3xl border border-border bg-background p-4">
          <img
            src={pngUrl}
            alt="Generated QR code"
            width={256}
            height={256}
            className="size-56 sm:size-64"
          />
        </div>
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              download(pngUrl, `${filename}.png`);
              setStatus("PNG downloaded.");
            }}
            className={`${buttonBase} bg-primary text-primary-foreground hover:bg-primary/90`}
          >
            Download PNG
          </button>
          <button
            type="button"
            onClick={handleSvg}
            className={`${buttonBase} border border-border bg-card text-foreground hover:bg-secondary`}
          >
            Download SVG
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className={`${buttonBase} border border-border bg-card text-foreground hover:bg-secondary`}
          >
            Copy Image
          </button>
          <button
            type="button"
            onClick={onReset}
            className={`${buttonBase} border border-border bg-card text-foreground hover:bg-secondary`}
          >
            Generate New
          </button>
        </div>
        <p aria-live="polite" className="min-h-5 text-sm text-muted-foreground">
          {status}
        </p>
      </div>
    </section>
  );
}