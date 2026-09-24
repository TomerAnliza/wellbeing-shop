// ── בדיקת חתימה ──────────────────────────────────────────────
// Supabase חותם כל קריאה ל-Send Email Hook לפי Standard Webhooks:
//   תוכן חתום = "<webhook-id>.<webhook-timestamp>.<הגוף הגולמי>"
//   מפתח     = base64-decode של הסוד, בלי הקידומת "v1,whsec_"
//   חתימה    = "v1,<base64 של HMAC-SHA256>" — ייתכנו כמה, מופרדות ברווח
// הסוד: משתנה הסביבה SUPABASE_EMAIL_HOOK_SECRET של n8n. בקשה ישנה מ-5 דקות — נדחית.
// פלט תמיד פריט אחד: { valid, reason?, payload? } — הצומת הבא מחליט אם לשלוח או להחזיר 401

const crypto = require('crypto');

const request = $input.first();
const headers = request.json.headers ?? {};
const secret = String($env.SUPABASE_EMAIL_HOOK_SECRET ?? '');
const id = String(headers['webhook-id'] ?? '');
const timestamp = String(headers['webhook-timestamp'] ?? '');
const signatures = String(headers['webhook-signature'] ?? '').split(' ');

const reject = reason => [{ json: { valid: false, reason } }];

if (!secret.startsWith('v1,whsec_')) return reject('missing secret');
if (!id || !timestamp || !signatures[0]) return reject('missing headers');
if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return reject('stale timestamp');

const rawBody = await this.helpers.getBinaryDataBuffer(0, 'data');
const key = Buffer.from(secret.slice('v1,whsec_'.length), 'base64');
const expected = crypto
  .createHmac('sha256', key)
  .update(`${id}.${timestamp}.`)
  .update(rawBody)
  .digest('base64');

const matches = signatures.some(signature => {
  const value = signature.startsWith('v1,') ? signature.slice(3) : '';
  return (
    value.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected))
  );
});

if (!matches) return reject('bad signature');

return [{ json: { valid: true, payload: JSON.parse(rawBody.toString('utf8')) } }];
