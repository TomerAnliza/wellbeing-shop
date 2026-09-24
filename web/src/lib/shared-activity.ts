import "server-only";
import { cache } from "react";
import type { ActivityType } from "@/lib/activity";
import { sanitizeRoute, type Route } from "@/lib/geo";
import { createClient } from "@/lib/supabase/server";

export type SharedActivity = {
  first_name: string;
  type: ActivityType;
  day: string; // YYYY-MM-DD, בלי שעה
  duration_minutes: number;
  distance_km: number | null;
  distance_source: "estimated" | "gps";
  calories: number;
  route: Route; // המסלול החתוך — בלי 200 המטרים הראשונים והאחרונים
};

// אימון משותף לפי אסימון. הפונקציה get_shared_activity פתוחה גם לאורחים, ומחזירה רק את
// השדות שמותר להציג (supabase/migrations/20260924090000_…). שיתוף שבוטל → null
export const getSharedActivity = cache(async (token: string): Promise<SharedActivity | null> => {
  if (!/^[A-Za-z0-9_-]{16,40}$/.test(token)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_shared_activity", { p_token: token });
  if (error || !data) return null;
  return {
    ...data,
    distance_km: data.distance_km === null ? null : Number(data.distance_km),
    route: data.route ? sanitizeRoute(data.route) : [],
  } as SharedActivity;
});
