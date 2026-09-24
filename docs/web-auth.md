# התחברות ואימות טלפון באתר

- **תאריך:** 23 בספטמבר 2026
- **מממש את:** [spec-auth-and-app.md](spec-auth-and-app.md) — קריטריוני קבלה 1–6 ו-11–12
- **Supabase:** פרויקט `wellbeing-shop` (`owvvkwxzjuglrfeuujez`), ארגון `TomerAnliza`

## מה עובד

| כתובת | מה |
|---|---|
| `/` | דף תדמית. משתמש מחובר עובר ל-`/app` |
| `/signup` | שם, אימייל, סיסמה (8+), טלפון. `?phone=` ממלא מראש את הטלפון |
| `/login` | אימייל וסיסמה. `?next=` — לאן לחזור, רק נתיב פנימי |
| `/verify-phone` | קוד בן 6 ספרות, כפתור לוואטסאפ, והדף ממשיך לבד כשהבוט מאמת |
| `/app/profile` | שם, טלפון מאומת, "איתנו מאז", יציאה |
| `/forgot-password` | בקשת קישור איפוס. תשובה זהה לכל אימייל |
| `/auth/confirm` | הקישור מהמייל: `verifyOtp` בשרת, ואז `next` |
| `/reset-password` | סיסמה חדשה (8+, פעמיים) → "היום" עם טוסט "הסיסמה עודכנה" |
| `/app`, `/app/new`, `/app/progress` | דורשים משתמש מחובר **עם טלפון מאומת** |
| `/app/shop` | פתוח לכולם. מחובר רואה אווטאר, אורח רואה "כניסה" |

## הקוד

```text
web/src/
├── proxy.ts                       # Next.js 16 "Proxy": מרענן את ה-session בכל בקשה
├── lib/supabase/{server,client,proxy}.ts   # לפי הדוגמה הרשמית של Supabase
├── lib/auth.ts                    # getProfile, requireVerifiedProfile, safeNext
├── lib/phone.ts                   # 050-123-4567 ↔ 972501234567
├── app/actions/auth.ts            # Server Actions: signIn, signUp, signOut, changePhone, isPhoneVerified
└── app/(auth)/{login,signup,verify-phone}/
```

- **ה-proxy רק מרענן**, ואינו מפנה. כל עמוד מוגן קורא ל-`requireVerifiedProfile()` בשרת,
  שבודק עם `getClaims()` — כך ממליצים גם Next.js וגם Supabase
- **הודעות שגיאה בעברית** לפי `error.code` של Supabase, לא לפי הטקסט באנגלית
- **הערכים שהוקלדו נשמרים** כשיש שגיאה (`useActionState`)

## מסד הנתונים

מיגרציות ב-[`supabase/migrations/`](../supabase/migrations/), והורצו דרך ה-Management API של
Supabase:

| קובץ | מה |
|---|---|
| `20260923150000_auth_profiles_activities.sql` | `profiles`, `activities`, `phone_verifications`, RLS, טריגרים, `start_phone_verification`, `verify_phone` |
| `20260923151000_tighten_default_grants.sql` | הסרת `TRUNCATE`/`TRIGGER`/`REFERENCES` שהרשאות ברירת המחדל נתנו ל-`anon` ול-`authenticated` |
| `20260923160000_verify_phone_returns_user.sql` | `verify_phone` מחזירה גם `user_id` — לקישור הלקוח בגיליון |

**הגדרות Auth** (דרך ה-API, 23 בספטמבר 2026):

- **אישור אימייל: כבוי.** בלי SMTP משלנו, Supabase מאפשר שני מיילים בשעה (`rate_limit_email_sent = 2`
  — נבדק בהגדרות הפרויקט). האימות האמיתי הוא הטלפון
- **סיסמה:** 8 תווים לפחות
- **Site URL:** `https://wellbeing-shop.vercel.app`. כתובות חזרה מותרות: `localhost:3000` ו-Vercel

## אימות הטלפון — מקצה לקצה

```text
האתר                    Supabase                         וואטסאפ / n8n
/verify-phone ── rpc start_phone_verification() ──► קוד (15 דק׳)
   │  wa.me/972554680476?text=קוד אימות: 482913
   ▼
המשתמש שולח ────────────────────────────────────────► Meta → 055 → הבוט
                                                        בדיקת חתימה (App Secret)
                        verify_phone(טלפון השולח, קוד) ◄── rpc עם המפתח הסודי
                        phone_verified = true
   ▲                                                    תשובה + קישור הלקוח בגיליון
isPhoneVerified() כל 3 שניות → /app
```

