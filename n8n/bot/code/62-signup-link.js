// ── קישור הרשמה ──────────────────────────────────────────────
// TODO: להחליף בקישור הרשמה אמיתי עם אסימון חד-פעמי שקשור לטלפון
// (docs/spec-shop-and-agent.md — "כניסה לבוט")

const customer = $('זיהוי לקוח').first().json;

return [
  {
    json: {
      phone: customer.phone,
      route: 'signup',
      kind: 'text',
      text: [
        'מי שמתאמן באפליקציה ומשלים את היעד השבועי מקבל 10% הנחה בחנות 💪',
        'להרשמה: https://example.com/signup',
        '(קישור זמני — יוחלף בקישור האמיתי)',
      ].join('\n'),
    },
  },
];
