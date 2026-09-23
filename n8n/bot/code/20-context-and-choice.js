// ── הקשר ובחירה ──────────────────────────────────────────────
// לקוח מוכר: מצמיד להודעה את הקטלוג, את המוצר האחרון שנבחר ואת זיכרון השיחה,
// ומחליט מה לעשות — בלי מודל, כשאפשר:
//   route    — נבחרה שורה בתפריט (route_sales ...)
//   product  — נבחר מוצר מרשימה (prod_P-001), או שההודעה מהאתר מכילה קוד מוצר
//   order    — נלחץ "להזמין" (order_P-001)
//   confirm  — נלחץ "כן, להזמין" (confirm_P-001_q2 = מוצר P-001, כמות 2)
//   cancel   — נלחץ "ביטול"
//   image    — הלקוח שלח תמונה
//   classify — טקסט חופשי: פקיד הקבלה (OpenAI) יסווג אותו
// פלט: הלקוח + { action, route, product, qty, ctxProduct, catalog, history, fromMenu }

const customer = $('זיהוי לקוח').first().json;
const store = $getWorkflowStaticData('global'); // זיכרון של התרחיש בין הרצות
const DAY = 24 * 60 * 60 * 1000;

// ── קטלוג: רק מוצרים פעילים ──
const catalog = $input
  .all()
  .map(item => item.json)
  .filter(row => row.id && String(row.active).trim() === 'כן')
  .map(row => ({
    id: String(row.id),
    name: String(row.name),
    category: String(row.category),
    description: String(row.description),
    price: Number(row.price_ils),
    stock: Number(row.stock),
    image: String(row.image || '').trim(),
  }));

// ── המוצר האחרון שהלקוח צפה בו (נשמר ל-24 שעות) ──
const context = (store.ctx || {})[customer.phone] || {};
const ctxProduct = context.at && Date.now() - context.at < DAY ? context.product : null;

// ── מה לעשות ──
// כפתורים ורשימות מחזירים מזהה עם קידומת — כך יודעים מה נלחץ בלי לשאול את המודל
const replyId = String(customer.replyId || '');
let action = 'classify';
let route = null;
let product = null;
let qty = 1;

if (replyId.startsWith('route_')) {
  action = 'route';
  route = replyId.slice('route_'.length);
} else if (replyId.startsWith('prod_')) {
  action = 'product';
  product = replyId.slice('prod_'.length);
} else if (replyId.startsWith('order_')) {
  action = 'order';
  product = replyId.slice('order_'.length);
} else if (replyId.startsWith('confirm_')) {
  action = 'confirm';
  const [, id, count] = replyId.slice('confirm_'.length).match(/^(.+?)(?:_q(\d+))?$/);
  product = id;
  qty = Number(count || 1);
} else if (replyId === 'cancel') {
  action = 'cancel';
} else if (customer.type === 'image' && customer.media_id) {
  // תמונה מלקוח מוכר = פנייה לשירות (מוצר פגום, חבילה)
  action = 'image';
} else {
  // "שאל בוואטסאפ" באתר שולח "שאלה על <מוצר> (P-004)" — קוד מוכר פותח את כרטיס המוצר
  const code = String(customer.text || '').match(/\((P-\d{3})\)/);
  if (code && catalog.some(item => item.id === code[1])) {
    action = 'product';
    product = code[1];
  }
}

// ── זיכרון שיחה: 8 ההודעות האחרונות מ-24 השעות האחרונות (נכתבות ב"רישום שיחה") ──
const history = ((store.hist || {})[customer.phone] || [])
  .filter(entry => Date.now() - entry.at < DAY)
  .slice(-8)
  .map(entry => {
    const who = entry.role === 'user' ? 'לקוח' : 'בוט';
    return `${who}: ${entry.text.replace(/\s+/g, ' ').slice(0, 300)}`;
  })
  .join('\n');

return [
  {
    json: {
      ...customer,
      action,
      route,
      product,
      qty,
      ctxProduct,
      catalog,
      history,
      fromMenu: action === 'route',
    },
  },
];
