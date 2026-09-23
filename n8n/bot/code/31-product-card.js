// ── פרטי מוצר ────────────────────────────────────────────────
// כרטיס מוצר: תמונה, תיאור, מחיר ומלאי, עם כפתורים [להזמין] [מוצרים נוספים].
// המוצר נשמר כ"מוצר בהקשר" ל-24 שעות — כדי ש"תזמין" בטקסט חופשי יידע למה הכוונה.

const customer = $('זיהוי לקוח').first().json;
const { catalog, product: productId } = $input.first().json;
const PRODUCT_IMAGES =
  'https://owvvkwxzjuglrfeuujez.supabase.co/storage/v1/object/public/products/';

const product = catalog.find(item => item.id === productId);

if (!product) {
  return [
    {
      json: {
        phone: customer.phone,
        route: 'sales',
        kind: 'list',
        button: 'לבחירת מוצר',
        section: 'מוצרים',
        text: 'המוצר הזה כבר לא זמין. אלה המוצרים שיש לנו כרגע 👇',
        rows: productRows(catalog),
      },
    },
  ];
}

rememberProduct(customer.phone, product.id);

const inStock = product.stock > 0;
const lines = [
  `*${product.name}*`,
  product.description,
  '',
  `מחיר: ${shekels(product.price)} · ${stockLabel(product.stock)}`,
];
if (!inStock) lines.push('', 'המוצר אזל כרגע.');

const buttons = inStock
  ? [
      { id: 'order_' + product.id, title: 'להזמין' },
      { id: 'route_sales', title: 'מוצרים נוספים' },
    ]
  : [{ id: 'route_sales', title: 'מוצרים נוספים' }];

return [
  {
    json: {
      phone: customer.phone,
      route: 'product',
      kind: 'buttons',
      image: await imageUrl(product, this.helpers),
      text: lines.join('\n'),
      buttons,
    },
  },
];

// תמונה: כתובת מלאה מהגיליון, או שם קובץ בדלי הציבורי products ב-Supabase.
// לפני השליחה בודקים שהתמונה קיימת: תמונה חסרה מכשילה את כל ההודעה אצל Meta.
async function imageUrl(item, helpers) {
  if (!item.image) return null;
  const url = /^https?:\/\//.test(item.image)
    ? item.image
    : PRODUCT_IMAGES + item.image.replace(/\.(png|jpeg)$/i, '.jpg');
  try {
    await helpers.httpRequest({ method: 'HEAD', url, timeout: 5000 });
    return url;
  } catch (error) {
    return null;
  }
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
