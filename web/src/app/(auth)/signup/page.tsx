import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "הרשמה · Wellbeing" };

export default async function SignupPage(props: PageProps<"/signup">) {
  if (await getProfile()) redirect("/app");

  // קישור מהבוט יכול למלא מראש את הטלפון: /signup?phone=972501234567. האימות עדיין בוואטסאפ
  const { phone } = await props.searchParams;

  return (
    <div className="rounded-[26px] border border-card-border bg-card p-6 shadow-[0_18px_40px_-28px_rgba(28,27,25,0.35)]">
      <h1 className="text-[23px] font-semibold tracking-tight">בואו נתחיל</h1>
      <p className="mt-1 mb-6 text-[14px] text-ink-2">חשבון אחד לאימונים, להתקדמות ולהנחת הכושר בחנות.</p>
      <SignupForm phone={typeof phone === "string" ? phone : undefined} />
    </div>
  );
}
