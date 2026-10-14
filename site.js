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

    function crayonner(h) {
        var texte = h.textContent.trim().toUpperCase();
        h.setAttribute('aria-label', h.textContent.trim());
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

/* Effets cachés dans le logo (les quatre ronds de la ligne) :
   bleu = le titre se réécrit, vert = mode Matrix, violet = mode Retour vers le futur, orange = mode Halloween. */
(function () {
    var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    /* Violet : mode Retour vers le futur — tableau de bord en inox et « time circuits » sous le titre.
       Au démarrage, le compteur monte à 88, éclair, puis deux traînées de feu. */
    var MOIS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    var horloge = null;

    function date88(d) {
        var deux = function (n) { return (n < 10 ? '0' : '') + n; };
        return MOIS[d.getMonth()] + ' ' + deux(d.getDate()) + ' ' + d.getFullYear() + ' ' + deux(d.getHours()) + ':' + deux(d.getMinutes());
    }

    function futur() {
        if (document.documentElement.classList.toggle('futur')) {
            afficherCircuits();
            if (!calme) demarrer88();
            else allumerFlammes(false);
        } else {
            clearInterval(horloge);
            eteindreFlammes();
            document.querySelectorAll('.circuits, .effet-futur').forEach(function (e) { e.remove(); });
        }
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

    function allumerFlammes(progressif) {
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
            if (!intensite && foyers.every(function (f) { return !f.parts.length; })) { animFlammes = null; fixe(); return; }
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
    function dernierDepart() {
        try {
            var d = JSON.parse(localStorage.getItem('interactif-derniere-connexion'));
            return d ? new Date(d) : null;
        } catch (e) { return null; }
    }

    function afficherCircuits() {
        var header = document.querySelector('header');
        if (!header || header.querySelector('.circuits')) return;
        var maintenant = new Date(), depart = dernierDepart();
        // destination : 30 ans plus tard, comme Marty (1985 → 2015)
        var destination = new Date(maintenant);
        destination.setFullYear(destination.getFullYear() + 30);
        var lignes = [
            ['destination', 'Destination time', date88(destination)],
            ['present', 'Present time', date88(maintenant)],
            ['depart', 'Last time departed', depart ? date88(depart) : '--- -- ---- --:--']
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
            if (document.documentElement.classList.contains('futur')) allumerFlammes(true);
            setTimeout(function () { e.classList.add('fin'); }, 3000);         // le compteur reste le temps du feu
            setTimeout(function () { e.remove(); }, 3600);
        })(debut);
    }

    /* Orange : mode Halloween — nuit violette et pleine lune, chauves-souris et fantômes qui passent derrière,
       une araignée qui descend de la barre. Au démarrage : coup de tonnerre et nuée de chauves-souris. */
    var nuit = null;

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
        var ctx = c.getContext('2d'), w, h, chauves, fantomes;
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
            if (calme) image(0);
        }
        function image(now) {
            var t = now / 1000;
            ctx.clearRect(0, 0, w, h);
            fantomes.forEach(function (f, i) {
                if (!calme) { f.y -= f.v; if (f.y < -80) fantomes[i] = f = nouveauFantome(false); }
                fantome(ctx, f.x + Math.sin(t * 0.8 + f.o) * 24, f.y, f.r, t + f.o, f.a);
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

    var MODES = { matrix: matrix, futur: futur, halloween: halloween };
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
        if (memorise === 'futur') document.addEventListener('DOMContentLoaded', function () { afficherCircuits(); allumerFlammes(false); });
        if (memorise === 'halloween') document.addEventListener('DOMContentLoaded', demarrerNuit);
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

/* Lien « Automatismes » dans la barre de navigation de toutes les pages (après « Accueil ») */
(function () {
    var script = document.currentScript;
    var base = script ? script.src.replace(/site\.js(\?.*)?$/, '') : '';
    document.addEventListener('DOMContentLoaded', function () {
        var menu = document.querySelector('.nav-links');
        if (!menu || !base) return;
        var deja = Array.from(menu.querySelectorAll('a')).some(function (a) { return a.textContent.trim() === 'Automatismes'; });
        if (deja) return;
        var li = document.createElement('li'), a = document.createElement('a');
        a.href = base + 'automatismes/';
        a.textContent = 'Automatismes';
        if (/\/automatismes\/(index\.html)?$/.test(location.pathname)) a.className = 'active';
        li.appendChild(a);
        var premier = menu.querySelector(':scope > li');
        menu.insertBefore(li, premier ? premier.nextSibling : menu.firstChild);
    });
})();
