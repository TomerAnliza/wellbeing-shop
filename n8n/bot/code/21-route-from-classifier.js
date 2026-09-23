// ── מסלול מהסיווג ────────────────────────────────────────────
// קורא את התשובה של פקיד הקבלה (OpenAI): {"route": "...", "qty": ...}.
// מסלול לא מוכר → unclear. בקשת הזמנה בלי מוצר בהקשר → sales, כדי שהלקוח יבחר.
// פלט: כל מה שהגיע מ"הקשר ובחירה" + { route, qty, product }

const input = $('הקשר ובחירה').first().json;
const ROUTES = ['sales', 'order', 'support', 'fitness', 'shipping', 'signup', 'unclear'];

let answer = {};
try {
  answer = JSON.parse($input.first().json.choices[0].message.content);
} catch (error) {
  // תשובה לא תקינה מהמודל → unclear
}

let route = ROUTES.includes(answer.route) ? answer.route : 'unclear';

// כמות: מספר שלם בין 1 ל-10
const qty = Math.min(10, Math.max(1, Math.round(Number(answer.qty) || 1)));

// "טוב תזמין" בלי מוצר בהקשר — מציגים את הקטלוג
if (route === 'order' && !input.ctxProduct) route = 'sales';

return [
  {
    json: {
      ...input,
      route,
      qty,
      product: route === 'order' ? input.ctxProduct : null,
    },
  },
];
