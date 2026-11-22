/* Générateurs d'automatismes (Terminale ST2S) : AutoT[nom](niveau) -> question pour Interactif.exercice.
   Niveau 1 = série verte (avec rappel de méthode à la demande), 2 = bleue, 3 = rouge.
   Thèmes : capacités « Automatismes » du programme de terminale technologique, dans l'ordre de la progression
   (proportions, évolutions, équations, droites, lecture graphique, suites, fonction inverse, dérivation). */
(function () {
    'use strict';
    var A = Interactif.alea, poly = Interactif.poly, par = Interactif.par;

    /* ---------- Outils ---------- */
    function arrondi(x) { return Math.round(x * 1e9) / 1e9; }
    function fr(x) {                       // 1{,}25 ; 12\,500 ; -3
        x = arrondi(x);
        var neg = x < 0, s = String(Math.abs(x));
        var p = s.split('.'), ent = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
        return (neg ? '-' : '') + ent + (p[1] ? '{,}' + p[1] : '');
    }
    function frac(n, d) { return '\\dfrac{' + n + '}{' + d + '}'; }
    function pct(x) { return fr(x) + '\\,\\%'; }
    function melanger(t) {
        t = t.slice();
        for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = t[i]; t[i] = t[j]; t[j] = x; }
        return t;
    }
    // QCM : la première option est la bonne ; les doublons (même texte) sont retirés
    function qcm(q, bonne, autres) {
        var vus = {}, opts = [{ t: bonne, ok: true }];
        vus[bonne] = true;
        autres.forEach(function (t) { if (t && !vus[t] && opts.length < 4) { vus[t] = true; opts.push({ t: t, ok: false }); } });
        var m = melanger(opts);
        q.type = 'qcm';
        q.options = m.map(function (o) { return o.t; });
        q.bonne = m.findIndex(function (o) { return o.ok; });
        return q;
    }
    function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
    function fracTex(n, d) {               // fraction simplifiée, signe devant
        var g = pgcd(n, d); n /= g; d /= g;
        if (d < 0) { n = -n; d = -d; }
        if (d === 1) return String(n);
        return (n < 0 ? '-' : '') + frac(Math.abs(n), d);
    }
    function sgn(n) { return n < 0 ? '-' : '+'; }            // signe d'un terme qui suit
    function terme(n) { return n < 0 ? '-' + fr(-n) : '+' + fr(n); }   // « +3 » ou « -3 »

    var CONTEXTES = [                      // [effectif, nom au pluriel, « qui … »]
        ['patients', 'sont vaccinés'], ['résidents d\'un EHPAD', 'ont plus de 85 ans'], ['élèves', 'pratiquent un sport'],
        ['salariés d\'un hôpital', 'travaillent de nuit'], ['adhérents d\'une association', 'sont bénévoles'], ['donneurs de sang', 'sont du groupe O']
    ];

    var AutoT = {};

    /* ===================================================================
       PROPORTIONS ET POURCENTAGES
       =================================================================== */
    AutoT.proportion = function (niveau) {
        var q = { niveau: niveau, objectif: 'Proportions · Calculer, exprimer une proportion' }, p, N, n, c = A.choix(CONTEXTES);
        if (niveau === 1) {
            p = A.choix([10, 20, 25, 30, 40, 50, 60, 75, 15, 35, 45]); N = A.entier(2, 30) * 20;
            q.type = 'nombre';
            q.texte = 'Calculer $' + pct(p) + '$ de $' + fr(N) + '$.';
            q.attendu = p * N / 100;
            q.explication = '$' + pct(p) + '$ de $' + fr(N) + '=' + fr(p / 100) + '\\times' + fr(N) + '=' + fr(q.attendu) + '$.';
            q.rappel = 'Prendre $p\\,\\%$ d\'un nombre $N$, c\'est multiplier $N$ par $' + frac('p', 100) + '$.<br>' +
                'Astuce de calcul mental : $10\\,\\%$ de $N$, c\'est $N\\div10$ ; $5\\,\\%$, c\'est la moitié de $10\\,\\%$.<br>' +
                'Exemple : $35\\,\\%$ de $80$ : $10\\,\\%$ font $8$, donc $30\\,\\%$ font $24$ ; $5\\,\\%$ font $4$ ; total $28$.';
            return q;
        }
        if (niveau === 2) {
            do { N = A.choix([20, 25, 40, 50, 80, 200, 250, 400, 500, 1200]); p = A.entier(1, 19) * 5; n = p * N / 100; } while (n % 1 || p === 50);
            q.type = 'champs';
            q.texte = 'Sur $' + fr(N) + '$ ' + c[0] + ', $' + fr(n) + '$ ' + c[1] + '. Quelle est leur proportion, en pourcentage ?';
            q.gabarit = '[] $\\,\\%$';
            q.attendus = [p];
            q.explication = 'Proportion $=' + frac('\\text{effectif de la partie}', '\\text{effectif total}') + '=' + frac(fr(n), fr(N)) + '=' + fr(p / 100) + '$, soit $' + pct(p) + '$.';
            return q;
        }
        do { p = A.choix([4, 5, 8, 12, 15, 20, 24, 25, 30, 40, 60, 75]); N = A.entier(2, 40) * 50; n = p * N / 100; } while (n % 1);
        q.type = 'nombre';
        q.texte = 'Dans un groupe de ' + c[0] + ', $' + fr(n) + '$ ' + c[1] + ', ce qui représente $' + pct(p) + '$ du groupe. Combien y a-t-il de ' + c[0].replace(/ d.*$/, '') + ' dans ce groupe ?';
        q.attendu = N;
        q.explication = 'On cherche $N$ tel que $' + fr(p / 100) + '\\times N=' + fr(n) + '$, donc $N=' + frac(fr(n), fr(p / 100)) + '=' + fr(N) + '$.';
        return q;
    };

    AutoT.proportionDeProportion = function (niveau) {
        var q = { niveau: niveau, objectif: 'Proportions · Proportion d\'une proportion' }, a, b;
        var S = A.choix([
            ['des patients d\'un service sont des femmes', 'parmi elles', 'ont plus de 60 ans', 'des patients sont des femmes de plus de 60 ans'],
            ['des élèves d\'un lycée sont internes', 'parmi eux', 'rentrent chez eux le mercredi', 'des élèves sont des internes qui rentrent le mercredi'],
            ['des salariés d\'une clinique sont infirmiers', 'parmi eux', 'travaillent à temps partiel', 'des salariés sont des infirmiers à temps partiel']
        ]);
        if (niveau < 3) {
            if (niveau === 1) { a = A.choix([50, 20, 40, 60, 80]); b = A.choix([10, 20, 25, 50, 30]); }
            else { a = A.choix([30, 45, 60, 70, 35, 65]); b = A.choix([20, 40, 60, 80, 30]); }
            var r = arrondi(a * b / 100);
            q.type = 'champs';
            q.texte = '$' + pct(a) + '$ ' + S[0] + ' ; ' + S[1] + ', $' + pct(b) + '$ ' + S[2] + '. Quel pourcentage ' + S[3] + ' ?';
            q.gabarit = '[] $\\,\\%$';
            q.attendus = [r];
            q.explication = 'On multiplie les proportions : $' + fr(a / 100) + '\\times' + fr(b / 100) + '=' + fr(r / 100) + '$, soit $' + pct(r) + '$.';
            if (niveau === 1) q.rappel = 'La proportion d\'une proportion s\'obtient en <b>multipliant</b> les deux proportions (écrites en décimal).<br>' +
                'Exemple : $50\\,\\%$ des élèves sont des filles et, parmi elles, $40\\,\\%$ font du sport : $0{,}5\\times0{,}4=0{,}2$, soit $20\\,\\%$ des élèves.';
            return q;
        }
        // on connaît la proportion globale et la proportion de la sous-population : on cherche la proportion « parmi »
        do { a = A.choix([20, 25, 40, 50, 60, 80]); b = A.choix([10, 20, 25, 40, 50, 75]); } while ((a * b / 100) % 1);
        var g = a * b / 100;
        q.type = 'champs';
        q.texte = '$' + pct(a) + '$ ' + S[0] + '. On sait que $' + pct(g) + '$ ' + S[3] + '. Quel pourcentage ' + (S[1] === 'parmi elles' ? 'd\'entre elles' : 'd\'entre eux') + ' ' + S[2] + ' ?';
        q.gabarit = '[] $\\,\\%$';
        q.attendus = [b];
        q.explication = 'On cherche $p$ tel que $' + fr(a / 100) + '\\times p=' + fr(g / 100) + '$ : $p=' + frac(fr(g / 100), fr(a / 100)) + '=' + fr(b / 100) + '$, soit $' + pct(b) + '$.';
        return q;
    };

    /* ===================================================================
       ÉVOLUTIONS
       =================================================================== */
    AutoT.coefMultiplicateur = function (niveau) {
        var q = { niveau: niveau, objectif: 'Évolutions · Coefficient multiplicateur' };
        if (niveau === 1) {
            var t = A.choix([A.entier(2, 9), A.entier(11, 45)]), hausse = Math.random() < 0.5, cm = arrondi(1 + (hausse ? t : -t) / 100);
            q.texte = (hausse ? 'Augmenter' : 'Diminuer') + ' une valeur de $' + pct(t) + '$ revient à la multiplier par :';
            q.explication = (hausse ? 'Hausse' : 'Baisse') + ' de $' + pct(t) + '$ : $CM=1' + (hausse ? '+' : '-') + fr(t / 100) + '=' + fr(cm) + '$.';
            q.rappel = 'Augmenter de $t\\,\\%$, c\'est multiplier par $1+' + frac('t', 100) + '$ ; diminuer de $t\\,\\%$, c\'est multiplier par $1-' + frac('t', 100) + '$.<br>' +
                'Exemples : $+8\\,\\%$ : $\\times1{,}08$ ; $-8\\,\\%$ : $\\times0{,}92$ ; $+30\\,\\%$ : $\\times1{,}3$.';
            return qcm(q, '$' + fr(cm) + '$', [arrondi(1 - (hausse ? t : -t) / 100), t / 100, t < 10 ? arrondi(1 + (hausse ? t : -t) / 10) : t].map(function (x) { return '$' + fr(x) + '$'; }));
        }
        if (niveau === 2) {
            var cm2; do { cm2 = Math.random() < 0.5 ? A.entier(51, 98) / 100 : A.entier(102, 160) / 100; } while (cm2 === 1.5);
            var u = Math.round(Math.abs(cm2 - 1) * 100), sens = cm2 > 1 ? 'augmenter' : 'diminuer', autre = cm2 > 1 ? 'diminuer' : 'augmenter';
            q.texte = 'Multiplier une valeur par $' + fr(cm2) + '$ revient à :';
            q.explication = '$' + fr(cm2) + (cm2 > 1 ? '>' : '<') + '1$ : c\'est ' + (cm2 > 1 ? 'une hausse' : 'une baisse') + '. Taux : $' + fr(cm2) + '-1=' + fr(arrondi(cm2 - 1)) + '$, soit $' + (cm2 > 1 ? '+' : '-') + pct(u) + '$.';
            return qcm(q, sens + ' de $' + pct(u) + '$', [sens + ' de $' + pct(Math.round(cm2 * 100)) + '$', autre + ' de $' + pct(u) + '$', autre + ' de $' + pct(Math.round(cm2 * 100)) + '$']);
        }
        // valeur finale ou valeur initiale
        var c3 = A.choix([[25, 1.25], [20, 1.2], [-20, 0.8], [-25, 0.75], [50, 1.5], [-10, 0.9], [10, 1.1], [-40, 0.6], [5, 1.05], [-5, 0.95]]);
        var Vi = A.entier(2, 20) * 20, Vf = arrondi(Vi * c3[1]), fin = Math.random() < 0.5;
        var ev = (c3[0] > 0 ? 'augmente' : 'baisse') + ' de $' + pct(Math.abs(c3[0])) + '$';
        q.type = 'nombre';
        if (fin) {
            q.texte = 'Un tarif de $' + fr(Vi) + '$ € ' + ev + '. Quel est le nouveau tarif (en €) ?';
            q.attendu = Vf;
            q.explication = '$CM=' + fr(c3[1]) + '$ et $' + fr(Vi) + '\\times' + fr(c3[1]) + '=' + fr(Vf) + '$ €.';
        } else {
            q.texte = 'Après avoir ' + (c3[0] > 0 ? 'augmenté' : 'baissé') + ' de $' + pct(Math.abs(c3[0])) + '$, un tarif vaut $' + fr(Vf) + '$ €. Quel était le tarif initial (en €) ?';
            q.attendu = Vi;
            q.explication = '$V_i\\times' + fr(c3[1]) + '=' + fr(Vf) + '$, donc $V_i=' + frac(fr(Vf), fr(c3[1])) + '=' + fr(Vi) + '$ €. (Attention : on ne retire pas $' + pct(Math.abs(c3[0])) + '$ du tarif final !)';
        }
        return q;
    };

    AutoT.evolutionsSuccessives = function (niveau) {
        var q = { niveau: niveau, objectif: 'Évolutions · Évolutions successives' };
        function txt(t) { return (t > 0 ? 'augmente' : 'baisse') + ' de $' + pct(Math.abs(t)) + '$'; }
        if (niveau < 3) {
            var t1, t2, cg;
            do {
                t1 = A.choix([10, 20, 25, 30, 40, 50, 5]) * A.signe();
                t2 = A.choix([10, 20, 25, 30, 40, 50, 5]) * A.signe();
                cg = arrondi((1 + t1 / 100) * (1 + t2 / 100));
            } while (cg === 1 || String(cg).length > 6);
            var c1 = arrondi(1 + t1 / 100), c2 = arrondi(1 + t2 / 100), taux = arrondi((cg - 1) * 100);
            var calc = '$' + fr(c1) + '\\times' + fr(c2) + '=' + fr(cg) + '$';
            if (niveau === 1) {
                q.type = 'nombre';
                q.texte = 'Un prix ' + txt(t1) + ', puis ' + txt(t2) + '. Par quel coefficient multiplicateur global a-t-il été multiplié ?';
                q.attendu = cg;
                q.explication = 'On multiplie les coefficients : ' + calc + '.';
                q.rappel = 'Pour des évolutions successives, on <b>multiplie</b> les coefficients multiplicateurs (on n\'additionne pas les pourcentages).<br>' +
                    'Exemple : $+10\\,\\%$ puis $-20\\,\\%$ : $1{,}1\\times0{,}8=0{,}88$.';
                return q;
            }
            q.texte = 'Un prix ' + txt(t1) + ', puis ' + txt(t2) + '. Au total, le prix a :';
            q.explication = 'Coefficient global : ' + calc + ', ' + (cg > 1 ? 'hausse' : 'baisse') + ' de $' + pct(Math.abs(taux)) + '$ (et non $' + pct(Math.abs(t1 + t2)) + '$).';
            function ev(t) { return t === 0 ? 'retrouvé sa valeur de départ' : (t > 0 ? 'augmenté' : 'baissé') + ' de $' + pct(Math.abs(t)) + '$'; }
            return qcm(q, ev(taux), [ev(t1 + t2), ev(-taux), ev(arrondi((t1 + t2) / 2)), ev(arrondi(cg * 100))]);
        }
        // taux réciproque
        var R = A.choix([[25, -20], [-20, 25], [100, -50], [-50, 100], [300, -75], [-75, 300], [150, -60], [-60, 150], [60, -37.5], [-37.5, 60], [400, -80], [-80, 400]]);
        q.type = 'champs';
        q.texte = 'Un nombre de consultations ' + txt(R[0]) + '. Quelle évolution le ramènerait à sa valeur de départ ?';
        q.gabarit = (R[1] > 0 ? 'une hausse' : 'une baisse') + ' de [] $\\,\\%$';
        q.attendus = [Math.abs(R[1])];
        var c = arrondi(1 + R[0] / 100), cr = arrondi(1 + R[1] / 100);
        q.explication = 'Coefficient réciproque : $' + frac(1, fr(c)) + '=' + fr(cr) + '$, soit ' + (R[1] > 0 ? 'une hausse' : 'une baisse') + ' de $' + pct(Math.abs(R[1])) + '$ (et non de $' + pct(Math.abs(R[0])) + '$).';
        return q;
    };

    AutoT.tauxEvolution = function (niveau) {
        var q = { niveau: niveau, objectif: niveau === 3 ? 'Évolutions · Indice de base 100' : 'Évolutions · Taux d\'évolution' };
        if (niveau < 3) {
            var Vi, Vf, t;
            do {
                Vi = niveau === 1 ? A.choix([50, 100, 200, 400, 500, 1000]) : A.choix([40, 80, 120, 150, 160, 240, 250, 300, 600, 750]);
                t = (niveau === 1 ? A.choix([5, 10, 15, 20, 25, 30, 40, 50]) : A.choix([5, 10, 15, 20, 25, 30, 40, 60, 75])) * A.signe();
                Vf = arrondi(Vi * (1 + t / 100));
            } while (Vf % 1);
            q.type = 'champs';
            q.texte = 'Le nombre de lits d\'un service passe de $' + fr(Vi) + '$ à $' + fr(Vf) + '$. Quel est le taux d\'évolution ? <i>(négatif pour une baisse)</i>';
            q.gabarit = '[] $\\,\\%$';
            q.attendus = [t];
            q.explication = '$t=' + frac('V_f-V_i', 'V_i') + '=' + frac(fr(Vf) + '-' + fr(Vi), fr(Vi)) + '=' + frac(fr(Vf - Vi), fr(Vi)) + '=' + fr(t / 100) + '$, soit $' + (t > 0 ? '+' : '') + pct(t) + '$.';
            if (niveau === 1) q.rappel = 'Taux d\'évolution de $V_i$ à $V_f$ : $t=' + frac('V_f-V_i', 'V_i') + '$ (on divise toujours par la valeur de <b>départ</b>).<br>' +
                'Exemple : de $80$ à $100$ : $' + frac('100-80', 80) + '=' + frac(20, 80) + '=0{,}25$, soit $+25\\,\\%$.';
            return q;
        }
        var an0 = A.choix([2015, 2018, 2020]), an1 = an0 + A.entier(3, 6);
        if (Math.random() < 0.5) {
            var I = A.choix([80, 90, 95, 104, 105, 110, 112, 115, 120, 125, 130, 150]), V0;
            do { V0 = A.entier(2, 30) * 100; } while ((V0 * I / 100) % 1);
            q.type = 'nombre';
            q.texte = 'Le budget d\'un centre de santé était de $' + fr(V0) + '$ € en ' + an0 + ' (indice $100$). En ' + an1 + ', son indice est $' + I + '$. Quel est le budget en ' + an1 + ' (en €) ?';
            q.attendu = V0 * I / 100;
            q.explication = 'Indice $' + I + '$ : le budget a été multiplié par $' + fr(I / 100) + '$. $' + fr(V0) + '\\times' + fr(I / 100) + '=' + fr(q.attendu) + '$ €.';
            return q;
        }
        var I2 = A.choix([75, 85, 92, 108, 112, 118, 124, 135, 160]);
        q.type = 'champs';
        q.texte = 'Le nombre de passages aux urgences d\'un hôpital a pour indice $' + I2 + '$ en ' + an1 + ' (base $100$ en ' + an0 + '). Quel est le taux d\'évolution entre ' + an0 + ' et ' + an1 + ' ? <i>(négatif pour une baisse)</i>';
        q.gabarit = '[] $\\,\\%$';
        q.attendus = [I2 - 100];
        q.explication = 'De l\'indice $100$ à l\'indice $' + I2 + '$ : $' + frac(I2 + '-100', 100) + '=' + fr((I2 - 100) / 100) + '$, soit $' + (I2 > 100 ? '+' : '') + pct(I2 - 100) + '$.';
        return q;
    };

    /* ===================================================================
       ÉQUATIONS, INÉQUATIONS, SIGNE
       =================================================================== */
    AutoT.equation = function (niveau) {
        var q = { niveau: niveau, objectif: 'Équations · Premier degré', type: 'nombre', prefixe: 'x =' }, a, b, c, d, x, g, h;
        if (niveau === 1) {
            x = A.nonNul(-9, 9); a = A.entier(2, 9) * A.signe(); b = A.nonNul(-9, 9); c = a * x + b;
            g = poly([a, b]);
            q.texte = 'Résoudre l\'équation $' + g + '=' + c + '$.';
            q.correction = [g + '&=' + c, a + 'x&=' + c + (b > 0 ? '-' + b : '+' + -b), a + 'x&=' + (c - b), 'x&=' + frac(c - b, a), 'x&=' + x];
            q.attendu = x;
            q.rappel = 'On isole $x$ : on enlève d\'abord le nombre ajouté (des deux côtés), puis on divise par le coefficient de $x$.<br>' +
                'Exemple : $3x+5=17$ ; $3x=17-5=12$ ; $x=' + frac(12, 3) + '=4$.';
            return q;
        }
        if (niveau === 2) {
            do { a = A.nonNul(-9, 9); c = A.nonNul(-9, 9); b = A.nonNul(-12, 12); x = A.nonNul(-6, 6); d = (a - c) * x + b; } while (a === c || Math.abs(d) > 30 || d === 0);
            g = poly([a, b]); h = poly([c, d]);
            q.texte = 'Résoudre l\'équation $' + g + '=' + h + '$.';
            q.correction = [g + '&=' + h, poly([a, 0]) + (c > 0 ? '-' : '+') + poly([Math.abs(c), 0]) + '&=' + d + (b > 0 ? '-' + b : '+' + -b), poly([a - c, 0]) + '&=' + (d - b), 'x&=' + fracTex(d - b, a - c)];
            q.attendu = x;
            return q;
        }
        // avec distributivité : a(x + b) = c x + d ; solution exacte (fraction possible)
        var k;
        do { k = A.entier(2, 6) * A.signe(); b = A.nonNul(-6, 6); c = A.nonNul(-7, 7); d = A.nonNul(-12, 12); } while (k === c || (d - k * b) % (k - c) !== 0 && Math.random() < 0.6);
        g = k + '(' + poly([1, b]) + ')'; h = poly([c, d]);
        q.texte = 'Résoudre l\'équation $' + g + '=' + h + '$ (solution exacte, sous forme de fraction si besoin).';
        q.correction = [g + '&=' + h, poly([k, k * b]) + '&=' + h, poly([k - c, 0]) + '&=' + (d - k * b), 'x&=' + fracTex(d - k * b, k - c)];
        q.attendu = (d - k * b) / (k - c);
        return q;
    };

    function intervalle(a, b, ga, db) {   // ga, db : crochet fermé ?
        return (ga ? '[' : ']') + a + '\\,;\\,' + b + (db ? ']' : '[');
    }
    AutoT.inequation = function (niveau) {
        var q = { niveau: niveau, objectif: 'Inéquations · Premier degré' }, a, b, c, d, x, s;
        var SIG = { '<': '<', '>': '>', '<=': '\\leqslant', '>=': '\\geqslant' }, INV = { '<': '>', '>': '<', '<=': '>=', '>=': '<=' };
        s = A.choix(['<', '>', '<=', '>=']);
        x = A.nonNul(-6, 6);
        if (niveau === 1) { a = A.entier(2, 6); b = A.nonNul(-9, 9); c = a * x + b; }
        else if (niveau === 2) { a = -A.entier(2, 6); b = A.nonNul(-9, 9); c = a * x + b; }
        else { do { a = A.nonNul(-6, 6); d = A.nonNul(-6, 6); } while (a === d); b = A.nonNul(-9, 9); c = (a - d) * x + b; }
        var g = poly([a, b]), h = niveau === 3 ? poly([d, c]) : String(c), coef = niveau === 3 ? a - d : a, droite = niveau === 3 ? c - b : c - b;
        // niveau 3 : a x + b  s  d x + c  ->  (a-d) x  s  c - b
        var sf = coef < 0 ? INV[s] : s;
        function sol(t) { return '$x' + SIG[t] + x + '$'; }
        q.texte = 'Résoudre l\'inéquation $' + g + SIG[s] + h + '$.';
        q.explication = '$' + (niveau === 3 ? poly([coef, 0]) : poly([a, 0])) + SIG[s] + fr(droite) + '$, puis on divise par $' + coef + '$' +
            (coef < 0 ? ', qui est <b>négatif</b> : on change le sens de l\'inégalité' : ' (positif : le sens ne change pas)') + '. Donc ' + sol(sf) + '.';
        if (niveau === 1) q.rappel = 'On résout comme une équation. Quand on multiplie ou divise par un nombre <b>négatif</b>, on <b>change le sens</b> de l\'inégalité.<br>' +
            'Exemple : $2x+1<7$ ; $2x<6$ ; $x<3$.';
        var autres = [sol(INV[sf]), sol(sf.length === 2 ? sf[0] : sf + '='), '$x' + SIG[sf] + fr(-x) + '$'];
        return qcm(q, sol(sf), autres);
    };

    AutoT.signe = function (niveau) {
        var q = { niveau: niveau, objectif: niveau === 3 ? 'Signe · Expression factorisée du second degré' : 'Signe · Expression du premier degré' }, a, b, r;
        if (niveau < 3) {
            do { a = niveau === 1 ? A.entier(1, 5) : -A.entier(1, 5); r = A.nonNul(-5, 5); b = -a * r; } while (b === 0);
            var e = poly([a, b]), pos = a > 0;
            q.texte = 'L\'expression $' + e + '$ est positive (ou nulle) pour :';
            q.explication = '$' + e + '=0$ pour $x=' + r + '$. Le coefficient de $x$ est $' + a + '$, ' + (pos ? 'positif : l\'expression est négative puis positive' : 'négatif : l\'expression est positive puis négative') + '. Donc $' + e + '\\geqslant0$ pour $x' + (pos ? '\\geqslant' : '\\leqslant') + r + '$.';
            if (niveau === 1) q.rappel = '$ax+b$ s\'annule en $x=-' + frac('b', 'a') + '$. Elle est du <b>signe de $a$</b> à droite de cette valeur, et du signe contraire à gauche.<br>' +
                'Exemple : $2x-6=0$ pour $x=3$ ; $a=2>0$ : $2x-6$ est négative pour $x<3$ et positive pour $x>3$.';
            return qcm(q, '$x' + (pos ? '\\geqslant' : '\\leqslant') + r + '$', ['$x' + (pos ? '\\leqslant' : '\\geqslant') + r + '$', '$x' + (pos ? '\\geqslant' : '\\leqslant') + fr(-r) + '$', '$x' + (pos ? '\\leqslant' : '\\geqslant') + fr(-r) + '$']);
        }
        var x1 = A.entier(-4, 2), x2 = x1 + A.entier(1, 4), k = A.choix([1, 2, 3, -1, -2, -3]);
        var e3 = (k === 1 ? '' : k === -1 ? '-' : k) + '(' + poly([1, -x1]) + ')(' + poly([1, -x2]) + ')';
        q.texte = 'L\'expression $' + e3 + '$ est strictement négative sur :';
        var dedans = '$' + intervalle(x1, x2, false, false) + '$', dehors = '$]-\\infty\\,;\\,' + x1 + '[\\,\\cup\\,]' + x2 + '\\,;\\,+\\infty[$';
        q.explication = 'Elle s\'annule en $' + x1 + '$ et en $' + x2 + '$. C\'est un trinôme de coefficient $a=' + k + '$ ' + (k > 0 ? '$>0$ : parabole « en U », négative <b>entre</b> les racines' : '$<0$ : parabole « en ∩ », négative <b>à l\'extérieur</b> des racines') + '.';
        return qcm(q, k > 0 ? dedans : dehors, [k > 0 ? dehors : dedans, '$' + intervalle(-x2, -x1, false, false) + '$', '$' + intervalle(x1, x2, true, true) + '$']);
    };

    /* ===================================================================
       DROITES
       =================================================================== */
    function repere(o) {                   // o = { xmin, xmax, ymin, ymax, c (px par unité), courbe: [[x, y]…], droite: {m, p} }
        var c = o.c || 34, m = 22;
        var W = (o.xmax - o.xmin) * c + 2 * m, H = (o.ymax - o.ymin) * c + 2 * m;
        function X(x) { return m + (x - o.xmin) * c; }
        function Y(y) { return m + (o.ymax - y) * c; }
        var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Repère">', k;
        for (k = o.xmin; k <= o.xmax; k++) s += '<line class="fig-grille" x1="' + X(k) + '" y1="' + m + '" x2="' + X(k) + '" y2="' + (H - m) + '"/>';
        for (k = o.ymin; k <= o.ymax; k++) s += '<line class="fig-grille" x1="' + m + '" y1="' + Y(k) + '" x2="' + (W - m) + '" y2="' + Y(k) + '"/>';
        s += '<line class="fig-axe" x1="' + (m - 6) + '" y1="' + Y(0) + '" x2="' + (W - m + 8) + '" y2="' + Y(0) + '"/>';
        s += '<line class="fig-axe" x1="' + X(0) + '" y1="' + (H - m + 6) + '" x2="' + X(0) + '" y2="' + (m - 8) + '"/>';
        for (k = o.xmin; k <= o.xmax; k++) if (k !== 0) s += '<text class="fig-txt" x="' + X(k) + '" y="' + (Y(0) + 15) + '" text-anchor="middle">' + (k < 0 ? '−' + (-k) : k) + '</text>';
        for (k = o.ymin; k <= o.ymax; k++) if (k !== 0) s += '<text class="fig-txt" x="' + (X(0) - 5) + '" y="' + (Y(k) + 4) + '" text-anchor="end">' + (k < 0 ? '−' + (-k) : k) + '</text>';
        s += '<text class="fig-txt" x="' + (X(0) - 5) + '" y="' + (Y(0) + 15) + '" text-anchor="end">0</text>';
        if (o.droite) {
            var d = o.droite, xa = o.xmin, xb = o.xmax;
            // on coupe la droite au cadre
            function yd(x) { return d.m * x + d.p; }
            if (d.m !== 0) {
                xa = Math.max(xa, Math.min((o.ymin - d.p) / d.m, (o.ymax - d.p) / d.m));
                xb = Math.min(xb, Math.max((o.ymin - d.p) / d.m, (o.ymax - d.p) / d.m));
            }
            s += '<line class="fig-courbe" x1="' + X(xa) + '" y1="' + Y(yd(xa)) + '" x2="' + X(xb) + '" y2="' + Y(yd(xb)) + '"/>';
            if (o.nom) s += '<text class="fig-nom" x="' + (X(xb) - 6) + '" y="' + (Y(yd(xb)) + (d.m > 0 ? 18 : -8)) + '" text-anchor="end">' + o.nom + '</text>';
        }
        if (o.courbe) {
            s += '<path class="fig-courbe" d="M' + o.courbe.map(function (P) { return X(P[0]).toFixed(1) + ' ' + Y(P[1]).toFixed(1); }).join(' L') + '"/>';
            var f = o.courbe[o.courbe.length - 1];
            s += '<text class="fig-nom" x="' + (X(f[0]) - 4) + '" y="' + (Y(f[1]) + (f[1] >= o.ymax - 1 ? 22 : -10)) + '" text-anchor="end">' + (o.nom || '𝒞') + '</text>';
        }
        return s + '</svg>';
    }

    AutoT.equationDroite = function (niveau) {
        var q = { niveau: niveau, objectif: 'Droites · Équation réduite' }, m, p;
        function eq(m, p) { return 'y=' + (m === 0 ? fr(p) : (m === 1 ? '' : m === -1 ? '-' : fracOuNombre(m)) + 'x' + (p === 0 ? '' : terme(p))); }
        function fracOuNombre(v) { return v % 1 ? (v < 0 ? '-' : '') + frac(fr(Math.abs(2 * v)), 2) : fr(v); }
        if (niveau < 3) {
            do {
                m = niveau === 1 ? A.nonNul(-3, 3) : A.choix([0.5, -0.5, 2, -2, 3, -3, 1.5, -1.5]);
                p = A.entier(-3, 3);
            } while (niveau === 2 && m % 1 === 0 && Math.random() < 0.5);
            q.figure = repere({ xmin: -5, xmax: 5, ymin: -4, ymax: 4, droite: { m: m, p: p }, nom: '(d)' });
            q.figureNote = 'droite y = ' + fr(m).replace('{,}', ',') + 'x + ' + p;
            q.texte = 'Lire graphiquement l\'équation réduite de la droite $(d)$.';
            var expl = 'La droite coupe l\'axe des ordonnées en $' + p + '$ : $p=' + p + '$. Quand $x$ augmente de $' + (m % 1 ? 2 : 1) + '$, $y$ ' + (m > 0 ? 'augmente' : 'diminue') + ' de $' + fr(Math.abs(m % 1 ? 2 * m : m)) + '$ : $m=' + (m % 1 ? frac(fr(2 * m), 2) + '=' : '') + fr(m) + '$. Donc $(d)\\ :\\ ' + eq(m, p) + '$.';
            q.explication = expl;
            if (niveau === 1) {
                q.rappel = 'Équation réduite : $y=mx+p$. <b>$p$</b> = ordonnée du point où la droite coupe l\'axe des ordonnées ; <b>$m$</b> = coefficient directeur : de combien monte (ou descend) la droite quand on avance de $1$ vers la droite.';
                return qcm(q, '$' + eq(m, p) + '$', ['$' + eq(p === 0 ? 1 : p, m) + '$', '$' + eq(-m, p) + '$', '$' + eq(m, -p) + '$', '$' + eq(-m, -p) + '$']);
            }
            q.type = 'champs';
            q.gabarit = '$y=$ [] $x+$ []';
            q.attendus = [m, p];
            q.explication += '<br><i>On peut écrire $0{,}5$ ou $1/2$.</i>';
            return q;
        }
        var x1, x2, y1, y2;
        do { x1 = A.entier(-4, 4); x2 = A.entier(-4, 4); m = A.nonNul(-4, 4); p = A.entier(-6, 6); } while (x1 === x2);
        if (x1 > x2) { var t = x1; x1 = x2; x2 = t; }
        y1 = m * x1 + p; y2 = m * x2 + p;
        q.type = 'champs';
        q.texte = 'Déterminer l\'équation réduite de la droite $(AB)$, avec $A(' + x1 + '\\ ;\\ ' + y1 + ')$ et $B(' + x2 + '\\ ;\\ ' + y2 + ')$.';
        q.gabarit = '$y=$ [] $x+$ []';
        q.attendus = [m, p];
        q.explication = '$m=' + frac('y_B-y_A', 'x_B-x_A') + '=' + frac(y2 + '-' + par(y1), x2 + '-' + par(x1)) + '=' + frac(y2 - y1, x2 - x1) + '=' + m + '$.<br>' +
            '$A$ est sur la droite : $' + y1 + '=' + m + '\\times' + par(x1) + '+p$, donc $p=' + y1 + (m * x1 > 0 ? '-' + m * x1 : '+' + (-m * x1)) + '=' + p + '$. Donc $y=' + poly([m, p]) + '$.';
        return q;
    };

    /* ===================================================================
       LECTURE GRAPHIQUE (courbe lisse passant par des points à coordonnées entières)
       Les nœuds sont aux abscisses entières, deux nœuds voisins diffèrent de 1 en ordonnée, et l'interpolation
       est monotone entre deux nœuds (Fritsch-Carlson) : une valeur entière k n'est atteinte qu'en des nœuds,
       les extremums sont des nœuds ; toutes les réponses se lisent donc exactement sur le quadrillage.
       =================================================================== */
    function courbeAleatoire() {
        for (;;) {
            var xmin = A.choix([-4, -3, -2]), n = 8, ys = [A.entier(-2, 2)], dir = A.signe(), run = 0;
            for (var i = 1; i <= n; i++) {
                if (run >= A.entier(2, 4)) { dir = -dir; run = 0; }
                ys.push(ys[i - 1] + dir); run++;
            }
            var lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys);
            if (lo < -3 || hi > 4 || hi - lo < 3) continue;
            var xs = ys.map(function (_, k) { return xmin + k; });
            return { xs: xs, ys: ys, xmin: xmin, xmax: xmin + n, points: lisser(xs, ys) };
        }
    }
    function lisser(xs, ys) {                 // spline cubique monotone (Fritsch-Carlson), points échantillonnés
        var n = xs.length, d = [], t = [], i;
        for (i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
        t[0] = d[0]; t[n - 1] = d[n - 2];
        for (i = 1; i < n - 1; i++) t[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
        var pts = [];
        for (i = 0; i < n - 1; i++) {
            for (var k = 0; k < 12; k++) {
                var s = k / 12, h = xs[i + 1] - xs[i];
                var h00 = 2 * s * s * s - 3 * s * s + 1, h10 = s * s * s - 2 * s * s + s, h01 = -2 * s * s * s + 3 * s * s, h11 = s * s * s - s * s;
                pts.push([xs[i] + s * h, h00 * ys[i] + h10 * h * t[i] + h01 * ys[i + 1] + h11 * h * t[i + 1]]);
            }
        }
        pts.push([xs[n - 1], ys[n - 1]]);
        return pts;
    }
    function figureCourbe(C) {
        return repere({ xmin: Math.min(C.xmin, -1), xmax: C.xmax, ymin: -4, ymax: 5, c: 32, courbe: C.points, nom: '𝒞<tspan font-size="12">f</tspan>' });
    }
    function noteCourbe(C) { return 'courbe passant par ' + C.xs.map(function (x, k) { return '(' + x + ';' + C.ys[k] + ')'; }).join(' '); }
    function ensemble(t) { return t.length ? '$\\{' + t.join('\\ ;\\ ') + '\\}$' : '$\\varnothing$ (aucun)'; }
    function antecedents(C, k) { return C.xs.filter(function (x, i) { return C.ys[i] === k; }); }
    // valeurs k qui sont atteintes sans être un extremum local en un nœud intérieur (pas de point isolé dans les inéquations)
    function niveauxPropres(C) {
        var bons = [];
        for (var k = -3; k <= 4; k++) {
            var idx = C.ys.map(function (y, i) { return y === k ? i : -1; }).filter(function (i) { return i >= 0; });
            if (!idx.length) continue;
            // aux extrémités, une valeur k donnerait un point isolé (f(x) ≤ k) : exclue
            if (idx.every(function (i) { return i > 0 && i < C.ys.length - 1 && (C.ys[i - 1] - k) * (C.ys[i + 1] - k) < 0; })) bons.push(k);
        }
        return bons;
    }
    // ensemble des x de [xmin ; xmax] tels que f(x) [op] k, en intervalles TeX
    function resoudre(C, k, op) {
        function ok(v) { return op === '<' ? v < k : op === '<=' ? v <= k : op === '>' ? v > k : v >= k; }
        var n = C.xs.length, morceaux = [], cur = null;
        // points : nœud i ; ouvert (i, i+1) : signe de l'extrémité non égale à k
        for (var i = 0; i < n; i++) {
            var vNoeud = ok(C.ys[i]);
            if (vNoeud) { if (!cur) cur = { a: C.xs[i], ga: true }; }
            else if (cur) { cur.b = C.xs[i]; cur.db = false; morceaux.push(cur); cur = null; }
            if (i === n - 1) { if (cur) { cur.b = C.xs[i]; cur.db = true; morceaux.push(cur); cur = null; } break; }
            var vIntervalle = ok(C.ys[i] !== k ? C.ys[i] : C.ys[i + 1]);
            if (vIntervalle) { if (!cur) cur = { a: C.xs[i], ga: false }; }
            else if (cur) { cur.b = C.xs[i]; cur.db = vNoeud; morceaux.push(cur); cur = null; }
        }
        return morceaux;
    }
    function texIntervalles(m) {
        return m.length ? '$' + m.map(function (I) { return intervalle(I.a, I.b, I.ga, I.db); }).join('\\cup') + '$' : '$\\varnothing$';
    }

    AutoT.lectureGraphique = function (niveau) {
        var q = { niveau: niveau, objectif: niveau === 3 ? 'Fonctions · Extremum, lecture graphique' : 'Fonctions · Images et antécédents' }, C = courbeAleatoire();
        q.figure = figureCourbe(C); q.figureNote = noteCourbe(C);
        var intro = 'On considère la fonction $f$ définie sur $[' + C.xmin + '\\,;\\,' + C.xmax + ']$ et représentée ci-dessous. ';
        if (niveau === 1) {
            var i = A.entier(0, C.xs.length - 1), x0 = C.xs[i];
            q.type = 'nombre';
            q.texte = intro + 'Quelle est l\'image de $' + x0 + '$ par $f$ ?';
            q.prefixe = 'f(' + x0 + ')=';
            q.attendu = C.ys[i];
            q.explication = 'On part de $' + x0 + '$ sur l\'axe des <b>abscisses</b>, on rejoint la courbe, et on lit l\'ordonnée : $f(' + x0 + ')=' + C.ys[i] + '$.';
            q.rappel = 'L\'<b>image</b> de $a$ : on part de $a$ sur l\'axe horizontal (abscisses), on monte ou on descend jusqu\'à la courbe, puis on lit la valeur sur l\'axe vertical.<br>' +
                'Un <b>antécédent</b> de $b$ : c\'est l\'inverse, on part de $b$ sur l\'axe vertical.';
            return q;
        }
        if (niveau === 2) {
            var ks = []; for (var k = -3; k <= 4; k++) if (antecedents(C, k).length >= 2) ks.push(k);
            if (!ks.length) return AutoT.lectureGraphique(2);
            var kk = A.choix(ks), S = antecedents(C, kk);
            q.texte = intro + 'Quels sont les antécédents de $' + kk + '$ par $f$ ?';
            q.explication = 'On part de $' + kk + '$ sur l\'axe des <b>ordonnées</b> : la droite horizontale $y=' + kk + '$ coupe la courbe aux points d\'abscisses $' + S.join('$ et $') + '$.';
            var im = C.xs.indexOf(kk) >= 0 ? [C.ys[C.xs.indexOf(kk)]] : null;
            var autres = [ensemble(S.slice(0, S.length - 1)), im ? ensemble(im) : null, ensemble(antecedents(C, kk + 1)), ensemble(antecedents(C, kk - 1)), ensemble(S.map(function (x) { return -x; }).sort(function (u, v) { return u - v; }))];
            return qcm(q, ensemble(S), autres);
        }
        var maxi = Math.random() < 0.5, val = (maxi ? Math.max : Math.min).apply(null, C.ys), ou = C.xs[C.ys.indexOf(val)];
        if (C.ys.filter(function (y) { return y === val; }).length > 1) return AutoT.lectureGraphique(3);
        q.type = 'champs';
        q.texte = intro + 'Quel est le ' + (maxi ? 'maximum' : 'minimum') + ' de $f$ sur $[' + C.xmin + '\\,;\\,' + C.xmax + ']$, et pour quelle valeur de $x$ est-il atteint ?';
        q.gabarit = (maxi ? 'maximum' : 'minimum') + ' : [] &nbsp; atteint en $x=$ []';
        q.attendus = [val, ou];
        q.explication = 'Le point le plus ' + (maxi ? 'haut' : 'bas') + ' de la courbe est $(' + ou + '\\ ;\\ ' + val + ')$ : le ' + (maxi ? 'maximum' : 'minimum') + ' est $' + val + '$ (une <b>ordonnée</b>), atteint en $x=' + ou + '$.';
        return q;
    };

    AutoT.resolutionGraphique = function (niveau) {
        var q = { niveau: niveau, objectif: niveau === 1 ? 'Fonctions · Résoudre graphiquement f(x) = k' : 'Fonctions · Résoudre graphiquement une inéquation' };
        var C, ks, k, op, SIG = { '<': '<', '>': '>', '<=': '\\leqslant', '>=': '\\geqslant' };
        for (;;) {
            C = courbeAleatoire(); ks = niveauxPropres(C);
            if (niveau === 1) { ks = []; for (var kk = -3; kk <= 4; kk++) if (antecedents(C, kk).length >= 1 && antecedents(C, kk).length <= 3) ks.push(kk); }
            if (niveau === 2) ks = ks.filter(function (k) { return resoudre(C, k, '<').length === 1 && resoudre(C, k, '>').length === 1; });
            if (niveau === 3) ks = ks.filter(function (k) { return resoudre(C, k, '<').length + resoudre(C, k, '>').length >= 3; });
            if (ks.length) break;
        }
        k = A.choix(ks);
        q.figure = figureCourbe(C); q.figureNote = noteCourbe(C);
        var intro = 'On considère la fonction $f$ définie sur $[' + C.xmin + '\\,;\\,' + C.xmax + ']$ et représentée ci-dessous. ';
        if (niveau === 1) {
            var S = antecedents(C, k);
            q.texte = intro + 'Résoudre graphiquement l\'équation $f(x)=' + k + '$.';
            q.explication = 'On trace la droite horizontale $y=' + k + '$ et on lit les <b>abscisses</b> des points d\'intersection avec la courbe : $S=' + ensemble(S).replace(/\$/g, '') + '$.';
            q.rappel = 'Résoudre $f(x)=k$, c\'est trouver les <b>antécédents</b> de $k$ : on trace la droite horizontale $y=k$ et on lit les abscisses des points où elle coupe la courbe.';
            var im = C.xs.indexOf(k) >= 0 ? [C.ys[C.xs.indexOf(k)]] : null;
            return qcm(q, ensemble(S), [S.length > 1 ? ensemble(S.slice(1)) : null, im ? ensemble(im) : null, ensemble(antecedents(C, k + 1)), ensemble(antecedents(C, k - 1)), ensemble(S.map(function (x) { return x + 1; }))]);
        }
        op = A.choix(['<', '>', '<=', '>=']);
        var sol = resoudre(C, k, op), oppose = { '<': '>=', '>': '<=', '<=': '>', '>=': '<' }[op], large = { '<': '<=', '>': '>=', '<=': '<', '>=': '>' }[op];
        q.texte = intro + 'Résoudre graphiquement l\'inéquation $f(x)' + SIG[op] + k + '$.';
        q.explication = 'On cherche les abscisses des points de la courbe situés ' + (op[0] === '<' ? 'en dessous' : 'au-dessus') + ' de la droite $y=' + k + '$' + (op.length === 2 ? ' (ou sur la droite : crochets fermés)' : ' (strictement : crochets ouverts en ces points)') + ' : $S=' + texIntervalles(sol).replace(/\$/g, '') + '$.';
        // piège « ordonnées » : on donne un intervalle de valeurs de y
        var ys = [Math.min.apply(null, C.ys), Math.max.apply(null, C.ys)], piegeY = op[0] === '<' ? '$' + intervalle(ys[0], k, true, op.length === 2) + '$' : '$' + intervalle(k, ys[1], op.length === 2, true) + '$';
        return qcm(q, texIntervalles(sol), [texIntervalles(resoudre(C, k, large)), texIntervalles(resoudre(C, k, oppose)), piegeY, texIntervalles(resoudre(C, k, { '<': '>', '>': '<', '<=': '>=', '>=': '<=' }[op]))]);
    };

    /* ===================================================================
       SUITES
       =================================================================== */
    AutoT.suiteRecurrence = function (niveau) {
        var q = { niveau: niveau, objectif: 'Suites · Calculer des termes par récurrence', type: 'nombre' }, u0, r, k, i, u, c = [];
        function sys(premier, rel) { return '$$\\begin{cases} ' + premier + ' \\\\ ' + rel + ' \\end{cases}$$'; }
        if (niveau === 1) {
            u0 = A.entier(-10, 30); r = A.nonNul(-9, 9); k = A.entier(2, 4);
            q.texte = 'La suite $u$ est définie, pour tout entier naturel $n$, par :' + sys('u_0=' + u0, 'u_{n+1}=u_n' + terme(r)) + 'Calculer $u_' + k + '$.';
            u = u0;
            for (i = 1; i <= k; i++) { c.push('u_' + i + '&=u_' + (i - 1) + terme(r) + '=' + par(u) + terme(r) + '=' + (u + r)); u += r; }
            q.attendu = u; q.correction = c; q.prefixe = 'u_' + k + '=';
            q.rappel = '$u_{n+1}$ est le terme qui suit $u_n$ : on remplace $n$ par $0$ pour obtenir $u_1$ à partir de $u_0$, puis par $1$ pour obtenir $u_2$ à partir de $u_1$, etc.<br>' +
                'Exemple : $u_0=5$ et $u_{n+1}=u_n+3$ : $u_1=5+3=8$, $u_2=8+3=11$.';
            return q;
        }
        if (niveau === 2) {
            var g = A.choix([[2, [1, 3, 5, 10, 25]], [3, [1, 2, 5, 10]], [0.5, [80, 200, 400, 1000, 64]], [1.5, [40, 100, 200, 400]], [0.9, [100, 1000, 500]], [1.1, [100, 1000, 200]], [1.2, [100, 500, 250]]]);
            u0 = A.choix(g[1]); k = 2;
            q.texte = 'La suite $u$ est définie, pour tout entier naturel $n$, par :' + sys('u_0=' + fr(u0), 'u_{n+1}=' + fr(g[0]) + '\\times u_n') + 'Calculer $u_' + k + '$.';
            u = u0;
            for (i = 1; i <= k; i++) { c.push('u_' + i + '&=' + fr(g[0]) + '\\times u_' + (i - 1) + '=' + fr(g[0]) + '\\times' + fr(u) + '=' + fr(arrondi(u * g[0]))); u = arrondi(u * g[0]); }
            q.attendu = u; q.correction = c; q.prefixe = 'u_' + k + '=';
            return q;
        }
        var a = A.choix([2, 3, -2, 2, 3]), b;
        do { u0 = A.nonNul(-4, 5); b = A.nonNul(-6, 6); } while (Math.abs(a * (a * u0 + b) + b) > 200);
        q.texte = 'La suite $u$ est définie, pour tout entier naturel $n\\geqslant1$, par :' + sys('u_1=' + u0, 'u_{n+1}=' + a + '\\times u_n' + terme(b)) + 'Calculer $u_3$.';
        u = u0;
        for (i = 2; i <= 3; i++) { c.push('u_' + i + '&=' + a + '\\times u_' + (i - 1) + terme(b) + '=' + a + '\\times' + par(u) + terme(b) + '=' + (a * u + b)); u = a * u + b; }
        q.attendu = u; q.correction = c; q.prefixe = 'u_3=';
        return q;
    };

    AutoT.suiteTermeGeneral = function (niveau) {
        var q = { niveau: niveau, objectif: niveau === 3 ? 'Suites · Reconnaître une suite géométrique' : 'Suites · Terme général' }, u0, r, n;
        if (niveau === 1) {
            u0 = A.entier(-20, 50); r = A.nonNul(-8, 8); n = A.choix([10, 20, 50, 100]);
            q.type = 'nombre';
            q.texte = '$u$ est la suite arithmétique de premier terme $u_0=' + u0 + '$ et de raison $r=' + r + '$. Calculer $u_{' + n + '}$.';
            q.prefixe = 'u_{' + n + '}=';
            q.attendu = u0 + n * r;
            q.correction = ['u_n&=u_0+n\\times r', 'u_{' + n + '}&=' + u0 + '+' + n + '\\times' + par(r), '&=' + u0 + terme(n * r), '&=' + q.attendu];
            q.rappel = 'Suite arithmétique : $u_n=u_0+n\\times r$ (on ajoute $n$ fois la raison).<br>Suite géométrique : $u_n=u_0\\times q^n$ (on multiplie $n$ fois par la raison).<br>' +
                'Exemple : $u_0=4$, $r=3$ : $u_{10}=4+10\\times3=34$.';
            return q;
        }
        if (niveau === 2) {
            var g = A.choix([[2, [1, 3, 5, 10]], [3, [1, 2, 4]], [0.5, [64, 160, 800, 2000]], [10, [2, 3, 5]], [1.1, [1000]], [0.2, [500, 1000]]]);
            u0 = A.choix(g[1]); n = g[0] === 1.1 ? 2 : A.choix([3, 4]);
            if (g[0] === 0.2 && n === 4) n = 3;
            var v = arrondi(u0 * Math.pow(g[0], n));
            q.type = 'nombre';
            q.texte = '$v$ est la suite géométrique de premier terme $v_0=' + fr(u0) + '$ et de raison $q=' + fr(g[0]) + '$. Calculer $v_' + n + '$.';
            q.prefixe = 'v_' + n + '=';
            q.attendu = v;
            q.correction = ['v_n&=v_0\\times q^n', 'v_' + n + '&=' + fr(u0) + '\\times' + fr(g[0]) + '^' + n, '&=' + fr(u0) + '\\times' + fr(arrondi(Math.pow(g[0], n))), '&=' + fr(v)];
            return q;
        }
        var S = A.choix([
            { t: 'Une population de bactéries augmente de $' + pct(r = A.choix([5, 8, 12, 20, 30])) + '$ chaque heure.', geo: true, q: 1 + r / 100, faux: [r / 100, r] },
            { t: 'Le nombre de cas d\'une maladie baisse de $' + pct(r = A.choix([4, 10, 15, 25])) + '$ chaque semaine.', geo: true, q: 1 - r / 100, faux: [r / 100, 1 + r / 100] },
            { t: 'La concentration d\'un médicament dans le sang diminue de $' + pct(r = A.choix([10, 20, 30])) + '$ chaque heure.', geo: true, q: 1 - r / 100, faux: [r / 100, -r] },
            { t: 'Une infirmière met $' + (r = A.choix([20, 30, 50])) + '$ € de côté chaque mois.', geo: false, q: r, faux: [1 + r / 100, r / 100] },
            { t: 'Une association gagne $' + (r = A.choix([12, 15, 25])) + '$ nouveaux adhérents chaque année.', geo: false, q: r, faux: [1 + r / 100, r / 100] }
        ]);
        q.texte = S.t + ' La quantité, période après période, est modélisée par une suite :';
        function nom(geo, rr) { return (geo ? 'géométrique' : 'arithmétique') + ' de raison $' + fr(arrondi(rr)) + '$'; }
        q.explication = S.geo ? 'Chaque période, on <b>multiplie</b> par le même coefficient $' + fr(arrondi(S.q)) + '$ : suite géométrique de raison $' + fr(arrondi(S.q)) + '$.'
                              : 'Chaque mois (ou année), on <b>ajoute</b> le même nombre $' + S.q + '$ : suite arithmétique de raison $' + S.q + '$.';
        return qcm(q, nom(S.geo, S.q), [nom(!S.geo, S.q), nom(S.geo, S.faux[0]), nom(!S.geo, S.faux[1]), nom(S.geo, S.faux[1])]);
    };

    /* ===================================================================
       FONCTION INVERSE (Séquence 3)
       =================================================================== */
    AutoT.fonctionInverse = function (niveau) {
        var q = { niveau: niveau, objectif: 'Fonction inverse · Images et antécédents', type: 'nombre' }, a;
        if (niveau === 1) {
            a = A.choix([[2, '2'], [4, '4'], [5, '5'], [10, '10'], [-2, '-2'], [-10, '-10'], [0.5, '0{,}5'], [0.25, '0{,}25'], [0.1, '0{,}1'], [-0.5, '-0{,}5'], [100, '100']]);
            q.texte = 'On considère la fonction inverse $f(x)=' + frac(1, 'x') + '$. Calculer $f(' + a[1] + ')$.';
            q.prefixe = 'f(' + a[1] + ')=';
            q.attendu = arrondi(1 / a[0]);
            q.explication = '$f(' + a[1] + ')=' + frac(1, a[1]) + '=' + fr(q.attendu) + '$' + (Math.abs(a[0]) < 1 ? ' : diviser par un nombre plus petit que $1$ donne un résultat plus grand.' : '.');
            q.rappel = 'L\'inverse de $a$ est $' + frac(1, 'a') + '$ : c\'est le nombre qui, multiplié par $a$, donne $1$.<br>' +
                'Exemples : $' + frac(1, 4) + '=0{,}25$ ; $' + frac(1, '0{,}2') + '=5$ (car $0{,}2\\times5=1$) ; $' + frac(1, -2) + '=-0{,}5$.';
            return q;
        }
        if (niveau === 2) {
            var k = A.choix([600, 120, 240, 360, 500, 1000, 80]), c = A.entier(1, 9), divs = [];
            for (var d = 2; d <= k; d++) if (k % d === 0 && [2, 4, 5, 8, 10, 20, 40, 50, 100, 200, 120, 60, 30, 40, 250].indexOf(d) >= 0) divs.push(d);
            var n = A.choix(divs);
            q.texte = 'Le coût moyen de production (en €) de $n$ tests est $M(n)=' + frac(k, 'n') + '+' + c + '$. Calculer $M(' + n + ')$.';
            q.prefixe = 'M(' + n + ')=';
            q.attendu = k / n + c;
            q.explication = '$M(' + n + ')=' + frac(k, n) + '+' + c + '=' + fr(k / n) + '+' + c + '=' + fr(q.attendu) + '$ €.';
            return q;
        }
        var kk = A.choix([2, 3, 4, 5, 6, 8, 10, 12]), v, cc = A.entier(0, 4);
        var sols = []; for (var x = 1; x <= 12; x++) if (kk % x === 0) sols.push(x);
        var x0 = A.choix(sols) * A.signe(); v = kk / x0 + cc;
        var expr = frac(kk, 'x') + (cc ? '+' + cc : '');
        q.texte = 'Soit $g(x)=' + expr + '$ pour $x\\neq0$. Résoudre l\'équation $g(x)=' + fr(v) + '$.';
        q.prefixe = 'x =';
        q.attendu = x0;
        q.correction = [expr + '&=' + fr(v)].concat(cc ? [frac(kk, 'x') + '&=' + fr(v - cc)] : []).concat([kk + '&=' + fr(v - cc) + 'x', 'x&=' + frac(kk, fr(v - cc)) + '=' + x0]);
        return q;
    };

    AutoT.deriveeInverse = function (niveau) {
        var q = { niveau: niveau, objectif: niveau === 3 ? 'Dérivation · Coefficient directeur d\'une tangente' : 'Dérivation · Fonction inverse et sens de variation' }, k;
        if (niveau === 1) {
            k = A.choix([2, 3, 4, 5, 7, 10, 600]);
            q.texte = 'Soit $f(x)=' + frac(k, 'x') + '$ pour $x>0$. Sa fonction dérivée est :';
            q.explication = 'La dérivée de $' + frac(1, 'x') + '$ est $-' + frac(1, 'x^2') + '$, donc celle de $' + frac(k, 'x') + '$ est $-' + frac(k, 'x^2') + '$.';
            q.rappel = '$\\left(' + frac(1, 'x') + '\\right)\'=-' + frac(1, 'x^2') + '$ et, pour un nombre $k$, $\\left(' + frac('k', 'x') + '\\right)\'=-' + frac('k', 'x^2') + '$.<br>' +
                'Exemple : $\\left(' + frac(3, 'x') + '\\right)\'=-' + frac(3, 'x^2') + '$.';
            return qcm(q, '$f\'(x)=-' + frac(k, 'x^2') + '$', ['$f\'(x)=' + frac(k, 'x^2') + '$', '$f\'(x)=-' + frac(k, 'x') + '$', '$f\'(x)=' + k + '$']);
        }
        if (niveau === 2) {
            k = A.choix([100, 200, 300, 500, 600, 1200]); var c = A.entier(1, 9);
            q.texte = 'Le coût moyen d\'un examen est $M(n)=' + frac(k, 'n') + '+' + c + '$ pour $n\\geqslant1$. Sur $[1\\,;+\\infty[$, la fonction $M$ est :';
            q.explication = '$M\'(n)=-' + frac(k, 'n^2') + '+0$. Un carré est positif, donc $M\'(n)<0$ : $M$ est <b>décroissante</b> sur $[1\\,;+\\infty[$ (le coût moyen baisse quand on fait plus d\'examens).';
            return qcm(q, 'décroissante', ['croissante', 'décroissante, puis croissante', 'constante']);
        }
        k = A.choix([2, 4, 6, 8, 12, 16, 18]);
        var as = []; for (var a = 1; a <= 4; a++) if (k % (a * a) === 0) as.push(a);
        var a0 = A.choix(as.length > 1 ? as.slice(1) : as) * A.signe();
        q.type = 'nombre';
        q.texte = 'Soit $f(x)=' + frac(k, 'x') + '$ pour $x\\neq0$. Calculer le coefficient directeur de la tangente à la courbe de $f$ au point d\'abscisse $' + a0 + '$.';
        q.prefixe = 'f\'(' + a0 + ')=';
        q.attendu = -k / (a0 * a0);
        q.correction = ['f\'(x)&=-' + frac(k, 'x^2'), 'f\'(' + a0 + ')&=-' + frac(k, par(a0) + '^2') + '=-' + frac(k, a0 * a0) + '=' + fr(q.attendu)];
        return q;
    };

    AutoT.derivee = function (niveau) {
        var q = { niveau: niveau, objectif: 'Dérivation · Dérivée d\'un polynôme', type: 'expr', forme: 'developpee', prefixe: 'f\'(x)=' }, c;
        if (niveau === 1) {
            c = [A.nonNul(-9, 9), A.nonNul(-9, 9), A.nonNul(-9, 9)];
            if (Math.random() < 0.5) c[1] = 0;
            q.enonce = 'f(x)=' + poly(c);
            q.consigne = 'Calculer la dérivée de';
            q.attendu = poly([2 * c[0], c[1]]);
            q.correction = ['f(x)&=' + poly(c), 'f\'(x)&=' + c[0] + '\\times2x' + (c[1] ? terme(c[1]) : '') + '+0', '&=' + q.attendu];
            q.rappel = 'Dérivées à connaître : $(x^3)\'=3x^2$ ; $(x^2)\'=2x$ ; $(x)\'=1$ ; un nombre seul a pour dérivée $0$. On dérive terme à terme et un coefficient reste devant.<br>' +
                'Exemple : $f(x)=5x^2-3x+7$ donne $f\'(x)=5\\times2x-3=10x-3$.';
            return q;
        }
        c = [A.nonNul(-5, 5), A.entier(-9, 9), A.nonNul(-9, 9), A.entier(-9, 9)];
        if (niveau === 2) c[1] = 0;
        q.enonce = 'f(x)=' + poly(c);
        q.consigne = 'Calculer la dérivée de';
        q.attendu = poly([3 * c[0], 2 * c[1], c[2]]);
        q.correction = ['f(x)&=' + poly(c), 'f\'(x)&=' + c[0] + '\\times3x^2' + (c[1] ? terme(c[1]) + '\\times2x' : '') + terme(c[2]), '&=' + q.attendu];
        return q;
    };


    /* ===================================================================
       SÉRIE 8 : un automatisme par question, sous trois formes
       forme 1 = reconnaître (QCM, J1), 2 = produire (J2), 3 = mobiliser en contexte (J3)
       =================================================================== */
    function valFrac(f) { return f[0] / f[1]; }
    function texF(f) { return fracTex(f[0], f[1]); }        // [n, d] simplifiée
    function brute(n, d) { return frac(n, d); }             // [n, d] telle quelle (pour les erreurs typiques)
    // options d'un QCM numérique : on retire les distracteurs de même valeur que la bonne réponse
    function qcmValeurs(q, bonne, vBonne, autres) {
        return qcm(q, bonne, autres.filter(function (o) { return Math.abs(o[1] - vBonne) > 1e-9; }).map(function (o) { return o[0]; }));
    }

    /* ---------- C1 · Fractions ---------- */
    AutoT.fractions = function (niveau, forme) {
        forme = forme || 2;
        var q = { niveau: niveau, objectif: 'Calcul · Fractions' }, a, b, c, d, k, n, r;
        var RAPPEL = 'Même dénominateur : $' + frac('a', 'd') + '+' + frac('c', 'd') + '=' + frac('a+c', 'd') + '$ (on n\'additionne jamais les dénominateurs).<br>' +
            'Sinon, on met d\'abord au même dénominateur : $' + frac(2, 3) + '+' + frac(1, 6) + '=' + frac(4, 6) + '+' + frac(1, 6) + '=' + frac(5, 6) + '$.<br>' +
            'Produit : $' + frac('a', 'b') + '\\times' + frac('c', 'd') + '=' + frac('a\\times c', 'b\\times d') + '$ ; diviser par une fraction, c\'est multiplier par son inverse.';
        if (forme === 1) {
            q.texte = 'Quel est le résultat de ';
            if (niveau === 1) {
                do { b = A.choix([3, 4, 5, 6, 7]); k = A.choix([2, 3]); d = k * b; a = A.entier(1, b - 1); c = A.entier(1, d - 1); } while (pgcd(a, b) > 1 || pgcd(c, d) > 1);
                r = [a * k + c, d];
                q.texte += '$' + frac(a, b) + '+' + frac(c, d) + '$ ?';
                q.explication = '$' + frac(a, b) + '=' + frac(a * k, d) + '$, donc $' + frac(a, b) + '+' + frac(c, d) + '=' + frac(a * k, d) + '+' + frac(c, d) + '=' + frac(a * k + c, d) +
                    (pgcd(r[0], r[1]) > 1 ? '=' + texF(r) : '') + '$. On n\'additionne pas les dénominateurs.';
                q.rappel = RAPPEL;
                return qcmValeurs(q, '$' + texF(r) + '$', valFrac(r), [
                    ['$' + brute(a + c, b + d) + '$', (a + c) / (b + d)], ['$' + brute(a + c, d) + '$', (a + c) / d], ['$' + brute(a * c, b * d) + '$', a * c / (b * d)], ['$' + brute(a + c, b) + '$', (a + c) / b]]);
            }
            do { a = A.entier(1, 7); b = A.entier(2, 9); c = A.entier(1, 7); d = A.entier(2, 9); } while (a >= b || c >= d || pgcd(a, b) > 1 || pgcd(c, d) > 1 || b === d);
            if (niveau === 2) {
                r = [a * c, b * d];
                q.texte += '$' + frac(a, b) + '\\times' + frac(c, d) + '$ ?';
                q.explication = 'On multiplie les numérateurs entre eux et les dénominateurs entre eux : $' + frac(a + '\\times' + c, b + '\\times' + d) + '=' + frac(a * c, b * d) + (pgcd(r[0], r[1]) > 1 ? '=' + texF(r) : '') + '$.';
                return qcmValeurs(q, '$' + texF(r) + '$', valFrac(r), [
                    ['$' + texF([a * d, b * c]) + '$', a * d / (b * c)], ['$' + brute(a + c, b + d) + '$', (a + c) / (b + d)], ['$' + texF([a * c, b + d]) + '$', a * c / (b + d)], ['$' + texF([a + c, b * d]) + '$', (a + c) / (b * d)]]);
            }
            r = [a * d, b * c];
            q.texte += '$' + frac(a, b) + '\\div' + frac(c, d) + '$ ?';
            q.explication = 'Diviser par $' + frac(c, d) + '$, c\'est multiplier par son inverse $' + frac(d, c) + '$ : $' + frac(a, b) + '\\times' + frac(d, c) + '=' + frac(a * d, b * c) + (pgcd(r[0], r[1]) > 1 ? '=' + texF(r) : '') + '$.';
            return qcmValeurs(q, '$' + texF(r) + '$', valFrac(r), [
                ['$' + texF([a * c, b * d]) + '$', a * c / (b * d)], ['$' + texF([b * c, a * d]) + '$', b * c / (a * d)], ['$' + texF([a * d, b + c]) + '$', a * d / (b + c)], ['$' + texF([a + d, b + c]) + '$', (a + d) / (b + c)]]);
        }
        if (forme === 2) {
            q.type = 'nombre'; q.irreductible = true;
            if (niveau === 1) {
                do { b = A.choix([2, 3, 4, 5]); k = A.choix([2, 3, 4]); d = k * b; a = A.entier(1, b - 1); c = A.entier(1, d - 1); } while (d > 15 || pgcd(a, b) > 1 || pgcd(c, d) > 1);
                var plus = Math.random() < 0.6 || a * k <= c;
                r = [plus ? a * k + c : a * k - c, d];
                q.texte = 'Calculer $' + frac(a, b) + (plus ? '+' : '-') + frac(c, d) + '$. Donner une fraction irréductible.';
                q.attendu = valFrac(r);
                q.explication = '$' + frac(a, b) + (plus ? '+' : '-') + frac(c, d) + '=' + frac(a * k, d) + (plus ? '+' : '-') + frac(c, d) + '=' + frac(r[0], d) + (pgcd(r[0], r[1]) > 1 ? '=' + texF(r) : '') + '$.';
                q.rappel = RAPPEL;
                return q;
            }
            if (niveau === 2) {
                do { b = A.choix([2, 3, 4, 5, 7]); d = A.choix([3, 4, 5, 7, 9]); a = A.entier(1, b - 1); c = A.entier(1, d - 1); } while (pgcd(b, d) > 1 || a * d <= c * b || pgcd(a, b) > 1 || pgcd(c, d) > 1);
                r = [a * d - c * b, b * d];
                q.texte = 'Calculer $' + frac(a, b) + '-' + frac(c, d) + '$. Donner une fraction irréductible.';
                q.attendu = valFrac(r);
                q.explication = 'Dénominateur commun $' + (b * d) + '$ : $' + frac(a, b) + '-' + frac(c, d) + '=' + frac(a * d, b * d) + '-' + frac(c * b, b * d) + '=' + frac(r[0], r[1]) + (pgcd(r[0], r[1]) > 1 ? '=' + texF(r) : '') + '$.';
                return q;
            }
            if (Math.random() < 0.5) {      // priorité : a/b + c/d × e/f
                var e, f;
                do { a = A.entier(1, 5); b = A.choix([2, 3, 4, 6]); c = A.entier(1, 5); d = A.entier(2, 6); e = A.entier(1, 5); f = A.entier(2, 6); }
                while (a >= b || c >= d || e >= f || pgcd(a, b) > 1 || pgcd(c, d) > 1 || pgcd(e, f) > 1 || (b * d * f) % 1);
                var p = [c * e, d * f], g = pgcd(p[0], p[1]); p = [p[0] / g, p[1] / g];
                r = [a * p[1] + p[0] * b, b * p[1]];
                q.texte = 'Calculer $' + frac(a, b) + '+' + frac(c, d) + '\\times' + frac(e, f) + '$. Donner une fraction irréductible.';
                q.attendu = valFrac(r);
                q.explication = 'La multiplication est prioritaire : $' + frac(c, d) + '\\times' + frac(e, f) + '=' + texF([c * e, d * f]) + '$. Puis $' + frac(a, b) + '+' + texF(p) + '=' + texF(r) + '$.';
                return q;
            }
            do { a = A.entier(1, 9); b = A.entier(2, 9); c = A.entier(1, 9); d = A.entier(2, 9); } while (pgcd(a, b) > 1 || pgcd(c, d) > 1 || a === c || b === d || (a * d) % (b * c) === 0);
            r = [a * d, b * c];
            q.texte = 'Calculer $' + frac(a, b) + '\\div' + frac(c, d) + '$. Donner une fraction irréductible.';
            q.attendu = valFrac(r);
            q.explication = 'On multiplie par l\'inverse : $' + frac(a, b) + '\\times' + frac(d, c) + '=' + frac(a * d, b * c) + (pgcd(r[0], r[1]) > 1 ? '=' + texF(r) : '') + '$.';
            return q;
        }
        // forme 3 : en contexte
        var C = A.choix(CONTEXTES);
        if (niveau === 1) {
            do { b = A.choix([3, 4, 5, 6, 8, 10]); a = A.entier(1, b - 1); } while (pgcd(a, b) > 1);
            n = b * A.entier(3, 12);
            q.type = 'nombre';
            q.texte = 'Sur $' + fr(n) + '$ ' + C[0] + ', les $' + frac(a, b) + '$ ' + C[1] + '. Combien sont-ils ?';
            q.attendu = a * n / b;
            q.explication = '$' + frac(a, b) + '\\times' + fr(n) + '=' + frac(a + '\\times' + fr(n), b) + '=' + fr(q.attendu) + '$ (on peut diviser par $' + b + '$, puis multiplier par $' + a + '$).';
            q.rappel = 'Prendre les $' + frac('a', 'b') + '$ d\'une quantité $N$, c\'est calculer $' + frac('a', 'b') + '\\times N$ : on divise $N$ par $b$, puis on multiplie par $a$.<br>' +
                'Exemple : les $' + frac(3, 4) + '$ de $40$ : $40\\div4=10$, puis $3\\times10=30$.';
            return q;
        }
        q.type = 'nombre'; q.irreductible = true;
        if (niveau === 2) {
            var P = A.choix([[1, 2, 1, 3], [1, 3, 1, 4], [1, 2, 1, 5], [1, 3, 1, 5], [1, 4, 1, 5], [2, 5, 1, 3], [1, 4, 1, 6], [1, 6, 3, 4], [2, 3, 1, 4], [3, 10, 1, 4]]);
            var S2 = A.choix([['des patients d\'un service sont hospitalisés pour une fracture', 'pour une infection', 'Les autres sont en observation. Quelle fraction des patients est en observation ?'],
                              ['des élèves d\'une classe viennent au lycée en bus', 'à pied', 'Les autres viennent en voiture. Quelle fraction des élèves vient en voiture ?'],
                              ['du budget d\'un centre de santé sert aux salaires', 'au matériel', 'Le reste sert aux locaux. Quelle fraction du budget sert aux locaux ?']]);
            var m = P[1] * P[3] / pgcd(P[1], P[3]);
            r = [m - P[0] * m / P[1] - P[2] * m / P[3], m];
            q.texte = '$' + frac(P[0], P[1]) + '$ ' + S2[0] + ', et $' + frac(P[2], P[3]) + '$ ' + S2[1] + '. ' + S2[2];
            q.attendu = valFrac(r);
            q.explication = 'Le total vaut $1=' + frac(m, m) + '$. $1-' + frac(P[0], P[1]) + '-' + frac(P[2], P[3]) + '=' + frac(m, m) + '-' + frac(P[0] * m / P[1], m) + '-' + frac(P[2] * m / P[3], m) + '=' + frac(r[0], m) + (pgcd(r[0], m) > 1 ? '=' + texF(r) : '') + '$.';
            return q;
        }
        do { a = A.entier(1, 4); b = A.entier(2, 6); c = A.entier(1, 4); d = A.entier(2, 6); } while (a >= b || c >= d || pgcd(a, b) > 1 || pgcd(c, d) > 1);
        var S3 = A.choix([['des salariés d\'une clinique sont des femmes', 'parmi elles', 'travaillent de nuit', 'des salariés sont des femmes qui travaillent de nuit'],
                          ['des patients d\'un hôpital sont des enfants', 'parmi eux', 'sont vaccinés contre la grippe', 'des patients sont des enfants vaccinés contre la grippe'],
                          ['des adhérents d\'une association sont bénévoles', 'parmi eux', 'ont plus de 60 ans', 'des adhérents sont des bénévoles de plus de 60 ans']]);
        r = [a * c, b * d];
        q.texte = 'Les $' + frac(a, b) + '$ ' + S3[0] + ' ; ' + S3[1] + ', les $' + frac(c, d) + '$ ' + S3[2] + '. Quelle fraction ' + S3[3] + ' ?';
        q.attendu = valFrac(r);
        q.explication = 'Les $' + frac(c, d) + '$ des $' + frac(a, b) + '$ : on multiplie, $' + frac(c, d) + '\\times' + frac(a, b) + '=' + frac(a * c, b * d) + (pgcd(r[0], r[1]) > 1 ? '=' + texF(r) : '') + '$.';
        return q;
    };

    /* ---------- E2 · Appliquer un taux d'évolution ---------- */
    AutoT.appliquerTaux = function (niveau, forme) {
        forme = forme || 2;
        var q = { niveau: niveau, objectif: niveau === 3 ? 'Évolutions · Retrouver une valeur initiale' : 'Évolutions · Appliquer un taux d\'évolution' };
        var t, hausse, V, cm, Vf;
        function cmTex(t, h) { return 'CM=1' + (h ? '+' : '-') + frac(t, 100) + '=' + fr(arrondi(1 + (h ? t : -t) / 100)); }
        function ev(h, t) { return (h ? 'augmente' : 'baisse') + ' de $' + pct(t) + '$'; }
        var RAPPEL = 'Augmenter de $t\\,\\%$, c\'est multiplier par $CM=1+' + frac('t', 100) + '$ ; diminuer de $t\\,\\%$, c\'est multiplier par $CM=1-' + frac('t', 100) + '$.<br>' +
            'Valeur finale $=$ valeur initiale $\\times\\, CM$. Exemple : $80$ € augmenté de $15\\,\\%$ : $CM=1{,}15$ et $80\\times1{,}15=92$ €.';
        var CTX = [['Un tarif de consultation de $@$ €', 'Quel est le nouveau tarif (en €) ?', 'un tarif de consultation vaut $@$ €', 'Quel était le tarif initial (en €) ?'],
                   ['Un service hospitalier compte $@$ lits. Ce nombre', 'Combien de lits compte-t-il ensuite ?', 'un service hospitalier compte $@$ lits', 'Combien de lits comptait-il avant ?'],
                   ['Un centre de vaccination reçoit $@$ personnes par semaine. Ce nombre', 'Combien de personnes reçoit-il ensuite par semaine ?', 'un centre de vaccination reçoit $@$ personnes par semaine', 'Combien en recevait-il avant ?'],
                   ['Le budget d\'une association est de $@$ €. Il', 'Quel est son nouveau budget (en €) ?', 'le budget d\'une association est de $@$ €', 'Quel était le budget initial (en €) ?']];
        function tirage(liste, mult) {
            do { t = A.choix(liste); hausse = Math.random() < 0.5; V = A.entier(2, 25) * mult; cm = arrondi(1 + (hausse ? t : -t) / 100); Vf = arrondi(V * cm); }
            while (Vf % 1 || Vf <= 0);
        }
        if (niveau < 3) {
            if (niveau === 1) tirage([10, 20, 25, 50], 20); else tirage([5, 15, 30, 35, 40, 12, 4, 60], 25);
            var expl = '$' + cmTex(t, hausse) + '$ et $' + fr(V) + '\\times' + fr(cm) + '=' + fr(Vf) + '$.';
            if (niveau === 1) q.rappel = RAPPEL;
            if (forme === 1) {
                q.texte = 'Une valeur de $' + fr(V) + '$ ' + ev(hausse, t) + '. Sa nouvelle valeur est :';
                q.explication = expl + ' (On n\'ajoute pas $' + fr(t) + '$ à la valeur de départ.)';
                return qcmValeurs(q, '$' + fr(Vf) + '$', Vf, [
                    ['$' + fr(hausse ? V + t : V - t) + '$', hausse ? V + t : V - t], ['$' + fr(arrondi(V * (1 + (hausse ? -t : t) / 100))) + '$', V * (1 + (hausse ? -t : t) / 100)],
                    ['$' + fr(arrondi(V * t / 100)) + '$', V * t / 100], ['$' + fr(arrondi(V * (1 + (hausse ? t : -t) / 10))) + '$', V * (1 + (hausse ? t : -t) / 10)]]);
            }
            q.type = 'nombre';
            q.attendu = Vf;
            q.explication = expl;
            if (forme === 2) { q.texte = 'Une valeur de $' + fr(V) + '$ ' + ev(hausse, t) + '. Calculer sa nouvelle valeur.'; return q; }
            var c3 = A.choix(CTX);
            q.texte = c3[0].replace('@', fr(V)) + ' ' + ev(hausse, t) + '. ' + c3[1];
            return q;
        }
        // niveau 3 : valeur initiale
        var R = A.choix([[25, true], [20, true], [50, true], [10, true], [5, true], [20, false], [25, false], [10, false], [50, false], [40, false], [5, false]]);
        t = R[0]; hausse = R[1]; cm = arrondi(1 + (hausse ? t : -t) / 100); V = A.entier(2, 25) * 20; Vf = arrondi(V * cm);
        var expl3 = '$' + cmTex(t, hausse) + '$ et $V_i\\times' + fr(cm) + '=' + fr(Vf) + '$, donc $V_i=' + frac(fr(Vf), fr(cm)) + '=' + fr(V) + '$. ' +
            '(Attention : ' + (hausse ? 'retirer' : 'ajouter') + ' $' + pct(t) + '$ à la valeur finale est faux.)';
        var apres = 'Après ' + (hausse ? 'une hausse' : 'une baisse') + ' de $' + pct(t) + '$, ';
        if (forme === 1) {
            q.texte = apres + 'une valeur vaut $' + fr(Vf) + '$. Sa valeur initiale était :';
            q.explication = expl3;
            var faux = arrondi(Vf * (1 + (hausse ? -t : t) / 100));
            return qcmValeurs(q, '$' + fr(V) + '$', V, [['$' + fr(faux) + '$', faux], ['$' + fr(hausse ? Vf - t : Vf + t) + '$', hausse ? Vf - t : Vf + t], ['$' + fr(arrondi(Vf * cm)) + '$', Vf * cm]]);
        }
        q.type = 'nombre'; q.attendu = V; q.explication = expl3;
        if (forme === 2) { q.texte = apres + 'une valeur vaut $' + fr(Vf) + '$. Calculer sa valeur initiale.'; return q; }
        var c = A.choix(CTX);
        q.texte = apres + c[2].replace('@', fr(Vf)) + '. ' + c[3];
        return q;
    };

    /* ---------- F4 · Équation de courbe : appartenance d'un point, coordonnées ---------- */
    AutoT.pointCourbe = function (niveau, forme) {
        forme = forme || 2;
        var q = { niveau: niveau, objectif: 'Fonctions · Point sur une courbe' }, co, x0, y0, f;
        var RAPPEL = 'Le point $M(a\\,;\\,b)$ appartient à la courbe de $f$ lorsque $f(a)=b$ : on calcule l\'image de l\'abscisse et on la compare à l\'ordonnée.<br>' +
            'Exemple : $f(x)=x^2-3x$ et $M(4\\,;\\,4)$ : $f(4)=16-12=4$, donc $M$ est sur la courbe. Attention : $(-3)^2=9$.';
        function P(c) { return function (x) { var s = 0; c.forEach(function (k) { s = s * x + k; }); return s; }; }
        function pt(x, y) { return '(' + fr(x) + '\\,;\\,' + fr(y) + ')'; }
        function calcul(c, x) {                               // f(x0) détaillé, x0 entre parenthèses s'il est négatif
            var X = x < 0 ? '(' + x + ')' : String(x), deg = c.length - 1, morceaux = [];
            c.forEach(function (k, i) {
                var p = deg - i; if (!k) return;
                var m = p === 0 ? fr(Math.abs(k)) : (Math.abs(k) === 1 ? '' : fr(Math.abs(k)) + '\\times') + X + (p > 1 ? '^' + p : '');
                morceaux.push((k < 0 ? '-' : (morceaux.length ? '+' : '')) + m);
            });
            return morceaux.join('');
        }
        if (niveau === 1) { co = [1, A.nonNul(-5, 5), A.entier(-5, 5)]; }
        else if (niveau === 2) { co = [A.choix([2, 3, -1, -2]), A.nonNul(-5, 5), A.entier(-6, 6)]; }
        else { co = [1, 0, A.nonNul(-4, 4), A.entier(-5, 5)]; }
        f = P(co);
        var fTex = 'f(x)=' + poly(co);
        if (forme === 1) {
            var xs = niveau === 1 ? [0, 1, 2, 3, -1] : [-3, -2, -1, 1, 2];
            x0 = A.choix(xs.filter(function (x) { return x !== 0 || niveau === 1; }));
            y0 = f(x0);
            var autres = melanger(xs.filter(function (x) { return x !== x0; })).slice(0, 3).map(function (x, i) {
                var faux = [f(x) + A.nonNul(-2, 2), P(co.map(function (k, j) { return j === 0 && co.length === 3 ? -k : k; }))(x), -f(x)][i % 3];
                if (faux === f(x)) faux = f(x) + 1;
                return '$' + pt(x, faux) + '$';
            });
            q.texte = 'On note $\\mathcal{C}$ la courbe représentative de la fonction $f$ définie par $' + fTex + '$. Quel point appartient à $\\mathcal{C}$ ?';
            q.explication = 'On calcule l\'image de l\'abscisse : $f(' + x0 + ')=' + calcul(co, x0) + '=' + fr(y0) + '$ : c\'est bien l\'ordonnée du point $' + pt(x0, y0) + '$. Pour les autres points, l\'image de l\'abscisse n\'est pas égale à l\'ordonnée.';
            if (niveau === 1) q.rappel = RAPPEL;
            return qcm(q, '$' + pt(x0, y0) + '$', autres);
        }
        if (forme === 2) {
            q.type = 'nombre';
            if (niveau < 3) {
                x0 = niveau === 1 ? A.entier(1, 4) : A.entier(-3, -1);
                q.texte = 'Le point $A' + '(' + x0 + '\\,;\\,y)$ appartient à la courbe représentative de la fonction $f$ définie par $' + fTex + '$. Calculer $y$.';
                q.attendu = f(x0);
                q.explication = '$y=f(' + x0 + ')=' + calcul(co, x0) + '=' + fr(q.attendu) + '$.';
                if (niveau === 1) q.rappel = RAPPEL;
                return q;
            }
            var m = A.nonNul(-5, 5), p = A.entier(-8, 8), xa = A.entier(-4, 6);
            if (m === 1) m = 2;
            var yb = m * xa + p;
            q.texte = 'Le point $B(x\\,;\\,' + fr(yb) + ')$ appartient à la droite d\'équation $y=' + poly([m, p]) + '$. Calculer $x$.';
            q.attendu = xa;
            q.explication = 'On résout $' + poly([m, p]) + '=' + fr(yb) + '$ : $' + fr(m) + 'x=' + fr(yb) + (p ? terme(-p) : '') + '=' + fr(yb - p) + '$, donc $x=' + frac(fr(yb - p), fr(m)) + '=' + fr(xa) + '$.';
            return q;
        }
        // forme 3 : en situation
        if (niveau === 1) {
            var b1 = A.choix([6, 8, 10, 12]), t1 = A.entier(1, b1 / 2);
            q.type = 'nombre';
            q.texte = 'La concentration d\'un médicament dans le sang, $t$ heures après la prise, est $C(t)=-t^2+' + b1 + 't$ (en mg/L). Quelle est l\'ordonnée du point de la courbe de $C$ d\'abscisse $' + t1 + '$ ?';
            q.attendu = -t1 * t1 + b1 * t1;
            q.explication = '$C(' + t1 + ')=-' + t1 + '^2+' + b1 + '\\times' + t1 + '=' + (-t1 * t1) + '+' + (b1 * t1) + '=' + q.attendu + '$ : ' + t1 + ' h après la prise, la concentration est de $' + q.attendu + '$ mg/L.';
            q.rappel = RAPPEL;
            return q;
        }
        if (niveau === 2) {
            var b2, t2, vrai, dedans = Math.random() < 0.5, yy;
            do { b2 = A.choix([6, 8, 10, 12]); t2 = A.entier(1, b2 - 1); vrai = -t2 * t2 + b2 * t2; yy = dedans ? vrai : vrai + A.nonNul(-3, 3); } while (yy === t2 || yy <= 0);
            q.texte = 'La concentration d\'un médicament dans le sang, $t$ heures après la prise, est $C(t)=-t^2+' + b2 + 't$ (en mg/L). Le point $A(' + t2 + '\\,;\\,' + yy + ')$ est-il sur la courbe de $C$ ?';
            q.explication = '$C(' + t2 + ')=-' + t2 + '^2+' + b2 + '\\times' + t2 + '=' + vrai + '$' + (dedans ? ' : c\'est l\'ordonnée de $A$.' : ', qui n\'est pas égal à $' + yy + '$.');
            q.qcmLignes = true;
            var oui = 'Oui : ' + t2 + ' h après la prise, la concentration est de $' + yy + '$ mg/L', inv = 'Oui : ' + yy + ' h après la prise, la concentration est de $' + t2 + '$ mg/L', non = 'Non, car $C(' + t2 + ')=' + vrai + '$';
            return dedans ? qcm(q, oui, [inv, 'Non, car $C(' + t2 + ')\\neq' + yy + '$']) : qcm(q, non, [oui, inv]);
        }
        var x3 = A.choix([-2, -1, 1, 2, 3]), b3 = A.nonNul(-6, 6), c3 = A.entier(-6, 6), y3 = x3 * x3 + b3 * x3 + c3;
        q.type = 'nombre';
        q.texte = 'La courbe représentative de la fonction $f$ définie par $f(x)=x^2+bx' + terme(c3).replace('+0', '') + '$ passe par le point $A' + pt(x3, y3) + '$. Calculer $b$.';
        if (!c3) q.texte = q.texte.replace('bx+0', 'bx').replace('bx-0', 'bx');
        q.attendu = b3;
        var X3 = x3 < 0 ? '(' + x3 + ')' : x3;
        q.explication = '$f(' + x3 + ')=' + fr(y3) + '$ : $' + X3 + '^2+b\\times' + X3 + (c3 ? terme(c3) : '') + '=' + fr(y3) + '$, soit $' + (x3 * x3 + c3) + (x3 < 0 ? '-' + (x3 === -1 ? '' : -x3) : '+' + (x3 === 1 ? '' : x3)) + 'b=' + fr(y3) + '$, donc $b=' + fr(b3) + '$.';
        return q;
    };

    /* ---------- F9 · Lire graphiquement le nombre dérivé (coefficient directeur d'une tangente) ---------- */
    // courbe y = y0 + s(x-a) + b(x-a)² : sa tangente en A(a ; y0) est y = y0 + s(x-a), et passe par des nœuds du quadrillage
    function figureTangente(T) {
        var o = { xmin: T.xmin, xmax: T.xmax, ymin: T.ymin, ymax: T.ymax, c: 32 }, c = 32, m = 22;
        function X(x) { return m + (x - o.xmin) * c; }
        function Y(y) { return m + (o.ymax - y) * c; }
        o.courbe = T.points; o.nom = T.nom;
        var s = repere(o).replace('</svg>', '');
        var xa = Math.max(o.xmin, T.a - 3), xb = Math.min(o.xmax, T.a + 3);
        function yt(x) { return T.y0 + T.s * (x - T.a); }
        if (T.s !== 0) {
            var lo = (o.ymin - T.y0) / T.s + T.a, hi = (o.ymax - T.y0) / T.s + T.a;
            xa = Math.max(xa, Math.min(lo, hi)); xb = Math.min(xb, Math.max(lo, hi));
        }
        s += '<line class="fig-seg" style="stroke:#e03131" x1="' + X(xa) + '" y1="' + Y(yt(xa)) + '" x2="' + X(xb) + '" y2="' + Y(yt(xb)) + '"/>';
        s += '<circle class="fig-pt" cx="' + X(T.a) + '" cy="' + Y(T.y0) + '" r="4.5"/>';
        s += '<text class="fig-nom-pt" x="' + (X(T.a) - 8) + '" y="' + (Y(T.y0) - 8) + '" text-anchor="end">A</text>';
        return s + '</svg>';
    }
    function tirageTangente(niveau, positif) {
        var PENTES = niveau === 1 ? [[1, 1], [2, 1], [3, 1], [-1, 1], [-2, 1]]
                   : niveau === 2 ? [[0, 1], [-1, 1], [-2, 1], [-3, 1], [2, 1], [3, 1]]
                   : [[1, 2], [-1, 2], [3, 2], [-3, 2], [1, 3], [-2, 3]];
        for (;;) {
            var P = A.choix(PENTES), s = P[0] / P[1], den = P[1], a = A.entier(positif ? 1 : 0, 4), y0 = A.entier(positif ? 1 : -1, 4), b = A.choix([0.5, -0.5, 1, -1, 0.25, -0.25]);
            var T = { xmin: positif ? 0 : -2, xmax: 7, ymin: positif ? 0 : -3, ymax: 6, a: a, y0: y0, s: s, num: P[0], den: den, b: b };
            // un second nœud du quadrillage sur la tangente, à droite (ou à gauche) de A
            var droite = a + den <= T.xmax && y0 + P[0] <= T.ymax && y0 + P[0] >= T.ymin, gauche = a - den >= T.xmin && y0 - P[0] <= T.ymax && y0 - P[0] >= T.ymin;
            if (!droite && !gauche) continue;
            var pts = [], ok = true;
            for (var x = a; x >= T.xmin - 1e-9; x -= 0.05) { var y = y0 + s * (x - a) + b * (x - a) * (x - a); if (y < T.ymin || y > T.ymax) break; pts.unshift([x, y]); }
            for (x = a + 0.05; x <= T.xmax + 1e-9; x += 0.05) { y = y0 + s * (x - a) + b * (x - a) * (x - a); if (y < T.ymin || y > T.ymax) break; pts.push([x, y]); }
            if (pts[0][0] > a - 1.5 || pts[pts.length - 1][0] < a + 1.5) continue;
            T.points = pts; T.droite = droite;
            T.fig = function (nom) { T.nom = nom; return figureTangente(T); };
            return T;
        }
    }
    AutoT.nombreDerive = function (niveau, forme) {
        forme = forme || 2;
        var q = { niveau: niveau, objectif: 'Dérivation · Lire un nombre dérivé' }, T = tirageTangente(niveau, forme === 3);
        var sTex = T.den === 1 ? String(T.num) : (T.num < 0 ? '-' : '') + frac(Math.abs(T.num), T.den);
        var B = T.droite ? [T.a + T.den, T.y0 + T.num] : [T.a - T.den, T.y0 - T.num];
        var lecture = 'La tangente passe par $A(' + T.a + '\\,;\\,' + T.y0 + ')$ et par le point $(' + B[0] + '\\,;\\,' + B[1] + ')$. ' +
            (T.num === 0 ? 'Elle est horizontale : son coefficient directeur est $0$.' :
            'Quand $x$ augmente de $' + T.den + '$, $y$ ' + (T.num > 0 ? 'augmente' : 'diminue') + ' de $' + Math.abs(T.num) + '$ : le coefficient directeur vaut $' + (T.den === 1 ? '' : frac(T.num, T.den) + (T.num < 0 ? '=' + sTex : '')) + (T.den === 1 ? sTex : '') + '$.');
        var RAPPEL = 'Le nombre dérivé $f\'(a)$ est le <b>coefficient directeur</b> de la tangente à la courbe au point d\'abscisse $a$.<br>' +
            'On le lit sur la tangente : on avance de $1$ (ou de quelques carreaux) vers la droite, et on compte de combien on monte (positif) ou on descend (négatif) : $' + frac('\\text{variation de } y', '\\text{variation de } x') + '$.<br>' +
            'Tangente horizontale : $f\'(a)=0$.';
        var CTX = [['C', 'la concentration $C(t)$ d\'un médicament dans le sang (en mg/L) en fonction du temps $t$ (en heures)', 'mg/L par heure', 'la concentration', 'mg/L'],
                   ['B', 'le nombre $B(t)$ de bactéries d\'une culture (en milliers) en fonction du temps $t$ (en heures)', 'milliers de bactéries par heure', 'le nombre de bactéries', 'milliers'],
                   ['N', 'le nombre $N(t)$ de patients présents aux urgences (en dizaines) en fonction du temps $t$ (en heures)', 'dizaines de patients par heure', 'le nombre de patients', 'dizaines']];
        if (forme === 3) {
            var C = A.choix(CTX), F = C[0];
            q.figure = T.fig('𝒞'); q.figureNote = 'courbe de ' + F + ', tangente en A(' + T.a + ';' + T.y0 + ') de coefficient ' + T.num + '/' + T.den;
            var intro = 'La courbe donne ' + C[1] + '. On a tracé sa tangente au point $A$ d\'abscisse $' + T.a + '$. ';
            if (niveau === 2) {
                var sens = function (v) { return v === 0 ? 'ne varie pas (à cet instant)' : (v > 0 ? 'augmente' : 'diminue') + ' à la vitesse de $' + fr(Math.abs(v)) + '$ ' + C[2]; };
                q.texte = intro + 'À l\'instant $t=' + T.a + '$, ' + C[3] + ' :';
                q.explication = lecture + ' Donc $' + F + '\'(' + T.a + ')=' + sTex + '$ : ' + C[3] + ' ' + sens(T.s) + '.';
                q.qcmLignes = true;
                var d3 = [T.y0, T.s + 1, T.s - 1, 2 * T.s].filter(function (v) { return v !== T.s && v !== -T.s; })[0];
                return qcm(q, sens(T.s), [sens(T.s === 0 ? 1 : -T.s), 'vaut $' + T.y0 + '$ ' + C[4], sens(d3)]);
            }
            q.type = 'nombre';
            q.texte = intro + 'Lire $' + F + '\'(' + T.a + ')$.';
            q.prefixe = F + '\'(' + T.a + ')=';
            q.attendu = T.s;
            q.explication = lecture + ' Donc $' + F + '\'(' + T.a + ')=' + sTex + '$ : à cet instant, ' + C[3] + (T.s === 0 ? ' ne varie pas.' : ' ' + (T.s > 0 ? 'augmente' : 'diminue') + ' à la vitesse de $' + (T.den === 1 ? Math.abs(T.num) : frac(Math.abs(T.num), T.den)) + '$ ' + C[2] + '.');
            if (niveau === 1) q.rappel = RAPPEL;
            return q;
        }
        q.figure = T.fig('𝒞<tspan font-size="12">f</tspan>');
        q.figureNote = 'tangente en A(' + T.a + ';' + T.y0 + ') de coefficient ' + T.num + '/' + T.den;
        var enonce = 'On a tracé la courbe $\\mathcal{C}_f$ d\'une fonction $f$ et sa tangente au point $A$ d\'abscisse $' + T.a + '$. ';
        q.explication = lecture + ' Donc $f\'(' + T.a + ')=' + sTex + '$.';
        if (niveau === 1) q.rappel = RAPPEL;
        if (forme === 1) {
            q.texte = enonce + 'Que vaut $f\'(' + T.a + ')$ ?';
            var inv = T.num === 0 || (T.den === 1 && Math.abs(T.num) === 1) ? null : texF([T.den, T.num]);
            var p = T.y0 - T.s * T.a, pTex = p % 1 ? null : String(p);
            return qcmValeurs(q, '$' + sTex + '$', T.s, [['$' + (T.num === 0 ? 1 : (T.den === 1 ? String(-T.num) : (T.num > 0 ? '-' : '') + frac(Math.abs(T.num), T.den))) + '$', T.num === 0 ? 1 : -T.s],
                ['$' + T.y0 + '$', T.y0], inv ? ['$' + inv + '$', T.den / T.num] : ['$' + T.a + '$', T.a], pTex ? ['$' + pTex + '$', p] : ['$' + (T.a + 1) + '$', T.a + 1],
                ['$1$', 1], ['$-1$', -1], ['$2$', 2]]);
        }
        q.type = 'nombre';
        q.texte = enonce + 'Lire $f\'(' + T.a + ')$.';
        q.prefixe = 'f\'(' + T.a + ')=';
        q.attendu = T.s;
        return q;
    };

    window.AutoT = AutoT;
})();

// Bouton « 📖 Vocabulaire » dans la barre du haut (vocabulaire.js et lexique.js, à la racine du site)
(function () {
    var ici = document.currentScript && document.currentScript.src;
    if (!ici) return;
    var s = document.createElement('script');
    s.src = new URL('../../vocabulaire.js', ici).href;
    document.head.appendChild(s);
})();
