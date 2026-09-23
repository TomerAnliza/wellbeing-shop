import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { getProfile } from "@/lib/auth";
import { formatPhone } from "@/lib/phone";
import { WHATSAPP_NUMBER } from "@/lib/shop";
import { createClient } from "@/lib/supabase/server";
import { ChangePhone } from "./change-phone";
import { VerifyWaiter } from "./verify-waiter";

export const metadata: Metadata = { title: "אימות טלפון · Wellbeing" };

// אימות טלפון: הקוד נשלח מהטלפון של המשתמש לבוט בוואטסאפ. Meta כבר יודעת מאיזה מספר
// ההודעה נשלחה — הקוד רק קושר את ההודעה למשתמש הזה. (docs/spec-auth-and-app.md)
export default async function VerifyPhonePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/verify-phone");
  if (profile.phone_verified) redirect("/app");

  // הפונקציה רצה בשם המשתמש המחובר, ומחזירה קוד חי או יוצרת חדש (15 דקות)
  const supabase = await createClient();
  const { data: code, error } = await supabase.rpc("start_phone_verification");

  const message = `קוד אימות: ${code}`;
  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <div className="rounded-[26px] border border-card-border bg-card p-6 shadow-[0_18px_40px_-28px_rgba(28,27,25,0.35)]">
      <h1 className="text-[23px] font-semibold tracking-tight">עוד צעד אחד</h1>
      <p className="mt-1 text-[14px] leading-relaxed text-ink-2">
        שלחו לנו את הקוד בוואטסאפ, <b className="text-ink">מהמספר <span dir="ltr">{formatPhone(profile.phone)}</span></b>.
        כך נדע שהמספר באמת שלך.
      </p>

      {error || !code ? (
        <p role="alert" className="mt-5 rounded-[12px] bg-[oklch(0.95_0.03_40)] px-3.5 py-2.5 text-[13px] text-[oklch(0.42_0.1_40)]">
          לא הצלחנו ליצור קוד כרגע. רעננו את הדף בעוד רגע.
        </p>
      ) : (
        <>
          <div className="my-5 rounded-[20px] bg-brand-soft py-5 text-center">
            <div className="text-[12px] text-brand-soft-ink">הקוד שלך</div>
            <div dir="ltr" className="mt-1 text-[34px] font-semibold tracking-[0.25em] tabular-nums text-brand-soft-ink">
              {code}
            </div>
            <div className="mt-1 text-[12px] text-brand-soft-ink/80">תקף ל-15 דקות</div>
          </div>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-[18px] bg-[#25D366] px-5 py-3.5 text-[15px] font-semibold text-white hover:brightness-95"
          >
            <span className="ms text-xl" aria-hidden>chat</span>
            לשלוח את הקוד בוואטסאפ
          </a>
          <p className="mt-2 text-center text-[12px] text-ink-2">
            נפתחת שיחה עם ההודעה מוכנה — רק ללחוץ &quot;שליחה&quot;.
          </p>
          <VerifyWaiter />
        </>
      )}

      <div className="mt-6 flex flex-col gap-3 border-t border-card-border pt-4">
        <ChangePhone current={formatPhone(profile.phone)} />
        <form action={signOut}>
          <button type="submit" className="text-[13px] text-ink-2 underline-offset-2 hover:underline">
            יציאה מהחשבון
          </button>
        </form>
      </div>
    </div>
  );
}
