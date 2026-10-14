/* Barre du haut pour les pages qui n'utilisent pas style.css (séries d'automatismes, corrigés, activités).
   À inclure dans le <head> :  <script src="../../barre.js"></script>
   - liens Accueil et Automatismes ;
   - les quatre ronds du logo : bleu = site normal, vert = mode Matrix, violet = mode Retour vers le futur, orange = mode Halloween ;
   - bouton Sombre / Clair.
   Les choix sont partagés avec le reste du site (mêmes clés que site.js) et restent d'une page à l'autre. */
(function () {
    'use strict';
    var racine = document.documentElement;
    var script = document.currentScript;
    var base = script ? script.src.replace(/barre\.js(\?.*)?$/, '') : '';
    var CLE_THEME = 'site-maths-theme', CLE_MODE = 'site-maths-mode';

    function lire(cle) { try { return localStorage.getItem(cle) || ''; } catch (e) { return ''; } }
    function ecrire(cle, v) { try { localStorage.setItem(cle, v); } catch (e) {} }

    // Page qui gère déjà elle-même le thème (séries d'automatismes : attribut data-theme + bouton #theme-toggle)
    function themeNatif() { return racine.hasAttribute('data-theme') && !racine.classList.contains('barre-inverse'); }

    // 4e rond : petite citrouille, allumée en mode Halloween (mêmes dessins que style.css)
    var CITROUILLE = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 28 26\'%3E%3Cpath d=\'M14 7Q13 3 16.5 1\' stroke=\'%233f8f2a\' stroke-width=\'2.6\' fill=\'none\' stroke-linecap=\'round\'/%3E%3Cellipse cx=\'9\' cy=\'16\' rx=\'8\' ry=\'9\' fill=\'%23d9560a\'/%3E%3Cellipse cx=\'19\' cy=\'16\' rx=\'8\' ry=\'9\' fill=\'%23d9560a\'/%3E%3Cellipse cx=\'14\' cy=\'16\' rx=\'7\' ry=\'9.6\' fill=\'%23ff7518\'/%3E%3Cpath d=\'M7.5 14.5L10 10.5L12.5 14.5ZM15.5 14.5L18 10.5L20.5 14.5ZM6.5 18Q14 26 21.5 18Q14 21.5 6.5 18Z\' fill=\'%236b2200\'/%3E%3C/svg%3E")';
    var CITROUILLE_ALLUMEE = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 28 26\'%3E%3Cdefs%3E%3CradialGradient id=\'f\' cx=\'.5\' cy=\'.55\' r=\'.6\'%3E%3Cstop offset=\'0\' stop-color=\'%23fff8c4\'/%3E%3Cstop offset=\'.5\' stop-color=\'%23ffd23a\'/%3E%3Cstop offset=\'1\' stop-color=\'%23ff8a00\'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cpath d=\'M14 7Q13 3 16.5 1\' stroke=\'%233f8f2a\' stroke-width=\'2.6\' fill=\'none\' stroke-linecap=\'round\'/%3E%3Cellipse cx=\'9\' cy=\'16\' rx=\'8\' ry=\'9\' fill=\'%23d9560a\'/%3E%3Cellipse cx=\'19\' cy=\'16\' rx=\'8\' ry=\'9\' fill=\'%23d9560a\'/%3E%3Cellipse cx=\'14\' cy=\'16\' rx=\'7\' ry=\'9.6\' fill=\'%23ff7518\'/%3E%3Cpath d=\'M7.5 14.5L10 10.5L12.5 14.5ZM15.5 14.5L18 10.5L20.5 14.5ZM6.5 18Q14 26 21.5 18Q14 21.5 6.5 18Z\' fill=\'url(%23f)\'/%3E%3C/svg%3E")';

    /* ---------- Styles (tous préfixés .barre-site / html.barre-…) ---------- */
    var css = [
        '.barre-site{all:initial;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 16px;',
        'padding:8px max(16px,calc((100% - 1100px)/2 + 20px));background:#fff;border-bottom:1px solid #e3e7ef;',
        'font:600 15px/1.4 Lexend,system-ui,-apple-system,"Segoe UI",sans-serif;color:#14213d;box-sizing:border-box;width:100%;position:relative;z-index:50}',
        '.barre-site *{box-sizing:border-box;font:inherit}',
        '.barre-site a{color:inherit;text-decoration:none}',
        '.barre-site .b-logo{display:flex;align-items:center;gap:10px}',
        '.barre-site .b-ligne{position:relative;display:inline-block;width:61px;height:12px;flex-shrink:0}',
        '.barre-site .b-ligne:before{content:"";position:absolute;left:4px;right:4px;top:5px;height:2px;background:currentColor}',
        '.barre-site .b-ligne button{all:unset;position:absolute;top:0;width:12px;height:12px;border-radius:50%;cursor:pointer;box-sizing:border-box}',
        '.barre-site .b-ligne button:nth-child(1){left:0;background:#2f6fdf}',
        '.barre-site .b-ligne button:nth-child(2){left:15px;background:#0f9d76}',
        '.barre-site .b-ligne button:nth-child(3){left:30px;background:#fff;border:2.5px solid #8a4fd8}',
        '.barre-site .b-ligne button:nth-child(4){left:45px;top:-3px;width:16px;height:15px;border-radius:0;background:center/contain no-repeat ' + CITROUILLE + '}',
        'html.halloween .barre-site .b-ligne button:nth-child(4){background-image:' + CITROUILLE_ALLUMEE + ';filter:drop-shadow(0 0 3px #ffb020)}',
        '.barre-site ul{all:unset;display:flex;align-items:center;gap:4px 18px;flex-wrap:wrap}',
        '.barre-site li{all:unset}',
        '.barre-site ul a{color:#66708a;font-weight:500}',
        '.barre-site ul a:hover{color:#14213d}',
        '.barre-site .b-theme{all:unset;cursor:pointer;border:1px solid #e3e7ef;border-radius:999px;padding:3px 12px;color:#66708a;font-weight:500;font-size:14px}',
        // sombre natif (séries) ou inversé (autres pages)
        'html[data-theme="dark"] .barre-site{background:#171c26;color:#e6eaf2;border-color:#283042}',
        'html[data-theme="dark"] .barre-site ul a,html[data-theme="dark"] .barre-site .b-theme{color:#98a2b6;border-color:#283042}',
        'html.barre-inverse{filter:invert(1) hue-rotate(180deg);background:#fff}',
        'html.barre-inverse img,html.barre-inverse video,html.barre-inverse picture,html.barre-inverse iframe{filter:invert(1) hue-rotate(180deg)}',
        // modes
        'html.matrix{filter:invert(1) grayscale(1) sepia(1) hue-rotate(75deg) saturate(6) brightness(.9);background:#fff}',
        'html.futur:not([data-theme="dark"]){filter:invert(1) hue-rotate(180deg) sepia(.35) saturate(1.5);background:#fff}',
        'html.futur:not([data-theme="dark"]) img,html.futur:not([data-theme="dark"]) video,html.futur:not([data-theme="dark"]) iframe{filter:invert(1) hue-rotate(180deg)}',
        'html[data-theme="dark"].futur{filter:sepia(.35) saturate(1.5)}',
        // Halloween : page assombrie et teintée orange / violet, chauves-souris qui passent
        'html.halloween:not([data-theme="dark"]){filter:invert(1) hue-rotate(180deg) sepia(.6) saturate(2.2) hue-rotate(-25deg);background:#fff}',
        'html.halloween:not([data-theme="dark"]) img,html.halloween:not([data-theme="dark"]) video,html.halloween:not([data-theme="dark"]) iframe{filter:invert(1) hue-rotate(180deg)}',
        'html[data-theme="dark"].halloween{filter:sepia(.6) saturate(2.2) hue-rotate(-25deg)}',
        'html[data-theme="dark"].matrix{filter:grayscale(1) sepia(1) hue-rotate(75deg) saturate(6) brightness(1.1);background:#000}',
        '.barre-effet{position:fixed;inset:0;pointer-events:none;z-index:9999}',
        '.barre-effet.feu{top:auto;height:4px;background:linear-gradient(90deg,transparent,#c41a00 20%,#ff6a00 60%,#fff1a0);box-shadow:0 0 12px #ff6a00}',
        '.barre-licence{all:initial;display:block;box-sizing:border-box;width:100%;max-width:1100px;margin:28px auto 12px;padding:0 16px;text-align:center;font:12.5px/1.5 Lexend,system-ui,sans-serif;color:#66708a}',
        '.barre-licence a{color:inherit;text-decoration:underline}',
        'html[data-theme="dark"] .barre-licence{color:#98a2b6}',
        '@media print{.barre-site,.barre-effet{display:none!important}html.barre-inverse,html.matrix,html.futur,html.halloween{filter:none}}'
    ].join('');
    var style = document.createElement('style');
    style.textContent = css;
    (document.head || racine).appendChild(style);

    /* ---------- Thème ---------- */
    function sombre() { return lire(CLE_THEME) === 'dark'; }
    function appliquerTheme() {
        if (themeNatif()) return;                       // la page s'en charge
        racine.classList.toggle('barre-inverse', sombre() && !mode());
    }

    /* ---------- Modes Matrix / Retour vers le futur / Halloween ---------- */
    function mode() { var m = lire(CLE_MODE); return m === 'matrix' || m === 'futur' || m === 'halloween' ? m : ''; }
    var pluie = null;
    function effets() {
        var m = mode();
        racine.classList.toggle('matrix', m === 'matrix');
        racine.classList.toggle('futur', m === 'futur');
        racine.classList.toggle('halloween', m === 'halloween');
        appliquerTheme();
        if (!document.body) return;
        document.querySelectorAll('.barre-effet').forEach(function (e) { e.remove(); });
        cancelAnimationFrame(pluie);
        if (m === 'futur') { var l = document.createElement('div'); l.className = 'barre-effet feu'; document.body.appendChild(l); }
        if (m === 'halloween' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // chauves-souris (blanches avant l'inversion du thème clair, noires en sombre natif)
            var cv = document.createElement('canvas'); cv.className = 'barre-effet'; cv.style.opacity = '.7';
            document.body.appendChild(cv);
            var cx = cv.getContext('2d'), vol, encre = themeNatif() && racine.getAttribute('data-theme') === 'dark' ? '#000' : '#fff';
            var nouvelle = function (partout) {
                var sens = Math.random() < .5 ? 1 : -1;
                return { x: partout ? Math.random() * innerWidth : (sens > 0 ? -30 : innerWidth + 30), y: Math.random() * innerHeight * .8,
                         s: 7 + Math.random() * 10, v: sens * (.6 + Math.random()), p: Math.random() * 6 };
            };
            var dimH = function () { cv.width = innerWidth; cv.height = innerHeight; vol = Array.from({ length: Math.max(3, Math.round(innerWidth / 220)) }, function () { return nouvelle(true); }); };
            dimH(); window.addEventListener('resize', dimH);
            (function image() {
                if (mode() !== 'halloween') return;
                pluie = requestAnimationFrame(image);
                cx.clearRect(0, 0, cv.width, cv.height); cx.fillStyle = encre;
                vol.forEach(function (b, i) {
                    b.x += b.v; b.p += .25;
                    if (b.x < -40 || b.x > innerWidth + 40) vol[i] = b = nouvelle(false);
                    var s = b.s, f = Math.sin(b.p) * s * .55;
                    cx.beginPath();
                    [1, -1].forEach(function (k) {
                        cx.moveTo(0 + b.x, b.y - s * .12);
                        cx.quadraticCurveTo(b.x + k * s * .5, b.y - s * .35 - f * .5, b.x + k * s, b.y - f);
                        cx.quadraticCurveTo(b.x + k * s * .6, b.y, b.x, b.y + s * .22);
                    });
                    cx.fill();
                });
            })();
        }
        if (m === 'matrix' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            var c = document.createElement('canvas'); c.className = 'barre-effet'; c.style.opacity = '.35';
            document.body.appendChild(c);
            var ctx = c.getContext('2d'), t = 16, col, g, dernier = 0;
            var car = '0123456789+−×÷=≠≈<>≤≥±πΣ√∞∫Δθλφ∈ℝℕ%';
            var dim = function () { c.width = innerWidth; c.height = innerHeight; col = Math.ceil(innerWidth / t); g = Array.from({ length: col }, function () { return Math.random() * innerHeight / t; }); };
            dim(); window.addEventListener('resize', dim);
            (function image(now) {
                if (mode() !== 'matrix') return;
                pluie = requestAnimationFrame(image);
                if (now - dernier < 60) return; dernier = now;
                ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(0, 0, c.width, c.height);   // inversé par le filtre
                ctx.font = t + 'px monospace'; ctx.fillStyle = '#000';
                for (var i = 0; i < col; i++) {
                    ctx.fillText(car[Math.floor(Math.random() * car.length)], i * t, g[i] * t);
                    if (g[i] * t > c.height && Math.random() > .975) g[i] = 0;
                    g[i]++;
                }
            })(0);
        }
    }
    function basculer(m) { ecrire(CLE_MODE, mode() === m ? '' : m); effets(); }

    // tout de suite (avant l'affichage) pour éviter un flash
    effets();

    /* ---------- Barre ---------- */
    document.addEventListener('DOMContentLoaded', function () {
        var nav = document.createElement('nav');
        nav.className = 'barre-site';
        nav.setAttribute('aria-label', 'Navigation du site');
        nav.innerHTML =
            '<div class="b-logo"><span class="b-ligne">' +
            '<button type="button" data-m="" title="Site normal"></button>' +
            '<button type="button" data-m="matrix" title="Mode Matrix"></button>' +
            '<button type="button" data-m="futur" title="Mode BTTF (Back to the Future)"></button>' +
            '<button type="button" data-m="halloween" title="Mode Halloween"></button></span>' +
            '<a href="' + base + 'index.html">Année 2026-2027 - Lycée Lebrun</a></div>' +
            '<ul><li><a href="' + base + 'index.html">Accueil</a></li>' +
            '<li><a href="' + base + 'automatismes/">Automatismes</a></li>' +
            '<li><button type="button" class="b-theme"></button></li></ul>';
        document.body.insertBefore(nav, document.body.firstChild);

        // mention de licence en bas de page (visible aussi à l'impression)
        if (!document.querySelector('footer')) {
            var lic = document.createElement('p');
            lic.className = 'barre-licence';
            lic.innerHTML = '© 2026 Clémence Le Tousey<br>Hébergé avec GitHub Pages.<br>Documents sous licence <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr" target="_blank" rel="license noopener">CC BY-NC-SA 4.0</a> : réutilisation libre en citant l\'autrice et la source, sans usage commercial, et en partageant dans les mêmes conditions.';
            document.body.appendChild(lic);
        }

        // pleine largeur et collée en haut, quelles que soient les marges de la page
        function caler() {
            nav.style.marginLeft = '0px'; nav.style.marginTop = '0px'; nav.style.marginBottom = '0px';
            nav.style.width = document.documentElement.clientWidth + 'px';
            var r = nav.getBoundingClientRect();
            nav.style.marginLeft = -r.left + 'px';
            nav.style.marginTop = -(r.top + window.scrollY) + 'px';
            nav.style.marginBottom = (r.top + window.scrollY) + 'px';   // rend l'espace pris sur la marge de la page
        }
        caler();
        window.addEventListener('resize', caler);

        nav.querySelectorAll('.b-ligne button').forEach(function (b) {
            b.onclick = function () { if (b.dataset.m) basculer(b.dataset.m); else { ecrire(CLE_MODE, ''); effets(); } };
        });
        var bt = nav.querySelector('.b-theme');
        function etiquette() {
            var s = themeNatif() ? racine.getAttribute('data-theme') === 'dark' : sombre();
            bt.textContent = s ? '☀ Clair' : '☾ Sombre';
        }
        bt.onclick = function () {
            var natif = document.getElementById('theme-toggle');
            if (themeNatif() && natif) natif.click();       // la page change et mémorise elle-même
            else {
                ecrire(CLE_THEME, sombre() ? 'light' : 'dark');
                appliquerTheme();
            }
            etiquette();
        };
        // le bouton propre à la page met aussi à jour l'étiquette
        var natif = document.getElementById('theme-toggle');
        if (natif) natif.addEventListener('click', function () { setTimeout(etiquette, 0); });
        etiquette();
        effets();
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mode()) { ecrire(CLE_MODE, ''); effets(); } });
    });
})();
