"""התראה במייל על שורה חדשה בלשונית orders — הזמנה (O-) או פנייה לשירות (S-)."""
import json, uuid
SHEET_ID = '1Xt_X5z6FoElN9FpCrGihEtzNYF_pOEC0-idbGd3NQAY'   # גיליון ההזמנות
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
 n('שורות חדשות', 'n8n-nodes-base.code', 2, {'jsCode': r"""
// Google Sheets אינו שולח אירוע "שורה חדשה", ולכן בודקים כל דקה.
// order_id שכבר נראו נשמרים ב-static data. בהרצה הראשונה כל השורות הקיימות
// מסומנות כנראו בלי מייל — אחרת תישלח התראה על כל ההיסטוריה.
const store = $getWorkflowStaticData('global');
const rows = $input.all().map(i => i.json).filter(r => r.order_id);
const first = !Array.isArray(store.seen);
const seen = new Set(first ? [] : store.seen);
const fresh = first ? [] : rows.filter(r => !seen.has(String(r.order_id)));
rows.forEach(r => seen.add(String(r.order_id)));
store.seen = [...seen].slice(-2000);
return fresh.map(r => {
  const isOrder = String(r.order_id).startsWith('O-');
  const phone = String(r.phone || '').replace(/\D/g, '');
  const esc = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const line = (k, v) => v === '' || v === undefined ? '' : `<tr><td style="color:#6b6475;padding:4px 12px 4px 0">${k}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`;
  return { json: {
    subject: (isOrder ? '🛒 הזמנה חדשה ' : '🛟 פנייה חדשה לשירות ') + r.order_id + ' — ' + (r.customer_name || phone),
    html: `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e8e3f3;border-radius:14px;overflow:hidden">
      <div style="background:#9372C8;color:#fff;padding:16px 20px;font-size:18px"><b>${isOrder ? 'הזמנה חדשה מהבוט' : 'פנייה חדשה לשירות'}</b></div>
      <div style="padding:16px 20px"><table style="font-size:14px;border-collapse:collapse">
        ${line('מספר', r.order_id)}${line('תאריך', r.created_at)}${line('לקוח', r.customer_name)}${line('טלפון', phone)}
        ${line('מוצרים', r.items)}${line('סכום', r.total_ils === '' ? '' : r.total_ils + ' ₪')}${line('הערות', r.rep_notes)}
      </table>
      <p style="margin:18px 0 6px">
        <a href="https://wa.me/${phone}" style="background:#25D366;color:#fff;padding:9px 14px;border-radius:10px;text-decoration:none">לכתוב ללקוח בוואטסאפ</a>
        &nbsp;<a href="https://docs.google.com/spreadsheets/d/""" + SHEET_ID + r"""/edit" style="color:#6b4fa6">לגיליון ההזמנות</a></p>
      <p style="color:#8a8494;font-size:12px">לאחר הטיפול — עדכנו את הסטטוס בגיליון (in_progress / done / cancelled). הלקוח רואה אותו בבוט.</p></div></div>`
  } };
});
"""}, [520, 0]),
 n('מייל לנציג', 'n8n-nodes-base.gmail', 2.1,
   {'sendTo': TO, 'subject': '={{ $json.subject }}', 'message': '={{ $json.html }}', 'options': {'appendAttribution': False}},
   [780, 0], credentials=GMAIL_CRED),
 n('הסבר', 'n8n-nodes-base.stickyNote', 1, {'width': 560, 'height': 220, 'content':
   "## התראה על הזמנה או פנייה — wellbeing\nכל דקה: קורא את גיליון ההזמנות (לשונית orders), ושולח מייל ל-" + TO +
   " על כל שורה חדשה — O- הזמנה, S- פנייה לשירות.\nשורות שכבר נראו נשמרות ב-static data. בהרצה הראשונה לא נשלח מייל על שורות קיימות.\nתיעוד: wellbeing-app/docs/whatsapp-bot-n8n.md"},
   [0, -280]),
]
conns = {'כל דקה': {'main': [[{'node': 'orders — קריאה', 'type': 'main', 'index': 0}]]},
         'orders — קריאה': {'main': [[{'node': 'שורות חדשות', 'type': 'main', 'index': 0}]]},
         'שורות חדשות': {'main': [[{'node': 'מייל לנציג', 'type': 'main', 'index': 0}]]}}
wf = {'name': 'wellbeing — התראה על הזמנה חדשה', 'nodes': nodes, 'connections': conns,
      'settings': {'executionOrder': 'v1', 'timezone': 'Asia/Jerusalem',
                   'saveDataSuccessExecution': 'none', 'saveDataErrorExecution': 'all'}}
json.dump(wf, open('notify.json', 'w'), ensure_ascii=False)
print('built')
