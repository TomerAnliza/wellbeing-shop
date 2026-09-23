// ── פענוח ההודעה ─────────────────────────────────────────────
// מקבל את ה-webhook של Meta ומחלץ ממנו הודעה אחת בפורמט אחיד.
// Meta שולחת גם עדכוני סטטוס (sent / delivered / read) — הם מסוננים כאן.
// פלט: { phone, text, replyId, type, message_id, media_id, caption, verifyCode, profile_name, received_at }

const messages = [];

for (const item of $input.all()) {
  const body = item.json.body ?? item.json;

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value ?? {};
      const contact = (value.contacts ?? [])[0] ?? {};

      for (const message of value.messages ?? []) {
        messages.push({ json: readMessage(message, contact) });
      }
    }
  }
}

// הודעה אחת לכל הרצה — כך כל ההפניות ל-first() בהמשך התרחיש נכונות
return messages.slice(0, 1);

function readMessage(message, contact) {
  let text = '';
  let replyId = ''; // מזהה הכפתור או השורה שנלחצו, למשל route_sales
  let mediaId = '';
  let caption = '';

  switch (message.type) {
    case 'text':
      text = message.text?.body ?? '';
      break;

    case 'interactive': {
      // לחיצה על שורה ברשימה או על כפתור תשובה
      const reply = message.interactive?.list_reply ?? message.interactive?.button_reply ?? {};
      replyId = reply.id ?? '';
      text = reply.title ?? '';
      break;
    }

    case 'button': // כפתור בתבנית
      text = message.button?.text ?? '';
      replyId = message.button?.payload ?? '';
      break;

    case 'image':
      caption = message.image?.caption ?? '';
      text = caption || '(תמונה)';
      mediaId = message.image?.id ?? '';
      break;

    default: // קול, מסמך, מיקום... — נרשם, ולא מטופל
      text = `[${message.type}]`;
  }

  // "קוד אימות: 482913" — נשלח מדף אימות הטלפון באתר
  const verifyCode = /קוד\s*אימות\D*(\d{6})/.exec(text)?.[1] ?? '';

  return {
    phone: String(message.from ?? '').replace(/\D/g, ''),
    text: String(text).trim(),
    replyId,
    type: message.type,
    message_id: message.id,
    media_id: mediaId,
    caption,
    verifyCode,
    profile_name: contact.profile?.name ?? '',
    received_at: $now.setZone('Asia/Jerusalem').toFormat('yyyy-MM-dd HH:mm:ss'),
  };
}
