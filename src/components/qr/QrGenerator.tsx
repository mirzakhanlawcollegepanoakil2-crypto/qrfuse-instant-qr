import { useEffect, useMemo, useState } from "react";

import { CustomizePanel } from "./CustomizePanel";
import { Field, inputClass } from "./Field";
import { QrPreview } from "./QrPreview";
import { TypeTabs } from "./TypeTabs";
import { defaultStyle, type QrStyleState } from "./qr-style";
import {
  SOCIAL_PLATFORMS,
  buildPayload,
  emptyForm,
  isComplete,
  type QrFormState,
  type QrType,
} from "./qr-types";
import { trackQrGeneration } from "@/lib/qr-tracking";

export function QrGenerator() {
  const [type, setType] = useState<QrType>("url");
  const [form, setForm] = useState<QrFormState>(emptyForm);
  const [style, setStyle] = useState<QrStyleState>(defaultStyle);
  const [showCustomize, setShowCustomize] = useState(false);

  const set = <K extends keyof QrFormState>(key: K, value: QrFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setStyleValue = <K extends keyof QrStyleState>(key: K, value: QrStyleState[K]) => {
    setStyle((prev) => ({ ...prev, [key]: value }));
  };

  const ready = isComplete(type, form);
  const payload = useMemo(() => (ready ? buildPayload(type, form) : null), [ready, type, form]);
  const data = payload && payload.ok ? payload.value : null;
  const errors = payload && !payload.ok ? payload.errors : {};

  // Track a generation once the payload settles, so stats reflect real usage.
  useEffect(() => {
    if (!data) return;
    const timer = setTimeout(() => void trackQrGeneration(type), 1500);
    return () => clearTimeout(timer);
  }, [data, type]);

  return (
    <div className="space-y-6">
      <TypeTabs value={type} onChange={setType} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div
          id="qr-panel"
          role="tabpanel"
          aria-labelledby={`tab-${type}`}
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

            {type === "vcard" && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="First name" error={errors.firstName}>
                    {({ id, describedBy, invalid }) => (
                      <input
                        id={id}
                        type="text"
                        placeholder="Ada"
                        className={inputClass}
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        value={form.firstName}
                        onChange={(e) => set("firstName", e.target.value)}
                      />
                    )}
                  </Field>
                  <Field label="Last name">
                    {({ id }) => (
                      <input
                        id={id}
                        type="text"
                        placeholder="Lovelace"
                        className={inputClass}
                        value={form.lastName}
                        onChange={(e) => set("lastName", e.target.value)}
                      />
                    )}
                  </Field>
                  <Field label="Organisation" optional>
                    {({ id }) => (
                      <input
                        id={id}
                        type="text"
                        className={inputClass}
                        value={form.organization}
                        onChange={(e) => set("organization", e.target.value)}
                      />
                    )}
                  </Field>
                  <Field label="Job title" optional>
                    {({ id }) => (
                      <input
                        id={id}
                        type="text"
                        className={inputClass}
                        value={form.jobTitle}
                        onChange={(e) => set("jobTitle", e.target.value)}
                      />
                    )}
                  </Field>
                  <Field label="Phone" optional error={errors.vcardPhone}>
                    {({ id, describedBy, invalid }) => (
                      <input
                        id={id}
                        type="tel"
                        className={inputClass}
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        value={form.vcardPhone}
                        onChange={(e) => set("vcardPhone", e.target.value)}
                      />
                    )}
                  </Field>
                  <Field label="Email" optional error={errors.vcardEmail}>
                    {({ id, describedBy, invalid }) => (
                      <input
                        id={id}
                        type="email"
                        className={inputClass}
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        value={form.vcardEmail}
                        onChange={(e) => set("vcardEmail", e.target.value)}
                      />
                    )}
                  </Field>
                </div>
                <Field label="Website" optional>
                  {({ id }) => (
                    <input
                      id={id}
                      type="url"
                      placeholder="https://example.com"
                      className={inputClass}
                      value={form.vcardWebsite}
                      onChange={(e) => set("vcardWebsite", e.target.value)}
                    />
                  )}
                </Field>
                <Field label="Address" optional>
                  {({ id }) => (
                    <input
                      id={id}
                      type="text"
                      className={inputClass}
                      value={form.vcardAddress}
                      onChange={(e) => set("vcardAddress", e.target.value)}
                    />
                  )}
                </Field>
              </>
            )}

            {type === "location" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Latitude" error={errors.latitude}>
                  {({ id, describedBy, invalid }) => (
                    <input
                      id={id}
                      type="text"
                      inputMode="decimal"
                      placeholder="59.3293"
                      className={inputClass}
                      aria-invalid={invalid}
                      aria-describedby={describedBy}
                      value={form.latitude}
                      onChange={(e) => set("latitude", e.target.value)}
                    />
                  )}
                </Field>
                <Field label="Longitude" error={errors.longitude}>
                  {({ id, describedBy, invalid }) => (
                    <input
                      id={id}
                      type="text"
                      inputMode="decimal"
                      placeholder="18.0686"
                      className={inputClass}
                      aria-invalid={invalid}
                      aria-describedby={describedBy}
                      value={form.longitude}
                      onChange={(e) => set("longitude", e.target.value)}
                    />
                  )}
                </Field>
              </div>
            )}

            {type === "whatsapp" && (
              <>
                <Field
                  label="WhatsApp number"
                  error={errors.waPhone}
                  hint="Include the country code, e.g. +1 555 010 1234"
                >
                  {({ id, describedBy, invalid }) => (
                    <input
                      id={id}
                      type="tel"
                      inputMode="tel"
                      placeholder="+1 555 010 1234"
                      className={inputClass}
                      aria-invalid={invalid}
                      aria-describedby={describedBy}
                      value={form.waPhone}
                      onChange={(e) => set("waPhone", e.target.value)}
                    />
                  )}
                </Field>
                <Field label="Pre-filled message" optional>
                  {({ id }) => (
                    <textarea
                      id={id}
                      rows={3}
                      className={`${inputClass} resize-y`}
                      value={form.waMessage}
                      onChange={(e) => set("waMessage", e.target.value)}
                    />
                  )}
                </Field>
              </>
            )}

            {type === "social" && (
              <>
                <Field label="Platform">
                  {({ id }) => (
                    <select
                      id={id}
                      className={inputClass}
                      value={form.socialPlatform}
                      onChange={(e) =>
                        set("socialPlatform", e.target.value as QrFormState["socialPlatform"])
                      }
                    >
                      {SOCIAL_PLATFORMS.map((platform) => (
                        <option key={platform.id} value={platform.id}>
                          {platform.label}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
                <Field
                  label="Username or profile link"
                  error={errors.socialHandle}
                  hint="Paste a full link, or just your handle."
                >
                  {({ id, describedBy, invalid }) => (
                    <input
                      id={id}
                      type="text"
                      placeholder="@qrfuse"
                      className={inputClass}
                      aria-invalid={invalid}
                      aria-describedby={describedBy}
                      value={form.socialHandle}
                      onChange={(e) => set("socialHandle", e.target.value)}
                    />
                  )}
                </Field>
              </>
            )}

            <div className="flex flex-wrap gap-3 border-t border-border pt-5">
              <button
                type="button"
                onClick={() => setShowCustomize((v) => !v)}
                aria-expanded={showCustomize}
                className="min-h-11 flex-1 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {showCustomize ? "Hide customisation" : "Customise design"}
              </button>
              <button
                type="button"
                onClick={() => setForm(emptyForm)}
                className="min-h-11 rounded-2xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Clear fields
              </button>
            </div>

            {showCustomize ? (
              <div className="rounded-2xl border border-border bg-background p-5">
                <CustomizePanel
                  style={style}
                  onChange={setStyleValue}
                  onApplyTemplate={(values) => setStyle((prev) => ({ ...prev, ...values }))}
                  onReset={() => setStyle(defaultStyle)}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <QrPreview data={data} style={style} filename={`qrfuse-${type}`} />
        </div>
      </div>
    </div>
  );
}