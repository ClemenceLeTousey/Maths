/* Générateurs d'automatismes (Seconde) : Auto[nom](niveau) -> question pour Interactif.exercice.
   Chaque générateur reprend un type de question des séries hebdomadaires, en 3 niveaux. */
(function () {
    'use strict';
    var A = Interactif.alea;

    /* ---------- Outils ---------- */
    function arrondi(x) { return Math.round(x * 1e9) / 1e9; }
    // Nombre en TeX à la française : 1{,}25 ; 12\,500
    function fr(x) {
        x = arrondi(x);
        var neg = x < 0, s = String(Math.abs(x));
        var p = s.split('.'), ent = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
        return (neg ? '-' : '') + ent + (p[1] ? '{,}' + p[1] : '');
    }
    function frac(n, d) { return '\\dfrac{' + n + '}{' + d + '}'; }
    function melanger(t) {
        t = t.slice();
        for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = t[i]; t[i] = t[j]; t[j] = x; }
        return t;
    }
    // QCM : options = [{t: texte mixte, ok: bool}] -> mélangées
    function qcm(q, options) {
        var m = melanger(options);
        q.type = 'qcm';
        q.options = m.map(function (o) { return o.t; });
        q.bonne = m.findIndex(function (o) { return o.ok; });
        return q;
    }
    function distincts(vals) {
        var vus = {};
        return vals.every(function (v) { var k = arrondi(v); if (vus[k]) return false; vus[k] = true; return true; });
    }
    function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
    function fracTex(n, d) {          // fraction simplifiée, signe devant
        var g = pgcd(n, d); n /= g; d /= g;
        if (d < 0) { n = -n; d = -d; }
        if (d === 1) return String(n);
        return (n < 0 ? '-' : '') + frac(Math.abs(n), d);
    }
    function nonCarre(min, max) {
        var a; do { a = A.entier(min, max); } while (Math.sqrt(a) % 1 === 0);
        return a;
    }
    // Écritures d'un même nombre décimal
    function ecrDecimal(v) { return { v: v, t: '$' + fr(v) + '$' }; }
    function ecrPuissance(v, e) { return { v: v, t: '$' + fr(arrondi(v * Math.pow(10, e))) + '\\times10^{-' + e + '}$' }; }
    function ecrFraction(v, d) { var n = Math.round(v * d); return { v: v, t: '$' + (n < 0 ? '-' : '') + frac(Math.abs(n), d) + '$' }; }

    // « 7/4 = 1,75 » (rien à écrire si c'est déjà l'écriture décimale)
    function enDecimal(x) { return x.t === '$' + fr(x.v) + '$' ? x.t : x.t.replace(/\$$/, '') + '=' + fr(x.v) + '$'; }

    var Auto = {};

    /* ===== A1 · Comparer deux nombres : le plus grand (QCM) ===== */
    Auto.plusGrand = function (niveau) {
        var q = { niveau: niveau, objectif: 'A1 · Comparer deux nombres' };
        if (niveau === 3) {
            var b, d;
            do { b = A.entier(3, 9); d = b + A.entier(1, 3); } while (d > 12);
            var a = b - 1, c = d - 1;                       // a/b et c/d proches de 1
            if (Math.random() < 0.5) { a = b + 1; c = d + 1; }
            var g = a * d - c * b, sym = g < 0 ? '<' : g > 0 ? '>' : '=';
            q.texte = 'Sans calculatrice, comparer $' + frac(a, b) + '$ et $' + frac(c, d) + '$.';
            q.explication = 'Même dénominateur $' + b * d + '$ : $' + frac(a, b) + '=' + frac(a * d, b * d) + '$ et $' + frac(c, d) + '=' + frac(c * b, b * d) + '$, donc $' + frac(a, b) + sym + frac(c, d) + '$.';
            return qcm(q, ['<', '>', '='].map(function (s) { return { t: '$' + frac(a, b) + s + frac(c, d) + '$', ok: s === sym }; }));
        }
        var n = A.entier(1, 3), vals;
        do {
            var tiers = melanger([0.25, 0.4, 0.5, 0.6, 0.75])[0], dix = A.entier(2, 8) / 10;
            if (niveau === 1) vals = [ecrFraction(n + A.entier(20, 80) / 100, 100), ecrDecimal(n + A.entier(20, 80) / 100), ecrFraction(n + tiers, tiers === 0.25 || tiers === 0.75 ? 4 : tiers === 0.5 ? 2 : 5), ecrPuissance(n + dix, 1)];
            else vals = [ecrFraction(n + A.entier(200, 800) / 1000, 1000), ecrDecimal(n + A.entier(200, 800) / 1000), ecrFraction(n + tiers, tiers === 0.25 || tiers === 0.75 ? 4 : tiers === 0.5 ? 2 : 5), ecrPuissance(n + A.entier(20, 80) / 100, 2)];
        } while (!distincts(vals.map(function (x) { return x.v; })));
        var max = Math.max.apply(null, vals.map(function (x) { return x.v; }));
        q.texte = 'Parmi les quatre nombres suivants, lequel est le plus grand ?';
        q.explication = 'On écrit tout sous forme décimale : ' + vals.map(enDecimal).join(' ; ') + '.<br>Le plus grand est $' + fr(max) + '$.';
        return qcm(q, vals.map(function (x) { return { t: x.t, ok: x.v === max }; }));
    };

    /* ===== A13 · Proportions : opération pour un pourcentage ===== */
    Auto.pourcentage = function (niveau) {
        var q = { niveau: niveau, objectif: 'A13 · Proportions' };
        if (niveau === 1) {
            var p = A.entier(2, 18) * 5, N = A.entier(5, 45) * 20;
            q.texte = 'L\'opération qui permet de calculer $' + p + '\\,\\%$ de $' + N + '$ est :';
            q.explication = 'Prendre $' + p + '\\,\\%$ de $' + N + '$, c\'est multiplier par $' + frac(p, 100) + '$ : $' + frac(p + '\\times' + N, 100) + '=' + fr(p * N / 100) + '$.<br>Autre écriture correcte : $' + fr(p / 100) + '\\times' + N + '$.';
            return qcm(q, [
                { t: '$' + p + '\\times' + N + '\\times100$', ok: false },
                { t: '$' + frac(p + '\\times' + N, 100) + '$', ok: true },
                { t: '$' + p + '\\times' + N + '\\times0{,}1$', ok: false },
                { t: '$' + N + '\\times' + p + '\\times0{,}001$', ok: false }
            ]);
        }
        q.type = 'nombre';
        if (niveau === 2) {
            var p2 = A.entier(1, 19) * 5, N2 = A.entier(3, 30) * 20;
            q.texte = 'Calculer $' + p2 + '\\,\\%$ de $' + N2 + '$.';
            q.attendu = p2 * N2 / 100;
            q.explication = '$' + frac(p2 + '\\times' + N2, 100) + '=' + fr(q.attendu) + '$ (ou $' + fr(p2 / 100) + '\\times' + N2 + '$).';
            return q;
        }
        var cas = A.choix([[25, 4], [50, 2], [20, 5]]), b = cas[0], a = A.entier(3, 24) * cas[1];
        q.texte = 'Sachant que $a\\,\\%$ de $b$ est égal à $b\\,\\%$ de $a$, calculer <b>de tête</b> $' + a + '\\,\\%$ de $' + b + '$.';
        q.attendu = a * b / 100;
        q.explication = '$' + a + '\\,\\%$ de $' + b + '$ $=$ $' + b + '\\,\\%$ de $' + a + '$ $=' + frac(a, 100 / b) + '=' + fr(q.attendu) + '$ (car $' + b + '\\,\\%=' + frac(1, 100 / b) + '$).';
        return q;
    };

    /* ===== A5 · Encadrer une racine carrée ===== */
    Auto.encadrerRacine = function (niveau) {
        var q = { niveau: niveau, objectif: 'A5 · Encadrer, ordre de grandeur', type: 'champs' };
        if (niveau < 3) {
            var a = niveau === 1 ? nonCarre(2, 99) : nonCarre(101, 399), n = Math.floor(Math.sqrt(a));
            q.texte = 'Encadrer $\\sqrt{' + a + '}$ entre deux entiers consécutifs.';
            q.gabarit = '[] $<\\sqrt{' + a + '}<$ []';
            q.attendus = [n, n + 1];
            q.explication = '$' + n + '^2=' + n * n + '$ et $' + (n + 1) + '^2=' + (n + 1) * (n + 1) + '$ ; comme $' + n * n + '<' + a + '<' + (n + 1) * (n + 1) + '$, on a $' + n + '<\\sqrt{' + a + '}<' + (n + 1) + '$.';
            return q;
        }
        var b = nonCarre(2, 99), d = Math.floor(Math.sqrt(b) * 10) / 10, e = arrondi(d + 0.1);
        q.texte = 'Encadrer $\\sqrt{' + b + '}$ entre deux décimaux consécutifs au dixième (sans calculatrice).';
        q.gabarit = '[] $<\\sqrt{' + b + '}<$ []';
        q.attendus = [d, e];
        q.explication = '$' + fr(d) + '^2=' + fr(arrondi(d * d)) + '$ et $' + fr(e) + '^2=' + fr(arrondi(e * e)) + '$ ; comme $' + fr(arrondi(d * d)) + '<' + b + '<' + fr(arrondi(e * e)) + '$, on a $' + fr(d) + '<\\sqrt{' + b + '}<' + fr(e) + '$.';
        return q;
    };

    /* ===== A1 · Comparer des petits nombres (QCM) ===== */
    Auto.petitsNombres = function (niveau) {
        var q = { niveau: niveau, objectif: 'A1 · Comparer deux nombres' };
        var d = A.entier(2, 9);
        if (niveau === 3) {
            var m = A.entier(11, 99), e = A.entier(3, 5), v1 = m * Math.pow(10, -e);
            var dec = A.choix([-1, 0, 1]);                 // second nombre : 10 fois plus petit, égal, 10 fois plus grand
            var m2 = arrondi(m / 10), e2 = e - 1 - dec, v2 = m2 * Math.pow(10, -e2);
            var sym = arrondi(v1) < arrondi(v2) ? '<' : arrondi(v1) > arrondi(v2) ? '>' : '=';
            var t1 = fr(m) + '\\times10^{-' + e + '}', t2 = fr(m2) + '\\times10^{-' + e2 + '}';
            q.texte = 'Comparer $' + t1 + '$ et $' + t2 + '$.';
            q.explication = '$' + t1 + '=' + fr(v1) + '$ et $' + t2 + '=' + fr(v2) + '$, donc $' + t1 + sym + t2 + '$.';
            return qcm(q, ['<', '>', '='].map(function (s) { return { t: '$' + t1 + s + t2 + '$', ok: s === sym }; }));
        }
        var vals, cherche = Math.random() < 0.5 ? 'petit' : 'grand';
        if (niveau === 1) vals = [ecrDecimal(d / 10), ecrDecimal(d / 100), ecrDecimal(d / 1000), ecrDecimal(arrondi(d / 100 + d / 1000))];
        else vals = [ecrPuissance(d / 100, 2), ecrDecimal(arrondi(d / 1000 + A.entier(1, 9) / 10000)), ecrPuissance(d / 1000, 4), ecrDecimal(arrondi(d / 100 + A.entier(1, 9) / 1000))];
        var cible = Math[cherche === 'petit' ? 'min' : 'max'].apply(null, vals.map(function (x) { return x.v; }));
        q.texte = 'Parmi les nombres suivants, lequel est le plus ' + cherche + ' ?';
        q.explication = 'En écriture décimale : ' + vals.map(enDecimal).join(' ; ') + '.<br>Le plus ' + cherche + ' est $' + fr(cible) + '$.';
        return qcm(q, vals.map(function (x) { return { t: x.t, ok: x.v === cible }; }));
    };

    /* ===== A4 · Fraction décimale -> écriture décimale ===== */
    Auto.fractionDecimale = function (niveau) {
        var q = { niveau: niveau, objectif: 'A4 · Écritures d\'un nombre', type: 'nombre', decimal: true };
        var n, d;
        if (niveau === 1) { d = A.choix([10, 100]); do { n = A.entier(101, 999); } while (n % 10 === 0); }
        else if (niveau === 2) { d = A.choix([1000, 10000]); do { n = A.entier(1, 99); } while (n % 10 === 0); }
        else { var c = A.choix([[4, [1, 3, 5, 7, 9]], [8, [1, 3, 5, 7, 11]], [20, [3, 7, 9, 11, 13]], [25, [2, 3, 4, 6, 7]], [50, [3, 7, 9, 11]]]); d = c[0]; n = A.choix(c[1]); }
        q.texte = 'Donner l\'écriture décimale de $' + frac(n, d) + '$.';
        q.prefixe = frac(n, d) + '=';
        q.attendu = n / d;
        if (niveau < 3) q.explication = 'Diviser par $' + fr(d) + '$, c\'est décaler la virgule de $' + (String(d).length - 1) + '$ rang' + (d > 10 ? 's' : '') + ' vers la gauche : $' + frac(n, d) + '=' + fr(n / d) + '$.';
        else { var k = { 4: 25, 8: 125, 20: 5, 25: 4, 50: 2 }[d]; q.explication = 'On se ramène à une fraction décimale : $' + frac(n, d) + '=' + frac(n + '\\times' + k, d + '\\times' + k) + '=' + frac(n * k, d * k) + '=' + fr(n / d) + '$.'; }
        return q;
    };

    /* ===== A9 · Simple distributivité ===== */
    Auto.distributivite = function (niveau) {
        var poly = Interactif.poly, par = Interactif.par;
        var q = { niveau: niveau, objectif: 'A9 · Développer', type: 'expr', forme: 'developpee', consigne: 'Développer et réduire :' };
        var k, a, b, res;
        if (niveau === 1) {
            k = A.entier(2, 9); b = A.nonNul(-9, 9); res = poly([k, k * b]);
            q.enonce = 'A=' + k + '(' + poly([1, b]) + ')';
            q.correction = ['A&=' + k + '\\times x+' + k + '\\times ' + par(b), '&=' + res];
        } else if (niveau === 2) {
            k = A.entier(2, 9) * A.signe(); a = A.nonNul(-7, 7); b = A.nonNul(-9, 9); res = poly([k * a, k * b]);
            q.enonce = 'A=' + k + '(' + poly([a, b]) + ')';
            q.correction = ['A&=' + k + '\\times ' + (a < 0 ? '(' + poly([a, 0]) + ')' : poly([a, 0])) + '+' + par(k) + '\\times ' + par(b), '&=' + res];
        } else {
            k = A.entier(2, 6); a = A.entier(1, 5); b = A.nonNul(-9, 9);
            var m = A.entier(2, 6), c = A.entier(1, 5), d = A.nonNul(-9, 9);
            res = poly([k * a - m * c, k * b - m * d]);
            q.enonce = 'A=' + k + '(' + poly([a, b]) + ')-' + m + '(' + poly([c, d]) + ')';
            var dev2 = poly([-m * c, -m * d]);
            q.correction = ['A&=' + poly([k * a, k * b]) + (dev2[0] === '-' ? '' : '+') + dev2, '&=' + res];
        }
        q.prefixe = 'A='; q.attendu = res;
        q.enonce = q.enonce.replace(/^A=/, 'A = ');
        return q;
    };

    /* ===== A5 · Ordre de grandeur d'un pourcentage (QCM) ===== */
    Auto.ordreGrandeur = function (niveau) {
        var q = { niveau: niveau, objectif: 'A5 · Encadrer, ordre de grandeur' };
        var p0 = A.choix(niveau === 1 ? [10, 50] : niveau === 2 ? [20, 25, 75] : [5, 15, 30]);
        var N0 = niveau === 3 ? A.entier(2, 9) * 1000 : A.entier(2, 9) * 100;
        var p = arrondi(p0 + A.choix([-1, 1]) * A.entier(1, 9) / 10);
        var N = N0 + A.choix([-1, 1]) * A.entier(1, Math.round(N0 / 100) * 2 + 1);
        var r = p0 * N0 / 100;
        q.texte = 'Un ordre de grandeur de $' + fr(p) + '\\,\\%$ de $' + fr(N) + '$ est :';
        q.explication = '$' + fr(p) + '\\,\\%\\approx' + p0 + '\\,\\%$ et $' + fr(N) + '\\approx' + fr(N0) + '$, donc le résultat est proche de $' + p0 + '\\,\\%$ de $' + fr(N0) + '$, soit $' + fr(r) + '$.';
        var autres = [r * 10, r / 10, A.choix([r * 2, r / 2])];
        return qcm(q, [{ t: '$' + fr(r) + '$', ok: true }].concat(autres.map(function (x) { return { t: '$' + fr(x) + '$', ok: false }; })));
    };

    /* ===== A10 · Équations ===== */
    Auto.equation = function (niveau) {
        var q = { niveau: niveau, objectif: 'A10 · Équations', type: 'nombre', prefixe: 'x =' };
        var a, b, c, x;
        if (niveau === 1) {
            x = A.nonNul(-9, 9);
            if (Math.random() < 0.5) {
                b = A.nonNul(-9, 9); c = x + b;
                q.texte = 'Résoudre $x' + (b > 0 ? '+' : '') + b + '=' + c + '$.';
                q.correction = ['x' + (b > 0 ? '+' : '') + b + '&=' + c, 'x&=' + c + (b > 0 ? '-' + b : '+' + -b), 'x&=' + x];
            } else {
                a = A.entier(2, 9) * A.signe(); c = a * x;
                q.texte = 'Résoudre $' + a + 'x=' + c + '$.';
                q.correction = [a + 'x&=' + c, 'x&=' + frac(c, a), 'x&=' + x];
            }
            q.attendu = x;
            return q;
        }
        if (niveau === 2) {
            x = A.nonNul(-9, 9); a = A.entier(2, 9) * A.signe(); b = A.nonNul(-9, 9); c = a * x + b;
            q.texte = 'Résoudre $' + Interactif.poly([a, b]) + '=' + c + '$.';
            q.correction = [Interactif.poly([a, b]) + '&=' + c, a + 'x&=' + (c - b), 'x&=' + frac(c - b, a), 'x&=' + x];
            q.attendu = x;
            return q;
        }
        var d, e;
        do { a = A.nonNul(-9, 9); c = A.nonNul(-9, 9); b = A.nonNul(-9, 9); d = A.nonNul(-9, 9); } while (a === c || b === d);
        var g = Interactif.poly([a, b]), h = Interactif.poly([c, d]);
        q.texte = 'Résoudre $' + g + '=' + h + '$ (solution exacte, éventuellement sous forme de fraction).';
        e = fracTex(d - b, a - c);
        q.correction = [g + '&=' + h, Interactif.poly([a - c, 0]) + '&=' + (d - b), 'x&=' + e];
        q.attendu = (d - b) / (a - c);
        return q;
    };

    /* ===== A1 · Ranger dans l'ordre croissant ===== */
    Auto.ranger = function (niveau) {
        var q = { niveau: niveau, objectif: 'A1 · Comparer deux nombres', type: 'ordre' };
        var vals;
        do {
            if (niveau === 1) {
                var n = A.entier(0, 9), dig = A.entier(1, 8);
                vals = [n + dig / 10, n + dig / 100, n + dig / 10 + A.entier(1, 9) / 100, n + dig / 10 + A.entier(1, 9) / 1000].map(ecrDecimal);
            } else if (niveau === 2) {
                var m = A.entier(1, 3);
                vals = [ecrFraction(m + A.choix([0.25, 0.75]), 4), ecrDecimal(m + A.entier(60, 90) / 100), ecrPuissance(m + A.entier(6, 9) / 10, 1), ecrFraction(m + A.entier(60, 90) / 100, 100)];
            } else {
                vals = [ecrDecimal(-A.entier(10, 30) / 10), ecrDecimal(-A.entier(100, 300) / 100), ecrFraction(-A.choix([1.25, 1.75, 2.25, 2.75, 0.75]), 4), ecrDecimal(A.entier(-9, 9) / 10)];
            }
            vals = vals.map(function (x) { x.v = arrondi(x.v); return x; });
        } while (!distincts(vals.map(function (x) { return x.v; })));
        vals = melanger(vals);
        var L = 'ABCD';
        q.texte = 'Ranger dans l\'ordre croissant (écris les lettres, du plus petit au plus grand) :<br>' +
            vals.map(function (x, k) { return '<b>' + L[k] + '</b> : ' + x.t; }).join(' &nbsp; ');
        var ordre = vals.map(function (x, k) { return { v: x.v, l: L[k], t: x.t }; }).sort(function (u, w) { return u.v - w.v; });
        q.attendu = ordre.map(function (o) { return o.l; }).join('');
        q.explication = ordre.map(enDecimal).join(' $<$ ') + ', donc <b>' + q.attendu + '</b>.';
        return q;
    };

    window.Auto = Auto;
})();
