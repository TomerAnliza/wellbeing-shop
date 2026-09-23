// ── קישור לקוח לחשבון ────────────────────────────────────────
// אחרי אימות מוצלח, הלקוח בגיליון customers מקבל את ה-user_id שלו מהאתר:
//   מספר שלא כתב לבוט אף פעם → שורה חדשה, עם השם מהאתר (source = web)
//   לקוח מוכר → מעדכנים user_id (ואת השם, אם עוד לא נקלט). בלי source
// הצומת הבא מבחין בין השניים לפי source.
// ענף מקביל: לא מעכב את התשובה ללקוח.

const customer = $('זיהוי לקוח').first().json;
const result = $input.first().json;

if (!result.verified) return [];

if (customer.stage === 'new') {
  return [
    {
      json: {
        phone: customer.phone,
        name: result.name,
        whatsapp_name: customer.profile_name,
        created_at: customer.received_at,
        user_id: result.user_id,
        source: 'web',
      },
    },
  ];
}

const update = { phone: customer.phone, user_id: result.user_id };
if (customer.stage === 'awaiting_name' && result.name) update.name = result.name;
return [{ json: update }];
