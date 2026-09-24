"use client";

import { useOptimistic, useState, useTransition } from "react";
import { updateProfile, type ProfileUpdate } from "@/app/actions/profile";
import type { Units } from "@/lib/activity";

type Settings = { name: string; weeklyGoal: number; units: Units; showStreak: boolean };

// רשימת ההגדרות. כל שינוי נשמר מיד (בלי כפתור "שמירה"), ומוצג מיד — optimistic.
// אם השמירה נכשלה, הערך חוזר, ומופיעה הודעה
export function ProfileSettings(initial: Settings) {
  const [settings, setOptimistic] = useOptimistic(initial, (current, patch: Partial<Settings>) => ({ ...current, ...patch }));
  const [error, setError] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [, startTransition] = useTransition();

  function save(patch: Partial<Settings>, update: ProfileUpdate) {
    setError(null);
    startTransition(async () => {
      setOptimistic(patch);
      const result = await updateProfile(update);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="overflow-hidden rounded-[22px] border border-card-border bg-card">
      {/* שם */}
      <Row icon="badge" label="שם">
        {editingName ? (
          <form
            className="flex items-center gap-2"
            action={formData => {
              const value = String(formData.get("name") ?? "").trim();
              setEditingName(false);
              if (value && value !== settings.name) save({ name: value }, { field: "display_name", value });
            }}
          >
            <input name="name" defaultValue={settings.name} autoFocus maxLength={40}
                   className="w-32 rounded-lg border border-ink/15 bg-screen px-2 py-1 text-[13.5px] outline-none focus:border-brand" />
            <button className="text-[13px] font-semibold text-brand-hover">שמירה</button>
          </form>
        ) : (
          <button onClick={() => setEditingName(true)} className="flex items-center gap-1 text-[13px] text-ink-2 hover:text-ink">
            {settings.name}
            <span className="ms text-[16px]" aria-hidden>edit</span>
          </button>
        )}
      </Row>

      {/* יעד שבועי: 3–7 */}
      <Row icon="flag" label="יעד שבועי">
        <div className="flex items-center gap-2" role="group" aria-label="יעד שבועי">
          <StepButton icon="remove" label="פחות" disabled={settings.weeklyGoal <= 3}
                      onClick={() => save({ weeklyGoal: settings.weeklyGoal - 1 }, { field: "weekly_goal", value: settings.weeklyGoal - 1 })} />
          <span className="w-16 text-center text-[13px] text-ink-2 tabular-nums">{settings.weeklyGoal} אימונים</span>
          <StepButton icon="add" label="יותר" disabled={settings.weeklyGoal >= 7}
                      onClick={() => save({ weeklyGoal: settings.weeklyGoal + 1 }, { field: "weekly_goal", value: settings.weeklyGoal + 1 })} />
        </div>
      </Row>

      {/* יחידות */}
      <Row icon="straighten" label="יחידות">
        <div className="flex rounded-full bg-ink/5 p-0.5 text-[12.5px]" role="radiogroup" aria-label="יחידות">
          {(["metric", "imperial"] as const).map(value => (
            <button key={value} role="radio" aria-checked={settings.units === value}
                    onClick={() => settings.units !== value && save({ units: value }, { field: "units", value })}
                    className={`rounded-full px-3 py-1 ${settings.units === value ? "bg-card font-semibold shadow-sm" : "text-ink-2"}`}>
              {value === "metric" ? "מטרי" : "אימפריאלי"}
            </button>
          ))}
        </div>
      </Row>

      {/* רצף */}
      <Row icon="local_fire_department" label="להציג רצף ימים" last>
        <button role="switch" aria-checked={settings.showStreak} aria-label="להציג רצף ימים"
                onClick={() => save({ showStreak: !settings.showStreak }, { field: "show_streak", value: !settings.showStreak })}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings.showStreak ? "bg-brand" : "bg-ink/15"}`}>
          <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${settings.showStreak ? "start-[22px]" : "start-0.5"}`} />
        </button>
      </Row>

      {error && <p role="alert" className="border-t border-card-border px-4 py-2.5 text-[13px] text-[oklch(0.42_0.1_40)]">{error}</p>}
    </div>
  );
}

function Row({ icon, label, last, children }: { icon: string; label: string; last?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex min-h-[58px] items-center gap-3 px-4 py-3 ${last ? "" : "border-b border-card-border"}`}>
      <span className="ms text-[20px] text-ink-3" aria-hidden>{icon}</span>
      <span className="flex-1 text-[14.5px]">{label}</span>
      {children}
    </div>
  );
}

function StepButton({ icon, label, disabled, onClick }: { icon: string; label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label}
            className="flex size-7 items-center justify-center rounded-full border border-ink/10 hover:bg-ink/5 disabled:opacity-30">
      <span className="ms text-[17px]" aria-hidden>{icon}</span>
    </button>
  );
}
