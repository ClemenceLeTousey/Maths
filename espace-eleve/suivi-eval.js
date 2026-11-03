/* ==========================================================================
   Espace professeure · onglet « Suivi Eval »
   Bilan des évaluations à partir des CSV exportés par les grilles de notation
   (« DS1 - notes 2B.csv », « DS1 sujets C-D - notes 2H.csv », « Interro 3 - notes 2F.csv »…).
   Les fichiers sont lus sur cet ordinateur uniquement : aucune note n'est envoyée.
   ========================================================================== */
(function () {
    // Barème de chaque grille (repris de sa constante EXOS) : les colonnes « n.k » du CSV suivent cet ordre.
    // Question : [intitulé, points, bonus]
    var GRILLES = {
        'DS1': { evaluation: 'DS 1', sur: 20, sujets: 'Sujets A-B', ex: [
            { n: 1, comp: 'Calculer', qs: [['A (somme de fractions)', 1], ['B (produit puis différence)', 1], ['C (produit de puissances)', 0.5], ['D (puissances)', 1],
                ['E (racine d\'un produit)', 0.5], ['F (racine d\'une somme)', 0.5], ['Forme a√b', 1], ['Disque dur', 0.5], ['Écriture scientifique', 0.5, true], ['Cycliste', 1]] },
            { n: 2, comp: 'Calculer', qs: [['G(x)', 0.25], ['H(x)', 0.5], ['I(x) développer et réduire', 0.75], ['J(x) factoriser', 0.5]] },
            { n: 3, comp: 'Calculer', qs: [['K sous la forme k√2', 1], ['L sans radical au dénominateur', 0.5], ['M (priorités, quotient)', 1]] },
            { n: 4, comp: 'Raisonner', qs: [['Figure à main levée', 0.5], ['Premier parallélogramme', 1], ['Conclusion', 0.5]] },
            { n: 5, comp: 'Représenter', qs: [['a) origine', 0.25], ['b) image par translation', 0.25], ['a) deux vecteurs égaux', 0.5], ['b) un vecteur opposé', 0.5],
                ['c) même direction et sens', 0.5], ['Relation de Chasles', 0.5]] },
            { n: 6, comp: 'Programmer', qs: [['Tableau des variables', 0.5], ['Case cochée', 0.5], ['Fonction taxi', 1]] },
            { n: 7, comp: 'Représenter', qs: [['Point A\'', 0.5], ['u⃗ + v⃗ d\'origine C', 0.5], ['w⃗ − v⃗', 0.5], ['Point M', 0.5]] }
        ] },
        'DS1 sujets C-D': { evaluation: 'DS 1', sur: 20, sujets: 'Sujets C-D', ex: [
            { n: 1, comp: 'Calculer', qs: [['A (somme de fractions)', 1], ['B (produit puis différence)', 1], ['C (produit de puissances)', 0.5], ['D (puissances)', 1],
                ['E (racine d\'un produit)', 0.5], ['F (racine d\'une somme)', 0.5], ['Forme a√b', 1], ['Ferme solaire', 0.5], ['Écriture scientifique', 0.5, true], ['Potager', 1]] },
            { n: 2, comp: 'Calculer', qs: [['G(x)', 0.25], ['H(x)', 0.5], ['I(x) développer et réduire', 0.75], ['J(x) factoriser', 0.5]] },
            { n: 3, comp: 'Calculer', qs: [['K sous la forme k√2', 1], ['L sans radical au dénominateur', 0.5], ['M (priorités, quotient)', 1]] },
            { n: 4, comp: 'Raisonner', qs: [['Figure à main levée', 0.5], ['Translation', 0.5], ['Milieu', 0.5], ['Conclusion', 0.5]] },
            { n: 5, comp: 'Représenter', qs: [['a) origine', 0.25], ['b) image par translation', 0.25], ['a) deux vecteurs égaux', 0.5], ['b) un vecteur opposé', 0.5],
                ['c) même direction et sens', 0.5], ['Relation de Chasles', 0.5]] },
            { n: 6, comp: 'Programmer', qs: [['Tableau des variables', 0.5], ['Case cochée', 0.5], ['Fonction cinema', 1]] },
            { n: 7, comp: 'Représenter', qs: [['Point A\'', 0.5], ['u⃗ + v⃗ d\'origine C', 0.5], ['w⃗ − v⃗', 0.5], ['Point M', 0.5]] }
        ] },
        'Interro 3': { evaluation: 'Interro 3', sur: 10, ex: [
            { n: 1, comp: 'Calculer', qs: [['Équation ax + b = c', 1], ['Équation avec x des deux côtés', 2]] },
            { n: 2, comp: 'Représenter', qs: [['a. somme de deux vecteurs', 0.75], ['b. somme de deux vecteurs', 0.75], ['c. différence', 0.75], ['d. somme de trois vecteurs', 0.75],
                ['a. colinéaire, même sens', 0.5], ['b. colinéaire, sens opposé', 0.5]] },
            { n: 3, comp: 'Représenter', qs: [['a. AC⃗ en fonction de AB⃗', 0.75], ['b. BE⃗ en fonction de CA⃗', 0.75], ['a. Placer C', 0.75], ['b. Image de I par la translation', 0.75]] }
        ] }
    };
    var EVALUATIONS = [];   // dans l'ordre des grilles ci-dessus
    Object.keys(GRILLES).forEach(function (g) { if (EVALUATIONS.indexOf(GRILLES[g].evaluation) < 0) EVALUATIONS.push(GRILLES[g].evaluation); });

    var CLE = 'suivi-eval-fichiers';
    var CLASSES_EN_TETE = ['2B', '2F', '2H'];
    var fichiers = {};   // 'grille|classe' -> { nom, texte }
    var $ = function (id) { return document.getElementById(id); };
    var lance = false;

    function esc(t) { return String(t).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
    function fmt(x) { return (Math.round(x * 100) / 100).toString().replace('.', ','); }
    function niveau(r) { return r >= 0.75 ? 'n-bon' : r >= 0.5 ? 'n-moyen' : 'n-faible'; }
    function pct(r) { return Math.round(100 * r) + ' %'; }
    function parNom(a, b) { return a.localeCompare(b, 'fr', { sensitivity: 'base' }); }

    /* ---------- Lecture des CSV des grilles ---------- */
    // « DS1 sujets C-D - notes 2H.csv », éventuellement renommé « … (1).csv » par le navigateur
    function reconnaitre(nom) {
        var m = /^(.+?) - notes (\S+?)(?: \(\d+\))?\.csv$/i.exec(nom.trim());
        if (!m || !GRILLES[m[1]]) return null;
        return { grille: m[1], classe: m[2].toUpperCase() };
    }

    function lignesCSV(texte) {
        var lignes = [], ligne = [], champ = '', guillemets = false;
        texte = texte.replace(/^﻿/, '');
        for (var i = 0; i < texte.length; i++) {
            var c = texte[i];
            if (guillemets) {
                if (c === '"' && texte[i + 1] === '"') { champ += '"'; i++; }
                else if (c === '"') guillemets = false;
                else champ += c;
            } else if (c === '"') guillemets = true;
            else if (c === ';') { ligne.push(champ); champ = ''; }
            else if (c === '\n' || c === '\r') {
                if (c === '\r' && texte[i + 1] === '\n') i++;
                ligne.push(champ); lignes.push(ligne); ligne = []; champ = '';
            } else champ += c;
        }
        if (champ || ligne.length) { ligne.push(champ); lignes.push(ligne); }
        return lignes.filter(function (l) { return l.some(function (x) { return x.trim(); }); });
    }

    function nombre(t) { var v = parseFloat(String(t).replace(',', '.')); return isNaN(v) ? null : v; }

    // copies d'un fichier : [{ nom, sujet, notes: { '1.2': { v, nf } }, total, erreurs: [{ q, texte }], remarque }]
    function copies(grille, texte) {
        var l = lignesCSV(texte);
        if (!l.length) return [];
        var tete = l[0].map(function (h) { return h.trim(); }), col = {};
        tete.forEach(function (h, i) {
            var q = /^(\d+\.\d+)( bonus)?$/.exec(h);
            if (q) col[q[1]] = i;
            else if (/^Élève$/i.test(h)) col.nom = i;
            else if (/^Sujet$/i.test(h)) col.sujet = i;
            else if (/^Total/i.test(h)) col.total = i;
            else if (/^Erreurs/i.test(h)) col.erreurs = i;
            else if (/^Remarque$/i.test(h)) col.remarque = i;
        });
        return l.slice(1).map(function (r) {
            var c = { grille: grille, nom: (r[col.nom] || '').trim(), sujet: (r[col.sujet] || '').trim(), notes: {}, erreurs: [],
                      remarque: col.remarque != null ? (r[col.remarque] || '').trim() : '' };
            var notees = 0;
            GRILLES[grille].ex.forEach(function (e) {
                e.qs.forEach(function (q, k) {
                    var cle = e.n + '.' + (k + 1), brut = col[cle] != null ? r[col[cle]] || '' : '';
                    var v = nombre(brut), nf = /NF/.test(brut);
                    if (v != null || nf) { c.notes[cle] = { v: v, nf: nf }; if (v != null) notees++; }
                });
            });
            c.total = notees ? nombre(r[col.total]) : null;
            if (c.total == null && notees) c.total = Object.keys(c.notes).reduce(function (s, k) { return s + (c.notes[k].v || 0); }, 0);
            if (col.erreurs != null) (r[col.erreurs] || '').split(' | ').forEach(function (bloc) {
                var m = /^(\d+\.\d+) : (.*)$/.exec(bloc.trim());
                if (m) m[2].split(' ; ').forEach(function (t) { if (t.trim()) c.erreurs.push({ q: m[1], texte: t.trim() }); });
            });
            return c;
        }).filter(function (c) { return c.nom || c.total != null; });
    }

    /* ---------- Données de la classe choisie ---------- */
    function classes() {
        var vues = [];
        Object.keys(fichiers).forEach(function (k) { var c = k.split('|')[1]; if (vues.indexOf(c) < 0) vues.push(c); });
        return vues.sort(function (a, b) {
            var ia = CLASSES_EN_TETE.indexOf(a), ib = CLASSES_EN_TETE.indexOf(b);
            if (ia < 0) ia = 99; if (ib < 0) ib = 99;
            return ia - ib || a.localeCompare(b, 'fr');
        });
    }

    // { évaluation: { grilles: { grille: [copies] }, eleves: { nom: copie } } }
    function donneesClasse(classe) {
        var d = {};
        Object.keys(fichiers).forEach(function (k) {
            var p = k.split('|'), grille = p[0];
            if (p[1] !== classe) return;
            var ev = GRILLES[grille].evaluation;
            d[ev] = d[ev] || { grilles: {}, eleves: {} };
            var liste = copies(grille, fichiers[k].texte);
            d[ev].grilles[grille] = liste;
            liste.forEach(function (c) {
                var avant = d[ev].eleves[c.nom];
                if (!avant || (avant.total == null && c.total != null)) d[ev].eleves[c.nom] = c;   // un élève noté sur l'une des deux grilles
            });
        });
        return d;
    }

    /* ---------- Affichage ---------- */
    function afficher() {
        var sel = $('se-classe'), avant = sel.value, liste = classes();
        sel.innerHTML = '';
        liste.forEach(function (c) { var o = document.createElement('option'); o.textContent = c; sel.appendChild(o); });
        if (liste.indexOf(avant) >= 0) sel.value = avant;
        var n = Object.keys(fichiers).length;
        $('se-fichiers').textContent = n ? n + ' fichier(s) : ' + Object.keys(fichiers).map(function (k) { return fichiers[k].nom; }).sort().join(', ') + '.' : '';
        $('se-oublier').hidden = !n;
        var zone = $('se-bilan');
        if (!liste.length) {
            zone.innerHTML = '<p class="aide">Aucune grille chargée. Dans chaque grille de notation, choisissez la classe puis « Exporter » en CSV, et chargez ici les fichiers obtenus (ex. <code>DS1 - notes 2B.csv</code>, <code>Interro 3 - notes 2F.csv</code>).</p>';
            return;
        }
        var d = donneesClasse(sel.value), evs = EVALUATIONS.filter(function (e) { return d[e]; });
        zone.innerHTML = tableauBilan(d, evs) + evs.map(function (e, i) { return detailEvaluation(e, d[e], i === 0); }).join('');
        $('se-eleve').innerHTML = '';
    }

    function surDe(ev) { for (var g in GRILLES) if (GRILLES[g].evaluation === ev) return GRILLES[g].sur; return 20; }

    function tableauBilan(d, evs) {
        var noms = [];
        evs.forEach(function (e) { Object.keys(d[e].eleves).forEach(function (nm) { if (nm && noms.indexOf(nm) < 0) noms.push(nm); }); });
        noms.sort(parNom);
        var h = '<h3>Bilan de la classe</h3><p class="aide">Cliquer sur une note pour voir la copie de l\'élève. Moyenne ramenée sur 20.</p>' +
                '<div class="tableau-defile"><table class="res se-table"><tr><th>Élève</th>' +
                evs.map(function (e) { return '<th>' + esc(e) + ' <span class="n-tent">/' + surDe(e) + '</span></th>'; }).join('') + '<th>Moyenne /20</th></tr>';
        noms.forEach(function (nm) {
            var ratios = [];
            h += '<tr><td>' + esc(nm) + '</td>' + evs.map(function (e) {
                var c = d[e].eleves[nm];
                if (!c || c.total == null) return '<td class="n-tent" title="Pas de note">—</td>';
                var r = c.total / surDe(e); ratios.push(r);
                return '<td class="cliquable ' + niveau(r) + '" data-ev="' + esc(e) + '" data-nom="' + esc(nm) + '" title="' + esc(c.sujet ? 'Sujet ' + c.sujet : '') + '">' + fmt(c.total) + '</td>';
            }).join('');
            var m = ratios.length ? ratios.reduce(function (s, r) { return s + r; }, 0) / ratios.length : null;
            h += m == null ? '<td>—</td>' : '<td class="' + niveau(m) + '"><b>' + fmt(Math.round(m * 200) / 10) + '</b></td>';
            h += '</tr>';
        });
        h += '<tr><td>Moyenne de la classe</td>' + evs.map(function (e) {
            var t = Object.keys(d[e].eleves).map(function (k) { return d[e].eleves[k].total; }).filter(function (x) { return x != null; });
            if (!t.length) return '<td>—</td>';
            var m = t.reduce(function (s, x) { return s + x; }, 0) / t.length;
            return '<td class="' + niveau(m / surDe(e)) + '">' + fmt(Math.round(m * 10) / 10) + ' <span class="n-tent">(' + t.length + ' cop.)</span></td>';
        }).join('') + '<td></td></tr>';
        return h + '</table></div>';
    }

    function stats(totaux) {
        var t = totaux.slice().sort(function (a, b) { return a - b; }), n = t.length;
        return { n: n, moy: t.reduce(function (s, x) { return s + x; }, 0) / n, med: n % 2 ? t[(n - 1) / 2] : (t[n / 2 - 1] + t[n / 2]) / 2, min: t[0], max: t[n - 1] };
    }

    function detailEvaluation(ev, de, ouvert) {
        var totaux = Object.keys(de.eleves).map(function (k) { return de.eleves[k].total; }).filter(function (x) { return x != null; });
        var sur = surDe(ev), s = totaux.length ? stats(totaux) : null;
        var h = '<details class="se-eval"' + (ouvert ? ' open' : '') + '><summary><b>' + esc(ev) + '</b> · ' +
                (s ? 'moyenne ' + fmt(Math.round(s.moy * 10) / 10) + '/' + sur + ' · médiane ' + fmt(s.med) + ' · de ' + fmt(s.min) + ' à ' + fmt(s.max) + ' · ' + s.n + ' copie(s)' : 'aucune copie notée') +
                '</summary>';
        var grilles = Object.keys(de.grilles);
        grilles.forEach(function (g) {
            var liste = de.grilles[g].filter(function (c) { return c.total != null; });
            if (!liste.length) return;
            if (grilles.length > 1 || GRILLES[g].sujets) h += '<h4>' + esc(GRILLES[g].sujets || g) + ' · ' + liste.length + ' copie(s)</h4>';
            h += '<div class="tableau-defile"><table class="res se-table"><tr><th>Question</th><th>Barème</th><th>Réussite</th><th>Notées</th><th>NF</th></tr>';
            GRILLES[g].ex.forEach(function (e) {
                var ptsEx = 0, maxEx = 0;
                var lignes = e.qs.map(function (q, k) {
                    var cle = e.n + '.' + (k + 1), notes = liste.map(function (c) { return c.notes[cle]; }).filter(Boolean);
                    var valeurs = notes.filter(function (x) { return x.v != null; }), nf = notes.filter(function (x) { return x.nf; }).length;
                    var somme = valeurs.reduce(function (sm, x) { return sm + x.v; }, 0), r = valeurs.length ? somme / (valeurs.length * q[1]) : null;
                    if (!q[2]) { ptsEx += somme; maxEx += valeurs.length * q[1]; }
                    return '<tr><td>' + cle + ' · ' + esc(q[0]) + (q[2] ? ' <span class="n-tent">(bonus)</span>' : '') + '</td><td>' + fmt(q[1]) + '</td>' +
                           (r == null ? '<td>—</td>' : '<td><span class="se-barre ' + niveau(r) + '"><i style="width:' + Math.round(100 * Math.min(r, 1)) + '%"></i></span> ' + pct(r) + '</td>') +
                           '<td>' + valeurs.length + '</td><td>' + (nf || '') + '</td></tr>';
                });
                var rEx = maxEx ? ptsEx / maxEx : null;
                h += '<tr class="se-ex"><th colspan="2">Exercice ' + e.n + ' · ' + esc(e.comp) + '</th><th colspan="3">' + (rEx == null ? '' : pct(rEx)) + '</th></tr>' + lignes.join('');
            });
            h += '</table></div>';
            // erreurs les plus fréquentes (grilles qui les exportent)
            var compte = {};
            liste.forEach(function (c) {
                var vues = {};
                c.erreurs.forEach(function (x) { var k = x.q + ' · ' + x.texte; if (!vues[k]) { vues[k] = 1; compte[k] = (compte[k] || 0) + 1; } });
            });
            var top = Object.keys(compte).sort(function (a, b) { return compte[b] - compte[a]; }).slice(0, 10);
            if (top.length) h += '<p class="aide se-erreurs-t">Erreurs les plus fréquentes</p><ul class="se-erreurs">' +
                top.map(function (k) { return '<li><b>' + compte[k] + '</b> élève(s) · ' + esc(k) + '</li>'; }).join('') + '</ul>';
        });
        return h + '</details>';
    }

    function copieEleve(ev, nom) {
        var d = donneesClasse($('se-classe').value), c = d[ev] && d[ev].eleves[nom];
        if (!c) return;
        var g = GRILLES[c.grille];
        var h = '<div class="tentative"><h3>' + esc(nom) + ' · ' + esc(ev) + ' · ' + fmt(c.total) + '/' + g.sur + (c.sujet ? ' · sujet ' + esc(c.sujet) : '') + '</h3><ol>';
        g.ex.forEach(function (e) {
            e.qs.forEach(function (q, k) {
                var cle = e.n + '.' + (k + 1), n = c.notes[cle], err = c.erreurs.filter(function (x) { return x.q === cle; }).map(function (x) { return x.texte; });
                var r = n && n.v != null ? n.v / q[1] : null;
                h += '<li value="' + (k + 1) + '"><b>' + cle + '</b> ' + esc(q[0]) + ' : <span class="rep ' + (r == null ? '' : r >= 1 ? 'ok' : r > 0 ? '' : 'ko') + '">' +
                     (n && n.v != null ? fmt(n.v) : '—') + '/' + fmt(q[1]) + (n && n.nf ? ' NF' : '') + '</span>' +
                     (err.length ? ' <span class="aide">· ' + esc(err.join(' ; ')) + '</span>' : '') + '</li>';
            });
        });
        h += '</ol>' + (c.remarque ? '<p><b>Remarque :</b> ' + esc(c.remarque) + '</p>' : '') + '</div>';
        $('se-eleve').innerHTML = h;
        $('se-eleve').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* ---------- Fichiers ---------- */
    function memoriser() {
        try {
            if ($('se-memoriser').checked) localStorage.setItem(CLE, JSON.stringify(fichiers));
            else localStorage.removeItem(CLE);
        } catch (e) { $('se-etat').textContent = 'Fichiers trop volumineux pour être mémorisés sur cet ordinateur.'; }
    }

    function ajouter(liste) {
        var refuses = [];
        Promise.all(liste.map(function (f) { return f.text().then(function (t) { return { f: f, t: t }; }); })).then(function (lus) {
            lus.forEach(function (x) {
                var r = reconnaitre(x.f.name);
                if (!r) { refuses.push(x.f.name); return; }
                fichiers[r.grille + '|' + r.classe] = { nom: x.f.name.replace(/ \(\d+\)(\.csv)$/i, '$1'), texte: x.t };
                $('se-classe').dataset.voulue = r.classe;
            });
            $('se-etat').textContent = refuses.length ? 'Fichier(s) non reconnu(s) : ' + refuses.join(', ') + '. Les noms attendus sont ceux des exports des grilles, par exemple « Interro 3 - notes 2B.csv ».' : '';
            memoriser(); afficher();
            var voulue = $('se-classe').dataset.voulue;
            if (voulue && classes().indexOf(voulue) >= 0) { $('se-classe').value = voulue; afficher(); }
        });
    }

    window.SuiviEval = {
        demarrer: function () {
            if (lance) return;
            lance = true;
            try {
                var gardes = JSON.parse(localStorage.getItem(CLE));
                if (gardes) { fichiers = gardes; $('se-memoriser').checked = true; }
            } catch (e) {}
            $('se-csv').onchange = function (e) { ajouter(Array.from(e.target.files)); e.target.value = ''; };
            $('se-memoriser').onchange = memoriser;
            $('se-classe').onchange = afficher;
            $('se-oublier').onclick = function () {
                fichiers = {};
                try { localStorage.removeItem(CLE); } catch (e) {}
                afficher();
            };
            $('se-bilan').onclick = function (e) {
                var td = e.target.closest('td[data-ev]');
                if (td) copieEleve(td.dataset.ev, td.dataset.nom);
            };
            afficher();
        }
    };
})();
