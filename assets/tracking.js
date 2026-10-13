(function () {
  'use strict';

  const META_PIXEL_ID = '1690123275608062';
  const ATTRIBUTION_KEY = 'hilst_attribution_v1';
  const ATTRIBUTION_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'fbclid'];
  const ROUTE_KEY = 'hilst_remote_route_v1';
  const ROUTE_REASONS = {prefers_remote:'Preferiu atendimento remoto',below_3000:'Pedido abaixo de R$ 3.000',not_selling_yet:'Ainda não vende'};
  function captureRoute() {
    const query = new URLSearchParams(window.location.search);
    let stored;
    try { stored = JSON.parse(sessionStorage.getItem(ROUTE_KEY) || 'null'); } catch (_) {}
    if (query.get('hilst_route') === 'presencial_para_remoto' && ROUTE_REASONS[query.get('hilst_route_reason')]) {
      let entry = '';
      try {
        const url = new URL(query.get('hilst_entry_url') || 'https://representante.hilstjoiasemprata.com.br/');
        if (url.protocol === 'https:' && url.hostname === 'representante.hilstjoiasemprata.com.br') {
          [...url.searchParams.keys()].forEach(key => { if (!ATTRIBUTION_FIELDS.includes(key)) url.searchParams.delete(key); });
          url.hash = ''; entry = url.href;
        }
      } catch (_) {}
      stored = {origin:'representante',reason:query.get('hilst_route_reason'),id:(query.get('hilst_route_id') || '').replace(/[^a-zA-Z0-9-]/g,'').slice(0,100),entry_url:entry,captured_at:Date.now()};
      try { sessionStorage.setItem(ROUTE_KEY,JSON.stringify(stored)); } catch (_) {}
      return stored;
    }
    if (ATTRIBUTION_FIELDS.some(key => query.has(key)) || !stored || !ROUTE_REASONS[stored.reason] || Date.now()-stored.captured_at > 86400000) {
      try { sessionStorage.removeItem(ROUTE_KEY); } catch (_) {}
      return null;
    }
    return stored;
  }
  const route = captureRoute();

  function readCookie(name) {
    const prefix = `${name}=`;
    const item = document.cookie.split(';').map(value => value.trim()).find(value => value.startsWith(prefix));
    return item ? decodeURIComponent(item.slice(prefix.length)) : '';
  }

  function safeReadStorage() {
    try { return JSON.parse(window.localStorage.getItem(ATTRIBUTION_KEY) || '{}'); }
    catch (ignore) { return {}; }
  }

  function safeWriteStorage(value) {
    try { window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(value)); }
    catch (ignore) {}
  }

  function captureAttribution() {
    const query = new URLSearchParams(window.location.search);
    // A tagged visit replaces the complete campaign; old fields cannot contaminate a new route.
    const stored = ATTRIBUTION_FIELDS.some(key => query.has(key)) || query.has('hilst_route') ? {} : safeReadStorage();
    const current = {};
    ATTRIBUTION_FIELDS.forEach(key => {
      const value = query.get(key);
      if (value) current[key] = value.slice(0,500);
    });

    const attribution = {
      ...stored,
      ...current,
      landing_url: route?.entry_url || stored.landing_url || window.location.href,
      referrer: stored.referrer || document.referrer || '',
      captured_at: stored.captured_at || new Date().toISOString()
    };
    safeWriteStorage(attribution);
    return attribution;
  }

  function buildFbc(fbclid) {
    if (!fbclid) return '';
    return `fb.1.${Date.parse(attribution.captured_at) || Date.now()}.${fbclid}`;
  }

  const attribution = captureAttribution();
  const routeDetails = () => route ? {origin_lp:'representante',route_reason:route.reason,route_id:route.id,acquisition_campaign:attribution.utm_campaign || ''} : {};

  function appendToPayload(payload) {
    ATTRIBUTION_FIELDS.forEach(key => {
      if (attribution[key]) payload.set(key, attribution[key]);
    });
    const fbp = readCookie('_fbp');
    const fbc = attribution.fbclid ? buildFbc(attribution.fbclid) : readCookie('_fbc');
    if (fbp) payload.set('fbp', fbp);
    if (fbc) payload.set('fbc', fbc);
    payload.set('event_source_url', window.location.href);
    payload.set('landing_url', attribution.landing_url || window.location.href);
    payload.set('referrer', attribution.referrer || '');
    payload.set('client_user_agent', navigator.userAgent);
    if (route) {
      const campaign = attribution.utm_campaign ? ` | Campanha: ${attribution.utm_campaign}` : '';
      const campaignId = attribution.utm_id ? ` | ID da campanha: ${attribution.utm_id}` : '';
      payload.set('origem_detalhada',`LP Representante → Atacado remoto | ${ROUTE_REASONS[route.reason]}${campaign}${campaignId}`);
      payload.set('route_origin',route.origin);payload.set('route_reason',route.reason);payload.set('route_id',route.id);
      const notes = payload.get('observacoes_iniciais') || '';
      payload.set('observacoes_iniciais',`${notes}${notes ? ' | ' : ''}${payload.get('origem_detalhada')} | Identificador do caminho: ${route.id}`);
    }
  }

  function initializePixel() {
    if (!META_PIXEL_ID || window.fbq) return;
    /* Meta Pixel base loader. It remains inactive until META_PIXEL_ID is configured. */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function trackLead(eventId) {
    if (!META_PIXEL_ID || !window.fbq || !eventId) return;
    window.fbq('track', 'Lead', { content_name: 'Atacado Hilst | Operação ativa', lp_variant: 'guided_v3',lead_channel:'remoto',...routeDetails() }, { eventID: eventId });
  }

  function trackContact(eventId) {
    if (!META_PIXEL_ID || !window.fbq || !eventId) return;
    window.fbq('track', 'Contact', { content_name: 'WhatsApp consultora Hilst' }, { eventID: eventId });
  }

  function trackFormStart(formVersion) {
    if (!META_PIXEL_ID || !window.fbq) return;
    window.fbq('trackCustom', 'FormStart', { form_version: formVersion || '',...routeDetails() });
    if (route) trackCustom('remote_route_form_start',routeDetails());
  }

  function trackQualificationStepComplete(formVersion) {
    if (!META_PIXEL_ID || !window.fbq) return;
    window.fbq('trackCustom', 'QualificationStepComplete', { form_version: formVersion || '', step: 1 });
  }

  function trackFormError(errorType) {
    if (!META_PIXEL_ID || !window.fbq) return;
    window.fbq('trackCustom', 'FormError', { error_type: errorType || 'unknown' });
  }

  function trackCustom(eventName, data) {
    if (!META_PIXEL_ID || !window.fbq || !eventName) return;
    window.fbq('trackCustom', eventName, {...routeDetails(),...(data || {})});
  }

  function trackRegisteredContact(eventId, duplicate) {
    if (!route || !eventId) return;
    trackCustom(duplicate ? 'remote_route_existing_contact' : 'remote_route_lead',{...routeDetails(),lead_channel:'remoto'});
  }

  initializePixel();
  if (route) trackCustom('remote_route_arrival',routeDetails());
  window.HilstTracking = {
    appendToPayload,
    trackLead,
    trackContact,
    trackFormStart,
    trackQualificationStepComplete,
    trackFormError,
    trackCustom,
    trackRegisteredContact
  };
})();
