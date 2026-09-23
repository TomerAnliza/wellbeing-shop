// ── שורת פנייה ───────────────────────────────────────────────
// פנייה חדשה לגיליון השירות (לשונית tickets).
// הפנייה הפתוחה נזכרת 30 דקות: תמונה שתגיע בזמן הזה תצטרף אליה ("פנייה עם תמונה").

const customer = $input.first().json;
const ticketId = 'S-' + Date.now();

const store = $getWorkflowStaticData('global');
store.tickets = store.tickets || {};
store.tickets[customer.phone] = { id: ticketId, at: Date.now() };

return [
  {
    json: {
      ticket_id: ticketId,
      created_at: customer.received_at,
      phone: customer.phone,
      customer_name: customer.name,
      message: customer.text,
      images: '',
      image_paths: '',
      status: 'new',
      rep_notes: '',
    },
  },
];
