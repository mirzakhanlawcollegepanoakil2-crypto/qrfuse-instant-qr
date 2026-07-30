import type QRCodeStyling from "qr-code-styling";
import { buildQrOptions, type QrStyleState } from "./qr-style";

type QrStylingConstructor = new (options: Parameters<QRCodeStyling["update"]>[0]) => QRCodeStyling;

let cachedCtor: Promise<QrStylingConstructor> | null = null;

async function loadQrStyling(): Promise<QrStylingConstructor> {
  if (!cachedCtor) {
    // Must be a static specifier so the bundler can pre-bundle the chunk.
    cachedCtor = import("qr-code-styling").then(
      (m) => (m.default ?? m) as unknown as QrStylingConstructor,
    );
  }
  return cachedCtor;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Creates a styled QR instance at export resolution. */
export async function createExportQr(
  data: string,
  style: QrStyleState,
  size: number,
): Promise<QRCodeStyling> {
  const Ctor = await loadQrStyling();
  return new Ctor(buildQrOptions(data, style, size));
}

/* ------------------------------------------------------------------ */
/* Frame compositing                                                   */
/* ------------------------------------------------------------------ */

export interface FrameMetrics {
  totalWidth: number;
  totalHeight: number;
  qrOffsetX: number;
  qrOffsetY: number;
  qrSize: number;
  bannerHeight: number;
  pad: number;
}

const BANNER_RATIO = 0.18;
const PAD_RATIO = 0.06;

export function frameMetrics(style: QrStyleState, qrSize: number): FrameMetrics {
  if (style.frameStyle === "none") {
    return {
      totalWidth: qrSize,
      totalHeight: qrSize,
      qrOffsetX: 0,
      qrOffsetY: 0,
      qrSize,
      bannerHeight: 0,
      pad: 0,
    };
  }
  const pad = Math.round(qrSize * PAD_RATIO);
  const bannerHeight =
    style.frameStyle === "banner" ? Math.round(qrSize * BANNER_RATIO) : Math.round(qrSize * BANNER_RATIO);
  return {
    totalWidth: qrSize + pad * 2,
    totalHeight: qrSize + pad * 2 + bannerHeight,
    qrOffsetX: pad,
    qrOffsetY: pad,
    qrSize,
    bannerHeight,
    pad,
  };
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1 && ctx.measureText(`${truncated}…`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

/** Draws the QR plus optional frame onto a canvas and returns it. */
export async function composeFramedCanvas(
  data: string,
  style: QrStyleState,
  qrSize: number,
): Promise<HTMLCanvasElement> {
  const qr = await createExportQr(data, style, qrSize);
  const blob = (await qr.getRawData("png")) as Blob;
  if (!blob) throw new Error("QR export failed");

  const metrics = frameMetrics(style, qrSize);
  const canvas = document.createElement("canvas");
  canvas.width = metrics.totalWidth;
  canvas.height = metrics.totalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  if (style.frameStyle !== "none") {
    const frameBg = style.transparentBackground ? "#FFFFFF" : style.background;
    ctx.fillStyle = frameBg;
    const radius = Math.round(qrSize * 0.04);
    ctx.beginPath();
    ctx.roundRect(0, 0, metrics.totalWidth, metrics.totalHeight, radius);
    ctx.fill();
  }

  const image = await createImageBitmap(blob);
  ctx.drawImage(image, metrics.qrOffsetX, metrics.qrOffsetY, qrSize, qrSize);

  if (style.frameStyle !== "none" && metrics.bannerHeight > 0) {
    const bannerY = metrics.totalHeight - metrics.bannerHeight;
    if (style.frameStyle === "banner") {
      ctx.fillStyle = style.frameColor;
      ctx.fillRect(0, bannerY, metrics.totalWidth, metrics.bannerHeight);
      ctx.fillStyle = style.frameTextColor;
    } else {
      ctx.fillStyle = style.frameTextColor;
    }
    const fontSize = Math.round(metrics.bannerHeight * 0.42);
    ctx.font = `700 ${fontSize}px Inter, ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const label = wrapText(ctx, style.frameText || "SCAN ME", metrics.totalWidth - metrics.pad * 2);
    ctx.fillText(label, metrics.totalWidth / 2, bannerY + metrics.bannerHeight / 2);
  }

  return canvas;
}

/* ------------------------------------------------------------------ */
/* SVG export                                                          */
/* ------------------------------------------------------------------ */

/** Wraps the generated QR SVG with an optional frame and caption. */
export async function composeFramedSvg(
  data: string,
  style: QrStyleState,
  qrSize: number,
): Promise<string> {
  const qr = await createExportQr(data, style, qrSize);
  const blob = (await qr.getRawData("svg")) as Blob;
  if (!blob) throw new Error("QR export failed");
  let inner = await blob.text();

  // Strip the XML prolog; we embed the markup inside a wrapper document.
  inner = inner.replace(/<\?xml[^?]*\?>/g, "").trim();
  // Drop the fixed width/height on the inner svg so it scales to the viewBox.
  inner = inner.replace(/<svg([^>]*?)\swidth="[^"]*"/, "<svg$1");
  inner = inner.replace(/<svg([^>]*?)\sheight="[^"]*"/, "<svg$1");

  const metrics = frameMetrics(style, qrSize);
  const frameBg = style.transparentBackground ? "#FFFFFF" : style.background;
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${metrics.totalWidth}" height="${metrics.totalHeight}" viewBox="0 0 ${metrics.totalWidth} ${metrics.totalHeight}">`,
  ];

  if (style.frameStyle !== "none") {
    const radius = Math.round(qrSize * 0.04);
    parts.push(
      `<rect x="0" y="0" width="${metrics.totalWidth}" height="${metrics.totalHeight}" rx="${radius}" fill="${escapeXml(frameBg)}"/>`,
    );
  }

  parts.push(
    `<svg x="${metrics.qrOffsetX}" y="${metrics.qrOffsetY}" width="${metrics.qrSize}" height="${metrics.qrSize}">${inner}</svg>`,
  );

  if (style.frameStyle !== "none" && metrics.bannerHeight > 0) {
    const bannerY = metrics.totalHeight - metrics.bannerHeight;
    if (style.frameStyle === "banner") {
      parts.push(
        `<rect x="0" y="${bannerY}" width="${metrics.totalWidth}" height="${metrics.bannerHeight}" fill="${escapeXml(style.frameColor)}"/>`,
      );
    }
    const fontSize = Math.round(metrics.bannerHeight * 0.42);
    const fill =
      style.frameStyle === "banner" ? style.frameTextColor : style.frameTextColor;
    parts.push(
      `<text x="${metrics.totalWidth / 2}" y="${bannerY + metrics.bannerHeight / 2}" text-anchor="middle" dominant-baseline="central" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-weight="700" font-size="${fontSize}" fill="${escapeXml(fill)}">${escapeXml(style.frameText || "SCAN ME")}</text>`,
    );
  }

  parts.push("</svg>");
  return `<?xml version="1.0" encoding="UTF-8"?>\n${parts.join("")}`;
}

/* ------------------------------------------------------------------ */
/* High-level export helpers                                           */
/* ------------------------------------------------------------------ */

async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG encoding failed"));
    }, "image/png");
  });
}

export async function exportPng(
  data: string,
  style: QrStyleState,
  size: number,
): Promise<Blob> {
  const canvas = await composeFramedCanvas(data, style, size);
  return canvasToPngBlob(canvas);
}

export async function exportSvg(
  data: string,
  style: QrStyleState,
  size: number,
): Promise<Blob> {
  const svg = await composeFramedSvg(data, style, size);
  return new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
}

export async function exportPdf(
  data: string,
  style: QrStyleState,
  size: number,
): Promise<Blob> {
  const [{ jsPDF }, canvas] = await Promise.all([
    import("jspdf"),
    composeFramedCanvas(data, style, size),
  ]);
  const png = canvas.toDataURL("image/png");

  // A4 with margins, image centred and scaled to fit.
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 72; // 1 inch
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;
  const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
  const width = canvas.width * scale;
  const height = canvas.height * scale;
  pdf.addImage(png, "PNG", (pageWidth - width) / 2, (pageHeight - height) / 2, width, height);
  return pdf.output("blob");
}