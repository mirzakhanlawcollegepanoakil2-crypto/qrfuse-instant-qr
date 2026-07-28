import {
  DOT_STYLES,
  EYE_DOT_SHAPES,
  EYE_SHAPES,
  FRAME_STYLES,
  QUALITY_LEVELS,
  TEMPLATES,
  defaultStyle,
  type QrStyleState,
} from "./qr-style";

interface CustomizePanelProps {
  style: QrStyleState;
  onChange: <K extends keyof QrStyleState>(key: K, value: QrStyleState[K]) => void;
  onApplyTemplate: (values: Partial<QrStyleState>) => void;
  onReset: () => void;
}

const sectionClass = "space-y-3 border-t border-border pt-5 first:border-0 first:pt-0";
const legendClass = "text-sm font-semibold text-foreground";
const rowClass = "flex flex-wrap items-center gap-2";
const selectClass =
  "min-h-11 rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15";

function ColorInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <input
        type="color"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="size-9 cursor-pointer rounded-lg border border-input bg-card p-1 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {label}
    </label>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-10 rounded-xl px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4.5 rounded border-input accent-[var(--color-primary)]"
      />
      {label}
    </label>
  );
}

export function CustomizePanel({
  style,
  onChange,
  onApplyTemplate,
  onReset,
}: CustomizePanelProps) {
  const handleLogo = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange("logo", typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      {/* Templates */}
      <fieldset className={sectionClass}>
        <legend className={legendClass}>Templates</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onApplyTemplate(template.values)}
              className="group rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span aria-hidden="true" className="flex gap-1">
                <span
                  className="size-4 rounded-full border border-border"
                  style={{ backgroundColor: template.swatch[0] }}
                />
                <span
                  className="size-4 rounded-full border border-border"
                  style={{ backgroundColor: template.swatch[1] }}
                />
              </span>
              <span className="mt-2 block text-sm font-semibold text-foreground">
                {template.label}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                {template.description}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Colours */}
      <fieldset className={sectionClass}>
        <legend className={legendClass}>Colours</legend>
        <div className={rowClass}>
          <ColorInput
            label="Foreground"
            value={style.foreground}
            onChange={(v) => onChange("foreground", v)}
          />
          <ColorInput
            label="Background"
            value={style.background}
            onChange={(v) => onChange("background", v)}
            disabled={style.transparentBackground}
          />
        </div>
        <Toggle
          label="Transparent background"
          checked={style.transparentBackground}
          onChange={(v) => onChange("transparentBackground", v)}
        />
        <Toggle
          label="Use gradient"
          checked={style.gradientEnabled}
          onChange={(v) => onChange("gradientEnabled", v)}
        />
        {style.gradientEnabled ? (
          <div className={rowClass}>
            <ColorInput
              label="Gradient to"
              value={style.gradientColor}
              onChange={(v) => onChange("gradientColor", v)}
            />
            <select
              aria-label="Gradient type"
              className={selectClass}
              value={style.gradientType}
              onChange={(e) =>
                onChange("gradientType", e.target.value as QrStyleState["gradientType"])
              }
            >
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
            </select>
            {style.gradientType === "linear" ? (
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                Angle
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={15}
                  value={style.gradientRotation}
                  onChange={(e) => onChange("gradientRotation", Number(e.target.value))}
                  className="w-28 accent-[var(--color-primary)]"
                />
                <span className="tabular-nums">{style.gradientRotation}°</span>
              </label>
            ) : null}
          </div>
        ) : null}
      </fieldset>

      {/* Shapes */}
      <fieldset className={sectionClass}>
        <legend className={legendClass}>Dot style</legend>
        <div className={rowClass}>
          {DOT_STYLES.map((dot) => (
            <Chip
              key={dot.id}
              active={style.dotStyle === dot.id}
              onClick={() => onChange("dotStyle", dot.id)}
            >
              {dot.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className={sectionClass}>
        <legend className={legendClass}>Eyes</legend>
        <div className={rowClass}>
          {EYE_SHAPES.map((eye) => (
            <Chip
              key={eye.id}
              active={style.eyeShape === eye.id}
              onClick={() => onChange("eyeShape", eye.id)}
            >
              {eye.label}
            </Chip>
          ))}
        </div>
        <div className={rowClass}>
          {EYE_DOT_SHAPES.map((eye) => (
            <Chip
              key={eye.id}
              active={style.eyeDotShape === eye.id}
              onClick={() => onChange("eyeDotShape", eye.id)}
            >
              Centre: {eye.label}
            </Chip>
          ))}
        </div>
        <div className={rowClass}>
          <ColorInput
            label="Eye frame"
            value={style.eyeColor}
            onChange={(v) => onChange("eyeColor", v)}
          />
          <ColorInput
            label="Eye centre"
            value={style.eyeDotColor}
            onChange={(v) => onChange("eyeDotColor", v)}
          />
        </div>
      </fieldset>

      {/* Logo */}
      <fieldset className={sectionClass}>
        <legend className={legendClass}>Logo</legend>
        <div className={rowClass}>
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            aria-label="Upload logo"
            onChange={(e) => handleLogo(e.target.files?.[0])}
            className="max-w-full text-sm text-muted-foreground file:mr-3 file:min-h-10 file:cursor-pointer file:rounded-xl file:border-0 file:bg-secondary file:px-3.5 file:text-sm file:font-semibold file:text-foreground"
          />
          {style.logo ? (
            <button
              type="button"
              onClick={() => onChange("logo", null)}
              className="min-h-10 rounded-xl border border-border bg-card px-3.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Remove
            </button>
          ) : null}
        </div>
        {style.logo ? (
          <>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Size
              <input
                type="range"
                min={0.15}
                max={0.4}
                step={0.01}
                value={style.logoSize}
                onChange={(e) => onChange("logoSize", Number(e.target.value))}
                className="w-36 accent-[var(--color-primary)]"
              />
              <span className="tabular-nums">{Math.round(style.logoSize * 100)}%</span>
            </label>
            <Toggle
              label="Clear dots behind logo"
              checked={style.hideDotsBehindLogo}
              onChange={(v) => onChange("hideDotsBehindLogo", v)}
            />
            <p className="text-xs text-muted-foreground">
              Error correction is locked to Highest (30%) while a logo is used, so the code stays
              scannable.
            </p>
          </>
        ) : null}
      </fieldset>

      {/* Frame */}
      <fieldset className={sectionClass}>
        <legend className={legendClass}>Frame &amp; caption</legend>
        <div className={rowClass}>
          {FRAME_STYLES.map((frame) => (
            <Chip
              key={frame.id}
              active={style.frameStyle === frame.id}
              onClick={() => onChange("frameStyle", frame.id)}
            >
              {frame.label}
            </Chip>
          ))}
        </div>
        {style.frameStyle !== "none" ? (
          <div className={rowClass}>
            <input
              type="text"
              value={style.frameText}
              maxLength={30}
              aria-label="Frame text"
              placeholder="SCAN ME"
              onChange={(e) => onChange("frameText", e.target.value)}
              className="min-h-11 min-w-40 flex-1 rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
            />
            <ColorInput
              label="Text"
              value={style.frameTextColor}
              onChange={(v) => onChange("frameTextColor", v)}
            />
            {style.frameStyle === "banner" ? (
              <ColorInput
                label="Banner"
                value={style.frameColor}
                onChange={(v) => onChange("frameColor", v)}
              />
            ) : null}
          </div>
        ) : null}
      </fieldset>

      {/* Size & quality */}
      <fieldset className={sectionClass}>
        <legend className={legendClass}>Size &amp; quality</legend>
        <label className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          Export size
          <input
            type="range"
            min={256}
            max={2048}
            step={128}
            value={style.size}
            onChange={(e) => onChange("size", Number(e.target.value))}
            className="w-40 accent-[var(--color-primary)]"
          />
          <span className="tabular-nums">
            {style.size} × {style.size} px
          </span>
        </label>
        <label className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          Quiet zone
          <input
            type="range"
            min={0}
            max={48}
            step={4}
            value={style.margin}
            onChange={(e) => onChange("margin", Number(e.target.value))}
            className="w-40 accent-[var(--color-primary)]"
          />
          <span className="tabular-nums">{style.margin}</span>
        </label>
        <label className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          Error correction
          <select
            className={selectClass}
            value={style.quality}
            disabled={Boolean(style.logo)}
            onChange={(e) => onChange("quality", e.target.value as QrStyleState["quality"])}
          >
            {QUALITY_LEVELS.map((level) => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <div className="border-t border-border pt-5">
        <button
          type="button"
          onClick={onReset}
          className="min-h-11 w-full rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto"
        >
          Reset customisation
        </button>
        <p className="mt-2 text-xs text-muted-foreground">
          Restores the default black-on-white style ({defaultStyle.size}px, medium correction).
        </p>
      </div>
    </div>
  );
}