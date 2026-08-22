export function money(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

// No width here on purpose — Home.jsx overrides it per filter (w-auto, w-24)
// and two Tailwind width utilities in one class list fight each other.
export const inputClass =
  "border border-fade/40 bg-bone px-3 py-2 text-sm text-ink placeholder:text-fade focus:outline-none";

export const fieldClass = `${inputClass} w-full`;

export const labelClass = "care-label block text-fade";

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

export function Button({ variant = "solid", className = "", ...props }) {
  const variants = {
    solid: "bg-ink text-bone hover:bg-ink-soft",
    outline: "border-2 border-ink text-ink hover:bg-wash",
    danger: "border-2 border-stamp text-stamp hover:bg-stamp/10",
  };

  return (
    <button
      {...props}
      className={`care-label px-5 py-2.5 transition disabled:cursor-not-allowed disabled:opacity-40 ${
        variants[variant] || variants.solid
      } ${className}`}
    />
  );
}

export function Tag({ children, tone = "wash" }) {
  const tones = {
    wash: "bg-wash text-ink",
    stitch: "bg-stitch text-ink",
  };
  return (
    <span className={`care-label px-2 py-1 ${tones[tone] || tones.wash}`}>
      {children}
    </span>
  );
}

export function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-denim border-t-transparent" />
      {label && <p className="care-label text-fade">{label}</p>}
    </div>
  );
}

export function Empty({ title, body, children }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <p className="font-display text-xl">{title}</p>
      {body && <p className="text-fade">{body}</p>}
      {children}
    </div>
  );
}

export function Alert({ children, tone = "error" }) {
  if (!children) return null;

  const tones = {
    error: "border-stamp bg-stamp/10 text-stamp",
    success: "border-denim bg-denim/10 text-denim",
  };

  return (
    <div className={`border-2 px-4 py-3 text-sm ${tones[tone] || tones.error}`}>
      {children}
    </div>
  );
}
