// ── אישור צירוף ──────────────────────────────────────────────

const customer = $('זיהוי לקוח').first().json;
const ticket = $('פנייה עם תמונה').first().json;

const text = ticket.url
  ? `קיבלתי 📷 צירפתי את התמונה לפנייה ${ticket.ticket_id}.`
  : `לא הצלחתי לשמור את התמונה 🙏 נציג יחזור אלייך בפנייה ${ticket.ticket_id}.`;

return [{ json: { phone: customer.phone, route: 'support', kind: 'text', text } }];
