// ── אישור פנייה מתמונה ───────────────────────────────────────

const customer = $('זיהוי לקוח').first().json;
const ticket = $('פנייה עם תמונה').first().json;

const name = customer.name && customer.name !== 'לקוח' ? `, ${customer.name}` : '';
let lines;

if (ticket.url) {
  lines = [
    `קיבלתי את התמונה 📷 תודה${name}!`,
    `פתחתי פנייה (${ticket.ticket_id}), ונציג יחזור אלייך כאן בוואטסאפ בהקדם.`,
  ];
  if (!ticket.caption) {
    lines.push('אפשר לכתוב לי במה מדובר, ולשלוח עוד תמונות — הכול יצורף לפנייה.');
  }
} else {
  lines = [
    `לא הצלחתי לשמור את התמונה 🙏 פתחתי פנייה (${ticket.ticket_id}), ונציג יחזור אלייך כאן בהקדם.`,
  ];
}

return [
  { json: { phone: customer.phone, route: 'support', kind: 'text', text: lines.join('\n') } },
];
