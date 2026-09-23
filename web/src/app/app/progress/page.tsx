import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { requireVerifiedProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "התקדמות · Wellbeing" };

export default async function ProgressPage() {
  await requireVerifiedProfile("/app/progress");
  return <ComingSoon title="התקדמות" icon="insights" text="כאן יופיעו גרף הדקות השבועי, הרצפים והיסטוריית האימונים." />;
}
