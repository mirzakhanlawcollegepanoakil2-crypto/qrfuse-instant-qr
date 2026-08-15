import { useEffect, useRef } from "react";
import type QRCodeStyling from "qr-code-styling";

import { createExportQr } from "@/components/qr/qr-export";
import { buildQrOptions, defaultStyle } from "@/components/qr/qr-style";

interface QrThumbProps {
  /** Encoded value — for dynamic codes this is the QRFUSE redirect URL. */
  data: string;
  size?: number;
  className?: string;
}

/** Small live QR rendering used inside the dashboard library cards. */
export function QrThumb({ data, size = 104, className }: QrThumbProps) {
  const holder = useRef<HTMLDivElement | null>(null);
  const qr = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!qr.current) {
        const instance = await createExportQr(data, defaultStyle, size);
        if (cancelled) return;
        qr.current = instance;
        if (holder.current) {
          holder.current.replaceChildren();
          instance.append(holder.current);
        }
        return;
      }
      qr.current.update(buildQrOptions(data, defaultStyle, size));
    })().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [data, size]);

  return (
    <div
      ref={holder}
      aria-hidden="true"
      className={`grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-white p-1.5 [&>*]:block ${className ?? ""}`}
      style={{ width: size + 12, height: size + 12 }}
    />
  );
}