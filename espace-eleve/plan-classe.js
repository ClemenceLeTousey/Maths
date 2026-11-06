/* Plan de classe (onglet de l'espace professeure).
   RGPD : aucun nom ici, seulement les codes élèves. Les prénoms viennent des fichiers comptes-*.csv
   chargés sur l'ordinateur (même mémoire que l'onglet Suivi QF : localStorage 'interactif-noms').
   Salle : 3 rangées de doubles tables, 5 lignes. PLANS[classe][0] = ligne du fond, dernière = devant ;
   6 places par ligne, de gauche à droite vu depuis le bureau (tableau en bas). */
(function () {
    var PLANS = {
        '2H': [
            [null, null, '2H-GAUSS', '2H-NEWTON', null, null],
            ['2H-GALOIS', '2H-KEPLER', '2H-LOVELACE', '2H-TURING', '2H-GERMAIN', '2H-HILBERT'],
            ['2H-CANTOR', '2H-DESCARTES', '2H-BOOLE', '2H-POISSON', '2H-BERNOULLI', '2H-CAUCHY'],
            ['2H-PASCAL', '2H-VILLANI', '2H-RIEMANN', '2H-LEGENDRE', '2H-CARDAN', '2H-NOETHER'],
            ['2H-FIBONACCI', '2H-FOURIER', '2H-TARTAGLIA', '2H-LEIBNIZ', '2H-NASH', '2H-BOREL']
        ]
    };
    // genre (cf. maj-genre.sql), pour les couleurs facultatives
    var FILLES = ['2H-NASH', '2H-FOURIER', '2H-TARTAGLIA', '2H-RIEMANN', '2H-CARDAN', '2H-VILLANI', '2H-BOOLE',
        '2H-CANTOR', '2H-GERMAIN', '2H-CAUCHY', '2H-LEIBNIZ', '2H-TURING'];

    var CLE = 'plan-classe-', CLE_VUE = 'plan-classe-vue', CLE_COUL = 'plan-classe-couleurs';
    var $ = function (id) { return document.getElementById(id); };
    var classe = null, plan = null, enHaut = true, choisi = null, lance = false;

    function lireStock(cle) { try { return localStorage.getItem(cle); } catch (e) { return null; } }
    function ecrireStock(cle, v) { try { localStorage.setItem(cle, v); } catch (e) {} }
    function copie(p) { return p.map(function (r) { return r.slice(); }); }

    function noms() {
        if (window.interactifNoms) return window.interactifNoms();
        try { return JSON.parse(lireStock('interactif-noms')) || {}; } catch (e) { return {}; }
    }
    // « HUBERT--POSTEL Charlotte » → « Charlotte » (le nom de famille est en majuscules)
    function prenom(complet) {
        var mots = complet.split(/\s+/), p = mots.filter(function (m) { return m !== m.toUpperCase(); });
        return p.length ? p.join(' ') : complet;
    }

    function charger() {
        var s = null;
        try { s = JSON.parse(lireStock(CLE + classe)); } catch (e) {}
        plan = (s && s.length === PLANS[classe].length) ? s : copie(PLANS[classe]);
    }
    function sauver() { ecrireStock(CLE + classe, JSON.stringify(plan)); }

    function afficher() {
        var grille = $('pc-grille'), tableau = $('pc-tableau'), n = noms(), sansNom = 0;
        grille.innerHTML = '';
        var lignes = plan.map(function (_, i) { return i; });
        if (enHaut) lignes.reverse();
        lignes.forEach(function (r) {
            for (var t = 0; t < 3; t++) {
                var table = document.createElement('div');
                table.className = 'pc-table';
                var places = enHaut ? [2 * (2 - t) + 1, 2 * (2 - t)] : [2 * t, 2 * t + 1];
                places.forEach(function (c) {
                    var place = document.createElement('div');
                    place.className = 'pc-place';
                    var code = plan[r][c];
                    if (code) {
                        var e = document.createElement('div');
                        e.className = 'pc-eti ' + (FILLES.indexOf(code) >= 0 ? 'pc-f' : 'pc-g');
                        if (choisi && choisi[0] === r && choisi[1] === c) e.classList.add('pc-choisi');
                        e.draggable = true;
                        if (n[code]) { e.textContent = prenom(n[code]); e.title = n[code] + ' · ' + code; }
                        else { e.textContent = code.replace(/^[^-]*-/, ''); e.title = code; sansNom++; }
                        e.addEventListener('dragstart', function (ev) { ev.dataTransfer.setData('text/plain', r + ',' + c); e.classList.add('pc-glisse'); });
                        e.addEventListener('dragend', function () { e.classList.remove('pc-glisse'); });
                        place.appendChild(e);
                    }
                    place.addEventListener('dragover', function (ev) { ev.preventDefault(); place.classList.add('pc-survol'); });
                    place.addEventListener('dragleave', function () { place.classList.remove('pc-survol'); });
                    place.addEventListener('drop', function (ev) {
                        ev.preventDefault(); place.classList.remove('pc-survol');
                        var d = ev.dataTransfer.getData('text/plain').split(',').map(Number);
                        if (d.length === 2) echanger(d[0], d[1], r, c);
                    });
                    place.addEventListener('click', function () {
                        if (choisi) echanger(choisi[0], choisi[1], r, c);
                        else if (plan[r][c]) { choisi = [r, c]; afficher(); }
                    });
                    table.appendChild(place);
                });
                grille.appendChild(table);
            }
        });
        // tableau au-dessus ou au-dessous de la grille
        grille.parentNode.insertBefore(tableau, enHaut ? grille : grille.nextSibling);
        tableau.className = 'pc-tab ' + (enHaut ? 'pc-tab-haut' : 'pc-tab-bas');
        $('pc-etat').textContent = sansNom
            ? 'Noms non chargés : les codes s\'affichent. Chargez comptes-' + classe + '.csv (et cochez « mémoriser » dans l\'onglet Suivi QF pour ne pas avoir à le refaire).'
            : '';
    }

    function echanger(r0, c0, r1, c1) {
        choisi = null;
        if (r0 !== r1 || c0 !== c1) { var x = plan[r0][c0]; plan[r0][c0] = plan[r1][c1]; plan[r1][c1] = x; sauver(); }
        afficher();
    }

    function imprimer() {
        var w = window.open('', '_blank');
        if (!w) return;
        var styles = Array.prototype.map.call(document.querySelectorAll('style'), function (s) { return s.outerHTML; }).join('');
        var coul = $('pc-zone').classList.contains('pc-sans-couleur') ? ' pc-sans-couleur' : '';
        w.document.write('<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Plan de classe ' + classe + '</title>'
            + '<link rel="stylesheet" href="' + new URL('../style.css', location.href).href + '">' + styles
            + '<style>body{background:#fff;color:#000;padding:10mm;font-family:system-ui,sans-serif}@page{size:landscape;margin:10mm}.pc-place{border-style:solid}</style>'
            + '</head><body><h2>Plan de classe ' + classe + '</h2><div class="pc-zone' + coul + '">' + $('pc-zone').innerHTML + '</div></body></html>');
        w.document.close();
        setTimeout(function () { w.focus(); w.print(); }, 400);
    }

    window.PlanClasse = {
        afficher: function () { if (lance) afficher(); },
        demarrer: function () {
            if (lance) { afficher(); return; }
            lance = true;
            var sel = $('pc-classe');
            Object.keys(PLANS).forEach(function (k) { var o = document.createElement('option'); o.value = o.textContent = k; sel.appendChild(o); });
            classe = sel.value;
            enHaut = lireStock(CLE_VUE) !== 'bas';
            if (lireStock(CLE_COUL) === 'non') $('pc-zone').classList.add('pc-sans-couleur');
            sel.onchange = function () { classe = sel.value; choisi = null; charger(); afficher(); };
            $('pc-vue').onclick = function () { enHaut = !enHaut; ecrireStock(CLE_VUE, enHaut ? 'haut' : 'bas'); afficher(); };
            $('pc-couleurs').onclick = function () {
                var z = $('pc-zone'); z.classList.toggle('pc-sans-couleur');
                ecrireStock(CLE_COUL, z.classList.contains('pc-sans-couleur') ? 'non' : 'oui');
            };
            $('pc-reset').onclick = function () {
                if (!confirm('Revenir au plan enregistré sur le site ? Les déplacements faits ici seront perdus.')) return;
                plan = copie(PLANS[classe]); choisi = null; sauver(); afficher();
            };
            $('pc-imprimer').onclick = imprimer;
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && choisi) { choisi = null; afficher(); } });
            charger(); afficher();
        }
    };
})();
