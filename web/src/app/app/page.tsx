import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "היום · Wellbeing" };

export default function TodayPage() {
  return <ComingSoon title="היום" icon="today" text="כאן יופיעו האימון של היום, ההתקדמות ליעד השבועי והרצף שלך." />;
}
