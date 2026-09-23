// ── זיהוי לקוח ───────────────────────────────────────────────
// מחפש את הטלפון בלשונית customers וקובע באיזה שלב הלקוח:
//   new           — מספר שלא ראינו
//   awaiting_name — שאלנו לשם ועוד לא קיבלנו תשובה תקינה (שם ריק או "?")
//   known         — לקוח מוכר
// פלט: ההודעה + { stage, name, user_id, wa_saved }

const message = $('פענוח ההודעה').first().json;

// השוואה על ספרות בלבד: הגיליון עשוי לשמור את הטלפון כטקסט או כמספר
const digits = value => String(value ?? '').replace(/\D/g, '');

const customers = $input
  .all()
  .map(item => item.json)
  .filter(row => row?.phone !== undefined);
const row = customers.find(customer => digits(customer.phone) === message.phone);

const name = row ? String(row.name ?? '').trim() : '';

let stage = 'new';
if (row) {
  stage = name === '' || name === '?' ? 'awaiting_name' : 'known';
}

return [
  {
    json: {
      ...message,
      stage,
      name,
      user_id: row ? String(row.user_id ?? '') : '',
      wa_saved: row ? String(row.whatsapp_name ?? '').trim() : '', // שם הפרופיל שכבר שמור בגיליון
    },
  },
];
