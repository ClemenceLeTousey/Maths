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


    /* =====================================================================
       Séries 2 à 7 (jusqu'aux vacances de Noël) — voir Planning automatismes.md
       ===================================================================== */
    var poly = Interactif.poly, par = Interactif.par;
    function terme(n) { return n < 0 ? '-' + fr(-n) : '+' + fr(n); }   // « +3 » ou « -3 »
    function signeTaux(t) { return (t > 0 ? '+' : '') + fr(t); }
    function intervalle(a, b, ga, db) { return (ga ? '[' : ']') + a + '\\,;\\,' + b + (db ? ']' : '['); }
    function rapide(x) { return Math.abs(x - Math.round(x)) < 1e-9; }
    function decimalesOk(x, n) { return rapide(x * Math.pow(10, n)); }

    /* ---------- Évolutions : calculer un taux (automatisme 4) ---------- */
    AutoP.tauxEvolution = function (niveau) {
        var q = { niveau: niveau, objectif: 'Évolutions · Calculer un taux d\'évolution' }, V1, V2, t;
        if (niveau === 1) {
            do { V1 = A.choix([20, 40, 50, 80, 200, 400]); t = A.choix([5, 10, 20, 25, 50, -10, -20, -25, -50]); V2 = V1 * (1 + t / 100); } while (!rapide(V2) || V2 - V1 === t);
            q.texte = 'Un prix passe de $' + V1 + '$ € à $' + fr(V2) + '$ €. Le taux d\'évolution de ce prix est :';
            q.explication = '$t=' + frac('V_A-V_D', 'V_D') + '\\times100=' + frac(fr(V2) + '-' + V1, V1) + '\\times100=' + frac(fr(V2 - V1), V1) + '\\times100=' + fr(t) + '$, soit ' + (t > 0 ? 'une hausse' : 'une baisse') + ' de $' + pct(Math.abs(t)) + '$.';
            q.rappel = 'Le taux d\'évolution entre une valeur de départ $V_D$ et une valeur d\'arrivée $V_A$ est $t=' + frac('V_A-V_D', 'V_D') + '\\times100$ (en %).<br>' +
                'On divise toujours par la valeur de <b>départ</b>. Exemple : de $40$ à $50$ : $' + frac('50-40', 40) + '\\times100=25$, soit $+25\\,\\%$.';
            return qcm(q, '$' + signeTaux(t) + '\\,\\%$', ['$' + signeTaux(-t) + '\\,\\%$', '$' + signeTaux(arrondi(V2 - V1)) + '\\,\\%$', '$' + signeTaux(arrondi(100 * (V2 - V1) / V2)) + '\\,\\%$', '$' + signeTaux(arrondi(100 * V2 / V1)) + '\\,\\%$']);
        }
        if (niveau === 2) {
            do { V1 = A.entier(4, 40) * 50; t = A.choix([-35, -30, -24, -15, -12, -8, -6, -4, 4, 6, 8, 12, 15, 18, 35, 45, 60]); V2 = V1 * (1 + t / 100); } while (!rapide(V2));
            var C = A.choix([['Le nombre d\'habitants d\'un village', 'habitants'], ['Le nombre de visiteurs d\'un musée', 'visiteurs'], ['Le nombre d\'abonnés d\'un club', 'abonnés']]);
            q.type = 'champs';
            q.texte = C[0] + ' passe de $' + fr(V1) + '$ à $' + fr(V2) + '$. Quel est le taux d\'évolution ? (Pour une baisse, mettre un signe « − ».)';
            q.gabarit = '[] $\\,\\%$';
            q.attendus = [t];
            q.explication = '$t=' + frac(fr(V2) + '-' + fr(V1), fr(V1)) + '\\times100=' + frac(fr(V2 - V1), fr(V1)) + '\\times100=' + fr(t) + '$, soit ' + (t > 0 ? 'une hausse' : 'une baisse') + ' de $' + pct(Math.abs(t)) + '$.';
            return q;
        }
        q.type = 'champs';
        q.gabarit = '[] $\\,\\%$';
        if (Math.random() < 0.5) {
            var cm = A.choix([1.035, 0.82, 2, 0.5, 1.007, 0.975, 3, 1.4, 0.6, 1.15]);
            t = arrondi((cm - 1) * 100);
            q.texte = 'Une quantité est multipliée par $' + fr(cm) + '$. Quel est son taux d\'évolution ? (Pour une baisse, mettre un signe « − ».)';
            q.attendus = [t];
            q.explication = '$CM=' + fr(cm) + '=1' + (t > 0 ? '+' : '-') + fr(Math.abs(t / 100)) + '=1' + (t > 0 ? '+' : '-') + frac(fr(Math.abs(t)), 100) + '$ : c\'est ' + (t > 0 ? 'une hausse' : 'une baisse') + ' de $' + pct(Math.abs(t)) + '$.' +
                (cm >= 2 ? '<br><i>Multiplier par $' + cm + '$, ce n\'est pas « $+' + (cm * 100) + '\\,\\%$ » : on ajoute $' + fr(cm - 1) + '$ fois la valeur de départ.</i>' : '');
            return q;
        }
        var rem;
        do { V1 = A.entier(3, 30) * 4; t = -A.choix([10, 20, 25, 30, 40, 50, 15, 5]); rem = -V1 * t / 100; } while (!rapide(rem));
        q.texte = 'Après une remise de $' + fr(rem) + '$ €, un article coûte $' + fr(V1 - rem) + '$ €. Quel est le taux d\'évolution de son prix ? (Pour une baisse, mettre un signe « − ».)';
        q.attendus = [t];
        q.explication = 'Le prix de départ est $' + fr(V1 - rem) + '+' + fr(rem) + '=' + fr(V1) + '$ €.<br>$t=' + frac('-' + fr(rem), fr(V1)) + '\\times100=' + fr(t) + '$ : une baisse de $' + pct(-t) + '$. <i>On divise par le prix <b>de départ</b>, pas par le prix après remise.</i>';
        return q;
    };

    /* ---------- Puissances (automatisme 9) ---------- */
    function pw(a, n) { return (a < 0 ? '(' + a + ')' : a) + '^{' + n + '}'; }
    AutoP.puissances = function (niveau) {
        var q = { niveau: niveau, objectif: 'Puissances · Calculer avec des puissances' }, a, m, n;
        if (niveau === 1) {
            a = A.choix([2, 3, 5, 10]); m = A.entier(2, 7); n = A.entier(2, 6);
            var op = A.choix(['*', '/', '^']), bonne, autres, expl;
            if (op === '*') { q.texte = '$' + pw(a, m) + '\\times' + pw(a, n) + '$ est égal à :'; bonne = pw(a, m + n); autres = [pw(a, m * n), pw(a * a, m + n), pw(2 * a, m * n), pw(a, Math.abs(m - n))]; expl = '$a^m\\times a^n=a^{m+n}$ : $' + pw(a, m) + '\\times' + pw(a, n) + '=' + pw(a, m + n) + '$ (on ajoute les exposants).'; }
            else if (op === '/') { if (m <= n) m = n + A.entier(1, 4); q.texte = '$' + frac(pw(a, m), pw(a, n)) + '$ est égal à :'; bonne = pw(a, m - n); autres = [pw(a, m + n), pw(1, m - n), pw(a, Math.round(m / n) === m / n ? m / n : m * n), pw(a, n - m)]; expl = '$' + frac('a^m', 'a^n') + '=a^{m-n}$ : $' + frac(pw(a, m), pw(a, n)) + '=' + pw(a, m - n) + '$ (on soustrait les exposants).'; }
            else { m = A.entier(2, 4); n = A.entier(2, 4); q.texte = '$(' + pw(a, m) + ')^{' + n + '}$ est égal à :'; bonne = pw(a, m * n); autres = [pw(a, m + n), pw(a * n, m), pw(a, m * n + 1), pw(n * m, a)]; expl = '$(a^m)^n=a^{m\\times n}$ : $(' + pw(a, m) + ')^{' + n + '}=' + pw(a, m * n) + '$ (on multiplie les exposants).'; }
            q.explication = expl;
            q.rappel = 'Pour un même nombre $a$ :<br>• $a^m\\times a^n=a^{m+n}$ ;<br>• $' + frac('a^m', 'a^n') + '=a^{m-n}$ ;<br>• $(a^m)^n=a^{m\\times n}$.<br>Exemple : $2^3\\times2^4=2^7$ car $(2\\times2\\times2)\\times(2\\times2\\times2\\times2)$ contient sept facteurs $2$.';
            return qcm(q, '$' + bonne + '$', autres.map(function (t) { return '$' + t + '$'; }));
        }
        if (niveau === 2) {
            var b, c;
            do { m = A.nonNul(-5, 8); n = A.nonNul(-6, 6); c = A.nonNul(-5, 6); } while (m + n - c === 0 || c === 1);
            q.type = 'nombre'; q.prefixe = 'n=';
            q.texte = 'Le nombre $A=' + frac('10^{' + m + '}\\times10^{' + n + '}', '10^{' + c + '}') + '$ s\'écrit $10^n$, avec $n$ entier. Donner $n$.';
            q.attendu = m + n - c;
            q.explication = '$10^{' + m + '}\\times10^{' + n + '}=10^{' + m + (n < 0 ? '' : '+') + n + '}=10^{' + (m + n) + '}$, puis $' + frac('10^{' + (m + n) + '}', '10^{' + c + '}') + '=10^{' + (m + n) + (c < 0 ? '-(' + c + ')' : '-' + c) + '}=10^{' + (m + n - c) + '}$.';
            return q;
        }
        // notation scientifique d'un produit
        var x, y, p, r, mant, e;
        do { x = A.choix([2, 3, 4, 5, 6, 8, 1.5, 2.5]); y = A.choix([2, 3, 4, 5, 6, 8, 1.2]); p = A.entier(-6, 8); r = A.entier(-8, 5); mant = arrondi(x * y); e = p + r; if (mant >= 10) { mant = arrondi(mant / 10); e += 1; } } while (mant === 1 && Math.random() < 0.8);
        q.type = 'champs';
        q.texte = 'Donner l\'écriture scientifique de $A=(' + fr(x) + '\\times10^{' + p + '})\\times(' + fr(y) + '\\times10^{' + r + '})$.';
        q.gabarit = '$A=$ [] $\\times10^n$ avec $n=$ []';
        q.attendus = [mant, e];
        q.explication = 'On regroupe : $A=(' + fr(x) + '\\times' + fr(y) + ')\\times10^{' + p + (r < 0 ? '' : '+') + r + '}=' + fr(arrondi(x * y)) + '\\times10^{' + (p + r) + '}$.' +
            (x * y >= 10 ? '<br>$' + fr(arrondi(x * y)) + '=' + fr(mant) + '\\times10^1$, donc $A=' + fr(mant) + '\\times10^{' + e + '}$ (le premier facteur doit être entre $1$ et $10$).' : '');
        return q;
    };

    /* ---------- Développer, réduire (automatisme 14) ---------- */
    AutoP.developper = function (niveau) {
        var q = { niveau: niveau, objectif: 'Calcul littéral · Développer, réduire' }, a, b, c, d, k;
        if (niveau === 1) {
            do { k = A.nonNul(-6, 7); a = A.entier(2, 6); b = A.nonNul(-9, 9); } while (k === 1 || k === -1);
            q.texte = 'La forme développée de $' + k + '(' + poly([a, b]) + ')$ est :';
            q.explication = 'On multiplie <b>chaque terme</b> de la parenthèse par $' + k + '$ : $' + k + '\\times' + a + 'x' + (b < 0 ? '+' : '+') + par(k) + '\\times' + par(b) + '=' + poly([k * a, k * b]) + '$.';
            q.rappel = 'Simple distributivité : $k(a+b)=k\\times a+k\\times b$. On multiplie <b>chaque</b> terme de la parenthèse, en faisant attention aux signes.<br>Exemple : $-3(2x-5)=-6x+15$.';
            return qcm(q, '$' + poly([k * a, k * b]) + '$', ['$' + poly([k * a, b]) + '$', '$' + poly([k * a, -k * b]) + '$', '$' + poly([k + a, k * b]) + '$', '$' + poly([a, k * b]) + '$']);
        }
        q.type = 'expr'; q.forme = 'developpee'; q.consigne = 'Développer et réduire :'; q.prefixe = 'A =';
        if (niveau === 2) {
            a = A.entier(1, 4); b = A.nonNul(-6, 6); c = A.entier(1, 4); d = A.nonNul(-6, 6);
            var P = [a * c, a * d + b * c, b * d];
            q.enonce = 'A=(' + poly([a, b]) + ')(' + poly([c, d]) + ')'; q.attendu = poly(P);
            q.correction = ['A&=' + poly([a, 0]) + '\\times' + poly([c, 0]) + '+' + poly([a, 0]) + '\\times' + par(d) + terme(b) + '\\times' + poly([c, 0]) + terme(b) + '\\times' + par(d),
                '&=' + poly([a * c, 0, 0]) + terme(a * d) + 'x' + terme(b * c) + 'x' + terme(b * d), '&=' + poly(P)];
            return q;
        }
        // identité remarquable ou différence de deux produits
        if (Math.random() < 0.5) {
            a = A.entier(1, 5); b = A.nonNul(-7, 7);
            q.enonce = 'A=(' + poly([a, b]) + ')^2'; q.attendu = poly([a * a, 2 * a * b, b * b]);
            q.correction = ['A&=(' + poly([a, 0]) + ')^2' + (b > 0 ? '+' : '-') + '2\\times' + poly([a, 0]) + '\\times' + Math.abs(b) + '+' + Math.abs(b) + '^2', '&=' + poly([a * a, 2 * a * b, b * b])];
            q.explication = '$(a' + (b > 0 ? '+' : '-') + 'b)^2=a^2' + (b > 0 ? '+' : '-') + '2ab+b^2$.';
            return q;
        }
        do { k = A.entier(2, 5); a = A.nonNul(-5, 5); b = A.nonNul(-5, 5); c = A.nonNul(-6, 6); } while (a === b);
        // A = k(x + a) - (x + b)(x + c)
        var R1 = [0, k, k * a], R2 = [1, b + c, b * c], Rf = [-1, k - b - c, k * a - b * c];
        q.enonce = 'A=' + k + '(' + poly([1, a]) + ')-(' + poly([1, b]) + ')(' + poly([1, c]) + ')'; q.attendu = poly(Rf);
        q.correction = ['A&=' + poly([k, k * a]) + '-(' + poly(R2) + ')', '&=' + poly([k, k * a]) + poly([-1, -(b + c), -b * c]).replace(/^-/, '-').replace(/^(?!-)/, '+'), '&=' + poly(Rf)];
        q.explication = 'Le signe « − » devant le produit change le signe de <b>tous</b> les termes de son développement.';
        return q;
    };

    /* ---------- Images et antécédents par le calcul (automatisme 22) ---------- */
    AutoP.imagesCalcul = function (niveau) {
        var q = { niveau: niveau, objectif: 'Fonctions · Images et antécédents par le calcul' }, a, b, c, x, k;
        q.type = 'nombre';
        if (niveau === 1) {
            a = A.nonNul(-7, 7); b = A.nonNul(-9, 9); x = A.nonNul(-6, 6);
            q.texte = 'Soit $f$ la fonction définie par $f(x)=' + poly([a, b]) + '$. Calculer l\'image de $' + x + '$ par $f$.';
            q.prefixe = 'f(' + x + ')=';
            q.attendu = a * x + b;
            q.explication = 'On remplace $x$ par $' + x + '$ : $f(' + x + ')=' + a + '\\times' + par(x) + terme(b) + '=' + (a * x) + terme(b) + '=' + (a * x + b) + '$.';
            q.rappel = 'L\'<b>image</b> de $a$ par $f$, c\'est $f(a)$ : on remplace $x$ par $a$ dans l\'expression de $f$, puis on calcule. Un nombre négatif se met entre parenthèses.<br>Exemple : si $f(x)=3x-2$, $f(-4)=3\\times(-4)-2=-14$.';
            return q;
        }
        if (niveau === 2) {
            a = A.choix([1, 2, 3, -1, -2]); b = A.entier(-5, 5); c = A.entier(-9, 9); x = -A.entier(1, 5);
            q.texte = 'Soit $f$ la fonction définie par $f(x)=' + poly([a, b, c]) + '$. Calculer $f(' + x + ')$.';
            q.prefixe = 'f(' + x + ')=';
            q.attendu = a * x * x + b * x + c;
            q.explication = '$f(' + x + ')=' + (a === 1 ? '' : a === -1 ? '-' : a + '\\times') + par(x) + '^2' + (b ? terme(b) + '\\times' + par(x) : '') + (c ? terme(c) : '') + '=' + (a === 1 ? '' : a === -1 ? '-' : a + '\\times') + (x * x) + (b ? terme(b * x) : '') + (c ? terme(c) : '') + '=' + q.attendu + '$.' +
                '<br><i>Attention : $' + par(x) + '^2=' + (x * x) + '$ (positif), alors que $-' + (-x) + '^2=' + (-x * x) + '$.</i>';
            return q;
        }
        if (Math.random() < 0.5) {
            var s;
            do { a = A.nonNul(-6, 6); b = A.nonNul(-9, 9); k = A.entier(-10, 10); s = R(k - b, a); } while (Math.abs(a) < 2 || s.d === 1 && Math.random() < 0.6);
            q.irreductible = true;
            q.texte = 'Soit $f$ la fonction définie par $f(x)=' + poly([a, b]) + '$. Déterminer l\'antécédent de $' + k + '$ par $f$ (si besoin, sous la forme d\'une fraction irréductible).';
            q.prefixe = 'x=';
            q.attendu = val(s);
            q.correction = ['f(x)&=' + k, poly([a, b]) + '&=' + k, poly([a, 0]) + '&=' + (k - b), 'x&=' + frac(k - b, a) + (s.n !== k - b || s.d !== a ? '=' + texR(s) : '')];
            return q;
        }
        c = A.nonNul(-9, 6); x = A.entier(2, 7); k = x * x + c;
        q.texte = 'Soit $f$ la fonction définie par $f(x)=x^2' + terme(c) + '$. Quels sont les antécédents de $' + k + '$ par $f$ ?';
        q.explication = '$x^2' + terme(c) + '=' + k + '$ donne $x^2=' + (k - c) + '$, donc $x=' + x + '$ ou $x=-' + x + '$ : deux antécédents, $-' + x + '$ et $' + x + '$.';
        return qcm(q, '$-' + x + '$ et $' + x + '$', ['$' + x + '$ seulement', '$' + (k * k + c) + '$', '$' + (k - c) + '$', '$-' + (k - c) + '$ et $' + (k - c) + '$']);
    };

    /* ---------- Indicateurs statistiques (automatisme 29) ---------- */
    function trie(t) { return t.slice().sort(function (u, v) { return u - v; }); }
    AutoP.indicateursStats = function (niveau) {
        var q = { niveau: niveau, objectif: 'Statistiques · Moyenne, médiane, quartiles, étendue' }, v, n;
        q.type = 'nombre';
        if (niveau === 1) {
            n = A.choix([5, 7, 9]);
            do { v = []; for (var i = 0; i < n; i++) v.push(A.entier(2, 20)); } while (trie(v)[0] === trie(v)[n - 1]);
            var s = trie(v), etendue = Math.random() < 0.4;
            q.texte = 'Voici les notes d\'un élève : $' + v.join('\\ ;\\ ') + '$. ' + (etendue ? 'Quelle est l\'étendue de cette série ?' : 'Quelle est la médiane de cette série ?');
            q.attendu = etendue ? s[n - 1] - s[0] : s[(n - 1) / 2];
            q.explication = etendue ? 'Étendue = plus grande valeur − plus petite valeur $=' + s[n - 1] + '-' + s[0] + '=' + q.attendu + '$.'
                : 'On range les notes : $' + s.join('\\ ;\\ ') + '$. Il y en a $' + n + '$ : la médiane est la $' + ((n + 1) / 2) + '^{e}$, soit $' + q.attendu + '$.';
            q.rappel = '• <b>Médiane</b> : on range les valeurs dans l\'ordre croissant ; c\'est la valeur du milieu (autant de valeurs avant qu\'après). Avec $n$ valeurs ($n$ impair), c\'est la valeur de rang $' + frac('n+1', 2) + '$.<br>' +
                '• <b>Étendue</b> : plus grande valeur − plus petite valeur.<br>Exemple : $3\\ ;\\ 12\\ ;\\ 7\\ ;\\ 9\\ ;\\ 4$ ; rangées : $3\\ ;\\ 4\\ ;\\ 7\\ ;\\ 9\\ ;\\ 12$ ; médiane $7$, étendue $12-3=9$.';
            return q;
        }
        if (niveau === 2) {
            var vals, eff, N, S;
            do {
                vals = trie(melanger([6, 8, 9, 10, 11, 12, 13, 14, 15, 16]).slice(0, 4));
                eff = vals.map(function () { return A.entier(1, 6); });
                N = eff.reduce(function (u, w) { return u + w; }, 0);
                S = vals.reduce(function (u, w, k) { return u + w * eff[k]; }, 0);
            } while (!decimalesOk(S / N, 1));
            q.texte = 'Notes d\'un contrôle : $\\begin{array}{|l|c|c|c|c|}\\hline \\text{Note} & ' + vals.join(' & ') + '\\\\\\hline \\text{Effectif} & ' + eff.join(' & ') + '\\\\\\hline\\end{array}$<br>Calculer la note moyenne de la classe.';
            q.attendu = arrondi(S / N);
            q.explication = 'Moyenne $=' + frac(vals.map(function (w, k) { return w + '\\times' + eff[k]; }).join('+'), eff.join('+')) + '=' + frac(S, N) + '=' + fr(S / N) + '$.<br><i>On divise par l\'effectif total $' + N + '$, pas par le nombre de notes différentes.</i>';
            return q;
        }
        n = A.choix([8, 10, 11, 12]);
        do { v = []; for (var j = 0; j < n; j++) v.push(A.entier(1, 30)); } while (new Set(v).size < n - 1);
        var t = trie(v), i1 = Math.ceil(n / 4), i3 = Math.ceil(3 * n / 4);
        q.type = 'champs';
        q.texte = 'Temps de trajet (en minutes) de $' + n + '$ élèves : $' + v.join('\\ ;\\ ') + '$. Déterminer le premier quartile $Q_1$ et le troisième quartile $Q_3$.';
        q.gabarit = '$Q_1=$ [] &nbsp; $Q_3=$ []';
        q.attendus = [t[i1 - 1], t[i3 - 1]];
        q.explication = 'Rangées : $' + t.join('\\ ;\\ ') + '$.<br>$' + frac(n, 4) + '=' + fr(n / 4) + '$, donc $Q_1$ est la $' + i1 + '^{e}$ valeur : $Q_1=' + t[i1 - 1] + '$.<br>$' + frac('3\\times' + n, 4) + '=' + fr(3 * n / 4) + '$, donc $Q_3$ est la $' + i3 + '^{e}$ valeur : $Q_3=' + t[i3 - 1] + '$.';
        return q;
    };

    /* ---------- Proportion de proportion (automatisme 2) ---------- */
    AutoP.proportionDeProportion = function (niveau) {
        var q = { niveau: niveau, objectif: 'Proportions · Proportion de proportion' }, p1, p2, r;
        var C = A.choix([
            ['des élèves d\'un lycée sont des filles', 'd\'entre elles sont internes', 'des élèves du lycée sont des filles internes', 'des filles'],
            ['des salariés d\'une entreprise sont des cadres', 'des cadres travaillent à temps partiel', 'des salariés sont des cadres à temps partiel', 'des cadres'],
            ['des adhérents d\'un club font de la compétition', 'd\'entre eux sont mineurs', 'des adhérents sont des compétiteurs mineurs', 'des compétiteurs'],
            ['des habitants d\'une ville ont un vélo', 'd\'entre eux l\'utilisent pour aller travailler', 'des habitants vont travailler à vélo', 'des cyclistes']
        ]);
        if (niveau === 1) {
            do { p1 = A.choix([20, 40, 50, 60, 80]); p2 = A.choix([10, 20, 25, 50, 30]); r = p1 * p2 / 100; } while (!rapide(r));
            q.texte = '$' + pct(p1) + '$ ' + C[0] + ' et $' + pct(p2) + '$ ' + C[1] + '. Alors :';
            q.explication = 'On prend $' + pct(p2) + '$ de $' + pct(p1) + '$ : $' + fr(p2 / 100) + '\\times' + fr(p1 / 100) + '=' + fr(r / 100) + '$, soit $' + pct(r) + '$.';
            q.rappel = 'Prendre $p_2$ % d\'une partie qui représente $p_1$ % du total, c\'est <b>multiplier</b> les proportions : $' + frac('p_1', 100) + '\\times' + frac('p_2', 100) + '$.<br>Exemple : $50\\,\\%$ de $40\\,\\%$ : $0{,}5\\times0{,}4=0{,}2$, soit $20\\,\\%$ du total. On n\'additionne pas !';
            return qcm(q, '$' + pct(r) + '$ ' + C[2], ['$' + pct(p1 + p2) + '$ ' + C[2], '$' + pct(Math.abs(p1 - p2)) + '$ ' + C[2], '$' + pct(p2) + '$ ' + C[2], '$' + pct(arrondi(p1 * p2 / 10)) + '$ ' + C[2]]);
        }
        q.type = 'champs'; q.gabarit = '[] $\\,\\%$';
        if (niveau === 2) {
            do { p1 = A.choix([15, 25, 30, 35, 45, 60, 65, 70, 75, 85]); p2 = A.choix([12, 20, 30, 40, 60, 80, 15, 5]); r = p1 * p2 / 100; } while (!decimalesOk(r, 1));
            q.texte = '$' + pct(p1) + '$ ' + C[0] + ' et $' + pct(p2) + '$ ' + C[1] + '. Compléter : « $\\ldots\\,\\%$ ' + C[2] + '. »';
            q.attendus = [r];
            q.explication = '$' + fr(p1 / 100) + '\\times' + fr(p2 / 100) + '=' + fr(r / 100) + '$, soit $' + pct(r) + '$.';
            return q;
        }
        // proportion inconnue : r et p1 connus, p2 = r / p1
        do { p1 = A.choix([20, 25, 40, 50, 60, 75, 80]); p2 = A.choix([10, 15, 20, 25, 30, 40, 45, 60, 75]); r = p1 * p2 / 100; } while (!decimalesOk(r, 1) || r === p2);
        q.texte = '$' + pct(p1) + '$ ' + C[0] + ', et $' + pct(r) + '$ ' + C[2] + '. Quel pourcentage ' + C[3] + ' cela représente-t-il ?';
        q.attendus = [p2];
        q.explication = 'On cherche $p$ tel que $' + fr(p1 / 100) + '\\times p=' + fr(r / 100) + '$ : $p=' + frac(fr(r / 100), fr(p1 / 100)) + '=' + fr(p2 / 100) + '$, soit $' + pct(p2) + '$ ' + C[3] + '.';
        return q;
    };

    /* ---------- Écritures d'un nombre (automatisme 10) ---------- */
    AutoP.ecrituresNombre = function (niveau) {
        var q = { niveau: niveau, objectif: 'Nombres · Écritures d\'un nombre' };
        if (niveau === 1) {
            if (Math.random() < 0.5) {
                var F = A.choix([[1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [1, 8], [3, 20], [7, 20], [1, 25], [9, 25], [7, 50]]), d = F[0] / F[1];
                q.texte = 'La fraction $' + frac(F[0], F[1]) + '$ est égale à :';
                q.explication = '$' + frac(F[0], F[1]) + '=' + F[0] + '\\div' + F[1] + '=' + fr(d) + '$.' + (100 % F[1] === 0 ? ' Ou : $' + frac(F[0], F[1]) + '=' + frac(F[0] * 100 / F[1], 100) + '=' + fr(d) + '$.' : '');
                q.rappel = 'Une fraction est un quotient : $' + frac('a', 'b') + '=a\\div b$. Astuce : on cherche une fraction égale de dénominateur $10$, $100$ ou $1\\,000$.<br>Exemple : $' + frac(3, 4) + '=' + frac(75, 100) + '=0{,}75=75\\,\\%$.';
                return qcm(q, '$' + fr(d) + '$', ['$' + F[0] + '{,}' + F[1] + '$', '$' + fr(arrondi(F[1] / F[0])) + '$', '$' + fr(arrondi(d * 10)) + '$', '$' + fr(arrondi(d / 10)) + '$']);
            }
            var p = A.choix([3, 7, 12, 35, 4.5, 0.5, 125, 60]);
            q.texte = '$' + pct(p) + '$ s\'écrit aussi :';
            q.explication = '$' + pct(p) + '=' + frac(fr(p), 100) + '=' + fr(p / 100) + '$.';
            q.rappel = '$p\\,\\%=' + frac('p', 100) + '$ : pour écrire un pourcentage en décimal, on divise par $100$.<br>Exemple : $8\\,\\%=' + frac(8, 100) + '=0{,}08$ ; $150\\,\\%=1{,}5$.';
            return qcm(q, '$' + fr(p / 100) + '$', ['$' + fr(p / 10) + '$', '$' + fr(p / 1000) + '$', '$' + fr(p) + '$', '$' + frac(1, fr(p)) + '$']);
        }
        if (niveau === 2) {
            var m = A.choix([1.2, 3.4, 4.05, 7, 2.5, 6.8, 9.1, 1.75]), e = A.choix([-6, -5, -4, -3, -2, 3, 4, 5, 6, 7]);
            var dec = (function () { var s = fr(arrondi(m * Math.pow(10, e))); return s; })();
            if (e < 0) { var zeros = -e - 1, mant = String(m).replace('.', ''); dec = '0{,}' + '0'.repeat(zeros) + mant; dec = dec.replace(/(\d{3})(?=\d)/g, '$1\\,').replace('0{,}', '0{,}'); dec = '0{,}' + ('0'.repeat(zeros) + mant).replace(/(\d{3})(?=\d)/g, '$1\\,'); }
            q.type = 'champs';
            q.texte = 'Donner l\'écriture scientifique de $' + dec + '$.';
            q.gabarit = '[] $\\times10^n$ avec $n=$ []';
            q.attendus = [m, e];
            q.explication = 'L\'écriture scientifique est $a\\times10^n$ avec $1\\leqslant a<10$ : $' + dec + '=' + fr(m) + '\\times10^{' + e + '}$ (la virgule se déplace de $' + Math.abs(e) + '$ rang' + (Math.abs(e) > 1 ? 's' : '') + ' vers la ' + (e > 0 ? 'gauche' : 'droite') + ').';
            return q;
        }
        q.type = 'champs';
        if (Math.random() < 0.5) {
            var G = A.choix([[3, 8], [5, 8], [7, 8], [1, 16], [3, 40], [9, 40], [13, 20], [17, 25], [1, 3], [2, 3]]);
            if (G[1] === 3) { G = G[0] === 1 ? [3, 8] : [5, 8]; }
            q.texte = 'Écrire $' + frac(G[0], G[1]) + '$ sous la forme d\'un pourcentage.';
            q.gabarit = '[] $\\,\\%$';
            q.attendus = [arrondi(100 * G[0] / G[1])];
            q.explication = '$' + frac(G[0], G[1]) + '=' + G[0] + '\\div' + G[1] + '=' + fr(G[0] / G[1]) + '=' + frac(fr(arrondi(100 * G[0] / G[1])), 100) + '$, soit $' + pct(arrondi(100 * G[0] / G[1])) + '$.';
            return q;
        }
        var D = A.choix([0.35, 0.125, 0.06, 1.25, 0.075, 0.45, 2.4, 0.024]), Rr = R(Math.round(D * 1000), 1000);
        q.type = 'nombre'; q.irreductible = true;
        q.texte = 'Écrire $' + fr(D) + '$ sous la forme d\'une fraction irréductible.';
        q.attendu = D;
        q.explication = '$' + fr(D) + '=' + frac(Math.round(D * 1000), 1000) + '=' + texR(Rr) + '$ (on simplifie par $' + (1000 / Rr.d) + '$).';
        return q;
    };

    /* ---------- Calcul littéral élémentaire (automatisme 13) ---------- */
    AutoP.calculLitteral = function (niveau) {
        var q = { niveau: niveau, objectif: 'Calcul littéral · Substituer, réduire, exprimer' }, a, b, c, x;
        if (niveau === 1) {
            a = A.entier(2, 5); b = A.nonNul(-6, 6); c = A.nonNul(-9, 9); x = -A.entier(1, 4);
            var v = a * x * x + b * x + c;
            q.type = 'nombre';
            q.texte = 'Calculer $' + poly([a, b, c]) + '$ pour $x=' + x + '$.';
            q.attendu = v;
            q.explication = '$' + a + '\\times' + par(x) + '^2' + terme(b) + '\\times' + par(x) + terme(c) + '=' + a + '\\times' + (x * x) + terme(b * x) + terme(c) + '=' + (a * x * x) + terme(b * x) + terme(c) + '=' + v + '$.';
            q.rappel = 'On remplace la lettre par sa valeur, <b>entre parenthèses</b> si elle est négative, puis on respecte les priorités : d\'abord les puissances, puis les multiplications, enfin les additions et soustractions.<br>' +
                'Exemple : pour $x=-3$, $2x^2-x=2\\times(-3)^2-(-3)=2\\times9+3=21$.';
            return q;
        }
        q.type = 'expr'; q.prefixe = niveau === 2 ? 'A =' : 'P =';
        if (niveau === 2) {
            var c2 = A.entier(1, 4), c1 = A.nonNul(-6, 6), c0 = A.nonNul(-8, 8), d2 = A.nonNul(-4, 4), d1 = A.nonNul(-6, 6), d0 = A.nonNul(-8, 8);
            while (c2 + d2 === 0) d2 = A.nonNul(-4, 4);
            var morceaux = melanger([poly([c2, 0, 0]), poly([c1, 0]), String(c0), poly([d2, 0, 0]), poly([d1, 0]), String(d0)]);
            var txt = morceaux.map(function (m, k) { return k === 0 || m[0] === '-' ? m : '+' + m; }).join('');
            q.forme = 'developpee'; q.consigne = 'Réduire :';
            q.enonce = 'A=' + txt;
            q.attendu = poly([c2 + d2, c1 + d1, c0 + d0]);
            q.explication = 'On regroupe les termes en $x^2$, puis en $x$, puis les nombres : $A=' + poly([c2 + d2, c1 + d1, c0 + d0]) + '$.';
            return q;
        }
        var ctx = A.entier(0, 2), p1, p2;
        if (ctx === 0) {
            p1 = A.entier(2, 9);
            q.texte = 'La longueur d\'un rectangle mesure $' + p1 + '$ cm de plus que sa largeur $x$ (en cm). Exprimer le périmètre $P$ du rectangle en fonction de $x$.';
            q.attendu = '4x+' + 2 * p1; q.prefixe = 'P =';
            q.explication = 'Longueur : $x+' + p1 + '$. $P=2\\times(x+x+' + p1 + ')=2(2x+' + p1 + ')=4x+' + (2 * p1) + '$.';
        } else if (ctx === 1) {
            p1 = A.entier(3, 8); p2 = A.choix([2, 1.5, 2.5, 3]);
            q.texte = 'Un taxi fait payer $' + p1 + '$ € de prise en charge, puis $' + fr(p2) + '$ € par kilomètre. Exprimer le prix $P$ (en €) d\'une course de $x$ km en fonction de $x$.';
            q.attendu = String(p2) + 'x+' + p1; q.prefixe = 'P =';
            q.explication = '$x$ km coûtent $' + fr(p2) + '\\times x$ €, auxquels on ajoute la prise en charge : $P=' + fr(p2) + 'x+' + p1 + '$.';
        } else {
            p1 = A.choix([10, 15, 20, 25]); p2 = A.choix([3, 4, 5, 6]);
            q.texte = 'Une salle de sport coûte $' + p1 + '$ € d\'abonnement par mois, plus $' + p2 + '$ € par séance. Exprimer le prix $P$ payé en un an (12 mois) pour $x$ séances en fonction de $x$.';
            q.attendu = p2 + 'x+' + (12 * p1); q.prefixe = 'P =';
            q.explication = 'Abonnement sur un an : $12\\times' + p1 + '=' + (12 * p1) + '$ €. Séances : $' + p2 + 'x$ €. Donc $P=' + p2 + 'x+' + (12 * p1) + '$.';
        }
        return q;
    };

    /* ---------- Coefficient directeur à partir de deux points (automatisme 24) ---------- */
    function pt(nom, x, y) { return nom + '(' + fr(x) + '\\ ;\\ ' + fr(y) + ')'; }
    AutoP.coefDirecteur = function (niveau) {
        var q = { niveau: niveau, objectif: 'Droites · Coefficient directeur à partir de deux points' }, x1, y1, x2, y2, m;
        if (niveau === 1) {
            do { x1 = A.entier(-3, 4); x2 = x1 + A.entier(1, 4); m = A.nonNul(-4, 4); y1 = A.entier(-5, 5); y2 = y1 + m * (x2 - x1); } while (Math.abs(y2) > 12 || x2 - x1 === 1 && Math.random() < 0.5);
            q.texte = 'Le coefficient directeur de la droite $(AB)$, avec $' + pt('A', x1, y1) + '$ et $' + pt('B', x2, y2) + '$, est :';
            q.explication = '$m=' + frac('y_B-y_A', 'x_B-x_A') + '=' + frac(y2 + '-' + par(y1), x2 + '-' + par(x1)) + '=' + frac(y2 - y1, x2 - x1) + '=' + m + '$.';
            q.rappel = 'Le coefficient directeur de la droite $(AB)$ est $m=' + frac('y_B-y_A', 'x_B-x_A') + '$ : différence des <b>ordonnées</b> en haut, des <b>abscisses</b> en bas.<br>Exemple : $A(1\\ ;\\ 2)$ et $B(3\\ ;\\ 8)$ : $m=' + frac('8-2', '3-1') + '=' + frac(6, 2) + '=3$.';
            return qcm(q, '$' + m + '$', ['$' + texR(R(x2 - x1, y2 - y1)) + '$', '$' + (-m) + '$', '$' + texR(R(y2 + y1, x2 + x1 || 1)) + '$', '$' + (y2 - y1) + '$']);
        }
        q.type = 'nombre'; q.irreductible = true;
        if (niveau === 2) {
            var s;
            do { x1 = A.entier(-6, 5); x2 = A.entier(-6, 6); y1 = A.entier(-8, 8); y2 = A.entier(-8, 8); } while (x1 === x2 || y1 === y2 || (s = R(y2 - y1, x2 - x1)).d > 6);
            q.texte = 'Calculer le coefficient directeur de la droite $(AB)$, avec $' + pt('A', x1, y1) + '$ et $' + pt('B', x2, y2) + '$ (si besoin, sous la forme d\'une fraction irréductible).';
            q.prefixe = 'm=';
            q.attendu = val(s);
            q.explication = '$m=' + frac('y_B-y_A', 'x_B-x_A') + '=' + frac(y2 + '-' + par(y1), x2 + '-' + par(x1)) + '=' + frac(y2 - y1, x2 - x1) + (s.n !== y2 - y1 || s.d !== x2 - x1 ? '=' + texR(s) : '') + '$.';
            return q;
        }
        if (Math.random() < 0.5) {
            var s3;
            do { x1 = A.entier(-4, 4); x2 = A.entier(-4, 8); y1 = A.entier(-9, 9); y2 = A.entier(-9, 9); } while (x1 === x2 || y1 === y2 || (s3 = R(y2 - y1, x2 - x1)).d > 5);
            q.texte = 'Une fonction affine $f$ vérifie $f(' + x1 + ')=' + y1 + '$ et $f(' + x2 + ')=' + y2 + '$. Quel est le coefficient directeur de sa droite représentative (si besoin, sous la forme d\'une fraction irréductible) ?';
            q.prefixe = 'm=';
            q.attendu = val(s3);
            q.explication = 'La droite passe par les points $(' + x1 + '\\ ;\\ ' + y1 + ')$ et $(' + x2 + '\\ ;\\ ' + y2 + ')$ : $m=' + frac('f(' + x2 + ')-f(' + x1 + ')', x2 + '-' + par(x1)) + '=' + frac(y2 + '-' + par(y1), x2 - x1) + '=' + texR(s3) + '$.';
            return q;
        }
        do { x1 = A.entier(-3, 3); y1 = A.entier(-5, 5); m = A.nonNul(-4, 4); x2 = x1 + A.nonNul(-4, 5); } while (x2 === x1);
        q.texte = 'La droite $(d)$ passe par $' + pt('A', x1, y1) + '$ et a pour coefficient directeur $' + m + '$. Le point $B$ de $(d)$ a pour abscisse $' + x2 + '$. Quelle est son ordonnée ?';
        q.prefixe = 'y_B=';
        q.attendu = y1 + m * (x2 - x1);
        q.explication = 'Quand $x$ augmente de $1$, $y$ varie de $' + m + '$. De $A$ à $B$, $x$ varie de $' + (x2 - x1) + '$, donc $y$ varie de $' + m + '\\times' + par(x2 - x1) + '=' + m * (x2 - x1) + '$ : $y_B=' + y1 + terme(m * (x2 - x1)) + '=' + q.attendu + '$.';
        return q;
    };

    /* ---------- Probabilités (automatisme 32) ---------- */
    AutoP.probabilites = function (niveau) {
        var q = { niveau: niveau, objectif: 'Probabilités · Équiprobabilité, événement contraire' };
        q.type = 'nombre'; q.prefixe = 'p=';
        if (niveau === 1) {
            var r = A.entier(2, 9), b = A.entier(1, 8), v = A.entier(1, 6), N = r + b + v, coul = A.choix([['rouge', r], ['bleue', b], ['verte', v]]);
            q.irreductible = true;
            q.texte = 'Une urne contient $' + r + '$ boules rouges, $' + b + '$ bleues et $' + v + '$ vertes, indiscernables au toucher. On tire une boule au hasard. Quelle est la probabilité qu\'elle soit ' + coul[0] + ' ? (fraction irréductible)';
            q.attendu = coul[1] / N;
            q.explication = 'Il y a $' + r + '+' + b + '+' + v + '=' + N + '$ boules, toutes ont la même chance d\'être tirées, dont $' + coul[1] + '$ ' + coul[0] + 's : $p=' + frac(coul[1], N) + (R(coul[1], N).d !== N ? '=' + texR(R(coul[1], N)) : '') + '$.';
            q.rappel = 'Quand toutes les issues ont la même probabilité (équiprobabilité) : $P(A)=' + frac('\\text{nombre d\'issues favorables à }A', '\\text{nombre total d\'issues}') + '$.<br>Exemple : $3$ rouges et $5$ bleues : $P(\\text{rouge})=' + frac(3, 8) + '$.';
            return q;
        }
        if (niveau === 2) {
            if (Math.random() < 0.5) {
                var p = A.choix([0.35, 0.12, 0.4, 0.08, 0.65, 0.27, 0.7, 0.155]);
                q.texte = 'Un événement $A$ a pour probabilité $P(A)=' + fr(p) + '$. Quelle est la probabilité de l\'événement contraire $\\overline{A}$ ?';
                q.attendu = arrondi(1 - p);
                q.prefixe = 'P(\\overline{A})=';
                q.explication = '$P(\\overline{A})=1-P(A)=1-' + fr(p) + '=' + fr(1 - p) + '$.';
                return q;
            }
            var D = A.choix([['un nombre pair', [2, 4, 6]], ['un nombre premier', [2, 3, 5]], ['un multiple de 3', [3, 6]], ['au moins 5', [5, 6]], ['un diviseur de 6', [1, 2, 3, 6]], ['un nombre supérieur ou égal à 2', [2, 3, 4, 5, 6]]]);
            q.irreductible = true;
            q.texte = 'On lance un dé équilibré à six faces numérotées de $1$ à $6$. Quelle est la probabilité d\'obtenir ' + D[0] + ' ? (fraction irréductible)';
            q.attendu = D[1].length / 6;
            q.explication = 'Issues favorables : $' + D[1].join('\\ ;\\ ') + '$, soit $' + D[1].length + '$ issues sur $6$ : $p=' + frac(D[1].length, 6) + (R(D[1].length, 6).d !== 6 ? '=' + texR(R(D[1].length, 6)) : '') + '$.';
            return q;
        }
        // jeu de 32 cartes
        var E = A.choix([
            ['un roi ou un cœur', 11, 'Il y a $4$ rois et $8$ cœurs, mais le roi de cœur est compté deux fois : $4+8-1=11$ cartes.'],
            ['un as ou un pique', 11, 'Il y a $4$ as et $8$ piques, mais l\'as de pique est compté deux fois : $4+8-1=11$ cartes.'],
            ['une figure (valet, dame ou roi)', 12, 'Il y a $3$ figures par couleur et $4$ couleurs : $12$ cartes.'],
            ['une carte rouge qui n\'est pas une figure', 10, 'Il y a $16$ cartes rouges, dont $6$ figures : $16-6=10$ cartes.'],
            ['une carte qui n\'est ni un cœur ni un roi', 21, 'Cœur ou roi : $8+4-1=11$ cartes ; l\'événement contraire en compte $32-11=21$.'],
            ['une dame noire', 2, 'Il y a $2$ dames noires (pique et trèfle).']
        ]);
        q.irreductible = true;
        q.texte = 'On tire une carte au hasard dans un jeu de $32$ cartes (4 couleurs : cœur, carreau, pique, trèfle ; 8 cartes par couleur : 7, 8, 9, 10, valet, dame, roi, as). Quelle est la probabilité de tirer ' + E[0] + ' ? (fraction irréductible)';
        q.attendu = E[1] / 32;
        q.explication = E[2] + ' $p=' + frac(E[1], 32) + (R(E[1], 32).d !== 32 ? '=' + texR(R(E[1], 32)) : '') + '$.';
        return q;
    };

    /* ---------- Évolutions successives (automatisme 5) ---------- */
    function cmTex(t) { return fr(arrondi(1 + t / 100)); }
    function evol(t) { return (t > 0 ? 'une hausse' : 'une baisse') + ' de $' + pct(Math.abs(t)) + '$'; }
    AutoP.evolutionsSuccessives = function (niveau) {
        var q = { niveau: niveau, objectif: 'Évolutions · Taux d\'évolution global' }, t1, t2, g;
        if (niveau === 1) {
            do { t1 = A.choix([10, 20, 50, -10, -20, -50]); t2 = A.choix([10, 20, 50, -10, -20, -50, 100]); g = arrondi(((1 + t1 / 100) * (1 + t2 / 100) - 1) * 100); } while (t1 + t2 === g);
            q.texte = 'Un prix subit ' + evol(t1) + ', puis ' + evol(t2) + '. Globalement, le prix a subi :';
            q.explication = '$CM_{\\text{global}}=' + cmTex(t1) + '\\times' + cmTex(t2) + '=' + cmTex(g) + '$, soit ' + (g === 0 ? 'aucune évolution' : evol(g)) + '.<br><i>On n\'additionne pas les taux : on multiplie les coefficients multiplicateurs.</i>';
            q.rappel = 'Pour des évolutions successives, on <b>multiplie</b> les coefficients multiplicateurs : $CM_{\\text{global}}=CM_1\\times CM_2$.<br>Exemple : $+10\\,\\%$ puis $+10\\,\\%$ : $1{,}1\\times1{,}1=1{,}21$, soit une hausse de $21\\,\\%$ (et non $20\\,\\%$).';
            function f(t) { return t === 0 ? 'aucune évolution' : evol(t); }
            return qcm(q, f(g), [f(t1 + t2), f(arrondi(t1 * t2 / 100)), f(-g), f(arrondi(g + (g > 0 ? 10 : -10)))]);
        }
        q.type = 'champs'; q.gabarit = '[] $\\,\\%$';
        if (niveau === 2) {
            do { t1 = A.choix([5, 10, 15, 20, 25, 30, 40, -5, -10, -20, -25, -30, -40]); t2 = A.choix([5, 10, 20, 30, 50, -10, -20, -30, -40, -50]); g = arrondi(((1 + t1 / 100) * (1 + t2 / 100) - 1) * 100); } while (!decimalesOk(g, 1) || t1 === -t2 && Math.random() < 0.5);
            q.texte = 'Le nombre d\'adhérents d\'une association connaît ' + evol(t1) + ' la première année, puis ' + evol(t2) + ' la deuxième année. Quel est le taux d\'évolution global sur les deux ans ? (Pour une baisse, mettre un signe « − ».)';
            q.attendus = [g];
            q.explication = '$CM=' + cmTex(t1) + '\\times' + cmTex(t2) + '=' + cmTex(g) + '=1' + (g >= 0 ? '+' : '-') + fr(Math.abs(g / 100)) + '$ : taux global $' + signeTaux(g) + '\\,\\%$.';
            return q;
        }
        var t;
        do { t1 = A.choix([20, 25, 50, -20, -50, 60, -40]); t = A.choix([-10, -20, -25, 10, 20, -50, 50, -40]); g = arrondi(((1 + t1 / 100) * (1 + t / 100) - 1) * 100); } while (!decimalesOk(g, 0) || g === 0 || t === t1);
        q.texte = 'Un prix subit ' + evol(t1) + ', puis une deuxième évolution. Globalement, il a subi ' + evol(g) + '. Quel est le taux de la deuxième évolution ? (Pour une baisse, mettre un signe « − ».)';
        q.attendus = [t];
        q.explication = '$' + cmTex(t1) + '\\times CM_2=' + cmTex(g) + '$, donc $CM_2=' + frac(cmTex(g), cmTex(t1)) + '=' + cmTex(t) + '$ : c\'est ' + evol(t) + '.';
        return q;
    };

    /* ---------- Comparer, encadrer, ranger (automatisme 7) ---------- */
    AutoP.comparerNombres = function (niveau) {
        var q = { niveau: niveau, objectif: 'Nombres · Comparer, encadrer, ranger' };
        if (niveau === 1) {
            var n = A.entier(0, 3), d1 = A.entier(2, 8), vals = [n + d1 / 10, n + (d1 - 1) / 10 + A.entier(50, 99) / 1000, n + d1 / 100, n + (d1 - 1) / 10 + A.entier(1, 9) / 100].map(arrondi);
            if (new Set(vals).size < 4) return AutoP.comparerNombres(1);
            var max = Math.max.apply(null, vals);
            q.texte = 'Quel est le plus grand de ces nombres ?';
            q.explication = 'On compare chiffre par chiffre, en écrivant les nombres avec le même nombre de décimales : ' + trie(vals).map(function (x) { return '$' + x.toFixed(3).replace('.', '{,}') + '$'; }).join(' $<$ ') + '.';
            q.rappel = 'Pour comparer deux décimaux, on compare d\'abord les parties entières, puis les dixièmes, puis les centièmes… On peut ajouter des zéros à la fin : $0{,}7=0{,}700$.<br>Exemple : $0{,}7>0{,}689$ car $7$ dixièmes $>6$ dixièmes. Le nombre de chiffres ne compte pas !';
            return qcm(q, '$' + fr(max) + '$', vals.filter(function (x) { return x !== max; }).map(function (x) { return '$' + fr(x) + '$'; }));
        }
        if (niveau === 2) {
            var L = 'ABCD', cand, ok;
            do {
                var base = A.choix([0.2, 0.3, 0.4, 0.6, 0.7]);
                cand = melanger([
                    { v: base, t: '$' + pct(arrondi(base * 100)) + '$' },
                    { v: arrondi(base + 0.05), t: '$' + fr(arrondi(base + 0.05)) + '$' },
                    { v: A.choix([1 / 4, 3 / 8, 1 / 3, 2 / 3, 3 / 4, 1 / 5, 2 / 5, 3 / 5]), t: null },
                    { v: arrondi(base - 0.02), t: '$' + fr(arrondi((base - 0.02) * 10)) + '\\times10^{-1}$' }
                ]);
                cand.forEach(function (c) {
                    if (!c.t) { var F = [[1, 4], [3, 8], [1, 3], [2, 3], [3, 4], [1, 5], [2, 5], [3, 5]].filter(function (f) { return Math.abs(f[0] / f[1] - c.v) < 1e-9; })[0]; c.t = '$' + frac(F[0], F[1]) + '$'; }
                });
                var vs = cand.map(function (c) { return c.v; }).sort(function (u, w) { return u - w; });
                ok = vs.every(function (x, i) { return i === 0 || x - vs[i - 1] > 0.004; });
            } while (!ok);
            q.type = 'ordre';
            q.texte = 'Ranger dans l\'ordre croissant (écris les lettres, du plus petit au plus grand) :<br>' + cand.map(function (c, k) { return '<b>' + L[k] + '</b> : ' + c.t; }).join(' &nbsp; ');
            var ordre = cand.map(function (c, k) { return { v: c.v, l: L[k], t: c.t }; }).sort(function (u, w) { return u.v - w.v; });
            q.attendu = ordre.map(function (o) { return o.l; }).join('');
            q.explication = 'En écriture décimale : ' + ordre.map(function (o) { return o.t + ' $\\approx' + fr(arrondi(Math.round(o.v * 1000) / 1000)) + '$'; }).join(' ; ') + '.<br>Donc <b>' + q.attendu + '</b>.';
            return q;
        }
        q.type = 'champs';
        if (Math.random() < 0.5) {
            var nn;
            do { nn = A.entier(2, 150); } while (rapide(Math.sqrt(nn)));
            var e = Math.floor(Math.sqrt(nn));
            q.texte = 'Encadrer $\\sqrt{' + nn + '}$ par deux entiers consécutifs.';
            q.gabarit = '[] $<\\sqrt{' + nn + '}<$ []';
            q.attendus = [e, e + 1];
            q.explication = '$' + e + '^2=' + e * e + '$ et $' + (e + 1) + '^2=' + (e + 1) * (e + 1) + '$. Comme $' + e * e + '<' + nn + '<' + (e + 1) * (e + 1) + '$, on a $' + e + '<\\sqrt{' + nn + '}<' + (e + 1) + '$.';
            return q;
        }
        var a, b, x;
        do { b = A.choix([3, 6, 7, 9, 11, 12]); a = A.entier(b + 1, 5 * b); x = a / b; } while (decimalesOk(x, 1) || pgcd(a, b) !== 1);
        var lo = Math.floor(x * 10) / 10;
        q.texte = 'Encadrer $' + frac(a, b) + '$ par deux nombres décimaux à un chiffre après la virgule, qui se suivent (au dixième près).';
        q.gabarit = '[] $<' + frac(a, b) + '<$ []';
        q.attendus = [arrondi(lo), arrondi(lo + 0.1)];
        q.explication = 'On pose la division : $' + a + '\\div' + b + '\\approx' + fr(Math.floor(x * 1000) / 1000) + '\\ldots$ Donc $' + fr(lo) + '<' + frac(a, b) + '<' + fr(arrondi(lo + 0.1)) + '$.';
        return q;
    };

    /* ---------- Factoriser (automatisme 15) ---------- */
    AutoP.factoriser = function (niveau) {
        var q = { niveau: niveau, objectif: 'Calcul littéral · Factoriser' }, k, a, b, g;
        if (niveau === 1) {
            k = A.entier(2, 9); b = A.nonNul(-9, 9); a = A.choix([1, 1, 2, 3]);
            if (pgcd(a, b) !== 1) b = b > 0 ? 1 : -1;
            q.texte = 'Une forme factorisée de $' + poly([k * a, k * b]) + '$ est :';
            q.explication = '$' + (k * a) + 'x=' + k + '\\times' + poly([a, 0]) + '$ et $' + Math.abs(k * b) + '=' + k + '\\times' + Math.abs(b) + '$ : le facteur commun est $' + k + '$, donc $' + poly([k * a, k * b]) + '=' + k + '(' + poly([a, b]) + ')$.';
            q.rappel = 'Factoriser, c\'est écrire une somme sous forme de <b>produit</b>. On cherche un facteur commun à tous les termes : $ka+kb=k(a+b)$.<br>Exemple : $6x+15=3\\times2x+3\\times5=3(2x+5)$. On vérifie en développant.';
            return qcm(q, '$' + k + '(' + poly([a, b]) + ')$', ['$' + k + '(' + poly([a, k * b]) + ')$', '$' + k + '(' + poly([k * a, b]) + ')$', '$' + poly([k * a + k * b, 0]) + '$', '$' + k + 'x(' + poly([a, b]) + ')$']);
        }
        q.type = 'expr'; q.forme = 'factorisee'; q.consigne = 'Factoriser :'; q.prefixe = 'A =';
        if (niveau === 2) {
            do { g = A.entier(1, 5); a = A.entier(1, 6); b = A.nonNul(-7, 7); } while (pgcd(a, b) !== 1 || g * a === 1);
            q.enonce = 'A=' + poly([g * a, g * b, 0]);
            q.attendu = (g === 1 ? '' : g) + 'x(' + poly([a, b]) + ')';
            q.facteur = poly([a, b]);
            q.explication = '$' + poly([g * a, 0, 0]) + '=' + (g === 1 ? '' : g) + 'x\\times' + poly([a, 0]) + '$ et $' + poly([g * b, 0]) + '=' + (g === 1 ? '' : g) + 'x\\times' + par(b) + '$ : le facteur commun est $' + (g === 1 ? '' : g) + 'x$. Donc $A=' + q.attendu + '$.';
            return q;
        }
        if (Math.random() < 0.5) {
            do { a = A.entier(1, 3); b = A.entier(1, 9); } while (pgcd(a, b) !== 1);
            q.enonce = 'A=' + poly([a * a, 0, -b * b]);
            q.attendu = '(' + poly([a, -b]) + ')(' + poly([a, b]) + ')';
            q.facteur = poly([a, b]);
            q.explication = '$A=' + (a === 1 ? 'x' : '(' + a + 'x)') + '^2-' + b + '^2$ : identité $a^2-b^2=(a-b)(a+b)$, donc $A=' + q.attendu + '$.';
            return q;
        }
        var c, kk;
        do { a = A.nonNul(-6, 6); c = A.nonNul(-6, 6); kk = A.nonNul(-5, 5); } while (c + kk === 0 || a === c || a === c + kk);
        var pa = '(' + poly([1, a]) + ')';
        q.enonce = 'A=' + pa + '(' + poly([1, c]) + ')' + (kk > 0 ? '+' : '') + kk + pa;
        q.attendu = pa + '(' + poly([1, c + kk]) + ')';
        q.facteur = poly([1, c + kk]);
        q.explication = 'Le facteur commun est $' + pa + '$ : $A=' + pa + '\\big[(' + poly([1, c]) + ')' + (kk > 0 ? '+' : '') + kk + '\\big]=' + pa + '(' + poly([1, c + kk]) + ')$.';
        return q;
    };

    /* ---------- Un point appartient-il à une courbe ? (automatisme 23) ---------- */
    AutoP.pointCourbe = function (niveau) {
        var q = { niveau: niveau, objectif: 'Fonctions · Un point appartient-il à une courbe ?' }, a, b, c, x, y;
        if (niveau === 1) {
            a = A.nonNul(-5, 5); b = A.nonNul(-8, 8); x = A.nonNul(-5, 5);
            var oui = Math.random() < 0.5, img = a * x + b;
            y = oui ? img : img + A.choix([-2, -1, 1, 2]);
            if (!oui && Math.random() < 0.5) y = a * x - b;
            if (y === img) oui = true;
            q.texte = 'Soit $f(x)=' + poly([a, b]) + '$ et $\\mathcal{C}_f$ sa courbe représentative. Le point $' + pt('A', x, y) + '$ appartient-il à $\\mathcal{C}_f$ ?';
            q.explication = '$f(' + x + ')=' + a + '\\times' + par(x) + terme(b) + '=' + img + '$. ' + (oui ? 'C\'est bien l\'ordonnée de $A$ : $A\\in\\mathcal{C}_f$.' : 'Ce n\'est pas l\'ordonnée de $A$ ($' + y + '$) : $A\\notin\\mathcal{C}_f$.');
            q.rappel = 'Le point $M(a\\ ;\\ b)$ appartient à la courbe de $f$ si et seulement si $f(a)=b$. On calcule l\'image de l\'<b>abscisse</b> et on compare avec l\'<b>ordonnée</b>.<br>Exemple : $f(x)=2x+1$ ; $f(3)=7$, donc $(3\\ ;\\ 7)$ est sur la courbe, mais pas $(3\\ ;\\ 8)$.';
            q.type = 'qcm'; q.options = ['Oui', 'Non']; q.bonne = oui ? 0 : 1;
            return q;
        }
        if (niveau === 2) {
            a = A.choix([1, -1, 2]); b = A.entier(-4, 4); c = A.entier(-6, 6);
            var f = function (t) { return a * t * t + b * t + c; }, xs = melanger([-3, -2, -1, 1, 2, 3]).slice(0, 4), bonne = xs[0];
            var pts = xs.map(function (t, k) { var yy = k === 0 ? f(t) : (k === 1 ? f(-t) === f(t) ? f(t) + 2 : f(-t) : f(t) + A.choix([-3, -1, 1, 3])); return pt('', t, yy).replace(/^\(/, '('); });
            q.texte = 'Soit $f(x)=' + poly([a, b, c]) + '$. Lequel de ces points appartient à la courbe représentative de $f$ ?';
            q.explication = '$f(' + bonne + ')=' + (a === 1 ? '' : a === -1 ? '-' : a + '\\times') + par(bonne) + '^2' + (b ? terme(b) + '\\times' + par(bonne) : '') + (c ? terme(c) : '') + '=' + f(bonne) + '$ : le point $(' + bonne + '\\ ;\\ ' + f(bonne) + ')$ est sur la courbe. Pour les autres, l\'image de l\'abscisse n\'est pas l\'ordonnée.';
            return qcm(q, '$' + pts[0] + '$', pts.slice(1).map(function (p) { return '$' + p + '$'; }));
        }
        q.type = 'nombre';
        if (Math.random() < 0.5) {
            var s;
            do { a = A.nonNul(-6, 6); b = A.nonNul(-9, 9); y = A.entier(-12, 12); s = R(y - b, a); } while (Math.abs(a) < 2 || s.d > 1 && Math.random() < 0.5);
            q.irreductible = true;
            q.texte = 'Le point $A(x\\ ;\\ ' + y + ')$ appartient à la droite d\'équation $y=' + poly([a, b]) + '$. Quelle est son abscisse $x$ ? (si besoin, fraction irréductible)';
            q.prefixe = 'x=';
            q.attendu = val(s);
            q.correction = [poly([a, b]) + '&=' + y, poly([a, 0]) + '&=' + (y - b), 'x&=' + frac(y - b, a) + (s.n !== y - b || s.d !== a ? '=' + texR(s) : '')];
            return q;
        }
        a = A.choix([2, 3, -1, -2]); c = A.entier(-5, 5); x = -A.entier(1, 4);
        q.texte = 'Le point $B(' + x + '\\ ;\\ y)$ appartient à la courbe de la fonction $g(x)=' + poly([a, 0, c]) + '$. Quelle est son ordonnée $y$ ?';
        q.prefixe = 'y=';
        q.attendu = a * x * x + c;
        q.explication = '$y=g(' + x + ')=' + (a === -1 ? '-' : a + '\\times') + par(x) + '^2' + (c ? terme(c) : '') + '=' + (a === -1 ? '-' : a + '\\times') + (x * x) + (c ? terme(c) : '') + '=' + q.attendu + '$.';
        return q;
    };

    /* ---------- Repérage : milieu, distance (automatisme 36) ---------- */
    AutoP.reperage = function (niveau) {
        var q = { niveau: niveau, objectif: 'Géométrie · Coordonnées, milieu, distance' }, x1, y1, x2, y2;
        q.type = 'champs';
        if (niveau === 1) {
            do { x1 = A.entier(-6, 6); y1 = A.entier(-6, 6); x2 = A.entier(-6, 8); y2 = A.entier(-6, 8); } while (x1 === x2 || y1 === y2 || (x1 + x2) % 2 && Math.random() < 0.6);
            q.texte = 'Soit $' + pt('A', x1, y1) + '$ et $' + pt('B', x2, y2) + '$. Quelles sont les coordonnées du milieu $I$ du segment $[AB]$ ?';
            q.gabarit = '$I\\big($ [] $;$ [] $\\big)$';
            q.attendus = [(x1 + x2) / 2, (y1 + y2) / 2];
            q.explication = '$x_I=' + frac('x_A+x_B', 2) + '=' + frac(x1 + terme(x2), 2) + '=' + fr((x1 + x2) / 2) + '$ et $y_I=' + frac('y_A+y_B', 2) + '=' + frac(y1 + terme(y2), 2) + '=' + fr((y1 + y2) / 2) + '$.';
            q.rappel = 'Le milieu $I$ de $[AB]$ a pour coordonnées la <b>moyenne</b> des coordonnées : $x_I=' + frac('x_A+x_B', 2) + '$ et $y_I=' + frac('y_A+y_B', 2) + '$.<br>Exemple : $A(1\\ ;\\ 4)$, $B(5\\ ;\\ -2)$ : $I(3\\ ;\\ 1)$.';
            return q;
        }
        if (niveau === 2) {
            var T = A.choix([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [4, 3, 5], [12, 5, 13], [8, 15, 17]]);
            x1 = A.entier(-5, 3); y1 = A.entier(-5, 3); x2 = x1 + T[0] * A.signe(); y2 = y1 + T[1] * A.signe();
            q.type = 'nombre'; q.prefixe = 'AB=';
            q.texte = 'Dans un repère orthonormé, soit $' + pt('A', x1, y1) + '$ et $' + pt('B', x2, y2) + '$. Calculer la distance $AB$.';
            q.attendu = T[2];
            q.explication = '$AB=\\sqrt{(x_B-x_A)^2+(y_B-y_A)^2}=\\sqrt{(' + x2 + '-' + par(x1) + ')^2+(' + y2 + '-' + par(y1) + ')^2}=\\sqrt{' + par(x2 - x1) + '^2+' + par(y2 - y1) + '^2}=\\sqrt{' + (T[0] * T[0]) + '+' + (T[1] * T[1]) + '}=\\sqrt{' + T[2] * T[2] + '}=' + T[2] + '$.';
            return q;
        }
        do { x1 = A.entier(-5, 5); y1 = A.entier(-5, 5); x2 = A.entier(-4, 4); y2 = A.entier(-4, 4); } while (x1 === x2 && y1 === y2);
        // I(x2 ; y2) milieu de [AB], A(x1 ; y1) : B = 2I - A
        q.texte = 'Le point $' + pt('I', x2, y2) + '$ est le milieu du segment $[AB]$, avec $' + pt('A', x1, y1) + '$. Quelles sont les coordonnées de $B$ ?';
        q.gabarit = '$B\\big($ [] $;$ [] $\\big)$';
        q.attendus = [2 * x2 - x1, 2 * y2 - y1];
        q.explication = '$' + frac(x1 + '+x_B', 2) + '=' + x2 + '$ donne $x_B=2\\times' + par(x2) + '-' + par(x1) + '=' + (2 * x2 - x1) + '$ ; de même $y_B=2\\times' + par(y2) + '-' + par(y1) + '=' + (2 * y2 - y1) + '$.<br><i>On peut aussi « continuer le chemin » : de $A$ à $I$, puis autant de $I$ à $B$.</i>';
        return q;
    };

    /* ---------- Taux d'évolution réciproque (automatisme 6) ---------- */
    var RECIPROQUES = [[25, -20], [-20, 25], [100, -50], [-50, 100], [-75, 300], [300, -75], [150, -60], [-60, 150], [60, -37.5], [-37.5, 60], [400, -80], [-80, 400], [-25, 1 / 3]];
    AutoP.tauxReciproque = function (niveau) {
        var q = { niveau: niveau, objectif: 'Évolutions · Taux d\'évolution réciproque' }, c;
        if (niveau === 1) {
            c = A.choix([[25, -20], [-20, 25], [100, -50], [-50, 100]]);
            q.texte = 'Un prix subit ' + evol(c[0]) + '. Pour qu\'il revienne à sa valeur de départ, il doit subir :';
            q.explication = '$CM=' + cmTex(c[0]) + '$. Le coefficient réciproque est $' + frac(1, cmTex(c[0])) + '=' + cmTex(c[1]) + '$ : c\'est ' + evol(c[1]) + '.<br><i>Ce n\'est pas ' + evol(-c[0]) + ' : le pourcentage ne porte pas sur la même valeur.</i>';
            q.rappel = 'Si une évolution a pour coefficient multiplicateur $CM$, l\'évolution réciproque (qui fait revenir à la valeur de départ) a pour coefficient $' + frac(1, 'CM') + '$.<br>Exemple : $+25\\,\\%$ : $CM=1{,}25$ ; $' + frac(1, '1{,}25') + '=0{,}8$, soit une baisse de $20\\,\\%$.';
            var PIEGES = { '25': [-25, 20, -75], '-20': [20, -25, 80], '100': [-100, 50, -25], '-50': [50, -100, 200] };
            return qcm(q, evol(c[1]), PIEGES[String(c[0])].map(evol));
        }
        q.type = 'champs';
        if (niveau === 2) {
            c = A.choix(RECIPROQUES.slice(0, 12));
            q.texte = 'Le nombre de visiteurs d\'un site connaît ' + evol(c[0]) + '. Quel taux d\'évolution le ramènerait à sa valeur de départ ? (Pour une baisse, mettre un signe « − ».)';
            q.gabarit = '[] $\\,\\%$';
            q.attendus = [c[1]];
            q.explication = '$CM=' + cmTex(c[0]) + '$ ; $' + frac(1, cmTex(c[0])) + '=' + cmTex(c[1]) + '=1' + (c[1] > 0 ? '+' : '-') + fr(Math.abs(c[1] / 100)) + '$ : taux réciproque $' + signeTaux(c[1]) + '\\,\\%$.';
            return q;
        }
        var V;
        do { c = A.choix(RECIPROQUES.slice(0, 8)); V = A.entier(2, 30) * 20; } while (!rapide(V * (1 + c[0] / 100)) || V * (1 + c[0] / 100) > 2000);
        var Vf = arrondi(V * (1 + c[0] / 100));
        q.texte = 'Après ' + evol(c[0]) + ', un loyer est de $' + fr(Vf) + '$ €. Quel était le loyer de départ, et de quel pourcentage faudrait-il le faire évoluer pour y revenir ? (Pour une baisse, mettre un signe « − ».)';
        q.gabarit = 'loyer de départ : [] € &nbsp; évolution : [] $\\,\\%$';
        q.attendus = [V, c[1]];
        q.explication = 'Loyer de départ : $' + frac(fr(Vf), cmTex(c[0])) + '=' + fr(V) + '$ €.<br>Pour revenir de $' + fr(Vf) + '$ à $' + fr(V) + '$ : $CM=' + frac(fr(V), fr(Vf)) + '=' + cmTex(c[1]) + '$, soit $' + signeTaux(c[1]) + '\\,\\%$.';
        return q;
    };

    /* ---------- Ordre de grandeur (automatisme 11) ---------- */
    function puiss10(e) { return '10^{' + e + '}'; }
    function sci1(v) {                      // v ≈ d × 10^e (un chiffre significatif)
        var e = Math.floor(Math.log10(v)), d = Math.round(v / Math.pow(10, e));
        if (d === 10) { d = 1; e++; }
        return { d: d, e: e };
    }
    function texSci(s) { return (s.d === 1 ? '' : s.d + '\\times') + puiss10(s.e); }
    AutoP.ordreGrandeur = function (niveau) {
        var q = { niveau: niveau, objectif: 'Nombres · Ordre de grandeur' }, a, b, v, s;
        if (niveau === 1) {
            var A1 = A.choix([19.8, 49.7, 31, 98.5, 205, 0.48, 2.03, 9.9, 51]), B1 = A.choix([20.3, 4.9, 101, 0.98, 3.1, 39.6, 199]);
            var ra = sci1(A1), rb = sci1(B1);
            v = ra.d * Math.pow(10, ra.e) * rb.d * Math.pow(10, rb.e);
            s = sci1(v);
            q.texte = 'Sans calculatrice, un ordre de grandeur de $' + fr(A1) + '\\times' + fr(B1) + '$ est :';
            q.explication = '$' + fr(A1) + '\\approx' + fr(ra.d * Math.pow(10, ra.e)) + '$ et $' + fr(B1) + '\\approx' + fr(rb.d * Math.pow(10, rb.e)) + '$, donc le produit est proche de $' + fr(ra.d * Math.pow(10, ra.e)) + '\\times' + fr(rb.d * Math.pow(10, rb.e)) + '=' + fr(arrondi(v)) + '$.';
            q.rappel = 'Pour trouver un ordre de grandeur, on <b>remplace chaque nombre par une valeur proche et simple</b> (un seul chiffre non nul), puis on calcule de tête.<br>Exemple : $48{,}7\\times21\\approx50\\times20=1\\,000$.';
            return qcm(q, '$' + fr(arrondi(v)) + '$', ['$' + fr(arrondi(v * 10)) + '$', '$' + fr(arrondi(v / 10)) + '$', '$' + fr(arrondi(v * 100)) + '$', '$' + fr(arrondi(v / 100)) + '$']);
        }
        if (niveau === 2) {
            var x = A.choix([3.9, 4.1, 2.02, 5.8, 7.9, 1.96, 6.1]), p = A.entier(3, 8), y = A.choix([1.98, 2.1, 4.05, 3.02, 0.49, 0.51]), r = A.entier(-5, 3);
            if (p + r === 0 || p + r === 1) r -= 3;
            var rx = Math.round(x), ry = y < 1 ? 0.5 : Math.round(y);
            v = rx * ry * Math.pow(10, p + r);
            s = sci1(v);
            q.texte = 'Un ordre de grandeur de $(' + fr(x) + '\\times10^{' + p + '})\\times(' + fr(y) + '\\times10^{' + r + '})$ est :';
            q.explication = '$' + fr(x) + '\\approx' + rx + '$ et $' + fr(y) + '\\approx' + fr(ry) + '$, donc le produit est proche de $' + rx + '\\times' + fr(ry) + '\\times10^{' + p + (r < 0 ? '' : '+') + r + '}=' + fr(rx * ry) + '\\times10^{' + (p + r) + '}=' + texSci(s) + '$.';
            return qcm(q, '$' + texSci(s) + '$', ['$' + texSci({ d: s.d, e: s.e + 1 }) + '$', '$' + texSci({ d: s.d, e: s.e - 1 }) + '$', '$' + texSci({ d: s.d, e: p * r || s.e + 2 }) + '$', '$' + texSci({ d: s.d, e: s.e - 2 }) + '$']);
        }
        var C = A.choix([
            ['Un cœur bat environ $70$ fois par minute. Un ordre de grandeur du nombre de battements en un an est :', 70 * 60 * 24 * 365, '$70\\times60\\times24\\times365\\approx70\\times60\\times25\\times400=42\\,000\\,000$, soit environ $4\\times10^7$.'],
            ['Une personne fait environ $8\\,000$ pas par jour. Un ordre de grandeur du nombre de pas qu\'elle fait en $50$ ans est :', 8000 * 365 * 50, '$8\\,000\\times365\\times50\\approx8\\times10^3\\times400\\times50=160\\,000\\,000$, soit environ $1{,}6\\times10^8$, de l\'ordre de $10^8$.'],
            ['Une vie de $80$ ans dure environ combien de secondes ?', 80 * 365 * 24 * 3600, '$80\\times365\\times24\\times3\\,600\\approx80\\times400\\times25\\times4\\,000=3{,}2\\times10^9$, soit environ $3\\times10^9$.'],
            ['Un robinet qui fuit perd environ $1$ goutte ($0{,}05$ mL) par seconde. Un ordre de grandeur du volume perdu en un an, en litres, est :', 0.05 * 3600 * 24 * 365 / 1000, '$0{,}05\\times3\\,600\\times24\\times365\\approx0{,}05\\times3\\,600\\times25\\times400=1\\,800\\,000$ mL, soit environ $2\\times10^3$ L.'],
            ['La France compte environ $68$ millions d\'habitants, qui boivent chacun environ $1{,}5$ L d\'eau par jour. Un ordre de grandeur du volume bu en un an, en litres, est :', 68e6 * 1.5 * 365, '$68\\times10^6\\times1{,}5\\times365\\approx70\\times10^6\\times1{,}5\\times400=4{,}2\\times10^{10}$ L, soit environ $4\\times10^{10}$.']
        ]);
        s = sci1(C[1]);
        q.texte = C[0];
        q.explication = C[2];
        return qcm(q, '$' + texSci(s) + '$', ['$' + texSci({ d: s.d, e: s.e + 2 }) + '$', '$' + texSci({ d: s.d, e: s.e - 2 }) + '$', '$' + texSci({ d: s.d, e: s.e + 4 }) + '$', '$' + texSci({ d: s.d, e: s.e - 3 }) + '$']);
    };

    /* ---------- Isoler une variable dans une formule (automatisme 20) ---------- */
    AutoP.isolerVariable = function (niveau) {
        var q = { niveau: niveau, objectif: 'Calcul littéral · Isoler une variable dans une formule' }, F;
        if (niveau === 1) {
            F = A.choix([
                ['U=R\\times I', 'I', 'I=' + frac('U', 'R'), ['I=' + frac('R', 'U'), 'I=U\\times R', 'I=U-R'], 'la tension $U$, la résistance $R$ et l\'intensité $I$'],
                ['d=v\\times t', 't', 't=' + frac('d', 'v'), ['t=' + frac('v', 'd'), 't=d\\times v', 't=d-v'], 'la distance $d$, la vitesse $v$ et la durée $t$'],
                ['P=U\\times I', 'U', 'U=' + frac('P', 'I'), ['U=' + frac('I', 'P'), 'U=P\\times I', 'U=P-I'], 'la puissance $P$, la tension $U$ et l\'intensité $I$'],
                ['m=\\rho\\times V', 'V', 'V=' + frac('m', '\\rho'), ['V=' + frac('\\rho', 'm'), 'V=m\\times\\rho', 'V=m-\\rho'], 'la masse $m$, la masse volumique $\\rho$ et le volume $V$'],
                ['C=' + frac('n', 'V'), 'n', 'n=C\\times V', ['n=' + frac('C', 'V'), 'n=' + frac('V', 'C'), 'n=C+V'], 'la concentration $C$, la quantité de matière $n$ et le volume $V$']
            ]);
            q.texte = 'La formule $' + F[0] + '$ relie ' + F[4] + '. On en déduit :';
            q.explication = 'On divise (ou on multiplie) les deux membres pour que $' + F[1] + '$ soit seul : $' + F[2] + '$.';
            q.rappel = 'On transforme la formule comme une équation dont l\'inconnue est la lettre à isoler : on fait la même opération sur les deux membres.<br>Exemple : $d=v\\times t$ ; on divise par $t$ : $' + frac('d', 't') + '=v$, donc $v=' + frac('d', 't') + '$.';
            return qcm(q, '$' + F[2] + '$', F[3].map(function (t) { return '$' + t + '$'; }));
        }
        if (niveau === 2) {
            F = A.choix([
                ['y=3x+5', 'x', 'x=' + frac('y-5', 3), ['x=' + frac('y', 3) + '-5', 'x=3y-5', 'x=' + frac('y+5', 3)]],
                ['P=2(L+\\ell)', '\\ell', '\\ell=' + frac('P', 2) + '-L', ['\\ell=P-2L', '\\ell=' + frac('P-L', 2), '\\ell=2P-L']],
                ['F=1{,}8C+32', 'C', 'C=' + frac('F-32', '1{,}8'), ['C=' + frac('F', '1{,}8') + '-32', 'C=1{,}8(F-32)', 'C=' + frac('F+32', '1{,}8')]],
                ['E=m\\times g\\times h', 'h', 'h=' + frac('E', 'm\\times g'), ['h=E-m\\times g', 'h=' + frac('m\\times g', 'E'), 'h=E\\times m\\times g']],
                ['v=v_0+a\\times t', 't', 't=' + frac('v-v_0', 'a'), ['t=' + frac('v', 'a') + '-v_0', 't=a(v-v_0)', 't=' + frac('v+v_0', 'a')]]
            ]);
            q.texte = 'On a $' + F[0] + '$. Exprimer $' + F[1] + '$ en fonction des autres lettres :';
            q.explication = 'On isole d\'abord le terme qui contient $' + F[1] + '$ (on enlève ce qui est ajouté), puis on divise : $' + F[2] + '$.';
            return qcm(q, '$' + F[2] + '$', F[3].map(function (t) { return '$' + t + '$'; }));
        }
        F = A.choix([
            ['\\mathcal{A}=' + frac('(B+b)\\times h', 2), 'h', 'h=' + frac('2\\mathcal{A}', 'B+b'), ['h=' + frac('\\mathcal{A}', '2(B+b)'), 'h=2\\mathcal{A}-(B+b)', 'h=' + frac('2\\mathcal{A}', 'B') + '+b'], 'l\'aire d\'un trapèze'],
            ['E_c=' + frac(1, 2) + 'mv^2', 'v', 'v=\\sqrt{' + frac('2E_c', 'm') + '}', ['v=' + frac('2E_c', 'm'), 'v=\\sqrt{' + frac('E_c', '2m') + '}', 'v=' + frac('\\sqrt{E_c}', '2m')], 'l\'énergie cinétique'],
            ['V=\\pi r^2h', 'r', 'r=\\sqrt{' + frac('V', '\\pi h') + '}', ['r=' + frac('V', '\\pi h'), 'r=' + frac('\\sqrt{V}', '\\pi h'), 'r=\\sqrt{V-\\pi h}'], 'le volume d\'un cylindre'],
            ['\\mathcal{A}=' + frac('(B+b)\\times h', 2), 'b', 'b=' + frac('2\\mathcal{A}', 'h') + '-B', ['b=' + frac('2\\mathcal{A}-B', 'h'), 'b=' + frac('\\mathcal{A}', '2h') + '-B', 'b=2\\mathcal{A}-B-h'], 'l\'aire d\'un trapèze'],
            ['P=' + frac('U^2', 'R'), 'U', 'U=\\sqrt{P\\times R}', ['U=' + frac('\\sqrt{P}', 'R'), 'U=P\\times R', 'U=\\sqrt{' + frac('P', 'R') + '}'], 'la puissance électrique']
        ]);
        q.texte = 'La formule $' + F[0] + '$ donne ' + F[4] + '. Exprimer $' + F[1] + '$ en fonction des autres lettres (toutes positives) :';
        q.explication = 'On isole d\'abord le terme qui contient $' + F[1] + '$, puis $' + F[1] + '$ elle-même (racine carrée si elle est au carré) : $' + F[2] + '$.';
        return qcm(q, '$' + F[2] + '$', F[3].map(function (t) { return '$' + t + '$'; }));
    };

    /* ---------- Repère (droites, courbes) — repris des automatismes de Terminale ---------- */
    function repere(o) {                   // o = { xmin, xmax, ymin, ymax, c (px par unité), courbe: [[x, y]…], droite: {m, p}, nom }
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
            var yd = function (x) { return d.m * x + d.p; };
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

    /* ---------- Lire graphiquement l'équation réduite d'une droite (automatisme 25) ---------- */
    function eqDroite(m, p) {               // m : {n, d}
        var mt = m.n === 0 ? '' : (m.d === 1 ? (m.n === 1 ? '' : m.n === -1 ? '-' : String(m.n)) : (m.n < 0 ? '-' : '') + frac(Math.abs(m.n), m.d)) + 'x';
        if (m.n === 0) return 'y=' + p;
        return 'y=' + mt + (p === 0 ? '' : terme(p));
    }
    AutoP.equationDroiteGraph = function (niveau) {
        var q = { niveau: niveau, objectif: 'Droites · Lire graphiquement l\'équation réduite' }, m, p;
        if (niveau === 1) m = R(A.nonNul(-3, 3), 1);
        else if (niveau === 2) m = A.choix([R(1, 2), R(-1, 2), R(2, 1), R(-2, 1), R(3, 1), R(-3, 1), R(3, 2), R(-3, 2), R(0, 1)]);
        else m = A.choix([R(1, 3), R(-1, 3), R(2, 3), R(-2, 3), R(3, 4), R(-3, 4), R(1, 4), R(-1, 4), R(4, 3), R(-4, 3)]);
        p = A.entier(-3, 3);
        q.figure = repere({ xmin: -5, xmax: 5, ymin: -4, ymax: 4, droite: { m: val(m), p: p }, nom: '(d)' });
        q.figureNote = 'droite y = ' + (m.d === 1 ? m.n : m.n + '/' + m.d) + 'x + ' + p;
        q.texte = 'Lire graphiquement l\'équation réduite de la droite $(d)$.';
        q.explication = 'La droite coupe l\'axe des ordonnées en $' + p + '$ : $p=' + p + '$.<br>' + (m.n === 0 ? 'La droite est horizontale : $m=0$.' :
            'En partant d\'un point de la droite, quand on avance de $' + m.d + '$ vers la droite, on ' + (m.n > 0 ? 'monte' : 'descend') + ' de $' + Math.abs(m.n) + '$ : $m=' + texR(m) + '$.') + '<br>Donc $(d)\\ :\\ ' + eqDroite(m, p) + '$.';
        if (niveau === 1) {
            q.rappel = 'Équation réduite : $y=mx+p$.<br>• <b>$p$</b> (ordonnée à l\'origine) : on lit où la droite coupe l\'axe des ordonnées ;<br>• <b>$m$</b> (coefficient directeur) : quand on avance de $1$ vers la droite, de combien la droite monte (m > 0) ou descend (m < 0).';
            return qcm(q, '$' + eqDroite(m, p) + '$', ['$' + eqDroite(R(p === 0 ? 1 : p, 1), m.n) + '$', '$' + eqDroite(R(-m.n, 1), p) + '$', '$' + eqDroite(m, -p) + '$', '$' + eqDroite(R(-m.n, 1), -p) + '$']);
        }
        q.type = 'champs';
        q.gabarit = '$y=$ [] $x+$ []';
        q.attendus = [val(m), p];
        q.explication += '<br><i>Pour une fraction, on peut écrire ' + (m.d > 1 ? m.n + '/' + m.d : '2/3') + '.</i>';
        return q;
    };

    /* ---------- Passer du graphique aux données (automatisme 31) ---------- */
    AutoP.graphiqueDonnees = function (niveau) {
        var q = { niveau: niveau, objectif: 'Statistiques · Passer du graphique aux données' }, p, N, n;
        q.type = 'nombre';
        if (niveau === 1) {
            p = A.choix([10, 20, 25, 50, 75, 30, 40, 5, 15]);
            q.texte = 'Dans un diagramme circulaire, une catégorie représente $' + pct(p) + '$ de l\'effectif total. Quel est l\'angle de son secteur (en degrés) ?';
            q.attendu = 3.6 * p;
            q.prefixe = '\\alpha=';
            q.explication = 'Le disque entier ($360°$) représente $100\\,\\%$ : $' + frac(p, 100) + '\\times360=' + fr(3.6 * p) + '°$.';
            q.rappel = 'Dans un diagramme circulaire, les angles sont <b>proportionnels</b> aux effectifs : le disque entier ($360°$) correspond à $100\\,\\%$ de l\'effectif.<br>Exemple : $25\\,\\%$ donne $0{,}25\\times360=90°$ (un quart de disque).';
            return q;
        }
        if (niveau === 2) {
            do { N = A.choix([20, 24, 30, 36, 40, 45, 60, 72, 90, 120]); n = A.entier(1, N - 1); } while (!rapide(360 * n / N) || n * 2 === N);
            var C = A.choix([['élèves', 'viennent au lycée en bus'], ['personnes interrogées', 'préfèrent la mer à la montagne'], ['salariés', 'déjeunent à la cantine']]);
            if (Math.random() < 0.5) {
                q.texte = 'Sur $' + N + '$ ' + C[0] + ', $' + n + '$ ' + C[1] + '. Dans le diagramme circulaire, quel angle (en degrés) faut-il donner à leur secteur ?';
                q.attendu = 360 * n / N; q.prefixe = '\\alpha=';
                q.explication = 'Angle $=' + frac(n, N) + '\\times360=' + fr(360 * n / N) + '°$.';
            } else {
                q.texte = 'Un diagramme circulaire représente $' + N + '$ ' + C[0] + '. Le secteur de ceux qui ' + C[1] + ' mesure $' + fr(360 * n / N) + '°$. Combien sont-ils ?';
                q.attendu = n;
                q.explication = '$' + frac(fr(360 * n / N), 360) + '\\times' + N + '=' + n + '$ ' + C[0] + '.';
            }
            return q;
        }
        // diagramme en barres -> angle d'un secteur
        var cats, vals, k, T;
        do {
            T = A.choix([24, 30, 36, 40, 45, 60, 72]);
            vals = [A.entier(2, T / 3), A.entier(2, T / 3), A.entier(2, T / 3)];
            vals.push(T - vals[0] - vals[1] - vals[2]);
            k = A.entier(0, 3);
        } while (vals[3] < 2 || vals[3] > T / 2 || !rapide(360 * vals[k] / T));
        cats = melanger(SPORTS).slice(0, 4);
        var ymax = Math.ceil(Math.max.apply(null, vals) / 2) * 2 + 2;
        q.figure = barres({ cats: cats, vals: vals, ymin: 0, ymax: ymax, pas: 1, etiq: 2, unite: 'Effectif' });
        q.figureNote = cats.map(function (c, j) { return c + ' ' + vals[j]; }).join(', ');
        q.texte = 'Le diagramme donne le sport préféré des élèves d\'une classe. On veut représenter ces données par un diagramme circulaire. Quel angle (en degrés) faut-il pour le secteur « ' + cats[k] + ' » ?';
        q.attendu = 360 * vals[k] / T; q.prefixe = '\\alpha=';
        q.explication = 'Effectif total : $' + vals.join('+') + '=' + T + '$. Angle : $' + frac(vals[k], T) + '\\times360=' + fr(360 * vals[k] / T) + '°$.';
        return q;
    };

    /* ---------- Conversions d'unités (automatisme 12) ---------- */
    AutoP.conversions = function (niveau) {
        var q = { niveau: niveau, objectif: 'Nombres · Conversions d\'unités' }, C;
        if (niveau === 1) {
            C = A.choix([
                [3.5, 'km', 1000, 'm'], [250, 'g', 0.001, 'kg'], [1.2, 'L', 100, 'cL'], [45, 'mm', 0.1, 'cm'], [0.8, 'kg', 1000, 'g'], [75, 'cL', 0.01, 'L'], [2.4, 'm', 100, 'cm'], [600, 'mL', 0.001, 'L'], [12, 'cm', 0.01, 'm']
            ]);
            var r = arrondi(C[0] * C[2]);
            q.texte = '$' + fr(C[0]) + '$ ' + C[1] + ' $=$';
            q.explication = (C[2] > 1 ? '$1$ ' + C[1] + ' $=' + fr(C[2]) + '$ ' + C[3] : '$1$ ' + C[3] + ' $=' + fr(arrondi(1 / C[2])) + '$ ' + C[1]) + ', donc $' + fr(C[0]) + '$ ' + C[1] + ' $=' + fr(r) + '$ ' + C[3] + '.';
            q.rappel = 'Tableau de conversion : km, hm, dam, <b>m</b>, dm, cm, mm (de même pour g et L). D\'une colonne à la suivante, on multiplie ou on divise par $10$.<br>Exemple : $1$ km $=1\\,000$ m ; $1$ L $=100$ cL ; $1$ g $=0{,}001$ kg.';
            return qcm(q, '$' + fr(r) + '$ ' + C[3], ['$' + fr(arrondi(r * 10)) + '$ ' + C[3], '$' + fr(arrondi(r / 10)) + '$ ' + C[3], '$' + fr(arrondi(r * 100)) + '$ ' + C[3], '$' + fr(arrondi(r / 100)) + '$ ' + C[3]]);
        }
        q.type = 'nombre';
        if (niveau === 2) {
            C = A.choix([
                [2.5, 'm^2', 10000, 'cm^2', '$1$ m² $=100\\times100=10\\,000$ cm².'],
                [350, 'cm^3', 0.001, 'L', '$1$ L $=1$ dm³ $=1\\,000$ cm³.'],
                [1.5, 'm^3', 1000, 'L', '$1$ m³ $=1\\,000$ dm³ $=1\\,000$ L.'],
                [4500, 'm^2', 0.01, 'ha', '$1$ ha $=10\\,000$ m² (un carré de $100$ m de côté).'],
                [0.2, 'L', 200, 'cm^3', '$1$ L $=1\\,000$ cm³.'],
                [80, 'cm^2', 0.008, 'm^2', '$1$ m² $=10\\,000$ cm².'],
                [3, 'dm^3', 3000, 'cm^3', '$1$ dm³ $=1\\,000$ cm³.']
            ]);
            var fac = C[2] === 200 ? 1000 : C[2] === 3000 ? 1000 : C[2] === 0.008 ? 0.0001 : C[2] === 0.01 ? 0.0001 : C[2];
            var res = arrondi(C[0] * fac);
            q.texte = 'Convertir : $' + fr(C[0]) + '\\ \\text{' + C[1].replace('^2', '}^2\\text{').replace('^3', '}^3\\text{') + '}$ en ' + C[3].replace('^2', '²').replace('^3', '³') + '.';
            q.attendu = res;
            q.explication = C[4] + ' Donc $' + fr(C[0]) + '$ ' + C[1].replace('^2', '²').replace('^3', '³') + ' $=' + fr(res) + '$ ' + C[3].replace('^2', '²').replace('^3', '³') + '.';
            return q;
        }
        C = A.choix([
            ['$72$ km/h en m/s', 20, '$72$ km/h $=' + frac('72\\,000\\text{ m}', '3\\,600\\text{ s}') + '=20$ m/s (on divise par $3{,}6$).'],
            ['$90$ km/h en m/s', 25, '$90$ km/h $=' + frac('90\\,000\\text{ m}', '3\\,600\\text{ s}') + '=25$ m/s (on divise par $3{,}6$).'],
            ['$15$ m/s en km/h', 54, '$15$ m/s $=15\\times3\\,600$ m/h $=54\\,000$ m/h $=54$ km/h (on multiplie par $3{,}6$).'],
            ['$2$ h $45$ min en heures (écriture décimale)', 2.75, '$45$ min $=' + frac(45, 60) + '$ h $=0{,}75$ h, donc $2$ h $45$ min $=2{,}75$ h.'],
            ['$1{,}2$ h en minutes', 72, '$1{,}2$ h $=1{,}2\\times60$ min $=72$ min. <i>Attention : $1{,}2$ h n\'est pas $1$ h $20$ min !</i>'],
            ['$3$ h $12$ min en heures (écriture décimale)', 3.2, '$12$ min $=' + frac(12, 60) + '$ h $=0{,}2$ h, donc $3$ h $12$ min $=3{,}2$ h.'],
            ['$10$ m/s en km/h', 36, '$10$ m/s $=10\\times3{,}6=36$ km/h.'],
            ['$0{,}25$ h en minutes', 15, '$0{,}25\\times60=15$ min.']
        ]);
        q.texte = 'Convertir ' + C[0] + '.';
        q.attendu = C[1];
        q.explication = C[2];
        return q;
    };

    /* ---------- Inéquations du premier degré (automatisme 19) ---------- */
    AutoP.inequation = function (niveau) {
        var q = { niveau: niveau, objectif: 'Inéquations · Premier degré' }, a, b, c, d, x, s;
        var SIG = { '<': '<', '>': '>', '<=': '\\leqslant', '>=': '\\geqslant' }, INV = { '<': '>', '>': '<', '<=': '>=', '>=': '<=' };
        s = A.choix(['<', '>', '<=', '>=']);
        x = A.nonNul(-6, 6);
        if (niveau === 1) { a = A.entier(2, 6); b = A.nonNul(-9, 9); c = a * x + b; }
        else if (niveau === 2) { a = -A.entier(2, 6); b = A.nonNul(-9, 9); c = a * x + b; }
        else { do { a = A.nonNul(-6, 6); d = A.nonNul(-6, 6); } while (a === d || a - d > 0 && Math.random() < 0.6); b = A.nonNul(-9, 9); c = (a - d) * x + b; }
        var g = poly([a, b]), h = niveau === 3 ? poly([d, c]) : String(c), coef = niveau === 3 ? a - d : a, droite = c - b;
        var sf = coef < 0 ? INV[s] : s;
        function sol(t) { return '$x' + SIG[t] + x + '$'; }
        q.texte = 'Les solutions de l\'inéquation $' + g + SIG[s] + h + '$ sont les nombres $x$ tels que :';
        q.explication = (niveau === 3 ? 'On regroupe les $x$ dans le membre de gauche : ' : 'On soustrait $' + b + '$ : ') + '$' + poly([coef, 0]) + SIG[s] + fr(droite) + '$, puis on divise par $' + coef + '$' +
            (coef < 0 ? ', qui est <b>négatif</b> : on change le sens de l\'inégalité' : ' (positif : le sens ne change pas)') + '. Donc ' + sol(sf) + '.';
        if (niveau === 1) q.rappel = 'On résout comme une équation. Mais quand on multiplie ou divise les deux membres par un nombre <b>négatif</b>, on <b>change le sens</b> de l\'inégalité.<br>' +
            'Exemple : $2x+1<7$ ; $2x<6$ ; $x<3$. Mais $-2x<6$ donne $x>-3$.';
        return qcm(q, sol(sf), [sol(INV[sf]), sol(sf.length === 2 ? sf[0] : sf + '='), '$x' + SIG[sf] + fr(-x) + '$', '$x' + SIG[INV[sf]] + fr(-x) + '$']);
    };

    /* ---------- Résoudre graphiquement f(x) = k, f(x) < k (automatisme 27) — courbes des automatismes de Terminale ---------- */
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
    function lisser(xs, ys) {
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
    function figureCourbe(C) { return repere({ xmin: Math.min(C.xmin, -1), xmax: C.xmax, ymin: -4, ymax: 5, c: 32, courbe: C.points, nom: '𝒞<tspan font-size="12">f</tspan>' }); }
    function noteCourbe(C) { return 'courbe passant par ' + C.xs.map(function (x, k) { return '(' + x + ';' + C.ys[k] + ')'; }).join(' '); }
    function ensemble(t) { return t.length ? '$\\{' + t.join('\\ ;\\ ') + '\\}$' : '$\\varnothing$ (aucune solution)'; }
    function antecedents(C, k) { return C.xs.filter(function (x, i) { return C.ys[i] === k; }); }
    function niveauxPropres(C) {
        var bons = [];
        for (var k = -3; k <= 4; k++) {
            var idx = C.ys.map(function (y, i) { return y === k ? i : -1; }).filter(function (i) { return i >= 0; });
            if (!idx.length) continue;
            if (idx.every(function (i) { return i > 0 && i < C.ys.length - 1 && (C.ys[i - 1] - k) * (C.ys[i + 1] - k) < 0; })) bons.push(k);
        }
        return bons;
    }
    function resoudre(C, k, op) {
        function ok(v) { return op === '<' ? v < k : op === '<=' ? v <= k : op === '>' ? v > k : v >= k; }
        var n = C.xs.length, morceaux = [], cur = null;
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
    function texIntervalles(m) { return m.length ? '$' + m.map(function (I) { return intervalle(I.a, I.b, I.ga, I.db); }).join('\\cup') + '$' : '$\\varnothing$'; }

    AutoP.resolutionGraphique = function (niveau) {
        var q = { niveau: niveau, objectif: niveau === 1 ? 'Fonctions · Résoudre graphiquement f(x) = k' : 'Fonctions · Résoudre graphiquement f(x) < k' };
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
        var ys = [Math.min.apply(null, C.ys), Math.max.apply(null, C.ys)], piegeY = op[0] === '<' ? '$' + intervalle(ys[0], k, true, op.length === 2) + '$' : '$' + intervalle(k, ys[1], op.length === 2, true) + '$';
        return qcm(q, texIntervalles(sol), [texIntervalles(resoudre(C, k, large)), texIntervalles(resoudre(C, k, oppose)), piegeY, texIntervalles(resoudre(C, k, { '<': '>', '>': '<', '<=': '>=', '>=': '<=' }[op]))]);
    };

    /* ---------- Probabilités conditionnelles : tableau croisé (automatisme 33) ---------- */
    var TABLEAUX = [
        { pop: 'élèves d\'un lycée', L: ['Fille', 'Garçon'], Lc: ['F', 'G'], Ld: ['est une fille', 'est un garçon'], Cn: ['Externe', 'Demi-pens.'], Cc: ['E', 'D'], Cd: ['est externe', 'est demi-pensionnaire'], unite: 'l\'élève' },
        { pop: 'personnes testées', L: ['Malade', 'Non malade'], Lc: ['M', '\\overline{M}'], Ld: ['est malade', 'n\'est pas malade'], Cn: ['Test +', 'Test −'], Cc: ['T', '\\overline{T}'], Cd: ['a un test positif', 'a un test négatif'], unite: 'la personne' },
        { pop: 'clients d\'une salle de sport', L: ['Moins de 30 ans', '30 ans et plus'], Lc: ['J', '\\overline{J}'], Ld: ['a moins de 30 ans', 'a 30 ans ou plus'], Cn: ['Cardio', 'Musculation'], Cc: ['C', 'M'], Cd: ['fait du cardio', 'fait de la musculation'], unite: 'le client' }
    ];
    AutoP.probaTableau = function (niveau) {
        var q = { niveau: niveau, objectif: 'Probabilités · Tableau croisé, probabilités conditionnelles' }, T = A.choix(TABLEAUX), e;
        do { e = [[A.entier(5, 60), A.entier(5, 60)], [A.entier(5, 60), A.entier(5, 60)]]; } while ((e[0][0] + e[0][1] + e[1][0] + e[1][1]) % 10);
        var l0 = e[0][0] + e[0][1], l1 = e[1][0] + e[1][1], c0 = e[0][0] + e[1][0], c1 = e[0][1] + e[1][1], N = l0 + l1;
        q.texte = 'On choisit au hasard une personne parmi les $' + N + '$ ' + T.pop + ' :<br>$\\begin{array}{|l|c|c|c|}\\hline & \\text{' + T.Cn[0] + '} & \\text{' + T.Cn[1] + '} & \\text{Total}\\\\\\hline \\text{' + T.L[0] + '} & ' + e[0][0] + ' & ' + e[0][1] + ' & ' + l0 + '\\\\\\hline \\text{' + T.L[1] + '} & ' + e[1][0] + ' & ' + e[1][1] + ' & ' + l1 + '\\\\\\hline \\text{Total} & ' + c0 + ' & ' + c1 + ' & ' + N + '\\\\\\hline\\end{array}$<br>';
        q.type = 'nombre'; q.irreductible = true; q.prefixe = 'p=';
        var i = A.entier(0, 1), j = A.entier(0, 1), nij = e[i][j], li = i ? l1 : l0, cj = j ? c1 : c0;
        function res(n, d) { return frac(n, d) + (R(n, d).d !== d ? '=' + texR(R(n, d)) : ''); }
        if (niveau === 1) {
            var ligne = Math.random() < 0.5;
            q.texte += 'Quelle est la probabilité que ' + T.unite + ' ' + (ligne ? T.Ld[i] : T.Cd[j]) + ' ? (fraction irréductible)';
            q.attendu = (ligne ? li : cj) / N;
            q.explication = 'On lit le total de la ' + (ligne ? 'ligne' : 'colonne') + ' « ' + (ligne ? T.L[i] : T.Cn[j]) + ' » et on divise par l\'effectif total : $p=' + res(ligne ? li : cj, N) + '$.';
            q.rappel = 'Avec un tableau croisé, quand on choisit au hasard dans <b>toute</b> la population : $P(A)=' + frac('\\text{effectif de }A', '\\text{effectif total}') + '$ (on lit le total de la ligne ou de la colonne de $A$, et on divise par le total général).';
            return q;
        }
        if (niveau === 2) {
            q.texte += 'Quelle est la probabilité que ' + T.unite + ' ' + T.Ld[i] + ' <b>et</b> ' + T.Cd[j] + ' ? (fraction irréductible)';
            q.attendu = nij / N;
            q.prefixe = 'P(' + T.Lc[i] + '\\cap ' + T.Cc[j] + ')=';
            q.explication = 'On lit la case à l\'intersection de la ligne « ' + T.L[i] + ' » et de la colonne « ' + T.Cn[j] + ' », et on divise par l\'effectif <b>total</b> : $P(' + T.Lc[i] + '\\cap ' + T.Cc[j] + ')=' + res(nij, N) + '$.';
            return q;
        }
        var sachantLigne = Math.random() < 0.5;
        if (sachantLigne) {
            q.texte += 'On sait que ' + T.unite + ' ' + T.Ld[i] + '. Quelle est la probabilité qu\'' + (T.unite.indexOf('la') === 0 ? 'elle' : 'il') + ' ' + T.Cd[j] + ' ? (fraction irréductible)';
            q.prefixe = 'P_{' + T.Lc[i] + '}(' + T.Cc[j] + ')=';
            q.attendu = nij / li;
            q.explication = '« Sachant que » : on se restreint à la ligne « ' + T.L[i] + ' » ($' + li + '$ personnes), dont $' + nij + '$ dans la colonne « ' + T.Cn[j] + ' » : $P_{' + T.Lc[i] + '}(' + T.Cc[j] + ')=' + res(nij, li) + '$.';
        } else {
            q.texte += 'On sait que ' + T.unite + ' ' + T.Cd[j] + '. Quelle est la probabilité qu\'' + (T.unite.indexOf('la') === 0 ? 'elle' : 'il') + ' ' + T.Ld[i] + ' ? (fraction irréductible)';
            q.prefixe = 'P_{' + T.Cc[j] + '}(' + T.Lc[i] + ')=';
            q.attendu = nij / cj;
            q.explication = '« Sachant que » : on se restreint à la colonne « ' + T.Cn[j] + ' » ($' + cj + '$ personnes), dont $' + nij + '$ dans la ligne « ' + T.L[i] + ' » : $P_{' + T.Cc[j] + '}(' + T.Lc[i] + ')=' + res(nij, cj) + '$.';
        }
        return q;
    };

    window.AutoP = AutoP;
})();

// Bouton « 📖 Vocabulaire » dans la barre du haut (vocabulaire.js et lexique.js, à la racine du site)
(function () {
    var ici = document.currentScript && document.currentScript.src;
    if (!ici) return;
    var s = document.createElement('script');
    s.src = new URL('../../vocabulaire.js', ici).href;
    document.head.appendChild(s);
})();
