/* ==========================================================================
   Espace professeure · onglet « Plan de travail » (Secondes, période 2)
   Planning du 02/11 au 18/12 en séances J1 à J4 ; une case par classe pour
   chaque élément de cours et chaque exercice.
   Enregistré dans Supabase (prof_plan / prof_plan_enregistrer, script
   maj-plan-travail.sql), recopié dans ce navigateur en secours.
   ========================================================================== */
(function () {
    var CLASSES = ['2B', '2H', '2F'];
    var SEQ = { 3: 'Calcul littéral et premier degré', 4: 'Information chiffrée', 5: 'Ensembles de nombres', 6: 'Fonctions, généralités' };
    var CLE_LOCAL = 'plan-travail-p2', CLE_FILTRE = 'plan-travail-p2-filtre', CLE_MASQUER = 'plan-travail-p2-masquer';
    function L(s) { return s ? s.split('|') : []; }

    // Séance : k = clé stable, j = jour, q = séquence, n = séance, t = titre, o = objectifs
    // ev = évaluations, co = éléments de cours, cl = en classe ('?' = si le temps), ap = approfondissement, ma = à la maison
    var SEMAINES = [
        { d: '2026-11-02', t: '02/11 au 06/11', a: 'Série 7', s: [
            { k: 's3-1', j: 'J1', q: 3, n: 1, t: 'Retour sur le développement ; factoriser avec les identités remarquables ; priorités', o: '4, 5',
              co: L('Rappel des trois identités remarquables au tableau, sans le cours|Correction de l\'exercice 72|Calculs flash : (2x − 3)² et (5 + x)(5 − x)|Méthode : factoriser avec une identité remarquable (x² − 10x + 25 ; 4x² − 81)|Priorités opératoires : exemple 3, E = 5 − 2(3x − 1)² + 4(x + 3)'),
              cl: L('F4 ex 8|F4 ex 9'), ap: L('F4 ex 9 (J, K, L)|79'), ma: L('63|64|74|75') },
            { k: 's3-2', j: 'J2', q: 3, n: 2, t: 'Égalités, équations', o: '6, 7',
              ev: L('Interrogation n°4 (15 min) : identités remarquables'),
              co: L('Correction flash des exercices 64 et 74|Règles 1 et 2 (égalités)|Définitions : équation, solution|Exemple 5 : rédaction « Soit x un réel » et ⟺'),
              cl: L('F5 ex 1|F5 ex 2|F5 ex 3|?F5 ex 4'), ap: L('F5 ex 4 (7 à 11)|93|95'), ma: L('80|81|92|97') },
            { k: 's3-3', j: 'J3', q: 3, n: 3, t: 'Inégalités et inéquations', o: '8',
              co: L('Correction des exercices 81 et 92|Règles 3, 4 et 5 (inégalités) : changement de sens|Exemple 4 : encadrement|Exemple 6 : solutions sur la droite réelle (pas encore d\'intervalles)'),
              cl: L('F5 ex 5|F5 ex 7|F5 ex 6|F5 ex 8|F5 ex 9 (bilan : la copie de Tom)|?F5 ex 10'), ap: L('F5 ex 10 (9, 10)|87|90'), ma: L('85|86') },
            { k: 's3-4', j: 'J4', q: 3, n: 4, t: 'Mettre un problème en équation', o: '9',
              ev: L('Évaluation d\'automatismes, Série 7 (10 min)'),
              co: L('Correction des exercices 85 et 86|Méthode en quatre étapes : inconnue, traduire, résoudre, vérifier et conclure|Exemple de la salle d\'escalade, question 1'),
              cl: L('F6 ex 1|F6 ex 2|F6 ex 3|?F6 ex 4|?F6 ex 5'), ap: L('F6 ex 6|102'), ma: L('84|96|98|99|Sujet d\'entraînement DS 2') }
        ] },
        { d: '2026-11-09', t: '09/11 au 13/11', a: 'Série 8', x: 'mercredi 11/11 férié', s: [
            { k: 's3-5', j: 'J1', q: 3, n: 5, t: 'Mettre un problème en inéquation ; bilan', o: '10',
              co: L('Correction des exercices 96 et 99|Exemple de la salle d\'escalade, question 2|Traduire « au moins », « au plus », « strictement »|Inconnue entière : le premier entier qui convient|Bilan : un exemple de chaque objectif refait sans le cours'),
              cl: L('F6 ex 7|F6 ex 8|F6 ex 9'), ap: L('F6 ex 10|F6 ex 11|F6 ex 12'), ma: L('Révisions DS : 91|100|101'),
              rq: 'Si l\'un des créneaux tombe le mercredi 11/11, tout se décale d\'une séance et la séance 8 de la Séquence 6 passe en janvier.' },
            { k: 'ds2', j: 'J2', ds: 2, t: 'Devoir surveillé 2 (mardi 10/11) : calcul littéral, vecteurs et Python',
              ev: L('DS 2 passé|DS 2 corrigé et rendu') },
            { k: 's4-1', j: 'J3', q: 4, n: 1, t: 'Proportions et proportion de proportion', o: '1, 2, 3',
              co: L('Introduction : proportion ou évolution ? (« Pour commencer », deux classes d\'externes)|Population et sous-population|Calculer une proportion|Trouver la partie ou le tout|Proportion de proportion : situation des sportifs, propriété, « Attention »'),
              cl: L('41|42|?45|50|?53'), ap: L('46|49|51|54|90'), ma: L('21|35|17|22|23|36|18|24|25') },
            { k: 's4-2', j: 'J4', q: 4, n: 2, t: 'Variation absolue, taux d\'évolution', o: '4, 5',
              ev: L('Évaluation d\'automatismes, Série 8 (10 min)'),
              co: L('Correction ciblée : 23, 36 (piège partie / tout) et 25 (schéma)|Variation absolue|Taux d\'évolution|Proportion ou évolution ?'),
              cl: L('34|27|55|91|?61|?57'), ap: L('97'), ma: L('26|52'),
              rq: 'Séance prévue sur 50 min : exercices ramenés de 33 à 23 min, 61 passe en « si le temps ».' }
        ] },
        { d: '2026-11-16', t: '16/11 au 20/11', a: 'Série 9', s: [
            { k: 's4-3', j: 'J1', q: 4, n: 3, t: 'Activité « Découverte du coefficient multiplicateur »', o: '6',
              co: L('Correction des exercices 26 et 52|Activité, partie A : une hausse de 15 %|Activité, partie B : une baisse de 30 %|Activité, partie C : d\'une évolution à un coefficient multiplicateur, et inversement|Mise en commun : augmenter de t %, c\'est multiplier par 1 + t/100 ; diminuer, par 1 − t/100|Activité, partie D : retrouver le coefficient à partir de deux valeurs'),
              ma: L('Activité, partie E|28'),
              rq: 'Interrogation n°5 en J2 : la partie D est faite en classe.' },
            { k: 's4-4', j: 'J2', q: 4, n: 4, t: 'Inégalités et proportions ; coefficient multiplicateur', o: '6',
              ev: L('Interrogation n°5 (15 min) : inégalités et proportions'),
              co: L('Correction de la partie E et de l\'exercice 28 ; bilan de l\'activité|Coefficient multiplicateur|Lien avec le taux d\'évolution|Les trois questions types'),
              cl: L('38|39|29|19|58|?63|?62|?60|?30'), ap: L('68|69|70|99'), ma: L('31|64|66'),
              rq: 'Exercices ramenés de 25 à 20 min : 63 passe en « si le temps ».' },
            { k: 's4-5', j: 'J3', q: 4, n: 5, t: 'Évolutions successives', o: '7',
              co: L('Correction des exercices 31, 64 et 66|Évolutions successives : situation des soldes cherchée par les élèves'),
              cl: L('20|72|80|73|81|75|?74'), ap: L('76|77|88|93|100|101|103'), ma: L('78|79') },
            { k: 's4-6', j: 'J4', q: 4, n: 6, t: 'Évolution réciproque et bilan', o: '8',
              ev: L('Évaluation d\'automatismes, Série 9 (10 min)'),
              co: L('Correction de l\'exercice 79|Évolution réciproque'),
              cl: L('84|33|96|40|85|?87'), ap: L('86|89|102'), ma: L('Bilan « Ce qu\'il faut retenir »|Révisions : 94|95'),
              rq: 'Bilan « Ce qu\'il faut retenir » à la maison.' }
        ] },
        { d: '2026-11-23', t: '23/11 au 27/11', a: 'Série 10', s: [
            { k: 's5-1', j: 'J1', q: 5, n: 1, t: 'Les ensembles de nombres', o: '1',
              co: L('Tri rapide de nombres en « familles »|ℕ, ℤ ; symboles ∈ et ∉|𝔻 et ℚ|ℝ et nombres irrationnels|Emboîtement ℕ ⊂ ℤ ⊂ 𝔻 ⊂ ℚ ⊂ ℝ (exemples 1 à 4, sans démonstration)'),
              cl: L('2|F7 ex 1|5|F7 ex 2|6'), ma: L('3|F7 ex 3') },
            { k: 's5-2', j: 'J2', q: 5, n: 2, t: 'Démonstration : 1/3 n\'est pas décimal ; raisonnement', o: '1, 2',
              ev: L('Interrogation n°6 (15 min) : évolutions'),
              co: L('Correction de F7 ex 3 (simplifier avant de conclure)|Démonstration : 1/3 n\'est pas décimal (raisonnement par l\'absurde)'),
              cl: L('7|F7 ex 5|8|?12|?13|?4'), ap: L('9|10|11|F7 ex 6|F7 ex 7'), ma: L('F7 ex 4'),
              rq: '12 et 13 passent en « si le temps ».' },
            { k: 's5-3', j: 'J3', q: 5, n: 3, t: 'Démonstration : √2 est irrationnel ; droite numérique et intervalles', o: '2, 3, 4',
              co: L('Correction de F7 ex 4|Démonstration : √2 est irrationnel (raisonnement par l\'absurde)|La droite numérique (exemple 5)|Intervalles bornés et non bornés, symbole ∞|Ensembles particuliers ; [2 ; 5] ou {2 ; 5} (exemples 6 et 7)'),
              cl: L('F7 ex 8|14|F7 ex 12|?15|?F7 ex 13|?F7 ex 9'), ma: L('1|F7 ex 11|F7 ex 10') },
            { k: 's5-4', j: 'J4', q: 5, n: 4, t: 'Inéquations et intervalles, intersection et réunion', o: '4, 5',
              ev: L('Évaluation d\'automatismes, Série 10 (10 min)'),
              co: L('Correction de F7 ex 11 (inégalité ↔ intervalle)|Solutions d\'une inéquation sous forme d\'intervalle (exemple 8)|Intersection et réunion : exemple introductif, définition|Méthode des deux couleurs (exemple 10)'),
              cl: L('F7 ex 16|F7 ex 14|?33'), ap: L('F7 ex 17'), ma: L('F7 ex 15|16|F8 ex 1') }
        ] },
        { d: '2026-11-30', t: '30/11 au 04/12', a: 'Série 11', s: [
            { k: 's5-5', j: 'J1', q: 5, n: 5, t: 'Intersection, réunion ; distance et valeur absolue', o: '5, 6',
              co: L('Correction de F8 ex 1 (lecture des deux couleurs)|Distance entre deux nombres|Valeur absolue (exemples 11 et 12)'),
              cl: L('F8 ex 2|21|F8 ex 3|F8 ex 4|F8 ex 5|22|23|?20|?24'), ma: L('32|25|F8 ex 6|Sujet d\'entraînement DS 3') },
            { k: 's5-6', j: 'J2', q: 5, n: 6, t: 'Distance et intervalle de centre a', o: '6, 7',
              co: L('Correction de F8 ex 6 (une distance n\'est jamais négative)|√(x²) = |x| et distance |a − b| (disjonction de cas)|Intervalle de centre a et de rayon r (propriété 7, exemple 14)'),
              cl: L('F8 ex 7|26|F8 ex 8|29|F8 ex 10|?F8 ex 11'), ap: L('28|F8 ex 12'), ma: L('27|F8 ex 9|Révisions DS 3'),
              rq: 'Interrogation n°7 supprimée (semaine du DS 3) : 29 et F8 ex 10 faits en classe.' },
            { k: 'ds3', j: 'J3', ds: 3, t: 'Devoir surveillé 3 : bilan depuis la rentrée, accent sur les Séquences 3 à 5',
              ev: L('DS 3 passé|DS 3 corrigé et rendu'), rq: 'Objectif 8 de la Séquence 5 hors DS.' },
            { k: 's5-7', j: 'J4', q: 5, n: 7, t: 'Encadrement et arrondi, bilan', o: '8',
              ev: L('Évaluation d\'automatismes, Série 11 (10 min)'),
              co: L('Correction de l\'exercice 27 et de F8 ex 9|Encadrement décimal, amplitude|Balayage|Chiffres significatifs (exemples 15 et 16)|Bilan : la carte des ensembles et des intervalles, sans le cours'),
              cl: L('30|F8 ex 13|F8 ex 15|?31|?F8 ex 16|?F8 ex 14|?F8 ex 17'), ap: L('F8 ex 20'), ma: L('F8 ex 18|F8 ex 19'),
              rq: '31 et F8 ex 16 passent en « si le temps ».' }
        ] },
        { d: '2026-12-07', t: '07/12 au 11/12', a: 'Série 12', s: [
            { k: 's6-1', j: 'J1', q: 6, n: 1, t: 'Notion de fonction, ensemble de définition', o: '1',
              co: L('Introduction : des « machines » qui transforment un nombre|Fonction, variable|Ensemble de définition|Différentes façons de donner une fonction (exemples 1 à 3)'),
              cl: L('F9 ex 1|F9 ex 2|F9 ex 3'), ap: L('36|37|38|F9 ex 5'), ma: L('F9 ex 4') },
            { k: 's6-2', j: 'J2', q: 6, n: 2, t: 'Image et antécédent', o: '2',
              co: L('Correction de F9 ex 4 (valeurs interdites)|Image|Antécédent|Calculs à partir d\'une formule ou d\'un tableau (exemples 4 à 6)'),
              cl: L('5|6|7|F9 ex 6|30|F9 ex 7|?9|?10|?11|?12|?26'), ap: L('F9 ex 10'), ma: L('15|F9 ex 8|32') },
            { k: 's6-3', j: 'J3', q: 6, n: 3, t: 'Programme de calcul, Python ; courbe représentative', o: '2, 3',
              co: L('Correction de F9 ex 8 (programme de calcul)|Courbe représentative, équation y = f(x)|Appartenance d\'un point à la courbe|Tracé point par point (exemples 7 et 8)'),
              cl: L('60|F9 ex 9|F9 ex 13|?18'), ap: L('F9 ex 14|49'), ma: L('F9 ex 11|F9 ex 12|20') },
            { k: 's6-4', j: 'J4', q: 6, n: 4, t: 'Lecture graphique d\'images et d\'antécédents', o: '3, 4',
              ev: L('Évaluation d\'automatismes, Série 12 (10 min)'),
              co: L('Correction de F9 ex 12 (vrai / faux sur la courbe)|Lecture graphique sur la courbe de référence (exemple 9)'),
              cl: L('27|28|F9 ex 15|31|?33|?63'), ap: L('F9 ex 17'), ma: L('F9 ex 16|14|34') }
        ] },
        { d: '2026-12-14', t: '14/12 au 18/12', a: 'Série 13', s: [
            { k: 's6-5', j: 'J1', q: 6, n: 5, t: 'Résolution graphique d\'équations', o: '5',
              co: L('Correction de l\'exercice 14 p. 49|Équations f(x) = k (propriété 2, exemple 10)|Équations f(x) = g(x) (propriété 3, exemple 11)|Méthodes graphique, algébrique et « logicielle » (exemple 12)'),
              cl: L('F10 ex 1|29|F10 ex 2|23'), ap: L('F10 ex 5|61'), ma: L('17|50|52') },
            { k: 's6-6', j: 'J2', q: 6, n: 6, t: 'Équations (suite) ; inéquations', o: '5, 6',
              co: L('Correction de l\'exercice 50 p. 59|Inéquations f(x) > k (propriété 4, exemple 13)|Inéquations f(x) > g(x) (propriété 5, exemple 14)'),
              cl: L('F10 ex 3|F10 ex 4|24|25|F10 ex 6|F10 ex 9|?22|?53'), ma: L('F10 ex 7|54') },
            { k: 's6-7', j: 'J3', q: 6, n: 7, t: 'Signe d\'une fonction ; modéliser', o: '6, 7',
              co: L('Correction de F10 ex 7 (encadrement 0 ≤ f(x) ≤ 2)|Signe d\'une fonction, tableau de signes (exemple 15)|Modéliser une situation par une fonction (exemple 16)'),
              cl: L('F10 ex 8|F10 ex 10|51|?55|?66'), ap: L('F10 ex 11'), ma: L('F10 ex 12|68') },
            { k: 's6-8', j: 'J4', q: 6, n: 8, t: 'Modélisation, bilan', o: '7',
              ev: L('Évaluation d\'automatismes, Série 13 (10 min)'),
              co: L('Correction de F10 ex 12 (prix de l\'essence)|Bilan flash : exercice 26 p. 54 (six fonctions, six tableaux)'),
              cl: L('F10 ex 13|F10 ex 14|40|35|?39|?59|?F10 ex 15'),
              ap: L('F10 ex 16|F10 ex 17|57|62|65|67|69|70|8|13|21|42|43|44|45|46'), ma: L('Vacances : 56|64|71') }
        ] }
    ];

    // Questions des exercices des feuilles F4 à F6 (Séquence 3) : une case par question, sous l'exercice.
    // Clé : texte exact de l'élément dans SEMAINES (sans le « ? » des facultatifs).
    // Cocher toutes les questions coche l'exercice ; cocher l'exercice coche toutes ses questions.
    function N(debut, fin) { var t = []; for (var i = debut; i <= fin; i++) t.push('Q' + i); return t; }
    var SOUS = {
        'F4 ex 8': ['x² − 49', 'x² − 12x + 36', '25x² − 30x + 9', '1 − 16x²', '49 + 14x + x²'],
        'F4 ex 9': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
        'F4 ex 9 (J, K, L)': ['J', 'K', 'L'],
        'F5 ex 1': ['3x − 5 = 7', '2x + 1 = 5x − 8', 'x² − 3 = 2x', '5(x − 2) = 3x', '4x − 1 > 2x + 5', '−2x + 7 ≤ 1'],
        'F5 ex 3': ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        'F5 ex 4': ['1', '2', '3', '4', '5', '6'],
        'F5 ex 4 (7 à 11)': ['7', '8', '9', '10', '11'],
        'F5 ex 5': ['1 (a à h)', '2 (a à d)'],
        'F5 ex 6': ['1', '2', '3', '4', '5', '6'],
        'F5 ex 7': ['1', '2'],
        'F5 ex 8': ['1', '2', '3', '4'],
        'F5 ex 9 (bilan : la copie de Tom)': N(1, 2),
        'F5 ex 10': ['1', '2', '3', '4', '5', '6', '7', '8'],
        'F5 ex 10 (9, 10)': ['9', '10'],
        'F6 ex 1': ['Q1', 'Q2', 'Q3', 'Q4', 'Plus loin'],
        'F6 ex 2': N(1, 3), 'F6 ex 3': N(1, 2), 'F6 ex 4': N(1, 4), 'F6 ex 5': N(1, 3), 'F6 ex 6': N(1, 2),
        'F6 ex 7': N(1, 3), 'F6 ex 8': N(1, 5), 'F6 ex 9': N(1, 5),
        'F6 ex 10': N(1, 2), 'F6 ex 11': N(1, 2), 'F6 ex 12': N(1, 3)
    };

    var GROUPES = [
        { cle: 'ev', nom: 'Évaluation', ex: false },
        { cle: 'co', nom: 'Cours', ex: false },
        { cle: 'cl', nom: 'En classe', ex: true },
        { cle: 'ap', nom: 'Approfondissement', ex: true },
        { cle: 'ma', nom: 'À la maison (donné)', ex: true }
    ];

    // liste des éléments de chaque séance, avec un identifiant stable
    var TOUS = [];
    SEMAINES.forEach(function (w) {
        w.s.forEach(function (s) {
            s.items = [];
            GROUPES.forEach(function (g) {
                (s[g.cle] || []).forEach(function (brut) {
                    var facultatif = brut.charAt(0) === '?', texte = facultatif ? brut.slice(1) : brut;
                    var it = { id: s.k + ':' + g.cle + ':' + texte, g: g.cle, texte: texte, facultatif: facultatif,
                               essentiel: !facultatif && g.cle !== 'ap', s: s, w: w };
                    it.sous = (SOUS[texte] || []).map(function (q) { return { id: it.id + '#' + q, texte: q, parent: it }; });
                    s.items.push(it); TOUS.push(it);
                });
            });
        });
    });

    // état : { '2B': { coches: { id: 1 }, notes: { cléSéance: '…' } }, … }
    var etat = {};
    CLASSES.forEach(function (c) { etat[c] = { coches: {}, notes: {} }; });
    function fait(c, id) { return !!etat[c].coches[id]; }
    // Exercice coché avant l'ajout des questions : ses questions sont considérées comme faites.
    function completer() {
        CLASSES.forEach(function (c) {
            var co = etat[c].coches;
            TOUS.forEach(function (it) {
                if (it.sous.length && co[it.id] && !it.sous.some(function (q) { return co[q.id]; }))
                    it.sous.forEach(function (q) { co[q.id] = 1; });
            });
        });
    }

    var $ = function (id) { return document.getElementById(id); };
    var racine, lance = false, mdp = null, filtre = '';
    var minuteurs = {}, enCours = {}, aEnvoyer = {};

    function esc(t) { return String(t).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
    function lundi() {
        var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    function etatTexte(t, erreur) { var e = $('pt-etat'); e.textContent = t; e.className = 'aide' + (erreur ? ' ko' : ''); }

    /* ---------- Construction ---------- */
    function cases(it) {
        return '<span class="pt-cases">' + CLASSES.map(function (c) {
            return '<label data-c="' + c + '" title="' + c + '"><input type="checkbox" data-c="' + c + '" data-id="' + esc(it.id) +
                   '" aria-label="' + c + ' : ' + esc(it.texte) + '"></label>';
        }).join('') + '</span>';
    }
    var COLONNES = '<span class="pt-cols">' + CLASSES.map(function (c) { return '<span data-c="' + c + '">' + c + '</span>'; }).join('') + '</span>';

    function construire() {
        var cetteSemaine = lundi();
        racine.innerHTML = SEMAINES.map(function (w) {
            return '<section class="pt-semaine">' +
                '<div class="pt-semaine-t"><h3>Semaine du ' + w.t + (w.d === cetteSemaine ? ' <span class="pt-maintenant">Cette semaine</span>' : '') + '</h3>' +
                '<span class="aide">Automatismes : ' + w.a + (w.x ? ' · ' + w.x : '') + '</span></div>' +
                w.s.map(function (s) {
                    var seq = s.ds ? 'Devoir surveillé ' + s.ds : 'Séq. ' + s.q + ' · séance ' + s.n + ' · ' + SEQ[s.q];
                    return '<article class="pt-seance ' + (s.ds ? 'pt-ds' : 'pt-s' + s.q) + '" id="pt-' + s.k + '">' +
                        '<div class="pt-tete" tabindex="0" role="button" aria-expanded="true">' +
                            '<span class="pt-jour">' + s.j + '</span>' +
                            '<div class="pt-titre"><div class="pt-seq">' + seq + '</div><h4>' + esc(s.t) + '</h4>' +
                                (s.o ? '<div class="aide">Objectifs ' + s.o + '</div>' : '') + '</div>' +
                            '<div class="pt-pastilles">' + CLASSES.map(function (c) { return '<span class="pt-pastille" data-p="' + c + '"></span>'; }).join('') + '</div>' +
                        '</div>' +
                        '<div class="pt-corps">' +
                            (s.rq ? '<p class="pt-rq">' + esc(s.rq) + '</p>' : '') +
                            GROUPES.filter(function (g) { return s.items.some(function (i) { return i.g === g.cle; }); }).map(function (g) {
                                return '<div class="pt-groupe pt-' + g.cle + '"><div class="pt-groupe-t"><span>' + g.nom + '</span>' + COLONNES + '</div>' +
                                    '<div class="pt-liste' + (g.ex ? ' pt-ex' : '') + '">' +
                                    s.items.filter(function (i) { return i.g === g.cle; }).map(function (it) {
                                        var ligne = '<div class="pt-item' + (it.facultatif ? ' pt-facultatif' : '') + '" data-ligne="' + esc(it.id) + '">' +
                                                    '<span class="pt-texte">' + esc(it.texte) + '</span>' + cases(it) + '</div>';
                                        if (!it.sous.length) return ligne;
                                        return '<div class="pt-avec-sous">' + ligne + '<div class="pt-sous">' + it.sous.map(function (q) {
                                            return '<div class="pt-item" data-ligne="' + esc(q.id) + '"><span class="pt-texte">' + esc(q.texte) + '</span>' + cases(q) + '</div>';
                                        }).join('') + '</div></div>';
                                    }).join('') + '</div></div>';
                            }).join('') +
                            CLASSES.map(function (c) {
                                return '<label class="pt-note" data-note-c="' + c + '" hidden><span class="pt-groupe-t"><span>Note ' + c + '</span></span>' +
                                       '<textarea data-note="' + s.k + '" data-c="' + c + '" placeholder="Où vous vous êtes arrêtée, ce qui reste à reprendre…"></textarea></label>';
                            }).join('') +
                        '</div></article>';
                }).join('') + '</section>';
        }).join('');
    }

    function bilanSeance(s, c) {
        var ess = s.items.filter(function (i) { return i.essentiel; });
        return { fait: ess.filter(function (i) { return fait(c, i.id); }).length, total: ess.length };
    }
    function prochaine(c) {
        for (var a = 0; a < SEMAINES.length; a++) for (var b = 0; b < SEMAINES[a].s.length; b++) {
            var s = SEMAINES[a].s[b], bs = bilanSeance(s, c);
            if (bs.fait < bs.total) return { w: SEMAINES[a], s: s, entame: bs.fait > 0 };
        }
        return null;
    }

    function resume() {
        var ess = TOUS.filter(function (i) { return i.essentiel; });
        $('pt-resume').innerHTML = CLASSES.map(function (c) {
            var n = ess.filter(function (i) { return fait(c, i.id); }).length, pct = Math.round(100 * n / ess.length), p = prochaine(c);
            var suite = p ? (p.entame ? 'En cours' : 'Prochaine') + ' : <b>' + p.s.j + ' · ' + (p.s.ds ? 'DS ' + p.s.ds : 'Séq. ' + p.s.q + ' séance ' + p.s.n) +
                            '</b>, semaine du ' + p.w.t.split(' ')[0] : '<b>Période terminée</b>';
            return '<button type="button" class="pt-carte" data-carte="' + c + '" aria-pressed="' + (filtre === c) + '">' +
                   '<span class="pt-carte-t"><span class="pt-classe">' + c + '</span><span class="pt-pct">' + pct + ' %</span></span>' +
                   '<span class="pt-barre"><i style="width:' + pct + '%"></i></span>' +
                   '<span class="aide">' + n + ' / ' + ess.length + ' éléments · ' + suite + '</span></button>';
        }).join('');
    }

    function rafraichir() {
        racine.querySelectorAll('.pt-cases input').forEach(function (inp) { inp.checked = fait(inp.dataset.c, inp.dataset.id); });
        TOUS.forEach(function (it) {
            [it].concat(it.sous).forEach(function (x) {
                var tout = filtre ? fait(filtre, x.id) : CLASSES.every(function (c) { return fait(c, x.id); });
                racine.querySelector('[data-ligne="' + CSS.escape(x.id) + '"]').classList.toggle('pt-tout', tout);
            });
        });
        SEMAINES.forEach(function (w) {
            w.s.forEach(function (s) {
                var art = $('pt-' + s.k), toutes = true;
                CLASSES.forEach(function (c) {
                    var b = bilanSeance(s, c), plein = b.fait === b.total, partiel = b.fait > 0 && !plein;
                    if (!plein) toutes = false;
                    var p = art.querySelector('[data-p="' + c + '"]');
                    p.className = 'pt-pastille' + (plein ? ' pt-plein' : partiel ? ' pt-partiel' : '');
                    p.textContent = filtre ? (plein ? 'Fait' : b.fait + ' / ' + b.total) : (plein ? c + ' ✓' : partiel ? c + ' ' + b.fait + '/' + b.total : c);
                    p.hidden = !!filtre && c !== filtre;
                    var note = art.querySelector('[data-note-c="' + c + '"]'), ta = note.querySelector('textarea');
                    if (document.activeElement !== ta) ta.value = etat[c].notes[s.k] || '';
                    note.hidden = c !== filtre;
                });
                var termine = filtre ? (function () { var b = bilanSeance(s, filtre); return b.fait === b.total; })() : toutes;
                art.classList.toggle('pt-termine', termine);
            });
        });
        resume();
    }

    /* ---------- Enregistrement ---------- */
    function copieLocale() { try { localStorage.setItem(CLE_LOCAL, JSON.stringify(etat)); } catch (e) {} }

    function programmer(c) {
        aEnvoyer[c] = true;
        copieLocale();
        etatTexte('Enregistrement…');
        clearTimeout(minuteurs[c]);
        minuteurs[c] = setTimeout(function () { envoyer(c); }, 700);
    }
    function envoyer(c) {
        if (enCours[c]) { minuteurs[c] = setTimeout(function () { envoyer(c); }, 300); return; }
        enCours[c] = true; aEnvoyer[c] = false;
        Interactif.rpc('prof_plan_enregistrer', { p_mdp: mdp, p_classe: c, p_coches: etat[c].coches, p_notes: etat[c].notes }).then(function () {
            enCours[c] = false;
            if (!CLASSES.some(function (k) { return aEnvoyer[k] || enCours[k]; })) etatTexte('Enregistré.');
        }, function (x) {
            enCours[c] = false; aEnvoyer[c] = true;
            etatTexte('Non enregistré en ligne (' + x.message + ') : vos coches sont gardées sur cet ordinateur. Le script maj-plan-travail.sql a-t-il été lancé dans Supabase ?', true);
        });
    }

    function charger() {
        etatTexte('Chargement…');
        Interactif.rpc('prof_plan', { p_mdp: mdp }).then(function (lignes) {
            var enLigne = {};
            (lignes || []).forEach(function (l) { enLigne[l.classe] = l; });
            CLASSES.forEach(function (c) {
                if (aEnvoyer[c] || enCours[c]) return;
                if (enLigne[c]) etat[c] = { coches: enLigne[c].coches || {}, notes: enLigne[c].notes || {} };
                else if (Object.keys(etat[c].coches).length || Object.keys(etat[c].notes).length) programmer(c);   // coches locales pas encore en ligne
            });
            completer(); copieLocale(); rafraichir();
            if (!CLASSES.some(function (k) { return aEnvoyer[k]; })) etatTexte('Enregistré.');
        }, function (x) {
            etatTexte('Plan de travail indisponible en ligne (' + x.message + ') : le script maj-plan-travail.sql a-t-il été lancé dans Supabase ? En attendant, les coches restent sur cet ordinateur.', true);
        });
    }

    /* ---------- Filtre et interactions ---------- */
    function choisir(f) {
        filtre = f;
        racine.parentNode.setAttribute('data-filtre', f);
        document.querySelectorAll('#pt-filtre button').forEach(function (b) {
            b.setAttribute('aria-pressed', b.dataset.f === f ? 'true' : 'false');
            b.classList.toggle('secondaire', b.dataset.f !== f);
        });
        try { localStorage.setItem(CLE_FILTRE, f); } catch (e) {}
        rafraichir();
    }

    function brancher() {
        racine.addEventListener('change', function (e) {
            var t = e.target;
            if (!t.matches('.pt-cases input')) return;
            var c = t.dataset.c, coches = etat[c].coches;
            function poser(id, oui) { if (oui) coches[id] = 1; else delete coches[id]; }
            poser(t.dataset.id, t.checked);
            var it = TOUS.find(function (i) { return i.id === t.dataset.id; });
            if (it) it.sous.forEach(function (q) { poser(q.id, t.checked); });      // exercice : toutes ses questions
            else {                                                                 // question : l'exercice suit ses questions
                var parent = TOUS.find(function (i) { return i.sous.some(function (q) { return q.id === t.dataset.id; }); });
                if (parent) poser(parent.id, parent.sous.every(function (q) { return coches[q.id]; }));
            }
            programmer(c); rafraichir();
        });
        racine.addEventListener('input', function (e) {
            var t = e.target;
            if (!t.matches('textarea[data-note]')) return;
            if (t.value.trim()) etat[t.dataset.c].notes[t.dataset.note] = t.value; else delete etat[t.dataset.c].notes[t.dataset.note];
            programmer(t.dataset.c);
        });
        function plier(tete) {
            var art = tete.parentNode;
            art.classList.toggle('pt-plie');
            tete.setAttribute('aria-expanded', art.classList.contains('pt-plie') ? 'false' : 'true');
        }
        racine.addEventListener('click', function (e) { var t = e.target.closest('.pt-tete'); if (t) plier(t); });
        racine.addEventListener('keydown', function (e) {
            var t = e.target.closest('.pt-tete');
            if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); plier(t); }
        });
        $('pt-filtre').onclick = function (e) { var b = e.target.closest('button'); if (b) choisir(b.dataset.f); };
        $('pt-resume').onclick = function (e) {
            var carte = e.target.closest('[data-carte]'); if (!carte) return;
            choisir(carte.dataset.carte);
            var p = prochaine(carte.dataset.carte);
            if (p) $('pt-' + p.s.k).scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        $('pt-masquer').onchange = function () {
            racine.classList.toggle('pt-masquer', this.checked);
            try { localStorage.setItem(CLE_MASQUER, this.checked ? '1' : ''); } catch (e) {}
        };
        $('pt-actualiser').onclick = charger;
    }

    window.PlanTravail = {
        demarrer: function () {
            try { mdp = sessionStorage.getItem('interactif-prof'); } catch (e) {}
            if (lance) { if (mdp) charger(); return; }
            lance = true;
            racine = $('pt-plan');
            try {
                var local = JSON.parse(localStorage.getItem(CLE_LOCAL));
                if (local) CLASSES.forEach(function (c) { if (local[c]) etat[c] = { coches: local[c].coches || {}, notes: local[c].notes || {} }; });
            } catch (e) {}
            completer(); construire(); brancher();
            var f = ''; try { f = localStorage.getItem(CLE_FILTRE) || ''; $('pt-masquer').checked = !!localStorage.getItem(CLE_MASQUER); } catch (e) {}
            racine.classList.toggle('pt-masquer', $('pt-masquer').checked);
            choisir(CLASSES.indexOf(f) >= 0 ? f : '');
            if (mdp) charger(); else etatTexte('Reconnectez-vous pour enregistrer en ligne.', true);
        }
    };
})();
