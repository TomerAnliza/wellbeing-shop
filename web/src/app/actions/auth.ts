"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile, safeNext } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";

// מצב הטופס שחוזר ללקוח: הודעת שגיאה, והערכים שהוקלדו — כדי לא למחוק אותם
export type FormState = { error?: string; values?: Record<string, string> };

// הודעות Supabase Auth → עברית. לפי error.code, לא לפי הטקסט באנגלית
const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: "האימייל או הסיסמה לא נכונים.",
  user_already_exists: "כבר יש חשבון עם האימייל הזה. אפשר להתחבר.",
  email_exists: "כבר יש חשבון עם האימייל הזה. אפשר להתחבר.",
  weak_password: "הסיסמה חלשה מדי. צריך 8 תווים לפחות.",
  email_address_invalid: "כתובת האימייל לא תקינה.",
  over_request_rate_limit: "יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.",
};
const authError = (code?: string) => AUTH_ERRORS[code ?? ""] ?? "משהו השתבש. נסו שוב בעוד רגע.";

const text = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();

// ── התחברות ─────────────────────────────────────────────────────────
export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "צריך אימייל וסיסמה.", values: { email } };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: authError(error.code), values: { email } };

  // טלפון שלא אומת — העמוד הבא יפנה ל-/verify-phone
  redirect(safeNext(formData.get("next")));
}

// ── הרשמה ───────────────────────────────────────────────────────────
export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { name: text(formData, "name"), email: text(formData, "email"), phone: text(formData, "phone") };
  const password = String(formData.get("password") ?? "");

  if (values.name.length < 2 || values.name.length > 40) return { error: "איך קוראים לך? (2–40 תווים)", values };
  if (password.length < 8) return { error: "סיסמה של 8 תווים לפחות.", values };
  const phone = normalizePhone(values.phone);
  if (!phone) return { error: "מספר הטלפון לא תקין. לדוגמה: 050-123-4567", values };

  const supabase = await createClient();
  // השם והטלפון נשמרים ב-metadata, וטריגר ב-Postgres יוצר מהם את הפרופיל
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password,
    options: { data: { display_name: values.name, phone } },
  });
  if (error) return { error: authError(error.code), values };
  // אישור אימייל כבוי (docs/spec-auth-and-app.md), ולכן יש session מיד
  if (!data.session) return { error: "נרשמת, אבל לא הצלחנו להכניס אותך. נסו להתחבר.", values };

  redirect("/verify-phone");
}

// ── יציאה ───────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// ── אימות טלפון ─────────────────────────────────────────────────────

/** נבדק מהדף כל כמה שניות, עד שהבוט מאמת */
export async function isPhoneVerified(): Promise<boolean> {
  const profile = await getProfile();
  return Boolean(profile?.phone_verified);
}

/** "המספר לא נכון" — עדכון הטלפון. טריגר ב-Postgres מבטל את האימות */
export async function changePhone(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/verify-phone");

  const phone = normalizePhone(text(formData, "phone"));
  if (!phone) return { error: "מספר הטלפון לא תקין. לדוגמה: 050-123-4567", values: { phone: text(formData, "phone") } };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ phone }).eq("id", profile.id);
  if (error) return { error: "לא הצלחנו לעדכן את המספר. נסו שוב." };

  revalidatePath("/verify-phone");
  return {};
}
