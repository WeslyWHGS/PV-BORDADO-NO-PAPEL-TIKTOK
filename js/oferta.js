// Atelier Digital — página de Oferta Especial (recuperação de checkout)
// Checkout próprio desta oferta (R$19,90) + captura de UTM, seguindo o
// mesmo padrão de js/checkout.js. Contador regressivo com ciclo curto,
// independente do contador da página principal.

(function () {
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'sck', 'src', 'xcod'];

  var CHECKOUT_URL = 'https://checkout.atelierdigital.site/VCCL1O8SD7SF';

  (function () {
    var urlParams = new URLSearchParams(window.location.search);
    UTM_KEYS.forEach(function (key) {
      if (urlParams.get(key)) sessionStorage.setItem(key, urlParams.get(key));
    });
  })();

  function getUTMs() {
    var params = {};
    var urlParams = new URLSearchParams(window.location.search);

    UTM_KEYS.forEach(function (key) {
      if (urlParams.get(key)) params[key] = urlParams.get(key);
    });
    UTM_KEYS.forEach(function (key) {
      if (!params[key]) {
        var match = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]*)'));
        if (match) params[key] = decodeURIComponent(match[1]);
      }
    });
    UTM_KEYS.forEach(function (key) {
      if (!params[key] && sessionStorage.getItem(key)) params[key] = sessionStorage.getItem(key);
    });

    return params;
  }

  window.goToCheckoutOferta = function (e) {
    if (e && e.preventDefault) e.preventDefault();

    if (window._goCheckoutOfertaFired) return;
    window._goCheckoutOfertaFired = true;

    var base = CHECKOUT_URL;

    var utms = getUTMs();
    var extra = Object.keys(utms).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(utms[k]);
    }).join('&');

    if (extra) base += (base.indexOf('?') === -1 ? '?' : '&') + extra;

    window.location.href = base;
  };

  // Contador regressivo curto e independente (id "ofertaCountdown"),
  // para não conflitar com o contador de 15h da página principal (id "megaCountdown").
  document.addEventListener('DOMContentLoaded', function () {
    var el = document.getElementById('ofertaCountdown');
    if (!el) return;
    var nums = {
      minutes: el.querySelector('[data-cd="minutes"]'),
      seconds: el.querySelector('[data-cd="seconds"]'),
    };
    var STORAGE_KEY = 'pa_oferta_countdown_target';
    var CYCLE_MS = 20 * 60 * 1000; // 20 minutos

    function getTarget() {
      var t = parseInt(sessionStorage.getItem(STORAGE_KEY) || '0', 10);
      var now = Date.now();
      if (!t || t <= now) {
        t = now + CYCLE_MS;
        try { sessionStorage.setItem(STORAGE_KEY, t); } catch (e) {}
      }
      return t;
    }
    var target = getTarget();

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        target = Date.now() + CYCLE_MS;
        try { sessionStorage.setItem(STORAGE_KEY, target); } catch (e) {}
        return;
      }
      var s = Math.floor(diff / 1000);
      if (nums.minutes) nums.minutes.textContent = pad(Math.floor(s / 60));
      if (nums.seconds) nums.seconds.textContent = pad(s % 60);
    }
    tick();
    setInterval(tick, 1000);
  });
})();
