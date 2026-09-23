// ── בדיקת שם ─────────────────────────────────────────────────
// בודק את השם ש-OpenAI חילץ מהתשובה. שלושה מצבים:
//   שם תקין                 → שומרים אותו
//   ניסיון ראשון שנכשל      → name = "?" ושואלים שוב (askAgain)
//   ניסיון שני שנכשל        → שם הפרופיל בוואטסאפ, ואם אין — "לקוח"
// פלט: { phone, name, whatsapp_name, askAgain }

const customer = $('זיהוי לקוח').first().json;

let name = '';
try {
  const answer = JSON.parse($input.first().json.choices[0].message.content);
  if (typeof answer.name === 'string') name = answer.name.trim();
} catch (error) {
  // תשובה לא תקינה מהמודל = לא התקבל שם
}

const isValid = name.length >= 2 && name.length <= 30 && !/[?\d@]/.test(name);
const profileName = String(customer.profile_name || '').trim();
const base = { phone: customer.phone, whatsapp_name: profileName };

if (isValid) {
  return [{ json: { ...base, name, askAgain: false } }];
}

const firstAttempt = customer.name === '';
if (firstAttempt) {
  return [{ json: { ...base, name: '?', askAgain: true } }];
}

return [{ json: { ...base, name: profileName || 'לקוח', askAgain: false } }];
