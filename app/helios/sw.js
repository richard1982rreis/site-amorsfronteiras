/* =====================================================================
   HÉLIOS · Service Worker (deixa o app funcionar sem internet)

   Fica em app/sw.js e só controla a pasta app/ (o Hélios). Ele NÃO guarda nem congela
   as outras páginas do site (index.html, história, e-book...).

   Estratégia:
   - Abrir o app: tenta a internet primeiro (assim as atualizações chegam sozinhas);
     se estiver sem sinal ou lento (mais de 4 s), usa a cópia guardada no aparelho.
   - Ícones e outros arquivos do app: usa a cópia guardada e atualiza em segundo plano.
   Ao publicar uma versão nova do app, troque o número em VERSAO para renovar o cache.

   Quem tinha instalado o app antigo (Amor de Hoje) usava este mesmo endereço (app/sw.js):
   ao atualizar, as cópias antigas são apagadas aqui embaixo (activate) e o Hélios assume.
   ===================================================================== */
const VERSAO = "helios-v7";
const ESCOPO = new URL("./", self.location).pathname;          // ex.: "/app/"
const CASCA = [
  "./index.html",
  "./manifest.json",
  "./icons/helios-icon-192.png",
  "./icons/helios-icon-512.png",
  "./icons/helios-apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(CASCA)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  // apaga caches de versões antigas (inclusive os do app antigo) e assume o controle das telas abertas
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function comLimite(promessa, ms) {
  return new Promise((ok, erro) => {
    const t = setTimeout(() => erro(new Error("lento")), ms);
    promessa.then((v) => { clearTimeout(t); ok(v); }, (er) => { clearTimeout(t); erro(er); });
  });
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;            // nada de fora do site é guardado
  if (!url.pathname.startsWith(ESCOPO)) return;               // nada fora da pasta do Hélios é guardado

  // 1) Abrir o app (/app/ ou /app/index.html): internet primeiro, cópia guardada se falhar
  if (req.mode === "navigate") {
    e.respondWith(
      comLimite(fetch(req), 4000)
        .then((r) => {
          if (r && r.ok) { const copia = r.clone(); caches.open(VERSAO).then((c) => c.put("./index.html", copia)); }
          return r;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // 2) Ícones e demais arquivos do app: cópia guardada + atualização em segundo plano
  e.respondWith(
    caches.open(VERSAO).then(async (c) => {
      const guardado = await c.match(req);
      const rede = fetch(req)
        .then((r) => { if (r && r.ok) c.put(req, r.clone()); return r; })
        .catch(() => guardado);
      return guardado || rede;
    })
  );
});

// Quando uma notificação do Hélios for tocada, abre o app
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((lista) => {
    for (const c of lista) { if ("focus" in c) return c.focus(); }
    if (clients.openWindow) return clients.openWindow("./");
  }));
});
