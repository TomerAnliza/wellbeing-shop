import type { Metadata } from "next";
import { signOut } from "@/app/actions/auth";
import { requireVerifiedProfile } from "@/lib/auth";
import { formatPhone } from "@/lib/phone";

export const metadata: Metadata = { title: "פרופיל · Wellbeing" };

// פרופיל — כרגע תצוגה ויציאה. עריכת יעד, יחידות ורצף: בסבב המסכים (docs/spec-auth-and-app.md)
export default async function ProfilePage() {
  const profile = await requireVerifiedProfile("/app/profile");
  const since = new Intl.DateTimeFormat("he-IL", { month: "long", year: "numeric" }).format(new Date(profile.created_at));

  return (
    <>
      <h1 className="text-[23px] font-semibold tracking-tight lg:text-[30px]">פרופיל</h1>
      <div className="flex items-center gap-4 rounded-[26px] border border-card-border bg-card p-5 lg:max-w-lg">
        <div className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-[22px] font-semibold text-brand-soft-ink">
          {profile.display_name.charAt(0)}
        </div>
        <div>
          <div className="text-[17px] font-semibold">{profile.display_name}</div>
          <div className="text-[13px] text-ink-2">איתנו מאז {since}</div>
          <div className="mt-1 flex items-center gap-1 text-[13px] text-ink-2">
            <span dir="ltr">{formatPhone(profile.phone)}</span>
            <span className="ms text-[16px] text-[oklch(0.55_0.12_150)]" aria-label="מאומת">verified</span>
          </div>
        </div>
      </div>
      <form action={signOut} className="lg:max-w-lg">
        <button type="submit" className="w-full rounded-[18px] border border-ink/10 bg-card px-5 py-3.5 text-[15px] font-semibold hover:bg-ink/5">
          יציאה מהחשבון
        </button>
      </form>
    </>
  );
}
