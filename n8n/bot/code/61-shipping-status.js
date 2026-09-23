// ── סטטוס משלוח ──────────────────────────────────────────────
// ההזמנה האחרונה של המספר שכתב, מגיליון ההזמנות.
// רק הזמנות של אותו טלפון — לא חושפים הזמנות של מספר אחר.

const customer = $('זיהוי לקוח').first().json;

const STATUS = {
  new: 'התקבלה וממתינה לנציג',
  in_progress: 'בטיפול',
  done: 'הושלמה',
  cancelled: 'בוטלה',
};

const myOrders = $input
  .all()
  .map(item => item.json)
  .filter(order => order.order_id && String(order.items || '').trim() !== '') // בלי פניות S- ישנות
  .filter(order => String(order.phone).replace(/\D/g, '') === customer.phone)
  .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

let text;

if (myOrders.length === 0) {
  text =
    'לא מצאתי הזמנות על המספר הזה. אם הזמנת ממספר אחר, נציג יבדוק את זה איתך — אפשר לכתוב לי "נציג".';
} else {
  const latest = myOrders[0];
  const lines = [
    `ההזמנה האחרונה שלך (מספר ${latest.order_id}): ${latest.items}`,
    `סטטוס: ${STATUS[latest.status] ?? latest.status}.`,
  ];
  if (latest.status === 'new' || latest.status === 'in_progress') {
    lines.push('נציג יחזור אלייך לתיאום תשלום ומשלוח.');
  }
  text = lines.join('\n');
}

return [{ json: { phone: customer.phone, route: 'shipping', kind: 'text', text } }];
