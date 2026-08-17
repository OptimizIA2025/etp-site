/* ExoTradingPlus! · JS partagé : icônes Lucide, nav mobile, reveal au scroll */
(function () {
  // Icônes Lucide (chargé via CDN dans le <head>)
  if (window.lucide) lucide.createIcons();

  // Toggle menu mobile
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () { links.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // Leviers : détail au tap (le survol est géré en CSS)
  var leviers = document.querySelectorAll('.levier');
  if (leviers.length) {
    leviers.forEach(function (card) {
      card.addEventListener('click', function (e) {
        var willOpen = !card.classList.contains('open');
        leviers.forEach(function (c) { c.classList.remove('open'); });
        if (willOpen) card.classList.add('open');
        e.stopPropagation();
      });
    });
    document.addEventListener('click', function () {
      leviers.forEach(function (c) { c.classList.remove('open'); });
    });
  }

  // Compte à rebours (fin de phase Early Birds)
  var cd = document.querySelector('.countdown');
  if (cd) {
    var target = new Date(cd.getAttribute('data-deadline')).getTime();
    var out = {
      days: cd.querySelector('[data-cd="days"]'),
      hours: cd.querySelector('[data-cd="hours"]'),
      mins: cd.querySelector('[data-cd="mins"]'),
      secs: cd.querySelector('[data-cd="secs"]')
    };
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var tick = function () {
      var diff = target - Date.now();
      if (diff <= 0) { cd.classList.add('ended'); diff = 0; }
      var s = Math.floor(diff / 1000);
      out.days.textContent = Math.floor(s / 86400);
      out.hours.textContent = pad(Math.floor((s % 86400) / 3600));
      out.mins.textContent = pad(Math.floor((s % 3600) / 60));
      out.secs.textContent = pad(s % 60);
    };
    tick();
    setInterval(tick, 1000);
  }

  // Lightbox photo (zoom au clic)
  var zoomables = document.querySelectorAll('[data-zoom]');
  if (zoomables.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = '<button class="lightbox-close" aria-label="Fermer"><i data-lucide="x"></i></button><img alt="">';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('img');
    var closeLb = function () { lb.classList.remove('open'); };
    zoomables.forEach(function (img) {
      img.addEventListener('click', function () {
        lbImg.src = img.getAttribute('src');
        lbImg.alt = img.getAttribute('alt') || '';
        lb.classList.add('open');
      });
    });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.closest('.lightbox-close')) closeLb();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
    if (window.lucide) lucide.createIcons();
  }

  // Reveal au scroll
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el) { io.observe(el); });
})();
