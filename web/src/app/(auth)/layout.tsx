import Link from "next/link";

// מסגרת למסכי ההתחברות וההרשמה: כרטיס אחד במרכז, באותם טוקנים של האפליקציה
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-screen px-5 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2 text-[19px] font-semibold tracking-tight">
        <span className="ms text-[28px] text-brand" aria-hidden>favorite</span>
        Wellbeing
      </Link>
      <main className="w-full max-w-sm">{children}</main>
    </div>
  );
}
