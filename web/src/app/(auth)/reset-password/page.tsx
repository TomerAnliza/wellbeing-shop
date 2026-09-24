import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "סיסמה חדשה · Wellbeing" };

// מגיעים לכאן מהקישור במייל, אחרי ש-/auth/confirm יצר session
export default async function ResetPasswordPage() {
  const profile = await getProfile();
  if (!profile) redirect("/forgot-password?error=link");

  return (
    <div className="rounded-[26px] border border-card-border bg-card p-6 shadow-[0_18px_40px_-28px_rgba(28,27,25,0.35)]">
      <h1 className="text-[23px] font-semibold tracking-tight">סיסמה חדשה</h1>
      <p className="mt-1 mb-6 text-[14px] text-ink-2">{profile.display_name}, בחרו סיסמה חדשה לחשבון.</p>
      <ResetForm />
    </div>
  );
}
