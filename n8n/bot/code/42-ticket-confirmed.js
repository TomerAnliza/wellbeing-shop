// ── אישור פנייה ──────────────────────────────────────────────
// הפנייה נכתבה לגיליון. מאשרים ללקוח ומזמינים אותו לשלוח תמונה.

const customer = $('זיהוי לקוח').first().json;
const { ticket_id } = $('שורת פנייה').first().json;

const thanks = customer.name && customer.name !== 'לקוח' ? `תודה, ${customer.name}!` : 'תודה!';

return [
  {
    json: {
      phone: customer.phone,
      route: 'support',
      kind: 'text',
      text: [
        `${thanks} פתחתי פנייה (${ticket_id}), ונציג יחזור אלייך כאן בוואטסאפ בהקדם 🙏`,
        'אם יש תמונה של המוצר או של החבילה — אפשר לשלוח אותה עכשיו, והיא תצורף לפנייה.',
      ].join('\n'),
    },
  },
];
