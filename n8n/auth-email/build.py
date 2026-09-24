"""בונה את תרחיש n8n ששולח את מיילי ה-Auth של Supabase (Send Email Hook) — wellbeing.

Supabase יוצר ובודק את הקישורים; התרחיש רק שולח את המייל, דרך Gmail.
אפיון: docs/spec-auth-and-app.md — "שחזור סיסמה — מיילים דרך n8n"

    python3 build.py [out.json]      # ברירת מחדל: ../wellbeing-auth-email.json
"""
import json
import sys
import uuid
from pathlib import Path

HERE = Path(__file__).parent
PATH = 'wellbeing-auth-email'
GMAIL = {'gmailOAuth2': {'id': 'JIDO13CagcFy9pSV', 'name': 'Gmail — tomer@analiza (wellbeing)'}}

nodes, connections = [], {}


def stable_id(name):
    return str(uuid.uuid5(uuid.NAMESPACE_URL, 'wellbeing-auth-email/' + name))


def add(name, node_type, version, params, position, **extra):
    nodes.append({'id': stable_id(name), 'name': name, 'type': 'n8n-nodes-base.' + node_type,
                  'typeVersion': version, 'position': position, 'parameters': params, **extra})


def connect(source, target, output=0):
    outputs = connections.setdefault(source, {'main': []})['main']
    while len(outputs) <= output:
        outputs.append([])
    outputs[output].append({'node': target, 'type': 'main', 'index': 0})


def code(name, file, position):
    add(name, 'code', 2, {'jsCode': (HERE / 'code' / file).read_text(encoding='utf-8')}, position)


def respond(name, status, position):
    add(name, 'respondToWebhook', 1.4, {'respondWith': 'json', 'responseBody': '{}',
                                         'options': {'responseCode': status}}, position)


add('הסבר', 'stickyNote', 1, {'width': 620, 'height': 200, 'color': 7, 'content':
    '## מיילי התחברות — wellbeing\n'
    'Supabase קורא לכאן במקום לשלוח מייל בעצמו (Send Email Hook). בודקים חתימה\n'
    '(Standard Webhooks, הסוד במשתנה הסביבה SUPABASE_EMAIL_HOOK_SECRET), בונים מייל בעברית,\n'
    'ושולחים ב-Gmail. 200 = נשלח. 401 = חתימה לא תקינה. 500 = Gmail נכשל.\n'
    'אפיון: docs/spec-auth-and-app.md'}, [-40, -260])

# rawBody: החתימה מחושבת על הבייטים המקוריים
add('Supabase — מייל לשליחה', 'webhook', 2,
    {'httpMethod': 'POST', 'path': PATH, 'responseMode': 'responseNode', 'options': {'rawBody': True}},
    [0, 0], webhookId=stable_id('webhook'))
code('בדיקת חתימה', '01-verify-hook.js', [280, 0])
add('חתימה תקינה?', 'switch', 3.3, {'rules': {'values': [
    {'conditions': {'options': {'caseSensitive': True, 'leftValue': '', 'typeValidation': 'strict', 'version': 2},
                    'conditions': [{'id': stable_id('valid'), 'leftValue': '={{ $json.valid }}', 'rightValue': '',
                                    'operator': {'type': 'boolean', 'operation': 'true', 'singleValue': True}}],
                    'combinator': 'and'}, 'renameOutput': True, 'outputKey': 'תקינה'},
    {'conditions': {'options': {'caseSensitive': True, 'leftValue': '', 'typeValidation': 'strict', 'version': 2},
                    'conditions': [{'id': stable_id('invalid'), 'leftValue': '={{ $json.valid }}', 'rightValue': '',
                                    'operator': {'type': 'boolean', 'operation': 'false', 'singleValue': True}}],
                    'combinator': 'and'}, 'renameOutput': True, 'outputKey': 'לא תקינה'},
]}, 'options': {}}, [560, 0])
code('בניית מייל', '02-build-email.js', [840, -100])
# continueErrorOutput: כשל ב-Gmail יוצא ביציאה השנייה → 500, ו-Supabase מדווח על כשל
add('שליחה ב-Gmail', 'gmail', 2.1,
    {'sendTo': '={{ $json.to }}', 'subject': '={{ $json.subject }}', 'message': '={{ $json.html }}',
     'options': {'appendAttribution': False}},
    [1120, -100], credentials=GMAIL, onError='continueErrorOutput')
respond('200 — נשלח', 200, [1400, -180])
respond('500 — Gmail נכשל', 500, [1400, -20])
respond('401 — חתימה לא תקינה', 401, [840, 140])

connect('Supabase — מייל לשליחה', 'בדיקת חתימה')
connect('בדיקת חתימה', 'חתימה תקינה?')
connect('חתימה תקינה?', 'בניית מייל', 0)
connect('חתימה תקינה?', '401 — חתימה לא תקינה', 1)
connect('בניית מייל', 'שליחה ב-Gmail')
connect('שליחה ב-Gmail', '200 — נשלח', 0)
connect('שליחה ב-Gmail', '500 — Gmail נכשל', 1)

workflow = {
    'name': 'wellbeing — מיילי התחברות (Supabase)',
    'nodes': nodes,
    'connections': connections,
    # הרצות מוצלחות לא נשמרות — הן מכילות קישורי איפוס
    'settings': {'executionOrder': 'v1', 'timezone': 'Asia/Jerusalem',
                 'saveDataSuccessExecution': 'none', 'saveDataErrorExecution': 'all'},
}
out = Path(sys.argv[1] if len(sys.argv) > 1 else HERE.parent / 'wellbeing-auth-email.json')
out.write_text(json.dumps(workflow, ensure_ascii=False, indent=1), encoding='utf-8')
print(f'{len(nodes)} nodes → {out}')
