// ── שאלת הבהרה ───────────────────────────────────────────────
// פקיד הקבלה לא הבין מה הלקוח רוצה (או שזו רק ברכה) — מציגים את התפריט.

const customer = $('זיהוי לקוח').first().json;

const MENU = [
  { id: 'route_sales', title: 'מכירות', description: 'מוצרים, מחירים ומלאי' },
  { id: 'route_support', title: 'שירות לקוחות', description: 'בעיה בהזמנה או במוצר' },
  { id: 'route_fitness', title: 'ייעוץ כושר', description: 'טיפים כלליים לאימון' },
  { id: 'route_shipping', title: 'מידע על משלוח', description: 'איפה ההזמנה שלי?' },
  { id: 'route_signup', title: 'הרשמה לאפליקציה', description: 'הנחת כושר למתאמנים' },
];

const hi = customer.name && customer.name !== 'לקוח' ? `היי ${customer.name}! ` : 'היי! ';

return [
  {
    json: {
      phone: customer.phone,
      route: 'unclear',
      kind: 'list',
      button: 'אפשרויות',
      text: hi + 'במה אפשר לעזור? אפשר לבחור מהרשימה או פשוט לכתוב לי.',
      rows: MENU,
    },
  },
];
