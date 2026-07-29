import { useEffect, useRef, useState } from "react";
import type QRCodeStyling from "qr-code-styling";

import { createExportQr, downloadBlob, exportPdf, exportPng, exportSvg } from "./qr-export";
import { buildQrOptions, type QrStyleState } from "./qr-style";

interface QrPreviewProps {
  /** Encoded payload, or null while the form is incomplete. */
  data: string | null;
  style: QrStyleState;
  filename: string;
  onExported?: () => void;
}

const PREVIEW_SIZE = 288;

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50";

export function QrPreview({ data, style, filename, onExported }: QrPreviewProps) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  // Live preview: build once, then update in place on every style/data change.
  useEffect(() => {
    let cancelled = false;
    if (!data) return;
    const options = buildQrOptions(data, style, PREVIEW_SIZE);

    (async () => {
      if (!qrRef.current) {
        const qr = await createExportQr(data, style, PREVIEW_SIZE);
        if (cancelled) return;
        qrRef.current = qr;
        if (holderRef.current) {
          holderRef.current.replaceChildren();
          qr.append(holderRef.current);
        }
        return;
      }
      qrRef.current.update(options);
    })().catch(() => setStatus("Preview failed to render. Try simpler content."));

    return () => {
      cancelled = true;
    };
  }, [data, style]);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setStatus("");
    try {
      await fn();
      onExported?.();
    } catch {
      setStatus("Export failed. Try a smaller size or simpler content.");
    } finally {
      setBusy(null);
    }
  };

  const handlePng = () =>
    run("png", async () => {
      const blob = await exportPng(data!, style, style.size);
      downloadBlob(blob, `${filename}.png`);
      setStatus(`PNG downloaded at ${style.size}px.`);
    });

  const handleSvg = () =>
    run("svg", async () => {
      const blob = await exportSvg(data!, style, style.size);
      downloadBlob(blob, `${filename}.svg`);
      setStatus("Vector SVG downloaded.");
    });

  const handlePdf = () =>
    run("pdf", async () => {
      const blob = await exportPdf(data!, style, Math.max(style.size, 1024));
      downloadBlob(blob, `${filename}.pdf`);
      setStatus("Print-ready PDF downloaded.");
    });

  const handleCopy = () =>
    run("copy", async () => {
      const blob = await exportPng(data!, style, Math.min(style.size, 1024));
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setStatus("QR code image copied to clipboard.");
    });

  const showFrame = style.frameStyle !== "none";

  return (
    <section
      aria-label="QR code preview"
      className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <div className="flex flex-col items-center gap-6">
        <div
          className="overflow-hidden rounded-3xl border border-border"
          style={{
            backgroundColor: style.transparentBackground ? "transparent" : style.background,
          }}
        >
          <div className={showFrame ? "p-4 pb-0" : ""}>
            {data ? (
              <div ref={holderRef} className="[&>*]:block" aria-label="Live QR code preview" />
            ) : (
              <div
                className="flex size-72 items-center justify-center px-6 text-center text-sm text-muted-foreground"
                style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
              >
                Fill in the fields to see your QR code appear here instantly.
              </div>
            )}
          </div>
          {showFrame ? (
            <div
              className="px-4 py-3 text-center text-sm font-bold tracking-wide"
              style={{
                backgroundColor: style.frameStyle === "banner" ? style.frameColor : "transparent",
                color: style.frameTextColor,
              }}
            >
              {style.frameText || "SCAN ME"}
            </div>
          ) : null}
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            type="button"
            disabled={!data || busy !== null}
            onClick={handlePng}
            className={`${buttonBase} bg-primary text-primary-foreground hover:bg-primary/90`}
          >
            {busy === "png" ? "Working…" : "PNG"}
          </button>
          <button
            type="button"
            disabled={!data || busy !== null}
            onClick={handleSvg}
            className={`${buttonBase} border border-border bg-card text-foreground hover:bg-secondary`}
          >
            {busy === "svg" ? "Working…" : "SVG"}
          </button>
          <button
            type="button"
            disabled={!data || busy !== null}
            onClick={handlePdf}
            className={`${buttonBase} border border-border bg-card text-foreground hover:bg-secondary`}
          >
            {busy === "pdf" ? "Working…" : "PDF"}
          </button>
          <button
            type="button"
            disabled={!data || busy !== null}
            onClick={handleCopy}
            className={`${buttonBase} border border-border bg-card text-foreground hover:bg-secondary`}
          >
            {busy === "copy" ? "Working…" : "Copy"}
          </button>
        </div>

        <p aria-live="polite" className="min-h-5 text-center text-sm text-muted-foreground">
          {status || `Exports at ${style.size} × ${style.size} px.`}
        </p>
      </div>
    </section>
  );
}