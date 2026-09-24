import type { Metadata } from "next";
import { signOut } from "@/app/actions/auth";
import { Card, PageHeader } from "@/components/app-ui";
import { requireVerifiedProfile } from "@/lib/auth";
import { formatPhone } from "@/lib/phone";
import { ProfileSettings } from "./profile-settings";

export const metadata: Metadata = { title: "פרופיל · Wellbeing" };

// מסך 5 — פרופיל: כרטיס זהות ורשימת הגדרות שאפשר לערוך.
// "תזכורות" ו"מקורות בריאות" מהעיצוב לא מוצגים — אינם עובדים (חוב אמינות 4–5)
export default async function ProfilePage() {
  const profile = await requireVerifiedProfile("/app/profile");
  const since = new Intl.DateTimeFormat("he-IL", { month: "long", year: "numeric", timeZone: profile.timezone })
    .format(new Date(profile.created_at));

  return (
    <>
      <PageHeader title="פרופיל" />
      <div className="flex flex-col gap-4 lg:max-w-lg">
        <Card className="flex items-center gap-4 p-5">
          <div className="flex size-14 items-center justify-center rounded-full bg-brand-neutral text-[20px] font-semibold text-brand-hover">
            {profile.display_name.charAt(0)}
          </div>
          <div>
            <div className="text-[17px] font-semibold">{profile.display_name}</div>
            <div className="mt-0.5 text-[12.5px] text-ink-2">איתנו מאז {since}</div>
            <div className="mt-1 flex items-center gap-1 text-[12.5px] text-ink-2">
              <span dir="ltr">{formatPhone(profile.phone)}</span>
              <span className="ms text-[15px] text-[oklch(0.55_0.12_150)]" aria-label="מאומת">verified</span>
            </div>
          </div>
        </Card>

        <ProfileSettings
          name={profile.display_name}
          weeklyGoal={profile.weekly_goal}
          units={profile.units}
          showStreak={profile.show_streak}
        />

        <form action={signOut}>
          <button type="submit" className="w-full rounded-[18px] border border-ink/10 bg-card px-5 py-3.5 text-[15px] font-semibold hover:bg-ink/5">
            יציאה מהחשבון
          </button>
        </form>
        <p className="text-center text-[12px] text-ink-3">
          להחלפת מספר טלפון — צריך לאמת אותו מחדש. כתבו לעוזר בוואטסאפ &quot;נציג&quot;.
        </p>
      </div>
    </>
  );
}
