(function () {
  'use strict';

  const META_PIXEL_ID = '';
  const ATTRIBUTION_KEY = 'hilst_attribution_v1';
  const ATTRIBUTION_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];

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
    const stored = safeReadStorage();
    const current = {};
    ATTRIBUTION_FIELDS.forEach(key => {
      const value = query.get(key);
      if (value) current[key] = value;
    });

    const attribution = {
      ...stored,
      ...current,
      landing_url: stored.landing_url || window.location.href,
      referrer: stored.referrer || document.referrer || '',
      captured_at: stored.captured_at || new Date().toISOString()
    };
    safeWriteStorage(attribution);
    return attribution;
  }

  function buildFbc(fbclid) {
    if (!fbclid) return '';
    return `fb.1.${Math.floor(Date.now() / 1000)}.${fbclid}`;
  }

  const attribution = captureAttribution();

  function appendToPayload(payload) {
    ATTRIBUTION_FIELDS.forEach(key => {
      if (attribution[key]) payload.set(key, attribution[key]);
    });
    const fbp = readCookie('_fbp');
    const fbc = readCookie('_fbc') || buildFbc(attribution.fbclid);
    if (fbp) payload.set('fbp', fbp);
    if (fbc) payload.set('fbc', fbc);
    payload.set('event_source_url', window.location.href);
    payload.set('landing_url', attribution.landing_url || window.location.href);
    payload.set('referrer', attribution.referrer || '');
    payload.set('client_user_agent', navigator.userAgent);
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
    window.fbq('track', 'Lead', { content_name: 'Curadoria Hilst ICP 2' }, { eventID: eventId });
  }

  function trackContact(eventId) {
    if (!META_PIXEL_ID || !window.fbq || !eventId) return;
    window.fbq('track', 'Contact', { content_name: 'WhatsApp consultora Hilst' }, { eventID: eventId });
  }

  initializePixel();
  window.HilstTracking = { appendToPayload, trackLead, trackContact };
})();
