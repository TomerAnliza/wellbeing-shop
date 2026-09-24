"use client";

import { useState, useTransition } from "react";
import { deleteActivityAndReturn, shareActivity, unshareActivity } from "@/app/actions/share";

// שיתוף, הפסקת שיתוף ומחיקה. בטלפון — תפריט השיתוף של המערכת (Web Share API: וואטסאפ,
// אינסטגרם...). במחשב, או כשאין תמיכה — העתקת הקישור
export function ActivityActions({ activityId, sharedToken, hasRoute }: { activityId: string; sharedToken: string | null; hasRoute: boolean }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function share() {
    setMessage(null);
    start(async () => {
      const result = await shareActivity(activityId);
      if (!result.url) {
        setMessage(result.error ?? "לא הצלחנו ליצור קישור.");
        return;
      }
      const data = { title: "האימון שלי ב-Wellbeing", text: "תראו את האימון שלי 💪", url: result.url };
      if (navigator.share && navigator.canShare?.(data)) {
        try {
          await navigator.share(data);
          return;
        } catch {
          // המשתמש סגר את תפריט השיתוף — ממשיכים להעתקה
        }
      }
      await navigator.clipboard.writeText(result.url).catch(() => {});
      setMessage("הקישור הועתק. אפשר להדביק אותו בכל מקום.");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={share}
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-[18px] bg-brand py-3.5 text-[15px] font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
      >
        <span className="ms text-[20px]" aria-hidden>ios_share</span>
        {sharedToken ? "לשתף שוב" : "שיתוף"}
      </button>

      {sharedToken && (
        <div className="rounded-[16px] bg-brand-soft px-4 py-3 text-[12.5px] leading-relaxed text-brand-soft-ink">
          האימון משותף בקישור ציבורי{hasRoute ? ", בלי 200 המטרים הראשונים והאחרונים של המסלול" : ""}.{" "}
          <button
            onClick={() => start(async () => { await unshareActivity(activityId); setMessage("השיתוף הופסק. הקישור כבר לא עובד."); })}
            disabled={pending}
            className="font-semibold underline underline-offset-2"
          >
            להפסיק לשתף
          </button>
        </div>
      )}

      {message && <p role="status" className="text-center text-[13px] text-ink-2">{message}</p>}

      {confirmDelete ? (
        <div className="flex items-center justify-between gap-3 rounded-[16px] border border-ink/10 px-4 py-3 text-[13px]">
          <span>למחוק את האימון? אי אפשר לשחזר.</span>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDelete(false)} className="text-ink-2">ביטול</button>
            <button onClick={() => start(() => deleteActivityAndReturn(activityId))} className="font-semibold text-[oklch(0.5_0.14_30)]">
              למחוק
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setConfirmDelete(true)} className="py-1 text-[13px] text-ink-3 hover:text-ink-2">
          מחיקת האימון
        </button>
      )}
    </div>
  );
}
