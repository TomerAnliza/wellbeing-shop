"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { sanitizeRoute, trimRoute } from "@/lib/geo";
import { createClient } from "@/lib/supabase/server";

async function siteOrigin() {
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "https"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
}

/**
 * שיתוף אימון: מחזיר קישור ציבורי. המסלול שנשמר לשיתוף **חתוך** — בלי 200 המטרים
 * הראשונים והאחרונים (אזור פרטיות, docs/spec-gps-map-share.md). המסלול המלא לא יוצא מ-RLS
 */
export async function shareActivity(activityId: string): Promise<{ url?: string; error?: string }> {
  if (!(await getProfile())) return { error: "צריך להתחבר מחדש." };
  const supabase = await createClient();

  const { data: activity } = await supabase.from("activities").select("id, route").eq("id", activityId).single();
  if (!activity) return { error: "האימון לא נמצא." };

  const publicRoute = activity.route ? trimRoute(sanitizeRoute(activity.route)) : null;
  const { data: token, error } = await supabase.rpc("share_activity", {
    p_activity: activityId,
    p_public_route: publicRoute && publicRoute.length ? publicRoute : null,
  });
  if (error || !token) return { error: "לא הצלחנו ליצור קישור. נסו שוב." };

  revalidatePath(`/app/activity/${activityId}`);
  return { url: `${await siteOrigin()}/share/${token}` };
}

/** הפסקת שיתוף: הקישור מפסיק לעבוד מיד. RLS מאפשר למחוק רק שיתוף של המשתמש עצמו */
export async function unshareActivity(activityId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("activity_shares").delete().eq("activity_id", activityId);
  revalidatePath(`/app/activity/${activityId}`);
}

/** מחיקת אימון, וחזרה ל"היום". השיתוף שלו נמחק איתו (cascade) */
export async function deleteActivityAndReturn(activityId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("activities").delete().eq("id", activityId);
  revalidatePath("/app", "layout");
  redirect("/app");
}
