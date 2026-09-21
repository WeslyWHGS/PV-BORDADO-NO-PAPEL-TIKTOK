// Atelier Digital — página de Upsell (OTO) "Da Agulha ao Primeiro Pedido"
// Anexa UTMs aos links de aceite/recusa (mesmo padrão de js/checkout.js) e
// roda o cronômetro de 12min da oferta. Não faz nenhum request de pagamento:
// os links [LINK DE ACEITE] / [LINK DE RECUSA] devem ser substituídos pelos
// links reais de upsell de 1 clique gerados na plataforma de checkout.

(function () {
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'sck', 'src', 'xcod'];

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

  document.addEventListener('DOMContentLoaded', function () {
    var utms = getUTMs();
    var extra = Object.keys(utms).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(utms[k]);
    }).join('&');

    if (extra) {
      document.querySelectorAll('.oto-accept-btn, .oto-decline-btn').forEach(function (link) {
        var base = link.getAttribute('href');
        if (!base) return;
        link.href = base + (base.indexOf('?') === -1 ? '?' : '&') + extra;
      });
    }
  });

  // Cronômetro de 12min, independente dos outros contadores do site.
  document.addEventListener('DOMContentLoaded', function () {
    var el = document.getElementById('otoCountdown');
    if (!el) return;
    var nums = {
      minutes: el.querySelector('[data-cd="minutes"]'),
      seconds: el.querySelector('[data-cd="seconds"]'),
    };
    var STORAGE_KEY = 'pa_oto_countdown_target';
    var CYCLE_MS = 12 * 60 * 1000; // 12 minutos

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
