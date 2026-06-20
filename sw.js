// ===== 公文スコア推移 — Service Worker（Phase 9） =====
// アプリの資産をキャッシュし、オフラインでも起動できるようにする。
// 資産を更新したら CACHE の版数（v1 → v2…）を上げること。

const CACHE = 'kumon-v1';
const SHELL = [
  './',
  'index.html',
  'css/style.css',
  'js/storage.js',
  'js/score.js',
  'js/badge.js',
  'js/char.js',
  'js/chart.js',
  'js/app.js',
  'lib/chart.min.js',
  'icon.svg',
  'manifest.json'
];

// インストール時にアプリシェルを先読みキャッシュ
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

// 旧バージョンのキャッシュを掃除
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// GET はキャッシュ優先・無ければ取得して動的キャッシュ（画像の ?m= も版ごとに別管理）
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => (req.mode === 'navigate' ? caches.match('index.html') : undefined));
    })
  );
});
