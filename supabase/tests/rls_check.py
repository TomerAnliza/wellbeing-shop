"""בדיקות אבטחה ל-RLS ולאימות הטלפון — מול ה-API האמיתי של Supabase.

יוצר שני משתמשי בדיקה, מנסה את מה שמותר ואת מה שאסור, ומוחק אותם בסוף.
מפתחות: הציבורי מ-web/.env.local, והסודי מה-Keychain של macOS
(SUPABASE_SECRET_KEY_WELLBEING). הסודי נדרש רק לתפקיד של הבוט ולניקוי.

    python3 supabase/tests/rls_check.py

אפיון: docs/spec-auth-and-app.md — קריטריוני קבלה 3–5.
"""
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

URL = 'https://owvvkwxzjuglrfeuujez.supabase.co'
ENV = Path(__file__).resolve().parents[2] / 'web' / '.env.local'
PUBLISHABLE = next(line.split('=', 1)[1].strip() for line in ENV.read_text().splitlines()
                   if line.startswith('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='))
SECRET = subprocess.run(['security', 'find-generic-password', '-a', 'wellbeing', '-s',
                         'SUPABASE_SECRET_KEY_WELLBEING', '-w'], capture_output=True, text=True).stdout.strip()

results = []


def call(method, path, body=None, token=None, key=PUBLISHABLE, prefer=None):
    headers = {'apikey': key, 'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    if prefer:
        headers['Prefer'] = prefer
    request = urllib.request.Request(URL + path, method=method, headers=headers,
                                     data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(request) as response:
            raw = response.read()
            return response.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as error:
        raw = error.read()
        return error.code, json.loads(raw) if raw else None


def check(name, passed, detail=''):
    results.append(passed)
    print(('✅' if passed else '❌'), name, ('— ' + detail) if detail and not passed else '')


def sign_up(phone):
    email = f'rls-test-{phone}-{int(time.time())}@example.com'
    status, data = call('POST', '/auth/v1/signup', {
        'email': email, 'password': 'test-password-123',
        'data': {'display_name': 'בדיקה ' + phone[-3:], 'phone': phone}})
    assert status == 200 and data.get('access_token'), f'signup failed: {status} {data}'
    return data['user']['id'], data['access_token']


def activity(started='2026-09-23T07:00:00Z'):
    return {'type': 'run', 'started_at': started, 'ended_at': '2026-09-23T07:30:00Z',
            'duration_minutes': 30, 'distance_km': 4.8, 'calories': 318}


users = []
try:
    phone_a, phone_b = '999000555001', '999000555002'
    user_a, token_a = sign_up(phone_a)
    user_b, token_b = sign_up(phone_b)
    users = [user_a, user_b]

    # ── פרופיל נוצר בטריגר ──
    status, rows = call('GET', '/rest/v1/profiles?select=*', token=token_a)
    check('פרופיל נוצר בהרשמה, עם השם והטלפון',
          status == 200 and len(rows) == 1 and rows[0]['phone'] == phone_a and not rows[0]['phone_verified'],
          f'{status} {rows}')

    # ── אסור: לסמן לעצמך טלפון מאומת ──
    status, data = call('PATCH', f'/rest/v1/profiles?id=eq.{user_a}', {'phone_verified': True}, token=token_a)
    check('משתמש לא יכול לסמן לעצמו phone_verified', status in (401, 403), f'{status} {data}')

    # ── מותר: לעדכן יעד ──
    status, data = call('PATCH', f'/rest/v1/profiles?id=eq.{user_a}', {'weekly_goal': 4}, token=token_a,
                        prefer='return=representation')
    check('משתמש מעדכן את היעד שלו', status == 200 and data and data[0]['weekly_goal'] == 4, f'{status} {data}')

    # ── אסור: לשמור אימון לפני אימות ──
    status, data = call('POST', '/rest/v1/activities', activity(), token=token_a)
    check('אין שמירת אימון לפני אימות טלפון', status in (401, 403), f'{status} {data}')

    # ── אסור: לקרוא טבלת הקודים ──
    status, data = call('GET', '/rest/v1/phone_verifications?select=*', token=token_a)
    check('אין גישה לטבלת הקודים', status in (401, 403, 404), f'{status} {data}')

    # ── אסור: למשתמש להפעיל את verify_phone ──
    status, code_a = call('POST', '/rest/v1/rpc/start_phone_verification', {}, token=token_a)
    check('משתמש מקבל קוד אימות', status == 200 and isinstance(code_a, str) and len(code_a) == 6, f'{status} {code_a}')
    status, data = call('POST', '/rest/v1/rpc/verify_phone', {'p_phone': phone_a, 'p_code': code_a}, token=token_a)
    check('משתמש לא יכול להפעיל verify_phone בעצמו', status in (401, 403, 404), f'{status} {data}')

    # ── הבוט (service_role) ──
    status, data = call('POST', '/rest/v1/rpc/verify_phone', {'p_phone': phone_b, 'p_code': code_a}, key=SECRET)
    check('קוד ממספר אחר — נדחה', status == 200 and data['status'] == 'invalid', f'{status} {data}')
    status, data = call('POST', '/rest/v1/rpc/verify_phone', {'p_phone': phone_a, 'p_code': code_a}, key=SECRET)
    check('קוד נכון מהמספר הנכון — מאומת', status == 200 and data['status'] == 'verified', f'{status} {data}')
    status, data = call('POST', '/rest/v1/rpc/verify_phone', {'p_phone': phone_a, 'p_code': code_a}, key=SECRET)
    check('אותו קוד פעם שנייה — נדחה', status == 200 and data['status'] == 'invalid', f'{status} {data}')

    # ── אחרי אימות: אימונים ──
    status, data = call('POST', '/rest/v1/activities', activity(), token=token_a, prefer='return=representation')
    check('אחרי אימות — שמירת אימון', status == 201 and data and data[0]['is_estimated'], f'{status} {data}')
    activity_id = data[0]['id'] if status == 201 else None

    status, data = call('POST', '/rest/v1/activities', {**activity(), 'user_id': user_b}, token=token_a)
    check('אי אפשר לשמור אימון על שם משתמש אחר', status in (401, 403), f'{status} {data}')

    status, rows = call('GET', '/rest/v1/activities?select=id', token=token_b)
    check('משתמש ב׳ לא רואה אימונים של א׳', status == 200 and rows == [], f'{status} {rows}')

    status, rows = call('DELETE', f'/rest/v1/activities?id=eq.{activity_id}', token=token_b,
                        prefer='return=representation')
    check('משתמש ב׳ לא מוחק אימון של א׳', status == 200 and rows == [], f'{status} {rows}')

    status, data = call('PATCH', f'/rest/v1/activities?id=eq.{activity_id}', {'calories': 1}, token=token_a)
    check('אימון שנשמר לא נערך', status in (401, 403), f'{status} {data}')

    # ── החלפת טלפון מבטלת אימות ──
    status, data = call('PATCH', f'/rest/v1/profiles?id=eq.{user_a}', {'phone': '999000555003'}, token=token_a,
                        prefer='return=representation')
    check('טלפון חדש מבטל את האימות', status == 200 and data and not data[0]['phone_verified'], f'{status} {data}')

    # ── לא מחובר ──
    status, rows = call('GET', '/rest/v1/profiles?select=*')
    check('לא מחובר — אין גישה לפרופילים', status in (401, 403) or rows == [], f'{status} {rows}')

finally:
    for user_id in users:
        call('DELETE', f'/auth/v1/admin/users/{user_id}', key=SECRET, token=SECRET)
    print(f'\nנוקו {len(users)} משתמשי בדיקה')

print(f'{sum(results)}/{len(results)} בדיקות עברו')
sys.exit(0 if all(results) else 1)
