// ── שורת לקוח חדש ────────────────────────────────────────────
// שורה חדשה ללשונית customers. השם עדיין ריק — הבוט ישאל עליו מיד.
//   whatsapp_name — שם הפרופיל בוואטסאפ, כפי ש-Meta שולחת
//   name          — השם שהלקוח ימסור לבוט

const message = $input.first().json;

return [
  {
    json: {
      phone: message.phone,
      name: '',
      whatsapp_name: message.profile_name,
      created_at: message.received_at,
      user_id: '',
      source: 'whatsapp',
    },
  },
];
