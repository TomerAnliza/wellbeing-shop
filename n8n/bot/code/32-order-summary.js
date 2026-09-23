// ── סיכום הזמנה ──────────────────────────────────────────────
// לפני כל הזמנה — סיכום ובקשת אישור: [כן, להזמין] [ביטול].
// מגיע לכאן מלחיצה על "להזמין", או מ"טוב תזמין" בטקסט חופשי (המוצר מההקשר).
// אם המוצר אזל או שאין מספיק במלאי — מציעים חלופה, ולא ממשיכים לאישור.

const customer = $('זיהוי לקוח').first().json;
const input = $input.first().json;
const { catalog } = input;

const product = catalog.find(item => item.id === (input.product || input.ctxProduct));
const qty = Math.min(10, Math.max(1, Number(input.qty) || 1));

if (!product || product.stock <= 0) {
  return [
    reply('list', {
      button: 'לבחירת מוצר',
      section: 'מוצרים',
      text: product
        ? `${product.name} אזל כרגע 😕 אפשר לבחור מוצר אחר:`
        : 'איזה מוצר להזמין? בחרו מהרשימה 👇',
      rows: productRows(catalog),
    }),
  ];
}

rememberProduct(customer.phone, product.id);

if (qty > product.stock) {
  return [
    reply('buttons', {
      text: `אין במלאי מספיק ${product.name} לכמות של ${qty} 😕 אפשר להזמין יחידה אחת, ונציג יבדוק איתכם את השאר.`,
      buttons: [
        { id: 'order_' + product.id, title: 'להזמין יחידה אחת' },
        { id: 'route_sales', title: 'מוצרים נוספים' },
      ],
    }),
  ];
}

const orderedBy = customer.name && customer.name !== 'לקוח' ? customer.name : 'הטלפון הזה';

return [
  reply('buttons', {
    text: [
      'לסיכום:',
      `${product.name} × ${qty} — ${shekels(product.price * qty)}`,
      `על שם ${orderedBy}.`,
      '',
      'אין תשלום בוואטסאפ: אחרי השליחה נציג יחזור אליכם לתיאום תשלום ומשלוח. לשלוח את ההזמנה?',
    ].join('\n'),
    buttons: [
      // הכמות עוברת בתוך מזהה הכפתור — כך האישור לא תלוי בזיכרון
      { id: `confirm_${product.id}_q${qty}`, title: 'כן, להזמין' },
      { id: 'cancel', title: 'ביטול' },
    ],
  }),
];

function reply(kind, fields) {
  return { json: { phone: customer.phone, route: 'order', kind, ...fields } };
}
function rememberProduct(phone, id) {
  const store = $getWorkflowStaticData('global');
  store.ctx = store.ctx || {};
  store.ctx[phone] = { product: id, at: Date.now() };
}
function productRows(list) {
  return list.slice(0, 10).map(item => ({
    id: 'prod_' + item.id,
    title: item.name,
    description: `${shekels(item.price)} · ${stockLabel(item.stock)}`,
  }));
}
function stockLabel(stock) {
  if (stock <= 0) return 'אזל';
  if (stock <= 5) return 'נשארו מעט';
  return 'במלאי';
}
function shekels(amount) {
  return Math.round(amount * 100) / 100 + ' ₪';
}
