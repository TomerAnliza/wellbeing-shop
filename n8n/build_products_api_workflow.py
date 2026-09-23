"""נקודת קצה ציבורית לקטלוג: GET /webhook/wellbeing-products → JSON של מוצרים פעילים."""
import json, uuid
SHEET_ID = '1TfXLEnReGfAFv2MfCeqfO-cdac81__YpRrsAB7bD8fU'
GS_CRED = {'googleSheetsOAuth2Api': {'id': 'Bsc5ulPj2pt9pUPV', 'name': 'tomer_analiza_google_sheets'}}
IMG = 'https://owvvkwxzjuglrfeuujez.supabase.co/storage/v1/object/public/products/'
def n(name, t, v, params, pos, **kw):
    d = {'id': str(uuid.uuid4()), 'name': name, 'type': t, 'typeVersion': v, 'position': pos, 'parameters': params}
    d.update(kw); return d
nodes = [
 n('GET /wellbeing-products', 'n8n-nodes-base.webhook', 2,
   {'httpMethod': 'GET', 'path': 'wellbeing-products', 'responseMode': 'responseNode', 'options': {}},
   [0, 0], webhookId=str(uuid.uuid4())),
 n('products — קריאה', 'n8n-nodes-base.googleSheets', 4.7,
   {'operation': 'read', 'documentId': {'__rl': True, 'mode': 'id', 'value': SHEET_ID},
    'sheetName': {'__rl': True, 'mode': 'name', 'value': 'products'}, 'options': {}},
   [260, 0], credentials=GS_CRED, alwaysOutputData=True, executeOnce=True),
 n('קטלוג ציבורי', 'n8n-nodes-base.code', 2, {'jsCode': r"""
// רק מוצרים פעילים, ורק שדות שמותר לחשוף. כמות המלאי המדויקת אינה נחשפת — רק סטטוס.
const IMG = '""" + IMG + r"""';
const products = $input.all().map(i => i.json)
  .filter(p => p.id && String(p.active).trim() === 'כן')
  .map(p => {
    const stock = Number(p.stock) || 0;
    const img = String(p.image || '').trim();
    return {
      id: String(p.id), name: String(p.name), category: String(p.category),
      description: String(p.description), price: Number(p.price_ils),
      stock_status: stock <= 0 ? 'out' : stock <= 5 ? 'low' : 'in',
      image: !img ? null : /^https?:\/\//.test(img) ? img : IMG + img.replace(/\.(png|jpeg)$/i, '.jpg'),
    };
  });
return [{ json: { products, updated_at: $now.toISO() } }];
"""}, [520, 0]),
 n('תשובת JSON', 'n8n-nodes-base.respondToWebhook', 1.4,
   {'respondWith': 'json', 'responseBody': '={{ JSON.stringify($json) }}',
    'options': {'responseCode': 200, 'responseHeaders': {'entries': [{'name': 'Cache-Control', 'value': 'public, max-age=60'}]}}},
   [780, 0]),
 n('הסבר', 'n8n-nodes-base.stickyNote', 1, {'width': 520, 'height': 200, 'content':
   "## קטלוג לאתר — wellbeing-shop\nGET /webhook/wellbeing-products מחזיר את המוצרים הפעילים מגיליון החנות.\nהאתר (Next.js) קורא מכאן בצד השרת. סטטוס מלאי בלבד (in / low / out), בלי כמויות.\nמקור האמת: גיליון החנות, לשונית products — אותו מקור שהבוט קורא."}, [0, -260]),
]
conns = {'GET /wellbeing-products': {'main': [[{'node': 'products — קריאה', 'type': 'main', 'index': 0}]]},
         'products — קריאה': {'main': [[{'node': 'קטלוג ציבורי', 'type': 'main', 'index': 0}]]},
         'קטלוג ציבורי': {'main': [[{'node': 'תשובת JSON', 'type': 'main', 'index': 0}]]}}
wf = {'name': 'wellbeing — קטלוג לאתר', 'nodes': nodes, 'connections': conns,
      'settings': {'executionOrder': 'v1', 'timezone': 'Asia/Jerusalem', 'saveDataSuccessExecution': 'none', 'saveDataErrorExecution': 'all'}}
json.dump(wf, open('products_api.json', 'w'), ensure_ascii=False); print('built')
