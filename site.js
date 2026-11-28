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
        else localStorage.setItem(cle, 'light');   // les pages des séries d'automatismes suivent ce choix
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

    // en mode Matrix, le titre de l'accueil devient « Mathématrix »
    function texteTitre(h) {
        var t = h.dataset.titre || (h.dataset.titre = h.textContent.trim());
        return t === 'Mathématiques' && document.documentElement.classList.contains('matrix') ? 'Mathématrix' : t;
    }

    function crayonner(h) {
        var titre = texteTitre(h), texte = titre.toUpperCase();
        h.setAttribute('aria-label', titre);
        h.classList.add('titre-stylo', 'ecrit');
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
                l.dataset.min = ch.toLowerCase();          // mode Halloween : titre en minuscules (style.css)
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

    // appelé par le mode Matrix : réécrit le titre avec son nouveau nom
    window.recrayonnerTitres = function () {
        document.querySelectorAll('.titre-stylo').forEach(function (h) {
            if (texteTitre(h) !== h.getAttribute('aria-label')) crayonner(h);
        });
    };
})();

/* Effets cachés dans le logo (les quatre ronds de la ligne) :
   bleu = le titre se réécrit, vert = mode Matrix, violet = mode Retour vers le futur, orange = mode Halloween
   (en mode Halloween, cliquer sur un fantôme ouvre un Pac-Man : pacman.js) ou, en décembre, boule = mode Noël
   (cliquer sur un grand flocon de von Koch affiche une bulle ; cliquer sur le traîneau qui traverse le ciel
   ouvre le jeu « La tournée des nombres » : traineau.js). */
