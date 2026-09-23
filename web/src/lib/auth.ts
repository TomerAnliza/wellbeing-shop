import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  display_name: string;
  phone: string;
  phone_verified: boolean;
  weekly_goal: number;
  units: "metric" | "imperial";
  show_streak: boolean;
  timezone: string;
  created_at: string;
};

// המשתמש המחובר והפרופיל שלו, או null. נבדק מול Supabase עם getClaims() — הדרך
// שמומלצת להגנה על עמודים. cache: פעם אחת לכל בקשה, גם אם כמה רכיבים שואלים
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;

  // RLS מחזיר רק את השורה של המשתמש עצמו
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return (profile as Profile) ?? null;
});

/** לעמודים שדורשים משתמש מחובר עם טלפון מאומת. אחרת — להתחברות, או לאימות הטלפון */
export async function requireVerifiedProfile(returnTo: string): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  if (!profile.phone_verified) redirect("/verify-phone");
  return profile;
}

/** כתובת חזרה אחרי התחברות — רק נתיב פנימי, כדי למנוע open redirect */
export function safeNext(next: unknown, fallback = "/app"): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
