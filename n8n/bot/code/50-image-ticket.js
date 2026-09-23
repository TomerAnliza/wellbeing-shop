// ── פנייה עם תמונה ───────────────────────────────────────────
// התמונה כבר בדלי הפרטי support-media, ויש לה קישור חתום ל-30 יום.
// כאן מחליטים לאן היא שייכת:
//   append — יש פנייה פתוחה של הטלפון הזה מ-30 הדקות האחרונות → מצרפים אליה
//   new    — אין → פותחים פנייה חדשה
// אם ההורדה או ההעלאה נכשלו, url ריק — והפנייה נפתחת בכל זאת, עם הערה.

const customer = $('זיהוי לקוח').first().json;
const upload = $('Supabase — העלאה').first().json; // { Key: "support-media/<phone>/<id>.jpg" }
const signed = $input.first().json; // { signedURL: "/object/sign/..." }

const STORAGE = 'https://owvvkwxzjuglrfeuujez.supabase.co/storage/v1';
const HALF_HOUR = 30 * 60 * 1000;

const path = upload.Key ? String(upload.Key).replace(/^support-media\//, '') : '';
const url = signed.signedURL ? STORAGE + signed.signedURL : '';

const store = $getWorkflowStaticData('global');
store.tickets = store.tickets || {};
const openTicket = store.tickets[customer.phone];

const append = Boolean(openTicket && Date.now() - openTicket.at < HALF_HOUR);
const ticketId = append ? openTicket.id : 'S-' + Date.now();
store.tickets[customer.phone] = { id: ticketId, at: Date.now() };

return [
  {
    json: {
      mode: append ? 'append' : 'new',
      ticket_id: ticketId,
      url,
      path,
      caption: customer.caption || '',
      phone: customer.phone,
      name: customer.name,
      received_at: customer.received_at,
    },
  },
];
