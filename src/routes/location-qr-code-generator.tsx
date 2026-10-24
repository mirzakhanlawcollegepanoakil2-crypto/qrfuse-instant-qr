import { createFileRoute } from "@tanstack/react-router";

import { QrTypeLanding, landingHead, type LandingContent } from "@/components/layout/QrTypeLanding";

const C: LandingContent = {
  path: "/location-qr-code-generator",
  type: "location",
  title: "Location QR Code Generator — Google Maps QR | QRFUSE",
  description:
    "Create a free QR code for a location. Enter latitude and longitude and scanners open the place in Google Maps or another maps app. Download PNG, SVG or PDF.",
  h1: "Location QR Code Generator",
  intro:
    "Encode a map location as a QR code. Scanning opens the coordinates in the scanner's maps app — Google Maps on most Android devices, Apple Maps or Google Maps on iPhone.",
  steps: [
    "Find the place on Google Maps and copy its latitude and longitude.",
    "Paste the two values into the generator fields.",
    "Download the code and scan it to confirm the right pin opens before printing.",
  ],
  tips: [
    "In Google Maps you can right-click a point and copy the exact coordinates.",
    "Use decimal degrees, for example 51.5007 for latitude and -0.1246 for longitude.",
    "Test the code on both an iPhone and an Android device — the maps app that opens depends on the phone.",
  ],
  faqs: [
    { question: "Does the code open Google Maps?", answer: "It encodes a standard geo: link. Most phones open it in their default maps app, which is Google Maps on many devices and Apple Maps on iPhones. The pin location is the same." },
    { question: "How do I find latitude and longitude?", answer: "Open Google Maps, right-click the spot on desktop, and the coordinates appear first in the menu. Copy them as decimal numbers." },
    { question: "Can the location change after printing?", answer: "No. The coordinates are stored inside the code. Generate a new code if the meeting point or site location changes." },
    { question: "Does scanning need internet?", answer: "Yes — showing a map requires the maps app to load, so an internet connection is needed where the code is scanned." },
  ],
  uses: [
    { title: "Event venues", body: "Guide guests to entrances, parking lots or side stages." },
    { title: "Trails & tours", body: "Mark viewpoints, stops or meeting points on printed maps and signs." },
    { title: "Delivery & site visits", body: "Send couriers or clients to an exact gate instead of a street address." },
  ],
};

export const Route = createFileRoute("/location-qr-code-generator")({
  head: () => landingHead(C),
  component: () => <QrTypeLanding c={C} />,
});
