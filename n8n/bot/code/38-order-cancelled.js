// ── ביטול הזמנה ──────────────────────────────────────────────
// הלקוח לחץ "ביטול" בסיכום. לא נכתב דבר, והמוצר יוצא מההקשר.

const customer = $('זיהוי לקוח').first().json;

const store = $getWorkflowStaticData('global');
if (store.ctx) delete store.ctx[customer.phone];

return [
  {
    json: {
      phone: customer.phone,
      route: 'order',
      kind: 'text',
      text: 'אין בעיה, לא שלחתי כלום 🙂 אפשר לכתוב לי בכל שאלה.',
    },
  },
];
