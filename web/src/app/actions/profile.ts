"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ProfileUpdate =
  | { field: "display_name"; value: string }
  | { field: "weekly_goal"; value: number }
  | { field: "units"; value: "metric" | "imperial" }
  | { field: "show_streak"; value: boolean };

/** עדכון שדה אחד בפרופיל. הבדיקות כאן זהות ל-CHECK בטבלה — השרת הוא קו ההגנה הראשון, Postgres האחרון */
export async function updateProfile(update: ProfileUpdate): Promise<{ error?: string }> {
  const profile = await getProfile();
  if (!profile) return { error: "צריך להתחבר מחדש." };

  let value: string | number | boolean;
  switch (update.field) {
    case "display_name": {
      value = String(update.value).trim();
      if (value.length < 2 || value.length > 40) return { error: "שם של 2 עד 40 תווים." };
      break;
    }
    case "weekly_goal": {
      value = Math.round(Number(update.value));
      if (!(value >= 3 && value <= 7)) return { error: "יעד בין 3 ל-7 אימונים בשבוע." };
      break;
    }
    case "units": {
      value = update.value === "imperial" ? "imperial" : "metric";
      break;
    }
    case "show_streak": {
      value = Boolean(update.value);
      break;
    }
    default:
      return { error: "שדה לא מוכר." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ [update.field]: value }).eq("id", profile.id);
  if (error) return { error: "לא הצלחנו לשמור. נסו שוב." };

  // היעד והיחידות מופיעים בכל המסכים — מרעננים את כולם
  revalidatePath("/app", "layout");
  return {};
}
