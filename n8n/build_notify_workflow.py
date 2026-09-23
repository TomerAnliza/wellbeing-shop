"""התראה במייל: הזמנה חדשה (orders), פנייה חדשה לשירות (tickets), ותמונה שנוספה לפנייה."""
import json, uuid
SHEET_ID = '1Xt_X5z6FoElN9FpCrGihEtzNYF_pOEC0-idbGd3NQAY'   # גיליון ההזמנות
TICKETS_ID = '11HaiHwuVyGoqmf7zss8d5iwnn2B8CG0hvIfkuGqej2Q'  # גיליון השירות
GS_CRED = {'googleSheetsOAuth2Api': {'id': 'Bsc5ulPj2pt9pUPV', 'name': 'tomer_analiza_google_sheets'}}
GMAIL_CRED = {'gmailOAuth2': {'id': 'JIDO13CagcFy9pSV', 'name': 'Gmail — tomer@analiza (wellbeing)'}}
TO = 'tomer@analiza-college.co.il'

def n(name, t, v, params, pos, **kw):
    d = {'id': str(uuid.uuid4()), 'name': name, 'type': t, 'typeVersion': v, 'position': pos, 'parameters': params}
    d.update(kw); return d

nodes = [
 n('כל דקה', 'n8n-nodes-base.scheduleTrigger', 1.2,
   {'rule': {'interval': [{'field': 'cronExpression', 'expression': '* * * * *'}]}}, [0, 0]),
 n('orders — קריאה', 'n8n-nodes-base.googleSheets', 4.7,
   {'operation': 'read', 'documentId': {'__rl': True, 'mode': 'id', 'value': SHEET_ID},
    'sheetName': {'__rl': True, 'mode': 'name', 'value': 'orders'}, 'options': {}},
   [260, 0], credentials=GS_CRED, alwaysOutputData=True, executeOnce=True),
 n('tickets — קריאה', 'n8n-nodes-base.googleSheets', 4.7,
   {'operation': 'read', 'documentId': {'__rl': True, 'mode': 'id', 'value': TICKETS_ID},
    'sheetName': {'__rl': True, 'mode': 'name', 'value': 'tickets'}, 'options': {}},
   [390, 160], credentials=GS_CRED, alwaysOutputData=True, executeOnce=True),
 n('שורות חדשות', 'n8n-nodes-base.code', 2, {'jsCode': r"""
// Google Sheets אינו שולח אירוע "שורה חדשה", ולכן בודקים כל דקה.
// מזהים שכבר נראו נשמרים ב-static data. בהרצה הראשונה כל השורות הקיימות מסומנות
// כנראו בלי מייל — אחרת תישלח התראה על כל ההיסטוריה.
// לפניות נשמר גם מספר התמונות: תמונה שנוספה לפנייה קיימת שולחת מייל משלה.
const store = $getWorkflowStaticData('global');
const orders = $('orders — קריאה').all().map(i => i.json).filter(r => r.order_id)
  .map(r => ({ ...r, id: String(r.order_id) }));
const tickets = $input.all().map(i => i.json).filter(r => r.ticket_id)
  .map(r => ({ ...r, id: String(r.ticket_id), customer_name: r.customer_name, rep_notes: r.message }));
const firstRun = !Array.isArray(store.seen);
const seen = new Set(firstRun ? [] : store.seen);
store.imgs = store.imgs || {};
const lines = s => String(s || '').split('\n').map(t => t.trim()).filter(Boolean);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const line = (k, v) => v === '' || v === undefined ? '' : `<tr><td style="color:#6b6475;padding:4px 12px 4px 0;vertical-align:top">${k}</td><td style="padding:4px 0"><b>${esc(v).replace(/\n/g, '<br>')}</b></td></tr>`;
const pics = urls => urls.map(u => `<a href="${esc(u)}"><img src="${esc(u)}" alt="תמונה מהלקוח" style="max-width:100%;border-radius:10px;margin:6px 0;display:block"></a>`).join('');
function mail(r, kind, newPics) {
  const phone = String(r.phone || '').replace(/\D/g, '');
  const title = { order: 'הזמנה חדשה מהבוט', ticket: 'פנייה חדשה לשירות', pic: 'תמונה נוספת לפנייה' }[kind];
  const icon = { order: '🛒', ticket: '🛟', pic: '📷' }[kind];
  const sheet = kind === 'order' ? '""" + SHEET_ID + r"""' : '""" + TICKETS_ID + r"""';
  return { json: {
    subject: `${icon} ${title} ${r.id} — ${r.customer_name || phone}`,
    html: `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e8e3f3;border-radius:14px;overflow:hidden">
      <div style="background:#9372C8;color:#fff;padding:16px 20px;font-size:18px"><b>${title}</b></div>
      <div style="padding:16px 20px"><table style="font-size:14px;border-collapse:collapse">
        ${line('מספר', r.id)}${line('תאריך', r.created_at)}${line('לקוח', r.customer_name)}${line('טלפון', phone)}
        ${kind === 'order' ? line('מוצרים', r.items) + line('סכום', r.total_ils === '' ? '' : r.total_ils + ' ₪') : ''}
        ${kind === 'pic' ? '' : line(kind === 'order' ? 'הערות' : 'הודעה', r.rep_notes)}
      </table>
      ${pics(newPics)}
      ${newPics.length ? '<p style="color:#8a8494;font-size:12px">הקישור לתמונה תקף 30 יום. הנתיב הקבוע שמור בעמודה image_paths.</p>' : ''}
      <p style="margin:18px 0 6px">
        <a href="https://wa.me/${phone}" style="background:#25D366;color:#fff;padding:9px 14px;border-radius:10px;text-decoration:none">לכתוב ללקוח בוואטסאפ</a>
        &nbsp;<a href="https://docs.google.com/spreadsheets/d/${sheet}/edit" style="color:#6b4fa6">${kind === 'order' ? 'לגיליון ההזמנות' : 'לגיליון השירות'}</a></p>
      <p style="color:#8a8494;font-size:12px">לאחר הטיפול — עדכנו את הסטטוס בגיליון (in_progress / done${kind === 'order' ? ' / cancelled' : ''}).</p></div></div>`
  } };
}
const out = [];
for (const r of orders) {
  if (!firstRun && !seen.has(r.id)) out.push(mail(r, r.id.startsWith('O-') ? 'order' : 'ticket', []));
  seen.add(r.id);
}
for (const r of tickets) {
  const urls = lines(r.images);
  const before = store.imgs[r.id];
  if (!firstRun && !seen.has(r.id)) out.push(mail(r, 'ticket', urls));
  else if (!firstRun && before !== undefined && urls.length > before) out.push(mail(r, 'pic', urls.slice(before)));
  seen.add(r.id);
  store.imgs[r.id] = urls.length;
}
store.seen = [...seen].slice(-2000);
return out;
"""}, [520, 0]),
 n('מייל לנציג', 'n8n-nodes-base.gmail', 2.1,
   {'sendTo': TO, 'subject': '={{ $json.subject }}', 'message': '={{ $json.html }}', 'options': {'appendAttribution': False}},
   [780, 0], credentials=GMAIL_CRED),
 n('הסבר', 'n8n-nodes-base.stickyNote', 1, {'width': 560, 'height': 220, 'content':
   "## התראה על הזמנה או פנייה — wellbeing\nכל דקה: קורא את גיליון ההזמנות (orders) ואת גיליון השירות (tickets), ושולח מייל ל-" + TO +
   " על הזמנה חדשה, פנייה חדשה, ותמונה שנוספה לפנייה.\nשורות שכבר נראו נשמרות ב-static data. בהרצה הראשונה לא נשלח מייל על שורות קיימות.\nתיעוד: wellbeing-app/docs/whatsapp-bot-n8n.md"},
   [0, -280]),
]
conns = {'כל דקה': {'main': [[{'node': 'orders — קריאה', 'type': 'main', 'index': 0}]]},
         'orders — קריאה': {'main': [[{'node': 'tickets — קריאה', 'type': 'main', 'index': 0}]]},
         'tickets — קריאה': {'main': [[{'node': 'שורות חדשות', 'type': 'main', 'index': 0}]]},
         'שורות חדשות': {'main': [[{'node': 'מייל לנציג', 'type': 'main', 'index': 0}]]}}
wf = {'name': 'wellbeing — התראה על הזמנה או פנייה', 'nodes': nodes, 'connections': conns,
      'settings': {'executionOrder': 'v1', 'timezone': 'Asia/Jerusalem',
                   'saveDataSuccessExecution': 'none', 'saveDataErrorExecution': 'all'}}
json.dump(wf, open('notify.json', 'w'), ensure_ascii=False)
print('built')
