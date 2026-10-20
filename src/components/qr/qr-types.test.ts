import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { buildPayload, emptyForm, isComplete, type QrType } from "./qr-types";

describe("dedicated static generator payloads", () => {
  const cases = [
    { type: "url", fields: { url: "https://example.com/qr" }, value: "https://example.com/qr" },
    { type: "wifi", fields: { ssid: "Guest", password: "hello123" }, value: "WIFI:T:WPA;S:Guest;P:hello123;;" },
    { type: "vcard", fields: { firstName: "Ada", lastName: "Lovelace" }, value: "BEGIN:VCARD\nVERSION:3.0\nN:Lovelace;Ada;;;\nFN:Ada Lovelace\nEND:VCARD" },
    { type: "text", fields: { text: "Hello QR" }, value: "Hello QR" },
    { type: "email", fields: { email: "hello@example.com", subject: "Hello QR", message: "A message" }, value: "mailto:hello@example.com?subject=Hello+QR&body=A+message" },
  ] satisfies { type: QrType; fields: Partial<typeof emptyForm>; value: string }[];

  for (const example of cases) {
    test(`${example.type} encodes the supplied static content`, () => {
      const form = { ...emptyForm, ...example.fields };
      assert.equal(isComplete(example.type, form), true);
      assert.deepEqual(buildPayload(example.type, form), { ok: true, value: example.value });
    });
  }
});