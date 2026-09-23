// ── בניית הודעת וואטסאפ ──────────────────────────────────────
// כל התשובות מגיעות לכאן באותו מבנה: { phone, route, kind, text, ... }
// ומכאן יוצא גוף הבקשה ל-WhatsApp Cloud API, לפי kind:
//   text    — הודעת טקסט
//   list    — רשימה: { button, section, rows[] }
//   buttons — כפתורי תשובה: { buttons[], image? }
//
// מגבלות Meta (נבדקו בתיעוד הרשמי, 23 בספטמבר 2026):
//   List    — כפתור 20 תווים, כותרת שורה 24, תיאור 72, עד 10 שורות, גוף 4096
//   Buttons — עד 3 כפתורים, כותרת 20, גוף 1024

const reply = $input.first().json;

const base = {
  messaging_product: 'whatsapp',
  recipient_type: 'individual',
  to: reply.phone,
};

let payload;

if (reply.kind === 'list') {
  payload = {
    ...base,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: cut(reply.text, 4096) },
      action: {
        button: cut(reply.button || 'אפשרויות', 20),
        sections: [
          {
            title: cut(reply.section || 'במה אפשר לעזור?', 24),
            rows: reply.rows.slice(0, 10).map(row => ({
              id: row.id,
              title: cut(row.title, 24),
              ...(row.description ? { description: cut(row.description, 72) } : {}),
            })),
          },
        ],
      },
    },
  };
} else if (reply.kind === 'buttons') {
  payload = {
    ...base,
    type: 'interactive',
    interactive: {
      type: 'button',
      ...(reply.image ? { header: { type: 'image', image: { link: reply.image } } } : {}),
      body: { text: cut(reply.text, 1024) },
      action: {
        buttons: reply.buttons.slice(0, 3).map(button => ({
          type: 'reply',
          reply: { id: button.id, title: cut(button.title, 20) },
        })),
      },
    },
  };
} else {
  payload = {
    ...base,
    type: 'text',
    text: { preview_url: false, body: cut(reply.text, 4096) },
  };
}

return [{ json: { ...reply, payload } }];

function cut(value, max) {
  return String(value).slice(0, max);
}
