import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { requireVerifiedProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "היום · Wellbeing" };

export default async function TodayPage() {
  await requireVerifiedProfile("/app");
  return <ComingSoon title="היום" icon="today" text="כאן יופיעו האימון של היום, ההתקדמות ליעד השבועי והרצף שלך." />;
}
