/* Barre du haut pour les pages qui n'utilisent pas style.css (séries d'automatismes, corrigés, activités).
   À inclure dans le <head> :  <script src="../../barre.js"></script>
   - liens Accueil et Automatismes ;
   - les trois ronds du logo : bleu = site normal, vert = mode Matrix, violet = mode Retour vers le futur ;
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

    /* ---------- Styles (tous préfixés .barre-site / html.barre-…) ---------- */
    var css = [
        '.barre-site{all:initial;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 16px;',
        'padding:8px max(16px,calc((100% - 1100px)/2 + 20px));background:#fff;border-bottom:1px solid #e3e7ef;',
        'font:600 15px/1.4 Lexend,system-ui,-apple-system,"Segoe UI",sans-serif;color:#14213d;box-sizing:border-box;width:100%;position:relative;z-index:50}',
        '.barre-site *{box-sizing:border-box;font:inherit}',
        '.barre-site a{color:inherit;text-decoration:none}',
        '.barre-site .b-logo{display:flex;align-items:center;gap:10px}',
        '.barre-site .b-ligne{position:relative;display:inline-block;width:42px;height:12px;flex-shrink:0}',
        '.barre-site .b-ligne:before{content:"";position:absolute;left:4px;right:4px;top:5px;height:2px;background:currentColor}',
        '.barre-site .b-ligne button{all:unset;position:absolute;top:0;width:12px;height:12px;border-radius:50%;cursor:pointer;box-sizing:border-box}',
        '.barre-site .b-ligne button:nth-child(1){left:0;background:#2f6fdf}',
        '.barre-site .b-ligne button:nth-child(2){left:15px;background:#0f9d76}',
        '.barre-site .b-ligne button:nth-child(3){left:30px;background:#fff;border:2.5px solid #8a4fd8}',
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
        'html[data-theme="dark"].matrix{filter:grayscale(1) sepia(1) hue-rotate(75deg) saturate(6) brightness(1.1);background:#000}',
        '.barre-effet{position:fixed;inset:0;pointer-events:none;z-index:9999}',
        '.barre-effet.feu{top:auto;height:4px;background:linear-gradient(90deg,transparent,#c41a00 20%,#ff6a00 60%,#fff1a0);box-shadow:0 0 12px #ff6a00}',
        '.barre-licence{all:initial;display:block;box-sizing:border-box;width:100%;max-width:1100px;margin:28px auto 12px;padding:0 16px;text-align:center;font:12.5px/1.5 Lexend,system-ui,sans-serif;color:#66708a}',
        '.barre-licence a{color:inherit;text-decoration:underline}',
        'html[data-theme="dark"] .barre-licence{color:#98a2b6}',
        '@media print{.barre-site,.barre-effet{display:none!important}html.barre-inverse,html.matrix,html.futur{filter:none}}'
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

    /* ---------- Modes Matrix / Retour vers le futur ---------- */
    function mode() { var m = lire(CLE_MODE); return m === 'matrix' || m === 'futur' ? m : ''; }
    var pluie = null;
    function effets() {
        var m = mode();
        racine.classList.toggle('matrix', m === 'matrix');
        racine.classList.toggle('futur', m === 'futur');
        appliquerTheme();
        if (!document.body) return;
        document.querySelectorAll('.barre-effet').forEach(function (e) { e.remove(); });
        cancelAnimationFrame(pluie);
        if (m === 'futur') { var l = document.createElement('div'); l.className = 'barre-effet feu'; document.body.appendChild(l); }
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
            '<button type="button" data-m="futur" title="Mode BTTF (Back to the Future)"></button></span>' +
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
