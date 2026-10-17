/* Pages « corrigé » : onglets Sujet A / Sujet B (#B dans l'adresse ouvre le sujet B),
   bouton sous chaque exercice qui déplie la correction détaillée juste en dessous. */
(function () {
    var onglets = Array.prototype.slice.call(document.querySelectorAll('.onglets [role="tab"]'));
    function ouvrir(s, focus) {
        if (s !== 'B') s = 'A';
        onglets.forEach(function (o) {
            var actif = o.dataset.sujet === s;
            o.setAttribute('aria-selected', actif ? 'true' : 'false');
            o.tabIndex = actif ? 0 : -1;
            document.getElementById(o.getAttribute('aria-controls')).hidden = !actif;
            if (actif && focus) o.focus();
        });
        try { history.replaceState(null, '', s === 'B' ? '#B' : location.pathname + location.search); } catch (e) {}
    }
    onglets.forEach(function (o, k) {
        o.onclick = function () { ouvrir(o.dataset.sujet); };
        o.onkeydown = function (e) {
            var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
            if (d) { e.preventDefault(); ouvrir(onglets[(k + d + onglets.length) % onglets.length].dataset.sujet, true); }
        };
    });
    ouvrir(location.hash.slice(1));

    Array.prototype.forEach.call(document.querySelectorAll('button.ouvrir'), function (b) {
        var cible = document.getElementById(b.getAttribute('aria-controls'));
        var texte = b.textContent;
        b.onclick = function () {
            var ouvert = b.getAttribute('aria-expanded') !== 'true';
            b.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
            cible.hidden = !ouvert;
            b.textContent = ouvert ? texte.replace('Voir', 'Masquer') : texte;
        };
    });
})();
