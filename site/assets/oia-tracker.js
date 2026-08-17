/* OptimizIA Tracker V3 (multi-sites) : mesure d'audience anonyme, sans tiers. Opt-out : ?notrack=1 */
(function () {
  'use strict';
  var CFG = { site: 'etp', legal: 'politique-confidentialite.html', accent: '#10B981' };
  var N8N = 'https://n8n.romainben.cloud/webhook/oia/sync';
  var K = { optout: 'optimizia_notrack', consent: 'oia_consent', vid: 'oia_vid', sid: 'oia_sid', src: 'oia_src', cmp: 'oia_cmp' };
  var isEN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  var TXT = isEN ? {
    body: 'We measure our audience <strong>anonymously</strong>, with no third parties and no profiling. <a href="politique-confidentialite.html">Learn more</a>',
    accept: 'Accept', refuse: 'Decline'
  } : {
    body: 'Nous mesurons notre audience de façon <strong>anonyme</strong>, sans partage tiers ni profilage. <a href="politique-confidentialite.html">En savoir plus</a>',
    accept: 'Accepter', refuse: 'Refuser'
  };

  var Q = null;
  try { Q = new URLSearchParams(location.search); } catch (e) {}

  try {
    if (Q && Q.has('notrack')) {
      if (Q.get('notrack') === '1') { localStorage.setItem(K.optout, '1'); console.log('%c[OptimizIA] Tracker désactivé sur ce navigateur', 'color:#F97316;font-weight:bold'); }
      else { localStorage.removeItem(K.optout); console.log('%c[OptimizIA] Tracker réactivé', 'color:#3B82F6;font-weight:bold'); }
    }
    if (localStorage.getItem(K.optout)) return;
  } catch (e) {}

  var REF_AT_LOAD = document.referrer || '';

  function categorize(ref) {
    var us = Q && (Q.get('utm_source') || '').toLowerCase().slice(0, 40);
    if (us) return us;
    if (!ref) return 'direct';
    try {
      var h = new URL(ref).hostname.toLowerCase();
      if (h === location.hostname) return null;
      var MAP = [
        ['linkedin', 'linkedin'], ['lnkd.in', 'linkedin'],
        ['tiktok', 'tiktok'], ['youtu', 'youtube'],
        ['instagram', 'instagram'], ['facebook', 'facebook'], ['fb.com', 'facebook'],
        ['twitter', 'x'], ['x.com', 'x'], ['t.co', 'x'],
        ['discord', 'discord'], ['t.me', 'telegram'], ['telegram', 'telegram'],
        ['reddit', 'reddit'], ['bing', 'bing'], ['duckduckgo', 'duckduckgo'],
        ['seoplus.optimizia', 'seoplus'], ['optimizia.xyz', 'optimizia.xyz'],
        ['romainben.cloud', 'romainben.cloud'], ['ginoux.xyz', 'ginoux.xyz'],
        ['exotradingplus', 'exotradingplus'],
      ];
      for (var i = 0; i < MAP.length; i++) { if (h.indexOf(MAP[i][0]) !== -1) return MAP[i][1]; }
      if (/^(www\.)?google\./.test(h)) return 'google';
      return h.replace(/^www\./, '');
    } catch (e) { return 'direct'; }
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); });
  }

  function startTracker() {
    var vid, sid, src, cmp;
    try {
      vid = localStorage.getItem(K.vid);
      if (!vid) { vid = uuid(); localStorage.setItem(K.vid, vid); }
      sid = sessionStorage.getItem(K.sid);
      if (!sid) { sid = uuid(); sessionStorage.setItem(K.sid, sid); }
      src = sessionStorage.getItem(K.src);
      if (!src) { src = categorize(REF_AT_LOAD) || 'direct'; sessionStorage.setItem(K.src, src); }
      cmp = sessionStorage.getItem(K.cmp);
      if (cmp === null || cmp === undefined) { cmp = ((Q && Q.get('utm_campaign')) || '').slice(0, 80); sessionStorage.setItem(K.cmp, cmp); }
    } catch (e) { return; }

    function payload(event, element) {
      return { site: CFG.site, event: event, page: location.pathname, element: element || '', visitorId: vid, sessionId: sid, source: src, campaign: cmp, timestamp: new Date().toISOString() };
    }
    function send(event, element) {
      fetch(N8N, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload(event, element)) }).catch(function () {});
    }

    send('pageview', document.title);

    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('a[href], button, [data-track]') : null;
      if (!el) return;
      var href = el.getAttribute('href') || '';
      var text = (el.textContent || '').trim().slice(0, 80);
      var external = false;
      if (href && href.indexOf('#') !== 0) {
        try { external = new URL(href, location.href).hostname !== location.hostname; } catch (err) {}
      }
      if (el.matches('button, [data-track], [class*="btn"], [class*="cta"]')) { send('cta_click', text); }
      else if (external) { send('external_click', text || href.slice(0, 80)); }
      else { send('nav_click', text); }
    });

    document.querySelectorAll('form').forEach(function (form) {
      form.addEventListener('submit', function () { send('form_submit', form.id || form.getAttribute('action') || 'form'); });
    });

    var depths = [25, 50, 75, 100], fired = {};
    window.addEventListener('scroll', function () {
      var pct = Math.round((window.scrollY + window.innerHeight) / Math.max(document.body.scrollHeight, 1) * 100);
      depths.forEach(function (d) { if (pct >= d && !fired[d]) { fired[d] = true; send('scroll_depth', d + '%'); } });
    }, { passive: true });

    var t0 = Date.now(), sentTime = false;
    function sendTime() {
      if (sentTime) return;
      var s = Math.round((Date.now() - t0) / 1000);
      if (s < 1) return;
      sentTime = true;
      try { navigator.sendBeacon(N8N, new Blob([JSON.stringify(payload('time_on_page', s + 's'))], { type: 'text/plain' })); } catch (e) {}
    }
    window.addEventListener('pagehide', sendTime);
    window.addEventListener('beforeunload', sendTime);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') sendTime(); });
  }

  function ensureBanner() {
    var el = document.getElementById('oia-consent');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'oia-consent';
    el.className = 'oia-injected';
    el.hidden = true;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', isEN ? 'Audience measurement consent' : "Consentement mesure d'audience");
    el.innerHTML = '<p class="oia-consent-text"></p><div class="oia-consent-actions"><button type="button" class="oia-btn-refuse"></button><button type="button" class="oia-btn-accept"></button></div>';
    var st = document.createElement('style');
    st.textContent = '#oia-consent.oia-injected{position:fixed;left:18px;bottom:18px;z-index:9999;max-width:340px;background:#0F172A;color:#E2E8F0;border:1px solid rgba(148,163,184,.28);border-radius:14px;padding:16px 18px;font-size:13px;line-height:1.55;box-shadow:0 12px 34px rgba(2,6,18,.45);font-family:inherit}#oia-consent.oia-injected[hidden]{display:none}#oia-consent.oia-injected a{color:inherit;text-decoration:underline}#oia-consent.oia-injected .oia-consent-actions{display:flex;gap:8px;margin-top:12px;justify-content:flex-end}#oia-consent.oia-injected button{cursor:pointer;border-radius:8px;font-size:12.5px;padding:7px 14px;font-family:inherit}#oia-consent.oia-injected .oia-btn-accept{border:none;background:#10B981;color:#fff;font-weight:600}#oia-consent.oia-injected .oia-btn-refuse{border:1px solid rgba(148,163,184,.4);background:transparent;color:#94A3B8}';
    document.head.appendChild(st);
    document.body.appendChild(el);
    return el;
  }

  function showBanner() {
    var el = ensureBanner();
    if (!el) return;
    el.querySelector('.oia-consent-text').innerHTML = TXT.body;
    el.querySelector('.oia-btn-accept').textContent = TXT.accept;
    el.querySelector('.oia-btn-refuse').textContent = TXT.refuse;
    el.hidden = false;
    el.setAttribute('data-show', '1');
    el.querySelector('.oia-btn-accept').addEventListener('click', function () {
      try { localStorage.setItem(K.consent, 'accepted'); } catch (e) {}
      el.removeAttribute('data-show'); el.hidden = true;
      startTracker();
    });
    el.querySelector('.oia-btn-refuse').addEventListener('click', function () {
      try { localStorage.setItem(K.consent, 'refused'); } catch (e) {}
      el.removeAttribute('data-show'); el.hidden = true;
    });
  }

  var consent = null;
  try { consent = localStorage.getItem(K.consent); } catch (e) {}
  if (consent === 'accepted') startTracker();
  else if (consent !== 'refused') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBanner);
    else showBanner();
  }
})();
