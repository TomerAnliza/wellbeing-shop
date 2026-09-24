"use server";

import { revalidatePath } from "next/cache";
import { estimate, isActivityType } from "@/lib/activity";
import { measuredKm, sanitizeRoute, simplifyRoute } from "@/lib/geo";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type SaveResult = { ok: true } | { ok: false; error: string };

/**
 * שמירת אימון שהסתיים. הדפדפן שולח סוג, זמני התחלה וסיום, שניות פעילות נטו (בלי השהיות),
 * ונקודות GPS אם יש. השרת בודק ומחשב בעצמו משך, מרחק וקלוריות — לא סומכים על מספרים מהדפדפן.
 * מרחק מהמסלול — רק אם המדידה אמינה (lib/geo.ts: measuredKm). אחרת — הערכה מזמן.
 */
export async function saveActivity(input: {
  type: string;
  startedAt: number;
  endedAt: number;
  activeSeconds: number;
  route?: unknown;
}): Promise<SaveResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "צריך להתחבר מחדש. האימון לא נמחק — נסו שוב אחרי הכניסה." };
  if (!isActivityType(input.type)) return { ok: false, error: "סוג אימון לא מוכר." };

  const now = Date.now();
  const { startedAt, endedAt } = input;
  const wallSeconds = (endedAt - startedAt) / 1000;
  const valid =
    Number.isFinite(startedAt) && Number.isFinite(endedAt) &&
    endedAt <= now + 60_000 && // לא בעתיד
    startedAt >= now - 24 * 60 * 60 * 1000 && // לא לפני יותר מיממה
    wallSeconds >= 0;
  if (!valid) return { ok: false, error: "זמני האימון לא תקינים." };

  // שניות נטו לא יכולות לעלות על הזמן שעבר בפועל. משך: דקות שלמות, 1 עד 600
  const activeSeconds = Math.min(Math.max(0, input.activeSeconds), wallSeconds);
  const minutes = Math.min(600, Math.max(1, Math.round(activeSeconds / 60)));
  const { calories, distanceKm: estimatedKm } = estimate(input.type, minutes);

  // המרחק מהמסלול — מחושב כאן מהנקודות, באותו סינון שהדפדפן הריץ (docs/spec-gps-map-share.md)
  const route = sanitizeRoute(input.route);
  const gpsKm = measuredKm(route, input.type, minutes);

  const supabase = await createClient();
  const { error } = await supabase.from("activities").insert({
    type: input.type,
    started_at: new Date(startedAt).toISOString(),
    ended_at: new Date(endedAt).toISOString(),
    duration_minutes: minutes,
    distance_km: gpsKm ?? estimatedKm,
    distance_source: gpsKm !== null ? "gps" : "estimated",
    is_estimated: gpsKm === null, // מרחק מזמן = מוערך. קלוריות תמיד מוערכות (אין משקל ודופק)
    route: gpsKm !== null ? simplifyRoute(route) : null, // המסלול נשמר רק כשהמדידה אמינה
  });
  // RLS דוחה שמירה בלי טלפון מאומת או על שם משתמש אחר
  if (error) return { ok: false, error: "לא הצלחנו לשמור. האימון לא נמחק — נסו שוב." };

  revalidatePath("/app", "layout");
  return { ok: true };
}

export async function deleteActivity(id: string): Promise<void> {
  const supabase = await createClient();
  // RLS מאפשר למחוק רק אימון של המשתמש עצמו
  await supabase.from("activities").delete().eq("id", id);
  revalidatePath("/app", "layout");
}
