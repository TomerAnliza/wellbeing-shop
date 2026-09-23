// ── תשובת כושר ───────────────────────────────────────────────
// התשובה של יועץ הכושר (OpenAI), כמו שהיא. אם הקריאה נכשלה — הודעת גיבוי.

const customer = $('זיהוי לקוח').first().json;
const answer = $input.first().json?.choices?.[0]?.message?.content;

const text =
  typeof answer === 'string' && answer.trim()
    ? answer.trim()
    : 'סליחה, משהו השתבש אצלי 🙏 נציג יחזור אלייך כאן בהקדם.';

return [{ json: { phone: customer.phone, route: 'fitness', kind: 'text', text } }];