פירוט צד הבוט: [whatsapp-bot-n8n.md](whatsapp-bot-n8n.md#בדיקת-חתימה-ואימות-טלפון).

## בדיקות

**אבטחה מול ה-API האמיתי** — 17 בדיקות, יוצרות משתמשי בדיקה ומוחקות אותם:

```bash
python3 supabase/tests/rls_check.py
```

17/17 עברו ב-23 בספטמבר 2026, לפני ואחרי המיגרציה השלישית. בין השאר:

- משתמש לא יכול לסמן לעצמו `phone_verified`, ולא להפעיל `verify_phone`
- קוד ממספר אחר, קוד שנוצל — נדחים
- אין שמירת אימון לפני אימות. משתמש ב׳ לא רואה ולא מוחק אימונים של א׳
- החלפת טלפון מבטלת אימות

**בדפדפן** (מובייל, `localhost:3000`): דף תדמית → הרשמה → קוד → אימות (הדמיה של הבוט) → הדף עבר
לבד ל"היום" עם אווטאר → יציאה → `/app/progress` מפנה ל-`/login?next=/app/progress` → סיסמה
שגויה: "האימייל או הסיסמה לא נכונים".

**דרך הבוט** (הודעה חתומה ממספר בדיקה): קוד שגוי → "הקוד לא תקין"; קוד נכון → "הטלפון אומת ✅",
`phone_verified = true`, ושורה חדשה ב-customers עם `user_id` ו-`source = web`.

## Vercel

משתני סביבה חדשים: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
(Production ו-Development). המפתח הציבורי מיועד להופיע בדפדפן — ההגנה על הנתונים היא RLS.
**Preview — לא הוגדר** (ה-CLI סירב בלי ענף git). להוסיף בממשק Vercel אם יידרש.

## שחזור סיסמה — 24 בספטמבר 2026

Supabase יוצר ובודק את הקישור; המשלוח עובר ל-n8n (Send Email Hook), דרך Gmail של
tomer@analiza-college.co.il. אפיון: [spec-auth-and-app.md](spec-auth-and-app.md#שחזור-סיסמה--מיילים-דרך-n8n).

- **n8n:** `wellbeing — מיילי התחברות (Supabase)` (`dIAIooHRDqNKOQXC`), קוד המקור ב-[`n8n/auth-email/`](../n8n/auth-email/).
  בודק חתימת Standard Webhooks, בונה מייל בעברית ושולח. 200 / 401 / 500. הרצות מוצלחות לא
  נשמרות — הן מכילות קישורי איפוס
- **הסוד:** נוצר במחשב, נשמר ב-Keychain (`SUPABASE_EMAIL_HOOK_SECRET_WELLBEING`), ב-Supabase
  (`hook_send_email_secrets`), ובמשתנה `SUPABASE_EMAIL_HOOK_SECRET` של n8n. n8n הופעל מחדש דרך
  SSH עם ה-override — חזר תוך 16 שניות, על האימג'ים המותאמים
- **מגבלת מיילים:** הועלתה מ-2 ל-30 בשעה (`rate_limit_email_sent`). Supabase מאפשר את זה כשהמשלוח
  לא דרך ה-SMTP המובנה

**נמצא בבדיקה ותוקן:**
- המחלקה `URL` לא קיימת בסביבת הקוד של n8n (task runner). הצומת נכשל, n8n החזיר גוף שאינו
  JSON, ו-Supabase החזיר לאתר 500 ("Error unmarshaling JSON output"). הוחלף ב-regex
- הקישור מגיע עם `token_hash` שמתחיל ב-`pkce_`, כי `@supabase/ssr` עובד ב-PKCE. `verifyOtp` בשרת
  מקבל אותו. **לא נבדק:** פתיחה במכשיר אחר מזה שביקש את השחזור

**נבדק בפרודקשן** (משתמש בדיקה `tomer+wbreset…@analiza-college.co.il`, נמחק בסוף):

| # | בדיקה | תוצאה |
|---:|---|---|
| 13 | "שכחתי סיסמה" | המייל הגיע לתיבה תוך דקה, בעברית, עם השם |
| 14 | הקישור → סיסמה חדשה | "היום" + "הסיסמה עודכנה". הישנה: `invalid_credentials`. החדשה: נכנסת |
| 15 | אותו קישור שוב | `/forgot-password?error=link` |
| 16 | webhook בלי חתימה | 401 |
| — | `/reset-password` בלי session | `/forgot-password?error=link` |
