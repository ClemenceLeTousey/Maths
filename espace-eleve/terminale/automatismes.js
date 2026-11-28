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
    // entier : nombre dérivé entier à tous les niveaux (J1) ; sinon (J2, J3) des fractions apparaissent en bleu et en rouge
    function tirageTangente(niveau, positif, entier) {
        var PENTES = niveau === 1 ? [[1, 1], [2, 1], [3, 1], [-1, 1], [-2, 1]]
                   : niveau === 2 ? (entier ? [[0, 1], [-1, 1], [-2, 1], [-3, 1], [2, 1], [3, 1]]
                                            : [[0, 1], [-1, 1], [-2, 1], [-3, 1], [2, 1], [1, 2], [-1, 2], [3, 2]])
                   : (entier ? [[-3, 1], [-2, 1], [-4, 1], [3, 1], [4, 1], [0, 1]]
                             : [[1, 2], [-1, 2], [3, 2], [-3, 2], [1, 3], [-2, 3], [2, 3], [-1, 3]]);
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
        var q = { niveau: niveau, objectif: 'Dérivation · Lire un nombre dérivé' }, T = tirageTangente(niveau, forme === 3, forme === 1);
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

    /* ===================================================================
       SÉRIES 9 À 11 : même principe (un automatisme par question, forme 1 QCM, 2 produire, 3 en situation)
       =================================================================== */
    // écriture décimale sans puissance de 10 (0{,}000\,002) : String(2e-7) donnerait « 2e-7 »
    function dec(x) {
        var neg = x < 0, s = Math.abs(Math.round(x * 1e12) / 1e12).toFixed(12).replace(/0+$/, '').replace(/\.$/, '');
        var p = s.split('.'), ent = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
        var d = p[1] ? p[1].replace(/(\d{3})(?=\d)/g, '$1\\,') : '';
        return (neg ? '-' : '') + ent + (d ? '{,}' + d : '');
    }
    function sci(m, e) { return fr(m) + '\\times10^{' + e + '}'; }
    function mantisse() { return A.choix([1.2, 1.5, 2, 2.5, 3, 3.4, 4.5, 5, 6.4, 7, 7.5, 8.1, 9.3]); }

    /* ---------- C3 · Passer d'une écriture à une autre ---------- */
    AutoT.ecritures = function (niveau, forme) {
        forme = forme || 2;
        var q = { niveau: niveau, objectif: 'Calcul · Écritures d\'un nombre' }, m, e, v;
        var RAPPEL = 'Écriture scientifique : $a\\times10^{n}$ avec $1\\leqslant a<10$ et $n$ entier.<br>' +
            'Exemples : $3\\,200=3{,}2\\times10^{3}$ ; $0{,}0045=4{,}5\\times10^{-3}$ (exposant négatif pour un nombre plus petit que $1$).<br>' +
            'Fraction : $0{,}35=' + frac(35, 100) + '=' + frac(7, 20) + '$ ; et $' + frac(3, 4) + '=0{,}75=75\\,\\%$.';
        var FR = [[1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [1, 8], [3, 8], [5, 8], [7, 20], [3, 20], [9, 25], [1, 20], [7, 50], [3, 40]];
        if (forme === 1) {
            if (niveau === 1) {
                m = mantisse(); e = A.choix([2, 3, 4, 5, -2, -3, -4]); v = m * Math.pow(10, e);
                q.texte = 'L\'écriture scientifique de $' + dec(v) + '$ est :';
                q.explication = 'On écrit un seul chiffre non nul avant la virgule : $' + fr(m) + '$. ' +
                    (e > 0 ? 'Le nombre est plus grand que $10$ : l\'exposant est positif, $' + dec(v) + '=' + sci(m, e) + '$.'
                           : 'Le nombre est plus petit que $1$ : l\'exposant est négatif, $' + dec(v) + '=' + sci(m, e) + '$.') +
                    (m * 10 < 100 ? ' ($' + sci(arrondi(m * 10), e - 1) + '$ a la même valeur, mais n\'est pas une écriture scientifique.)' : '');
                q.rappel = RAPPEL;
                return qcm(q, '$' + sci(m, e) + '$', ['$' + sci(m, -e) + '$', '$' + sci(arrondi(m * 10), e - 1) + '$', '$' + sci(m, e > 0 ? e + 1 : e - 1) + '$', '$' + sci(m, e > 0 ? e - 1 : e + 1) + '$']);
            }
            if (niveau === 2) {
                var f = A.choix(FR); v = f[0] / f[1];
                q.texte = 'Le nombre $' + frac(f[0], f[1]) + '$ est égal à :';
                q.explication = '$' + frac(f[0], f[1]) + '=' + f[0] + '\\div' + f[1] + '=' + fr(v) + '$' + (100 % f[1] === 0 ? ' (car $' + frac(f[0], f[1]) + '=' + frac(f[0] * 100 / f[1], 100) + '$)' : '') + ', soit $' + pct(arrondi(v * 100)) + '$.';
                return qcmValeurs(q, '$' + fr(v) + '$', v, [['$' + fr(arrondi(v * 10)) + '$', v * 10], ['$' + fr(arrondi(v / 10)) + '$', v / 10],
                    ['$' + fr(+(f[0] + '.' + f[1])) + '$', +(f[0] + '.' + f[1])], ['$' + fr(arrondi(f[1] / f[0])) + '$', f[1] / f[0]]]);
            }
            m = mantisse(); e = A.choix([-3, -4, -5, -6]); v = m * Math.pow(10, e);
            q.texte = 'Lequel de ces nombres est égal à $' + dec(v) + '$ ?';
            q.explication = '$' + dec(v) + '=' + sci(m, e) + '$ : la virgule se déplace de $' + (-e) + '$ rangs pour obtenir $' + fr(m) + '$.';
            return qcm(q, '$' + sci(m, e) + '$', ['$' + sci(m, e + 1) + '$', '$' + sci(m, e - 1) + '$', '$' + sci(m, -e) + '$']);
        }
        if (forme === 2) {
            if (niveau === 1) {
                m = mantisse(); e = A.choix([2, 3, 4, -1, -2, -3]); v = arrondi(m * Math.pow(10, e));
                q.type = 'nombre'; q.decimal = true;
                q.texte = 'Écrire $' + sci(m, e) + '$ sous forme décimale.';
                q.attendu = v;
                q.explication = 'On décale la virgule de $' + Math.abs(e) + '$ rang' + (Math.abs(e) > 1 ? 's' : '') + ' vers la ' + (e > 0 ? 'droite' : 'gauche') + ' : $' + sci(m, e) + '=' + dec(v) + '$.';
                q.rappel = RAPPEL;
                return q;
            }
            if (niveau === 2) {
                var g = A.choix(FR); v = g[0] / g[1];
                q.type = 'nombre'; q.irreductible = true;
                q.texte = 'Écrire $' + fr(v) + '$ sous la forme d\'une fraction irréductible.';
                q.attendu = v;
                var nd = String(v).split('.')[1].length, p10 = Math.pow(10, nd);
                q.explication = '$' + fr(v) + '=' + frac(Math.round(v * p10), p10) + '=' + frac(g[0], g[1]) + '$ (on simplifie par $' + (Math.round(v * p10) / g[0]) + '$).';
                return q;
            }
            m = mantisse(); e = A.choix([4, 5, 6, -3, -4, -5]); v = m * Math.pow(10, e);
            q.type = 'champs';
            q.texte = 'Donner l\'écriture scientifique de $' + dec(v) + '$.';
            q.gabarit = '$' + dec(v) + '=$ [] $\\times10$ puissance []';
            q.attendus = [m, e];
            q.explication = '$' + dec(v) + '=' + sci(m, e) + '$ : un seul chiffre non nul avant la virgule, et l\'exposant ' + (e > 0 ? 'positif car le nombre est plus grand que $10$.' : 'négatif car le nombre est plus petit que $1$.');
            return q;
        }
        // forme 3 : en situation
        if (niveau === 1) {
            var S1 = A.choix([['Un département compte environ $@$ habitants.', 'habitants', 5], ['Un hôpital réalise environ $@$ analyses de sang par an.', 'analyses', 5],
                              ['Un litre de sang contient environ $@$ milliers de globules blancs.', 'milliers', 3], ['Une région compte environ $@$ infirmiers.', 'infirmiers', 4]]);
            m = A.choix([1.2, 2.5, 3.4, 4.5, 6.8, 7.5]); v = arrondi(m * Math.pow(10, S1[2]));
            q.type = 'nombre'; q.decimal = true;
            q.texte = S1[0].replace('@', sci(m, S1[2])) + ' Écrire ce nombre sans puissance de $10$.';
            q.attendu = v;
            q.explication = '$' + sci(m, S1[2]) + '=' + dec(v) + '$ ' + S1[1] + ' : on décale la virgule de $' + S1[2] + '$ rangs vers la droite.';
            q.rappel = RAPPEL;
            return q;
        }
        if (niveau === 2) {
            var S2 = A.choix([['Une bactérie mesure environ $@$ m.', -6], ['Un globule rouge a un diamètre d\'environ $@$ m.', -6], ['Un virus de la grippe mesure environ $@$ m.', -7], ['Une cellule de la peau mesure environ $@$ m.', -5]]);
            m = A.choix([1.2, 2, 2.5, 3, 7, 8]); e = S2[1]; v = m * Math.pow(10, e);
            q.type = 'champs';
            q.texte = S2[0].replace('@', dec(v)) + ' Écrire cette longueur en écriture scientifique.';
            q.gabarit = '[] $\\times10$ puissance [] m';
            q.attendus = [m, e];
            q.explication = '$' + dec(v) + '=' + sci(m, e) + '$ m : la virgule se déplace de $' + (-e) + '$ rangs vers la droite pour obtenir $' + fr(m) + '$.';
            return q;
        }
        var a, b;
        do { a = A.choix([1, 2, 4, 5]); b = A.choix([1, 2, 3, 4, 5, 6, 8]); } while ((10 * b) % a);
        q.type = 'nombre';
        q.texte = 'Un virus mesure $' + sci(a, -7) + '$ m et une bactérie $' + sci(b, -6) + '$ m. Combien de fois la bactérie est-elle plus longue que le virus ?';
        q.attendu = 10 * b / a;
        q.explication = '$' + sci(b, -6) + '=' + sci(10 * b, -7) + '$, donc $' + frac(sci(10 * b, -7), sci(a, -7)) + '=' + frac(10 * b, a) + '=' + q.attendu + '$ : la bactérie est $' + q.attendu + '$ fois plus longue.';
        return q;
    };

    /* ---------- P2 · Proportion d'une proportion ---------- */
    AutoT.propDeProp = function (niveau, forme) {
        forme = forme || 2;
        if (forme === 2) return AutoT.proportionDeProportion(niveau);
        var q = { niveau: niveau, objectif: 'Proportions · Proportion d\'une proportion' }, a, b, r, N;
        var S = A.choix([
            ['des patients d\'un service sont des femmes', 'parmi elles', 'ont plus de 70 ans', 'des patients sont des femmes de plus de 70 ans', 'patients'],
            ['des élèves d\'un lycée sont internes', 'parmi eux', 'rentrent chez eux le mercredi', 'des élèves sont des internes qui rentrent le mercredi', 'élèves'],
            ['des salariés d\'une clinique sont infirmiers', 'parmi eux', 'travaillent de nuit', 'des salariés sont des infirmiers de nuit', 'salariés']
        ]);
        var RAPPEL = 'La proportion d\'une proportion s\'obtient en <b>multipliant</b> les deux proportions (écrites en décimal).<br>' +
            'Exemple : $60\\,\\%$ des patients sont des femmes et, parmi elles, $25\\,\\%$ ont plus de $70$ ans : $0{,}6\\times0{,}25=0{,}15$, soit $15\\,\\%$ des patients.';
        if (forme === 1) {
            if (niveau < 3) {
                if (niveau === 1) { a = A.choix([20, 40, 50, 60, 80]); b = A.choix([10, 25, 50, 30]); }
                else { a = A.choix([30, 45, 70, 35, 65, 90]); b = A.choix([20, 40, 60, 80, 30]); }
                r = arrondi(a * b / 100);
                q.texte = '$' + pct(a) + '$ ' + S[0] + ' ; ' + S[1] + ', $' + pct(b) + '$ ' + S[2] + '. Quel pourcentage ' + S[3] + ' ?';
                q.explication = 'On multiplie les proportions : $' + fr(a / 100) + '\\times' + fr(b / 100) + '=' + fr(r / 100) + '$, soit $' + pct(r) + '$ (on n\'additionne pas les pourcentages).';
                if (niveau === 1) q.rappel = RAPPEL;
                return qcmValeurs(q, '$' + pct(r) + '$', r, [['$' + pct(a + b) + '$', a + b], a !== b ? ['$' + pct(Math.abs(a - b)) + '$', Math.abs(a - b)] : ['$' + pct(2 * a) + '$', 2 * a], ['$' + pct(arrondi(r / 10)) + '$', r / 10], ['$' + pct(arrondi(a * b / 1000)) + '$', a * b / 1000]]);
            }
            do { a = A.choix([20, 25, 40, 50, 60, 80]); b = A.choix([10, 20, 25, 40, 50, 75]); } while ((a * b / 100) % 1);
            var g = a * b / 100;
            q.texte = '$' + pct(a) + '$ ' + S[0] + ', et $' + pct(g) + '$ ' + S[3] + '. Parmi les premiers, quel pourcentage ' + S[2] + ' ?';
            q.explication = 'On cherche $p$ tel que $' + fr(a / 100) + '\\times p=' + fr(g / 100) + '$ : $p=' + frac(fr(g / 100), fr(a / 100)) + '=' + fr(b / 100) + '$, soit $' + pct(b) + '$.';
            return qcmValeurs(q, '$' + pct(b) + '$', b, [['$' + pct(arrondi(a * g / 100)) + '$', a * g / 100], ['$' + pct(a - g) + '$', a - g], ['$' + pct(a + g) + '$', a + g], ['$' + pct(g) + '$', g]]);
        }
        // forme 3 : avec des effectifs
        if (niveau === 3) return AutoT.proportionDeProportion(3);
        do {
            N = A.choix([200, 400, 500, 800, 1000, 1200]);
            a = niveau === 1 ? A.choix([20, 40, 50, 60, 80]) : A.choix([30, 35, 45, 70, 75]);
            b = niveau === 1 ? A.choix([10, 25, 50]) : A.choix([20, 40, 60, 80]);
        } while ((N * a * b / 10000) % 1);
        q.type = 'nombre';
        q.texte = 'Sur $' + fr(N) + '$ ' + S[4] + ', $' + pct(a) + '$ ' + S[0].replace(/^des [^ ]+( d'un [^ ]+| d'une [^ ]+)? /, '') + ' ; ' + S[1] + ', $' + pct(b) + '$ ' + S[2] + '. Combien ' + S[3].replace(/^des /, 'de ') + ' ?';
        q.attendu = N * a * b / 10000;
        q.explication = '$' + fr(a / 100) + '\\times' + fr(b / 100) + '=' + fr(a * b / 10000) + '$, donc $' + pct(arrondi(a * b / 100)) + '$ des ' + S[4] + '. Puis $' + fr(a * b / 10000) + '\\times' + fr(N) + '=' + fr(q.attendu) + '$ ' + S[4] + '.';
        if (niveau === 1) q.rappel = RAPPEL;
        return q;
    };

    /* ---------- F7 · Équation réduite d'une droite passant par deux points ---------- */
    AutoT.droiteDeuxPoints = function (niveau, forme) {
        forme = forme || 2;
        var q = { niveau: niveau, objectif: 'Droites · Équation par deux points' }, x1, x2, y1, y2, m, p, mn, md;
        var RAPPEL = 'Droite passant par $A(x_A\\,;\\,y_A)$ et $B(x_B\\,;\\,y_B)$ : coefficient directeur $m=' + frac('y_B-y_A', 'x_B-x_A') + '$.<br>' +
            'Puis on trouve $p$ en écrivant que $A$ est sur la droite : $y_A=m\\,x_A+p$.<br>Exemple : $A(1\\,;\\,3)$ et $B(3\\,;\\,7)$ : $m=' + frac('7-3', '3-1') + '=2$ ; $3=2\\times1+p$ donc $p=1$ : $y=2x+1$.';
        function pts() {
            do {
                md = niveau === 3 && forme === 2 ? A.choix([2, 3]) : 1;
                mn = niveau === 1 ? A.entier(1, 4) : A.nonNul(-4, 4);
                if (md > 1 && mn % md === 0) continue;
                m = mn / md; p = A.entier(-5, 6);
                x1 = A.entier(niveau === 1 ? 0 : -4, 3) * md; x2 = x1 + A.entier(1, 3) * md;
                y1 = m * x1 + p; y2 = m * x2 + p;
            } while (md > 1 && mn % md === 0 || Math.abs(y1) > 15 || Math.abs(y2) > 15 || (niveau === 1 && (y1 < 0 || y2 < 0)));
        }
        function eq(m, p) { return 'y=' + (m === 1 ? '' : m === -1 ? '-' : (m % 1 ? (m < 0 ? '-' : '') + frac(Math.abs(mn), md) : fr(m))) + 'x' + (p ? terme(p) : ''); }
        function calcM() {
            var brut = x2 - x1 === 1 ? String(y2 - y1) : frac(y2 - y1, x2 - x1) + '=' + texF([y2 - y1, x2 - x1]);
            return '$m=' + frac('y_B-y_A', 'x_B-x_A') + '=' + frac(y2 + '-' + par(y1), x2 + '-' + par(x1)) + '=' + brut + '$';
        }
        function calcP() {
            if (x1 === 0) return '$A(0\\,;\\,' + y1 + ')$ est le point de la droite d\'abscisse $0$ : $p=' + p + '$';
            return '$A$ est sur la droite : $' + y1 + '=' + (md > 1 ? texF([mn, md]) : m) + '\\times' + par(x1) + '+p$, donc $p=' + y1 + terme(-m * x1) + '=' + p + '$';
        }
        if (forme === 1) {
            pts();
            var nomA = 'A(' + x1 + '\\,;\\,' + y1 + ')', nomB = 'B(' + x2 + '\\,;\\,' + y2 + ')';
            if (niveau < 3) {
                q.texte = 'La droite $(AB)$ passe par $' + nomA + '$ et $' + nomB + '$. Son coefficient directeur est :';
                q.explication = calcM() + '.';
                if (niveau === 1) q.rappel = RAPPEL;
                return qcmValeurs(q, '$' + fr(m) + '$', m, [['$' + texF([x2 - x1, y2 - y1]) + '$', (x2 - x1) / (y2 - y1)], ['$' + fr(-m) + '$', -m],
                    ['$' + texF([y2 + y1, x2 - x1]) + '$', (y2 + y1) / (x2 - x1)], ['$' + texF([y2 - y1, x2 + x1 || 1]) + '$', (y2 - y1) / (x2 + x1 || 1)],
                    ['$' + fr(y2 - y1) + '$', y2 - y1], ['$' + fr(m + 1) + '$', m + 1], ['$' + fr(2 * m) + '$', 2 * m]]);
            }
            q.texte = 'La droite $(AB)$ passe par $' + nomA + '$ et $' + nomB + '$. Son équation réduite est :';
            q.explication = calcM() + '. ' + calcP() + '. Donc $(AB)\\ :\\ ' + eq(m, p) + '$.';
            return qcm(q, '$' + eq(m, p) + '$', ['$' + eq(m, y1) + '$', '$' + eq(-m, p) + '$', '$' + eq(m, p + m) + '$', '$' + eq(m, -p) + '$']);
        }
        if (forme === 2) {
            pts();
            q.type = 'champs';
            q.texte = 'Déterminer l\'équation réduite de la droite $(AB)$, avec $A(' + x1 + '\\,;\\,' + y1 + ')$ et $B(' + x2 + '\\,;\\,' + y2 + ')$.';
            q.gabarit = '$y=$ [] $x+$ []';
            q.attendus = [m, p];
            q.explication = calcM() + '.<br>' + calcP() + '. Donc $y=' + eq(m, p).slice(2) + '$.' + (md > 1 ? '<br><i>On peut écrire $' + mn + '/' + md + '$.</i>' : '');
            if (niveau === 1) q.rappel = RAPPEL;
            return q;
        }
        // forme 3 : situation affine (deux relevés)
        if (niveau < 3) {
            var S = A.choix([['Le prix de la location d\'un fauteuil roulant', 'jours', 'd', 'L(d)', 'du nombre $d$ de jours de location', 'jour'],
                             ['Le prix d\'un transport en ambulance', 'km', 'd', 'P(d)', 'de la distance $d$ parcourue (en km)', 'km'],
                             ['Le coût d\'un abonnement de téléassistance', 'mois', 'n', 'C(n)', 'du nombre $n$ de mois d\'abonnement', 'mois']]);
            var pu, fixe, d1, d2;
            do {
                pu = niveau === 1 ? A.entier(2, 9) : A.choix([1.5, 2.5, 0.5, 3.5, 1.2]);
                fixe = A.entier(2, 9) * 5; d1 = A.entier(1, 5) * (niveau === 1 ? 2 : 10); d2 = d1 + A.entier(1, 4) * (niveau === 1 ? 5 : 10);
            } while ((pu * d1) % 1 || (pu * d2) % 1);
            var c1 = fixe + pu * d1, c2 = fixe + pu * d2, v = S[2];
            q.type = 'champs';
            q.texte = S[0] + ' est une fonction affine ' + S[4] + ' : pour $' + d1 + '$ ' + S[1] + ', on paie $' + fr(c1) + '$ € ; pour $' + d2 + '$ ' + S[1] + ', on paie $' + fr(c2) + '$ €. Déterminer $' + S[3] + '=m' + v + '+p$.';
            q.gabarit = '$' + S[3] + '=$ [] $' + v + '+$ []';
            q.attendus = [pu, fixe];
            q.explication = '$m=' + frac(fr(c2) + '-' + fr(c1), d2 + '-' + d1) + '=' + frac(fr(c2 - c1), d2 - d1) + '=' + fr(pu) + '$ (le prix par ' + S[5] + ').<br>' +
                '$' + fr(c1) + '=' + fr(pu) + '\\times' + d1 + '+p$, donc $p=' + fr(c1) + '-' + fr(pu * d1) + '=' + fixe + '$ (la partie fixe). Donc $' + S[3] + '=' + fr(pu) + v + '+' + fixe + '$.';
            if (niveau === 1) q.rappel = RAPPEL;
            return q;
        }
        var r, s0, j1, j2;
        do { r = A.entier(2, 8); s0 = A.entier(8, 30) * r; j1 = A.entier(1, 5); j2 = j1 + A.entier(3, 8); } while (s0 - r * j2 <= 0);
        q.type = 'nombre';
        q.texte = 'Le stock de boîtes de gants d\'un service est une fonction affine du nombre de jours écoulés : il reste $' + (s0 - r * j1) + '$ boîtes au bout de $' + j1 + '$ jours et $' + (s0 - r * j2) + '$ boîtes au bout de $' + j2 + '$ jours. Au bout de combien de jours le stock sera-t-il épuisé ?';
        q.attendu = s0 / r;
        q.explication = '$m=' + frac((s0 - r * j2) + '-' + (s0 - r * j1), j2 + '-' + j1) + '=' + frac(-r * (j2 - j1), j2 - j1) + '=' + (-r) + '$ ; $' + (s0 - r * j1) + '=' + (-r) + '\\times' + j1 + '+p$ donc $p=' + s0 + '$.<br>' +
            'Stock : $S(j)=' + poly([-r, s0], 'j') + '$. On résout $' + poly([-r, s0], 'j') + '=0$ : $j=' + frac(s0, r) + '=' + (s0 / r) + '$ jours.';
        return q;
    };

    /* ---------- T4 · Fonction inverse ---------- */
    AutoT.inverse = function (niveau, forme) {
        forme = forme || 2;
        var q = { niveau: niveau, objectif: 'Fonction inverse · Images, variations' }, a;
        var RAPPEL = 'Fonction inverse : $f(x)=' + frac(1, 'x') + '$ pour $x\\neq0$. Elle est <b>décroissante</b> sur $]-\\infty\\,;\\,0[$ et sur $]0\\,;+\\infty[$.<br>' +
            'Exemples : $' + frac(1, 4) + '=0{,}25$ ; $' + frac(1, '0{,}2') + '=5$ (car $0{,}2\\times5=1$) ; $' + frac(1, -2) + '=-0{,}5$.';
        var VAL = [[2, '2'], [4, '4'], [5, '5'], [10, '10'], [-2, '-2'], [-4, '-4'], [0.5, '0{,}5'], [0.25, '0{,}25'], [0.2, '0{,}2'], [0.1, '0{,}1'], [-0.5, '-0{,}5'], [-0.1, '-0{,}1'], [100, '100']];
        if (forme === 1) {
            if (niveau === 1) {
                a = A.choix(VAL);
                q.texte = 'On considère la fonction inverse $f(x)=' + frac(1, 'x') + '$. Que vaut $f(' + a[1] + ')$ ?';
                var v = arrondi(1 / a[0]);
                q.explication = '$f(' + a[1] + ')=' + frac(1, a[1]) + '=' + fr(v) + '$ car $' + a[1] + '\\times' + par(fr(v)) + '=1$.';
                q.rappel = RAPPEL;
                return qcmValeurs(q, '$' + fr(v) + '$', v, [['$' + fr(-v) + '$', -v], ['$' + fr(a[0]) + '$', a[0]], ['$' + fr(-a[0]) + '$', -a[0]], ['$' + fr(arrondi(1 - a[0])) + '$', 1 - a[0]]]);
            }
            if (niveau === 2) {
                var neg = Math.random() < 0.4, u = neg ? '$a<b<0$' : '$0<a<b$';
                q.texte = 'On sait que ' + u + '. Que peut-on dire de $' + frac(1, 'a') + '$ et $' + frac(1, 'b') + '$ ?';
                q.explication = 'La fonction inverse est <b>décroissante</b> sur ' + (neg ? '$]-\\infty\\,;\\,0[$' : '$]0\\,;+\\infty[$') + ' : elle change l\'ordre. Donc $' + frac(1, 'a') + '>' + frac(1, 'b') + '$. Exemple : ' + (neg ? '$-4<-2$ et $-0{,}25>-0{,}5$.' : '$2<4$ et $0{,}5>0{,}25$.');
                return qcm(q, '$' + frac(1, 'a') + '>' + frac(1, 'b') + '$', ['$' + frac(1, 'a') + '<' + frac(1, 'b') + '$', '$' + frac(1, 'a') + '=' + frac(1, 'b') + '$', 'On ne peut pas savoir.']);
            }
            a = A.choix(VAL.filter(function (t) { return Math.abs(t[0]) !== 1; }));
            var b = arrondi(1 / a[0]);
            q.texte = 'Par la fonction inverse, l\'antécédent de $' + fr(b) + '$ est :';
            q.explication = 'On cherche $x$ tel que $' + frac(1, 'x') + '=' + fr(b) + '$ : $x=' + frac(1, fr(b)) + '=' + a[1] + '$.';
            return qcmValeurs(q, '$' + a[1] + '$', a[0], [['$' + fr(b) + '$', b], ['$' + fr(-a[0]) + '$', -a[0]], ['$' + fr(-b) + '$', -b], ['$' + fr(arrondi(1 - b)) + '$', 1 - b]]);
        }
        if (forme === 2) {
            if (niveau === 1) return AutoT.fonctionInverse(1);
            if (niveau === 3) { q = AutoT.fonctionInverse(3); q.objectif = 'Fonction inverse · Résoudre une équation'; return q; }
            a = A.choix(VAL);
            var bb = arrondi(1 / a[0]);
            q.type = 'nombre';
            q.texte = 'Résoudre l\'équation $' + frac(1, 'x') + '=' + fr(bb) + '$.';
            q.prefixe = 'x=';
            q.attendu = a[0];
            q.explication = '$' + frac(1, 'x') + '=' + fr(bb) + '$ équivaut à $x=' + frac(1, fr(bb)) + '=' + a[1] + '$.';
            return q;
        }
        // forme 3 : en situation
        if (niveau === 1) { q = AutoT.fonctionInverse(2); q.objectif = 'Fonction inverse · En situation'; q.niveau = 1; q.rappel = RAPPEL; return q; }
        var k, c, n, V;
        if (niveau === 2) {
            do { k = A.choix([120, 240, 300, 360, 500, 600, 1000]); c = A.entier(1, 6); n = A.choix([10, 20, 30, 40, 50, 60, 100, 120, 200]); } while ((k / n) % 1 || k / n < 1);
            V = k / n + c;
            q.type = 'nombre';
            q.texte = 'Le coût moyen (en €) d\'un test, quand on en produit $n$, est $M(n)=' + frac(k, 'n') + '+' + c + '$. Combien de tests faut-il produire pour que le coût moyen soit de $' + fr(V) + '$ € ?';
            q.prefixe = 'n=';
            q.attendu = n;
            q.explication = '$' + frac(k, 'n') + '+' + c + '=' + fr(V) + '$, donc $' + frac(k, 'n') + '=' + fr(V - c) + '$, donc $n=' + frac(k, fr(V - c)) + '=' + n + '$ tests.';
            return q;
        }
        var vol = A.choix([250, 500, 1000]), tmax = A.choix([10, 20, 25, 50]);
        q.type = 'nombre';
        q.texte = 'Avec un débit de $x$ mL par minute, une perfusion de $' + vol + '$ mL dure $T(x)=' + frac(vol, 'x') + '$ minutes. Quel débit minimal faut-il pour que la perfusion dure au plus $' + tmax + '$ minutes ?';
        q.prefixe = 'x\\geqslant';
        q.attendu = vol / tmax;
        q.explication = '$T$ est décroissante (plus le débit est grand, plus la perfusion est courte). $T(x)=' + tmax + '$ pour $x=' + frac(vol, tmax) + '=' + fr(vol / tmax) + '$ : il faut un débit d\'au moins $' + fr(vol / tmax) + '$ mL/min.';
        return q;
    };

    /* ---------- C10 · Développer, factoriser, réduire ---------- */
    AutoT.calculLitteral = function (niveau, forme) {
        forme = forme || 2;
        var q = { niveau: niveau, objectif: niveau === 3 && forme < 3 ? 'Calcul littéral · Factoriser' : 'Calcul littéral · Développer, réduire' }, a, b, c, d, k;
        var RAPPEL = 'Développer : $k(a+b)=ka+kb$ et $(a+b)(c+d)=ac+ad+bc+bd$. Un signe $-$ devant une parenthèse change tous les signes : $-(x-4)=-x+4$.<br>' +
            'Factoriser : on met le facteur commun devant, $6x^2-15x=3x(2x-5)$ ; et $x^2-9=(x-3)(x+3)$.';
        function prod(a, b) { return '(' + poly([a, b]) + ')'; }
        if (forme === 1) {
            if (niveau === 1) {
                k = A.entier(2, 5); a = A.entier(1, 4); b = A.nonNul(-6, 6); c = A.entier(1, 3); d = A.nonNul(-6, 6);
                if (k * a === c) c++;
                var e1 = k + prod(a, b) + '-' + prod(c, d);
                q.texte = 'La forme développée et réduite de $' + e1 + '$ est :';
                q.explication = '$' + e1 + '=' + poly([k * a, k * b]) + (c === 1 ? '-x' : '-' + c + 'x') + terme(-d) + '=' + poly([k * a - c, k * b - d]) + '$ : le signe $-$ change les deux signes de la parenthèse.';
                q.rappel = RAPPEL;
                return qcm(q, '$' + poly([k * a - c, k * b - d]) + '$', ['$' + poly([k * a - c, k * b + d]) + '$', '$' + poly([a - c, k * b - d]) + '$', '$' + poly([k * a + c, k * b - d]) + '$', '$' + poly([k * a - c, b - d]) + '$']);
            }
            if (niveau === 2) {
                a = A.entier(1, 3); b = A.nonNul(-5, 5); c = A.entier(1, 3); d = A.nonNul(-5, 5);
                var e2 = prod(a, b) + prod(c, d);
                q.texte = 'La forme développée et réduite de $' + e2 + '$ est :';
                q.explication = '$' + e2 + '=' + poly([a * c, 0, 0]) + terme(a * d) + 'x' + terme(b * c) + 'x' + terme(b * d) + '=' + poly([a * c, a * d + b * c, b * d]) + '$.';
                return qcm(q, '$' + poly([a * c, a * d + b * c, b * d]) + '$', ['$' + poly([a * c, b * d]) + '$', '$' + poly([a * c, a * d + b * c, -b * d]) + '$', '$' + poly([a * c, a * d - b * c, b * d]) + '$', '$' + poly([a + c, b + d]) + '$']);
            }
            if (Math.random() < 0.5) {
                a = A.entier(2, 9);
                q.texte = 'Une forme factorisée de $x^2-' + a * a + '$ est :';
                q.explication = '$x^2-' + a * a + '=x^2-' + a + '^2=(x-' + a + ')(x+' + a + ')$ (identité $a^2-b^2=(a-b)(a+b)$). Vérification : $(x-' + a + ')(x+' + a + ')=x^2+' + a + 'x-' + a + 'x-' + a * a + '$.';
                return qcm(q, '$(x-' + a + ')(x+' + a + ')$', ['$(x-' + a + ')^2$', '$(x-' + a * a + ')(x+' + a * a + ')$', '$x(x-' + a * a + ')$', '$(x+' + a + ')^2$']);
            }
            k = A.entier(2, 5); a = A.entier(1, 4); b = A.nonNul(-7, 7);
            while (pgcd(a, b) > 1) b = A.nonNul(-7, 7);
            q.texte = 'Une forme factorisée de $' + poly([k * a, k * b, 0]) + '$ est :';
            q.explication = 'Le facteur commun est $' + k + 'x$ : $' + poly([k * a, k * b, 0]) + '=' + k + 'x' + prod(a, b) + '$. Vérification : $' + k + 'x\\times' + (a === 1 ? 'x' : a + 'x') + '=' + poly([k * a, 0, 0]) + '$ et $' + k + 'x\\times' + par(b) + '=' + poly([k * b, 0]) + '$.';
            return qcm(q, '$' + k + 'x' + prod(a, b) + '$', ['$' + k + prod(a, b) + '$', '$x' + prod(k * a, b) + '$', '$' + k + 'x' + prod(a, k * b) + '$', '$' + k + 'x' + prod(-a, b) + '$']);
        }
        q.type = 'expr';
        if (forme === 2) {
            if (niveau === 1) {
                k = A.entier(2, 6); a = A.nonNul(-5, 5); b = A.nonNul(-7, 7); c = A.entier(2, 5); d = A.nonNul(-6, 6);
                q.consigne = 'Développer et réduire'; q.enonce = 'A=' + k + prod(a, b) + '-' + c + prod(1, d); q.prefixe = 'A=';
                q.forme = 'developpee';
                q.attendu = poly([k * a - c, k * b - c * d]);
                q.correction = ['A&=' + k + prod(a, b) + '-' + c + prod(1, d), '&=' + poly([k * a, k * b]) + '-' + c + 'x' + terme(-c * d), '&=' + q.attendu];
                q.rappel = RAPPEL;
                return q;
            }
            if (niveau === 2) {
                a = A.nonNul(-3, 3); b = A.nonNul(-6, 6); c = A.entier(1, 3); d = A.nonNul(-6, 6);
                q.consigne = 'Développer et réduire'; q.enonce = 'B=' + prod(a, b) + prod(c, d); q.prefixe = 'B=';
                q.forme = 'developpee';
                q.attendu = poly([a * c, a * d + b * c, b * d]);
                q.correction = ['B&=' + prod(a, b) + prod(c, d), '&=' + poly([a * c, 0, 0]) + terme(a * d) + 'x' + terme(b * c) + 'x' + terme(b * d), '&=' + q.attendu];
                return q;
            }
            k = A.entier(2, 6); a = A.entier(1, 5); b = A.nonNul(-7, 7);
            while (pgcd(a, b) > 1) b = A.nonNul(-7, 7);
            var sgK = A.signe();
            q.consigne = 'Factoriser'; q.enonce = 'C=' + poly([sgK * k * a, sgK * k * b, 0]); q.prefixe = 'C=';
            q.forme = 'factorisee'; q.facteur = poly([a, b]);
            q.attendu = (sgK < 0 ? '-' : '') + k + 'x*(' + poly([a, b]) + ')';
            q.correction = ['C&=' + poly([sgK * k * a, sgK * k * b, 0]), '&=' + (sgK < 0 ? '-' : '') + k + 'x' + prod(a, b)];
            return q;
        }
        // forme 3 : en situation (aires)
        q.forme = 'developpee'; q.variables = 'x';
        if (niveau === 1) {
            a = A.entier(2, 9); b = A.entier(2, 6);
            q.texte = 'Une salle de soins rectangulaire mesure $(x+' + a + ')$ m de long et $' + b + '$ m de large. Exprimer son aire $\\mathcal{A}$ (en m²) sous forme développée et réduite.';
            q.prefixe = '\\mathcal{A}=';
            q.attendu = poly([b, a * b]);
            q.correction = ['\\mathcal{A}&=' + b + '(x+' + a + ')', '&=' + q.attendu];
            q.rappel = RAPPEL;
            return q;
        }
        if (niveau === 2) {
            a = A.entier(2, 3); b = A.entier(1, 5); c = A.entier(1, 6);
            q.texte = 'Un jardin thérapeutique rectangulaire mesure $(' + poly([a, b]) + ')$ m sur $(x+' + c + ')$ m. Exprimer son aire $\\mathcal{A}$ (en m²) sous forme développée et réduite.';
            q.prefixe = '\\mathcal{A}=';
            q.attendu = poly([a, a * c + b, b * c]);
            q.correction = ['\\mathcal{A}&=(' + poly([a, b]) + ')(x+' + c + ')', '&=' + poly([a, 0, 0]) + '+' + (a * c) + 'x+' + b + 'x+' + (b * c), '&=' + q.attendu];
            return q;
        }
        a = A.entier(1, 6);
        q.texte = 'Dans un carré de côté $(x+' + a + ')$ m, on retire un carré de côté $' + a + '$ m. Exprimer l\'aire restante $\\mathcal{A}$ (en m²) sous forme développée et réduite.';
        q.prefixe = '\\mathcal{A}=';
        q.attendu = poly([1, 2 * a, 0]);
        q.correction = ['\\mathcal{A}&=(x+' + a + ')^2-' + a + '^2', '&=x^2+' + (2 * a) + 'x+' + (a * a) + '-' + (a * a), '&=' + q.attendu];
        return q;
    };

    /* ---------- E4 · Indice de base 100 ---------- */
    AutoT.indice = function (niveau, forme) {
        forme = forme || 2;
        var q = { niveau: niveau, objectif: 'Évolutions · Indice de base 100' }, V0, I, V1, an0 = A.choix([2015, 2018, 2020]), an1 = an0 + A.entier(3, 7);
        var RAPPEL = 'Indice de base $100$ : $I=' + frac('V', 'V_0') + '\\times100$, où $V_0$ est la valeur de l\'année de référence (indice $100$).<br>' +
            'Un indice de $112$ signifie une hausse de $12\\,\\%$ depuis l\'année de référence ; un indice de $85$, une baisse de $15\\,\\%$.';
        function tirage(liste) { do { V0 = A.choix([40, 50, 80, 120, 200, 250, 400, 500, 1200, 2400]); I = A.choix(liste); V1 = arrondi(V0 * I / 100); } while (V1 % 1); }
        if (forme === 1) {
            if (niveau === 1) {
                I = A.choix([104, 108, 112, 115, 120, 125, 130, 92, 85, 80, 95]);
                q.texte = 'Le nombre de consultations d\'un centre de santé a l\'indice $100$ en ' + an0 + ' et l\'indice $' + I + '$ en ' + an1 + '. Cela signifie que, entre ' + an0 + ' et ' + an1 + ', le nombre de consultations :';
                q.qcmLignes = true;
                var t = Math.abs(I - 100), h = I > 100;
                q.explication = 'De l\'indice $100$ à l\'indice $' + I + '$ : ' + (h ? 'hausse' : 'baisse') + ' de $' + pct(t) + '$. L\'indice ne donne pas le nombre de consultations lui-même.';
                q.rappel = RAPPEL;
                return qcm(q, 'a ' + (h ? 'augmenté' : 'baissé') + ' de $' + pct(t) + '$', ['vaut $' + I + '$', 'a ' + (h ? 'augmenté' : 'baissé') + ' de $' + t + '$ consultations', 'a ' + (h ? 'baissé' : 'augmenté') + ' de $' + pct(t) + '$', 'a augmenté de $' + pct(I) + '$']);
            }
            if (niveau === 2) {
                tirage([105, 110, 115, 120, 125, 130, 150, 90, 80, 75]);
                q.texte = 'Le prix d\'un médicament était de $' + fr(V0) + '$ € en ' + an0 + ' (indice $100$) et de $' + fr(V1) + '$ € en ' + an1 + '. Son indice en ' + an1 + ' est :';
                q.explication = '$I=' + frac(fr(V1), fr(V0)) + '\\times100=' + fr(I / 100) + '\\times100=' + I + '$.';
                return qcmValeurs(q, '$' + I + '$', I, [['$' + fr(V1) + '$', V1], ['$' + fr(arrondi(V1 - V0)) + '$', V1 - V0], ['$' + fr(arrondi(100 + V1 - V0)) + '$', 100 + V1 - V0], ['$' + fr(arrondi(V0 / V1 * 100 * 100) / 100) + '$', V0 / V1 * 100]]);
            }
            var P = A.choix([[120, 150, 25], [80, 100, 25], [125, 150, 20], [150, 120, -20], [200, 150, -25], [80, 60, -25], [110, 132, 20], [125, 100, -20]]);
            q.texte = 'L\'indice des dépenses de santé d\'un ménage passe de $' + P[0] + '$ en ' + (an1 - 2) + ' à $' + P[1] + '$ en ' + an1 + ' (base $100$ en ' + an0 + '). Entre ' + (an1 - 2) + ' et ' + an1 + ', les dépenses ont évolué de :';
            q.explication = 'On calcule le taux entre les deux indices : $' + frac(P[1] + '-' + P[0], P[0]) + '=' + frac(P[1] - P[0], P[0]) + '=' + fr(P[2] / 100) + '$, soit $' + (P[2] > 0 ? '+' : '') + pct(P[2]) + '$ (et non $' + (P[1] > P[0] ? '+' : '') + pct(P[1] - P[0]) + '$ : on divise par l\'indice de départ).';
            return qcmValeurs(q, '$' + (P[2] > 0 ? '+' : '') + pct(P[2]) + '$', P[2], [['$' + (P[1] > P[0] ? '+' : '') + pct(P[1] - P[0]) + '$', P[1] - P[0]], ['$+' + pct(P[1]) + '$', P[1]], ['$' + (P[2] > 0 ? '-' : '+') + pct(Math.abs(P[2])) + '$', -P[2]], ['$+' + pct(P[1] - 100) + '$', P[1] - 100]]);
        }
        if (forme === 2) {
            q.type = 'nombre';
            if (niveau === 1) {
                tirage([105, 110, 115, 120, 125, 130, 150, 90, 80, 75, 95]);
                q.texte = 'Un tarif vaut $' + fr(V0) + '$ € en ' + an0 + ' et $' + fr(V1) + '$ € en ' + an1 + '. Calculer son indice en ' + an1 + ', base $100$ en ' + an0 + '.';
                q.prefixe = 'I=';
                q.attendu = I;
                q.explication = '$I=' + frac(fr(V1), fr(V0)) + '\\times100=' + I + '$.';
                q.rappel = RAPPEL;
                return q;
            }
            if (niveau === 2) {
                tirage([104, 106, 108, 112, 115, 118, 85, 92, 96]);
                q.texte = 'Le nombre de passages aux urgences d\'un hôpital était de $' + fr(V0) + '$ par semaine en ' + an0 + ' (indice $100$). En ' + an1 + ', l\'indice est $' + I + '$. Calculer le nombre de passages par semaine en ' + an1 + '.';
                q.attendu = V1;
                q.explication = '$V=' + fr(V0) + '\\times' + frac(I, 100) + '=' + fr(V0) + '\\times' + fr(I / 100) + '=' + fr(V1) + '$ passages.';
                return q;
            }
            q = AutoT.indice(3, 1); q.niveau = 3;
            var m = /passe de \$(\d+)\$ en (\d+) à \$(\d+)\$/.exec(q.texte);
            var i0 = +m[1], i1 = +m[3], tt = arrondi((i1 - i0) / i0 * 100);
            delete q.options; delete q.bonne; delete q.qcmLignes;
            q.type = 'champs';
            q.texte = q.texte.replace(/les dépenses ont évolué de :$/, 'calculer le taux d\'évolution des dépenses. <i>(négatif pour une baisse)</i>');
            q.gabarit = '[] $\\,\\%$';
            q.attendus = [tt];
            return q;
        }
        // forme 3 : en situation, tableau d'indices
        if (niveau === 1) {
            I = A.choix([85, 90, 92, 104, 108, 112, 115, 120, 125]);
            q.type = 'champs';
            q.texte = 'Le nombre de places en EHPAD d\'un département a l\'indice $100$ en ' + an0 + ' et l\'indice $' + I + '$ en ' + an1 + '. Quel est le taux d\'évolution du nombre de places entre ' + an0 + ' et ' + an1 + ' ? <i>(négatif pour une baisse)</i>';
            q.gabarit = '[] $\\,\\%$';
            q.attendus = [I - 100];
            q.explication = '$' + frac(I + '-100', 100) + '=' + fr((I - 100) / 100) + '$ : ' + (I > 100 ? 'hausse' : 'baisse') + ' de $' + pct(Math.abs(I - 100)) + '$.';
            q.rappel = RAPPEL;
            return q;
        }
        tirage([85, 90, 92, 104, 108, 112, 115, 120, 125, 75]);
        q.type = 'nombre';
        if (niveau === 2) {
            q.texte = 'En ' + an0 + ', un département comptait $' + fr(V0) + '$ places en EHPAD (indice $100$). En ' + an1 + ', l\'indice vaut $' + I + '$. Combien de places compte-t-il en ' + an1 + ' ?';
            q.attendu = V1;
            q.explication = '$' + fr(V0) + '\\times' + fr(I / 100) + '=' + fr(V1) + '$ places.';
            return q;
        }
        q.texte = 'En ' + an1 + ', un département compte $' + fr(V1) + '$ places en EHPAD, ce qui correspond à l\'indice $' + I + '$ (base $100$ en ' + an0 + '). Combien de places comptait-il en ' + an0 + ' ?';
        q.attendu = V0;
        q.explication = '$V_0\\times' + fr(I / 100) + '=' + fr(V1) + '$, donc $V_0=' + frac(fr(V1), fr(I / 100)) + '=' + fr(V0) + '$ places (ou $' + frac(fr(V1) + '\\times100', I) + '$).';
        return q;
    };

    /* ---------- F3 · Signe et variations d'une fonction, lus sur sa courbe ---------- */
    function morceauxMonotones(C) {          // [{a, b, monte}] : intervalles maximaux de monotonie
        var r = [], i0 = 0;
        for (var i = 1; i < C.ys.length; i++) {
            var monte = C.ys[i] > C.ys[i - 1];
            if (i === C.ys.length - 1 || (C.ys[i + 1] > C.ys[i]) !== monte) { r.push({ a: C.xs[i0], b: C.xs[i], monte: monte }); i0 = i; }
        }
        return r;
    }
    function courbeSituation() {             // même courbe, décalée sur [0 ; 8]
        var C = courbeAleatoire(), dx = -C.xmin;
        return { xs: C.xs.map(function (x) { return x + dx; }), ys: C.ys, xmin: 0, xmax: 8, points: C.points.map(function (P) { return [P[0] + dx, P[1]]; }) };
    }
    function figureSituation(C, nom, positif) {
        var lo = Math.min.apply(null, C.ys), hi = Math.max.apply(null, C.ys);
        return repere({ xmin: -1, xmax: C.xmax, ymin: positif ? -1 : Math.min(-1, lo - 1), ymax: hi + 1, c: 32, courbe: C.points, nom: nom });
    }
    AutoT.signeVariations = function (niveau, forme) {
        forme = forme || 2;
        var q = { niveau: niveau, objectif: 'Fonctions · Signe et variations (lecture graphique)' }, C, M, P, N;
        var RAPPEL = '<b>Variations</b> : $f$ est croissante quand la courbe monte (de gauche à droite), décroissante quand elle descend ; on donne des intervalles de valeurs de $x$.<br>' +
            '<b>Signe</b> : $f(x)>0$ quand la courbe est au-dessus de l\'axe des abscisses, $f(x)<0$ quand elle est en dessous ; $f(x)=0$ là où elle coupe l\'axe.';
        var sit = forme === 3;
        for (;;) {
            C = sit ? courbeSituation() : courbeAleatoire(); M = morceauxMonotones(C);
            P = resoudre(C, 0, '>'); N = resoudre(C, 0, '<');
            if (!P.length || !N.length) continue;
            if (niveau === 1 && M.filter(function (m) { return m.monte; }).length !== 1) continue;
            if (niveau === 2 && (P.length !== 1 || P[0].ga || P[0].db)) continue;     // une seule zone positive, entre deux zéros
            if (niveau === 3 && (C.ys.filter(function (y) { return y === Math.max.apply(null, C.ys); }).length > 1 || C.ys.filter(function (y) { return y === Math.min.apply(null, C.ys); }).length > 1)) continue;
            break;
        }
        var F = sit ? 'B' : 'f', I = '[' + C.xmin + '\\,;\\,' + C.xmax + ']';
        q.figure = sit ? figureSituation(C, '𝒞<tspan font-size="12">B</tspan>') : figureCourbe(C);
        q.figureNote = noteCourbe(C);
        var intro = sit ? 'Une entreprise fabrique du matériel médical. La courbe donne son bénéfice $B(x)$ (en milliers d\'euros) pour $x$ centaines d\'appareils vendus, $x\\in' + I + '$. '
                        : 'On considère la fonction $f$ définie sur $' + I + '$ et représentée ci-dessous. ';
        var cr = M.filter(function (m) { return m.monte; }), de = M.filter(function (m) { return !m.monte; });
        function iv(m) { return '$[' + m.a + '\\,;\\,' + m.b + ']$'; }
        function listeIv(t) { return t.map(iv).join(' et '); }
        var varTxt = 'La courbe monte sur ' + listeIv(cr) + ' et descend sur ' + listeIv(de) + '.';
        if (forme === 1) {
            if (niveau === 1) {
                var bon = A.choix(cr.concat(de)), monte = bon.monte;
                q.texte = intro + 'Sur quel intervalle la fonction $f$ est-elle ' + (monte ? 'croissante' : 'décroissante') + ' ?';
                q.explication = varTxt + ' Donc $f$ est ' + (monte ? 'croissante' : 'décroissante') + ' sur ' + iv(bon) + '. On répond avec des <b>abscisses</b>.';
                q.rappel = RAPPEL;
                var autres = M.filter(function (m) { return m !== bon; }).map(iv);
                var iy = C.ys[C.xs.indexOf(bon.a)], jy = C.ys[C.xs.indexOf(bon.b)];
                autres.push('$[' + Math.min(iy, jy) + '\\,;\\,' + Math.max(iy, jy) + ']$');
                return qcm(q, iv(bon), autres.concat(['$' + I + '$']));
            }
            var op = niveau === 2 ? '>' : A.choix(['<', '<=']), S = resoudre(C, 0, op), SIG = { '>': '>', '<': '<', '<=': '\\leqslant' };
            q.texte = intro + 'Sur quel ensemble a-t-on $f(x)' + SIG[op] + '0$ ?';
            q.explication = '$f(x)' + SIG[op] + '0$ quand la courbe est ' + (op === '>' ? 'au-dessus' : 'en dessous') + ' de l\'axe des abscisses' + (op === '<=' ? ' (ou dessus : crochets fermés aux zéros)' : '') + ' : $' + texIntervalles(S).replace(/\$/g, '') + '$.';
            return qcm(q, texIntervalles(S), [texIntervalles(resoudre(C, 0, op === '>' ? '<' : '>')), texIntervalles(resoudre(C, 0, op === '<=' ? '<' : op === '<' ? '<=' : '>=')),
                '$[' + Math.min.apply(null, C.ys) + '\\,;\\,0]$', '$[0\\,;\\,' + Math.max.apply(null, C.ys) + ']$']);
        }
        q.type = 'champs';
        if (niveau === 1) {
            q.texte = intro + (sit ? 'Sur quel intervalle le bénéfice augmente-t-il ?' : 'Sur quel intervalle la fonction $f$ est-elle croissante ?');
            q.gabarit = '[ [] ; [] ]';
            q.attendus = [cr[0].a, cr[0].b];
            q.explication = varTxt + ' Donc ' + (sit ? 'le bénéfice augmente' : '$f$ est croissante') + ' sur ' + iv(cr[0]) + (sit ? ' (entre $' + cr[0].a * 100 + '$ et $' + cr[0].b * 100 + '$ appareils).' : '.');
            q.rappel = RAPPEL;
            return q;
        }
        if (niveau === 2) {
            q.texte = intro + (sit ? 'Pour quelles quantités l\'entreprise est-elle bénéficiaire ($B(x)>0$) ?' : 'Pour quelles valeurs de $x$ a-t-on $f(x)>0$ ?');
            q.gabarit = 'pour $x$ strictement compris entre [] et []';
            q.attendus = [P[0].a, P[0].b];
            q.explication = 'La courbe est au-dessus de l\'axe des abscisses entre ses points d\'intersection d\'abscisses $' + P[0].a + '$ et $' + P[0].b + '$ : $' + F + '(x)>0$ pour $x\\in]' + P[0].a + '\\,;\\,' + P[0].b + '[$' +
                (sit ? ', c\'est-à-dire entre $' + P[0].a * 100 + '$ et $' + P[0].b * 100 + '$ appareils.' : '.');
            return q;
        }
        var mx = Math.max.apply(null, C.ys), mn = Math.min.apply(null, C.ys);
        q.texte = intro + (sit ? 'Quel est le bénéfice maximal, et pour combien de centaines d\'appareils est-il atteint ? Même question pour le bénéfice minimal.' : 'Donner le maximum et le minimum de $f$ sur $' + I + '$, et les valeurs de $x$ où ils sont atteints.');
        q.gabarit = 'maximum [] en $x=$ [] ; minimum [] en $x=$ []';
        q.attendus = [mx, C.xs[C.ys.indexOf(mx)], mn, C.xs[C.ys.indexOf(mn)]];
        q.explication = 'Point le plus haut : $(' + q.attendus[1] + '\\,;\\,' + mx + ')$ ; point le plus bas : $(' + q.attendus[3] + '\\,;\\,' + mn + ')$. Le maximum et le minimum sont des <b>ordonnées</b>.' + (sit ? ' Bénéfice maximal : $' + fr(mx * 1000) + '$ €.' : '');
        return q;
    };

    /* ---------- T1 · Suite arithmétique : terme général ---------- */
    AutoT.suiteArith = function (niveau, forme) {
        forme = forme || 2;
        var q = { niveau: niveau, objectif: 'Suites · Suite arithmétique, terme général' }, u0, r, n;
        var RAPPEL = 'Suite arithmétique de premier terme $u_0$ et de raison $r$ : on ajoute $r$ à chaque étape, et $u_n=u_0+n\\times r$.<br>' +
            'Exemple : $u_0=7$ et $r=-3$ : $u_n=7-3n$, donc $u_{10}=7-30=-23$.';
        function un(u0, r) { return 'u_n=' + (u0 ? u0 + (r < 0 ? '-' : '+') + (Math.abs(r) === 1 ? '' : fr(Math.abs(r))) + 'n' : poly([r, 0], 'n')); }
        if (forme === 1) {
            if (niveau === 1) {
                do { u0 = A.nonNul(-10, 20); r = A.nonNul(-6, 6); } while (u0 + r === 0 || Math.abs(u0) === 1);
                q.texte = '$u$ est la suite arithmétique de premier terme $u_0=' + u0 + '$ et de raison $r=' + r + '$. Pour tout entier naturel $n$ :';
                q.explication = '$u_n=u_0+n\\times r=' + u0 + '+n\\times' + par(r) + '$, soit $' + un(u0, r) + '$.';
                q.rappel = RAPPEL;
                return qcm(q, '$' + un(u0, r) + '$', ['$' + un(r, u0) + '$', '$u_n=' + u0 + '\\times' + par(r) + '^n$', '$' + un(0, u0 + r) + '$', '$u_n=' + (u0 + r) + '+n$']);
            }
            if (niveau === 2) {
                u0 = A.nonNul(-10, 20); r = A.nonNul(-6, 6);
                q.texte = 'La suite $u$ est définie pour tout entier naturel $n$ par $' + un(u0, r) + '$. C\'est une suite arithmétique :';
                q.explication = '$' + un(u0, r) + '$ est de la forme $u_0+n\\times r$ : premier terme $u_0=' + u0 + '$ et raison $r=' + r + '$ (le nombre devant $n$).';
                q.qcmLignes = true;
                return qcm(q, 'de raison $' + r + '$ et de premier terme $' + u0 + '$', ['de raison $' + u0 + '$ et de premier terme $' + r + '$', 'de raison $' + (-r) + '$ et de premier terme $' + u0 + '$', 'de raison $' + r + '$ et de premier terme $' + (u0 + r) + '$']);
            }
            u0 = A.entier(-5, 20); r = A.nonNul(-5, 6); n = A.choix([4, 5, 10]);
            q.texte = '$u$ est une suite arithmétique avec $u_0=' + u0 + '$ et $u_{' + n + '}=' + (u0 + n * r) + '$. Sa raison est :';
            q.explication = '$u_{' + n + '}=u_0+' + n + 'r$, donc $' + n + 'r=' + (u0 + n * r) + '-' + par(u0) + '=' + n * r + '$ et $r=' + frac(n * r, n) + '=' + r + '$.';
            return qcmValeurs(q, '$' + r + '$', r, [['$' + (n * r) + '$', n * r], ['$' + fr(arrondi((u0 + n * r) / n)) + '$', (u0 + n * r) / n], ['$' + (-r) + '$', -r], ['$' + fr(arrondi(n * r / (n + 1))) + '$', n * r / (n + 1)]]);
        }
        if (forme === 2) {
            if (niveau === 1) { q = AutoT.suiteTermeGeneral(1); q.objectif = 'Suites · Suite arithmétique, terme général'; return q; }
            if (niveau === 2) {
                u0 = A.entier(-10, 30); r = A.choix([0.5, 1.5, 2.5, -0.5, -1.5, 4, -3]); n = A.choix([10, 20, 40, 100]);
                q.type = 'nombre';
                q.texte = '$u$ est la suite arithmétique de premier terme $u_0=' + u0 + '$ et de raison $r=' + fr(r) + '$. Calculer $u_{' + n + '}$.';
                q.prefixe = 'u_{' + n + '}=';
                q.attendu = arrondi(u0 + n * r);
                q.correction = ['u_{' + n + '}&=u_0+' + n + '\\times r', '&=' + u0 + '+' + n + '\\times' + par(fr(r)), '&=' + u0 + terme(n * r), '&=' + fr(q.attendu)];
                return q;
            }
            var a = A.entier(1, 3), b = a + A.entier(3, 6);
            u0 = A.entier(-10, 20); r = A.nonNul(-6, 6);
            q.type = 'champs';
            q.texte = '$u$ est une suite arithmétique avec $u_{' + a + '}=' + (u0 + a * r) + '$ et $u_{' + b + '}=' + (u0 + b * r) + '$. Déterminer sa raison $r$ et son premier terme $u_0$.';
            q.gabarit = '$r=$ [] &nbsp; $u_0=$ []';
            q.attendus = [r, u0];
            q.explication = 'De $u_{' + a + '}$ à $u_{' + b + '}$, on ajoute $' + (b - a) + '$ fois la raison : $' + (b - a) + 'r=' + (u0 + b * r) + '-' + par(u0 + a * r) + '=' + (b - a) * r + '$, donc $r=' + r + '$.<br>' +
                'Puis $u_{' + a + '}=u_0+' + a + 'r$ : $u_0=' + (u0 + a * r) + '-' + a + '\\times' + par(r) + '=' + u0 + '$.';
            return q;
        }
        // forme 3 : en situation
        q.type = 'nombre';
        if (niveau === 1) {
            u0 = A.entier(10, 50) * 10; r = A.choix([20, 25, 30, 40, 50]); n = A.choix([6, 10, 12, 24]);
            q.texte = 'Une infirmière a $' + u0 + '$ € sur son livret et y ajoute $' + r + '$ € chaque mois. On note $u_n$ la somme sur le livret après $n$ mois ($u_0=' + u0 + '$). Quelle somme aura-t-elle après $' + n + '$ mois ?';
            q.prefixe = 'u_{' + n + '}=';
            q.attendu = u0 + n * r;
            q.explication = 'On ajoute $' + r + '$ chaque mois : suite arithmétique de raison $' + r + '$, $u_n=' + u0 + '+' + r + 'n$. Donc $u_{' + n + '}=' + u0 + '+' + r + '\\times' + n + '=' + q.attendu + '$ €.';
            q.rappel = RAPPEL;
            return q;
        }
        u0 = A.entier(30, 60) * 10; r = -A.choix([8, 10, 12, 15, 20]); n = A.choix([5, 8, 10]);
        var an = A.choix([2025, 2026]);
        if (niveau === 2) {
            q.texte = 'Un hôpital compte $' + u0 + '$ lits en ' + an + ' et en supprime $' + (-r) + '$ chaque année. On note $u_n$ le nombre de lits en ' + an + '$+n$. Combien de lits comptera-t-il en ' + (an + n) + ' ?';
            q.attendu = u0 + n * r;
            q.explication = 'Suite arithmétique de raison $' + r + '$ : $u_n=' + u0 + '-' + (-r) + 'n$. ' + (an + n) + ' correspond à $n=' + n + '$ : $u_{' + n + '}=' + u0 + '-' + (-r) + '\\times' + n + '=' + q.attendu + '$ lits.';
            return q;
        }
        var S = (u0 + 15 * r) - A.entier(1, 3) * 10 + A.choix([0, 5]);
        var nmin = Math.floor((u0 - S) / -r) + 1;
        q.texte = 'Un hôpital compte $' + u0 + '$ lits en ' + an + ' et en supprime $' + (-r) + '$ chaque année ($u_n$ : nombre de lits en ' + an + '$+n$). À partir de quelle année le nombre de lits sera-t-il strictement inférieur à $' + S + '$ ?';
        q.attendu = an + nmin;
        q.explication = '$u_n=' + u0 + '-' + (-r) + 'n<' + S + '$ équivaut à $' + (-r) + 'n>' + (u0 - S) + '$, soit $n>' + frac(u0 - S, -r) + (((u0 - S) % -r) ? '\\approx' + fr(Math.round((u0 - S) / -r * 10) / 10) : '=' + (u0 - S) / -r) + '$. Le premier entier qui convient est $n=' + nmin + '$ : en ' + (an + nmin) + ' ($u_{' + nmin + '}=' + (u0 + nmin * r) + '$).';
        return q;
    };

    /* ---------- C6 · Équations, inéquations du premier degré, x² = a ---------- */
    AutoT.equationsC6 = function (niveau, forme) {
        forme = forme || 2;
        var q = { niveau: niveau, objectif: 'Calcul · Équations, inéquations, x² = a' }, a, s;
        var RAPPEL = '$x^2=a$ : deux solutions $-\\sqrt{a}$ et $\\sqrt{a}$ si $a>0$ ; une seule, $0$, si $a=0$ ; aucune si $a<0$ (un carré n\'est jamais négatif).<br>' +
            'Inéquation : on résout comme une équation, mais on <b>change le sens</b> quand on multiplie ou divise par un nombre négatif.';
        if (forme === 1) {
            if (niveau === 1) {
                s = A.entier(2, 12); a = Math.random() < 0.15 ? -s * s : s * s;
                q.texte = 'Les solutions de l\'équation $x^2=' + a + '$ sont :';
                q.explication = a > 0 ? '$' + s + '^2=' + a + '$ et $(-' + s + ')^2=' + a + '$ : deux solutions, $-' + s + '$ et $' + s + '$.' : 'Un carré est toujours positif ou nul : $x^2=' + a + '$ n\'a <b>aucune</b> solution.';
                q.rappel = RAPPEL;
                var bonne = a > 0 ? '$-' + s + '$ et $' + s + '$' : 'il n\'y en a pas';
                return qcm(q, bonne, [a > 0 ? '$' + s + '$ seulement' : '$-' + s + '$ et $' + s + '$', '$' + fr(Math.abs(a) / 2) + '$' + (a > 0 ? ' et $-' + fr(a / 2) + '$' : ''), '$-' + Math.abs(a) + '$ et $' + Math.abs(a) + '$', a > 0 ? 'il n\'y en a pas' : '$-' + s + '$ seulement']);
            }
            q = AutoT.inequation(niveau); q.objectif = 'Calcul · Inéquation du premier degré';
            return q;
        }
        if (forme === 2) {
            if (niveau === 1) { q = AutoT.equation(1); q.objectif = 'Calcul · Équation du premier degré'; return q; }
            if (niveau === 2) {
                s = A.choix([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 0.5, 0.3, 1.2]); var k = A.choix([1, 1, 2, 3]), c = A.entier(0, 9);
                a = arrondi(k * s * s + c);
                q.type = 'champs';
                q.texte = 'Résoudre l\'équation $' + (k === 1 ? '' : k) + 'x^2' + (c ? '+' + c : '') + '=' + fr(a) + '$.';
                q.gabarit = 'solution négative : [] &nbsp; solution positive : []';
                q.attendus = [-s, s];
                q.explication = (c || k > 1 ? '$' + (k === 1 ? '' : k) + 'x^2=' + fr(arrondi(a - c)) + '$' + (k > 1 ? ', $x^2=' + fr(arrondi(s * s)) + '$' : '') + ', ' : '') + 'donc $x=-' + fr(s) + '$ ou $x=' + fr(s) + '$ (car $' + fr(s) + '^2=' + fr(arrondi(s * s)) + '$).';
                return q;
            }
            do { q = AutoT.equation(3); } while (q.correction[q.correction.length - 1] === q.correction[q.correction.length - 2]);
            q.objectif = 'Calcul · Équation du premier degré'; return q;
        }
        // forme 3 : en situation
        var pc = A.choix([15, 20, 25, 30]), km = A.choix([1.5, 2, 2.5, 1.2]), x;
        do { x = A.entier(2, 12) * 5; } while ((km * x) % 1);
        var tot = pc + km * x;
        if (niveau === 1) {
            q.type = 'nombre';
            q.texte = 'Un transport médical coûte $' + pc + '$ € de prise en charge, plus $' + fr(km) + '$ € par kilomètre. Un trajet a coûté $' + fr(tot) + '$ €. Quelle était sa longueur (en km) ?';
            q.prefixe = 'x=';
            q.attendu = x;
            q.explication = 'On résout $' + pc + '+' + fr(km) + 'x=' + fr(tot) + '$ : $' + fr(km) + 'x=' + fr(tot - pc) + '$, donc $x=' + frac(fr(tot - pc), fr(km)) + '=' + x + '$ km.';
            q.rappel = 'On traduit l\'énoncé par une équation, puis on isole $x$ : on enlève d\'abord la partie fixe, puis on divise par le prix au kilomètre.';
            return q;
        }
        if (niveau === 2) {
            q.texte = 'Un transport médical coûte $' + pc + '$ € de prise en charge, plus $' + fr(km) + '$ € par kilomètre. Le budget est de $' + fr(tot) + '$ € au maximum. Quelle distance $x$ (en km) peut-on parcourir ?';
            q.qcmLignes = true;
            q.explication = '$' + pc + '+' + fr(km) + 'x\\leqslant' + fr(tot) + '$ ; $' + fr(km) + 'x\\leqslant' + fr(tot - pc) + '$ ; $x\\leqslant' + frac(fr(tot - pc), fr(km)) + '=' + x + '$ : au plus $' + x + '$ km.';
            return qcm(q, 'au plus $' + x + '$ km', ['au moins $' + x + '$ km', 'au plus $' + fr(arrondi(tot / km)) + '$ km', 'au plus $' + fr(arrondi((tot - pc) * km)) + '$ km']);
        }
        var t = A.entier(2, 6);
        q.type = 'nombre';
        q.texte = 'Un objet lâché sans vitesse parcourt $d=5t^2$ mètres en $t$ secondes. Combien de temps (en s) met-il pour tomber de $' + 5 * t * t + '$ m ?';
        q.prefixe = 't=';
        q.attendu = t;
        q.explication = '$5t^2=' + 5 * t * t + '$, donc $t^2=' + t * t + '$, donc $t=' + t + '$ ou $t=-' + t + '$. Une durée est positive : $t=' + t + '$ s.';
        return q;
    };

    /* ---------- E5 · Évolutions successives ---------- */
    AutoT.evolSucc = function (niveau, forme) {
        forme = forme || 2;
        var q = { niveau: niveau, objectif: 'Évolutions · Évolutions successives' }, t1, t2, t3, cg;
        var RAPPEL = 'Pour des évolutions successives, on <b>multiplie</b> les coefficients multiplicateurs : $CM_g=CM_1\\times CM_2$ (on n\'additionne pas les pourcentages).<br>' +
            'Puis $p=(CM_g-1)\\times100$. Exemple : $+20\\,\\%$ puis $-20\\,\\%$ : $CM_g=1{,}2\\times0{,}8=0{,}96$ et $p=(0{,}96-1)\\times100=-4$ : baisse de $4\\,\\%$.';
        function cm(t) { return arrondi(1 + t / 100); }
        function txt(t) { return (t > 0 ? 'augmente' : 'baisse') + ' de $' + pct(Math.abs(t)) + '$'; }
        function cmTex(t) { return 'CM=1' + (t > 0 ? '+' : '-') + frac(Math.abs(t), 100) + '=' + fr(cm(t)); }
        function tirage(liste) { do { t1 = A.choix(liste) * A.signe(); t2 = A.choix(liste) * A.signe(); cg = arrondi(cm(t1) * cm(t2)); } while (cg === 1 || String(cg).length > 5); }
        function bilan(cg) { var p = arrondi((cg - 1) * 100); return '$p=(' + fr(cg) + '-1)\\times100=' + fr(p) + '$ : ' + (p > 0 ? 'hausse' : 'baisse') + ' de $' + pct(Math.abs(p)) + '$'; }
        function ev(p) { return p === 0 ? 'n\'a pas changé' : 'a ' + (p > 0 ? 'augmenté' : 'baissé') + ' de $' + pct(Math.abs(p)) + '$'; }
        if (forme === 1) {
            if (niveau === 1) { t1 = A.choix([10, 20, 30, 50]); t2 = -t1; if (Math.random() < 0.5) { t2 = t1; t1 = -t1; } cg = arrondi(cm(t1) * cm(t2)); }
            else if (niveau === 2) tirage([10, 20, 25, 30, 40, 50]);
            else { t1 = A.choix([10, 20, 30, 50, -10, -20, -50]); t2 = t1; cg = arrondi(cm(t1) * cm(t2)); }
            var p = arrondi((cg - 1) * 100);
            q.texte = 'Le prix d\'un appareil ' + txt(t1) + ', puis ' + txt(t2) + '. Au total, le prix :';
            q.explication = '$CM_g=' + fr(cm(t1)) + '\\times' + fr(cm(t2)) + '=' + fr(cg) + '$ et ' + bilan(cg) + ' (et non $' + pct(Math.abs(t1 + t2)) + '$).';
            if (niveau === 1) q.rappel = RAPPEL;
            return qcm(q, ev(p), [ev(t1 + t2), ev(-p), ev(arrondi(cg * 100)), ev(p > 0 ? p + 1 : p - 1)]);
        }
        q.type = 'champs';
        q.gabarit = 'taux global : [] $\\,\\%$ <i>(négatif pour une baisse)</i>';
        if (forme === 2) {
            if (niveau === 1) tirage([10, 20, 30, 50]);
            else if (niveau === 2) tirage([5, 15, 25, 40, 60, 12]);
            if (niveau < 3) {
                q.texte = 'Une valeur ' + txt(t1) + ', puis ' + txt(t2) + '. Calculer le taux d\'évolution global.';
                q.attendus = [arrondi((cg - 1) * 100)];
                q.explication = '$CM_1=' + fr(cm(t1)) + '$ et $CM_2=' + fr(cm(t2)) + '$, donc $CM_g=' + fr(cm(t1)) + '\\times' + fr(cm(t2)) + '=' + fr(cg) + '$.<br>' + bilan(cg) + '.';
                if (niveau === 1) q.rappel = RAPPEL;
                return q;
            }
            do { t1 = A.choix([10, 20, 50]) * A.signe(); t2 = A.choix([10, 20, 50]) * A.signe(); t3 = A.choix([10, 20, 50]) * A.signe(); cg = arrondi(cm(t1) * cm(t2) * cm(t3)); } while (cg === 1 || String(cg).length > 6);
            q.texte = 'Une valeur ' + txt(t1) + ', puis ' + txt(t2) + ', puis ' + txt(t3) + '. Calculer le taux d\'évolution global.';
            q.attendus = [arrondi((cg - 1) * 100)];
            q.explication = '$CM_g=' + fr(cm(t1)) + '\\times' + fr(cm(t2)) + '\\times' + fr(cm(t3)) + '=' + fr(cg) + '$.<br>' + bilan(cg) + '.';
            return q;
        }
        // forme 3 : en situation
        if (niveau === 1) {
            var V;
            do { tirage([10, 20, 25, 50]); V = A.entier(2, 30) * 40; } while ((V * cg) % 1);
            q.type = 'nombre'; delete q.gabarit;
            q.texte = 'Une semaine, il y avait $' + fr(V) + '$ cas d\'une maladie dans une région. Le nombre de cas ' + txt(t1) + ' la semaine suivante, puis ' + txt(t2) + ' la semaine d\'après. Combien y a-t-il de cas à la fin ?';
            q.attendu = arrondi(V * cg);
            q.explication = '$' + fr(V) + '\\times' + fr(cm(t1)) + '=' + fr(arrondi(V * cm(t1))) + '$, puis $' + fr(arrondi(V * cm(t1))) + '\\times' + fr(cm(t2)) + '=' + fr(q.attendu) + '$ cas.';
            q.rappel = RAPPEL;
            return q;
        }
        if (niveau === 2) tirage([10, 20, 25, 30, 50]);
        else { var R = A.choix([[10, 10], [20, 20], [5, 5], [-10, -10], [-20, -20], [50, 50]]); t1 = R[0]; t2 = R[1]; cg = arrondi(cm(t1) * cm(t2)); }
        var S = A.choix([['Le nombre d\'adhérents d\'une association', 'en 2025', 'en 2026'], ['Le tarif d\'une mutuelle', 'en 2025', 'en 2026'], ['Le nombre de patients d\'un cabinet', 'en janvier', 'en février']]);
        q.texte = S[0] + ' ' + txt(t1) + ' ' + S[1] + ', puis ' + txt(t2) + ' ' + S[2] + '. Quel est le taux d\'évolution global sur ces deux périodes ?';
        q.attendus = [arrondi((cg - 1) * 100)];
        q.explication = '$CM_g=' + fr(cm(t1)) + '\\times' + fr(cm(t2)) + '=' + fr(cg) + '$ et ' + bilan(cg) + (t1 === t2 ? ' (et non $' + pct(Math.abs(2 * t1)) + '$).' : '.');
        return q;
    };

    /* ---------- F2 · Résoudre graphiquement f(x) = k, f(x) < k ---------- */
    AutoT.resolGraph = function (niveau, forme) {
        forme = forme || 2;
        if (forme === 1) return AutoT.resolutionGraphique(niveau);
        var q = { niveau: niveau, objectif: 'Fonctions · Résoudre graphiquement' }, C, k, ks, S;
        var RAPPEL = 'Résoudre $f(x)=k$ : on trace la droite horizontale $y=k$ et on lit les <b>abscisses</b> des points d\'intersection avec la courbe.<br>' +
            '$f(x)<k$ : abscisses des points de la courbe situés <b>en dessous</b> de cette droite ; $f(x)>k$ : au-dessus.';
        var sit = forme === 3;
        for (;;) {
            C = sit ? courbeSituation() : courbeAleatoire();
            if (sit) { var lo = Math.min.apply(null, C.ys); C.ys = C.ys.map(function (y) { return y - lo; }); C.points = C.points.map(function (P) { return [P[0], P[1] - lo]; }); }
            ks = [];
            for (k = -3; k <= 8; k++) {
                var ant = antecedents(C, k);
                if (niveau === 1 && ant.length === 2) ks.push(k);
                if (niveau === 2 && niveauxPropres(C).indexOf(k) >= 0) {
                    S = resoudre(C, k, sit ? '>=' : '<');
                    if (S.length === 1 && !(sit ? false : S[0].ga || S[0].db)) ks.push(k);
                }
                if (niveau === 3 && niveauxPropres(C).indexOf(k) >= 0 && resoudre(C, k, '>=').length === (sit ? 2 : 1)) ks.push(k);
            }
            if (sit) ks = ks.filter(function (k) { return k > 0; });
            if (ks.length) break;
        }
        k = A.choix(ks);
        if (sit) { q.figure = figureSituation(C, '𝒞', true); }
        else q.figure = figureCourbe(C);
        q.figureNote = noteCourbe(C);
        var I = '[' + C.xmin + '\\,;\\,' + C.xmax + ']';
        var intro = sit ? 'La courbe donne la concentration $C(t)$ d\'un médicament dans le sang (en mg/L), $t$ heures après la prise, pour $t\\in' + I + '$. '
                        : 'On considère la fonction $f$ définie sur $' + I + '$ et représentée ci-dessous. ';
        q.type = 'champs';
        if (niveau === 1) {
            S = antecedents(C, k);
            q.texte = intro + (sit ? 'À quels instants la concentration vaut-elle $' + k + '$ mg/L ?' : 'Résoudre graphiquement l\'équation $f(x)=' + k + '$.');
            q.gabarit = (sit ? '$t=$ [] h et $t=$ [] h' : '$x=$ [] ou $x=$ []') + ' <i>(la plus petite d\'abord)</i>';
            q.attendus = S;
            q.explication = 'La droite horizontale $y=' + k + '$ coupe la courbe en deux points, d\'abscisses $' + S[0] + '$ et $' + S[1] + '$' + (sit ? ' : la concentration vaut $' + k + '$ mg/L au bout de $' + S[0] + '$ h et de $' + S[1] + '$ h.' : ' : $S=\\{' + S[0] + '\\,;\\,' + S[1] + '\\}$.');
            q.rappel = RAPPEL;
            return q;
        }
        if (!sit) {
            if (niveau === 2) {
                S = resoudre(C, k, '<');
                q.texte = intro + 'Résoudre graphiquement l\'inéquation $f(x)<' + k + '$.';
                q.gabarit = '$S=\\,]$ [] ; [] $[$';
                q.attendus = [S[0].a, S[0].b];
                q.explication = 'La courbe est strictement en dessous de la droite $y=' + k + '$ entre les abscisses $' + S[0].a + '$ et $' + S[0].b + '$ (exclues) : $S=]' + S[0].a + '\\,;\\,' + S[0].b + '[$.';
                return q;
            }
            S = resoudre(C, k, '>=');
            q.texte = intro + 'Résoudre graphiquement l\'inéquation $f(x)\\geqslant' + k + '$.';
            q.gabarit = '$S=[$ [] ; [] $]$';
            q.attendus = [S[0].a, S[0].b];
            q.explication = 'La courbe est au-dessus de la droite $y=' + k + '$ (ou dessus) pour $x$ entre $' + S[0].a + '$ et $' + S[0].b + '$ inclus : $S=[' + S[0].a + '\\,;\\,' + S[0].b + ']$.';
            return q;
        }
        S = resoudre(C, k, '>=');
        q.type = 'nombre';
        q.texte = intro + 'Le médicament est efficace lorsque la concentration est supérieure ou égale à $' + k + '$ mg/L. Pendant combien d\'heures est-il efficace ?';
        q.attendu = S.reduce(function (s, I) { return s + I.b - I.a; }, 0);
        q.explication = '$C(t)\\geqslant' + k + '$ pour $t\\in' + texIntervalles(S).replace(/\$/g, '') + '$ : le médicament est efficace pendant $' + S.map(function (I) { return I.b + '-' + I.a; }).join('+') + '=' + q.attendu + '$ h.';
        return q;
    };

    /* ---------- T2 · Suite géométrique : terme général ---------- */
    AutoT.suiteGeo = function (niveau, forme) {
        forme = forme || 2;
        var q = { niveau: niveau, objectif: 'Suites · Suite géométrique, terme général' }, v0, r, n, g;
        var RAPPEL = 'Suite géométrique de premier terme $v_0$ et de raison $q$ : on multiplie par $q$ à chaque étape, et $v_n=v_0\\times q^n$.<br>' +
            'Exemple : $v_0=5$ et $q=2$ : $v_n=5\\times2^n$, donc $v_3=5\\times8=40$.';
        var G = [[2, [1, 3, 5, 10, 25]], [3, [1, 2, 4, 5]], [0.5, [64, 160, 800, 2000]], [10, [2, 3, 5]], [1.1, [1000, 100]], [0.2, [500, 1000]]];
        if (forme === 1) {
            if (niveau === 1) {
                v0 = A.choix([2, 3, 5, 10, 100]); r = A.choix([2, 3, 4, 0.5, 1.2]);
                q.texte = '$v$ est la suite géométrique de premier terme $v_0=' + v0 + '$ et de raison $q=' + fr(r) + '$. Pour tout entier naturel $n$ :';
                q.explication = '$v_n=v_0\\times q^n=' + v0 + '\\times' + fr(r) + '^n$.';
                q.rappel = RAPPEL;
                return qcm(q, '$v_n=' + v0 + '\\times' + fr(r) + '^n$', ['$v_n=' + fr(r) + '\\times' + v0 + '^n$', '$v_n=' + v0 + '+' + fr(r) + 'n$', '$v_n=' + fr(arrondi(v0 * r)) + '^n$', '$v_n=' + v0 + '\\times' + fr(r) + 'n$']);
            }
            if (niveau === 2) {
                v0 = A.choix([2, 3, 4, 5, 10]); r = A.choix([2, 3, 4, 5]);
                q.texte = '$v$ est une suite géométrique avec $v_0=' + v0 + '$ et $v_1=' + v0 * r + '$. Sa raison est :';
                q.explication = 'On passe d\'un terme au suivant en multipliant par $q$ : $q=' + frac('v_1', 'v_0') + '=' + frac(v0 * r, v0) + '=' + r + '$.';
                return qcmValeurs(q, '$' + r + '$', r, [['$' + (v0 * r - v0) + '$', v0 * r - v0], ['$' + texF([1, r]) + '$', 1 / r], ['$' + (v0 * r) + '$', v0 * r], ['$' + v0 + '$', v0]]);
            }
            q = AutoT.suiteTermeGeneral(3); q.objectif = 'Suites · Reconnaître une suite géométrique'; return q;
        }
        q.type = 'nombre';
        if (forme === 2) {
            if (niveau === 1) {
                v0 = A.choix([1, 2, 3, 5, 10]); r = A.choix([2, 3]); n = r === 2 ? A.choix([3, 4, 5]) : A.choix([2, 3, 4]);
                q.texte = '$v$ est la suite géométrique de premier terme $v_0=' + v0 + '$ et de raison $q=' + r + '$. Calculer $v_' + n + '$.';
                q.prefixe = 'v_' + n + '=';
                q.attendu = v0 * Math.pow(r, n);
                q.correction = ['v_' + n + '&=v_0\\times q^' + n, '&=' + v0 + '\\times' + r + '^' + n, '&=' + v0 + '\\times' + Math.pow(r, n), '&=' + q.attendu];
                q.rappel = RAPPEL;
                return q;
            }
            if (niveau === 2) { q = AutoT.suiteTermeGeneral(2); q.objectif = 'Suites · Suite géométrique, terme général'; return q; }
            g = A.choix([[2, [3, 5, 10, 25]], [3, [2, 4, 5]], [0.5, [800, 2000, 64]], [10, [2, 3, 7]]]); v0 = A.choix(g[1]); r = g[0]; n = 3;
            var vn = arrondi(v0 * Math.pow(r, n));
            q.texte = '$v$ est une suite géométrique de raison $q=' + fr(r) + '$ telle que $v_' + n + '=' + fr(vn) + '$. Calculer $v_0$.';
            q.prefixe = 'v_0=';
            q.attendu = v0;
            q.correction = ['v_3&=v_0\\times q^3', fr(vn) + '&=v_0\\times' + fr(arrondi(Math.pow(r, 3))), 'v_0&=' + frac(fr(vn), fr(arrondi(Math.pow(r, 3)))) + '=' + fr(v0)];
            return q;
        }
        // forme 3 : en situation
        if (niveau === 1) {
            v0 = A.choix([100, 200, 250, 500, 1000]); n = A.choix([3, 4, 5]);
            q.texte = 'Une culture compte $' + v0 + '$ bactéries et leur nombre double toutes les heures. On note $v_n$ le nombre de bactéries après $n$ heures. Combien y en a-t-il après $' + n + '$ heures ?';
            q.prefixe = 'v_' + n + '=';
            q.attendu = v0 * Math.pow(2, n);
            q.explication = 'On multiplie par $2$ chaque heure : suite géométrique de raison $2$, $v_n=' + v0 + '\\times2^n$. Donc $v_' + n + '=' + v0 + '\\times' + Math.pow(2, n) + '=' + fr(q.attendu) + '$ bactéries.';
            q.rappel = RAPPEL;
            return q;
        }
        if (niveau === 2) {
            v0 = A.choix([80, 160, 200, 320, 400, 800]); n = A.choix([2, 3, 4]);
            if (v0 % Math.pow(2, n)) n = 2;
            q.texte = 'La concentration d\'un médicament dans le sang est de $' + v0 + '$ mg/L ; elle diminue de moitié toutes les $4$ heures. On note $v_n$ la concentration après $n$ périodes de $4$ heures. Quelle est la concentration au bout de $' + 4 * n + '$ heures ?';
            q.attendu = arrondi(v0 * Math.pow(0.5, n));
            q.explication = 'Diminuer de moitié, c\'est multiplier par $0{,}5$ : $v_n=' + v0 + '\\times0{,}5^n$. ' + 4 * n + ' heures font $n=' + n + '$ périodes : $v_' + n + '=' + v0 + '\\times' + fr(Math.pow(0.5, n)) + '=' + fr(q.attendu) + '$ mg/L.';
            return q;
        }
        var t = A.choix([10, 20]); v0 = A.choix([1000, 2000, 500, 5000]); n = t === 10 ? A.choix([2, 3]) : 2;
        q.texte = 'Une association compte $' + fr(v0) + '$ adhérents ; ce nombre augmente de $' + pct(t) + '$ chaque année. On note $v_n$ le nombre d\'adhérents après $n$ années. Combien y en aura-t-il après $' + n + '$ ans ?';
        q.attendu = arrondi(v0 * Math.pow(1 + t / 100, n));
        q.explication = 'Augmenter de $' + pct(t) + '$, c\'est multiplier par $' + fr(1 + t / 100) + '$ : $v_n=' + fr(v0) + '\\times' + fr(1 + t / 100) + '^n$. Donc $v_' + n + '=' + fr(v0) + '\\times' + fr(arrondi(Math.pow(1 + t / 100, n))) + '=' + fr(q.attendu) + '$ adhérents.';
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
