/* Service worker du site : reçoit les notifications push de l'espace élève et les affiche.
   Pas de mise en cache des pages (le site reste toujours à jour). */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
    var d = {};
    try { d = e.data ? e.data.json() : {}; } catch (x) { d = { texte: e.data && e.data.text() }; }
    e.waitUntil(self.registration.showNotification(d.titre || 'Maths CLT', {
        body: d.texte || '',
        icon: 'img/favicon-192.png',
        badge: 'img/favicon-192.png',
        data: { url: new URL(d.url || 'espace-eleve/', self.registration.scope).href }
    }));
});

self.addEventListener('notificationclick', function (e) {
    e.notification.close();
    var url = (e.notification.data && e.notification.data.url) || self.registration.scope;
    e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (fenetres) {
        for (var i = 0; i < fenetres.length; i++) {
            if (fenetres[i].url.indexOf(url) === 0 && 'focus' in fenetres[i]) return fenetres[i].focus();
        }
        return self.clients.openWindow(url);
    }));
});
