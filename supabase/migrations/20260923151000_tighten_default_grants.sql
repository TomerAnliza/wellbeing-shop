-- ════════════════════════════════════════════════════════════════════
-- הרשאות ברירת המחדל של Supabase נתנו ל-anon ול-authenticated גם
-- TRUNCATE, TRIGGER ו-REFERENCES על כל טבלה חדשה.
-- ה-Data API לא יכול להריץ אותן, אבל RLS לא חל על TRUNCATE —
-- לכן מסירים אותן. נשאר רק מה שהוגדר במפורש במיגרציה הקודמת.
-- ════════════════════════════════════════════════════════════════════

revoke truncate, trigger, references on public.profiles, public.activities, public.phone_verifications
  from anon, authenticated;

-- anon (לא מחובר) לא צריך שום גישה לטבלאות האלה
revoke all on public.profiles, public.activities, public.phone_verifications from anon;
