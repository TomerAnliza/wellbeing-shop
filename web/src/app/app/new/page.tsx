import type { Metadata } from "next";
import { PageHeader } from "@/components/app-ui";
import { WorkoutPicker } from "@/components/workout-picker";
import { getDashboard } from "@/lib/activities";
import { requireVerifiedProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "אימון · Wellbeing" };

// מסך 2 — אימון חדש, והאימון החי כשכבה מעליו (docs/spec-mvp-screens.md)
export default async function NewWorkoutPage() {
  const profile = await requireVerifiedProfile("/app/new");
  const { week } = await getDashboard(profile);
  const left = profile.weekly_goal - week.count;

  // כרטיס התובנה: ניסוח תומך, רק מנתון אמיתי, ובלשון ניטרלית
  const insight =
    left <= 0
      ? "השלמת את היעד השבועי 🎉 כל אימון נוסף השבוע הוא בונוס."
      : left === 1
        ? "עוד אימון אחד השבוע, והיעד הושלם. גם 20 דקות נחשבות."
        : `עוד ${left} אימונים השבוע עד היעד. אימון קצר עדיף על אימון שלא קרה.`;

  return (
    <>
      <PageHeader title="אימון חדש" subtitle="בוחרים סוג פעילות — והטיימר מתחיל" />
      <WorkoutPicker units={profile.units} />
      <div className="flex items-start gap-3 rounded-[18px] bg-brand-soft px-4 py-3.5 lg:max-w-xl">
        <span className="ms text-[19px] text-brand-icon" aria-hidden>bolt</span>
        <p className="text-[12.5px] leading-relaxed text-brand-soft-ink">{insight}</p>
      </div>
    </>
  );
}
