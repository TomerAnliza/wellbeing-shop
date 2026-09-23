// ── שורת הזמנה ───────────────────────────────────────────────
// הלקוח אישר. המחיר והמלאי נבדקים שוב מול הגיליון ברגע האישור —
// לא מסתמכים על מה שנאמר בשיחה, ולא על מה שהמודל כתב.
// פלט: { valid: true, ...שורה לגיליון ההזמנות, _pid, _newStock } או { valid: false }

const customer = $('זיהוי לקוח').first().json;
const input = $input.first().json;

const product = input.catalog.find(item => item.id === input.product);
const qty = Math.min(10, Math.max(1, Number(input.qty) || 1));

if (!product || product.stock < qty) {
  return [{ json: { valid: false, product: input.product } }];
}

const total = product.price * qty;

return [
  {
    json: {
      valid: true,
      // שדות עזר לעדכון המלאי. מוסרים לפני הכתיבה לגיליון ("שדות הזמנה")
      _pid: product.id,
      _newStock: product.stock - qty,
      // עמודות גיליון ההזמנות
      order_id: 'O-' + $now.setZone('Asia/Jerusalem').toFormat('yyMMddHHmmss'),
      created_at: customer.received_at,
      user_id: customer.user_id,
      customer_name: customer.name,
      phone: customer.phone,
      items: `${product.id}×${qty} ${product.name}`,
      subtotal_ils: total,
      discount_pct: 0,
      total_ils: total,
      status: 'new',
      rep_notes: 'הזמנה מהבוט בוואטסאפ',
    },
  },
];
