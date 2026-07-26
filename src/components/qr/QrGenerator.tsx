import { useState, type FormEvent } from "react";

import { Field, inputClass } from "./Field";
import { QrPreview } from "./QrPreview";
import { TypeTabs } from "./TypeTabs";
import {
  buildPayload,
  emptyForm,
  isComplete,
  type QrFormState,
  type QrType,
} from "./qr-types";

interface QrResult {
  pngUrl: string;
  svgMarkup: string;
}

const QR_OPTIONS = {
  errorCorrectionLevel: "M" as const,
  margin: 2,
  color: { dark: "#111827", light: "#FFFFFF" },
};

export function QrGenerator() {
  const [type, setType] = useState<QrType>("url");
  const [form, setForm] = useState<QrFormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof QrFormState, string>>>({});
  const [result, setResult] = useState<QrResult | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof QrFormState>(key: K, value: QrFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const changeType = (next: QrType) => {
    setType(next);
    setErrors({});
    setResult(null);
  };

  const ready = isComplete(type, form);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = buildPayload(type, form);
    if (!payload.ok) {
      setErrors(payload.errors);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const QRCode = await import("qrcode");
      const [pngUrl, svgMarkup] = await Promise.all([
        QRCode.toDataURL(payload.value, { ...QR_OPTIONS, width: 1024 }),
        QRCode.toString(payload.value, { ...QR_OPTIONS, type: "svg" }),
      ]);
      setResult({ pngUrl, svgMarkup });
    } catch {
      setErrors({ text: "We couldn't generate that QR code. Try shortening the content." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <TypeTabs value={type} onChange={changeType} />

      <form
        id="qr-panel"
        role="tabpanel"
        aria-labelledby={`tab-${type}`}
        onSubmit={handleSubmit}
        className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"
      >
        <div className="space-y-5">
          {type === "url" && (
            <Field label="Website address" error={errors.url}>
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://example.com"
                  className={inputClass}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  value={form.url}
                  onChange={(e) => set("url", e.target.value)}
                />
              )}
            </Field>
          )}

          {type === "text" && (
            <Field label="Text" error={errors.text}>
              {({ id, describedBy, invalid }) => (
                <textarea
                  id={id}
                  rows={5}
                  placeholder="Enter any text..."
                  className={`${inputClass} resize-y`}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  value={form.text}
                  onChange={(e) => set("text", e.target.value)}
                />
              )}
            </Field>
          )}

          {type === "wifi" && (
            <>
              <Field label="Network name (SSID)" error={errors.ssid}>
                {({ id, describedBy, invalid }) => (
                  <input
                    id={id}
                    type="text"
                    placeholder="Home Wi-Fi"
                    className={inputClass}
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                    value={form.ssid}
                    onChange={(e) => set("ssid", e.target.value)}
                  />
                )}
              </Field>
              {form.encryption !== "nopass" && (
                <Field label="Password" error={errors.password}>
                  {({ id, describedBy, invalid }) => (
                    <input
                      id={id}
                      type="password"
                      autoComplete="off"
                      placeholder="Network password"
                      className={inputClass}
                      aria-invalid={invalid}
                      aria-describedby={describedBy}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                    />
                  )}
                </Field>
              )}
              <Field label="Encryption">
                {({ id }) => (
                  <select
                    id={id}
                    className={inputClass}
                    value={form.encryption}
                    onChange={(e) => set("encryption", e.target.value as QrFormState["encryption"])}
                  >
                    <option value="WPA">WPA / WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">Open (no password)</option>
                  </select>
                )}
              </Field>
            </>
          )}

          {type === "email" && (
            <>
              <Field label="Recipient" error={errors.email}>
                {({ id, describedBy, invalid }) => (
                  <input
                    id={id}
                    type="email"
                    inputMode="email"
                    placeholder="name@example.com"
                    className={inputClass}
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                )}
              </Field>
              <Field label="Subject" optional>
                {({ id }) => (
                  <input
                    id={id}
                    type="text"
                    placeholder="Quick question"
                    className={inputClass}
                    value={form.subject}
                    onChange={(e) => set("subject", e.target.value)}
                  />
                )}
              </Field>
              <Field label="Message" optional>
                {({ id }) => (
                  <textarea
                    id={id}
                    rows={4}
                    placeholder="Write your message..."
                    className={`${inputClass} resize-y`}
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                  />
                )}
              </Field>
            </>
          )}

          {type === "phone" && (
            <Field label="Phone number" error={errors.phone}>
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  type="tel"
                  inputMode="tel"
                  placeholder="+1 555 010 1234"
                  className={inputClass}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              )}
            </Field>
          )}

          {type === "sms" && (
            <>
              <Field label="Phone number" error={errors.smsPhone}>
                {({ id, describedBy, invalid }) => (
                  <input
                    id={id}
                    type="tel"
                    inputMode="tel"
                    placeholder="+1 555 010 1234"
                    className={inputClass}
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                    value={form.smsPhone}
                    onChange={(e) => set("smsPhone", e.target.value)}
                  />
                )}
              </Field>
              <Field label="Message" optional>
                {({ id }) => (
                  <textarea
                    id={id}
                    rows={4}
                    placeholder="Type the message to pre-fill..."
                    className={`${inputClass} resize-y`}
                    value={form.smsMessage}
                    onChange={(e) => set("smsMessage", e.target.value)}
                  />
                )}
              </Field>
            </>
          )}

          <button
            type="submit"
            disabled={!ready || busy}
            className="min-h-12 w-full rounded-2xl bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            {busy ? "Generating…" : "Generate QR Code"}
          </button>
        </div>
      </form>

      {result ? (
        <QrPreview
          pngUrl={result.pngUrl}
          svgMarkup={result.svgMarkup}
          filename={`qrfuse-${type}`}
          onReset={() => {
            setResult(null);
            setForm(emptyForm);
            setErrors({});
          }}
        />
      ) : null}
    </div>
  );
}