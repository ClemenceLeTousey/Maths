/* ==========================================================================
   Espace professeure · onglet « Groupes »
   Groupes de travail établis pour chaque classe. Déplacer un élève : le glisser sur
   un autre groupe, ou cliquer sur l'élève puis sur le groupe voulu (tablette).
   Chaque déplacement est enregistré dans la base (codes élèves seulement) ; les noms
   viennent des fichiers comptes-*.csv chargés dans l'onglet Comptes.
   « Projeter » ouvre les groupes en grand caractères pour la classe.
   « Au hasard » tire un élève dans chaque groupe (surligné ici et sur la projection).
   Nécessite le script maj-groupes.sql dans Supabase.
   ========================================================================== */
var Groupes = (function () {
    var liste = null, erreur = '', classe = '', choisi = null;
    var tirage = {}, fen = null, roule = null;   // tirage : { numéro de groupe: code tiré }
    var $ = function (id) { return document.getElementById(id); };

    function mdpProf() { try { return sessionStorage.getItem('interactif-prof'); } catch (e) { return null; } }
    function esc(t) { return String(t).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
    function noms() { return window.interactifNoms ? window.interactifNoms() : {}; }
    function etat(t) { $('gr-etat').textContent = t || ''; }

    // « MELIN--JULIEN Camille » -> { prenom: 'Camille', nom: 'MELIN--JULIEN' } (mots en capitales = nom)
    function decouper(code) {
        var n = noms()[code];
        if (!n) return { prenom: '', nom: code, tri: code };
        var mots = n.split(/\s+/), nom = [], prenom = [];
        mots.forEach(function (m) { (/[a-zà-ÿ]/.test(m) ? prenom : nom).push(m); });
        return { prenom: prenom.join(' '), nom: nom.join(' '), tri: prenom.join(' ') + ' ' + nom.join(' ') };
    }
    function etiquette(code) {
        var d = decouper(code);
        return d.prenom ? esc(d.prenom) + ' <span class="gr-nom">' + esc(d.nom) + '</span>' : esc(d.nom);
    }

    // Élèves de la classe : comptes de la base (suivi) + élèves déjà placés
    function elevesClasse(c) {
        var codes = {}, d = window.interactifDonnees ? window.interactifDonnees() : null;
        if (d) d.eleves.forEach(function (e) { if (e.classe === c) codes[e.code] = true; });
        liste.forEach(function (r) { if (r.classe === c) codes[r.code] = true; });
        return Object.keys(codes);
    }
    function groupeDe(code) {
        var r = liste.filter(function (x) { return x.code === code; })[0];
        return r ? r.groupe : null;
    }
    function classes() {
        var s = {}, d = window.interactifDonnees ? window.interactifDonnees() : null;
        liste.forEach(function (r) { s[r.classe] = true; });
        if (d) d.eleves.forEach(function (e) { if (/^2/.test(e.classe)) s[e.classe] = true; });
        return Object.keys(s).sort();
    }
    // { numéro: [codes] } et la liste des élèves sans groupe, triés par prénom
    function repartition(c) {
        var g = {}, sans = [];
        elevesClasse(c).forEach(function (code) {
            var n = groupeDe(code);
            if (n == null) sans.push(code); else (g[n] = g[n] || []).push(code);
        });
        var tri = function (a, b) { return decouper(a).tri.localeCompare(decouper(b).tri, 'fr'); };
        Object.keys(g).forEach(function (k) { g[k].sort(tri); });
        sans.sort(tri);
        return { g: g, sans: sans };
    }

    function peindre() {
        var zone = $('gr-groupes');
        if (liste == null) { zone.innerHTML = '<p class="aide">' + esc(erreur || 'Chargement…') + '</p>'; return; }
        var cl = classes();
        if (!classe || cl.indexOf(classe) < 0) classe = cl.filter(function (c) { return liste.some(function (r) { return r.classe === c; }); })[0] || cl[0] || '';
        $('gr-classes').innerHTML = cl.map(function (c) {
            return '<button type="button" data-c="' + esc(c) + '" aria-pressed="' + (c === classe) + '">' + esc(c) + '</button>';
        }).join('');
        Array.prototype.forEach.call($('gr-classes').children, function (b) { b.onclick = function () { classe = b.dataset.c; choisi = null; tirage = {}; peindre(); }; });

        var r = repartition(classe), nums = Object.keys(r.g).map(Number).sort(function (a, b) { return a - b; });
        var suivant = (nums.length ? nums[nums.length - 1] : 0) + 1;
        var carte = function (num, titre, codes, cls) {
            return '<section class="gr-carte ' + (cls || '') + '" data-g="' + num + '">' +
                '<h3>' + titre + (codes.length ? ' <span class="gr-nb">' + codes.length + '</span>' : '') + '</h3>' +
                codes.map(function (code) {
                    return '<button type="button" class="gr-eleve' + (code === choisi ? ' gr-choisi' : '') + (num !== '' && tirage[num] === code ? ' gr-tire' : '') + '" draggable="true" data-code="' + esc(code) + '" title="' + esc(code) + '">' + etiquette(code) + '</button>';
                }).join('') + '</section>';
        };
        var html = '<div class="gr-grille">' + nums.map(function (n) { return carte(n, 'Groupe ' + n, r.g[n]); }).join('') +
            carte(suivant, '+ Nouveau groupe', [], 'gr-nouveau') + '</div>' +
            carte('', 'Sans groupe', r.sans, 'gr-sans');
        if (!nums.length) html = '<p class="aide">Pas de groupes établis pour la ' + esc(classe) + ' : glisser des élèves sur « + Nouveau groupe » pour en créer.</p>' + html;
        if (!Object.keys(noms()).length) html += '<p class="aide">Pour voir les noms, chargez les fichiers comptes-*.csv dans l\'onglet Comptes.</p>';
        zone.innerHTML = html;
        brancher(zone);
    }

    function brancher(zone) {
        Array.prototype.forEach.call(zone.querySelectorAll('.gr-eleve'), function (b) {
            b.ondragstart = function (e) { e.dataTransfer.setData('text/plain', b.dataset.code); e.dataTransfer.effectAllowed = 'move'; b.classList.add('gr-drag'); };
            b.ondragend = function () { b.classList.remove('gr-drag'); };
            b.onclick = function (e) {
                e.stopPropagation();
                choisi = (choisi === b.dataset.code) ? null : b.dataset.code;
                peindre();
                etat(choisi ? 'Cliquer sur le groupe où placer ' + (noms()[choisi] || choisi) + ' (Échap pour annuler).' : '');
            };
        });
        Array.prototype.forEach.call(zone.querySelectorAll('.gr-carte'), function (c) {
            c.ondragover = function (e) { e.preventDefault(); c.classList.add('gr-survol'); };
            c.ondragleave = function () { c.classList.remove('gr-survol'); };
            c.ondrop = function (e) { e.preventDefault(); c.classList.remove('gr-survol'); deplacer(e.dataTransfer.getData('text/plain'), c.dataset.g); };
            c.onclick = function () { if (choisi) deplacer(choisi, c.dataset.g); };
        });
    }

    function deplacer(code, g) {
        choisi = null;
        if (!code) return;
        var num = g === '' ? null : Number(g);
        if (groupeDe(code) === num) { etat(''); peindre(); return; }
        var r = liste.filter(function (x) { return x.code === code; })[0];
        var avant = r ? r.groupe : null;
        if (r) r.groupe = num; else liste.push(r = { code: code, classe: classe, groupe: num, origine: null });
        peindre();
        etat('Enregistrement…');
        Interactif.rpc('prof_placer_groupe', { p_mdp: mdpProf(), p_code: code, p_groupe: num }).then(function () {
            etat((noms()[code] || code) + ' → ' + (num == null ? 'sans groupe' : 'groupe ' + num) + ' · enregistré ✓');
        }, function (x) {
            r.groupe = avant; peindre();
            etat('Erreur : ' + x.message);
        });
    }

    function projeter() {
        var r = repartition(classe), nums = Object.keys(r.g).map(Number).sort(function (a, b) { return a - b; });
        if (!nums.length) { etat('Aucun groupe à projeter.'); return; }
        if (!fen || fen.closed) fen = window.open('', '_blank');
        if (!fen) { etat('Fenêtre bloquée par le navigateur.'); return; }
        ecrireProjection(fen, r, nums);
        fen.focus();
    }
    function ecrireProjection(w, r, nums) {
        var cols = nums.length > 8 ? 5 : 4, lignes = Math.ceil(nums.length / cols);
        var corps = nums.map(function (n) {
            return '<section class="groupe"><div class="num">Groupe ' + n + '</div>' +
                r.g[n].map(function (c) { return '<div class="eleve' + (tirage[n] === c ? ' tire' : '') + '">' + etiquette(c).replace('gr-nom', 'n') + '</div>'; }).join('') + '</section>';
        }).join('');
        w.document.open();
        w.document.write('<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Groupes – ' + esc(classe) + '</title>' +
            '<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600&display=swap" rel="stylesheet"><style>' +
            '*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}' +
            'body{background:#f7f6f2;color:#1f2328;font-family:"Source Sans 3","Helvetica Neue",Arial,sans-serif;display:flex;flex-direction:column;padding:2.5vh 3vw;gap:2.5vh}' +
            'h1{font-weight:500;font-size:clamp(1.6rem,4.2vh,3rem);text-align:center}' +
            '.grid{flex:1;display:grid;grid-template-columns:repeat(' + cols + ',1fr);grid-template-rows:repeat(' + lignes + ',1fr);gap:2vh 2vw;min-height:0}' +
            '.groupe{background:#fff;border:1px solid #dcd9d0;border-top:.6vh solid #2f5d8a;border-radius:10px;padding:1.4vh 1.4vw;display:flex;flex-direction:column;justify-content:center;gap:.6vh;min-width:0}' +
            '.num{font-size:clamp(.9rem,2.3vh,1.6rem);color:#2f5d8a;font-weight:500;margin-bottom:.4vh}' +
            '.eleve{border-radius:8px;padding:0 .5vw;font-size:clamp(1rem,' + (lignes > 2 ? '2.8' : '3.4') + 'vh,2.4rem);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.eleve .n{color:#6a6f76}' +
            '.eleve.tire{background:#fff3bf;outline:.35vh solid #e8a200;font-weight:600}.eleve.tire::before{content:"★ ";color:#e8a200}' +
            '</style></head><body><h1>Groupes – ' + esc(classe) + '</h1><main class="grid">' + corps + '</main></body></html>');
        w.document.close();
    }

    // Un élève au hasard dans chaque groupe (courte animation, en évitant si possible le même que la fois d'avant)
    function auHasard() {
        var r = repartition(classe), nums = Object.keys(r.g).map(Number);
        if (!nums.length) { etat('Aucun groupe pour tirer au sort.'); return; }
        if (roule) clearInterval(roule);
        var avant = tirage, tours = 0;
        var tirer = function (final) {
            var t = {};
            nums.forEach(function (n) {
                var codes = r.g[n];
                if (final && codes.length > 1) codes = codes.filter(function (c) { return c !== avant[n]; });
                t[n] = codes[Math.floor(Math.random() * codes.length)];
            });
            return t;
        };
        var montrer = function () {
            peindre();
            if (fen && !fen.closed) ecrireProjection(fen, r, nums.slice().sort(function (a, b) { return a - b; }));
        };
        roule = setInterval(function () {
            tours++;
            if (tours < 10) { tirage = tirer(false); montrer(); return; }
            clearInterval(roule); roule = null;
            tirage = tirer(true); montrer();
            etat('Tirage au sort : ' + nums.sort(function (a, b) { return a - b; }).map(function (n) {
                var d = decouper(tirage[n]); return 'G' + n + ' ' + (d.prenom || d.nom);
            }).join(' · '));
        }, 90);
    }

    function charger() {
        var mdp = mdpProf();
        if (!mdp) { liste = null; erreur = 'Reconnectez-vous à l\'espace professeure.'; peindre(); return; }
        Interactif.rpc('prof_groupes', { p_mdp: mdp }).then(function (l) { liste = l || []; erreur = ''; peindre(); }, function (x) {
            liste = null;
            erreur = 'Groupes indisponibles (' + x.message + ')' + (/prof_groupes/.test(x.message) ? ' : lancer maj-groupes.sql dans Supabase.' : '.');
            peindre();
        });
    }

    var lance = false;
    function demarrer() {
        if (!lance) {
            lance = true;
            var st = document.createElement('style');
            st.textContent =
                '#gr-classes { display: inline-flex; gap: 4px; }' +
                '#gr-classes button[aria-pressed="true"] { background: var(--c-seconde); color: #fff; border-color: var(--c-seconde); }' +
                '.gr-grille { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-bottom: 10px; }' +
                '.gr-carte { border: 1px solid var(--line); border-top: 4px solid var(--c-seconde); border-radius: 10px; padding: 8px 10px 10px; background: var(--surface); display: flex; flex-direction: column; gap: 4px; min-height: 90px; cursor: default; }' +
                '.gr-carte h3 { margin: 0 0 2px; font-size: 0.95rem; color: var(--c-seconde); display: flex; align-items: center; gap: 6px; }' +
                '.gr-nb { font-size: 0.75rem; font-weight: 600; color: var(--muted); border: 1px solid var(--line); border-radius: 99px; padding: 0 7px; }' +
                '.gr-nouveau { border-style: dashed; border-top-style: dashed; opacity: .8; }' +
                '.gr-nouveau h3 { color: var(--muted); }' +
                '.gr-sans { border-top-color: #868E96; flex-direction: row; flex-wrap: wrap; align-items: flex-start; }' +
                '.gr-sans h3 { width: 100%; color: var(--muted); }' +
                '.gr-eleve { font: inherit; text-align: left; border: 1px solid var(--line); background: var(--bg, #fff); color: var(--text); border-radius: 6px; padding: 3px 8px; cursor: grab; }' +
                '.gr-eleve:hover { border-color: var(--c-seconde); }' +
                '.gr-nom { color: var(--muted); }' +
                '.gr-choisi { outline: 2px solid var(--c-seconde); background: var(--bleu-doux, #EAF3FC); }' +
                '.gr-drag { opacity: .4; }' +
                '.gr-tire { background: #FFF3BF; border-color: #E8A200; outline: 2px solid #E8A200; font-weight: 600; }' +
                '.gr-tire::before { content: "★ "; color: #E8A200; }' +
                '.gr-survol { background: var(--bleu-doux, #EAF3FC); border-color: var(--c-seconde); }';
            document.head.appendChild(st);
            $('gr-projeter').onclick = projeter;
            $('gr-hasard').onclick = auHasard;
            $('gr-actualiser').onclick = charger;
            $('gr-retablir').onclick = function () {
                if (!confirm('Remettre la ' + classe + ' dans les groupes établis ? Les déplacements faits depuis seront perdus.')) return;
                etat('Enregistrement…');
                Interactif.rpc('prof_retablir_groupes', { p_mdp: mdpProf(), p_classe: classe }).then(function () { etat('Groupes établis rétablis ✓'); charger(); },
                    function (x) { etat('Erreur : ' + x.message); });
            };
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && choisi) { choisi = null; etat(''); peindre(); }
            });
        }
        charger();
    }

    return { demarrer: demarrer, peindre: function () { if (liste) peindre(); } };
})();
