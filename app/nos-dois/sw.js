/* =====================================================================
   NÓS DOIS · Service Worker (deixa o jogo funcionar sem internet)

   Fica em nos-dois/sw.js e só controla a pasta nos-dois/. Não guarda nem congela as outras páginas do site.
   Estratégia (a mesma do Hélios):
   - Abrir o jogo: tenta a internet primeiro (as atualizações chegam sozinhas);
     se estiver sem sinal ou lento (mais de 4 s), usa a cópia guardada no aparelho.
   - Ícones e demais arquivos: usa a cópia guardada e atualiza em segundo plano.
   Ao publicar uma versão nova do jogo, troque o número em VERSAO para renovar o cache.
   ===================================================================== */
const VERSAO = "nos-dois-v8";
const ESCOPO = new URL("./", self.location).pathname;          // ex.: "/nos-dois/"
const CASCA = [
  "./index.html",
  "./manifest.json",
  "./icons/nos-dois-icon-192.png",
  "./icons/nos-dois-icon-512.png",
  "./icons/nos-dois-apple-touch-icon.png",
  "./icons/favicon-64.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(CASCA)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  // apaga caches de versões antigas e assume o controle das telas abertas
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
  if (!url.pathname.startsWith(ESCOPO)) return;               // nada fora da pasta do jogo é guardado

  // 1) Abrir o jogo: internet primeiro, cópia guardada se falhar
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

  // 2) Demais arquivos: cópia guardada + atualização em segundo plano
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
