// ── רישום שיחה ───────────────────────────────────────────────
// שתי שורות ל-chat_log: ההודעה שנכנסה, והתשובה שיצאה (או השגיאה בשליחה).
// בנוסף — זיכרון שיחה לסוכנים: 8 ההודעות האחרונות לכל טלפון, ב-static data.

const incoming = $('פענוח ההודעה').first().json;
const customer = $('זיהוי לקוח').first().json;
const outgoing = $('בניית הודעת וואטסאפ').first().json;
const sendResult = $input.first().json;

const sent = Array.isArray(sendResult.messages) && sendResult.messages.length > 0;
const now = $now.setZone('Asia/Jerusalem').toFormat('yyyy-MM-dd HH:mm:ss');

// ── זיכרון שיחה ──
const store = $getWorkflowStaticData('global');
store.hist = store.hist || {};
store.hist[incoming.phone] = (store.hist[incoming.phone] || [])
  .concat([
    { role: 'user', text: String(incoming.text), at: Date.now() },
    { role: 'agent', text: String(outgoing.text), at: Date.now() },
  ])
  .slice(-8);

// ── שורות ל-chat_log ──
const error = sent
  ? ''
  : `  [שליחה נכשלה: ${JSON.stringify(sendResult.error ?? sendResult).slice(0, 200)}]`;

return [
  {
    json: {
      timestamp: incoming.received_at,
      phone: incoming.phone,
      user_id: customer.user_id,
      role: 'user',
      message: incoming.text,
      tool_called: '',
    },
  },
  {
    json: {
      timestamp: now,
      phone: incoming.phone,
      user_id: customer.user_id,
      role: 'agent',
      message: String(outgoing.text) + error,
      tool_called: 'route:' + outgoing.route,
    },
  },
];
