"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "@/app/actions/auth";

// מחיקת חשבון, עם אישור מפורש: הקלדת "מחיקה". אי אפשר לשחזר
export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!open) {
    return <button onClick={() => setOpen(true)} className="text-[oklch(0.5_0.14_30)] underline underline-offset-2">מחיקת החשבון</button>;
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="מחיקת החשבון" className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-[24px] bg-card p-6 text-start">
        <h2 className="text-[18px] font-semibold">למחוק את החשבון?</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2">
          החשבון, הפרופיל, כל האימונים, המסלולים והשיתופים יימחקו מיד. אי אפשר לשחזר.
          שיחות והזמנות בוואטסאפ לא נמחקות מכאן — ראו מדיניות הפרטיות.
        </p>
        <label className="mt-4 flex flex-col gap-1.5 text-[13px]">
          כדי לאשר, הקלידו <b>מחיקה</b>
          <input value={typed} onChange={e => setTyped(e.target.value)} autoFocus
                 className="rounded-[12px] border border-ink/15 bg-screen px-3 py-2.5 text-[15px] outline-none focus:border-[oklch(0.5_0.14_30)]" />
        </label>
        {error && <p role="alert" className="mt-2 text-[13px] text-[oklch(0.5_0.14_30)]">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button onClick={() => { setOpen(false); setTyped(""); }} className="flex-1 rounded-[14px] border border-ink/10 py-3 text-[14px] font-medium">
            ביטול
          </button>
          <button
            disabled={typed.trim() !== "מחיקה" || pending}
            onClick={() => start(async () => { const result = await deleteAccount(); if (result?.error) setError(result.error); })}
            className="flex-1 rounded-[14px] bg-[oklch(0.5_0.14_30)] py-3 text-[14px] font-semibold text-white disabled:opacity-40"
          >
            {pending ? "מוחקים..." : "למחוק לצמיתות"}
          </button>
        </div>
      </div>
    </div>
  );
}