(function () {
    var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Mode Halloween (citrouille, Pac-Man…) : mettre true pour le remettre en ligne (prévu le 31 octobre).
       À false, la citrouille du logo disparaît et le mode ne peut pas s'activer ; tout le code reste en place. */
    var HALLOWEEN_EN_LIGNE = false;

    /* Mode Noël (boule de Noël à la place de la citrouille, quand le mode Halloween est hors ligne).
       NOEL_EN_LIGNE : 'auto' = en ligne tout seul du 28 novembre au 6 janvier ; true = toujours ; false = jamais.
       Aperçu avant la date : ajouter ?noel à l'adresse d'une page (retenu sur cet appareil, ?noel=0 pour l'oublier).
       Même réglage dans barre.js. */
    var NOEL_EN_LIGNE = 'auto';
    function noelEnLigne() {
        try {
            var q = location.search.match(/[?&]noel(=([^&]*))?/);
            if (q) localStorage.setItem('site-maths-apercu-noel', q[2] === '0' ? '' : '1');
            if (localStorage.getItem('site-maths-apercu-noel')) return true;
        } catch (e) {}
        if (NOEL_EN_LIGNE !== 'auto') return NOEL_EN_LIGNE;
        var d = new Date();
        return (d.getMonth() === 10 && d.getDate() >= 28) || d.getMonth() === 11 || (d.getMonth() === 0 && d.getDate() <= 6);
    }
    var NOEL = !HALLOWEEN_EN_LIGNE && noelEnLigne();

    if (!HALLOWEEN_EN_LIGNE) {
        document.documentElement.classList.add(NOEL ? 'avec-noel' : 'sans-halloween');
        document.addEventListener('DOMContentLoaded', function () {
            document.querySelectorAll('.logo-ligne button[data-effet="halloween"]').forEach(function (b) {
                if (!NOEL) { b.remove(); return; }
                b.dataset.effet = 'noel';
                b.title = 'Mode Noël';
            });
        });
    }

    function reecrire() {
        document.querySelectorAll('.titre-stylo').forEach(function (h) {
            h.classList.remove('ecrit');
            void h.offsetWidth;              // relance l'animation
            h.classList.add('ecrit');
        });
    }

    /* Vert : mode Matrix — tout passe en vert terminal avec une pluie de chiffres et de symboles maths */
    var pluie = null;
    function matrix() {
        if (document.documentElement.classList.toggle('matrix')) demarrerPluie();
        else arreterPluie();
        if (window.recrayonnerTitres) window.recrayonnerTitres();
    }
    function demarrerPluie() {
        var racine = document.documentElement;
        {
            var c = document.createElement('canvas');
            c.className = 'effet-canvas effet-matrix';
            document.body.appendChild(c);
            var ctx = c.getContext('2d');
            var taille = 16, colonnes, gouttes;
            var car = '01234567890123456789+−×÷=≠≈<>≤≥±πΣ√∞∫Δ∂θλφ∈∀∃ℝℕ%';
            function dimension() {
                c.width = innerWidth; c.height = innerHeight;
                colonnes = Math.ceil(innerWidth / taille);
                gouttes = Array.from({ length: colonnes }, function () { return Math.random() * innerHeight / taille; });
                ctx.fillStyle = '#000'; ctx.fillRect(0, 0, c.width, c.height);
            }
            dimension();
            window.addEventListener('resize', dimension);
            var dernier = 0;
            function image(now) {
                if (!racine.classList.contains('matrix')) return;
                pluie = requestAnimationFrame(image);
                if (now - dernier < 50) return;
                dernier = now;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
                ctx.fillRect(0, 0, c.width, c.height);
                ctx.font = taille + 'px "JetBrains Mono", monospace';
                for (var i = 0; i < colonnes; i++) {
                    var y = gouttes[i] * taille;
                    ctx.fillStyle = Math.random() < 0.06 ? '#d8ffe2' : '#1fe05a';
                    ctx.fillText(car[Math.floor(Math.random() * car.length)], i * taille, y);
                    if (y > c.height && Math.random() > 0.975) gouttes[i] = 0;
                    gouttes[i]++;
                }
            }
            if (!calme) pluie = requestAnimationFrame(image);
            c._quitter = function () { window.removeEventListener('resize', dimension); };
        }
    }
    function arreterPluie() {
        {
            cancelAnimationFrame(pluie);
            document.querySelectorAll('.effet-matrix').forEach(function (c) { if (c._quitter) c._quitter(); c.remove(); });
        }
    }

    /* Violet : mode Retour vers le futur — tableau de bord en inox.
       Sur l'accueil, au démarrage : seuls restent le titre, les « time circuits », le compteur qui monte à 88,
       l'éclair et les deux traînées de feu ; quand les flammes s'éteignent, les time circuits disparaissent
       et les trois menus (Seconde, Première, TST2S) apparaissent en fondu. */
    var MOIS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    var horloge = null;

    function date88(d) {
        var deux = function (n) { return (n < 10 ? '0' : '') + n; };
        return MOIS[d.getMonth()] + ' ' + deux(d.getDate()) + ' ' + d.getFullYear() + ' ' + deux(d.getHours()) + ':' + deux(d.getMinutes());
    }

    function accueil() {
        var ici = location.href.split(/[?#]/)[0];
        return ici === BASE || ici === BASE + 'index.html';
    }

    function futur() {
        var racine = document.documentElement;
        if (racine.classList.toggle('futur')) {
            racine.classList.toggle('futur-accueil', accueil());
            if (!calme) {
                if (accueil()) { racine.classList.add('futur-intro'); afficherCircuits(); }
                demarrer88();
            } else allumerFlammes(false);
        } else {
            clearInterval(horloge);
            eteindreFlammes();
            racine.classList.remove('futur-accueil', 'futur-intro');
            document.querySelectorAll('.circuits, .effet-futur').forEach(function (e) { e.remove(); });
        }
    }

    // fin du feu : les time circuits s'effacent, puis les trois menus apparaissent en fondu
    function finIntro() {
        var racine = document.documentElement, bloc = document.querySelector('.circuits');
        clearInterval(horloge);
        if (!bloc) { racine.classList.remove('futur-intro'); return; }
        bloc.classList.add('part');
        setTimeout(function () {
            bloc.remove();
            foyers.forEach(function (f) { dimensionner(f); braises(f, f.w); });
            racine.classList.remove('futur-intro');
        }, 700);
    }

    /* Traînées de feu sous le titre et sous le sous-titre : de petites flammes (particules) montent d'une ligne
       de braises et partent vers l'arrière. progressif (après les 88 mph) : le feu court de gauche à droite,
       brûle quelques secondes puis s'éteint ; il ne reste que la ligne de braises. Sinon : braises seules. */
    var foyers = [], animFlammes = null;

    function dimensionner(f) {
        var r = document.createRange();
        r.selectNodeContents(f.elt);
        var texte = r.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
        f.w = Math.max(40, Math.ceil(texte.width) + 12);
        f.c.width = f.w * dpr; f.c.height = f.h * dpr;
        f.c.style.width = f.w + 'px'; f.c.style.height = f.h + 'px';
        f.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // aligné sur le début du texte, quelles que soient les marges du conteneur
        f.c.style.marginLeft = '0px';
        f.c.style.marginLeft = (texte.left - f.c.getBoundingClientRect().left) + 'px';
    }

    function braises(f, lim) {
        var ctx = f.ctx, base = f.h - 4;
        var g = ctx.createLinearGradient(0, 0, f.w, 0);
        g.addColorStop(0, 'rgba(160, 20, 0, 0)');
        g.addColorStop(0.15, '#c41a00');
        g.addColorStop(0.6, '#ff6a00');
        g.addColorStop(1, '#ffe066');
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowColor = '#ff6a00'; ctx.shadowBlur = 8;
        ctx.fillStyle = g;
        ctx.fillRect(0, base - 1, lim, 3);
        ctx.shadowBlur = 0;
    }

    /* Flammes : chaque particule est une petite tache de lumière floue (sprite pré-dessiné), étirée vers le haut,
       dont la couleur suit la température : blanc-jaune à la naissance, puis jaune, orange, rouge, et elle s'éteint. */
    var SPRITES = null;
    function sprites() {
        if (SPRITES) return SPRITES;
        var teintes = [[120, 14, 0], [200, 40, 0], [255, 90, 0], [255, 150, 20], [255, 210, 70], [255, 245, 200]];
        SPRITES = [];
        for (var k = 0; k < 24; k++) {
            var t = k / 23 * (teintes.length - 1), i = Math.min(teintes.length - 2, Math.floor(t)), u = t - i;
            var c = teintes[i].map(function (v, j) { return Math.round(v + (teintes[i + 1][j] - v) * u); });
            var sp = document.createElement('canvas'); sp.width = sp.height = 32;
            var x = sp.getContext('2d'), g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
            g.addColorStop(0, 'rgba(' + c + ', 1)');
            g.addColorStop(0.4, 'rgba(' + c + ', 0.55)');
            g.addColorStop(1, 'rgba(' + c + ', 0)');
            x.fillStyle = g; x.fillRect(0, 0, 32, 32);
            SPRITES.push(sp);
        }
        return SPRITES;
    }

    // intensite : 1 pendant que le feu brûle, puis descend vers 0 (moins de flammes, plus petites)
    function bruler(f, intensite, now) {
        var ctx = f.ctx, lim = f.w * f.front, base = f.h - 4, echelle = f.h / 30, sp = sprites();
        ctx.clearRect(0, 0, f.w, f.h);
        braises(f, lim);
        // nouvelles flammes, plus hautes vers la droite et juste derrière le front (le feu le plus récent)
        var n = Math.round(lim / 22 * intensite);
        for (var i = 0; i < n && f.parts.length < 900; i++) {
            var x = Math.random() * lim, vif = (0.4 + 0.6 * x / f.w) * (0.45 + 0.55 * intensite);
            if (f.front < 1 && lim - x < 40) vif *= 1.4;
            f.parts.push({ x: x, y: base + Math.random() * 2, vx: -0.2 - Math.random() * 0.7, vy: -(0.6 + Math.random() * 1.1) * echelle * vif,
                           v: 1, d: 0.025 + Math.random() * 0.035, r: (2.5 + Math.random() * 3.5) * echelle * vif, ph: Math.random() * 6.3 });
        }
        // quelques étincelles qui s'envolent plus haut
        if (intensite > 0.2 && Math.random() < 0.35 * intensite) {
            f.parts.push({ x: Math.random() * lim, y: base - 2, vx: -0.5 - Math.random(), vy: -(1.5 + Math.random() * 1.5) * echelle,
                           v: 1, d: 0.02 + Math.random() * 0.02, r: 0, ph: 0, etincelle: true });
        }
        ctx.globalCompositeOperation = 'lighter';
        f.parts = f.parts.filter(function (p) {
            p.v -= p.d;
            if (p.v <= 0) return false;
            if (p.etincelle) {
                p.x += p.vx; p.y += p.vy; p.vy += 0.04;
                ctx.fillStyle = 'rgba(255, 220, 120, ' + p.v + ')';
                ctx.fillRect(p.x, p.y, 1.6, 1.6);
                return p.y < f.h;
            }
            // la flamme ondule (turbulence) et monte de moins en moins vite
            p.x += p.vx + Math.sin(now * 0.012 + p.ph) * 0.45 * echelle;
            p.y += p.vy; p.vy *= 0.975;
            var r = p.r * (0.45 + 0.75 * p.v);
            ctx.globalAlpha = Math.min(1, 1.3 * p.v);
            ctx.drawImage(sp[Math.min(23, Math.floor(p.v * 24))], p.x - r, p.y - r * 1.7, 2 * r, 3 * r);
            return true;
        });
        ctx.globalAlpha = 1;
        // l'étincelle qui court devant le feu
        if (f.front < 1) ctx.drawImage(sp[23], lim - 9 * echelle, base - 9 * echelle, 18 * echelle, 18 * echelle);
    }

    function allumerFlammes(progressif, apres) {
        eteindreFlammes();
        var header = document.querySelector('header');
        if (!header) return;
        [[header.querySelector('h1'), 46], [header.querySelector('p'), 30]].forEach(function (cible) {
            if (!cible[0]) return;
            var c = document.createElement('canvas');
            c.className = 'flammes';
            c.setAttribute('aria-hidden', 'true');
            cible[0].after(c);
            var f = { c: c, ctx: c.getContext('2d'), elt: cible[0], h: cible[1], parts: [], front: progressif ? 0 : 1 };
            dimensionner(f);
            foyers.push(f);
        });
        var fixe = function () { foyers.forEach(function (f) { dimensionner(f); braises(f, f.w); }); };
        if (document.fonts) document.fonts.ready.then(function () { if (!animFlammes) fixe(); });
        if (calme || !progressif) { fixe(); return; }
        var t0 = performance.now(), plein = t0 + 700 + 1800, extinction = plein + 1200;
        (function image(now) {
            if (!foyers.length) return;
            var intensite = now < plein ? 1 : Math.max(0, (extinction - now) / (extinction - plein));
            foyers.forEach(function (f) {
                if (f.front < 1) f.front = Math.min(1, (now - t0) / 700);
                bruler(f, intensite, now);
            });
            // plus de flammes : on s'arrête, la ligne de braises reste
            if (!intensite && foyers.every(function (f) { return !f.parts.length; })) {
                animFlammes = null; fixe();
                if (apres) apres();
                return;
            }
            animFlammes = requestAnimationFrame(image);
        })(t0);
    }

    function eteindreFlammes() {
        cancelAnimationFrame(animFlammes);
        animFlammes = null;
        foyers.forEach(function (f) { f.c.remove(); });
        foyers = [];
    }

    window.addEventListener('resize', function () {
        foyers.forEach(function (f) { dimensionner(f); if (!animFlammes) braises(f, f.w); });
    });

    // « Last time departed » = la dernière connexion aux Automatismes sur cet appareil (enregistrée par moteur.js)
    // « Last time departed » : le premier départ de Marty, au parking du Twin Pines Mall
    var DEPART_MARTY = new Date(1985, 9, 26, 1, 35);

    function afficherCircuits() {
        // les écrans ne s'affichent que sur la page d'accueil du site
        if (!accueil()) return;
        var header = document.querySelector('header');
        if (!header || header.querySelector('.circuits')) return;
        var maintenant = new Date();
        // destination : 30 ans plus tard, comme Marty (1985 → 2015)
        var destination = new Date(maintenant);
        destination.setFullYear(destination.getFullYear() + 30);
        var lignes = [
            ['destination', 'Destination time', date88(destination)],
            ['present', 'Present time', date88(maintenant)],
            ['depart', 'Last time departed', date88(DEPART_MARTY)]
        ];
        var bloc = document.createElement('div');
        bloc.className = 'circuits';
        bloc.setAttribute('aria-hidden', 'true');
        lignes.forEach(function (l) {
            var c = document.createElement('div');
            c.className = 'circuit ' + l[0];
            c.innerHTML = '<span class="ecran">' + l[2] + '</span><span class="plaque">' + l[1] + '</span>';
            bloc.appendChild(c);
        });
        header.appendChild(bloc);
        var present = bloc.querySelector('.present .ecran');
        clearInterval(horloge);
        horloge = setInterval(function () { present.textContent = date88(new Date()); }, 10000);
    }

    function demarrer88() {
        var e = document.createElement('div');
        e.className = 'effet-futur';
        e.innerHTML = '<div class="compteur"><span>00</span><small>MPH</small></div><div class="eclair"></div>';
        document.body.appendChild(e);
        // le compteur se place tout à droite de la page, à la hauteur du titre
        var titre = document.querySelector('header h1'), compteur = e.querySelector('.compteur');
        if (titre) {
            var r = document.createRange();
            r.selectNodeContents(titre);
            var t = r.getBoundingClientRect(), cr = compteur.getBoundingClientRect();
            if (t.bottom > 0 && t.top < innerHeight) {
                compteur.style.top = Math.max(8, t.top + (t.height - cr.height) / 2) + 'px';
                compteur.style.bottom = 'auto';
            }
        }
        var aff = e.querySelector('.compteur span'), debut = performance.now();
        (function monter(now) {
            var v = Math.min(88, Math.round(88 * Math.pow(Math.max(0, now - debut) / 1100, 1.6)));
            aff.textContent = (v < 10 ? '0' : '') + v;
            if (v < 88) { requestAnimationFrame(monter); return; }
            e.classList.add('boom');
            if (document.documentElement.classList.contains('futur')) allumerFlammes(true, finIntro);
            setTimeout(function () { e.classList.add('fin'); }, 3000);         // le compteur reste le temps du feu
            setTimeout(function () { e.remove(); }, 3600);
        })(debut);
    }

    /* Orange : mode Halloween — nuit violette et pleine lune, chauves-souris et fantômes qui passent derrière,
       une araignée qui descend de la barre. Au démarrage : coup de tonnerre et nuée de chauves-souris. */
    var nuit = null, lireFantomes = null;
    var SCRIPT = document.currentScript, BASE = SCRIPT ? SCRIPT.src.replace(/site\.js(\?.*)?$/, '') : '';

    // pacman.js : le jeu caché derrière les fantômes, et le plan du labyrinthe dessiné en fond
    function chargerPacman(suite) {
        if (window.pacmanHalloween) { suite(); return; }
        var s = document.querySelector('script[data-pacman]');
        if (!s) {
            s = document.createElement('script');
            s.src = BASE + 'pacman.js';
            s.dataset.pacman = '';
            document.head.appendChild(s);
        }
        s.addEventListener('load', suite);
    }

    function halloween() {
        if (document.documentElement.classList.toggle('halloween')) {
            demarrerNuit();
            if (!calme) nuee();
        } else arreterNuit();
    }

    // silhouette de chauve-souris centrée en (0, 0), envergure 2s ; battement entre -1 et 1
    function chauveSouris(ctx, x, y, s, battement) {
        var f = battement * s * 0.55;
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        [1, -1].forEach(function (k) {
            ctx.moveTo(0, -s * 0.12);
            ctx.quadraticCurveTo(k * s * 0.5, -s * 0.35 - f * 0.5, k * s, -f);
            ctx.quadraticCurveTo(k * s * 0.82, -f * 0.4 + s * 0.06, k * s * 0.66, s * 0.12 - f * 0.3);
            ctx.quadraticCurveTo(k * s * 0.5, -f * 0.15, k * s * 0.33, s * 0.18 - f * 0.1);
            ctx.quadraticCurveTo(k * s * 0.2, s * 0.06, 0, s * 0.22);
        });
        ctx.ellipse(0, s * 0.02, s * 0.11, s * 0.22, 0, 0, Math.PI * 2);
        // oreilles
        ctx.moveTo(-s * 0.1, -s * 0.12); ctx.lineTo(-s * 0.07, -s * 0.3); ctx.lineTo(-s * 0.02, -s * 0.16);
        ctx.moveTo(s * 0.1, -s * 0.12); ctx.lineTo(s * 0.07, -s * 0.3); ctx.lineTo(s * 0.02, -s * 0.16);
        ctx.fill();
        ctx.restore();
    }

    // petit fantôme (largeur 2r) qui ondule
    function fantome(ctx, x, y, r, t, alpha) {
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#efe9ff';
        ctx.shadowColor = 'rgba(220, 200, 255, 0.8)';
        ctx.shadowBlur = r * 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, r, Math.PI, 0);
        ctx.lineTo(r, r * 1.5);
        for (var i = 0; i < 4; i++) {
            var x1 = r - (i + 0.5) * r / 2, x2 = r - (i + 1) * r / 2;
            ctx.quadraticCurveTo(x1, r * (1.5 + 0.35 * Math.sin(t * 4 + i * 1.7)), x2, r * 1.5);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1a0d2b';
        ctx.beginPath();
        ctx.ellipse(-r * 0.35, -r * 0.1, r * 0.14, r * 0.22, 0, 0, Math.PI * 2);
        ctx.ellipse(r * 0.35, -r * 0.1, r * 0.14, r * 0.22, 0, 0, Math.PI * 2);
        ctx.ellipse(0, r * 0.45, r * 0.12, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function demarrerNuit() {
        var racine = document.documentElement;
        var c = document.createElement('canvas');
        c.className = 'effet-canvas effet-halloween';
        document.body.appendChild(c);
        var ctx = c.getContext('2d'), w, h, chauves, fantomes, labyrinthe = null;
        function hasard(a, b) { return a + Math.random() * (b - a); }
        function nouvelleChauve(partout) {
            var sens = Math.random() < 0.5 ? 1 : -1;
            return { x: partout ? hasard(0, w) : (sens > 0 ? -40 : w + 40), y: hasard(h * 0.05, h * 0.75), s: hasard(9, 22),
                     v: sens * hasard(0.6, 1.6), p: hasard(0, 6), vp: hasard(0.18, 0.3), o: hasard(0, 6) };
        }
        function nouveauFantome(partout) {
            return { x: hasard(w * 0.05, w * 0.95), y: partout ? hasard(0, h) : h + 60, r: hasard(14, 26),
                     v: hasard(0.25, 0.6), o: hasard(0, 6), a: hasard(0.12, 0.28) };
        }
        function dimension() {
            var dpr = window.devicePixelRatio || 1;
            w = innerWidth; h = innerHeight;
            c.width = w * dpr; c.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            var n = Math.max(4, Math.round(w / 160));
            chauves = Array.from({ length: n }, function () { return nouvelleChauve(true); });
            fantomes = Array.from({ length: Math.max(2, Math.round(w / 500)) }, function () { return nouveauFantome(true); });
            dessinerLabyrinthe();
            if (calme) image(0);
        }
        // les murs du labyrinthe de Pac-Man, en néon violet discret, couvrent tout l'écran
        function dessinerLabyrinthe() {
            if (!window.pacmanHalloween) return;
            var plan = window.pacmanHalloween.plan, L = plan[0].length, H = plan.length, dpr = window.devicePixelRatio || 1;
            var T = Math.max(w / L, h / H), x0 = (w - L * T) / 2, y0 = (h - H * T) / 2;
            labyrinthe = document.createElement('canvas');
            labyrinthe.width = w * dpr; labyrinthe.height = h * dpr;
            var m = labyrinthe.getContext('2d');
            m.setTransform(dpr, 0, 0, dpr, 0, 0);
            var mur = function (x, y) { return y < 0 || y >= H || x < 0 || x >= L || plan[y][x] === '#'; };
            m.fillStyle = 'rgba(40, 14, 70, 0.35)';
            m.beginPath();
            for (var y = 0; y < H; y++) for (var x = 0; x < L; x++) {
                if (plan[y][x] !== '#') continue;
                m.rect(x0 + x * T, y0 + y * T, T, T);
            }
            m.fill();
            m.strokeStyle = 'rgba(166, 107, 255, 0.3)';
            m.lineWidth = Math.max(1.5, T / 10);
            m.lineCap = 'round';
            m.shadowColor = 'rgba(166, 107, 255, 0.6)';
            m.shadowBlur = T / 4;
            m.beginPath();
            for (y = 0; y < H; y++) for (x = 0; x < L; x++) {
                if (plan[y][x] !== '#') continue;
                var gx = x0 + x * T, gy = y0 + y * T;
                if (!mur(x, y - 1)) { m.moveTo(gx, gy); m.lineTo(gx + T, gy); }
                if (!mur(x, y + 1)) { m.moveTo(gx, gy + T); m.lineTo(gx + T, gy + T); }
                if (!mur(x - 1, y)) { m.moveTo(gx, gy); m.lineTo(gx, gy + T); }
                if (!mur(x + 1, y)) { m.moveTo(gx + T, gy); m.lineTo(gx + T, gy + T); }
            }
            m.stroke();
        }
        function image(now) {
            var t = now / 1000;
            ctx.clearRect(0, 0, w, h);
            if (labyrinthe) ctx.drawImage(labyrinthe, 0, 0, w, h);
            fantomes.forEach(function (f, i) {
                if (!calme) { f.y -= f.v; if (f.y < -80) fantomes[i] = f = nouveauFantome(false); }
                f.px = f.x + Math.sin(t * 0.8 + f.o) * 24; f.py = f.y;
                fantome(ctx, f.px, f.py, f.r, t + f.o, f.survol ? 0.75 : f.a);
            });
            ctx.fillStyle = '#07030c';
            ctx.shadowColor = 'rgba(255, 120, 30, 0.45)';
            ctx.shadowBlur = 6;
            chauves.forEach(function (b, i) {
                if (!calme) {
                    b.x += b.v; b.p += b.vp;
                    if (b.x < -60 || b.x > w + 60) chauves[i] = b = nouvelleChauve(false);
                }
                chauveSouris(ctx, b.x, b.y + Math.sin(t * 1.5 + b.o) * 14, b.s, Math.sin(b.p));
            });
            ctx.shadowBlur = 0;
        }
        dimension();
        window.addEventListener('resize', dimension);
        lireFantomes = function () { return fantomes; };
        chargerPacman(function () {
            if (!c.isConnected) return;
            dessinerLabyrinthe();
            if (calme) image(0);
        });
        if (!calme) nuit = requestAnimationFrame(function boucle(now) {
            if (!racine.classList.contains('halloween')) return;
            image(now);
            nuit = requestAnimationFrame(boucle);
        });
        c._quitter = function () { window.removeEventListener('resize', dimension); };

        // l'araignée descend de la barre de navigation ; si on la survole, elle remonte se cacher
        var a = document.createElement('div');
        a.className = 'araignee';
        a.setAttribute('aria-hidden', 'true');
        a.innerHTML = '<svg viewBox="-20 -16 40 34" width="40" height="34"><g stroke="#0b0510" stroke-width="2" fill="none" stroke-linecap="round">' +
            '<path d="M-5-3l-8-7-4 6M-5 0l-10-3-5 6M-5 3l-9 3-3 7M-4 5l-6 6-1 6M5-3l8-7 4 6M5 0l10-3 5 6M5 3l9 3 3 7M4 5l6 6 1 6"/></g>' +
            '<ellipse cx="0" cy="3" rx="7" ry="8" fill="#0b0510"/><circle cy="-6" r="5" fill="#0b0510"/>' +
            '<circle cx="-2" cy="-7" r="1.4" fill="#ff4a1c"/><circle cx="2" cy="-7" r="1.4" fill="#ff4a1c"/></svg>';
        a.addEventListener('mouseenter', function () {
            a.classList.add('fuite');
            setTimeout(function () { a.classList.remove('fuite'); }, 4000);
        });
        document.body.appendChild(a);
    }

    function arreterNuit() {
        cancelAnimationFrame(nuit);
        lireFantomes = null;
        document.documentElement.classList.remove('sur-fantome');
        document.querySelectorAll('.effet-halloween').forEach(function (c) { if (c._quitter) c._quitter(); c.remove(); });
        document.querySelectorAll('.araignee, .effet-nuee').forEach(function (e) { e.remove(); });
    }

    // démarrage : éclair, puis une nuée de chauves-souris s'échappe du rond orange du logo
    function nuee() {
        var e = document.createElement('div');
        e.className = 'effet-nuee';
        e.innerHTML = '<div class="eclair"></div><canvas></canvas>';
        document.body.appendChild(e);
        var c = e.querySelector('canvas'), ctx = c.getContext('2d'), dpr = window.devicePixelRatio || 1;
        c.width = innerWidth * dpr; c.height = innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var rond = document.querySelector('.logo-ligne button:nth-child(4)');
        var r = rond ? rond.getBoundingClientRect() : { left: 40, top: 20, width: 0, height: 0 };
        var x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
        var vol = Array.from({ length: 28 }, function () {
            var angle = Math.random() * Math.PI * 0.7 - 0.15, vitesse = 4 + Math.random() * 7;
            return { x: x0, y: y0, vx: Math.cos(angle) * vitesse, vy: Math.sin(angle) * vitesse * 0.8,
                     s: 4 + Math.random() * 6, g: 1.012 + Math.random() * 0.012, p: Math.random() * 6 };
        });
        var debut = performance.now();
        (function image(now) {
            if (!e.isConnected) return;
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            ctx.fillStyle = '#07030c';
            vol.forEach(function (b) {
                b.x += b.vx; b.y += b.vy + Math.sin(b.p) * 1.5; b.s *= b.g; b.p += 0.35;
                chauveSouris(ctx, b.x, b.y, b.s, Math.sin(b.p));
            });
            if (now - debut < 2600) requestAnimationFrame(image);
            else e.remove();
        })(debut);
        e.classList.add('boom');
    }

    /* Un clic sur un fantôme (là où rien d'autre n'est cliquable) ouvre le Pac-Man caché */
    function fantomeSous(e) {
        if (!lireFantomes || !document.documentElement.classList.contains('halloween')) return null;
        if (e.target.closest && e.target.closest('a, button, input, textarea, select, label, summary, .class-card, .navbar, .pacman-fond')) return null;
        var liste = lireFantomes();
        for (var i = 0; i < liste.length; i++) {
            var f = liste[i], dx = e.clientX - f.px, dy = e.clientY - (f.py + f.r * 0.3);
            if (f.px !== undefined && dx * dx + dy * dy < f.r * f.r * 1.8) return f;
        }
        return null;
    }
    document.addEventListener('mousemove', function (e) {
        if (!lireFantomes) return;
        var f = fantomeSous(e);
        lireFantomes().forEach(function (g) { g.survol = g === f; });
        document.documentElement.classList.toggle('sur-fantome', !!f);
    });
    document.addEventListener('click', function (e) {
        if (!fantomeSous(e)) return;
        chargerPacman(function () { window.pacmanHalloween.ouvrir(); });
    });


    /* Boule : mode Noël — nuit d'hiver, étoiles et étoiles filantes, collines enneigées et sapins,
       neige qui tombe (les grands flocons sont des flocons de von Koch), guirlande sous la barre.
       Au démarrage : la boule lâche un tourbillon de flocons. */
    var hiver = null, lireFlocons = null, lireAttelage = null;

    // traineau.js : le jeu caché derrière le traîneau, et le dessin de l'attelage qui passe dans le ciel
    function chargerTraineau(suite) {
        if (window.jeuTraineau) { suite(); return; }
        var s = document.querySelector('script[data-traineau]');
        if (!s) {
            s = document.createElement('script');
            s.src = BASE + 'traineau.js';
            s.dataset.traineau = '';
            document.head.appendChild(s);
        }
        s.addEventListener('load', suite);
    }

    // flocon de von Koch (ordre 3), points pour un rayon 1
    var KOCH = (function () {
        var pts = [0, 1, 2].map(function (k) { var a = -Math.PI / 2 + k * 2 * Math.PI / 3; return [Math.cos(a), Math.sin(a)]; });
        pts.push(pts[0]);
        for (var n = 0; n < 3; n++) {
            var suite = [pts[0]];
            for (var i = 0; i < pts.length - 1; i++) {
                var a = pts[i], b = pts[i + 1], dx = (b[0] - a[0]) / 3, dy = (b[1] - a[1]) / 3;
                var p = [a[0] + dx, a[1] + dy], q = [a[0] + 2 * dx, a[1] + 2 * dy];
                var c = Math.cos(-Math.PI / 3), sn = Math.sin(-Math.PI / 3);
                var pic = [p[0] + dx * c - dy * sn, p[1] + dx * sn + dy * c];
                suite.push(p, pic, q, b);
            }
            pts = suite;
        }
        return pts;
    })();

    function koch(ctx, x, y, r, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.scale(r, r);
        ctx.beginPath();
        KOCH.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); });
        ctx.closePath();
        ctx.restore();
    }

    function noel() {
        if (document.documentElement.classList.toggle('noel')) {
            demarrerHiver();
            if (!calme) tourbillon();
        } else arreterHiver();
    }

    // guirlande : des festons accrochés sous la barre, une ampoule colorée tous les 40 px environ
    function guirlande() {
        var barre = document.querySelector('.navbar');
        if (!barre) return;
        var g = barre.querySelector('.guirlande');
        if (!g) {
            g = document.createElement('div');
            g.className = 'guirlande';
            g.setAttribute('aria-hidden', 'true');
            barre.appendChild(g);
        }
        var L = barre.clientWidth, n = Math.max(3, Math.round(L / 130)), pas = L / n;
        var couleurs = ['#ff4b55', '#ffd24a', '#3fd17f', '#5ab8ff'], fil = '', ampoules = '', k = 0;
        for (var i = 0; i < n; i++) {
            var x0 = i * pas, x1 = x0 + pas, cx = x0 + pas / 2, fy = 14;
            fil += 'M' + x0.toFixed(1) + ' 1Q' + cx.toFixed(1) + ' ' + (2 * fy) + ' ' + x1.toFixed(1) + ' 1';
            [0.2, 0.4, 0.6, 0.8].forEach(function (t) {
                var x = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * cx + t * t * x1;
                var y = (1 - t) * (1 - t) + 2 * t * (1 - t) * 2 * fy + t * t;
                var pente = Math.atan2(2 * (1 - t) * (2 * fy - 1) + 2 * t * (1 - 2 * fy), 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx));
                var col = couleurs[k % 4];
                ampoules += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + (pente * 180 / Math.PI).toFixed(0) + ')">' +
                    '<rect x="-1.8" y="0" width="3.6" height="3" rx=".6" fill="#3a4a5e"/>' +
                    '<ellipse class="ampoule" style="--a:' + col + ';--d:' + (-(k % 4) * 0.6 - (k % 3) * 0.2).toFixed(1) + 's" cx="0" cy="7.2" rx="3" ry="4.6" fill="' + col + '"/></g>';
                k++;
            });
        }
        g.innerHTML = '<svg viewBox="0 0 ' + L + ' 26" preserveAspectRatio="none"><path d="' + fil + '" stroke="#24313f" stroke-width="1.4" fill="none"/>' + ampoules + '</svg>';
    }

    function demarrerHiver() {
        var racine = document.documentElement;
        var c = document.createElement('canvas');
        c.className = 'effet-canvas effet-noel';
        document.body.appendChild(c);
        var ctx = c.getContext('2d'), w, h, flocons, etoiles, paysage, filante = null;
        // le traîneau passe dans le ciel : la première fois peu après le démarrage, puis toutes les 20 à 40 s
        var attelage = null, prochainPassage = performance.now() + 3500;
        function nouvelAttelage() {
            var s = Math.max(18, Math.min(30, w / 50));
            return { x: -s * 4.5, y: hasard(h * 0.14, h * 0.32), s: s, v: hasard(1.3, 2) };
        }
        function hasard(a, b) { return a + Math.random() * (b - a); }
        // hauteur de la colline de devant (là où les flocons disparaissent)
        function sol(x) { var H = Math.min(110, h * 0.13); return h - H * (0.55 + 0.25 * Math.sin(x / w * 8.2 + 0.5) + 0.08 * Math.sin(x / 90)); }
        function nouveauFlocon(partout) {
            var grand = Math.random() < 0.09;
            return { x: hasard(0, w), y: partout ? hasard(0, h) : hasard(-60, -10), r: grand ? hasard(7, 13) : hasard(0.8, 2.6), grand: grand,
                     v: grand ? hasard(0.35, 0.6) : hasard(0.4, 1.3), o: hasard(0, 6), a: hasard(0, 6), va: hasard(-0.008, 0.008) };
        }
        function dimension() {
            var dpr = window.devicePixelRatio || 1;
            w = innerWidth; h = innerHeight;
            c.width = w * dpr; c.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            flocons = Array.from({ length: Math.min(220, Math.round(w * h / 8000)) }, function () { return nouveauFlocon(true); });
            etoiles = Array.from({ length: Math.round(w * h / 9000) }, function () {
                return { x: hasard(0, w), y: hasard(0, h * 0.7), r: hasard(0.4, 1.3), o: hasard(0, 6), v: hasard(1, 3) };
            });
            dessinerPaysage();
            if (calme) image(0);
            guirlande();
        }
        // collines enneigées et sapins, dessinés une fois pour toutes
        function dessinerPaysage() {
            var dpr = window.devicePixelRatio || 1, H = Math.min(110, h * 0.13);
            paysage = document.createElement('canvas');
            paysage.width = w * dpr; paysage.height = h * dpr;
            var m = paysage.getContext('2d');
            m.setTransform(dpr, 0, 0, dpr, 0, 0);
            function colline(f, couleur) {
                m.fillStyle = couleur;
                m.beginPath();
                m.moveTo(0, h);
                for (var x = 0; x <= w + 8; x += 8) m.lineTo(x, f(x));
                m.lineTo(w, h);
                m.fill();
            }
            function arriere(x) { return h - H * (1.05 + 0.3 * Math.sin(x / w * 5.1 + 2) + 0.1 * Math.sin(x / 130 + 1)); }
            colline(arriere, '#7f97b8');
            // sapins sur la colline de derrière
            var x = hasard(10, 60);
            while (x < w) {
                var t = hasard(H * 0.28, H * 0.55), base = arriere(x) + 4;
                m.fillStyle = '#123a2e';
                m.beginPath();
                for (var e = 0; e < 3; e++) {
                    var haut = base - t * (0.38 + e * 0.31), large = t * (0.36 - e * 0.08);
                    m.moveTo(x - large, base - t * e * 0.3);
                    m.lineTo(x, haut - t * 0.05);
                    m.lineTo(x + large, base - t * e * 0.3);
                }
                m.fill();
                m.fillStyle = 'rgba(230, 240, 255, 0.55)';      // neige sur les branches
                m.beginPath();
                m.moveTo(x, base - t * 0.98); m.lineTo(x - t * 0.07, base - t * 0.85); m.lineTo(x + t * 0.07, base - t * 0.85);
                m.fill();
                x += hasard(30, 140);
            }
            colline(sol, '#d4e1f1');
            var lueur = m.createLinearGradient(0, h - H, 0, h);
            lueur.addColorStop(0, 'rgba(255, 255, 255, 0)');
            lueur.addColorStop(1, 'rgba(160, 190, 230, 0.35)');
            m.fillStyle = lueur;
            m.fillRect(0, h - H, w, H);
        }
        function image(now) {
            var t = now / 1000, vent = Math.sin(t * 0.15) * 0.5;
            ctx.clearRect(0, 0, w, h);
            etoiles.forEach(function (s) {
                ctx.globalAlpha = calme ? 0.7 : 0.45 + 0.4 * Math.sin(t * s.v + s.o);
                ctx.fillStyle = '#fff8e0';
                ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
            });
            ctx.globalAlpha = 1;
            // de temps en temps, une étoile filante
            if (!calme && !filante && Math.random() < 0.002) {
                filante = { x: hasard(w * 0.1, w * 0.8), y: hasard(h * 0.03, h * 0.3), vx: hasard(7, 11), vy: hasard(2, 4), vie: 1 };
            }
            if (filante) {
                var f = filante, trait = ctx.createLinearGradient(f.x, f.y, f.x - f.vx * 12, f.y - f.vy * 12);
                trait.addColorStop(0, 'rgba(255, 248, 220, ' + f.vie + ')');
                trait.addColorStop(1, 'rgba(255, 248, 220, 0)');
                ctx.strokeStyle = trait; ctx.lineWidth = 2; ctx.lineCap = 'round';
                ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x - f.vx * 12, f.y - f.vy * 12); ctx.stroke();
                f.x += f.vx; f.y += f.vy; f.vie -= 0.018;
                if (f.vie <= 0 || f.x > w + 50) filante = null;
            }
            if (window.jeuTraineau) {
                if (calme) attelage = attelage || { x: w * 0.62, y: h * 0.2, s: Math.max(18, Math.min(30, w / 50)), v: 0 };
                else if (!attelage && now > prochainPassage) attelage = nouvelAttelage();
                if (attelage) {
                    var A = attelage;
                    A.x += A.v * (A.survol ? 0.25 : 1);
                    A.px = A.x; A.py = A.y + Math.sin(A.x / 90) * A.s * 0.5;
                    ctx.save();
                    ctx.shadowColor = A.survol ? '#fff2b0' : 'rgba(255, 214, 120, 0.7)';
                    ctx.shadowBlur = A.survol ? 16 : 8;
                    window.jeuTraineau.attelage(ctx, A.px, A.py, A.s, t * 9, A.survol ? '#fff4c8' : 'rgba(255, 228, 160, 0.82)');
                    ctx.restore();
                    if (A.x > w + A.s * 2) { attelage = null; prochainPassage = now + hasard(20000, 40000); }
                }
            }
            ctx.drawImage(paysage, 0, 0, w, h);
            flocons.forEach(function (fl, i) {
                if (!calme) {
                    fl.y += fl.v; fl.x += Math.sin(t * 0.9 + fl.o) * 0.35 + vent * (fl.grand ? 0.4 : 1); fl.a += fl.va;
                    if (fl.x < -20) fl.x = w + 20; else if (fl.x > w + 20) fl.x = -20;
                    if (fl.y > sol(fl.x) + fl.r) flocons[i] = fl = nouveauFlocon(false);
                }
                if (fl.grand) {
                    koch(ctx, fl.x, fl.y, fl.r, fl.a);
                    ctx.fillStyle = fl.survol ? 'rgba(255, 255, 255, 0.55)' : 'rgba(235, 245, 255, 0.18)';
                    ctx.strokeStyle = fl.survol ? '#fff' : 'rgba(240, 248, 255, 0.75)';
                    ctx.lineWidth = 0.9;
                    ctx.fill(); ctx.stroke();
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                    ctx.beginPath(); ctx.arc(fl.x, fl.y, fl.r, 0, Math.PI * 2); ctx.fill();
                }
            });
        }
        dimension();
        window.addEventListener('resize', dimension);
        lireFlocons = function () { return flocons; };
        lireAttelage = function () { return attelage; };
        chargerTraineau(function () { if (calme && c.isConnected) image(0); });
        if (!calme) hiver = requestAnimationFrame(function boucle(now) {
            if (!racine.classList.contains('noel')) return;
            image(now);
            hiver = requestAnimationFrame(boucle);
        });
        c._quitter = function () { window.removeEventListener('resize', dimension); };
    }

    function arreterHiver() {
        cancelAnimationFrame(hiver);
        lireFlocons = null;
        lireAttelage = null;
        if (window.jeuTraineau) window.jeuTraineau.fermer();
        document.documentElement.classList.remove('sur-flocon');
        document.querySelectorAll('.effet-noel').forEach(function (c) { if (c._quitter) c._quitter(); c.remove(); });
        document.querySelectorAll('.guirlande, .effet-tourbillon, .bulle-koch').forEach(function (e) { e.remove(); });
    }

    // démarrage : un tourbillon de flocons et d'étoiles dorées s'échappe de la boule du logo
    function tourbillon() {
        var e = document.createElement('div');
        e.className = 'effet-tourbillon';
        e.innerHTML = '<canvas></canvas>';
        document.body.appendChild(e);
        var c = e.querySelector('canvas'), ctx = c.getContext('2d'), dpr = window.devicePixelRatio || 1;
        c.width = innerWidth * dpr; c.height = innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var boule = document.querySelector('.logo-ligne button:nth-child(4)');
        var r = boule ? boule.getBoundingClientRect() : { left: 40, top: 20, width: 0, height: 0 };
        var x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
        var vol = Array.from({ length: 70 }, function (_, i) {
            var angle = Math.random() * Math.PI * 0.9 - 0.2, vitesse = 3 + Math.random() * 9;
            return { x: x0, y: y0, vx: Math.cos(angle) * vitesse, vy: Math.sin(angle) * vitesse * 0.7, r: 1.5 + Math.random() * (i % 6 ? 3 : 8),
                     or: i % 5 === 0, koch: i % 6 === 0, a: Math.random() * 6 };
        });
        var debut = performance.now();
        (function image(now) {
            if (!e.isConnected) return;
            var age = (now - debut) / 2600;
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            ctx.globalAlpha = Math.max(0, 1 - age * age);
            vol.forEach(function (p) {
                p.x += p.vx; p.y += p.vy; p.vx *= 0.975; p.vy = p.vy * 0.975 + 0.06; p.a += 0.05;
                ctx.fillStyle = p.or ? '#ffd45a' : '#ffffff';
                ctx.shadowColor = p.or ? '#ffb020' : '#bcd6ff';
                ctx.shadowBlur = 6;
                if (p.koch) { koch(ctx, p.x, p.y, p.r, p.a); ctx.fill(); }
                else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.6, 0, Math.PI * 2); ctx.fill(); }
            });
            if (age < 1) requestAnimationFrame(image);
            else e.remove();
        })(debut);
    }

    /* Un clic sur un grand flocon (là où rien d'autre n'est cliquable) : bulle sur le flocon de von Koch */
    function floconSous(e) {
        if (!lireFlocons || !document.documentElement.classList.contains('noel')) return null;
        if (e.target.closest && e.target.closest('a, button, input, textarea, select, label, summary, .class-card, .navbar, .bulle-koch')) return null;
        var liste = lireFlocons();
        for (var i = 0; i < liste.length; i++) {
            var f = liste[i], dx = e.clientX - f.x, dy = e.clientY - f.y;
            if (f.grand && dx * dx + dy * dy < (f.r + 6) * (f.r + 6)) return f;
        }
        return null;
    }
    // l'attelage occupe un rectangle : du bout des patins à la tête du 2e renne
    function attelageSous(e) {
        if (!lireAttelage || !document.documentElement.classList.contains('noel')) return null;
        if (e.target.closest && e.target.closest('a, button, input, textarea, select, label, summary, .class-card, .navbar, .bulle-koch')) return null;
        var A = lireAttelage();
        if (!A || A.px === undefined) return null;
        var dx = e.clientX - A.px, dy = e.clientY - A.py;
        return dx > -A.s * 1.3 && dx < A.s * 4.2 && dy > -A.s * 1.6 && dy < A.s * 0.4 ? A : null;
    }
    document.addEventListener('mousemove', function (e) {
        if (!lireFlocons) return;
        var A = attelageSous(e), f = A ? null : floconSous(e);
        lireFlocons().forEach(function (g) { g.survol = g === f; });
        var a = lireAttelage && lireAttelage();
        if (a) a.survol = !!A;
        document.documentElement.classList.toggle('sur-flocon', !!(f || A));
    });
    document.addEventListener('click', function (e) {
        if (attelageSous(e)) { chargerTraineau(function () { window.jeuTraineau.ouvrir(); }); return; }
        if (!floconSous(e)) return;
        document.querySelectorAll('.bulle-koch').forEach(function (b) { b.remove(); });
        var b = document.createElement('div');
        b.className = 'bulle-koch';
        b.setAttribute('role', 'status');
        b.innerHTML = '<strong>Flocon de von Koch</strong>On part d’un triangle ; sur chaque côté, on remplace le tiers du milieu par une petite pointe, ' +
            'et on recommence à l’infini. À chaque étape, le périmètre est multiplié par 4/3 : il devient infini… alors que l’aire reste finie !';
        b.style.left = Math.min(e.clientX + 14, innerWidth - 300) + 'px';
        b.style.top = Math.min(e.clientY + 14, innerHeight - 170) + 'px';
        document.body.appendChild(b);
        setTimeout(function () { b.classList.add('fin'); }, 9000);
        setTimeout(function () { b.remove(); }, 9600);
    });

    var MODES = { matrix: matrix, futur: futur, halloween: halloween, noel: noel };
    if (!HALLOWEEN_EN_LIGNE) delete MODES.halloween;
    if (!NOEL) delete MODES.noel;
    function modeActif() {
        return Object.keys(MODES).filter(function (m) { return document.documentElement.classList.contains(m); })[0];
    }
    // active un mode (ou le coupe s'il est déjà actif) ; un seul mode à la fois
    function basculer(nom) {
        var actif = modeActif();
        if (actif) MODES[actif]();
        if (nom && nom !== actif) MODES[nom]();
        try { localStorage.setItem(CLE_MODE, modeActif() || ''); } catch (e) {}
    }

    /* Le mode choisi reste actif d'une page à l'autre, jusqu'à ce qu'on le change */
    var CLE_MODE = 'site-maths-mode', memorise = '';
    try { memorise = localStorage.getItem(CLE_MODE) || ''; } catch (e) {}
    if (MODES[memorise]) {
        document.documentElement.classList.add(memorise);          // tout de suite, sans animation
        if (memorise === 'matrix') document.addEventListener('DOMContentLoaded', demarrerPluie);
        // BTTF déjà actif : directement l'état final (braises et trois menus), sans time circuits
        if (memorise === 'futur') {
            document.documentElement.classList.toggle('futur-accueil', accueil());
            document.addEventListener('DOMContentLoaded', function () { allumerFlammes(false); });
        }
        if (memorise === 'halloween') document.addEventListener('DOMContentLoaded', demarrerNuit);
        if (memorise === 'noel') document.addEventListener('DOMContentLoaded', demarrerHiver);
    }
    // pour tester : #traineau dans l'adresse ouvre directement le jeu du mode Noël
    if (MODES.noel && location.hash === '#traineau') {
        document.addEventListener('DOMContentLoaded', function () {
            if (!document.documentElement.classList.contains('noel')) basculer('noel');
            chargerTraineau(function () { window.jeuTraineau.ouvrir(); });
        });
    }
    window.modesSite = { basculer: basculer, actif: modeActif };

    document.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('.logo-ligne button');
        if (!b) return;
        var effet = b.dataset.effet;
        if (MODES[effet]) { basculer(effet); return; }
        // le bleu ramène d'abord le site normal
        if (modeActif()) basculer(null);
        if (effet === 'ecrire') reecrire();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modeActif()) basculer(null);
    });
})();

