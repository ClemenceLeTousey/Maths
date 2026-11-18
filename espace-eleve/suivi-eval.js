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
        'Interro 3': { evaluation: 'Interro 3', sur: 10,
            objs: [['Équations', 'Résoudre une équation du premier degré.'], ['Obj. 4', 'Somme de deux vecteurs et relation de Chasles.'],
                   ['Obj. 5', 'Produit d\'un vecteur par un nombre réel et colinéarité.']], ex: [
            { n: 1, comp: 'Calculer', qs: [['Équation ax + b = c', 1], ['Équation avec x des deux côtés', 2]] },
            { n: 2, comp: 'Représenter', qs: [['a. somme de deux vecteurs', 0.75], ['b. somme de deux vecteurs', 0.75], ['c. différence', 0.75], ['d. somme de trois vecteurs', 0.75],
                ['a. colinéaire, même sens', 0.5], ['b. colinéaire, sens opposé', 0.5]] },
            { n: 3, comp: 'Représenter', qs: [['a. AC⃗ en fonction de AB⃗', 0.75], ['b. BE⃗ en fonction de CA⃗', 0.75], ['a. Placer C', 0.75], ['b. Image de I par la translation', 0.75]] }
        ] },
        'Interro 4': { evaluation: 'Interro 4', sur: 10,
            objs: [['Obj. 4', 'Reconnaître et utiliser une identité remarquable pour développer.'], ['Obj. 5', 'Factoriser avec une identité remarquable.']], ex: [
            { n: 1, comp: 'Communiquer', qs: [['Les trois identités remarquables', 1.5]] },
            { n: 2, comp: 'Calculer', qs: [['QCM : forme développée (ligne 1)', 0.5], ['QCM : forme développée (ligne 2)', 0.5], ['QCM : forme factorisée (ligne 3)', 0.5],
                ['QCM : forme factorisée (ligne 4)', 0.5], ['QCM : forme factorisée (ligne 5)', 0.5]] },
            { n: 3, comp: 'Calculer', qs: [['Développer A', 0.75], ['Développer B', 1], ['Développer C', 1.25]] },
            { n: 4, comp: 'Calculer', qs: [['Factoriser D', 1.5], ['Factoriser E', 1.5]] },
            { n: 'bonus', comp: 'Calculer', qs: [['Développer F', 0.5, true], ['Développer G', 0.5, true], ['Factoriser H', 0.5, true], ['Factoriser I', 0.5, true]] }
        ] },
        // Évaluations d'automatismes (CSV préparés par Claude à partir des copies scannées).
        // Niveau 1 noté sur 9 ; niveaux 2 et 3 hors note : colonnes « Étoiles » (bleue = 2, rouge = 3) et « Étoiles détail ».
        // Question : [intitulé, points, bonus, énoncé (montré à l'élève), figure (chemin depuis espace-eleve/)]
        'Auto S8': { evaluation: 'Automatismes S8', sur: 9, ex: [
            { n: 1, comp: 'Automatismes · niveau 1', qs: [
                ['Q1 Identités remarquables (QCM)', 1, false, 'Le développement de (x − 3)² est :\nA. x² − 9    B. x² + 6x + 9    C. x² − 6x + 9    D. x² − 6x − 9'],
                ['Q2 Puissances', 1, false, 'Écrire sous la forme d\'une seule puissance de 4 : 4³ / 4⁻²'],
                ['Q3 Proportions', 1, false, 'Calculer 15 % de 460.'],
                ['Q4 Vecteurs, Chasles (QCM)', 1, false, 'EF→ + CE→ + FG→ est égal à :\nA. GC→    B. CG→    C. EG→    D. CF→'],
                ['Q5 Repère orthogonal', 1, false, 'Lire les coordonnées du point A.', 'seconde/img/s8-q5.svg'],
                ['Q6 Ordre de grandeur', 1, false, 'Donner un ordre de grandeur de 49,6 % de 2 030.'],
                ['Q7 Algo if / else (QCM)', 1, false, 'Qu\'affiche ce script ?\na = 15\nb = 9\nif a > b:\n    a = a - b\nelse:\n    b = b - a\nprint(a, b)\nA. 15  −6    B. 9  6    C. 15  9    D. 6  9'],
                ['Q8 Images et antécédents', 1, false, 'Soit f la fonction définie par f(x) = −5x + 2. Calculer f(−3).'],
                ['Q9 Comparer deux nombres', 1, false, 'Ranger dans l\'ordre croissant : 2,36 ; 9/4 ; 23 × 10⁻¹ ; 2,305']] }
            ],
            // énoncés des questions bonus, associés aux lignes « Bonus lus » (« Q1★★ : … »)
            bonus: {
                'Q1★★': 'Développer et réduire : A = (2x + 5)²', 'Q1★★★': 'Factoriser : B = 9x² − 49',
                'Q2★★': 'Écrire sous la forme d\'une seule puissance de 3 : (3⁻²)³ × 3⁵ / 3⁻⁴', 'Q2★★★': 'Écrire sous la forme 2ᵃ × 5ᵇ : C = 10³ / (2² × 5)',
                'Q3★★': 'Calculer 65 % de 140.', 'Q3★★★': 'Dans un club de 480 adhérents, 168 font de la compétition. Quel pourcentage des adhérents font de la compétition ?',
                'Q4★★': 'Simplifier : AB→ − CB→ + CD→', 'Q4★★★': 'AB→ correspond à un déplacement de 2 carreaux vers la droite et 3 vers le haut, BC→ à 2 vers la droite et 1 vers le haut (carreaux de côté 1). Calculer AC sous la forme a√b.',
                'Q5★★': 'Lire les coordonnées du point B (figure de Q5 ; ce sont des nombres décimaux).', 'Q5★★★': 'Le point E a la même abscisse que A et la même ordonnée que B. Donner ses coordonnées.',
                'Q6★★': 'Donner un ordre de grandeur de 39,7 × 25,2.', 'Q6★★★': 'Donner un ordre de grandeur de 1 996 / 0,249.',
                'Q7★★': 'def f(x):\n    y = 3 * x - 12\n    if y >= 0:\n        return y\n    else:\n        return -y\nQue renvoient f(6) et f(1) ?', 'Q7★★★': 'Avec la même fonction f, trouver tous les nombres x pour lesquels f(x) renvoie 9.',
                'Q8★★': 'Soit g(x) = 3x² − 4x − 2. Calculer g(−2).', 'Q8★★★': 'Soit h(x) = x² + 3. Déterminer les antécédents de 52 par h.',
                'Q9★★': 'Ranger dans l\'ordre croissant : −1,3 ; −5/4 ; −12 × 10⁻¹ ; −1,28', 'Q9★★★': 'Ranger dans l\'ordre croissant : 4/7 ; 0,57 ; 0,58 ; 3/5'
            } },
        // DS 2 : pas de compétence affichée ; « retraits » = colonnes du CSV retirées de la note (montrées à l'élève)
        'DS2 sujets A-B': { evaluation: 'DS 2', sur: 20,
            retraits: [['Retrait calcul', 'Erreurs de calcul (plus de 4 sur le devoir)'], ['Titres', 'Titres des exercices ni soulignés ni surlignés'],
                       ['Propreté', 'Propreté de la copie'], ['Copie double', 'Pas de copie double']], ex: [
            { n: 1, qs: [['1. (a) Les trois identités remarquables', 0.5], ['1. (b) A : (a + b)²', 0.5], ['1. (b) B : (a − b)²', 0.5], ['1. (b) C : (a + b)(a − b)', 0.5],
                ['1. (b) a et b bien repérés dans les 3 calculs', 0.5, true], ['2. D : développer et réduire', 1], ['3. E : facteur commun', 0.75], ['3. F : a² − b²', 0.75]] },
            { n: 2, qs: [['1. (a) Équation', 1], ['1. (b) Équation avec parenthèse', 1.5], ['2. Inéquation', 1.5], ['2. Droite graduée', 0.5]] },
            { n: 3, qs: [['1. (a) Définition de vecteurs colinéaires', 0.25], ['1. (b) Vecteur colinéaire de norme différente', 0.25], ['2. (a) Nombre réel', 0.5],
                ['2. (b) Nombre réel', 0.5], ['2. (c) Nombre réel', 0.5], ['3. Image par translation', 0.5], ['4. (a) Somme', 0.25], ['4. (b) Somme', 0.25]] },
            { n: 4, qs: [['1. Point M : AM⃗ = 2u⃗ − v⃗', 0.75], ['2. Représentant de −3/2 u⃗ d\'origine B', 0.5], ['3. w⃗ en fonction de u⃗ et v⃗', 0.75]] },
            { n: 5, qs: [['1. Erreur 1 (message de la console)', 0.25], ['1. Erreur 2 (case à cocher)', 0.25], ['1. Erreur 3 (à trouver)', 0.25],
                ['2. Tableau : ligne 4', 0.5], ['2. Tableau : ligne 5', 0.5], ['2. Affichage', 0.25]] },
            { n: 6, qs: [['1. Aire du rectangle', 0.5], ['2. Aire du carré', 0.5], ['3. Même aire', 1]] },
            { n: 7, qs: [['1. Placer les trois points', 0.25], ['2. (a) Case à cocher', 0.25], ['2. (b) Premier vecteur', 0.5], ['3. Alignement', 1],
                ['Démonstration par Chasles', 0.5, true]] }
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

    function nombre(t) { var v = parseFloat(String(t).replace(',', '.').replace('−', '-')); return isNaN(v) ? null : v; }

    // copies d'un fichier : [{ nom, sujet, notes: { '1.2': { v, nf } }, total, erreurs: [{ q, texte }], remarque }]
    function copies(grille, texte) {
        var l = lignesCSV(texte);
        if (!l.length) return [];
        var tete = l[0].map(function (h) { return h.trim(); }), col = {};
        tete.forEach(function (h, i) {
            var q = /^((?:\d+|bonus)\.\d+)( bonus)?$/.exec(h);
            if (q) col[q[1]] = i;
            else if ((GRILLES[grille].objs || []).some(function (o) { return o[0] === h; })) col['obj:' + h] = i;
            else if ((GRILLES[grille].retraits || []).some(function (o) { return o[0] === h; })) col['ret:' + h] = i;
            else if (/^Élève$/i.test(h)) col.nom = i;
            else if (/^Sujet$/i.test(h)) col.sujet = i;
            else if (/^Total/i.test(h)) col.total = i;
            else if (/^Noté sur$/i.test(h)) col.noteSur = i;
            else if (/^Erreurs/i.test(h)) col.erreurs = i;
            else if (/^Remarque$/i.test(h)) col.remarque = i;
            else if (/^Étoiles$/i.test(h)) col.etoiles = i;
            else if (/^Étoiles détail$/i.test(h)) col.etoilesDet = i;
            else if (/^((?:\d+|bonus)\.\d+) lue$/i.test(h)) col['lu:' + /^(\S+)/.exec(h)[1]] = i;   // « 1.3 lue » : réponse lue sur la copie
            else if (/^((?:\d+|bonus)\.\d+) erreur$/i.test(h)) col['te:' + /^(\S+)/.exec(h)[1]] = i;   // « 1.3 erreur » : type d'erreur repéré
            else if (/^Bonus lus$/i.test(h)) col.bonusLus = i;   // « Q1★★ : 4x²+20x+25 ✓ 2 ★ | Q7★★ : … »
        });
        return l.slice(1).map(function (r) {
            var c = { grille: grille, nom: (r[col.nom] || '').trim(), sujet: (r[col.sujet] || '').trim(), notes: {}, erreurs: [],
                      remarque: col.remarque != null ? (r[col.remarque] || '').trim() : '', objs: {}, retraits: [],
                      noteSur: col.noteSur != null ? nombre(r[col.noteSur]) : null,   // absent lors de certaines notions
                      etoiles: col.etoiles != null ? nombre(r[col.etoiles]) : null,
                      etoilesDet: col.etoilesDet != null ? (r[col.etoilesDet] || '').trim() : '',
                      lus: {}, bonusLus: col.bonusLus != null ? (r[col.bonusLus] || '').split(' | ').map(function (x) { return x.trim(); }).filter(Boolean) : [] };
            c.typesErr = {};
            Object.keys(col).forEach(function (k) {
                var v = (r[col[k]] || '').trim();
                if (!v) return;
                if (k.indexOf('lu:') === 0) c.lus[k.slice(3)] = v;
                else if (k.indexOf('te:') === 0) c.typesErr[k.slice(3)] = v;
            });
            (GRILLES[grille].retraits || []).forEach(function (o) {
                var i = col['ret:' + o[0]], v = i != null ? nombre(r[i]) : null;
                if (v) c.retraits.push({ l: o[1], v: Math.abs(v) });
            });
            (GRILLES[grille].objs || []).forEach(function (o) {
                var i = col['obj:' + o[0]], v = i != null ? (r[i] || '').trim() : '';
                if (v) c.objs[o[0]] = v;
            });
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
                var m = /^((?:\d+|bonus)\.\d+) : (.*)$/.exec(bloc.trim());
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
        zone.innerHTML = tableauBilan(d, evs) + evs.map(function (e, i) { return detailEvaluation(e, d[e], i === 0); }).join('') + zonePublication(evs);
        $('se-eleve').innerHTML = '';
        etatPublication();
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
                h += '<tr class="se-ex"><th colspan="2">Exercice ' + e.n + (e.comp ? ' · ' + esc(e.comp) : '') + '</th><th colspan="3">' + (rEx == null ? '' : pct(rEx)) + '</th></tr>' + lignes.join('');
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
        var objs = Object.keys(c.objs);
        h += '</ol>' + (objs.length ? '<p><b>Objectifs :</b> ' + objs.map(function (k) { return esc(k) + ' ' + esc(c.objs[k]); }).join(' · ') + '</p>' : '') + (c.remarque ? '<p><b>Remarque :</b> ' + esc(c.remarque) + '</p>' : '') + '</div>';
        $('se-eleve').innerHTML = h;
        $('se-eleve').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* ---------- Publication aux élèves (onglet « Évaluations » de l'espace élève) ----------
       Les noms des CSV sont remplacés ici par les codes (fichiers comptes-*.csv chargés dans l'onglet Comptes) :
       seuls le code, la note et la grille partent dans la base. */
    var publiees = null;   // [{ evaluation, classe, n, publie_le }] ou null si indisponible
    function mdpProf() { try { return sessionStorage.getItem('interactif-prof'); } catch (e) { return null; } }
    function sansAccents(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim(); }

    function zonePublication(evs) {
        if (!evs.length) return '';
        return '<h3>Publier aux élèves</h3><p class="aide">Chaque élève voit alors sa note et sa grille (points par question, niveau par objectif) dans l\'onglet Évaluations de son espace. ' +
            'Seuls son identifiant, sa note et sa grille sont envoyés, jamais son nom. Republier remplace la version précédente.</p>' +
            '<p><label><input type="checkbox" id="se-avec-com"> joindre mes commentaires (erreurs relevées, remarque)</label></p>' +
            '<div class="tableau-defile"><table class="res se-table se-pub"><tr><th>Évaluation</th><th>En ligne</th><th></th></tr>' +
            evs.map(function (e) {
                return '<tr><td>' + esc(e) + '</td><td class="se-pub-etat" data-ev="' + esc(e) + '">…</td><td>' +
                       '<button type="button" data-publier="' + esc(e) + '">Publier</button> ' +
                       '<button type="button" class="secondaire" data-retirer="' + esc(e) + '" hidden>Retirer</button></td></tr>';
            }).join('') + '</table></div><p class="aide" id="se-pub-msg" aria-live="polite"></p>';
    }

    function etatPublication(recharger) {
        var mdp = mdpProf();
        function peindre() {
            var classe = $('se-classe').value;
            document.querySelectorAll('.se-pub-etat').forEach(function (td) {
                var p = publiees && publiees.filter(function (x) { return x.evaluation === td.dataset.ev && x.classe === classe.toUpperCase(); })[0];
                td.textContent = publiees == null ? '?' : p ? p.n + ' élève(s), le ' + new Date(p.publie_le).toLocaleDateString('fr-FR') : 'non publiée';
                var bt = document.querySelector('[data-retirer="' + td.dataset.ev.replace(/"/g, '\\"') + '"]');
                if (bt) bt.hidden = !p;
            });
        }
        if (publiees && !recharger) return peindre();
        if (!mdp) { publiees = null; peindre(); return; }
        Interactif.rpc('prof_notes_publiees', { p_mdp: mdp }).then(function (l) { publiees = l || []; peindre(); }, function (x) {
            publiees = null; peindre();
            var m = $('se-pub-msg'); if (m) m.textContent = 'État des publications indisponible (' + x.message + ') : le script maj-notes.sql a-t-il été lancé dans Supabase ?';
        });
    }

    // grille envoyée à l'élève : se suffit à elle-même (intitulés, barème, points)
    function grilleEleve(c, avecCom) {
        var g = GRILLES[c.grille], det = { sujet: c.sujet || '', ex: [], objs: [] }, cles = {};
        g.ex.forEach(function (e) {
            var qs = e.qs.map(function (q, k) {
                var cle = e.n + '.' + (k + 1), n = c.notes[cle] || {};
                var r = { l: q[0], max: q[1], v: n.v == null ? null : n.v, nf: !!n.nf, bonus: !!q[2] };
                if (q[3]) r.enonce = q[3];   // énoncé, pour comprendre l'erreur sans la copie
                if (q[4]) r.fig = q[4];
                if (c.lus && c.lus[cle]) r.lu = c.lus[cle];   // réponse lue sur la copie (colonne « 1.k lue »)
                if (c.typesErr && c.typesErr[cle]) r.typeErr = c.typesErr[cle];   // type d'erreur, toujours envoyé (indépendant de « avec commentaires »)
                cles[cle] = 1;
                // commentaires : erreurs rattachées à leur question, affichées sous sa ligne
                if (avecCom) { var err = c.erreurs.filter(function (x) { return x.q === cle; }).map(function (x) { return x.texte; }); if (err.length) r.err = err; }
                return r;
            });
            det.ex.push({ n: e.n, comp: e.comp || '', bonus: qs.every(function (q) { return q.bonus; }), qs: qs });
        });
        (g.objs || []).forEach(function (o) { if (c.objs[o[0]]) det.objs.push({ c: o[0], t: o[1], niv: c.objs[o[0]] }); });
        if (c.retraits && c.retraits.length) det.retraits = c.retraits;
        if (c.noteSur) det.noteSur = c.noteSur;
        if (c.etoiles != null) { det.etoiles = c.etoiles; if (c.etoilesDet) det.etoilesDet = c.etoilesDet; }   // compteur d'étoiles (automatismes)
        // « Q1★★ : 4x²+20x+25 ✓ 2 ★ » → { q, enonce, texte } (énoncé repris de la grille)
        if (c.bonusLus && c.bonusLus.length) det.bonusLus = c.bonusLus.map(function (x) {
            var m = /^(Q\d+\s*★+)\s*:\s*(.*)$/.exec(x), cle = m ? m[1].replace(/\s/g, '') : '';
            return m ? { q: cle, enonce: (g.bonus || {})[cle] || '', texte: m[2] } : x;
        });
        if (avecCom) det.com = { erreurs: c.erreurs.filter(function (x) { return !cles[x.q]; }).map(function (x) {   // erreurs sans question reconnue
            var m = /^(\d+)\.(\d+)$/.exec(x.q);
            return (m ? 'Exercice ' + m[1] + ', question ' + m[2] : x.q) + ' · ' + x.texte;
        }), remarque: c.remarque || '' };
        return det;
    }

    function publier(ev) {
        var mdp = mdpProf(), msg = $('se-pub-msg'), classe = $('se-classe').value;
        if (!mdp) { msg.textContent = 'Reconnectez-vous à l\'espace professeure pour publier.'; return; }
        var noms = window.interactifNoms ? window.interactifNoms() : {}, parNomNorm = {};
        Object.keys(noms).forEach(function (code) {
            var k = sansAccents(noms[code]);
            // homonymes : on garde le code de la classe affichée
            if (!parNomNorm[k] || code.toUpperCase().indexOf(classe.toUpperCase() + '-') === 0) parNomNorm[k] = code;
        });
        if (!Object.keys(parNomNorm).length) { msg.textContent = 'Chargez d\'abord les fichiers comptes-*.csv (onglet Comptes) pour faire le lien nom → identifiant.'; return; }
        var de = donneesClasse(classe)[ev], envoi = [], sansCompte = [], avecCom = $('se-avec-com').checked;
        Object.keys(de.eleves).sort(parNom).forEach(function (nm) {
            var c = de.eleves[nm];
            if (c.total == null) return;
            var code = parNomNorm[sansAccents(nm)];
            if (!code) { sansCompte.push(nm); return; }
            envoi.push({ code: code, total: Math.round(c.total * 100) / 100, sur: GRILLES[c.grille].sur, detail: grilleEleve(c, avecCom) });
        });
        if (!envoi.length) { msg.textContent = 'Aucune copie notée à publier' + (sansCompte.length ? ' (aucun nom reconnu : ' + sansCompte.join(', ') + ')' : '') + '.'; return; }
        var q = 'Publier « ' + ev + ' » pour ' + envoi.length + ' élève(s) de ' + classe + (avecCom ? ', avec vos commentaires' : '') + ' ?';
        if (sansCompte.length) q += '\n\nSans identifiant trouvé (non publiés) : ' + sansCompte.join(', ') + '.';
        if (!confirm(q)) return;
        msg.textContent = 'Publication…';
        Interactif.rpc('prof_publier_notes', { p_mdp: mdp, p_evaluation: ev, p_notes: envoi }).then(function (n) {
            msg.textContent = '✓ « ' + ev + ' » publiée pour ' + n + ' élève(s) de ' + classe + '.' + (sansCompte.length ? ' Non publiés (sans identifiant) : ' + sansCompte.join(', ') + '.' : '');
            etatPublication(true);
        }, function (x) { msg.textContent = 'Non publiée : ' + x.message; });
    }

    function retirer(ev) {
        var mdp = mdpProf(), msg = $('se-pub-msg'), classe = $('se-classe').value;
        if (!mdp || !confirm('Retirer « ' + ev + ' » de l\'espace des élèves de ' + classe + ' ?')) return;
        Interactif.rpc('prof_retirer_notes', { p_mdp: mdp, p_evaluation: ev, p_classe: classe }).then(function (n) {
            msg.textContent = '« ' + ev + ' » retirée (' + n + ' note(s)).';
            etatPublication(true);
        }, function (x) { msg.textContent = 'Erreur : ' + x.message; });
    }

    /* ---------- Moyennes du trimestre (export CSV de Pronote « MATHEMATIQUES (n).csv ») ----------
       Ligne 1 : dates ; ligne 2 : « 4 » (coef. 4, sur 20 = DS) ou « 2-/10 » (coef., sur) ; puis une ligne par élève
       (« NOM Prénom » ; moyenne ; notes, ou Abs / N.Not / X). Publié comme l'évaluation « Trimestre n » :
       l'élève voit en haut de son onglet Évaluations sa moyenne, sa moyenne aux DS et toutes ses notes. */
    var CLE_PRONOTE = 'suivi-eval-pronote';
    var pronote = {};   // nom du fichier -> texte

    function lirePronote(texte) {
        var l = lignesCSV(texte);
        if (l.length < 3 || !/Moyenne/i.test(l[1][1] || '')) return null;
        var cols = [];
        for (var i = 2; i < l[0].length; i++) {
            var d = (l[0][i] || '').trim(), b = /^(\d+(?:[.,]\d+)?)(?:\s*-?\s*\/\s*(\d+(?:[.,]\d+)?))?$/.exec((l[1][i] || '').trim());
            if (!/^\d{1,2}\/\d{1,2}$/.test(d) || !b) continue;
            var jm = d.split('/').map(Number);
            cols.push({ i: i, date: d, coef: nombre(b[1]), sur: b[2] ? nombre(b[2]) : 20, ordre: (jm[1] >= 8 ? jm[1] - 8 : jm[1] + 4) * 100 + jm[0] });
        }
        cols.sort(function (a, b) { return a.ordre - b.ordre; });
        // intitulés : coef. 4 sur 20 = devoir surveillé, sur 10 = interrogation, autre barème = automatismes
        var nb = { ds: 0, it: 0 };
        cols.forEach(function (c) {
            if (c.sur === 20 && c.coef >= 4) { c.ds = true; c.l = 'Devoir surveillé ' + (++nb.ds); }
            else if (c.sur === 10) c.l = 'Interrogation ' + (++nb.it);
            else c.l = 'Automatismes';
        });
        var eleves = [];
        l.slice(2).forEach(function (r) {
            var nom = (r[0] || '').trim();
            if (!nom || /^Moyenne/i.test(nom)) return;
            var e = { nom: nom, moyenne: nombre(r[1]), evals: [] }, ds = [];
            cols.forEach(function (c) {
                var brut = (r[c.i] || '').trim(), v = nombre(brut);
                if (brut === 'X' || !brut) return;   // pas dans la classe à cette date
                var x = { d: c.date, l: c.l, sur: c.sur };
                if (v != null) { x.v = v; if (c.ds) ds.push(v); } else x.etat = brut === 'Abs' ? 'Absent(e)' : brut === 'N.Not' ? 'Non noté' : brut;
                if (c.ds) x.ds = true;
                e.evals.push(x);
            });
            e.moyenneDS = ds.length ? Math.round(100 * ds.reduce(function (s, v) { return s + v; }, 0) / ds.length) / 100 : null;
            e.nbDS = ds.length;
            eleves.push(e);
        });
        return { cols: cols, eleves: eleves };
    }

    // Export Pronote des appréciations (« Élève;H.Abs.;Ret.;N.Notes;Moy.;App. A : Appréciations ») : nom normalisé -> appréciation
    function lireAppreciations(texte) {
        var l = lignesCSV(texte);
        if (!l.length || !/^[ÉE]l[èe]ve/i.test((l[0][0] || '').trim())) return null;
        var col = -1;
        l[0].forEach(function (h, i) { if (col < 0 && /^App/i.test(h.trim())) col = i; });
        if (col < 0) return null;
        var m = {}, eleves = [];
        l.slice(1).forEach(function (r) {
            var nom = (r[0] || '').trim(), a = (r[col] || '').trim();
            if (nom && a) { m[sansAccents(nom)] = a; eleves.push({ nom: nom }); }
        });
        return { app: m, nb: eleves.length, eleves: eleves };
    }
    function toutesAppreciations() {
        var m = {};
        Object.keys(pronote).forEach(function (f) { var a = lireAppreciations(pronote[f]); if (a) Object.assign(m, a.app); });
        return m;
    }

    // identifiants des élèves (comptes-*.csv) : nom normalisé -> [codes]
    function codesParNom() {
        var noms = window.interactifNoms ? window.interactifNoms() : {}, m = {};
        Object.keys(noms).forEach(function (code) { var k = sansAccents(noms[code]); (m[k] = m[k] || []).push(code); });
        return m;
    }
    // classe d'un export = préfixe de code le plus fréquent parmi ses élèves (« 2H-… »)
    function classePronote(p, m) {
        var compte = {};
        p.eleves.forEach(function (e) { (m[sansAccents(e.nom)] || []).forEach(function (code) { var c = code.split('-')[0].toUpperCase(); compte[c] = (compte[c] || 0) + 1; }); });
        return Object.keys(compte).sort(function (a, b) { return compte[b] - compte[a]; })[0] || null;
    }

    function afficherPronote() {
        var zone = $('se-pronote-zone'), noms = Object.keys(pronote).sort();
        if (!noms.length) { zone.innerHTML = ''; return; }
        var m = codesParNom(), avecNoms = Object.keys(m).length, trim = $('se-trim').value;
        var h = '<div class="tableau-defile"><table class="res se-table"><tr><th>Fichier</th><th>Classe</th><th>Élèves</th><th>Évaluations</th><th></th></tr>';
        var apps = toutesAppreciations();
        noms.forEach(function (f) {
            var a = lireAppreciations(pronote[f]);
            if (a) {
                var cla = avecNoms ? classePronote(a, m) : null;
                h += '<tr><td>' + esc(f) + '</td><td>' + (cla ? esc(cla) : '<span class="n-tent">?</span>') + '</td><td>' + a.nb + '</td><td>Appréciations du trimestre</td><td><span class="n-tent">jointes à « Publier T' + esc(trim) + ' »</span></td></tr>';
                return;
            }
            var p = lirePronote(pronote[f]);
            if (!p) { h += '<tr><td>' + esc(f) + '</td><td colspan="4">non reconnu (export Pronote attendu)</td></tr>'; return; }
            var cl = avecNoms ? classePronote(p, m) : null;
            var nbApp = p.eleves.filter(function (e) { return apps[sansAccents(e.nom)]; }).length;
            h += '<tr><td>' + esc(f) + '</td><td>' + (cl ? esc(cl) : '<span class="n-tent">?</span>') + '</td><td>' + p.eleves.filter(function (e) { return e.moyenne != null; }).length +
                 (nbApp ? ' <span class="n-tent">(' + nbApp + ' appréciation(s))</span>' : '') + '</td><td>' +
                 p.cols.map(function (c) { return esc(c.l) + ' <span class="n-tent">(' + c.date + ', /' + fmt(c.sur) + ')</span>'; }).join(' · ') + '</td><td>' +
                 '<button type="button" data-pronote="' + esc(f) + '"' + (cl ? '' : ' disabled') + '>Publier T' + esc(trim) + '</button></td></tr>';
        });
        h += '</table></div>';
        if (!avecNoms) h += '<p class="aide">Chargez d\'abord les fichiers comptes-*.csv (onglet Comptes) : ils donnent la classe de chaque fichier et l\'identifiant de chaque élève.</p>';
        h += '<p class="aide" id="se-pronote-msg" aria-live="polite"></p>';
        zone.innerHTML = h;
    }

    function publierPronote(f) {
        var mdp = mdpProf(), msg = $('se-pronote-msg'), p = lirePronote(pronote[f]), m = codesParNom(), cl = classePronote(p, m);
        var trim = $('se-trim').value, ev = 'Trimestre ' + trim;
        if (!mdp) { msg.textContent = 'Reconnectez-vous à l\'espace professeure pour publier.'; return; }
        var envoi = [], sansCompte = [], apps = toutesAppreciations();
        p.eleves.forEach(function (e) {
            if (e.moyenne == null) return;   // pas de moyenne (arrivé(e) dans une autre classe, non noté(e))
            var code = (m[sansAccents(e.nom)] || []).filter(function (c) { return c.toUpperCase().indexOf(cl + '-') === 0; })[0];
            if (!code) { sansCompte.push(e.nom); return; }
            var detail = { trimestre: Number(trim), moyenne: e.moyenne, moyenneDS: e.moyenneDS, nbDS: e.nbDS, evals: e.evals };
            if (apps[sansAccents(e.nom)]) detail.appreciation = apps[sansAccents(e.nom)];
            envoi.push({ code: code, total: e.moyenne, sur: 20, detail: detail });
        });
        if (!envoi.length) { msg.textContent = 'Aucun élève reconnu dans ' + f + '.'; return; }
        var nbApp = envoi.filter(function (x) { return x.detail.appreciation; }).length;
        var q = 'Publier les moyennes du trimestre ' + trim + ' pour ' + envoi.length + ' élève(s) de ' + cl + ' ?' +
                (nbApp ? '\n\nAvec l\'appréciation du trimestre pour ' + nbApp + ' élève(s).' : '\n\nSans appréciation (aucun export d\'appréciations chargé pour ces élèves).');
        if (sansCompte.length) q += '\n\nNon publiés (pas d\'identifiant en ' + cl + ') : ' + sansCompte.join(', ') + '.';
        if (!confirm(q)) return;
        msg.textContent = 'Publication…';
        Interactif.rpc('prof_publier_notes', { p_mdp: mdp, p_evaluation: ev, p_notes: envoi }).then(function (n) {
            msg.textContent = '✓ « ' + ev + ' » publié pour ' + n + ' élève(s) de ' + cl + '.' + (sansCompte.length ? ' Non publiés : ' + sansCompte.join(', ') + '.' : '');
        }, function (x) { msg.textContent = 'Non publié : ' + x.message; });
    }

    function lireTexte(f) {   // Pronote exporte parfois en Windows-1252
        return f.arrayBuffer().then(function (b) {
            try { return new TextDecoder('utf-8', { fatal: true }).decode(b); } catch (e) { return new TextDecoder('windows-1252').decode(b); }
        });
    }

    /* ---------- Fichiers ---------- */
    function memoriser() {
        try {
            if ($('se-memoriser').checked) { localStorage.setItem(CLE, JSON.stringify(fichiers)); localStorage.setItem(CLE_PRONOTE, JSON.stringify(pronote)); }
            else { localStorage.removeItem(CLE); localStorage.removeItem(CLE_PRONOTE); }
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
        pronote: function () { if (lance) afficherPronote(); },
        demarrer: function () {
            if (lance) return;
            lance = true;
            try {
                var gardes = JSON.parse(localStorage.getItem(CLE));
                if (gardes) { fichiers = gardes; $('se-memoriser').checked = true; }
                pronote = JSON.parse(localStorage.getItem(CLE_PRONOTE)) || {};
            } catch (e) {}
            $('se-pronote').onchange = function (e) {
                Promise.all(Array.from(e.target.files).map(function (f) { return lireTexte(f).then(function (t) { pronote[f.name] = t; }); }))
                    .then(function () { memoriser(); afficherPronote(); });
                e.target.value = '';
            };
            $('se-trim').onchange = afficherPronote;
            $('se-pronote-zone').onclick = function (e) { var b = e.target.closest('button[data-pronote]'); if (b) publierPronote(b.dataset.pronote); };
            $('se-csv').onchange = function (e) { ajouter(Array.from(e.target.files)); e.target.value = ''; };
            $('se-memoriser').onchange = memoriser;
            $('se-classe').onchange = afficher;
            $('se-oublier').onclick = function () {
                fichiers = {}; pronote = {};
                try { localStorage.removeItem(CLE); localStorage.removeItem(CLE_PRONOTE); } catch (e) {}
                afficher(); afficherPronote();
            };
            $('se-bilan').onclick = function (e) {
                var b = e.target.closest('button[data-publier], button[data-retirer]');
                if (b) { if (b.dataset.publier) publier(b.dataset.publier); else retirer(b.dataset.retirer); return; }
                var td = e.target.closest('td[data-ev][data-nom]');
                if (td) copieEleve(td.dataset.ev, td.dataset.nom);
            };
            afficher(); afficherPronote();
        }
    };
})();
