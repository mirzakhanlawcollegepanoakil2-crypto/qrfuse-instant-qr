export type QrType =
  | "url"
  | "text"
  | "wifi"
  | "email"
  | "phone"
  | "sms"
  | "vcard"
  | "location"
  | "whatsapp"
  | "social";

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
  { id: "vcard", label: "vCard", icon: "👤" },
  { id: "location", label: "Location", icon: "📍" },
  { id: "whatsapp", label: "WhatsApp", icon: "🟢" },
  { id: "social", label: "Social", icon: "🔗" },
];

export const SOCIAL_PLATFORMS = [
  { id: "instagram", label: "Instagram", base: "https://instagram.com/" },
  { id: "x", label: "X (Twitter)", base: "https://x.com/" },
  { id: "facebook", label: "Facebook", base: "https://facebook.com/" },
  { id: "linkedin", label: "LinkedIn", base: "https://linkedin.com/in/" },
  { id: "tiktok", label: "TikTok", base: "https://tiktok.com/@" },
  { id: "youtube", label: "YouTube", base: "https://youtube.com/@" },
  { id: "github", label: "GitHub", base: "https://github.com/" },
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]["id"];

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
  firstName: string;
  lastName: string;
  organization: string;
  jobTitle: string;
  vcardPhone: string;
  vcardEmail: string;
  vcardWebsite: string;
  vcardAddress: string;
  latitude: string;
  longitude: string;
  waPhone: string;
  waMessage: string;
  socialPlatform: SocialPlatform;
  socialHandle: string;
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
  firstName: "",
  lastName: "",
  organization: "",
  jobTitle: "",
  vcardPhone: "",
  vcardEmail: "",
  vcardWebsite: "",
  vcardAddress: "",
  latitude: "",
  longitude: "",
  waPhone: "",
  waMessage: "",
  socialPlatform: "instagram",
  socialHandle: "",
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
    case "vcard":
      return form.firstName.trim().length > 0 || form.lastName.trim().length > 0;
    case "location":
      return form.latitude.trim().length > 0 && form.longitude.trim().length > 0;
    case "whatsapp":
      return form.waPhone.trim().length > 0;
    case "social":
      return form.socialHandle.trim().length > 0;
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
    case "vcard": {
      const first = form.firstName.trim();
      const last = form.lastName.trim();
      if (!first && !last)
        return { ok: false, errors: { firstName: "Enter at least a first or last name." } };
      if (form.vcardEmail.trim() && !EMAIL_RE.test(form.vcardEmail.trim()))
        return { ok: false, errors: { vcardEmail: "Enter a valid email address." } };
      if (form.vcardPhone.trim() && !PHONE_RE.test(form.vcardPhone.trim()))
        return { ok: false, errors: { vcardPhone: "Enter a valid phone number." } };
      const esc = (v: string) => v.replace(/([\\;,])/g, "\\$1").replace(/\n/g, "\\n");
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${esc(last)};${esc(first)};;;`,
        `FN:${esc([first, last].filter(Boolean).join(" "))}`,
      ];
      if (form.organization.trim()) lines.push(`ORG:${esc(form.organization.trim())}`);
      if (form.jobTitle.trim()) lines.push(`TITLE:${esc(form.jobTitle.trim())}`);
      if (form.vcardPhone.trim())
        lines.push(`TEL;TYPE=CELL:${form.vcardPhone.trim().replace(/[\s\-().]/g, "")}`);
      if (form.vcardEmail.trim()) lines.push(`EMAIL;TYPE=INTERNET:${form.vcardEmail.trim()}`);
      if (form.vcardWebsite.trim()) {
        const site = form.vcardWebsite.trim();
        lines.push(`URL:${/^https?:\/\//i.test(site) ? site : `https://${site}`}`);
      }
      if (form.vcardAddress.trim()) lines.push(`ADR;TYPE=WORK:;;${esc(form.vcardAddress.trim())};;;;`);
      lines.push("END:VCARD");
      return { ok: true, value: lines.join("\n") };
    }
    case "location": {
      const lat = Number(form.latitude.trim());
      const lng = Number(form.longitude.trim());
      if (!form.latitude.trim() || Number.isNaN(lat) || lat < -90 || lat > 90)
        return { ok: false, errors: { latitude: "Enter a latitude between -90 and 90." } };
      if (!form.longitude.trim() || Number.isNaN(lng) || lng < -180 || lng > 180)
        return { ok: false, errors: { longitude: "Enter a longitude between -180 and 180." } };
      return { ok: true, value: `geo:${lat},${lng}` };
    }
    case "whatsapp": {
      const phone = form.waPhone.trim();
      if (!PHONE_RE.test(phone))
        return { ok: false, errors: { waPhone: "Enter a valid phone number with country code." } };
      const digits = phone.replace(/[^0-9]/g, "");
      const body = form.waMessage.trim();
      return {
        ok: true,
        value: `https://wa.me/${digits}${body ? `?text=${encodeURIComponent(body)}` : ""}`,
      };
    }
    case "social": {
      const handle = form.socialHandle.trim().replace(/^@+/, "");
      if (!handle) return { ok: false, errors: { socialHandle: "Enter your username or handle." } };
      if (/^https?:\/\//i.test(form.socialHandle.trim()))
        return { ok: true, value: form.socialHandle.trim() };
      const platform = SOCIAL_PLATFORMS.find((p) => p.id === form.socialPlatform);
      return { ok: true, value: `${platform ? platform.base : "https://"}${handle}` };
    }
  }
}