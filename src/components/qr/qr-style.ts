import type { Options as QrStylingOptions } from "qr-code-styling";

export type DotStyle = "square" | "rounded" | "dots" | "classy" | "extra-rounded";
export type EyeShape = "square" | "extra-rounded" | "dot";
export type EyeDotShape = "square" | "dot";
export type FrameStyle = "none" | "label" | "banner";
export type QualityLevel = "L" | "M" | "Q" | "H";

export interface QrStyleState {
  /** Base foreground colour for the QR modules. */
  foreground: string;
  background: string;
  transparentBackground: boolean;
  gradientEnabled: boolean;
  gradientColor: string;
  gradientType: "linear" | "radial";
  gradientRotation: number;
  dotStyle: DotStyle;
  eyeShape: EyeShape;
  eyeDotShape: EyeDotShape;
  eyeColor: string;
  eyeDotColor: string;
  logo: string | null;
  logoSize: number;
  logoMargin: number;
  hideDotsBehindLogo: boolean;
  frameStyle: FrameStyle;
  frameText: string;
  frameTextColor: string;
  frameColor: string;
  size: number;
  margin: number;
  quality: QualityLevel;
}

export const DOT_STYLES: { id: DotStyle; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "dots", label: "Dots" },
  { id: "classy", label: "Classy" },
  { id: "extra-rounded", label: "Extra round" },
];

export const EYE_SHAPES: { id: EyeShape; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "extra-rounded", label: "Rounded" },
  { id: "dot", label: "Circle" },
];

export const EYE_DOT_SHAPES: { id: EyeDotShape; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "dot", label: "Circle" },
];

export const FRAME_STYLES: { id: FrameStyle; label: string }[] = [
  { id: "none", label: "None" },
  { id: "label", label: "Text below" },
  { id: "banner", label: "Colour banner" },
];

export const QUALITY_LEVELS: { id: QualityLevel; label: string }[] = [
  { id: "L", label: "Low (7%)" },
  { id: "M", label: "Medium (15%)" },
  { id: "Q", label: "High (25%)" },
  { id: "H", label: "Highest (30%)" },
];

export const defaultStyle: QrStyleState = {
  foreground: "#111827",
  background: "#FFFFFF",
  transparentBackground: false,
  gradientEnabled: false,
  gradientColor: "#2563EB",
  gradientType: "linear",
  gradientRotation: 45,
  dotStyle: "square",
  eyeShape: "square",
  eyeDotShape: "square",
  eyeColor: "#111827",
  eyeDotColor: "#111827",
  logo: null,
  logoSize: 0.28,
  logoMargin: 6,
  hideDotsBehindLogo: true,
  frameStyle: "none",
  frameText: "SCAN ME",
  frameTextColor: "#111827",
  frameColor: "#2563EB",
  size: 1024,
  margin: 16,
  quality: "M",
};

export type TemplateId = "business" | "modern" | "minimal" | "creative";

export interface QrTemplate {
  id: TemplateId;
  label: string;
  description: string;
  swatch: [string, string];
  values: Partial<QrStyleState>;
}

export const TEMPLATES: QrTemplate[] = [
  {
    id: "business",
    label: "Business",
    description: "Navy, square, professional",
    swatch: ["#0F172A", "#1E3A8A"],
    values: {
      foreground: "#0F172A",
      background: "#FFFFFF",
      transparentBackground: false,
      gradientEnabled: false,
      dotStyle: "square",
      eyeShape: "square",
      eyeDotShape: "square",
      eyeColor: "#1E3A8A",
      eyeDotColor: "#1E3A8A",
      frameStyle: "label",
      frameText: "SCAN ME",
      frameTextColor: "#0F172A",
      frameColor: "#1E3A8A",
      margin: 16,
    },
  },
  {
    id: "modern",
    label: "Modern",
    description: "Blue gradient, rounded",
    swatch: ["#2563EB", "#7C3AED"],
    values: {
      foreground: "#2563EB",
      background: "#FFFFFF",
      transparentBackground: false,
      gradientEnabled: true,
      gradientColor: "#7C3AED",
      gradientType: "linear",
      gradientRotation: 45,
      dotStyle: "rounded",
      eyeShape: "extra-rounded",
      eyeDotShape: "dot",
      eyeColor: "#2563EB",
      eyeDotColor: "#7C3AED",
      frameStyle: "banner",
      frameText: "SCAN ME",
      frameTextColor: "#FFFFFF",
      frameColor: "#2563EB",
      margin: 16,
    },
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Pure black, no frills",
    swatch: ["#111827", "#FFFFFF"],
    values: {
      foreground: "#111827",
      background: "#FFFFFF",
      transparentBackground: false,
      gradientEnabled: false,
      dotStyle: "square",
      eyeShape: "square",
      eyeDotShape: "square",
      eyeColor: "#111827",
      eyeDotColor: "#111827",
      frameStyle: "none",
      margin: 12,
    },
  },
  {
    id: "creative",
    label: "Creative",
    description: "Warm gradient, dot grid",
    swatch: ["#DB2777", "#F97316"],
    values: {
      foreground: "#DB2777",
      background: "#FFF7ED",
      transparentBackground: false,
      gradientEnabled: true,
      gradientColor: "#F97316",
      gradientType: "radial",
      gradientRotation: 0,
      dotStyle: "dots",
      eyeShape: "dot",
      eyeDotShape: "dot",
      eyeColor: "#DB2777",
      eyeDotColor: "#F97316",
      frameStyle: "banner",
      frameText: "SCAN ME",
      frameTextColor: "#FFFFFF",
      frameColor: "#DB2777",
      margin: 16,
    },
  },
];

const TRANSPARENT = "rgba(0,0,0,0)";

/**
 * A logo punches a hole in the symbol, so force the highest error correction
 * level whenever one is present to keep the code scannable.
 */
export function effectiveQuality(style: QrStyleState): QualityLevel {
  return style.logo ? "H" : style.quality;
}

function gradientFor(style: QrStyleState, from: string) {
  if (!style.gradientEnabled) return undefined;
  return {
    type: style.gradientType,
    rotation: (style.gradientRotation * Math.PI) / 180,
    colorStops: [
      { offset: 0, color: from },
      { offset: 1, color: style.gradientColor },
    ],
  };
}

/** Builds the qr-code-styling options for a payload at a given pixel size. */
export function buildQrOptions(
  data: string,
  style: QrStyleState,
  size: number,
): Partial<QrStylingOptions> {
  const scale = size / 1024;
  return {
    width: size,
    height: size,
    data,
    margin: Math.round(style.margin * scale),
    image: style.logo ?? undefined,
    qrOptions: { errorCorrectionLevel: effectiveQuality(style) },
    imageOptions: {
      hideBackgroundDots: style.hideDotsBehindLogo,
      imageSize: style.logoSize,
      margin: Math.round(style.logoMargin * scale),
      crossOrigin: "anonymous",
    },
    dotsOptions: {
      type: style.dotStyle,
      color: style.foreground,
      gradient: gradientFor(style, style.foreground),
    },
    cornersSquareOptions: {
      type: style.eyeShape,
      color: style.eyeColor,
    },
    cornersDotOptions: {
      type: style.eyeDotShape,
      color: style.eyeDotColor,
    },
    backgroundOptions: {
      color: style.transparentBackground ? TRANSPARENT : style.background,
    },
  };
}