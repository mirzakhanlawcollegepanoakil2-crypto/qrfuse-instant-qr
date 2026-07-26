import { QR_TYPES, type QrType } from "./qr-types";

interface TypeTabsProps {
  value: QrType;
  onChange: (type: QrType) => void;
}

export function TypeTabs({ value, onChange }: TypeTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="QR code type"
      className="flex flex-wrap justify-center gap-2 rounded-3xl border border-border bg-card p-2 shadow-[var(--shadow-soft)]"
    >
      {QR_TYPES.map((type) => {
        const selected = type.id === value;
        return (
          <button
            key={type.id}
            type="button"
            role="tab"
            id={`tab-${type.id}`}
            aria-selected={selected}
            aria-controls="qr-panel"
            onClick={() => onChange(type.id)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              selected
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <span aria-hidden="true">{type.icon}</span>
            {type.label}
          </button>
        );
      })}
    </div>
  );
}