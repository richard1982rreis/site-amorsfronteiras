/* Amor Sem Fronteiras - comportamento comum a todas as páginas */
(function () {
  var cfg = window.ASF || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* menu no celular */
  var btn = $(".menu-btn"), menu = $("#menu");
  if (btn && menu) {
    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Fechar" : "Menu";
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("open")) btn.click(); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { if (menu.classList.contains("open")) btn.click(); }); });
  }

  /* botões que dependem de link externo: Google Play e e-book */
  function ligar(sel, url, textoAtivo) {
    $$(sel).forEach(function (a) {
      if (url) {
        a.href = url; a.target = "_blank"; a.rel = "noopener";
        a.removeAttribute("aria-disabled"); a.removeAttribute("role");
        var alvo = a.querySelector("[data-label]"); if (alvo && textoAtivo) alvo.textContent = textoAtivo;
      } else if (a.getAttribute("href") === "#") {
        a.addEventListener("click", function (e) { e.preventDefault(); });
      }
    });
  }
  ligar("[data-play]", cfg.PLAY_URL, "Baixar o app");
  ligar("[data-ebook]", cfg.EBOOK_URL, null);

  /* entrada suave */
  var items = $$(".reveal");
  var reduz = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduz || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ano no rodapé */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* demonstração: a frase troca a cada 5 s e o botão leva a frase ao WhatsApp */
  var el = $("#demoFrase"), env = $("#demoEnviar"), F = cfg.FRASES || [];
  if (el && env && F.length) {
    var i = 0, parado = false, timer = null;
    var aspas = function (t) { return "“" + t + "”"; };
    var link = function () { env.href = "https://api.whatsapp.com/send?text=" + encodeURIComponent(aspas(F[i])); };
    var mostrar = function (n) { i = n; el.textContent = aspas(F[i]); link(); };
    mostrar(0);
    var proxima = function () {
      if (parado || document.hidden) return;
      if (reduz) { mostrar((i + 1) % F.length); return; }
      el.classList.add("troca");
      setTimeout(function () { mostrar((i + 1) % F.length); el.classList.remove("troca"); }, 450);
    };
    var ligarTimer = function () { clearInterval(timer); timer = setInterval(proxima, 5000); };
    ligarTimer();
    var tela = el.closest(".phone");
    ["mouseenter", "touchstart", "focusin"].forEach(function (ev) { tela.addEventListener(ev, function () { parado = true; }, { passive: true }); });
    ["mouseleave", "touchend", "focusout"].forEach(function (ev) { tela.addEventListener(ev, function () { parado = false; ligarTimer(); }, { passive: true }); });
  }

  /* e-book: preço e contadores da oferta (valores e data em site-config.js)
     - Oferta ativa (OFERTA_FIM no futuro): mostra EBOOK_PRECO_PROMO e os contadores.
     - Oferta acabou (ou OFERTA_FIM vazio): mostra EBOOK_PRECO (o preço normal) e esconde os contadores.
     A troca acontece sozinha, até com a página aberta: no instante em que o prazo termina, o preço volta ao normal. */
  var blocos = $$("[data-oferta]");
  var fim = cfg.OFERTA_FIM ? new Date(cfg.OFERTA_FIM + (/(Z|[+-]\d\d:\d\d)$/.test(cfg.OFERTA_FIM) ? "" : "-03:00")).getTime() : NaN;
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var mostrarPreco = function (promo) {                       // promo = true: preço da promoção; false: preço normal
    var preco = (promo && cfg.EBOOK_PRECO_PROMO) ? cfg.EBOOK_PRECO_PROMO : cfg.EBOOK_PRECO;
    if (preco) $$("[data-preco]").forEach(function (el) { el.textContent = preco; });
  };
  var esconder = function () { blocos.forEach(function (b) { b.hidden = true; }); $$("[data-so-oferta]").forEach(function (b) { b.hidden = true; }); };
  if (isNaN(fim) || fim - Date.now() <= 0) { mostrarPreco(false); esconder(); }       // sem oferta ou já terminou: preço normal
  else {
    mostrarPreco(true);                                                                // oferta ativa: preço promocional
    var tick = function () {
      var d = fim - Date.now();
      if (d <= 0) { mostrarPreco(false); esconder(); return false; }                   // acabou agora: volta ao preço normal sem recarregar
      var v = { d: Math.floor(d / 864e5), h: Math.floor(d % 864e5 / 36e5), m: Math.floor(d % 36e5 / 6e4), s: Math.floor(d % 6e4 / 1e3) };
      $$("[data-cd]").forEach(function (el) { el.textContent = pad(v[el.getAttribute("data-cd")]); });
      return true;
    };
    blocos.forEach(function (b) { b.hidden = false; });
    if (tick()) { var t = setInterval(function () { if (!tick()) clearInterval(t); }, 1000); }
  }
})();
