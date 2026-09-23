import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "אימון · Wellbeing" };

export default function NewWorkoutPage() {
  return <ComingSoon title="אימון" icon="add_circle" text="כאן בוחרים סוג אימון ומתחילים טיימר — יוגה, כוח, ריצה או הליכה." />;
}
