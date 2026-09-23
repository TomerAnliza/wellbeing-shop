// ── אישור הזמנה ──────────────────────────────────────────────
// ההזמנה נכתבה והמלאי ירד. מאשרים ללקוח ומנקים את המוצר מההקשר.

const customer = $('זיהוי לקוח').first().json;
const order = $('שדות הזמנה').first().json;

forgetProduct(customer.phone);

// items = "P-002×3 בלוק יוגה מקצף" → "בלוק יוגה מקצף × 3"
const item = order.items.replace(/^(\S+)×(\d+) (.+)$/, '$3 × $2');

return [
  {
    json: {
      phone: customer.phone,
      route: 'order',
      kind: 'text',
      text: [
        `ההזמנה נשלחה ✅ (מספר ${order.order_id})`,
        `${item} — ${order.total_ils} ₪`,
        'נציג יחזור אליכם כאן לתיאום תשלום ומשלוח. תודה! 🙏',
      ].join('\n'),
    },
  },
];

function forgetProduct(phone) {
  const store = $getWorkflowStaticData('global');
  if (store.ctx) delete store.ctx[phone];
}
