// רכיבי טופס משותפים למסכי ההתחברות, ההרשמה והפרופיל

export function Field({
  label, name, type = "text", defaultValue, autoComplete, placeholder, hint, dir, inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  dir?: "ltr" | "rtl";
  inputMode?: "tel" | "email" | "text";
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        placeholder={placeholder}
        dir={dir}
        inputMode={inputMode}
        required
        className="rounded-[14px] border border-ink/10 bg-card px-3.5 py-3 text-[15px] outline-none placeholder:text-ink-3 focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
      {hint && <span className="text-[12px] text-ink-2">{hint}</span>}
    </label>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-[12px] bg-[oklch(0.95_0.03_40)] px-3.5 py-2.5 text-[13px] text-[oklch(0.42_0.1_40)]">
      {message}
    </p>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 rounded-[18px] bg-brand px-5 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
    >
      {pending ? "רגע..." : children}
    </button>
  );
}
