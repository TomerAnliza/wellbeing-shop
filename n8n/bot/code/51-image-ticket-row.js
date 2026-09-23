// ── שורת פנייה מתמונה ────────────────────────────────────────
// פנייה חדשה שנפתחה מתמונה. הכיתוב של התמונה הוא ההודעה.

const ticket = $input.first().json;

let message = ticket.caption;
if (!message) message = ticket.url ? '(תמונה)' : '(תמונה — השמירה נכשלה)';

return [
  {
    json: {
      ticket_id: ticket.ticket_id,
      created_at: ticket.received_at,
      phone: ticket.phone,
      customer_name: ticket.name,
      message,
      images: ticket.url,
      image_paths: ticket.path,
      status: 'new',
      rep_notes: '',
    },
  },
];
