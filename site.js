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

/* Titre « au stylo » : capitales à l'encre bleu Bic (filtre SVG : léger tremblé et encre plus ou moins chargée),
   accent du É dessiné en vecteur, lettres qui s'écrivent l'une après l'autre au chargement. */
(function () {
    var NS = 'http://www.w3.org/2000/svg';

    function filtreStylo() {
        if (document.getElementById('stylo')) return;
        var svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('width', '0');
        svg.setAttribute('height', '0');
        svg.setAttribute('aria-hidden', 'true');
        svg.style.position = 'absolute';
        svg.innerHTML =
            '<filter id="stylo" x="-5%" y="-30%" width="110%" height="160%">' +
            '<feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves="1" seed="3" result="tremble"/>' +
            '<feDisplacementMap in="SourceGraphic" in2="tremble" scale="0.8" xChannelSelector="R" yChannelSelector="G" result="trait"/>' +
            '<feTurbulence type="fractalNoise" baseFrequency="0.05 0.11" numOctaves="2" seed="11" result="encre"/>' +
            '<feColorMatrix in="encre" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.1 0 0 0 0.3" result="charge"/>' +
            '<feComposite in="trait" in2="charge" operator="in"/>' +
            '</filter>';
        document.body.appendChild(svg);
    }

    function vecteur(lettre, h) {
        var cs = getComputedStyle(h);
        var fs = parseFloat(cs.fontSize);
        var ctx = document.createElement('canvas').getContext('2d');
        ctx.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
        var m = ctx.measureText('E');
        var W = lettre.offsetWidth, H = lettre.offsetHeight;
        var base = lettre.querySelector('.base').offsetTop;
        var L = -m.actualBoundingBoxLeft, R = m.actualBoundingBoxRight;
        var T = base - m.actualBoundingBoxAscent, w = R - L;
        var x1 = L + w * 0.05, y1 = T - fs * 0.05, x2 = L + w, y2 = T - fs * 0.3;
        var a = Math.atan2(y2 - y1, x2 - x1), t = fs * 0.15, ep = Math.max(1.2, fs * 0.03);
        var svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('width', W);
        svg.setAttribute('height', H);
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        // un seul trait de stylo
        [[0, 0, 1]].forEach(function (v) {
            var dx = v[0], dy = v[1];
            var p1 = (x2 - t * Math.cos(a - 0.45) + dx) + ' ' + (y2 - t * Math.sin(a - 0.45) + dy);
            var p2 = (x2 - t * Math.cos(a + 0.45) + dx) + ' ' + (y2 - t * Math.sin(a + 0.45) + dy);
            var p = document.createElementNS(NS, 'path');
            p.setAttribute('d', 'M' + (x1 + dx) + ' ' + (y1 + dy) + ' L' + (x2 + dx) + ' ' + (y2 + dy) +
                ' M' + p1 + ' L' + (x2 + dx) + ' ' + (y2 + dy) + ' L' + p2);
            p.setAttribute('stroke-width', ep);
            p.setAttribute('opacity', v[2]);
            svg.appendChild(p);
        });
        lettre.appendChild(svg);
    }

    function crayonner(h) {
        var texte = h.textContent.trim().toUpperCase();
        h.setAttribute('aria-label', h.textContent.trim());
        h.classList.add('titre-stylo');
        h.textContent = '';
        var accents = [], rang = 0;
        texte.split(' ').forEach(function (mot, i) {
            if (i > 0) h.appendChild(document.createTextNode(' '));
            var m = document.createElement('span');
            m.style.whiteSpace = 'nowrap';
            m.setAttribute('aria-hidden', 'true');
            Array.from(mot).forEach(function (ch) {
                var l = document.createElement('span');
                l.className = 'l';
                l.style.animationDelay = (rang++ * 0.07) + 's';
                l.textContent = ch === 'É' ? 'E' : ch;
                var b = document.createElement('i');
                b.className = 'base';
                l.appendChild(b);
                m.appendChild(l);
                if (ch === 'É') accents.push(l);
            });
            h.appendChild(m);
        });
        var fini = function () { accents.forEach(function (l) { vecteur(l, h); }); };
        if (document.fonts && document.fonts.load) {
            document.fonts.load('1em "Architects Daughter"').then(fini, fini);
        } else {
            fini();
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var titres = document.querySelectorAll('header h1');
        if (!titres.length) return;
        filtreStylo();
        titres.forEach(crayonner);
    });
})();
