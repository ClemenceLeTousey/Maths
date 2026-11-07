/* Service worker du site : reçoit les notifications push de l'espace élève et les affiche.
   Pas de mise en cache des pages (le site reste toujours à jour). */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
    var d = {};
    try { d = e.data ? e.data.json() : {}; } catch (x) { d = { texte: e.data && e.data.text() }; }
    e.waitUntil(self.registration.showNotification(d.titre || 'Maths Lebrun', {
        body: d.texte || '',
        icon: 'img/icone-appli-192.png',
        badge: 'img/icone-appli-192.png',
        data: { url: new URL(d.url || 'espace-eleve/', self.registration.scope).href }
    }).then(pastille));
});

// Pastille sur l'icône de l'appli : nombre de notifications non lues (iPhone : appli installée seulement)
function pastille() {
    if (!self.navigator.setAppBadge) return;
    return self.registration.getNotifications().then(function (l) {
        return l.length ? self.navigator.setAppBadge(l.length) : self.navigator.clearAppBadge();
    }).catch(function () {});
}

self.addEventListener('notificationclick', function (e) {
    e.notification.close();
    pastille();
    var url = (e.notification.data && e.notification.data.url) || self.registration.scope;
    e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (fenetres) {
        for (var i = 0; i < fenetres.length; i++) {
            if (fenetres[i].url.indexOf(url) === 0 && 'focus' in fenetres[i]) return fenetres[i].focus();
        }
        return self.clients.openWindow(url);
    }));
});
