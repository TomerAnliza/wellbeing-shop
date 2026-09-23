import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "התקדמות · Wellbeing" };

export default function ProgressPage() {
  return <ComingSoon title="התקדמות" icon="insights" text="כאן יופיעו גרף הדקות השבועי, הרצפים והיסטוריית האימונים." />;
}
