export type QrType = "url" | "text" | "wifi" | "email" | "phone" | "sms";

export interface QrTypeMeta {
  id: QrType;
  label: string;
  icon: string;
}

export const QR_TYPES: QrTypeMeta[] = [
  { id: "url", label: "URL", icon: "🌐" },
  { id: "text", label: "Text", icon: "📝" },
  { id: "wifi", label: "Wi-Fi", icon: "📶" },
  { id: "email", label: "Email", icon: "📧" },
  { id: "phone", label: "Phone", icon: "📞" },
  { id: "sms", label: "SMS", icon: "💬" },
];

export interface QrFormState {
  url: string;
  text: string;
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  email: string;
  subject: string;
  message: string;
  phone: string;
  smsPhone: string;
  smsMessage: string;
}

export const emptyForm: QrFormState = {
  url: "",
  text: "",
  ssid: "",
  password: "",
  encryption: "WPA",
  email: "",
  subject: "",
  message: "",
  phone: "",
  smsPhone: "",
  smsMessage: "",
};

const escapeWifi = (value: string) => value.replace(/([\\;,":])/g, "\\$1");
const PHONE_RE = /^\+?[0-9\s\-().]{6,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type ValidationResult =
  | { ok: true; value: string }
  | { ok: false; errors: Partial<Record<keyof QrFormState, string>> };

/** Returns true when every field required by the selected type has content. */
export function isComplete(type: QrType, form: QrFormState): boolean {
  switch (type) {
    case "url":
      return form.url.trim().length > 0;
    case "text":
      return form.text.trim().length > 0;
    case "wifi":
      return (
        form.ssid.trim().length > 0 &&
        (form.encryption === "nopass" || form.password.length > 0)
      );
    case "email":
      return form.email.trim().length > 0;
    case "phone":
      return form.phone.trim().length > 0;
    case "sms":
      return form.smsPhone.trim().length > 0;
  }
}

export function buildPayload(type: QrType, form: QrFormState): ValidationResult {
  switch (type) {
    case "url": {
      const raw = form.url.trim();
      const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw) ? raw : `https://${raw}`;
      try {
        const parsed = new URL(withScheme);
        if (!parsed.hostname.includes(".")) throw new Error("invalid");
        return { ok: true, value: parsed.toString() };
      } catch {
        return { ok: false, errors: { url: "Enter a valid website address, like https://example.com" } };
      }
    }
    case "text": {
      const value = form.text.trim();
      if (!value) return { ok: false, errors: { text: "Please enter some text to encode." } };
      if (value.length > 1500)
        return { ok: false, errors: { text: "Text is too long. Keep it under 1500 characters." } };
      return { ok: true, value };
    }
    case "wifi": {
      const ssid = form.ssid.trim();
      if (!ssid) return { ok: false, errors: { ssid: "Network name (SSID) is required." } };
      if (form.encryption !== "nopass" && !form.password)
        return { ok: false, errors: { password: "Password is required for secured networks." } };
      const parts =
        form.encryption === "nopass"
          ? `T:nopass;S:${escapeWifi(ssid)};;`
          : `T:${form.encryption};S:${escapeWifi(ssid)};P:${escapeWifi(form.password)};;`;
      return { ok: true, value: `WIFI:${parts}` };
    }
    case "email": {
      const email = form.email.trim();
      if (!EMAIL_RE.test(email))
        return { ok: false, errors: { email: "Enter a valid email address, like name@example.com" } };
      const params = new URLSearchParams();
      if (form.subject.trim()) params.set("subject", form.subject.trim());
      if (form.message.trim()) params.set("body", form.message.trim());
      const query = params.toString();
      return { ok: true, value: `mailto:${email}${query ? `?${query}` : ""}` };
    }
    case "phone": {
      const phone = form.phone.trim();
      if (!PHONE_RE.test(phone))
        return { ok: false, errors: { phone: "Enter a valid phone number, like +1 555 010 1234" } };
      return { ok: true, value: `tel:${phone.replace(/[\s\-().]/g, "")}` };
    }
    case "sms": {
      const phone = form.smsPhone.trim();
      if (!PHONE_RE.test(phone))
        return { ok: false, errors: { smsPhone: "Enter a valid phone number, like +1 555 010 1234" } };
      const body = form.smsMessage.trim();
      const clean = phone.replace(/[\s\-().]/g, "");
      return { ok: true, value: body ? `SMSTO:${clean}:${body}` : `SMSTO:${clean}` };
    }
  }
}