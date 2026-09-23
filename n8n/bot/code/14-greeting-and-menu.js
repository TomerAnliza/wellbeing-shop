// ── ברכה ותפריט ──────────────────────────────────────────────
// אחרי שהשם נשמר: ברכה בשם + רשימת האפשרויות.
// אם השם לא נקלט — שואלים שוב.

const result = $('בדיקת שם').first().json;

if (result.askAgain) {
  return [
    {
      json: {
        phone: result.phone,
        route: 'onboarding',
        kind: 'text',
        text: 'לא הצלחתי לקלוט את השם 🙂 איך לפנות אלייך?',
      },
    },
  ];
}

// המזהים (route_...) חוזרים אלינו כשהלקוח בוחר שורה — ראו "הקשר ובחירה"
const MENU = [
  { id: 'route_sales', title: 'מכירות', description: 'מוצרים, מחירים ומלאי' },
  { id: 'route_support', title: 'שירות לקוחות', description: 'בעיה בהזמנה או במוצר' },
  { id: 'route_fitness', title: 'ייעוץ כושר', description: 'טיפים כלליים לאימון' },
  { id: 'route_shipping', title: 'מידע על משלוח', description: 'איפה ההזמנה שלי?' },
  { id: 'route_signup', title: 'הרשמה לאפליקציה', description: 'הנחת כושר למתאמנים' },
];

const hello = result.name === 'לקוח' ? 'נעים מאוד!' : `נעים מאוד, ${result.name}! 😊`;

return [
  {
    json: {
      phone: result.phone,
      route: 'onboarding',
      kind: 'list',
      button: 'אפשרויות',
      text: [
        hello,
        'אני העוזר של החנות. אפשר לשאול אותי על מוצרים, מחירים ומשלוחים. במה אפשר לעזור?',
      ].join('\n'),
      rows: MENU,
    },
  },
];
