/* Raccourci caché : Maj + clic sur l'étiquette « Cours » ouvre la version élève du cours
   (adresse dans l'attribut data-eleve). Le lien visible mène à la version complète. */
document.addEventListener('click', function (e) {
    var etiquette = e.target.closest && e.target.closest('.type-cours[data-eleve]');
    if (!etiquette || !e.shiftKey) return;
    e.preventDefault();
    window.open(etiquette.dataset.eleve, '_blank', 'noopener');
});

/* Thème clair par défaut ; bouton « Sombre / Clair » sur ordinateur.
   Sur les écrans tactiles (téléphones, tablettes), c'est le réglage de l'appareil qui décide
   (voir style.css), donc pas de bouton. */
(function () {
    var tactile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (tactile) return;

    var cle = 'site-maths-theme';
    var racine = document.documentElement;

    try {
        if (localStorage.getItem(cle) === 'dark') racine.dataset.theme = 'dark';
    } catch (e) {}

    document.addEventListener('DOMContentLoaded', function () {
        var menu = document.querySelector('.nav-links');
        if (!menu) return;

        var bouton = document.createElement('button');
        bouton.type = 'button';
        bouton.className = 'theme-toggle';

        function afficher() {
            var sombre = racine.dataset.theme === 'dark';
            bouton.textContent = sombre ? '☀ Clair' : '☾ Sombre';
            bouton.setAttribute('aria-pressed', sombre ? 'true' : 'false');
            bouton.title = sombre ? 'Passer en thème clair' : 'Passer en thème sombre';
        }

        bouton.addEventListener('click', function () {
            var sombre = racine.dataset.theme !== 'dark';
            if (sombre) racine.dataset.theme = 'dark';
            else delete racine.dataset.theme;
            try { localStorage.setItem(cle, sombre ? 'dark' : 'light'); } catch (e) {}
            afficher();
        });

        afficher();
        var li = document.createElement('li');
        li.appendChild(bouton);
        menu.appendChild(li);
    });
})();
