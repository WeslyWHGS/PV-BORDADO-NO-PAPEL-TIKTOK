// Atelier Digital — back-button / exit-intent redirect (página principal)
// Envia a visitante para oferta-especial.html em vez de deixá-la sair:
// 1) Botão/gesto de "voltar" do navegador (funciona em desktop e mobile),
//    via truque de history.pushState + popstate.
// 2) Exit-intent de mouse em desktop — cursor sai pelo topo da janela
//    (indicando intenção de fechar a aba ou trocar de URL).
// Dispara no máximo uma vez por sessão (sessionStorage) para não travar
// a navegação de quem já viu a oferta de recuperação.

(function () {
  var REDIRECT_URL = 'oferta-especial.html';
  var SESSION_KEY = 'pa_exit_redirect_fired';
  var ARM_DELAY_MS = 4000; // só arma depois de alguns segundos na página

  if (sessionStorage.getItem(SESSION_KEY)) return;

  var armed = false;
  setTimeout(function () { armed = true; }, ARM_DELAY_MS);

  function redirect() {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, '1');
    window.location.href = REDIRECT_URL;
  }

  // 1) Botão/gesto de voltar
  history.pushState({ paExitGuard: true }, '', location.href);
  window.addEventListener('popstate', function () {
    if (!armed) return;
    redirect();
  });

  // 2) Exit-intent de mouse (desktop)
  document.addEventListener('mouseout', function (e) {
    if (!armed) return;
    if (e.clientY > 10) return;
    if (e.relatedTarget || e.toElement) return;
    redirect();
  });
})();
