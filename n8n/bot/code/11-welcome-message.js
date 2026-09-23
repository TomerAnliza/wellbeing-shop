// ── הודעת פתיחה ──────────────────────────────────────────────
// הודעה ראשונה למספר חדש: היכרות ושאלה על השם.
// שאלת השם לא חוסמת: אם הלקוח פתח בשאלה, מבטיחים לחזור אליה.

const customer = $('זיהוי לקוח').first().json;

const openedWithQuestion =
  /[?？]/.test(customer.text) || /^(כמה|מה|איך|האם|יש|איפה|מתי|אפשר)\s/.test(customer.text);

let text = 'היי! אני העוזר של החנות 👋\nאיך קוראים לך?';

// TODO: לשמור את השאלה הראשונה ולענות עליה אחרי ההיכרות
if (openedWithQuestion) {
  text += '\n\n(אחרי שנכיר — שלחו לי את השאלה שוב ואענה מיד 🙂)';
}

return [{ json: { phone: customer.phone, route: 'onboarding', kind: 'text', text } }];
