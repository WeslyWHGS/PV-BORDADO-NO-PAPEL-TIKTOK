// The Paper Atelier — page interactions
// FAQ accordion, "who it's for" tabs, catalog carousel, countdown timer,
// and the scroll-reveal animation.

document.addEventListener('DOMContentLoaded', function () {

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    btn.addEventListener('click', function () {
      var open = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
      if (!open) item.classList.add('open');
    });
  });

  // Who it's for — tabs
  document.querySelectorAll('.who-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.dataset.target;

      document.querySelectorAll('.who-tab').forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      document.querySelectorAll('.who-panel').forEach(function (p) { p.classList.remove('is-active'); });
      var panel = document.getElementById(target);
      if (panel) panel.classList.add('is-active');
    });
  });

  // Catalog carousel — horizontal scroll with arrow controls
  (function () {
    var track = document.querySelector('.catalog-track');
    var prev = document.querySelector('.catalog-prev');
    var next = document.querySelector('.catalog-next');
    if (!track || !prev || !next) return;

    function scrollByCard(dir) {
      var card = track.querySelector('.catalog-card');
      if (!card) return;
      var cardWidth = card.getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(track).gap) || 24;
      track.scrollBy({ left: dir * (cardWidth + gap), behavior: 'smooth' });
    }
    prev.addEventListener('click', function () { scrollByCard(-1); });
    next.addEventListener('click', function () { scrollByCard(1); });

    function updateArrows() {
      var maxScroll = track.scrollWidth - track.clientWidth - 4;
      prev.toggleAttribute('disabled', track.scrollLeft <= 4);
      next.toggleAttribute('disabled', track.scrollLeft >= maxScroll);
    }
    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();
  })();

  // Depoimentos — carrossel automático (só ativo no modo mobile, quando o
  // mural vira scroll horizontal via CSS). Pausa ao tocar/arrastar e
  // retoma sozinho depois de um tempo parado; some se a aba não está
  // visível ou a seção está fora da tela; respeita prefers-reduced-motion.
  (function () {
    var track = document.querySelector('.testimonials-grid');
    if (!track) return;

    var AUTO_MS = 3200;
    var RESUME_DELAY_MS = 5000;
    var timer = null;
    var resumeTimer = null;
    var userPaused = false;
    var inView = false;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function isCarouselMode() {
      return track.scrollWidth > track.clientWidth + 4;
    }
    function stepWidth() {
      var card = track.querySelector('.testimonial-shot');
      if (!card) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).gap) || 14;
      return card.getBoundingClientRect().width + gap;
    }
    function tick() {
      if (reduceMotion || userPaused || !inView || !isCarouselMode()) return;
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      if (atEnd) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: stepWidth(), behavior: 'smooth' });
      }
    }
    function start() {
      stop();
      if (reduceMotion) return;
      timer = setInterval(tick, AUTO_MS);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }
    function pauseForInteraction() {
      userPaused = true;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () { userPaused = false; }, RESUME_DELAY_MS);
    }

    ['touchstart', 'pointerdown', 'wheel'].forEach(function (evt) {
      track.addEventListener(evt, pauseForInteraction, { passive: true });
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { inView = e.isIntersecting; });
    }, { threshold: 0.4 });
    io.observe(track);

    start();
  })();

  // Reveal on scroll (IntersectionObserver)
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

});
