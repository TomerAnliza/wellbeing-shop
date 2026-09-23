// ── תשובת מכירות ─────────────────────────────────────────────
// סוכן המכירות (OpenAI) מחזיר {"text", "product_ids"}. כאן בונים ממנו רשימת מוצרים.
// מחירים ומלאי נלקחים מהקטלוג — לא ממה שהמודל כתב.

const customer = $('זיהוי לקוח').first().json;
const { catalog } = $('ניתוב').first().json;

let text = 'הנה המוצרים שלנו 👇 בחרו מוצר כדי לראות פרטים ולהזמין.';
let ids = [];
try {
  const answer = JSON.parse($input.first().json.choices[0].message.content);
  if (typeof answer.text === 'string' && answer.text.trim()) text = answer.text.trim();
  if (Array.isArray(answer.product_ids)) ids = answer.product_ids.map(String);
} catch (error) {
  // תשובה לא תקינה מהמודל → טקסט ברירת המחדל וכל הקטלוג
}

// רק מזהים שקיימים בקטלוג. אם המודל לא בחר אף מוצר — כל הקטלוג
let products = ids.map(id => catalog.find(item => item.id === id)).filter(Boolean);
if (products.length === 0) products = catalog;

return [
  {
    json: {
      phone: customer.phone,
      route: 'sales',
      kind: 'list',
      button: 'לבחירת מוצר',
      section: 'מוצרים',
      text,
      rows: productRows(products),
    },
  },
];

// שורות לרשימה בוואטסאפ: עד 10, עם מחיר ומצב מלאי
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