/* Liens « Espace élève » (page espace-eleve/) et « Espace professeure » (espace-eleve/prof.html)
   dans la barre de navigation de toutes les pages (après « Accueil ») */
(function () {
    var script = document.currentScript;
    var base = script ? script.src.replace(/site\.js(\?.*)?$/, '') : '';
    // Site ouvert comme application installée (écran d'accueil) : pas de lien vers l'espace professeure, NumWorks ni le tuto d'installation
    var appli = (window.matchMedia && (matchMedia('(display-mode: standalone)').matches ||
                 matchMedia('(display-mode: fullscreen)').matches ||
                 matchMedia('(display-mode: minimal-ui)').matches)) || navigator.standalone === true;
    var LIENS = [
        { texte: 'Espace élève', href: 'espace-eleve/', actif: /\/espace-eleve\/(index\.html)?$/ }
    ];
    if (appli) {
        document.documentElement.classList.add('appli-installee');
        var css = document.createElement('style');
        css.textContent = '.appli-installee .espace-prof, .appli-installee .lien-espace-prof { display: none !important; }';
        (document.head || document.documentElement).appendChild(css);
    } else {
        LIENS.push({ texte: 'Espace professeure', href: 'espace-eleve/prof.html', actif: /\/espace-eleve\/prof\.html$/ });
    }
    // Calendrier de l'Avent : lien affiché pendant la période du mode Noël (28 novembre - 6 janvier, ou aperçu ?noel)
    var jour = new Date(), apercuNoel = '';
    try { apercuNoel = localStorage.getItem('site-maths-apercu-noel') || ''; } catch (e) {}
    if ((jour.getMonth() === 10 && jour.getDate() >= 28) || jour.getMonth() === 11 || (jour.getMonth() === 0 && jour.getDate() <= 6) || apercuNoel || /calendrier-avent\.html$/.test(location.pathname)) {
        LIENS.splice(1, 0, { texte: 'Calendrier de l’Avent', href: 'calendrier-avent.html', actif: /calendrier-avent\.html$/ });
    }
    document.addEventListener('DOMContentLoaded', function () {
        if (appli) {   // liens masqués dans l'appli : Espace professeure, NumWorks, Installer l'appli
            document.querySelectorAll('.nav-links a').forEach(function (a) {
                if (a.textContent.trim() === 'Espace professeure' || /(numworks|installer)\.html$/i.test(a.getAttribute('href') || ''))
                    a.parentNode.classList.add('lien-espace-prof');
            });
        }
        var menu = document.querySelector('.nav-links');
        if (!menu || !base) return;
        var liens = Array.from(menu.querySelectorAll(':scope > li > a'));
        var apres = menu.querySelector(':scope > li');
        LIENS.forEach(function (l) {
            // lien déjà écrit dans la page : on le garde et on place le suivant après lui
            var deja = liens.filter(function (a) { return a.textContent.trim() === l.texte; })[0];
            if (deja) { apres = deja.parentNode; return; }
            var li = document.createElement('li'), a = document.createElement('a');
            a.href = base + l.href;
            a.textContent = l.texte;
            if (l.actif.test(location.pathname)) a.className = 'active';
            li.appendChild(a);
            menu.insertBefore(li, apres ? apres.nextSibling : menu.firstChild);
            apres = li;
        });
    });
})();

