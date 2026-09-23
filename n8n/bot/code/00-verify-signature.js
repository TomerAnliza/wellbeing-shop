// ── בדיקת חתימה ──────────────────────────────────────────────
// Meta חותמת כל webhook ב-HMAC-SHA256 של הגוף הגולמי, עם ה-App Secret של האפליקציה,
// בכותרת X-Hub-Signature-256. בלי הבדיקה הזו, כל מי שמכיר את הכתובת יכול לשלוח
// הודעה "מטלפון של מישהו אחר" — ולאמת מספר שאינו שלו (docs/spec-auth-and-app.md).
//
// הסוד: משתנה הסביבה META_APP_SECRET_WELLBEING של n8n — לא בתרחיש ולא בגיט.
// הגוף הגולמי: ה-webhook שומר אותו (rawBody) בשדה הבינארי data.
// חתימה חסרה או שגויה → הבקשה נזרקת בשקט. גם סוד חסר → נזרקת (נכשלים סגור).

const crypto = require('crypto');

const request = $input.first();
const secret = $env.META_APP_SECRET_WELLBEING;
const received = String(request.json.headers?.['x-hub-signature-256'] ?? '');

if (!secret || !received) return [];

const rawBody = await this.helpers.getBinaryDataBuffer(0, 'data');
const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

// השוואה בזמן קבוע — כדי לא לחשוף דרך זמני תגובה כמה תווים נכונים
const valid =
  received.length === expected.length &&
  crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));

if (!valid) return [];

// ממשיכים בלי הקובץ הבינארי — מכאן והלאה עובדים עם ה-JSON
return [{ json: request.json }];
