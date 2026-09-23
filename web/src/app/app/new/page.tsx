import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { requireVerifiedProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "אימון · Wellbeing" };

export default async function NewWorkoutPage() {
  await requireVerifiedProfile("/app/new");
  return <ComingSoon title="אימון" icon="add_circle" text="כאן בוחרים סוג אימון ומתחילים טיימר — יוגה, כוח, ריצה או הליכה." />;
}