/* Cloche 🔔 des notifications (barre de navigation de toutes les pages), pour un élève connecté.
   Liste des notifications reçues (base : mes_notifications), nombre de non lues ;
   l'ouvrir les marque comme lues et efface la pastille de l'icône de l'appli.
   CLOCHE_COMPTES : mêmes comptes que NOTIF_CONFIG.comptes dans espace-eleve/config.js (null = tous). */
(function () {
    var CLOCHE_COMPTES = ['PROF-2NDE'];
    var BASE = 'https://cxpupcwsafrfxdlgytwh.supabase.co', CLE = 'sb_publishable_ryT5LKm_TWnjc9u1fxqShA_s-jmtT34';
    var script = document.currentScript;
    var racine = script ? script.src.replace(/site\.js(\?.*)?$/, '') : '';
    var s = null;
    // session de l'élève (relue à chaque connexion / déconnexion : événement « interactif-session » de moteur.js)
    function lireSession() {
        var x = null;
        try { x = JSON.parse(localStorage.getItem('interactif-session')); } catch (e) {}
        if (!x || !x.jeton || !racine) return null;
        if (CLOCHE_COMPTES && CLOCHE_COMPTES.indexOf(String(x.code).toUpperCase()) < 0) return null;
        return x;
    }
    if (!racine) return;

    function rpc(nom, args) {
        return fetch(BASE + '/rest/v1/rpc/' + nom, {
            method: 'POST', headers: { 'Content-Type': 'application/json', apikey: CLE }, body: JSON.stringify(args)
        }).then(function (r) { return r.text().then(function (t) { if (!r.ok) throw new Error(t); return t ? JSON.parse(t) : null; }); });
    }
    function pastille(n) {
        try {
            if (n > 0 && navigator.setAppBadge) navigator.setAppBadge(n).catch(function () {});
            else if (navigator.clearAppBadge) navigator.clearAppBadge().catch(function () {});
        } catch (e) {}
    }
    // les notifications du téléphone ont été vues : elles sont dans la cloche, on les retire du centre de notifications
    function fermerNotifsSysteme() {
        if (!navigator.serviceWorker) return;
        navigator.serviceWorker.getRegistration(racine).then(function (reg) {
            if (reg && reg.getNotifications) reg.getNotifications().then(function (l) { l.forEach(function (n) { n.close(); }); });
        }).catch(function () {});
    }
    function quand(d) {
        var m = Math.round((Date.now() - new Date(d)) / 60000);
        if (m < 1) return 'à l\'instant';
        if (m < 60) return 'il y a ' + m + ' min';
        if (m < 24 * 60) return 'il y a ' + Math.round(m / 60) + ' h';
        return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    var css = document.createElement('style');
    css.textContent =
        '.cloche { display: flex; align-items: center; }' +
        '.cloche > button { position: relative; background: none; border: 0; cursor: pointer; color: var(--muted); padding: 10px 12px; display: flex; align-items: center; }' +
        '.cloche > button:hover, .cloche > button:focus-visible, .cloche > button[aria-expanded="true"] { color: var(--text); outline: none; }' +
        '.cloche svg { width: 20px; height: 20px; }' +
        '.cloche .compte { position: absolute; top: 4px; right: 4px; min-width: 17px; height: 17px; padding: 0 4px; border-radius: 9px; background: #e5383b; color: #fff; font: 700 11px/17px system-ui, sans-serif; text-align: center; }' +
        '.cloche-panneau { position: fixed; right: 12px; width: min(360px, calc(100vw - 24px)); max-height: 65vh; overflow-x: hidden; overflow-y: auto; overflow-wrap: anywhere; background: var(--surface); color: var(--text); border: 1px solid var(--line); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.18); z-index: 1100; }' +
        '.cloche-tete { display: flex; align-items: center; gap: 6px; padding: 8px 10px 8px 14px; border-bottom: 1px solid var(--line); position: sticky; top: 0; background: var(--surface); }' +
        '.cloche-tete h2 { font-size: 0.95rem; margin: 0; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }' +
        '.cloche-tete button { background: none; border: 1px solid var(--line); border-radius: 8px; color: var(--muted); font: inherit; font-size: 0.8rem; padding: 4px 8px; cursor: pointer; flex: none; white-space: nowrap; }' +
        '.cloche-tete button:hover, .cloche-tete button:focus-visible { color: var(--text); border-color: var(--muted); outline: none; }' +
        '.cloche-reglages { display: grid; gap: 8px; padding: 4px 14px 6px; }' +
        '.cloche-reglages label { font-size: 0.9rem; display: flex; gap: 8px; align-items: center; }' +
        '.cloche-panneau ul { list-style: none; margin: 0; padding: 0; }' +
        '.cloche-panneau li { border-bottom: 1px solid var(--line); margin: 0; }' +
        '.cloche-panneau li:last-child { border-bottom: 0; }' +
        '.cloche-panneau a { display: block; padding: 10px 14px; color: inherit; text-decoration: none; }' +
        '.cloche-panneau a:hover, .cloche-panneau a:focus-visible { background: var(--bg); outline: none; }' +
        '.cloche-panneau .nouv { border-left: 3px solid #e5383b; }' +
        '.cloche-panneau a > b { display: block; font-size: 0.92rem; }' +
        '.cloche-panneau a > span { display: block; font-size: 0.88rem; color: var(--muted); }' +
        '.cloche-panneau small { display: block; font-size: 0.78rem; color: var(--muted); margin-top: 2px; }' +
        '.cloche-panneau .vide { padding: 14px; color: var(--muted); font-size: 0.9rem; margin: 0; }';
    (document.head || document.documentElement).appendChild(css);

    var retirer = null;   // retire la cloche installée (déconnexion)
    function monter() {
        var menu = document.querySelector('.nav-links');
        if (!menu) return;
        // maths $…$ dans les notifications : maths-texte.js (chargé ici s'il n'est pas déjà sur la page)
        if (!window.MathsTexte && !document.querySelector('script[src$="maths-texte.js"]')) {
            var mt = document.createElement('script'); mt.src = racine + 'maths-texte.js'; document.head.appendChild(mt);
        }
        var li = document.createElement('li'), bt = document.createElement('button'), compte = document.createElement('span');
        li.className = 'cloche';
        bt.type = 'button';
        bt.setAttribute('aria-expanded', 'false');
        bt.setAttribute('aria-label', 'Notifications');
        bt.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';
        compte.className = 'compte'; compte.hidden = true;
        bt.appendChild(compte); li.appendChild(bt); menu.appendChild(li);

        var panneau = document.createElement('div');
        panneau.className = 'cloche-panneau'; panneau.hidden = true;
        panneau.setAttribute('role', 'dialog'); panneau.setAttribute('aria-label', 'Notifications');
        document.body.appendChild(panneau);

        var donnees = null;
        function montrerCompte(n) { compte.hidden = !n; compte.textContent = n > 9 ? '9+' : String(n); bt.setAttribute('aria-label', 'Notifications' + (n ? ' (' + n + ' non lue' + (n > 1 ? 's' : '') + ')' : '')); }
        function charger() {
            return rpc('mes_notifications', { p_jeton: s.jeton }).then(function (d) {
                donnees = d || { non_lues: 0, liste: [] };
                montrerCompte(donnees.non_lues); pastille(donnees.non_lues);
            }, function () { /* base pas prête ou session expirée : pas de cloche active */ });
        }
        // Catégories (mêmes que maj-push-categories.sql) ; « prof » ne peut pas être coupée
        // 📝 Nouvelle note, 📆 Évaluation à venir, 🤝 Rappel soutien : retirées pour l'instant (voir onglet Notif de l'espace prof)
        var CATEGORIES = [['serie', '📅 Nouvelle série disponible'], ['rappel', '⏰ Série d\'automatismes non finie'],
                          ['prof', '📣 Message de ta professeure']];
        var reglages = false;
        function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
        function entete(titre, boutons) {
            var h = el('div', 'cloche-tete'); h.appendChild(el('h2', null, titre));
            boutons.forEach(function (b) { var x = el('button', null, b[0]); x.type = 'button'; x.title = b[1]; x.setAttribute('aria-label', b[1]); x.onclick = b[2]; h.appendChild(x); });
            panneau.appendChild(h);
        }
        function remplirReglages() {
            panneau.innerHTML = '';
            entete('Sur ce téléphone', [['←', 'Retour aux notifications', function () { reglages = false; remplir(); }]]);
            var p = el('p', 'vide', 'Choisis les notifications que tu reçois sur ton téléphone. Elles restent toutes visibles ici, dans la cloche.');
            panneau.appendChild(p);
            var zone = el('div', 'cloche-reglages'), etat = el('p', 'vide', 'Chargement…');
            panneau.appendChild(zone); panneau.appendChild(etat);
            rpc('mes_preferences', { p_jeton: s.jeton }).then(function (coupees) {
                coupees = coupees || []; etat.textContent = '';
                CATEGORIES.forEach(function (c) {
                    var l = el('label'), cb = el('input');
                    cb.type = 'checkbox'; cb.value = c[0]; cb.checked = coupees.indexOf(c[0]) < 0;
                    if (c[0] === 'prof') { cb.disabled = true; cb.checked = true; }
                    l.appendChild(cb); l.appendChild(document.createTextNode(' ' + c[1] + (c[0] === 'prof' ? ' (toujours)' : '')));
                    zone.appendChild(l);
                });
                zone.onchange = function () {
                    var off = Array.prototype.filter.call(zone.querySelectorAll('input:not(:disabled)'), function (i) { return !i.checked; }).map(function (i) { return i.value; });
                    etat.textContent = 'Enregistrement…';
                    rpc('enregistrer_preferences', { p_jeton: s.jeton, p_coupees: off }).then(function () { etat.textContent = '✓ Enregistré.'; },
                        function () { etat.textContent = 'Non enregistré, réessaie plus tard.'; });
                };
            }, function () { etat.textContent = 'Réglages indisponibles pour l\'instant.'; });
        }
        function remplir() {
            if (reglages) return remplirReglages();
            panneau.innerHTML = '';
            var liste = (donnees && donnees.liste) || [];
            var boutons = [['⚙️', 'Choisir les notifications reçues sur le téléphone', function () { reglages = true; remplir(); }]];
            // ⚙️ en premier (juste après le titre) pour qu'elle soit toujours visible
            if (liste.length) boutons.push(['Tout effacer', 'Effacer toutes les notifications', function () {
                rpc('notifications_effacer', { p_jeton: s.jeton }).then(function () {
                    donnees = { non_lues: 0, liste: [] }; montrerCompte(0); pastille(0); remplir();
                }).catch(function () {});
            }]);
            entete('Notifications', boutons);
            if (!liste.length) { var p = document.createElement('p'); p.className = 'vide'; p.textContent = 'Aucune notification pour l\'instant.'; panneau.appendChild(p); return; }
            var ul = document.createElement('ul');
            liste.forEach(function (n) {
                var l = document.createElement('li'), a = document.createElement('a');
                a.href = racine + (n.url || 'espace-eleve/');
                if (!n.lu) a.className = 'nouv';
                [['b', n.titre, 1], ['span', n.texte, 1], ['small', quand(n.recu_le)]].forEach(function (x) {
                    var e = document.createElement(x[0]);
                    if (x[2] && window.MathsTexte) MathsTexte.rendu(e, x[1] || ''); else e.textContent = x[1];   // maths $…$ (maths-texte.js)
                    a.appendChild(e);
                });
                l.appendChild(a); ul.appendChild(l);
            });
            panneau.appendChild(ul);
        }
        function ouvrir(oui) {
            panneau.hidden = !oui; bt.setAttribute('aria-expanded', oui ? 'true' : 'false');
            if (!oui) return;
            panneau.style.top = (document.querySelector('.navbar').getBoundingClientRect().bottom + 6) + 'px';
            remplir();
            if (donnees && donnees.non_lues) {
                rpc('notifications_lues', { p_jeton: s.jeton }).then(function () {
                    donnees.non_lues = 0; donnees.liste.forEach(function (n) { n.lu = true; });
                    montrerCompte(0); pastille(0);
                }).catch(function () {});
            }
        }
        bt.onclick = function (e) { e.stopPropagation(); reglages = false; ouvrir(panneau.hidden); };
        panneau.addEventListener('click', function (e) { e.stopPropagation(); });   // le contenu est redessiné : ne pas fermer le panneau
        function auRetour() { if (!document.hidden) { charger(); fermerNotifsSysteme(); } }
        function clicDehors(e) { if (!panneau.hidden && !panneau.contains(e.target)) ouvrir(false); }
        function echap(e) { if (e.key === 'Escape' && !panneau.hidden) { ouvrir(false); bt.focus(); } }
        document.addEventListener('click', clicDehors);
        document.addEventListener('keydown', echap);
        // revenu dans l'appli (après une notification) : on met à jour
        document.addEventListener('visibilitychange', auRetour);
        retirer = function () {
            document.removeEventListener('click', clicDehors);
            document.removeEventListener('keydown', echap);
            document.removeEventListener('visibilitychange', auRetour);
            li.remove(); panneau.remove(); pastille(0); retirer = null;
        };

        fermerNotifsSysteme();
        charger();
    }

    // (ré)installe la cloche selon la session : au chargement, puis à chaque connexion / déconnexion, sans recharger la page
    function actualiser() {
        var x = lireSession();
        if (retirer && (!x || !s || x.jeton !== s.jeton)) retirer();
        s = x;
        if (s && !retirer) monter();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', actualiser); else actualiser();
    window.addEventListener('interactif-session', actualiser);
    window.addEventListener('storage', function (e) { if (e.key === 'interactif-session') actualiser(); });   // autre onglet
})();
