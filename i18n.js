/** G3NE5IS -- i18n.js : Domain detection + translation engine */
(function () {
  function detectLang() {
    var h = window.location.hostname;
    if (h.indexOf('genesis-invest.pl') !== -1) return 'pl';
    if (h.indexOf('genesis-invest.sk') !== -1) return 'sk';
    return 'cs';
  }
  function applyMeta(t) {
    document.title = t.meta_title || document.title;
    var d = document.querySelector('meta[name=description]');
    if (d && t.meta_desc) d.setAttribute('content', t.meta_desc);
    var o1 = document.querySelector('meta[property="og:title"]');
    if (o1 && t.og_title) o1.setAttribute('content', t.og_title);
    var o2 = document.querySelector('meta[property="og:description"]');
    if (o2 && t.og_desc) o2.setAttribute('content', t.og_desc);
  }
  function applyTranslations() {
    if (!window.TRANSLATIONS) return;
    var lang = detectLang();
    var t = window.TRANSLATIONS[lang] || window.TRANSLATIONS.cs;
    document.documentElement.lang = lang;
    applyMeta(t);
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.innerHTML = t[key];
    });
    document.querySelectorAll('[data-i18n-href]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-href');
      if (t[key] !== undefined) el.setAttribute('href', t[key]);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-aria');
      if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
    });
    var ham = document.getElementById('hamburger');
    if (ham && t.nav_open_label) ham.setAttribute('aria-label', t.nav_open_label);
    var nc = document.getElementById('nav-close');
    if (nc && t.nav_close_label) nc.setAttribute('aria-label', t.nav_close_label);
    window.SITE_LANG = lang;
    window.SITE_T = t;
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
  } else {
    applyTranslations();
  }
})();