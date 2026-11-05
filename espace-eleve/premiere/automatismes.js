/* Générateurs d'automatismes (Première, enseignement scientifique — 1TC) : AutoP[nom](niveau) -> question pour Interactif.exercice.
   Niveau 1 = question verte (avec rappel de méthode à la demande), 2 = bleue, 3 = rouge.
   Thèmes : liste « Automatismes » du programme de mathématiques intégré à l'enseignement scientifique de première
   (+ automatismes de seconde à entretenir) ; voir le planning dans 1TC 2026-2027/Automatismes/Planning automatismes.md.
   Notation des suites en 1TC : u(n), pas u_n. Coefficient multiplicateur : CM = 1 + t/100 (pas de taux décimal T). */
(function () {
    'use strict';
    var A = Interactif.alea;

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

    /* Fractions exactes : {n, d} avec d > 0, irréductible */
    function R(n, d) { d = d || 1; var g = pgcd(n, d) || 1; n /= g; d /= g; if (d < 0) { n = -n; d = -d; } return { n: n, d: d }; }
    function plus(a, b) { return R(a.n * b.d + b.n * a.d, a.d * b.d); }
    function moins(a, b) { return R(a.n * b.d - b.n * a.d, a.d * b.d); }
    function fois(a, b) { return R(a.n * b.n, a.d * b.d); }
    function divise(a, b) { return R(a.n * b.d, a.d * b.n); }
    function texR(a) { return a.d === 1 ? String(a.n) : (a.n < 0 ? '-' : '') + frac(Math.abs(a.n), a.d); }
    function val(a) { return a.n / a.d; }

    var AutoP = {};

    /* ===================================================================
       PROPORTIONS ET POURCENTAGES
       =================================================================== */
    AutoP.proportions = function (niveau) {
        var q = { niveau: niveau, objectif: 'Proportions · Proportionnalité, calculer une proportion' };
        if (niveau === 1) {
            // quatrième proportionnelle (passage à l'unité)
            var C = A.choix([['kg de pommes', 'kg'], ['litres de jus de fruits', 'litres'], ['mètres de tissu', 'mètres'], ['kg de tomates', 'kg'], ['cahiers', 'cahiers']]);
            var u = A.choix([0.8, 1.2, 1.5, 1.6, 2.5, 3, 3.5, 4.5]), a = A.choix([2, 4, 5, 10]), b;
            do { b = A.choix([3, 6, 7, 8, 12, 15]); } while (b === a);
            var pa = arrondi(a * u), pb = arrondi(b * u);
            q.type = 'champs';
            q.texte = '$' + a + '$ ' + C[0] + ' coûtent $' + fr(pa) + '$ €. Combien coûtent $' + b + '$ ' + C[0] + ' (au même prix unitaire) ?';
            q.gabarit = '[] €';
            q.attendus = [pb];
            q.explication = 'Passage à l\'unité : $1$ ' + C[1].replace(/s$/, '') + ' coûte $' + fr(pa) + '\\div' + a + '=' + fr(u) + '$ €, donc $' + b + '$ ' + C[1] + ' coûtent $' + b + '\\times' + fr(u) + '=' + fr(pb) + '$ €.' +
                '<br>Ou par produit en croix : $' + frac(fr(pa) + '\\times' + b, a) + '=' + fr(pb) + '$.';
            q.rappel = 'Les prix sont <b>proportionnels</b> aux quantités. Deux méthodes :<br>' +
                '• <b>passage à l\'unité</b> : on calcule le prix pour $1$, puis on multiplie par la quantité voulue ;<br>' +
                '• <b>produit en croix</b> : dans le tableau $\\begin{array}{|c|c|}\\hline 2 & 3\\\\\\hline 7 & ?\\\\\\hline\\end{array}$, $? = ' + frac('7\\times3', 2) + '=10{,}5$.';
            return q;
        }
        if (niveau === 2) {
            var S = A.choix([
                ['Dans un lycée de', 'élèves,', 'sont internes', 'd\'internes'],
                ['Dans un club de', 'adhérents,', 'pratiquent la compétition', 'd\'adhérents qui pratiquent la compétition'],
                ['Dans un groupe de', 'enfants,', 'sont musiciens', 'de musiciens'],
                ['Sur', 'personnes interrogées,', 'ont répondu « oui »', 'de « oui »']
            ]);
            var N, p, n;
            do { N = A.choix([20, 25, 40, 50, 60, 80, 120, 200, 250, 400, 500]); p = A.entier(1, 19) * 5; n = p * N / 100; } while (n % 1 || p === 50);
            q.type = 'champs';
            q.texte = S[0] + ' $' + fr(N) + '$ ' + S[1] + ' $' + fr(n) + '$ ' + S[2] + '. Quel est le pourcentage ' + S[3] + ' ?';
            q.gabarit = '[] $\\,\\%$';
            q.attendus = [p];
            q.explication = 'Proportion $=' + frac('\\text{effectif de la partie}', '\\text{effectif total}') + '=' + frac(fr(n), fr(N)) + '=' + fr(p / 100) + '$, soit $' + pct(p) + '$.';
            return q;
        }
        // deux étapes : retrouver l'effectif total, puis en prendre un pourcentage
        var T, p1, p2, n1, n2;
        do {
            T = A.entier(2, 30) * 20; p1 = A.choix([20, 25, 40, 50, 60, 75, 80]); p2 = A.choix([5, 10, 15, 20, 25, 30]);
            n1 = p1 * T / 100; n2 = p2 * T / 100;
        } while (n1 % 1 || n2 % 1 || p1 === p2);
        var S3 = A.choix([
            ['Dans un collège,', 'enseignants viennent en bus', 'des enseignants', 'viennent en métro', 'Combien d\'enseignants viennent en métro ?'],
            ['Dans une entreprise,', 'salariés travaillent à temps partiel', 'des salariés', 'sont en télétravail', 'Combien de salariés sont en télétravail ?'],
            ['Dans un lycée,', 'élèves sont demi-pensionnaires', 'des élèves', 'sont internes', 'Combien d\'élèves sont internes ?']
        ]);
        q.type = 'nombre';
        q.texte = S3[0] + ' $' + fr(n1) + '$ ' + S3[1] + ', ce qui représente $' + pct(p1) + '$ du total ' + S3[2] + '. Par ailleurs, $' + pct(p2) + '$ ' + S3[2] + ' ' + S3[3] + '. ' + S3[4];
        q.attendu = n2;
        q.explication = 'On retrouve d\'abord l\'effectif total $N$ : $' + fr(p1 / 100) + '\\times N=' + fr(n1) + '$, donc $N=' + frac(fr(n1), fr(p1 / 100)) + '=' + fr(T) + '$.' +
            '<br>Puis $' + pct(p2) + '$ de $' + fr(T) + '$ : $' + fr(p2 / 100) + '\\times' + fr(T) + '=' + fr(n2) + '$.';
        return q;
    };

    /* ===================================================================
       ÉVOLUTIONS
       =================================================================== */
    AutoP.appliquerTaux = function (niveau) {
        var q = { niveau: niveau, objectif: 'Évolutions · Appliquer un taux d\'évolution' };
        if (niveau === 1) {
            var t = A.choix([A.entier(2, 9), A.entier(11, 45), A.choix([50, 60, 75, 90])]), hausse = Math.random() < 0.5;
            if (!hausse && t > 90) t = 30;
            var cm = arrondi(1 + (hausse ? t : -t) / 100);
            q.texte = (hausse ? 'Augmenter' : 'Diminuer') + ' une valeur de $' + pct(t) + '$ revient à la multiplier par :';
            q.explication = '$CM=1' + (hausse ? '+' : '-') + frac(t, 100) + '=1' + (hausse ? '+' : '-') + fr(t / 100) + '=' + fr(cm) + '$.';
            q.rappel = 'Augmenter de $t\\,\\%$, c\'est multiplier par le coefficient multiplicateur $CM=1+' + frac('t', 100) + '$ ;<br>' +
                'diminuer de $t\\,\\%$, c\'est multiplier par $CM=1-' + frac('t', 100) + '$.<br>' +
                'Exemples : hausse de $8\\,\\%$ : $CM=1+' + frac(8, 100) + '=1{,}08$ ; baisse de $8\\,\\%$ : $CM=1-' + frac(8, 100) + '=0{,}92$.';
            return qcm(q, '$' + fr(cm) + '$', [
                '$' + fr(arrondi(1 - (hausse ? t : -t) / 100)) + '$',
                '$' + fr(t / 100) + '$',
                t < 10 ? '$' + fr(arrondi(1 + (hausse ? t : -t) / 10)) + '$' : '$' + fr(t) + '$',
                '$' + fr(arrondi((hausse ? 1 : -1) * t / 100)) + '$'
            ]);
        }
        if (niveau === 2) {
            var V, t2, h2, Vf;
            do {
                V = A.entier(2, 30) * 10; t2 = A.choix([5, 8, 10, 12, 15, 20, 25, 30, 40]); h2 = Math.random() < 0.5;
                Vf = arrondi(V * (1 + (h2 ? t2 : -t2) / 100));
            } while (Math.round(Vf * 100) !== Vf * 100);
            var cm2 = arrondi(1 + (h2 ? t2 : -t2) / 100);
            var objet = A.choix(['Un vélo coûte', 'Un abonnement coûte', 'Une console coûte', 'Un manteau coûte']);
            q.type = 'champs';
            q.texte = objet + ' $' + fr(V) + '$ €. Son prix ' + (h2 ? 'augmente' : 'baisse') + ' de $' + pct(t2) + '$. Quel est son nouveau prix ?';
            q.gabarit = '[] €';
            q.attendus = [Vf];
            q.explication = '$CM=1' + (h2 ? '+' : '-') + frac(t2, 100) + '=' + fr(cm2) + '$, donc le nouveau prix est $' + fr(V) + '\\times' + fr(cm2) + '=' + fr(Vf) + '$ €.';
            return q;
        }
        // valeur initiale
        var c3 = A.choix([[25, 1.25], [20, 1.2], [-20, 0.8], [-25, 0.75], [50, 1.5], [-10, 0.9], [10, 1.1], [-40, 0.6], [-60, 0.4], [-50, 0.5]]);
        var Vi = A.entier(2, 20) * 20, Vf3 = arrondi(Vi * c3[1]);
        var ctx = A.choix([['un loyer', 'le loyer', 'est de'], ['un article', 'le prix de l\'article', 'est de'], ['une facture', 'le montant de la facture', 'est de']]);
        q.type = 'champs';
        q.texte = 'Après ' + (c3[0] > 0 ? 'une hausse' : 'une baisse') + ' de $' + pct(Math.abs(c3[0])) + '$, ' + ctx[1] + ' ' + ctx[2] + ' $' + fr(Vf3) + '$ €. Quel était ' + ctx[1] + ' avant ' + (c3[0] > 0 ? 'la hausse' : 'la baisse') + ' ?';
        q.gabarit = '[] €';
        q.attendus = [Vi];
        q.explication = '$CM=1' + (c3[0] > 0 ? '+' : '-') + frac(Math.abs(c3[0]), 100) + '=' + fr(c3[1]) + '$. On a $V_{\\text{initiale}}\\times' + fr(c3[1]) + '=' + fr(Vf3) + '$, donc $V_{\\text{initiale}}=' + frac(fr(Vf3), fr(c3[1])) + '=' + fr(Vi) + '$ €.' +
            '<br><i>Attention : ce n\'est pas $' + fr(Vf3) + (c3[0] > 0 ? '-' : '+') + pct(Math.abs(c3[0])) + '$ du nouveau prix ; on divise par le coefficient multiplicateur.</i>';
        return q;
    };

    /* ===================================================================
       NOMBRES ET CALCULS
       =================================================================== */
    AutoP.fractions = function (niveau) {
        var q = { niveau: niveau, objectif: 'Fractions · Calculer avec des fractions' }, a, b, c, d, k, r;
        if (niveau === 1) {
            // a/b ± c/(kb)
            do { b = A.entier(2, 7); k = A.entier(2, 4); a = A.entier(1, 2 * b); c = A.entier(1, 3 * b); } while (pgcd(a, b) !== 1 || pgcd(c, k * b) !== 1);
            var signe = Math.random() < 0.7 ? '+' : '-';
            var F1 = R(a, b), F2 = R(c, k * b);
            r = signe === '+' ? plus(F1, F2) : moins(F1, F2);
            q.texte = '$' + frac(a, b) + signe + frac(c, k * b) + '$ est égal à :';
            q.explication = 'On met au même dénominateur $' + (k * b) + '$ : $' + frac(a, b) + '=' + frac(a + '\\times' + k, b + '\\times' + k) + '=' + frac(a * k, k * b) + '$.<br>' +
                'Donc $' + frac(a, b) + signe + frac(c, k * b) + '=' + frac(a * k, k * b) + signe + frac(c, k * b) + '=' + frac(signe === '+' ? a * k + c : a * k - c, k * b) +
                (r.d !== k * b ? '=' + texR(r) : '') + '$.';
            q.rappel = 'Pour additionner (ou soustraire) deux fractions, on les écrit avec le <b>même dénominateur</b>, puis on additionne les numérateurs (on garde le dénominateur).<br>' +
                'Exemple : $' + frac(1, 3) + '+' + frac(5, 6) + '=' + frac(2, 6) + '+' + frac(5, 6) + '=' + frac(7, 6) + '$. On n\'additionne <b>jamais</b> les dénominateurs !';
            var faux1 = R(signe === '+' ? a + c : a - c, b + k * b), faux2 = R(signe === '+' ? a + c : a - c, k * b);
            return qcm(q, '$' + texR(r) + '$', ['$' + texR(faux1) + '$', '$' + texR(faux2) + '$', '$' + texR(R(signe === '+' ? a * c : Math.abs(a * k - c) + 1, k * b)) + '$', '$' + texR(R(a * k + (signe === '+' ? -c : c), k * b)) + '$']);
        }
        if (niveau === 2) {
            // produit ou quotient, à simplifier
            var produit = Math.random() < 0.5;
            do { a = A.entier(1, 9); b = A.entier(2, 9); c = A.entier(1, 9); d = A.entier(2, 9); }
            while (pgcd(a, b) !== 1 || pgcd(c, d) !== 1 || a === b || c === d ||
                   (produit ? pgcd(a * c, b * d) === 1 : pgcd(a * d, b * c) === 1) ||
                   (produit ? R(a * c, b * d) : R(a * d, b * c)).d === 1);
            r = produit ? fois(R(a, b), R(c, d)) : divise(R(a, b), R(c, d));
            q.type = 'nombre';
            q.irreductible = true;
            q.texte = 'Calculer $' + frac(a, b) + (produit ? '\\times' : '\\div') + frac(c, d) + '$. Donner le résultat sous la forme d\'une fraction irréductible.';
            q.attendu = val(r);
            q.explication = (produit ? '$' + frac(a, b) + '\\times' + frac(c, d) + '=' + frac(a + '\\times' + c, b + '\\times' + d) + '=' + frac(a * c, b * d) + '=' + texR(r) + '$.'
                : 'Diviser par une fraction, c\'est multiplier par son inverse : $' + frac(a, b) + '\\div' + frac(c, d) + '=' + frac(a, b) + '\\times' + frac(d, c) + '=' + frac(a * d, b * c) + '=' + texR(r) + '$.');
            return q;
        }
        // priorités : k - a/b × c/d  ou  a/b + c/d ÷ e
        var F, G, res, tex, expl;
        do {
            if (Math.random() < 0.5) {
                k = A.entier(1, 3);
                do { a = A.entier(1, 9); b = A.entier(2, 9); c = A.entier(1, 9); d = A.entier(2, 9); } while (pgcd(a, b) !== 1 || pgcd(c, d) !== 1 || a === b || c === d);
                G = fois(R(a, b), R(c, d)); res = moins(R(k), G);
                tex = k + '-' + frac(a, b) + '\\times' + frac(c, d);
                expl = 'La multiplication d\'abord : $' + frac(a, b) + '\\times' + frac(c, d) + '=' + frac(a * c, b * d) + (G.d !== b * d ? '=' + texR(G) : '') + '$.<br>' +
                    'Puis $' + k + '-' + texR(G) + '=' + frac(k * G.d, G.d) + '-' + frac(G.n, G.d) + '=' + texR(res) + '$.';
            } else {
                var e = A.entier(2, 5);
                do { a = A.entier(1, 9); b = A.entier(2, 9); c = A.entier(1, 9); d = A.entier(2, 6); } while (pgcd(a, b) !== 1 || pgcd(c, d) !== 1 || b === d);
                G = divise(R(c, d), R(e)); F = R(a, b); res = plus(F, G);
                tex = frac(a, b) + '+' + frac(c, d) + '\\div' + e;
                var L = b * G.d / pgcd(b, G.d);
                expl = 'La division d\'abord : $' + frac(c, d) + '\\div' + e + '=' + frac(c, d) + '\\times' + frac(1, e) + '=' + texR(G) + '$.<br>' +
                    'Puis, au même dénominateur $' + L + '$ : $' + frac(a, b) + '+' + texR(G) + '=' + frac(a * L / b, L) + '+' + frac(G.n * L / G.d, L) + '=' + frac(a * L / b + G.n * L / G.d, L) +
                    (res.d !== L ? '=' + texR(res) : '') + '$.';
            }
        } while (res.d === 1 || res.d > 60 || Math.abs(res.n) > 99);
        q.type = 'nombre';
        q.irreductible = true;
        q.texte = 'Calculer $' + tex + '$. Donner le résultat sous la forme d\'une fraction irréductible.';
        q.attendu = val(res);
        q.explication = expl;
        return q;
    };

    /* ===================================================================
       CALCUL LITTÉRAL — ÉQUATIONS
       =================================================================== */
    function ax(a) { return a === 1 ? 'x' : a === -1 ? '-x' : a + 'x'; }
    function plusB(b) { return b === 0 ? '' : b > 0 ? '+' + b : String(b); }

    AutoP.equation = function (niveau) {
        var q = { niveau: niveau, objectif: 'Équations · Équation du premier degré' }, a, b, c, d, x;
        q.type = 'nombre';
        q.prefixe = 'x=';
        if (niveau === 1) {
            do { a = A.nonNul(-9, 9); x = A.entier(-9, 9); b = A.nonNul(-15, 15); } while (Math.abs(a) < 2);
            c = a * x + b;
            q.texte = 'Résoudre l\'équation $' + ax(a) + plusB(b) + '=' + c + '$.';
            q.attendu = x;
            q.correction = [ax(a) + plusB(b) + '&=' + c, ax(a) + '&=' + c + plusB(-b), ax(a) + '&=' + (c - b), 'x&=' + frac(c - b, a) + '=' + x];
            q.rappel = 'On <b>isole l\'inconnue dans un membre</b> :<br>' +
                '• on ajoute ou on soustrait le même nombre aux deux membres ;<br>' +
                '• on divise les deux membres par le même nombre non nul.<br>' +
                'Exemple : $3x+5=17$ ; on soustrait $5$ : $3x=12$ ; on divise par $3$ : $x=4$.';
            return q;
        }
        if (niveau === 2) {
            do { a = A.nonNul(-9, 9); c = A.nonNul(-9, 9); x = A.entier(-8, 8); b = A.entier(-12, 12); } while (a === c || Math.abs(a - c) > 7);
            d = (a - c) * x + b;
            q.texte = 'Résoudre l\'équation $' + ax(a) + plusB(b) + '=' + ax(c) + plusB(d) + '$.';
            q.attendu = x;
            q.correction = [ax(a) + plusB(b) + '&=' + ax(c) + plusB(d), ax(a) + (c > 0 ? '-' : '+') + ax(Math.abs(c)) + '&=' + (d - b === d ? d : d + plusB(-b)), ax(a - c) + '&=' + (d - b), 'x&=' + frac(d - b, a - c) + '=' + x];
            return q;
        }
        // développer d'abord ; solution éventuellement fractionnaire
        var e, s;
        do {
            a = A.choix([-5, -4, -3, -2, 2, 3, 4, 5]); b = A.nonNul(-6, 6); d = A.nonNul(-6, 6); e = A.entier(-10, 10);
            s = R(e - a * b, a - d);
        } while (a === d || s.d > 6 || Math.abs(s.n) > 30 || (s.d === 1 && Math.random() < 0.5));
        q.irreductible = true;
        q.texte = 'Résoudre l\'équation $' + a + '(x' + plusB(b) + ')=' + ax(d) + plusB(e) + '$. Si la solution n\'est pas entière, la donner sous forme de fraction irréductible.';
        q.attendu = val(s);
        q.correction = [a + '(x' + plusB(b) + ')&=' + ax(d) + plusB(e), ax(a) + plusB(a * b) + '&=' + ax(d) + plusB(e), ax(a - d) + '&=' + (e - a * b), 'x&=' + frac(e - a * b, a - d) + (s.n !== e - a * b || s.d !== a - d ? '=' + texR(s) : '')];
        return q;
    };

    /* ===================================================================
       STATISTIQUES — LIRE UN DIAGRAMME
       =================================================================== */
    /* Diagramme en barres : o = { cats, vals, ymin, ymax, pas (quadrillage), etiq (graduations écrites), unite } */
    function barres(o) {
        var ml = 48, mr = 14, mt = 30, mb = 34, h = 210, bw = 44, gap = 26;
        var W = ml + mr + o.cats.length * (bw + gap) + gap / 2, H = mt + h + mb;
        function Y(v) { return mt + h * (o.ymax - v) / (o.ymax - o.ymin); }
        var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Diagramme en barres">', v;
        for (v = o.ymin; v <= o.ymax + 1e-9; v += o.pas) {
            s += '<line class="fig-grille" x1="' + ml + '" y1="' + Y(v) + '" x2="' + (W - mr) + '" y2="' + Y(v) + '"/>';
            if (Math.abs(Math.round(v / o.etiq) * o.etiq - v) < 1e-9)
                s += '<text class="fig-txt" x="' + (ml - 6) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + String(arrondi(v)).replace('.', ',') + '</text>';
        }
        o.cats.forEach(function (c, k) {
            var x = ml + gap / 2 + k * (bw + gap) + gap / 2;
            s += '<rect class="fig-barre" x="' + x + '" y="' + Y(o.vals[k]) + '" width="' + bw + '" height="' + (Y(o.ymin) - Y(o.vals[k])) + '"/>';
            s += '<text class="fig-txt" x="' + (x + bw / 2) + '" y="' + (mt + h + 20) + '" text-anchor="middle">' + c + '</text>';
        });
        s += '<line class="fig-axe" x1="' + ml + '" y1="' + (mt + h) + '" x2="' + (W - mr + 4) + '" y2="' + (mt + h) + '"/>';
        s += '<line class="fig-axe" x1="' + ml + '" y1="' + (mt + h + 4) + '" x2="' + ml + '" y2="' + (mt - 10) + '"/>';
        if (o.unite) s += '<text class="fig-txt" x="' + (ml + 6) + '" y="' + (mt - 14) + '">' + o.unite + '</text>';
        return s + '</svg>';
    }

    var SPORTS = ['Foot', 'Basket', 'Tennis', 'Judo', 'Danse', 'Hand', 'Natation', 'Rugby'];
    var FRUITS = ['Pomme', 'Poire', 'Kiwi', 'Fraise', 'Prune', 'Mangue'];

    AutoP.lireDiagramme = function (niveau) {
        var q = { niveau: niveau, objectif: 'Statistiques · Lire un diagramme' }, cats, vals, k;
        if (niveau === 1) {
            var pas = A.choix([2, 5, 10]), n = 5;
            cats = melanger(SPORTS).slice(0, n);
            vals = cats.map(function () { return pas * A.entier(1, 9); });
            k = A.entier(0, n - 1);
            q.figure = barres({ cats: cats, vals: vals, ymin: 0, ymax: pas * 10, pas: pas, etiq: 2 * pas, unite: 'Nombre d\'élèves' });
            q.figureNote = cats.map(function (c, j) { return c + ' ' + vals[j]; }).join(', ') + ' (quadrillage ' + pas + ')';
            q.type = 'nombre';
            q.texte = 'Le diagramme donne le sport choisi par les élèves d\'un lycée. Combien d\'élèves ont choisi « ' + cats[k] + ' » ?';
            q.attendu = vals[k];
            q.explication = 'Les graduations écrites vont de $' + (2 * pas) + '$ en $' + (2 * pas) + '$ : chaque ligne du quadrillage vaut $' + pas + '$. Le haut de la barre « ' + cats[k] + ' » est sur la ligne $' + vals[k] + '$.';
            q.rappel = 'Avant de lire un graphique, on repère l\'<b>origine</b> de l\'axe et l\'<b>unité de graduation</b> : de combien augmente-t-on d\'une ligne à la suivante ?<br>' +
                'Exemple : si les graduations écrites sont $0$, $10$, $20$… et qu\'il y a une ligne entre deux graduations, chaque ligne vaut $5$.';
            return q;
        }
        if (niveau === 2) {
            var T, p;
            do {
                T = A.choix([20, 25, 40, 50]);
                vals = [A.entier(2, T / 3), A.entier(2, T / 3), A.entier(2, T / 3)];
                vals.push(T - vals[0] - vals[1] - vals[2]);
                k = A.entier(0, 3);
                p = 100 * vals[k] / T;
            } while (vals[3] < 2 || vals[3] > T / 2 || p % 1);
            cats = melanger(FRUITS).slice(0, 4);
            var ymax = Math.ceil(Math.max.apply(null, vals) / 2) * 2 + 2;
            q.figure = barres({ cats: cats, vals: vals, ymin: 0, ymax: ymax, pas: 1, etiq: 2, unite: 'Effectif' });
            q.figureNote = cats.map(function (c, j) { return c + ' ' + vals[j]; }).join(', ');
            q.type = 'champs';
            q.texte = 'On a demandé à des personnes leur fruit préféré (chacune a donné une seule réponse). Quel pourcentage des personnes interrogées ont choisi « ' + cats[k] + ' » ?';
            q.gabarit = '[] $\\,\\%$';
            q.attendus = [p];
            q.explication = 'Effectif total : $' + vals.join('+') + '=' + T + '$. Proportion : $' + frac(vals[k], T) + '=' + fr(p / 100) + '$, soit $' + pct(p) + '$.';
            return q;
        }
        // axe qui ne commence pas à 0 + taux d'évolution entre deux années
        var V1, t, V2, ans = ['2022', '2023', '2024', '2025'], i1, i2, base;
        do {
            V1 = 10 * A.entier(10, 25); t = A.choix([10, 20, 25, 50, -10, -20, -25, 40, 30]); V2 = V1 * (1 + t / 100);
        } while (V2 % 10 || V2 > 340 || V2 < 60);
        i1 = A.entier(0, 1); i2 = A.entier(2, 3);
        vals = [0, 0, 0, 0];
        vals[i1] = V1; vals[i2] = V2;
        var lo = Math.min(V1, V2), hi = Math.max(V1, V2);
        for (var j = 0; j < 4; j++) if (!vals[j]) vals[j] = 10 * A.entier(Math.max(1, lo / 10 - 3), hi / 10 + 2);
        base = Math.max(0, Math.floor((Math.min.apply(null, vals) - 30) / 50) * 50);
        var top = Math.ceil((Math.max.apply(null, vals) + 10) / 20) * 20;
        q.figure = barres({ cats: ans, vals: vals, ymin: base, ymax: top, pas: 10, etiq: 20, unite: 'Nombre d\'abonnés' });
        q.figureNote = ans.map(function (a, j) { return a + ' ' + vals[j]; }).join(', ') + ' (axe à partir de ' + base + ')';
        q.type = 'champs';
        q.texte = 'Le diagramme donne le nombre d\'abonnés d\'une médiathèque. Quel est le taux d\'évolution du nombre d\'abonnés entre ' + ans[i1] + ' et ' + ans[i2] + ' ? (Pour une baisse, mettre un signe « − ».)';
        q.gabarit = '[] $\\,\\%$';
        q.attendus = [t];
        q.explication = (base ? '<i>Attention : l\'axe vertical commence à $' + base + '$, pas à $0$.</i><br>' : '') +
            'On lit $' + V1 + '$ abonnés en ' + ans[i1] + ' et $' + V2 + '$ en ' + ans[i2] + '.<br>' +
            'Taux d\'évolution : $' + frac(V2 + '-' + V1, V1) + '\\times100=' + frac(V2 - V1, V1) + '\\times100=' + fr(t) + '$, soit ' + (t > 0 ? 'une hausse' : 'une baisse') + ' de $' + pct(Math.abs(t)) + '$.';
        return q;
    };

    window.AutoP = AutoP;
})();
