// Atelier Digital — link direto de checkout + captura de UTM
// Captura UTMs da URL -> cookies -> sessionStorage (fallback em 3 camadas)
// e anexa como query params no href real do botão de compra, assim que a
// página carrega. O botão é um link direto de verdade (funciona mesmo
// sem JS, mostra a URL real ao passar o mouse, sem redirecionamento via
// onclick/javascript:void(0)).

(function () {
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'sck', 'src', 'xcod'];

  // Salva UTMs no sessionStorage ao carregar a página (camada de backup)
  (function () {
    var urlParams = new URLSearchParams(window.location.search);
    UTM_KEYS.forEach(function (key) {
      if (urlParams.get(key)) sessionStorage.setItem(key, urlParams.get(key));
    });
  })();

  // Lê UTMs: URL -> cookies -> sessionStorage
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
    var btn = document.getElementById('checkoutBtn');
    if (!btn) return;

    var base = btn.getAttribute('href');
    var utms = getUTMs();
    var extra = Object.keys(utms).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(utms[k]);
    }).join('&');

    if (extra) btn.href = base + (base.indexOf('?') === -1 ? '?' : '&') + extra;
  });
})();
