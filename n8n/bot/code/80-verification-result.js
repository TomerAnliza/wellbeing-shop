// ── תוצאת אימות ──────────────────────────────────────────────
// התשובה של Supabase (rpc verify_phone): { status, name, user_id }.
//   verified      — הטלפון אומת. דף האימות באתר ממשיך לבד
//   invalid       — קוד שגוי, שפג, שכבר נוצל, או שנשלח ממספר אחר
//   taken         — המספר כבר מאומת בחשבון אחר
//   phone_changed — המשתמש החליף מספר אחרי שביקש את הקוד
// כשל בקריאה עצמה → הודעת גיבוי.

const customer = $('זיהוי לקוח').first().json;
const result = $input.first().json;

const REPLIES = {
  verified: `הטלפון אומת ✅${result.name ? ' ' + result.name + ',' : ''} אפשר לחזור לאתר — הוא כבר ממשיך לבד.`,
  invalid: 'הקוד לא תקין, או שעבר הזמן שלו. אפשר לקבל קוד חדש באתר, בדף אימות הטלפון.',
  taken: 'המספר הזה כבר מאומת בחשבון אחר. אם זו טעות — כתבו לי "נציג" ונבדוק.',
  phone_changed: 'המספר בחשבון השתנה מאז שביקשת את הקוד. אפשר לקבל קוד חדש באתר.',
};

const text = REPLIES[result.status] ?? 'לא הצלחתי לאמת כרגע 🙏 נסו לשלוח את הקוד שוב בעוד רגע.';

return [
  {
    json: {
      phone: customer.phone,
      route: 'verify',
      kind: 'text',
      text,
      // לענף המקביל שמקשר את הלקוח בגיליון לחשבון באתר
      verified: result.status === 'verified',
      user_id: result.user_id ?? '',
      name: result.name ?? '',
    },
  },
];
