import type { Metadata } from "next";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "שכחתי סיסמה · Wellbeing" };

export default async function ForgotPasswordPage(props: PageProps<"/forgot-password">) {
  // ?error=link — הגיעו מקישור שפג או שכבר נוצל (/auth/confirm)
  const { error } = await props.searchParams;

  return (
    <div className="rounded-[26px] border border-card-border bg-card p-6 shadow-[0_18px_40px_-28px_rgba(28,27,25,0.35)]">
      <h1 className="text-[23px] font-semibold tracking-tight">שכחתי סיסמה</h1>
      <p className="mt-1 mb-6 text-[14px] text-ink-2">נשלח קישור לבחירת סיסמה חדשה.</p>
      {error === "link" && (
        <p role="alert" className="mb-4 rounded-[12px] bg-[oklch(0.95_0.03_40)] px-3.5 py-2.5 text-[13px] text-[oklch(0.42_0.1_40)]">
          הקישור כבר לא תקף — הוא עובד פעם אחת, ולשעה. אפשר לבקש קישור חדש.
        </p>
      )}
      <ForgotForm />
    </div>
  );
}
