(function () {
  'use strict';

  const consultants = [
    { id: 'eduarda', name: 'Eduarda', channel: 'online', phone: '5519983053808', weight: 45 },
    { id: 'giovana', name: 'Giovana', channel: 'online', phone: '5519982042290', weight: 45 },
    { id: 'melissa', name: 'Melissa', channel: 'loja_fisica', phone: '5519981136934', weight: 5 },
    { id: 'karol', name: 'Karol', channel: 'loja_fisica', phone: '5519982511645', weight: 5 }
  ];

  const businessHours = {
    timeZone: 'America/Sao_Paulo',
    mondayToFriday: '09:00-18:00',
    saturday: '09:00-14:00',
    sunday: 'closed'
  };

  function normalizePhone(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function stableBucket(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) % 100;
  }

  function assign(phone) {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length < 10) {
      throw new Error('Informe um WhatsApp válido antes de fazer o rateio.');
    }

    const bucket = stableBucket(normalizedPhone);
    let upperLimit = 0;

    for (const consultant of consultants) {
      upperLimit += consultant.weight;
      if (bucket < upperLimit) {
        return { ...consultant, bucket, phoneKey: normalizedPhone };
      }
    }

    return { ...consultants[consultants.length - 1], bucket, phoneKey: normalizedPhone };
  }

  window.HilstLeadRouting = { consultants, businessHours, assign };
})();
