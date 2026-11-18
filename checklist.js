/* =====================================================================
   Amor Sem Fronteiras - Checklist Gratuito
   Este arquivo é usado só por checklist.html (formulário) e obrigado.html (download).
   Ele faz três coisas:
     1) ENVIA o nome e o e-mail do formulário para o serviço de formulário (que repassa para o e-mail de contato);
     2) se o envio der certo, GUARDA um "sinal de acesso" no navegador e abre obrigado.html;
     3) em obrigado.html, só MOSTRA o download se esse sinal existir; senão, volta para o formulário.
   Os endereços, a chave e o nome do PDF ficam em site-config.js (nada para trocar aqui).
   ===================================================================== */
(function () {
  "use strict";

  var cfg = window.ASF || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ---------------------------------------------------------------
     PASSO 0 - o "sinal de acesso"
     Depois de um envio bem-sucedido, o navegador guarda o primeiro nome da pessoa e a hora.
     A página obrigado.html só abre se esse sinal existir e tiver menos de 24 horas.
     Tudo fica no aparelho da pessoa; nada disso é enviado a ninguém.
     (localStorage primeiro; se o navegador bloquear, tenta sessionStorage.)
     --------------------------------------------------------------- */
  var CHAVE = "asf_checklist_ok";
  var VALIDADE_MS = 24 * 60 * 60 * 1000;

  function guardarAcesso(nome) {
    var valor = JSON.stringify({ n: nome, t: Date.now() });
    try { localStorage.setItem(CHAVE, valor); } catch (e) {}
    try { sessionStorage.setItem(CHAVE, valor); } catch (e) {}
  }

  function lerAcesso() {
    var bruto = null;
    try { bruto = localStorage.getItem(CHAVE); } catch (e) {}
    if (!bruto) { try { bruto = sessionStorage.getItem(CHAVE); } catch (e) {} }
    if (!bruto) return null;
    try {
      var d = JSON.parse(bruto);
      if (d && typeof d.t === "number" && Date.now() - d.t < VALIDADE_MS) return d;
    } catch (e) {}
    return null;                                   // sinal inválido ou vencido
  }

  /* ---------------------------------------------------------------
     PÁGINA DO FORMULÁRIO (checklist.html)
     --------------------------------------------------------------- */
  var form = $("#form-checklist");
  if (form) {
    var status = $("#form-status");
    var botao = $("#form-enviar");
    var textoBotao = botao ? botao.textContent : "";

    // Mostra mensagem de erro/aviso no lugar certo (leitores de tela leem, por causa do aria-live)
    var erro = function (html) { status.className = "form-status err"; status.innerHTML = html; };

    // Quem tentou abrir obrigado.html direto volta para cá com ?aviso=preencha
    if (/[?&]aviso=preencha/.test(location.search)) {
      var aviso = $("#aviso-gate");
      if (aviso) aviso.hidden = false;
    }

    // Quem já pediu nas últimas 24 h ganha um atalho para baixar de novo, sem preencher outra vez
    if (lerAcesso()) {
      var atalho = $("#ja-pediu");
      if (atalho) atalho.hidden = false;
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();                          // não deixa o navegador enviar sozinho: nós controlamos o envio
      status.className = "form-status"; status.textContent = "";

      // PASSO 1 - campo-isca: pessoas não veem este campo; se ele veio preenchido, é robô. Descartamos em silêncio.
      if (form.elements["site"] && form.elements["site"].value) return;

      // PASSO 2 - confere os dados (o navegador já conferiu "obrigatório" e "e-mail válido"; aqui é a segunda checagem)
      var nome = form.elements["nome"].value.replace(/\s+/g, " ").trim();
      var email = form.elements["email"].value.trim();
      if (nome.length < 2) { erro("Digite o seu nome."); form.elements["nome"].focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { erro("Digite um e-mail válido, por exemplo nome@email.com."); form.elements["email"].focus(); return; }
      if (!form.elements["consentimento"].checked) { erro("Para receber o checklist, marque a caixa de concordância."); form.elements["consentimento"].focus(); return; }

      // PASSO 3 - confere se o site já foi configurado (chave do serviço de formulário em site-config.js)
      if (!cfg.CHECKLIST_FORM_URL || !cfg.CHECKLIST_FORM_KEY) {
        if (window.console) console.error("Checklist: falta preencher CHECKLIST_FORM_KEY em site-config.js.");
        erro("O formulário ainda está sendo ativado. Escreva para <a href=\"mailto:" + (cfg.CONTATO_EMAIL || "") + "\">" + (cfg.CONTATO_EMAIL || "nosso e-mail") + "</a> e enviaremos o seu checklist.");
        return;
      }

      // PASSO 4 - envia. Só nome, e-mail e o registro do aceite (data/hora) seguem para o serviço de formulário.
      botao.disabled = true; botao.textContent = "Enviando…";
      var cancelar = new AbortController();         // desiste se a internet travar
      var limite = setTimeout(function () { cancelar.abort(); }, 15000);

      fetch(cfg.CHECKLIST_FORM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        signal: cancelar.signal,
        body: JSON.stringify({
          access_key: cfg.CHECKLIST_FORM_KEY,                        // identifica o nosso e-mail de contato no serviço
          subject: "Novo pedido do Checklist Gratuito | Amor Sem Fronteiras",
          from_name: "Site Amor Sem Fronteiras",
          name: nome,
          email: email,                                              // o serviço usa como "responder para"
          consentimento: "Concordou em receber materiais por e-mail e com a Política de Privacidade em " +
            new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) + " (horário de Brasília)",
          pagina: location.href
        })
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          clearTimeout(limite);
          if (res.ok && res.d.success !== false) {
            // PASSO 5 - deu certo: guarda o sinal de acesso e abre a página de obrigado
            guardarAcesso(nome.split(" ")[0]);
            location.assign("obrigado.html");
            return;
          }
          throw new Error((res.d && res.d.message) || "falha");
        })
        .catch(function () {
          // PASSO 6 - deu errado: NÃO libera o download; mostra mensagem e deixa tentar de novo
          clearTimeout(limite);
          botao.disabled = false; botao.textContent = textoBotao;
          erro("Não conseguimos enviar agora. Confira a internet e tente de novo. Se continuar, escreva para <a href=\"mailto:" + (cfg.CONTATO_EMAIL || "") + "\">" + (cfg.CONTATO_EMAIL || "nosso e-mail") + "</a>.");
        });
    });
  }

  /* ---------------------------------------------------------------
     PÁGINA DE OBRIGADO (obrigado.html)
     O conteúdo vem escondido (atributo hidden). Só aparece se o sinal de acesso existir.
     --------------------------------------------------------------- */
  var area = $("#obrigado");
  if (area) {
    var acesso = lerAcesso();
    if (!acesso) {
      // sem sinal = a pessoa não preencheu o formulário: volta para a página do checklist
      location.replace("checklist.html?aviso=preencha");
      return;
    }
    var nomeEl = $("#obrigado-nome");
    if (nomeEl && acesso.n) nomeEl.textContent = acesso.n;           // textContent (nunca innerHTML) para o nome nunca virar código
    var baixar = $("#baixar");
    if (baixar && cfg.CHECKLIST_PDF) baixar.setAttribute("href", cfg.CHECKLIST_PDF);
    area.hidden = false;
  }
})();
