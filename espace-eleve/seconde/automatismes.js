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
            var a = niveau === 1 ? nonCarre(2, 99) : nonCarre(101, 143), n = Math.floor(Math.sqrt(a));
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


    /* =====================================================================
       Série 7 (semaine du 2 au 6 novembre)
       ===================================================================== */
    function pct(x) { return fr(x) + '\\,\\%'; }

    /* Repère quadrillé en SVG. o = { xmin, xmax, ymin, ymax, sub (carreaux par unité), points: [{nom, x, y}] } */
    function repere(o) {
        var sub = o.sub || 1, c = sub === 1 ? 44 : 24, m = 24;           // c : côté d'un carreau (px)
        var W = (o.xmax - o.xmin) * sub * c + 2 * m, H = (o.ymax - o.ymin) * sub * c + 2 * m;
        function X(x) { return m + (x - o.xmin) * sub * c; }
        function Y(y) { return m + (o.ymax - y) * sub * c; }
        var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Repère">';
        var k;
        for (k = 0; k <= (o.xmax - o.xmin) * sub; k++) s += '<line class="fig-grille" x1="' + (m + k * c) + '" y1="' + m + '" x2="' + (m + k * c) + '" y2="' + (H - m) + '"/>';
        for (k = 0; k <= (o.ymax - o.ymin) * sub; k++) s += '<line class="fig-grille" x1="' + m + '" y1="' + (m + k * c) + '" x2="' + (W - m) + '" y2="' + (m + k * c) + '"/>';
        s += '<line class="fig-axe" x1="' + (m - 8) + '" y1="' + Y(0) + '" x2="' + (W - m + 10) + '" y2="' + Y(0) + '"/>';
        s += '<line class="fig-axe" x1="' + X(0) + '" y1="' + (H - m + 8) + '" x2="' + X(0) + '" y2="' + (m - 10) + '"/>';
        // unités : 0, 1 sur chaque axe (comme dans les manuels), plus quelques graduations
        for (k = o.xmin; k <= o.xmax; k++) if (k !== 0) {
            s += '<line class="fig-axe" x1="' + X(k) + '" y1="' + (Y(0) - 4) + '" x2="' + X(k) + '" y2="' + (Y(0) + 4) + '"/>';
            s += '<text class="fig-txt" x="' + X(k) + '" y="' + (Y(0) + 17) + '" text-anchor="middle">' + (k < 0 ? '−' + (-k) : k) + '</text>';
        }
        for (k = o.ymin; k <= o.ymax; k++) if (k !== 0) {
            s += '<line class="fig-axe" x1="' + (X(0) - 4) + '" y1="' + Y(k) + '" x2="' + (X(0) + 4) + '" y2="' + Y(k) + '"/>';
            s += '<text class="fig-txt" x="' + (X(0) - 7) + '" y="' + (Y(k) + 4) + '" text-anchor="end">' + (k < 0 ? '−' + (-k) : k) + '</text>';
        }
        s += '<text class="fig-txt" x="' + (X(0) - 7) + '" y="' + (Y(0) + 16) + '" text-anchor="end">0</text>';
        (o.points || []).forEach(function (P) {
            s += '<circle class="fig-pt" cx="' + X(P.x) + '" cy="' + Y(P.y) + '" r="4"/>';
            s += '<text class="fig-nom" x="' + (X(P.x) + 7) + '" y="' + (Y(P.y) - 7) + '">' + P.nom + '</text>';
        });
        return s + '</svg>';
    }
    function coord(x, y) { return '(' + fr(x) + '\\ ;\\ ' + fr(y) + ')'; }

    /* ===== A15 · Pourcentage ↔ coefficient multiplicateur (QCM) ===== */
    Auto.coefMultiplicateur = function (niveau) {
        var q = { niveau: niveau, objectif: 'A15 · Coefficient multiplicateur' };
        if (niveau === 1) {
            var t = A.choix([A.entier(2, 9), A.entier(11, 45)]), hausse = Math.random() < 0.5, cm = arrondi(1 + (hausse ? t : -t) / 100);
            q.texte = (hausse ? 'Augmenter' : 'Diminuer') + ' une valeur de $' + pct(t) + '$ revient à la multiplier par :';
            q.explication = (hausse ? 'Hausse' : 'Baisse') + ' de $' + pct(t) + '$ : $CM=1' + (hausse ? '+' : '-') + fr(t / 100) + '=' + fr(cm) + '$.';
            var pieges = [arrondi(1 - (hausse ? t : -t) / 100), t / 100, t < 10 ? arrondi(1 + (hausse ? t : -t) / 10) : t];
            return qcm(q, [{ t: '$' + fr(cm) + '$', ok: true }].concat(pieges.map(function (x) { return { t: '$' + fr(x) + '$', ok: false }; })));
        }
        if (niveau === 2) {
            var cm2, u;
            do { cm2 = Math.random() < 0.5 ? A.entier(51, 98) / 100 : A.entier(102, 160) / 100; } while (cm2 * 100 % 10 === 0 && Math.random() < 0.5);
            u = Math.round(Math.abs(cm2 - 1) * 100);
            var sens = cm2 > 1 ? 'augmenter' : 'diminuer', autre = cm2 > 1 ? 'diminuer' : 'augmenter';
            q.texte = 'Multiplier une valeur par $' + fr(cm2) + '$ revient à :';
            q.explication = '$' + fr(cm2) + (cm2 > 1 ? '>' : '<') + '1$ : c\'est ' + (cm2 > 1 ? 'une hausse' : 'une baisse') + '. Taux : $' + fr(cm2) + '-1=' + fr(arrondi(cm2 - 1)) + '$, soit $' + (cm2 > 1 ? '+' : '-') + pct(u) + '$.';
            var cent = Math.round(cm2 * 100);
            return qcm(q, [
                { t: sens + ' de $' + pct(u) + '$', ok: true },
                { t: sens + ' de $' + pct(cent) + '$', ok: false },
                { t: autre + ' de $' + pct(u) + '$', ok: false },
                { t: sens + ' de $' + pct(arrondi(u / 100)) + '$', ok: false }
            ]);
        }
        var t3 = A.choix([10, 20, 30, 40, 50]), d = t3 / 100, ordre = Math.random() < 0.5;
        var cm3 = arrondi((1 + d) * (1 - d));
        q.texte = 'Un prix ' + (ordre ? 'augmente' : 'baisse') + ' de $' + pct(t3) + '$, puis ' + (ordre ? 'baisse' : 'augmente') + ' de $' + pct(t3) + '$. Au total, il a été multiplié par :';
        q.explication = '$' + (ordre ? fr(1 + d) + '\\times' + fr(1 - d) : fr(1 - d) + '\\times' + fr(1 + d)) + '=' + fr(cm3) + '$ : c\'est une baisse de $' + pct(Math.round((1 - cm3) * 100)) + '$, on ne revient pas au prix de départ.';
        return qcm(q, [
            { t: '$' + fr(cm3) + '$', ok: true },
            { t: '$1$', ok: false },
            { t: '$' + fr(arrondi(1 + d * d)) + '$', ok: false },
            { t: '$' + fr(arrondi(1 - d)) + '$', ok: false }
        ]);
    };

    /* ===== A13 · Calculer un pourcentage d'une quantité ===== */
    Auto.calculPourcentage = function (niveau) {
        var q = { niveau: niveau, objectif: 'A13 · Proportions', type: 'nombre' };
        var p, N;
        if (niveau === 1) {
            p = A.entier(1, 19) * 5; N = A.entier(3, 40) * 20;
            q.texte = 'Calculer $' + pct(p) + '$ de $' + fr(N) + '$.';
            q.attendu = p * N / 100;
            q.explication = '$' + frac(p, 100) + '\\times' + fr(N) + '=' + fr(q.attendu) + '$' + (p % 10 === 0 ? ' ($10\\,\\%$ de $' + fr(N) + '$ font $' + fr(N / 10) + '$, et on multiplie par $' + p / 10 + '$).' : ' ($10\\,\\%$ : $' + fr(N / 10) + '$ ; $5\\,\\%$ : $' + fr(N / 20) + '$).');
            return q;
        }
        if (niveau === 2) {
            p = A.choix([5, 15, 35, 45, 55, 65, 85, 95]); N = A.entier(3, 30) * 20;
            q.texte = 'Calculer $' + pct(p) + '$ de $' + fr(N) + '$.';
            q.attendu = arrondi(p * N / 100);
            q.explication = '$' + fr(p / 100) + '\\times' + fr(N) + '=' + fr(q.attendu) + '$' + (p % 5 === 0 && p % 10 ? ' ($10\\,\\%$ : $' + fr(N / 10) + '$ ; $5\\,\\%$ : $' + fr(N / 20) + '$).' : '.');
            return q;
        }
        p = A.choix([10, 20, 25, 30, 40, 75]); N = A.entier(4, 30) * 20;
        var v = p * N / 100;
        q.texte = '$' + pct(p) + '$ d\'un nombre valent $' + fr(v) + '$. Quel est ce nombre ?';
        q.attendu = N;
        q.explication = 'On cherche $N$ tel que $' + fr(p / 100) + '\\times N=' + fr(v) + '$, donc $N=' + frac(fr(v), fr(p / 100)) + '=' + fr(N) + '$.';
        return q;
    };

    /* ===== A10 · Équations ax + b = cx + d ===== */
    Auto.equationDeuxMembres = function (niveau) {
        var q = { niveau: niveau, objectif: 'A10 · Équations', type: 'nombre', prefixe: 'x =' };
        var poly = Interactif.poly, a, b, c, d, x;
        if (niveau < 3) {
            do {
                a = A.nonNul(-9, 9); c = A.nonNul(-9, 9); b = A.nonNul(-12, 12);
                if (niveau === 1) { x = A.nonNul(-6, 6); d = (a - c) * x + b; }
                else d = A.nonNul(-12, 12);
            } while (a === c || Math.abs(d) > 30 || (niveau === 2 && (d - b) % (a - c) === 0));
            var g = poly([a, b]), h = poly([c, d]);
            q.texte = 'Résoudre $' + g + '=' + h + '$' + (niveau === 2 ? ' (solution exacte, sous forme de fraction si besoin).' : '.');
            q.correction = [g + '&=' + h, poly([a - c, 0]) + '&=' + (d - b), 'x&=' + fracTex(d - b, a - c)];
            q.attendu = (d - b) / (a - c);
            return q;
        }
        var p = A.nonNul(-5, 5); x = A.nonNul(-6, 6);
        var k = 2 * p * x + p * p;                         // (x+p)^2 = x^2 + k
        var gauche = '(' + poly([1, p]) + ')^2', droite = poly([1, 0, k]);
        q.texte = 'Résoudre $' + gauche + '=' + droite + '$.';
        q.correction = [gauche + '&=' + droite, poly([1, 2 * p, p * p]) + '&=' + droite, poly([2 * p, 0]) + '&=' + (k - p * p), 'x&=' + x];
        q.attendu = x;
        return q;
    };

    /* ===== A20 · Lire des coordonnées dans un repère ===== */
    Auto.lireCoordonnees = function (niveau) {
        var q = { niveau: niveau, objectif: 'A20 · Repère orthogonal' };
        var x, y;
        if (niveau === 1) {
            do { x = A.nonNul(-3, 3); y = A.nonNul(-2, 2); } while (Math.abs(x) === Math.abs(y));
            q.figure = repere({ xmin: -4, xmax: 4, ymin: -3, ymax: 3, points: [{ nom: 'A', x: x, y: y }] });
            q.figureNote = 'A' + coord(x, y).replace(/\\ ;\\ /, ' ; ').replace(/\{,\}/g, ',');
            q.texte = 'Quelles sont les coordonnées du point $A$ ?';
            q.explication = 'On lit d\'abord l\'abscisse (axe horizontal), puis l\'ordonnée (axe vertical) : $A' + coord(x, y) + '$.';
            return qcm(q, [
                { t: '$A' + coord(x, y) + '$', ok: true },
                { t: '$A' + coord(y, x) + '$', ok: false },
                { t: '$A' + coord(-x, y) + '$', ok: false },
                { t: '$A' + coord(x, -y) + '$', ok: false }
            ]);
        }
        q.type = 'champs';
        if (niveau === 2) {
            do { x = A.nonNul(-7, 7) / 2; y = A.nonNul(-5, 5) / 2; } while (x % 1 === 0 && y % 1 === 0 || Math.abs(x) > 3.5 || Math.abs(y) > 2.5);
            q.figure = repere({ xmin: -4, xmax: 4, ymin: -3, ymax: 3, sub: 2, points: [{ nom: 'B', x: x, y: y }] });
            q.figureNote = 'B(' + fr(x).replace('{,}', ',') + ' ; ' + fr(y).replace('{,}', ',') + ')';
            q.texte = 'Chaque unité est partagée en deux carreaux. Lire les coordonnées du point $B$ (écriture décimale).';
            q.gabarit = '$B\\Big($ [] $;$ [] $\\Big)$';
            q.attendus = [x, y];
            q.explication = 'Un carreau vaut $0{,}5$. $B' + coord(x, y) + '$.';
            return q;
        }
        do { x = A.nonNul(-3, 3); y = A.nonNul(-2, 2); } while (Math.abs(x) === Math.abs(y));
        var cas = A.choix([
            { nom: 'à l\'origine $O$', x: -x, y: -y, pourquoi: 'les deux coordonnées changent de signe' },
            { nom: 'à l\'axe des abscisses', x: x, y: -y, pourquoi: 'l\'abscisse reste la même, l\'ordonnée change de signe' },
            { nom: 'à l\'axe des ordonnées', x: -x, y: y, pourquoi: 'l\'ordonnée reste la même, l\'abscisse change de signe' }
        ]);
        q.figure = repere({ xmin: -4, xmax: 4, ymin: -3, ymax: 3, points: [{ nom: 'C', x: x, y: y }] });
        q.figureNote = 'C(' + x + ' ; ' + y + ')';
        q.texte = 'Donner les coordonnées du point $D$, symétrique de $C$ par rapport ' + cas.nom + '.';
        q.gabarit = '$D\\Big($ [] $;$ [] $\\Big)$';
        q.attendus = [cas.x, cas.y];
        q.explication = '$C' + coord(x, y) + '$ ; ' + cas.pourquoi + ' : $D' + coord(cas.x, cas.y) + '$.';
        return q;
    };

    /* ===== A5 · Ordre de grandeur (réponse à écrire) ===== */
    Auto.ordreGrandeurNombre = function (niveau) {
        var q = { niveau: niveau, objectif: 'A5 · Encadrer, ordre de grandeur', type: 'nombre' };
        function proche(v0, ecart) { return arrondi(v0 + A.choix([-1, 1]) * A.entier(1, ecart)); }
        if (niveau < 3) {
            var p0 = A.choix(niveau === 1 ? [10, 50] : [20, 25, 75]), N0 = (niveau === 1 ? A.entier(2, 9) : A.entier(4, 16) * 2) * 100 * (niveau === 1 ? A.choix([1, 10]) : 1);
            if (niveau === 2 && p0 % 25 === 0) N0 = A.entier(2, 12) * 400;
            var p = arrondi(p0 + A.choix([-1, 1]) * A.entier(1, 9) / 10), N = proche(N0, Math.max(2, Math.round(N0 / 100)));
            q.texte = 'En remplaçant chaque nombre par une valeur « ronde », donner un ordre de grandeur de $' + pct(p) + '$ de $' + fr(N) + '$.';
            q.attendu = p0 * N0 / 100;
            q.explication = '$' + pct(p) + '\\approx' + pct(p0) + '$ et $' + fr(N) + '\\approx' + fr(N0) + '$ : environ $' + pct(p0) + '$ de $' + fr(N0) + '$, soit $' + fr(q.attendu) + '$.';
            return q;
        }
        var M0 = A.entier(2, 9) * 1000, k = A.choix([0.98, 0.99, 1.01, 1.02]), M = proche(M0, 20);
        var r0 = A.choix([10, 20]), R0 = A.entier(2, 9) * 1000, r = arrondi(r0 + A.choix([-1, 1]) * A.entier(1, 4) / 10), R = proche(R0, 15), plus = Math.random() < 0.5;
        q.texte = 'Donner un ordre de grandeur de $' + fr(k) + '\\times' + fr(M) + (plus ? '+' : '-') + pct(r) + '$ de $' + fr(R) + '$.';
        q.attendu = M0 + (plus ? 1 : -1) * r0 * R0 / 100;
        q.explication = '$' + fr(k) + '\\times' + fr(M) + '\\approx1\\times' + fr(M0) + '=' + fr(M0) + '$ et $' + pct(r) + '$ de $' + fr(R) + '\\approx' + pct(r0) + '$ de $' + fr(R0) + '=' + fr(r0 * R0 / 100) + '$ : environ $' + fr(q.attendu) + '$.';
        return q;
    };

    /* ===== A4 · Sommes de fractions décimales ===== */
    Auto.sommeDecimale = function (niveau) {
        var q = { niveau: niveau, objectif: 'A4 · Écritures d\'un nombre', type: 'nombre', decimal: true };
        if (niveau === 1) {
            var a = A.entier(1, 9), b = A.entier(11, 99), c = A.entier(1, 9);
            var t = [[a, 10], [b, 100], [c, 1000]];
            q.texte = 'Écrire sous forme décimale : $A=' + t.map(function (u) { return frac(u[0], fr(u[1])); }).join('+') + '$.';
            q.prefixe = 'A=';
            q.attendu = arrondi(a / 10 + b / 100 + c / 1000);
            q.explication = '$A=' + fr(a / 10) + '+' + fr(b / 100) + '+' + fr(c / 1000) + '=' + fr(q.attendu) + '$.';
            return q;
        }
        if (niveau === 2) {
            var n = A.entier(2, 15), b2 = A.entier(1, 9), c2 = A.entier(1, 9);
            q.texte = 'Écrire sous forme décimale : $B=' + n + '-' + frac(b2, 100) + '+' + frac(c2, fr(1000)) + '$.';
            q.prefixe = 'B=';
            q.attendu = arrondi(n - b2 / 100 + c2 / 1000);
            q.explication = '$B=' + n + '-' + fr(b2 / 100) + '+' + fr(c2 / 1000) + '=' + fr(arrondi(n - b2 / 100)) + '+' + fr(c2 / 1000) + '=' + fr(q.attendu) + '$.';
            return q;
        }
        var cas = A.choix([[4, [1, 3]], [8, [1, 3, 5, 7]], [5, [1, 2, 3, 4]], [20, [1, 3, 7, 9]]]), d = cas[0], num = A.choix(cas[1]);
        var m = A.entier(1, 9) * 5, e = 2;
        q.texte = 'Écrire sous forme décimale : $C=' + m + '\\times10^{-' + e + '}+' + frac(num, d) + '$.';
        q.prefixe = 'C=';
        q.attendu = arrondi(m / 100 + num / d);
        q.explication = '$' + m + '\\times10^{-2}=' + fr(m / 100) + '$ et $' + frac(num, d) + '=' + fr(num / d) + '$, donc $C=' + fr(q.attendu) + '$.';
        return q;
    };

    /* ===== A16 · Image et antécédent par une fonction ===== */
    Auto.imageFonction = function (niveau) {
        var q = { niveau: niveau, objectif: 'A16 · Images et antécédents' };
        var poly = Interactif.poly, par = Interactif.par, a, b, c, x0;
        if (niveau === 1) {
            a = A.entier(2, 6) * A.signe(); b = A.nonNul(-9, 9); x0 = -A.entier(2, 6);
            var im = a * x0 + b, vals = [im, -a * x0 + b, a * x0 - b, a + x0 + b];
            if (!distincts(vals)) return Auto.imageFonction(1);
            q.texte = 'On considère la fonction $f$ définie par $f(x)=' + poly([a, b]) + '$. L\'image de $' + x0 + '$ par $f$ est :';
            q.explication = '$f(' + x0 + ')=' + a + '\\times' + par(x0) + (b > 0 ? '+' : '') + b + '=' + (a * x0) + (b > 0 ? '+' : '') + b + '=' + im + '$.';
            return qcm(q, vals.map(function (v, k) { return { t: '$' + v + '$', ok: k === 0 }; }));
        }
        q.type = 'nombre';
        if (niveau === 2) {
            a = A.entier(1, 4) * A.signe(); b = A.nonNul(-5, 5); c = A.nonNul(-9, 9); x0 = -A.entier(1, 3);
            var g = poly([a, b, c]);
            q.texte = 'On considère la fonction $g$ définie par $g(x)=' + g + '$. Calculer $g(' + x0 + ')$.';
            q.attendu = a * x0 * x0 + b * x0 + c;
            q.explication = '$g(' + x0 + ')=' + (a === 1 ? '' : a === -1 ? '-' : a + '\\times') + par(x0) + '^2' + (b > 0 ? '+' : '') + b + '\\times' + par(x0) + (c > 0 ? '+' : '') + c + '=' + a * x0 * x0 + (b * x0 >= 0 ? '+' : '') + b * x0 + (c > 0 ? '+' : '') + c + '=' + q.attendu + '$.<br>Attention : $' + par(x0) + '^2=' + x0 * x0 + '$.';
            return q;
        }
        a = A.entier(2, 6) * A.signe(); b = A.nonNul(-9, 9); x0 = A.nonNul(-6, 6);
        var v = a * x0 + b;
        q.texte = 'On considère la fonction $f$ définie par $f(x)=' + poly([a, b]) + '$. Déterminer l\'antécédent de $' + v + '$ par $f$.';
        q.prefixe = 'x =';
        q.attendu = x0;
        q.correction = [poly([a, b]) + '&=' + v, a + 'x&=' + (v - b), 'x&=' + x0];
        return q;
    };

    /* ===== A1 · Ranger des nombres écrits différemment (sans choix proposés) ===== */
    Auto.rangerEcritures = function (niveau) {
        var q = { niveau: niveau, objectif: 'A1 · Comparer deux nombres', type: 'ordre' };
        var vals;
        do {
            if (niveau === 1) {
                var n = A.entier(1, 4), quart = A.choix([1, 3]), base = n + quart / 4;
                vals = [ecrFraction(base, 4), ecrDecimal(arrondi(Math.round(base * 10) / 10 + A.choix([0, 0.1]))), ecrPuissance(arrondi(Math.floor(base * 10) / 10), 1)];
            } else if (niveau === 2) {
                var k = A.entier(3, 8);
                vals = [ecrDecimal(arrondi(k / 100 + A.entier(1, 9) / 1000)), ecrPuissance(arrondi((k + 1) / 100), 2), ecrFraction(arrondi((2 * k + 1) / 200), 200), ecrDecimal(arrondi(k / 100 + A.entier(1, 9) / 10000))];
            } else {
                var p = A.entier(3, 8), f1 = p / (p + 1), f2 = (p + 1) / (p + 2);
                vals = [{ v: f1, t: '$' + frac(p, p + 1) + '$' }, { v: f2, t: '$' + frac(p + 1, p + 2) + '$' }, ecrDecimal(arrondi(Math.round((f1 + f2) / 2 * 1000) / 1000))];
            }
        } while (!distincts(vals.map(function (x) { return x.v; })));
        vals = melanger(vals);
        var L = 'ABCD';
        q.texte = 'Ranger dans l\'ordre croissant (écris les lettres, du plus petit au plus grand) :<br>' +
            vals.map(function (x, k) { return '<b>' + L[k] + '</b> : ' + x.t; }).join(' &nbsp; ');
        var ordre = vals.map(function (x, k) { return { v: x.v, l: L[k], t: x.t }; }).sort(function (u, w) { return u.v - w.v; });
        q.attendu = ordre.map(function (o) { return o.l; }).join('');
        q.explication = ordre.map(function (o) { return o.t === '$' + fr(o.v) + '$' ? o.t : o.t.replace(/\$$/, '') + (o.v * 1000 % 1 ? '\\approx' + fr(Math.round(o.v * 1000) / 1000) : '=' + fr(o.v)) + '$'; }).join(' $<$ ') + ', donc <b>' + q.attendu + '</b>.';
        return q;
    };

    /* ===== A5 · Encadrer une racine carrée (automatisme final) ===== */
    Auto.encadrerRacineFinal = function (niveau) {
        var q = { niveau: niveau, objectif: 'A5 · Encadrer, ordre de grandeur', type: 'champs' };
        if (niveau === 1) {
            var a = nonCarre(26, 143), n = Math.floor(Math.sqrt(a));
            q.texte = 'Sans calculatrice, encadrer $\\sqrt{' + a + '}$ entre deux entiers consécutifs.';
            q.gabarit = '[] $<\\sqrt{' + a + '}<$ []';
            q.attendus = [n, n + 1];
            q.explication = '$' + n * n + '<' + a + '<' + (n + 1) * (n + 1) + '$, donc $' + n + '<\\sqrt{' + a + '}<' + (n + 1) + '$.';
            return q;
        }
        if (niveau === 2) {
            var b = nonCarre(2, 143), d10 = Math.floor(Math.sqrt(b * 100));
            while (d10 * d10 > b * 100) d10--;
            while ((d10 + 1) * (d10 + 1) <= b * 100) d10++;
            var d = d10 / 10, e = (d10 + 1) / 10;
            q.texte = 'Encadrer $\\sqrt{' + b + '}$ entre deux décimaux consécutifs au dixième.';
            q.gabarit = '[] $<\\sqrt{' + b + '}<$ []';
            q.attendus = [d, e];
            q.explication = '$' + fr(d) + '^2=' + fr(arrondi(d * d)) + '$ et $' + fr(e) + '^2=' + fr(arrondi(e * e)) + '$ : $' + fr(d) + '<\\sqrt{' + b + '}<' + fr(e) + '$.';
            return q;
        }
        var k = A.entier(2, 5), m, kk;
        do { m = nonCarre(2, 15); kk = k * k * m; } while (kk > 143);
        var r = Math.floor(Math.sqrt(kk));
        q.texte = 'Encadrer $' + k + '\\sqrt{' + m + '}$ entre deux entiers consécutifs.';
        q.gabarit = '[] $<' + k + '\\sqrt{' + m + '}<$ []';
        q.attendus = [r, r + 1];
        q.explication = '$' + k + '\\sqrt{' + m + '}=\\sqrt{' + k + '^2\\times' + m + '}=\\sqrt{' + kk + '}$ et $' + r * r + '<' + kk + '<' + (r + 1) * (r + 1) + '$, donc $' + r + '<' + k + '\\sqrt{' + m + '}<' + (r + 1) + '$.';
        return q;
    };


    /* ===== A3 · Puissances : règles de calcul ===== */
    Auto.puissances = function (niveau) {
        var q = { niveau: niveau, objectif: 'A3 · Puissances' };
        function pw(a, n) { return a + '^{' + n + '}'; }
        if (niveau === 1) {
            var a = A.entier(2, 9), m, n, op = A.choix(['quotient', 'produit']), r;
            do { m = A.nonNul(-6, 8); n = A.nonNul(-6, 8); } while (m === n || Math.abs(m) === Math.abs(n) || m * n === m + n || m * n === m - n);
            if (op === 'quotient') {
                r = m - n;
                q.texte = '$' + frac(pw(a, m), pw(a, n)) + '$ est égal à :';
                q.explication = '$' + frac('a^m', 'a^n') + '=a^{m-n}$ : $' + frac(pw(a, m), pw(a, n)) + '=' + a + '^{' + m + '-' + Interactif.par(n) + '}=' + pw(a, r) + '$.';
                var faux = [m + n, n - m, m * n];
            } else {
                r = m + n;
                q.texte = '$' + pw(a, m) + '\\times' + pw(a, n) + '$ est égal à :';
                q.explication = '$a^m\\times a^n=a^{m+n}$ : $' + pw(a, m) + '\\times' + pw(a, n) + '=' + a + '^{' + m + '+' + Interactif.par(n) + '}=' + pw(a, r) + '$.';
                var faux = [m - n, m * n, null];
            }
            var opts = [{ t: '$' + pw(a, r) + '$', ok: true }];
            faux.forEach(function (f) { if (f !== null && f !== r) opts.push({ t: '$' + pw(a, f) + '$', ok: false }); });
            if (opts.length < 4) opts.push({ t: '$' + pw(a * a, r) + '$', ok: false });
            opts = opts.slice(0, 4);
            var vus = {}; opts.forEach(function (o) { vus[o.t] = 1; });
            if (Object.keys(vus).length < 4) return Auto.puissances(1);
            return qcm(q, opts);
        }
        q.type = 'nombre'; q.prefixe = 'n =';
        if (niveau === 2) {
            var b = A.choix([2, 3, 5, 10]), p, k, e, d;
            do { p = A.nonNul(-5, 7); k = A.entier(2, 3); e = A.nonNul(-4, 3); d = A.nonNul(-4, 4); } while (p + k * e - d === 0 || p === 1 || e === 1 || d === 1);
            var res = p + k * e - d;
            q.texte = 'Écrire sous la forme $' + b + '^n$ : $' + frac(pw(b, p) + '\\times(' + pw(b, e) + ')^{' + k + '}', pw(b, d)) + '$. Donner $n$.';
            q.attendu = res;
            q.explication = '$(' + pw(b, e) + ')^{' + k + '}=' + pw(b, k * e) + '$, puis $' + p + '+' + Interactif.par(k * e) + '-' + Interactif.par(d) + '=' + res + '$ : le résultat est $' + pw(b, res) + '$.';
            return q;
        }
        var cas = A.choix([[2, 4, 8], [3, 9, 27]]), base = cas[0], u = A.entier(1, 4), v = A.entier(1, 3), w = A.entier(1, 6);
        var res3 = 2 * u + 3 * v - w;
        q.texte = 'Écrire sous la forme $' + base + '^n$ : $' + frac(pw(cas[1], u) + '\\times' + pw(cas[2], v), pw(base, w)) + '$. Donner $n$.';
        q.attendu = res3;
        q.explication = '$' + cas[1] + '=' + base + '^2$ et $' + cas[2] + '=' + base + '^3$ : $' + frac(pw(base, 2 * u) + '\\times' + pw(base, 3 * v), pw(base, w)) + '=' + base + '^{' + (2 * u) + '+' + (3 * v) + '-' + w + '}=' + pw(base, res3) + '$.';
        return q;
    };

    /* =====================================================================
       Série 5 (semaine du 5 au 9 octobre) : proportions, scripts Python, équations
       ===================================================================== */
    // pièges de QCM : valeurs entières positives, distinctes entre elles et de la bonne réponse ; complétées si besoin
    function pieges(bon, cands) {
        var vus = {}, res = [];
        vus[bon] = true;
        cands.forEach(function (x) { x = arrondi(x); if (x > 0 && x % 1 === 0 && !vus[x] && res.length < 3) { vus[x] = true; res.push(x); } });
        for (var k = 1; res.length < 3; k++) if (!vus[bon + k * 10]) { vus[bon + k * 10] = true; res.push(bon + k * 10); }
        return res;
    }
    function qcmNombres(q, bon, cands, unite) {
        var u = unite || '';
        return qcm(q, [{ t: '$' + fr(bon) + u + '$', ok: true }].concat(pieges(bon, cands).map(function (x) { return { t: '$' + fr(x) + u + '$', ok: false }; })));
    }
    function fracTxt(a, b) { return '$' + frac(a, b) + '$'; }
    // « 1/3 des élèves », mais « les 3/8 des livres »
    function lesFrac(a, b) { return (a === 1 ? '' : 'les ') + fracTxt(a, b); }

    /* ===== A13 · Proportions : d'un effectif à un pourcentage ===== */
    var GROUPES_ELEVES = [
        ['élèves', 'sont externes', 'd\'externes', 'externes'],
        ['adhérents d\'un club', 'font de la compétition', 'de compétiteurs', 'compétiteurs'],
        ['enfants', 'sont des garçons', 'de garçons', 'garçons'],
        ['spectateurs', 'sont abonnés', 'd\'abonnés', 'abonnés']
    ];
    Auto.proportionGroupe = function (niveau) {
        var q = { niveau: niveau, objectif: 'A13 · Proportions' }, g = A.choix(GROUPES_ELEVES), N, p, n;
        if (niveau === 1) {
            do { N = A.choix([20, 25, 40, 50, 60, 80, 120, 200]); p = A.entier(1, 19) * 5; n = p * N / 100; } while (n % 1 || n === p || p === 50);
            q.texte = 'Dans un groupe de $' + N + '$ ' + g[0] + ', $' + n + '$ ' + g[1] + '. Le pourcentage ' + g[2] + ' dans ce groupe est :';
            q.explication = 'Proportion ' + g[2] + ' : $' + frac(n, N) + '=' + fr(p / 100) + '=' + frac(p, 100) + '$, soit $' + pct(p) + '$.';
            return qcmNombres(q, p, [n, 100 - p, p < 50 ? 2 * p : p / 5, N - n], '\\,\\%');
        }
        q.type = 'champs';
        if (niveau === 2) {
            var d;
            do { N = A.choix([20, 24, 25, 32, 36, 40, 48, 60, 80]); p = A.entier(1, 19) * 5; n = p * N / 100; d = pgcd(n, N); } while (n % 1 || d === 1 || N / d === 100 || p === 50);
            q.texte = 'Dans un groupe de $' + N + '$ ' + g[0] + ', $' + n + '$ ' + g[1] + '. Donner la proportion ' + g[2] + ' sous forme de fraction irréductible, puis sous forme décimale, puis en pourcentage.';
            q.gabarit = '[] $/$ [] $=$ [] $=$ [] $\\,\\%$';
            q.attendus = [n / d, N / d, p / 100, p];
            q.explication = '$' + frac(n, N) + '=' + frac(n / d + '\\times' + d, N / d + '\\times' + d) + '=' + frac(n / d, N / d) + '=' + fr(p / 100) + '=' + pct(p) + '$.';
            return q;
        }
        var NA, NB, pA, pB, a, b, pt;
        do {
            NA = A.choix([20, 24, 25, 28, 30, 32, 35, 36, 40]); NB = A.choix([20, 24, 25, 28, 30, 32, 35, 36, 40]);
            pA = A.entier(2, 16) * 5; pB = A.entier(2, 16) * 5; a = pA * NA / 100; b = pB * NB / 100;
            pt = (a + b) / (NA + NB) * 100;
        } while (NA === NB || a % 1 || b % 1 || pt % 5 || pA === pB || pt === (pA + pB) / 2);
        q.texte = 'Dans la classe A, $' + a + '$ élèves sur $' + NA + '$ sont des filles ; dans la classe B, $' + b + '$ élèves sur $' + NB + '$. On réunit les deux classes. Quelle est la proportion de filles dans le groupe, en pourcentage ?';
        q.gabarit = '[] $\\,\\%$';
        q.attendus = [pt];
        q.explication = 'Il y a $' + a + '+' + b + '=' + (a + b) + '$ filles sur $' + NA + '+' + NB + '=' + (NA + NB) + '$ élèves : $' + frac(a + b, NA + NB) + '=' + fr(pt / 100) + '$, soit $' + pct(pt) + '$.<br>' +
            'Ce n\'est pas la moyenne de $' + pct(pA) + '$ et $' + pct(pB) + '$ (qui ferait $' + pct((pA + pB) / 2) + '$) : les deux classes n\'ont pas le même effectif.';
        return q;
    };

    /* ===== A13 · Proportions : fraction ou pourcentage d'une quantité, puis ce qui reste ===== */
    var RESTES = [
        { tout: 'Une bibliothèque compte', unite: 'livres', a: 'sont des romans', b: 'sont des bandes dessinées', q: 'Combien de livres ne sont ni des romans ni des bandes dessinées ?' },
        { tout: 'Un club de sport compte', unite: 'adhérents', a: 'font du football', b: 'font du basket', q: 'Chacun pratique un seul sport. Combien d\'adhérents pratiquent un autre sport ?' },
        { tout: 'Un collège compte', unite: 'élèves', a: 'sont demi-pensionnaires', b: 'sont externes', q: 'Les autres sont internes. Combien y a-t-il d\'internes ?' }
    ];
    var TOTAUX = [
        { quoi: 'billes', a: 'sont rouges', b: 'sont bleues', c: 'sont vertes', q: 'Combien y a-t-il de billes dans le sac ?', debut: 'Dans un sac,' },
        { quoi: 'participants', a: 'sont des enfants', b: 'sont des seniors', c: 'sont des adultes', q: 'Combien y a-t-il de participants ?', debut: 'Dans une course,' }
    ];
    function resteQuantite(q) {
        var c = A.choix(RESTES), a, b, p, N, na, nb, r;
        do {
            var fr0 = A.choix([[1, 4], [3, 8], [2, 5], [1, 3], [5, 8], [3, 10], [1, 6]]); a = fr0[0]; b = fr0[1];
            p = A.entier(2, 8) * 5; N = A.entier(2, 12) * 40 * (b === 3 || b === 6 ? 3 : 1);
            na = N * a / b; nb = p * N / 100; r = N - na - nb;
        } while (na % 1 || nb % 1 || r <= 0 || N > 1200);
        q.type = 'nombre';
        q.texte = c.tout + ' $' + fr(N) + '$ ' + c.unite + ' : ' + lesFrac(a, b) + ' ' + c.a + ' et $' + pct(p) + '$ ' + c.b + '. ' + c.q;
        q.attendu = r;
        q.explication = fracTxt(a, b) + ' de $' + fr(N) + '$ : $' + frac(a + '\\times' + fr(N), b) + '=' + fr(na) + '$. $' + pct(p) + '$ de $' + fr(N) + '$ : $' + fr(p / 100) + '\\times' + fr(N) + '=' + fr(nb) + '$.<br>' +
            'Il en reste $' + fr(N) + '-' + fr(na) + '-' + fr(nb) + '=' + fr(r) + '$.';
        return q;
    }
    function totalQuantite(q) {
        var c = A.choix(TOTAUX), b, p, T, r, reste;
        do {
            b = A.choix([3, 4, 5, 6]); p = A.entier(2, 10) * 5; T = A.entier(1, 8) * 60;
            reste = 1 - 1 / b - p / 100; r = arrondi(T * reste);
        } while (reste <= 0 || r % 1 || T / b % 1 || p * T / 100 % 1 || r > 80);
        q.type = 'nombre';
        q.texte = c.debut + ' ' + fracTxt(1, b) + ' des ' + c.quoi + ' ' + c.a + ', $' + pct(p) + '$ ' + c.b + ' et les $' + r + '$ autres ' + c.c + '. ' + c.q;
        q.attendu = T;
        var res = fracTex(100 * b - 100 - p * b, 100 * b);
        q.explication = 'Les ' + c.quoi + ' qui ' + c.c + ' représentent $1-' + frac(1, b) + '-' + frac(p, 100) + '=' + res + '$ du total.<br>' +
            'Si $N$ est le nombre total : $' + res + '\\times N=' + r + '$, donc $N=' + r + '\\div' + res + '=' + T + '$.';
        return q;
    }
    Auto.fractionQuantite = function (niveau) {
        var q = { niveau: niveau, objectif: 'A13 · Proportions' };
        if (niveau === 2) return resteQuantite(q);
        if (niveau === 3) return totalQuantite(q);
        var c = A.choix([[1, 2], [1, 3], [1, 4], [1, 5], [2, 3], [3, 4], [2, 5], [3, 5], [3, 10]]), a = c[0], b = c[1];
        var N = b * A.entier(4, 24), n = N * a / b;
        var ctx = A.choix([['Un panier contient', 'fruits', 'de fruits mûrs', 'Le nombre de fruits mûrs'], ['Un club compte', 'adhérents', 'd\'adhérents mineurs', 'Le nombre d\'adhérents mineurs'], ['Un parking contient', 'voitures', 'de voitures électriques', 'Le nombre de voitures électriques']]);
        q.texte = ctx[0] + ' $' + N + '$ ' + ctx[1] + '. La proportion ' + ctx[2] + ' est égale à ' + fracTxt(a, b) + '. ' + ctx[3] + ' est :';
        q.explication = fracTxt(a, b) + ' de $' + N + '$ : $' + frac(a + '\\times' + N, b) + '=' + n + '$ (on divise $' + N + '$ par $' + b + '$, puis on multiplie par $' + a + '$).';
        return qcmNombres(q, n, [N - n, a > 1 ? N / b : N / b + b, n * 2, N * b], '');
    };
    Auto.pourcentageQuantite = function (niveau) {
        var q = { niveau: niveau, objectif: 'A13 · Proportions' };
        if (niveau === 2) return resteQuantite(q);
        if (niveau === 3) return totalQuantite(q);
        var p = A.entier(1, 19) * 5, N = A.entier(5, 50) * 20, n = p * N / 100;
        var ctx = A.choix([['Une salle de concert accueille', 'spectateurs', 'd\'entre eux ont moins de $18$ ans', 'Le nombre de spectateurs de moins de $18$ ans'], ['Un lycée compte', 'élèves', 'd\'entre eux viennent en bus', 'Le nombre d\'élèves qui viennent en bus']]);
        q.texte = ctx[0] + ' $' + fr(N) + '$ ' + ctx[1] + '. $' + pct(p) + '$ ' + ctx[2] + '. ' + ctx[3] + ' est :';
        q.explication = '$' + pct(p) + '$ de $' + fr(N) + '$ : $' + frac(p + '\\times' + fr(N), 100) + '=' + fr(n) + '$.';
        return qcmNombres(q, n, [n * 10, n / 10, N - n, p * N / 1000 === n ? n + N / 10 : n * 2], '');
    };

    /* ===== A13 · Proportions : proportion d'une proportion ===== */
    Auto.proportionDeProportion = function (niveau) {
        var q = { niveau: niveau, objectif: 'A13 · Proportions' };
        if (niveau === 1) {
            var a, b, c, d;
            do { b = A.choix([3, 4, 5]); d = A.choix([3, 4, 5]); a = A.entier(1, b - 1); c = A.entier(1, d - 1); } while (pgcd(a, b) > 1 || pgcd(c, d) > 1 || (a * c === 1 && b * d < 12));
            q.texte = 'Dans un lycée, ' + lesFrac(a, b) + ' des élèves sont internes. Parmi eux, ' + lesFrac(c, d) + ' sont des filles. La proportion des filles internes parmi l\'ensemble des élèves du lycée est égale à :';
            q.explication = 'On prend ' + fracTxt(c, d) + ' de ' + fracTxt(a, b) + ' : on multiplie, $' + frac(c, d) + '\\times' + frac(a, b) + '=' + frac(a * c, b * d) + (pgcd(a * c, b * d) > 1 ? '=' + fracTex(a * c, b * d) : '') + '$.';
            var vus = {}, opts = [];
            [[a * c, b * d, true], [a + c, b + d], [c, d], [a, b], [a * d, b * c], [a * c, b + d], [a * c, 2 * b * d], [1, b * d]].forEach(function (f) {
                var v = arrondi(f[0] / f[1]);
                if (vus[v] || opts.length >= 4 || v >= 1) return;
                vus[v] = true; opts.push({ t: '$' + fracTex(f[0], f[1]) + '$', ok: !!f[2] });
            });
            return qcm(q, opts);
        }
        if (niveau === 2) {
            var N, p1, p2, n;
            do { N = A.entier(2, 12) * 100; p1 = A.choix([20, 25, 30, 35, 40, 45, 60]); p2 = A.choix([20, 40, 50, 60, 80]); n = N * p1 * p2 / 10000; } while (n % 1);
            q.type = 'champs';
            q.texte = 'Un lycée compte $' + fr(N) + '$ élèves. $' + pct(p1) + '$ sont en seconde et, parmi les élèves de seconde, $' + pct(p2) + '$ prennent le bus. Combien d\'élèves de seconde prennent le bus ? Quelle proportion des élèves du lycée cela représente-t-il ?';
            q.gabarit = '[] élèves, soit [] $\\,\\%$ des élèves du lycée';
            q.attendus = [n, p1 * p2 / 100];
            q.explication = 'Élèves de seconde : $' + fr(p1 / 100) + '\\times' + fr(N) + '=' + fr(N * p1 / 100) + '$ ; parmi eux, $' + fr(p2 / 100) + '\\times' + fr(N * p1 / 100) + '=' + fr(n) + '$ prennent le bus.<br>' +
                'Proportion : $' + fr(p1 / 100) + '\\times' + fr(p2 / 100) + '=' + fr(arrondi(p1 * p2 / 10000)) + '$, soit $' + pct(p1 * p2 / 100) + '$ (on vérifie : $' + frac(fr(n), fr(N)) + '=' + fr(arrondi(n / N)) + '$).';
            return q;
        }
        var pv, r, qi;
        do { pv = A.choix([40, 45, 50, 60, 75, 80]); r = A.entier(2, 12) * 5; qi = arrondi(pv * r / 100); } while (qi % 1 === 0 && Math.random() < 0.7);
        q.type = 'champs';
        q.texte = 'Lors d\'une élection, $' + pct(pv) + '$ des inscrits ont voté (suffrages exprimés). Un candidat a obtenu un nombre de voix représentant $' + pct(qi) + '$ des inscrits. Quel pourcentage des suffrages exprimés a-t-il obtenu ?';
        q.gabarit = '[] $\\,\\%$';
        q.attendus = [r];
        q.explication = 'Si $t$ est la proportion cherchée : $t\\times' + fr(pv / 100) + '=' + fr(arrondi(qi / 100)) + '$ (proportion de proportion : on multiplie).<br>' +
            'Donc $t=' + frac(fr(arrondi(qi / 100)), fr(pv / 100)) + '=' + fr(r / 100) + '$, soit $' + pct(r) + '$.';
        return q;
    };

    /* ----- Petits scripts Python : affichage et exécution ----- */
    function code(lignes) {
        return '<pre class="q-code">' + lignes.join('\n').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>';
    }
    function console2(u, v) { return '<span class="q-console">' + u + (v === undefined ? '' : ' ' + v) + '</span>'; }
    // exécute des affectations « a = expression » (entiers, + - * et parenthèses) ; renvoie les valeurs et la trace
    function executer(lignes) {
        var v = {}, trace = [];
        lignes.forEach(function (l) {
            var m = l.match(/^(\w+) = (.+)$/);
            if (!m) return;
            v[m[1]] = new Function('v', 'return ' + m[2].replace(/\b([a-z]\w*)\b/g, 'v.$1') + ';')(v);
            trace.push('<code>' + m[1] + '</code> vaut $' + v[m[1]] + '$');
        });
        return { v: v, trace: trace };
    }
    // a * x + b écrit en Python : 3 * x - 2 ; x + 4 ; -x
    function lin(a, b, x) {
        x = x || 'x';
        var s = a === 1 ? x : a === -1 ? '-' + x : a + ' * ' + x;
        return s + (b > 0 ? ' + ' + b : b < 0 ? ' - ' + -b : '');
    }

    /* ===== Algo · Variables et affectations ===== */
    Auto.scriptAffectations = function (niveau) {
        var q = { niveau: niveau, objectif: 'Algo · Variables et affectations' }, lignes, r;
        if (niveau === 1) {
            var m, n, e1, e2, naif, opts;
            do {
                m = A.entier(2, 9); n = A.entier(2, 9); e1 = A.choix(['a + b', 'a * b', 'a - b', 'b - a']); e2 = A.choix(['a - b', 'a + b', '2 * a', 'a * b']);
                lignes = ['a = ' + m, 'b = ' + n, 'a = ' + e1, 'b = ' + e2];
                r = executer(lignes);
                naif = executer(['a = ' + m, 'b = ' + n, 'c = ' + e2.replace(/\ba\b/g, m)]).v.c;   // b calculé avec l'ancienne valeur de a
                opts = [[r.v.a, r.v.b], [r.v.a, naif], [r.v.b, r.v.a], [m, r.v.b]];
            } while (m === n || opts.some(function (o, k) { return opts.some(function (p, j) { return j < k && p[0] === o[0] && p[1] === o[1]; }); }));
            q.texte = 'Qu\'affiche ce script ?' + code(lignes.concat('print(a, b)'));
            q.explication = 'On exécute les lignes dans l\'ordre, en utilisant la <b>dernière</b> valeur de chaque variable : ' + r.trace.join(', puis ') + '.<br>Le script affiche ' + console2(r.v.a, r.v.b) + '.';
            return qcm(q, opts.map(function (o, k) { return { t: console2(o[0], o[1]), ok: k === 0 }; }));
        }
        q.type = 'champs';
        q.gabarit = 'La console affiche : [] [] ';
        if (niveau === 2) {
            var cas = A.entier(1, 3), x0 = A.entier(2, 5), k = A.entier(1, 9), c = A.entier(2, 4), y0 = A.entier(2, 6);
            if (cas === 1) lignes = ['x = ' + x0, 'y = x * x - ' + k, 'x = y - x', 'y = ' + c + ' * x + y'];
            else if (cas === 2) lignes = ['x = -' + x0, 'y = ' + y0, 'x = x * y', 'y = y - x', 'x = x + y'];
            else { var a0 = A.entier(2, 9), b0; do { b0 = A.entier(2, 9); } while (b0 === a0); lignes = ['a = ' + a0, 'b = ' + b0, 'a = b', 'b = a']; }
            r = executer(lignes);
            var noms = cas === 3 ? ['a', 'b'] : ['x', 'y'];
            q.texte = (cas === 3 ? 'Ce script devait échanger les valeurs de <code>a</code> et <code>b</code>. Qu\'affiche-t-il ?' : 'Qu\'affiche ce script ?') + code(lignes.concat('print(' + noms.join(', ') + ')'));
            q.attendus = [r.v[noms[0]], r.v[noms[1]]];
            q.explication = r.trace.join(', puis ') + '.<br>Le script affiche ' + console2(q.attendus[0], q.attendus[1]) + '.' +
                (cas === 3 ? '<br>Dès la ligne <code>a = b</code>, l\'ancienne valeur de <code>a</code> est perdue : les deux variables valent $' + q.attendus[0] + '$.' : '');
            return q;
        }
        if (Math.random() < 0.5) {
            var u = A.entier(2, 12), w; do { w = A.entier(2, 12); } while (w === u);
            lignes = ['a = ' + u, 'b = ' + w, 'a = a + b', 'b = a - b', 'a = a - b'];
            r = executer(lignes);
            q.texte = 'Qu\'affiche ce script ? (Que fait-il, quelles que soient les valeurs de départ ?)' + code(lignes.concat('print(a, b)'));
            q.attendus = [r.v.a, r.v.b];
            q.explication = r.trace.join(', puis ') + '.<br>Le script affiche ' + console2(r.v.a, r.v.b) + ' : il <b>échange</b> les valeurs de <code>a</code> et <code>b</code> sans variable supplémentaire.';
            return q;
        }
        var kk = A.entier(2, 4), mm = A.entier(1, 9), a0b = A.nonNul(-5, 9), t = 2 * ((kk - 1) * a0b - mm);
        q.type = 'nombre';
        delete q.gabarit;
        q.prefixe = '? =';
        q.texte = 'Quel nombre faut-il écrire à la place du <code>?</code> pour que le script affiche $' + t + '$ ?' + code(['a = ?', 'b = ' + kk + ' * a - ' + mm, 'a = 2 * (b - a)', 'print(a)']);
        q.attendu = a0b;
        q.explication = 'Si on part de $a$, alors <code>b</code> vaut $' + kk + 'a-' + mm + '$, puis <code>a</code> vaut $2(' + kk + 'a-' + mm + '-a)=' + Interactif.poly([2 * (kk - 1), -2 * mm], 'a') + '$.<br>' +
            'On résout $' + Interactif.poly([2 * (kk - 1), -2 * mm], 'a') + '=' + t + '$ : $' + 2 * (kk - 1) + 'a=' + (t + 2 * mm) + '$, donc $a=' + a0b + '$.';
        return q;
    };

    /* ===== Algo · Structures conditionnelles ===== */
    Auto.scriptConditionnel = function (niveau) {
        var q = { niveau: niveau, objectif: 'Algo · Structures conditionnelles' };
        var AIDE = '<span class="q-aide-code"><code>if</code> signifie « si » et <code>else</code> signifie « sinon ».</span>';
        function fonction(s, a, b, c, d) {
            return ['def f(x):', '    if x >= ' + s + ':', '        return ' + lin(a, b), '    else:', '        return ' + lin(c, d)];
        }
        var s, a, b, c, d;
        if (niveau === 1) {
            var v, bon, autre;
            do {
                s = A.entier(2, 8); a = A.entier(2, 5); b = A.nonNul(-9, 9); c = A.choix([-1, 1, 2, 3]); d = A.nonNul(-9, 9);
                v = s + A.choix([-2, -1, 0, 0, 1, 2]);
                bon = v >= s ? a * v + b : c * v + d; autre = v >= s ? c * v + d : a * v + b;
            } while (bon === autre || bon === v);
            q.texte = 'Que renvoie <code>f(' + v + ')</code> ?' + AIDE + code(fonction(s, a, b, c, d));
            q.explication = '$' + v + (v >= s ? '\\geqslant ' : '<') + s + '$ : ' + (v >= s ? 'la condition est vraie' : 'la condition est fausse, on passe au <code>else</code>') +
                '. <code>f(' + v + ')</code> renvoie $' + (v >= s ? (a === 1 ? '' : a + '\\times') + Interactif.par(v) + (b > 0 ? '+' + b : b) : (c === 1 ? '' : c === -1 ? '-' : c + '\\times') + Interactif.par(v) + (d > 0 ? '+' + d : d)) + '=' + bon + '$.';
            var cands = [autre, bon + 1, bon - 1, -bon, v].filter(function (x) { return x !== bon; });
            var vus = {}, opts = [{ t: '$' + bon + '$', ok: true }];
            vus[bon] = true;
            cands.forEach(function (x) { if (!vus[x] && opts.length < 4) { vus[x] = true; opts.push({ t: '$' + x + '$', ok: false }); } });
            return qcm(q, opts);
        }
        if (niveau === 2) {
            var m, s1, p, k, s2, r2, lignes, tr;
            do {
                m = A.entier(2, 12); s1 = A.entier(2, 10); p = A.entier(2, 3); k = A.entier(1, 9); s2 = A.entier(5, 15); r2 = A.choix([5, 10]);
                lignes = ['a = ' + m, 'if a > ' + s1 + ':', '    a = ' + p + ' * a - ' + k, 'if a > ' + s2 + ':', '    a = a - ' + r2, 'print(a)'];
                var x = m; tr = ['<code>a</code> vaut $' + m + '$'];
                if (x > s1) { x = p * x - k; tr.push('$' + m + '>' + s1 + '$ donc <code>a</code> devient $' + p + '\\times' + m + '-' + k + '=' + x + '$'); } else tr.push('$' + m + '\\leqslant ' + s1 + '$ : la première condition est fausse');
                var y = x;
                if (x > s2) { y = x - r2; tr.push('$' + x + '>' + s2 + '$ donc <code>a</code> devient $' + x + '-' + r2 + '=' + y + '$'); } else tr.push('$' + x + '\\leqslant ' + s2 + '$ : la seconde condition est fausse');
            } while (Math.random() < 0.6 && !(m > s1 && x > s2));
            q.type = 'nombre';
            q.texte = 'Qu\'affiche ce programme ?' + code(lignes);
            q.attendu = y;
            q.explication = tr.join(' ; ') + '.<br>Le programme affiche ' + console2(y) + '.';
            return q;
        }
        var x1, x2, kv;
        do {
            s = A.entier(-2, 6); a = A.entier(2, 5); c = A.choix([-3, -2, -1, 1, 2]); b = A.nonNul(-9, 9);
            x1 = s + A.entier(0, 4); x2 = s - A.entier(1, 5); kv = a * x1 + b; d = kv - c * x2;
        } while (Math.abs(d) > 15 || d === 0 || a === c);
        q.type = 'champs';
        q.texte = 'Trouver <b>tous</b> les nombres $x$ pour lesquels <code>f(x)</code> renvoie $' + kv + '$ (du plus petit au plus grand).' + code(fonction(s, a, b, c, d));
        q.gabarit = '$x=$ [] et $x=$ []';
        q.attendus = [x2, x1];
        q.explication = 'Si $x\\geqslant ' + s + '$ : $' + Interactif.poly([a, b]) + '=' + kv + '$ donne $x=' + x1 + '$, qui convient car $' + x1 + '\\geqslant ' + s + '$.<br>' +
            'Si $x<' + s + '$ : $' + Interactif.poly([c, d]) + '=' + kv + '$ donne $x=' + x2 + '$, qui convient car $' + x2 + '<' + s + '$.<br>Il y a donc deux nombres : $' + x2 + '$ et $' + x1 + '$.';
        return q;
    };

    /* ===== A10 · Équations avec parenthèses ===== */
    Auto.equationParentheses = function (niveau) {
        var q = { niveau: niveau, objectif: 'A10 · Équations', type: 'nombre', prefixe: 'x =' };
        var poly = Interactif.poly, a, b, c, d, k, x, g, h;
        if (niveau === 1) {
            do { a = A.nonNul(-9, 9); c = A.nonNul(-9, 9); b = A.nonNul(-12, 12); x = A.nonNul(-6, 6); d = (a - c) * x + b; } while (a === c || Math.abs(d) > 30);
            g = poly([a, b]); h = poly([c, d]);
            q.texte = 'Résoudre l\'équation $' + g + '=' + h + '$.';
            q.correction = [g + '&=' + h, poly([a - c, 0]) + '&=' + (d - b), 'x&=' + fracTex(d - b, a - c)];
            if (a - c === 1) q.correction.pop();
            q.attendu = x;
            return q;
        }
        if (niveau === 2) {
            x = A.nonNul(-6, 6);
            if (Math.random() < 0.5) {         // k(x + p) = cx + d
                var p;
                do { k = A.entier(2, 5) * A.signe(); p = A.nonNul(-6, 6); c = A.nonNul(-6, 6); d = k * (x + p) - c * x; } while (k === c || Math.abs(d) > 30 || d === 0);
                g = k + '(' + poly([1, p]) + ')'; h = poly([c, d]);
                q.texte = 'Résoudre l\'équation $' + g + '=' + h + '$.';
                q.correction = [g + '&=' + h, poly([k, k * p]) + '&=' + h, poly([k - c, 0]) + '&=' + (d - k * p), 'x&=' + x];
            } else {                           // ax - k(m - x) = e
                var m, e;
                do { a = A.entier(2, 6); k = A.entier(2, 5); m = A.nonNul(-6, 6); e = (a + k) * x - k * m; } while (Math.abs(e) > 40);
                g = poly([a, 0]) + '-' + k + '(' + m + '-x)';
                q.texte = 'Résoudre l\'équation $' + g + '=' + e + '$.';
                q.correction = [g + '&=' + e, poly([a, 0]) + (-k * m > 0 ? '+' : '') + (-k * m) + '+' + poly([k, 0]) + '&=' + e, poly([a + k, -k * m]) + '&=' + e, poly([a + k, 0]) + '&=' + (e + k * m), 'x&=' + x];
            }
            q.attendu = x;
            return q;
        }
        if (Math.random() < 0.5) {             // x(x + a) = x² + b
            do { a = A.nonNul(-7, 7); x = A.nonNul(-6, 6); b = a * x; } while (b === 0);
            g = 'x(' + poly([1, a]) + ')'; h = poly([1, 0, b]);
            q.texte = 'Résoudre l\'équation $' + g + '=' + h + '$.';
            q.correction = [g + '&=' + h, poly([1, a, 0]) + '&=' + h, poly([a, 0]) + '&=' + b, 'x&=' + x];
            q.attendu = x;
            return q;
        }
        var p1, p2, p3, p4, num, den;                // (x + p1)(x + p2) = (x + p3)(x + p4)
        do { p1 = A.nonNul(-5, 5); p2 = A.nonNul(-5, 5); p3 = A.nonNul(-5, 5); p4 = A.nonNul(-5, 5); num = p3 * p4 - p1 * p2; den = p1 + p2 - p3 - p4; }
        while (den === 0 || num % den !== 0 || (p1 === p3 && p2 === p4) || (p1 === p4 && p2 === p3));
        x = num / den;
        g = '(' + poly([1, p1]) + ')(' + poly([1, p2]) + ')'; h = '(' + poly([1, p3]) + ')(' + poly([1, p4]) + ')';
        q.texte = 'Résoudre l\'équation $' + g + '=' + h + '$.';
        q.correction = [g + '&=' + h, poly([1, p1 + p2, p1 * p2]) + '&=' + poly([1, p3 + p4, p3 * p4]), poly([den, 0]) + '&=' + num, 'x&=' + x];
        q.attendu = x;
        return q;
    };

    /* =====================================================================
       Série 4 (semaine du 28 septembre au 2 octobre) : scripts, équations, périmètres et aires
       ===================================================================== */
    /* ===== A10 · Équations (réduire, parenthèses, fractions) ===== */
    Auto.equationReduire = function (niveau) {
        var q = { niveau: niveau, objectif: 'A10 · Équations', type: 'nombre', prefixe: 'x =' };
        var poly = Interactif.poly, a, b, c, d, k, x, g, h;
        if (niveau === 1) {                    // ax + b = c
            do { a = A.entier(2, 9) * A.signe(); b = A.nonNul(-12, 12); x = A.nonNul(-8, 8); c = a * x + b; } while (Math.abs(c) > 40);
            g = poly([a, b]);
            q.texte = 'Résoudre l\'équation $' + g + '=' + c + '$.';
            q.correction = [g + '&=' + c, poly([a, 0]) + '&=' + (c - b), 'x&=' + frac(c - b, a), 'x&=' + x];
            q.attendu = x;
            return q;
        }
        x = A.nonNul(-6, 6);
        if (niveau === 2) {
            if (Math.random() < 0.5) {         // ax + b = cx + d
                do { a = A.nonNul(-9, 9); c = A.nonNul(-9, 9); b = A.nonNul(-12, 12); d = (a - c) * x + b; } while (a === c || Math.abs(d) > 30);
                g = poly([a, b]); h = poly([c, d]);
                q.correction = [g + '&=' + h, poly([a - c, 0]) + '&=' + (d - b), 'x&=' + x];
            } else {                           // k(x + p) = cx + d
                var p;
                do { k = A.entier(2, 5) * A.signe(); p = A.nonNul(-6, 6); c = A.nonNul(-6, 6); d = k * (x + p) - c * x; } while (k === c || Math.abs(d) > 30 || d === 0);
                g = k + '(' + poly([1, p]) + ')'; h = poly([c, d]);
                q.correction = [g + '&=' + h, poly([k, k * p]) + '&=' + h, poly([k - c, 0]) + '&=' + (d - k * p), 'x&=' + x];
            }
            q.texte = 'Résoudre l\'équation $' + g + '=' + h + '$.';
            q.attendu = x;
            return q;
        }
        if (Math.random() < 0.5) {             // x/a + b = (x + c)/d
            var e;   // on multiplie les deux membres par a × d
            // on choisit c pour que x soit solution : c = d(x/a + b) - x
            do {
                a = A.entier(2, 5); do { d = A.entier(2, 5); } while (d === a);
                b = A.nonNul(-4, 4); x = A.nonNul(-4, 4) * a * d; c = d * (x / a + b) - x;
            } while (Math.abs(c) > 30 || c === 0 || Math.abs(x) > 40);
            e = a * d;
            g = frac('x', a) + (b > 0 ? '+' : '') + b; h = frac(poly([1, c]), d);
            q.texte = 'Résoudre l\'équation $' + g + '=' + h + '$.';
            q.correction = [g + '&=' + h, poly([d, d * b * a]) + '&=' + poly([a, a * c]), poly([d - a, 0]) + '&=' + (a * c - a * d * b), 'x&=' + x];
            q.attendu = x;
            return q;
        }
        var m, r, s;                            // m(x + p) - (x + r) = s(x + t)
        do {
            m = A.entier(2, 5); var p2 = A.nonNul(-5, 5); r = A.nonNul(-6, 6); s = A.entier(2, 4); var t = A.nonNul(-5, 5);
        } while (m - 1 - s === 0 || (s * t - m * p2 + r) % (m - 1 - s) !== 0 || Math.abs((s * t - m * p2 + r) / (m - 1 - s)) > 9);
        x = (s * t - m * p2 + r) / (m - 1 - s);
        g = m + '(' + poly([1, p2]) + ')-(' + poly([1, r]) + ')'; h = s + '(' + poly([1, t]) + ')';
        q.texte = 'Résoudre l\'équation $' + g + '=' + h + '$.';
        q.correction = [g + '&=' + h, poly([m, m * p2]) + poly([-1, -r]).replace(/^(?=[^-])/, '+') + '&=' + poly([s, s * t]), poly([m - 1, m * p2 - r]) + '&=' + poly([s, s * t]), poly([m - 1 - s, 0]) + '&=' + (s * t - m * p2 + r), 'x&=' + x];
        q.attendu = x;
        return q;
    };

    /* ===== A21 · Périmètres et aires d'une figure à angles droits ===== */
    // forme « coin » : rectangle L×H privé d'un carré de côté c dans le coin en haut à droite
    // forme « encoche » : rectangle L×H dont on retire, au milieu du côté du haut, un rectangle w×e
    function figureAngles(f, nomCote) {
        var L = f.L, H = f.H, pts, cotes;
        if (f.forme === 'coin') {
            pts = [[0, 0], [L, 0], [L, H - f.c], [L - f.c, H - f.c], [L - f.c, H], [0, H]];
            cotes = [[[0, 0], [L, 0], L + ' m', 'bas'], [[0, 0], [0, H], H + ' m', 'gauche'],
                     [[L - f.c, H - f.c], [L, H - f.c], nomCote || f.c + ' m', 'haut'], [[L - f.c, H - f.c], [L - f.c, H], nomCote || f.c + ' m', 'droite']];
        } else {
            var a = (L - f.w) / 2;
            pts = [[0, 0], [L, 0], [L, H], [a + f.w, H], [a + f.w, H - f.e], [a, H - f.e], [a, H], [0, H]];
            cotes = [[[0, 0], [L, 0], L + ' m', 'bas'], [[0, 0], [0, H], H + ' m', 'gauche'],
                     [[a, H - f.e], [a + f.w, H - f.e], f.w + ' m', 'bas'], [[a + f.w, H - f.e], [a + f.w, H], nomCote || f.e + ' m', 'droite']];
        }
        var k = Math.min(300 / L, 190 / H), m = 50, W = L * k + 2 * m, Ht = H * k + 2 * m;
        function X(x) { return m + x * k; }
        function Y(y) { return m + (H - y) * k; }
        var s = '<svg viewBox="0 0 ' + W + ' ' + Ht + '" width="' + W + '" height="' + Ht + '" role="img" aria-label="Figure">';
        s += '<polygon class="fig-forme" points="' + pts.map(function (P) { return X(P[0]) + ',' + Y(P[1]); }).join(' ') + '"/>';
        cotes.forEach(function (c) {
            var x = (X(c[0][0]) + X(c[1][0])) / 2, y = (Y(c[0][1]) + Y(c[1][1])) / 2, ancre = 'middle';
            if (c[3] === 'bas') y += 20; else if (c[3] === 'haut') y -= 8; else if (c[3] === 'gauche') { x -= 8; y += 5; ancre = 'end'; } else { x += 8; y += 5; ancre = 'start'; }
            s += '<text class="fig-txt fig-cote' + (c[2] === 'x' ? ' fig-var' : '') + '" x="' + x + '" y="' + y + '" text-anchor="' + ancre + '">' + c[2] + '</text>';
        });
        return s + '</svg>';
    }
    function formeAngles() {
        var f = { forme: A.choix(['coin', 'encoche']), L: A.entier(9, 14) };
        f.H = A.entier(5, f.L - 2);                 // jamais un carré
        if (f.forme === 'coin') f.c = A.entier(2, Math.min(f.L, f.H) - 2);
        else { f.w = A.entier(2, f.L - 4); if ((f.L - f.w) % 2) f.w++; f.e = A.entier(1, f.H - 2); }
        f.P = f.forme === 'coin' ? 2 * (f.L + f.H) : 2 * (f.L + f.H) + 2 * f.e;
        f.A = f.forme === 'coin' ? f.L * f.H - f.c * f.c : f.L * f.H - f.w * f.e;
        return f;
    }
    function explicationAngles(f) {
        if (f.forme === 'coin') return {
            P: 'Les côtés « en escalier » se compensent : en déplaçant les deux côtés de l\'encoche, on retrouve le contour du rectangle. $P=2\\times(' + f.L + '+' + f.H + ')=' + f.P + '$ m.',
            A: 'Aire du rectangle moins aire du carré retiré : $' + f.L + '\\times' + f.H + '-' + f.c + '^2=' + f.L * f.H + '-' + f.c * f.c + '=' + f.A + '$ m².'
        };
        return {
            P: 'Contour du rectangle, plus les deux bords de l\'encoche ($' + f.e + '$ m chacun) : $P=2\\times(' + f.L + '+' + f.H + ')+2\\times' + f.e + '=' + f.P + '$ m.',
            A: 'Aire du rectangle moins aire de l\'encoche : $' + f.L + '\\times' + f.H + '-' + f.w + '\\times' + f.e + '=' + f.L * f.H + '-' + f.w * f.e + '=' + f.A + '$ m².'
        };
    }
    Auto.perimetreAire = function (niveau) {
        var q = { niveau: niveau, objectif: 'A21 · Périmètres, aires' }, f = formeAngles(), ex = explicationAngles(f), poly = Interactif.poly;
        if (niveau === 1) {
            var quoi = A.choix(['P', 'A']);
            q.type = 'nombre';
            q.figure = figureAngles(f);
            q.figureNote = f.forme + ' L=' + f.L + ' H=' + f.H + (f.forme === 'coin' ? ' c=' + f.c : ' w=' + f.w + ' e=' + f.e);
            q.texte = 'Tous les angles sont droits. Calculer ' + (quoi === 'P' ? 'le périmètre (en m)' : 'l\'aire (en m²)') + ' de la figure.';
            q.attendu = f[quoi];
            q.explication = ex[quoi];
            return q;
        }
        var lettre = f.forme === 'coin' ? 'le côté du carré retiré' : 'la profondeur de l\'encoche';
        q.figure = figureAngles(f, 'x');
        q.figureNote = f.forme + ' L=' + f.L + ' H=' + f.H + (f.forme === 'coin' ? ' c=x' : ' w=' + f.w + ' e=x');
        var Ax = f.forme === 'coin' ? poly([-1, 0, f.L * f.H]) : poly([-f.w, f.L * f.H]);
        var max = f.forme === 'coin' ? Math.min(f.L, f.H) : f.H;
        if (niveau === 2) {
            q.type = 'expr';
            q.texte = 'Tous les angles sont droits et ' + lettre + ' mesure $x$ m (avec $0<x<' + max + '$). Exprimer l\'aire $A$ de la figure en fonction de $x$.';
            q.prefixe = 'A ='; q.attendu = Ax;
            q.explication = (f.forme === 'coin' ? 'Aire du rectangle moins celle du carré de côté $x$ : $A=' + f.L + '\\times' + f.H + '-x^2=' + Ax + '$.'
                : 'Aire du rectangle moins celle de l\'encoche ($' + f.w + '$ sur $x$) : $A=' + f.L + '\\times' + f.H + '-' + f.w + 'x=' + Ax + '$.');
            return q;
        }
        var x;
        x = A.entier(1, max - 1);
        var T = f.forme === 'coin' ? f.L * f.H - x * x : f.L * f.H - f.w * x;
        q.type = 'nombre'; q.prefixe = 'x =';
        q.texte = 'Tous les angles sont droits et ' + lettre + ' mesure $x$ m (avec $0<x<' + max + '$). Pour quelle valeur de $x$ l\'aire de la figure est-elle égale à $' + T + '$ m² ?';
        q.attendu = x;
        q.explication = f.forme === 'coin'
            ? '$A=' + Ax + '$. On résout $' + Ax + '=' + T + '$ : $x^2=' + (f.L * f.H - T) + '$, et comme $x>0$, $x=' + x + '$.'
            : '$A=' + Ax + '$. On résout $' + Ax + '=' + T + '$ : $' + f.w + 'x=' + (f.L * f.H - T) + '$, donc $x=' + x + '$.';
        return q;
    };

    /* =====================================================================
       Série 3 (semaine du 21 au 25 septembre) : factoriser, développer, segments codés, vecteurs
       ===================================================================== */
    /* ===== A9 · Factoriser ===== */
    function factoQ(niveau, texte, attendu, facteur, variables) {
        var q = { niveau: niveau, objectif: 'A9 · Développer, factoriser', type: 'expr', forme: 'factorisee', prefixe: 'A =' };
        q.texte = 'Factoriser $A=' + texte + '$.';
        q.attendu = attendu; q.facteur = facteur;
        if (variables) q.variables = variables;
        return q;
    }
    // k·(ax + b) avec k facteur commun « visible » : 9x + 27 = 9(x + 3)
    function factoNumerique(niveau) {
        var poly = Interactif.poly, k = A.entier(2, 9), b = A.nonNul(-9, 9), q;
        q = factoQ(niveau, poly([k, k * b]), k + '(' + poly([1, b]) + ')', poly([1, b]));
        q.explication = '$' + Math.abs(k * b) + '=' + k + '\\times' + Math.abs(b) + '$ : le facteur commun est $' + k + '$. $A=' + k + '\\times x' + (b > 0 ? '+' : '-') + k + '\\times' + Math.abs(b) + '=' + k + '(' + poly([1, b]) + ')$.';
        return q;
    }
    // a x² + b x = g x (… ) : facteur commun g x
    function factoX(niveau, g) {
        var poly = Interactif.poly, a, b;
        do { a = A.entier(1, 5); b = A.nonNul(-9, 9); } while (pgcd(a, b) !== 1 || (g === 1 && a === 1 && b === 1));
        var gx = g === 1 ? 'x' : g + 'x', q = factoQ(niveau, poly([g * a, g * b, 0]), gx + '(' + poly([a, b]) + ')', poly([a, b]));
        q.explication = '$' + poly([g * a, 0, 0]) + '=' + gx + '\\times' + (a === 1 ? 'x' : a + 'x') + '$ et $' + poly([Math.abs(g * b), 0]) + '=' + gx + '\\times' + Math.abs(b) + '$ : le facteur commun est $' + gx + '$.<br>$A=' + gx + '(' + poly([a, b]) + ')$.' +
            (Math.abs(b) === 1 && g === 1 ? ' Attention : $' + (b < 0 ? '-' : '') + 'x=' + (b < 0 ? '(-1)' : '1') + '\\times x$, il ne faut pas oublier ce $' + b + '$.' : '');
        return q;
    }
    Auto.factoriser = function (niveau) {
        if (niveau === 1) {
            var poly = Interactif.poly, k = A.entier(2, 9), b = A.entier(2, 9) * A.signe();
            var q = { niveau: 1, objectif: 'A9 · Développer, factoriser' };
            q.texte = 'Factoriser $' + poly([k, k * b]) + '$ :';
            q.explication = '$' + Math.abs(k * b) + '=' + k + '\\times' + Math.abs(b) + '$, donc $' + k + '$ est le facteur commun : $' + poly([k, k * b]) + '=' + k + '\\times x' + (b > 0 ? '+' : '-') + k + '\\times' + Math.abs(b) + '=' + k + '(' + poly([1, b]) + ')$.';
            return qcm(q, [
                { t: '$' + k + '(' + poly([1, b]) + ')$', ok: true },
                { t: '$' + k + '(' + poly([1, k * b]) + ')$', ok: false },
                { t: '$' + poly([k + k * b, 0]) + '$', ok: false },
                { t: '$' + k + 'x\\times' + Interactif.par(b) + '$', ok: false }
            ]);
        }
        if (niveau === 2) return factoX(2, A.entier(2, 5));
        // a x²y + b x²y² - c xy = xy(a x + b xy - c)
        var a = A.entier(2, 7), bb = A.entier(2, 7), c = A.entier(2, 9);
        var t = a + 'x^2y+' + bb + 'x^2y^2-' + c + 'xy', fac = a + 'x+' + bb + 'xy-' + c;
        var q3 = factoQ(3, t, 'xy(' + fac + ')', fac, 'xy');
        q3.explication = 'Chaque terme contient $x$ et $y$ : $' + a + 'x^2y=xy\\times' + a + 'x$, $' + bb + 'x^2y^2=xy\\times' + bb + 'xy$, $' + c + 'xy=xy\\times' + c + '$.<br>Donc $A=xy(' + fac + ')$.';
        return q3;
    };
    Auto.factoriserCommun = function (niveau) {
        if (niveau === 1) return factoNumerique(1);
        if (niveau === 2) return factoX(2, A.entier(2, 5));
        var poly = Interactif.poly, a, b, k;          // (x + a)(x + b) + k(x + a) = (x + a)(x + b + k)
        do { a = A.nonNul(-6, 6); b = A.nonNul(-6, 6); k = A.nonNul(-6, 6); } while (b + k === 0 || a === b || a === b + k);
        var pa = '(' + poly([1, a]) + ')', q = factoQ(3, pa + '(' + poly([1, b]) + ')' + (k > 0 ? '+' : '') + k + pa, pa + '(' + poly([1, b + k]) + ')', poly([1, b + k]));
        q.explication = 'Le facteur commun est la parenthèse $' + pa + '$ : $A=' + pa + '\\big[(' + poly([1, b]) + ')' + (k > 0 ? '+' : '') + k + '\\big]=' + pa + '(' + poly([1, b + k]) + ')$.';
        return q;
    };
    Auto.factoriserParX = function (niveau) {
        if (niveau === 1) return factoX(1, 1);
        if (niveau === 2) {
            var a = A.entier(2, 9), q = factoQ(2, Interactif.poly([a, -1, 0]), 'x(' + Interactif.poly([a, -1]) + ')', Interactif.poly([a, -1]));
            q.explication = '$' + a + 'x^2=x\\times' + a + 'x$ et, attention, $-x=(-1)\\times x$. Le facteur commun est $x$ : $A=x(' + a + 'x-1)$. Le piège est d\'oublier ce $-1$.';
            return q;
        }
        var n = A.choix([49, 99, 199, 999, 59, 39]);
        var q3 = { niveau: 3, objectif: 'A9 · Développer, factoriser', type: 'nombre' };
        q3.texte = 'On a $x^2+x=x(x+1)$. En déduire <b>de tête</b> la valeur de $' + n + '^2+' + n + '$.';
        q3.attendu = n * (n + 1);
        q3.explication = 'Avec $x=' + n + '$ : $' + n + '^2+' + n + '=' + n + '\\times(' + n + '+1)=' + n + '\\times' + (n + 1) + '=' + fr(n * (n + 1)) + '$.';
        return q3;
    };

    /* ===== A9 · Développer (simple puis double distributivité) ===== */
    Auto.developper = function (niveau) {
        var poly = Interactif.poly;
        if (niveau === 1) { var q1 = Auto.distributivite(2); q1.niveau = 1; q1.objectif = 'A9 · Développer, factoriser'; delete q1.rappel; return q1; }
        var q = { niveau: niveau, objectif: 'A9 · Développer, factoriser', type: 'expr', forme: 'developpee', consigne: 'Développer et réduire :', prefixe: 'A =' };
        var a = A.entier(1, 4), b = A.nonNul(-6, 6), c = A.entier(1, 4), d = A.nonNul(-6, 6);
        var P = [a * c, a * d + b * c, b * d], tx = '(' + poly([a, b]) + ')(' + poly([c, d]) + ')';
        if (niveau === 2) {
            q.enonce = 'A = ' + tx; q.attendu = poly(P);
            q.correction = ['A&=' + poly([a, 0]) + '\\times ' + poly([c, 0]) + '+' + poly([a, 0]) + '\\times ' + Interactif.par(d) + (b > 0 ? '+' : '') + b + '\\times ' + poly([c, 0]) + (b > 0 ? '+' : '') + b + '\\times ' + Interactif.par(d),
                '&=' + poly([a * c, 0, 0]) + (a * d > 0 ? '+' : '') + poly([a * d, 0]) + (b * c > 0 ? '+' : '') + poly([b * c, 0]) + (b * d > 0 ? '+' : '') + b * d, '&=' + poly(P)];
            return q;
        }
        var k = A.entier(2, 3), p = A.nonNul(-5, 5), r = A.nonNul(-5, 5), Q = [k, k * (p + r), k * p * r];
        var R = [P[0] - Q[0], P[1] - Q[1], P[2] - Q[2]];
        q.enonce = 'A = ' + tx + '-' + k + '(' + poly([1, p]) + ')(' + poly([1, r]) + ')'; q.attendu = poly(R);
        q.correction = ['A&=' + poly(P) + '-' + k + '(' + poly([1, p + r, p * r]) + ')', '&=' + poly(P) + (Q.some(function (x) { return x; }) ? '-(' + poly(Q) + ')' : ''), '&=' + poly(R)];
        return q;
    };

    /* ===== A8 · Segments codés ===== */
    // morceaux : [{ code: 'o' | '//' | 'x', l: longueur dessinée, cote: texte de la mesure }] ; noms des points aux extrémités
    function segment(morceaux, noms, rouge) {
        var total = morceaux.reduce(function (s, m) { return s + m.l; }, 0), k = 520 / total, x0 = 24, y = 40;
        var s = '<svg viewBox="0 0 568 112" width="568" height="112" role="img" aria-label="Segment codé">';
        s += '<line class="fig-seg" x1="' + x0 + '" y1="' + y + '" x2="' + (x0 + total * k) + '" y2="' + y + '"/>';
        var x = x0;
        morceaux.forEach(function (m, i) {
            var x2 = x + m.l * k, mi = (x + x2) / 2;
            if (rouge && rouge[0] === i) s += '<line class="fig-seg-rouge" x1="' + x + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '"/>';
            if (m.code === 'o') s += '<circle class="fig-code" cx="' + mi + '" cy="' + y + '" r="6"/>';
            else if (m.code === '//') s += '<line class="fig-seg" x1="' + (mi - 7) + '" y1="' + (y + 7) + '" x2="' + (mi - 1) + '" y2="' + (y - 7) + '"/><line class="fig-seg" x1="' + (mi + 1) + '" y1="' + (y + 7) + '" x2="' + (mi + 7) + '" y2="' + (y - 7) + '"/>';
            else if (m.code === 'x') s += '<line class="fig-seg" x1="' + (mi - 6) + '" y1="' + (y - 6) + '" x2="' + (mi + 6) + '" y2="' + (y + 6) + '"/><line class="fig-seg" x1="' + (mi - 6) + '" y1="' + (y + 6) + '" x2="' + (mi + 6) + '" y2="' + (y - 6) + '"/>';
            if (m.cote) {
                s += '<line class="fig-mesure" x1="' + (x + 4) + '" y1="' + (y + 32) + '" x2="' + (x2 - 4) + '" y2="' + (y + 32) + '"/>';
                s += '<path class="fig-fleche" d="M' + (x + 2) + ',' + (y + 32) + ' l8,-4 v8 z"/><path class="fig-fleche" d="M' + (x2 - 2) + ',' + (y + 32) + ' l-8,-4 v8 z"/>';
                s += '<text class="fig-txt fig-cote' + (m.cote === 'x' ? ' fig-var' : '') + '" x="' + mi + '" y="' + (y + 56) + '" text-anchor="middle">' + m.cote + '</text>';
            }
            x = x2;
        });
        x = x0;
        for (var i = 0; i <= morceaux.length; i++) {
            s += '<line class="fig-seg" x1="' + x + '" y1="' + (y - 7) + '" x2="' + x + '" y2="' + (y + 7) + '"/>';
            if (noms && noms[i]) s += '<text class="fig-nom-pt" x="' + x + '" y="' + (y - 14) + '" text-anchor="middle">' + noms[i] + '</text>';
            if (i < morceaux.length) x += morceaux[i].l * k;
        }
        return s + '</svg>';
    }
    // Jour 1 : AB = 2 morceaux x (○) et n morceaux c (//), dans un ordre mélangé
    Auto.segmentSomme = function (niveau) {
        var q = { niveau: niveau, objectif: 'A8 · Calcul littéral élémentaire' }, poly = Interactif.poly;
        var n = A.entier(2, 4), c = A.entier(3, 9), ordre = melanger(['o', 'o'].concat(Array(n).fill('//')));
        var vusO = false, vusB = false;
        var morceaux = ordre.map(function (code) {
            var m = { code: code, l: code === 'o' ? 2 : 3 };
            if (code === 'o' && !vusO) { m.cote = 'x'; vusO = true; }
            if (code === '//' && !vusB) { m.cote = String(c); vusB = true; }
            return m;
        });
        var expr = poly([2, n * c]);
        q.figure = segment(morceaux, ['A'].concat(Array(morceaux.length - 1).fill(''), ['B']));
        q.figureNote = ordre.join(' ') + ' ; // = ' + c;
        q.texte = 'Les morceaux portant le même codage ont la même longueur.';
        if (niveau === 1) {
            q.type = 'expr'; q.prefixe = 'AB ='; q.attendu = expr;
            q.texte += ' Exprimer $AB$ en fonction de $x$ (forme réduite).';
            q.forme = 'developpee';
            q.explication = 'Deux morceaux ○ mesurent $x$ et ' + n + ' morceaux // mesurent $' + c + '$ : $AB=2x+' + n + '\\times' + c + '=' + expr + '$.';
            return q;
        }
        if (niveau === 2) {
            var x = A.entier(2, 12), T = 2 * x + n * c;
            q.type = 'nombre'; q.prefixe = 'x ='; q.attendu = x;
            q.texte += ' On sait que $AB=' + T + '$. Déterminer $x$.';
            q.explication = '$AB=' + expr + '$, donc $' + expr + '=' + T + '$ : $2x=' + T + '-' + n * c + '=' + 2 * x + '$ et $x=' + x + '$.';
            return q;
        }
        q.type = 'expr'; q.prefixe = 'L ='; q.attendu = String(n * c / 2);
        q.texte += ' Un rectangle a pour périmètre $AB$ et pour largeur $x$. Exprimer sa longueur $L$ en fonction de $x$ (écris le résultat le plus simple possible).';
        q.forme = 'developpee';
        q.explication = 'Périmètre : $2(L+x)=' + expr + '$, donc $L+x=x+' + fr(n * c / 2) + '$ et $L=' + fr(n * c / 2) + '$. La longueur ne dépend pas de $x$ !';
        return q;
    };
    // Jour 2 : AF = T ; AB, DE, EF codés // (= x) ; BC = CD codés ○
    Auto.segmentReste = function (niveau) {
        var q = { niveau: niveau, objectif: 'A8 · Calcul littéral élémentaire' }, poly = Interactif.poly;
        var T = A.entier(11, 25);
        var morceaux = [{ code: '//', l: 2, cote: 'x' }, { code: 'o', l: 3 }, { code: 'o', l: 3 }, { code: '//', l: 2 }, { code: '//', l: 2 }];
        q.figure = segment(morceaux, ['A', 'B', 'C', 'D', 'E', 'F']);
        q.figureNote = 'AF=' + T + ' ; AB=DE=EF=x ; BC=CD';
        var BD = poly([-3, T]);
        q.texte = 'Les morceaux portant le même codage ont la même longueur et $AF=' + T + '$.';
        if (niveau === 1) {
            q.type = 'expr'; q.prefixe = 'BD ='; q.attendu = BD; q.forme = 'developpee';
            q.texte += ' Exprimer $BD$ en fonction de $x$.';
            q.explication = 'Les trois morceaux // mesurent $x$ : $AB+DE+EF=3x$. Ce qui reste est $BD$ : $BD=AF-3x=' + BD + '$.';
            return q;
        }
        if (niveau === 2) {
            var x, v;
            do { x = A.entier(1, 7); v = T - 3 * x; } while (v <= 0);
            q.type = 'nombre'; q.prefixe = 'x ='; q.attendu = x;
            q.texte += ' On sait que $BD=' + v + '$. Déterminer $x$.';
            q.explication = '$BD=' + BD + '$, donc $' + BD + '=' + v + '$ : $3x=' + T + '-' + v + '=' + 3 * x + '$ et $x=' + x + '$.';
            return q;
        }
        q.type = 'expr'; q.prefixe = 'BC ='; q.attendu = '(' + BD + ')/2';
        q.texte += ' Exprimer $BC$ en fonction de $x$.';
        q.explication = '$BC=CD$, donc $BC=' + frac('BD', 2) + '=' + frac(BD, 2) + '$ (ou $' + fr(T / 2) + '-' + fr(1.5) + 'x$).';
        return q;
    };
    // Jour 3 : AF = T ; AB = EF = x (//) ; BC = CD = DE (○)
    Auto.segmentQuotient = function (niveau) {
        var q = { niveau: niveau, objectif: 'A8 · Calcul littéral élémentaire' }, poly = Interactif.poly;
        var T = A.choix([15, 20, 25, 30, 35, 40]);
        var morceaux = [{ code: '//', l: 2, cote: 'x' }, { code: 'o', l: 3 }, { code: 'o', l: 3 }, { code: 'o', l: 3 }, { code: '//', l: 2 }];
        q.figure = segment(morceaux, ['A', 'B', 'C', 'D', 'E', 'F'], niveau === 1 ? [1] : null);
        q.figureNote = 'AF=' + T + ' ; AB=EF=x ; BC=CD=DE';
        var BE = poly([-2, T]);
        q.texte = 'Les morceaux portant le même codage ont la même longueur et $AF=' + T + '$.';
        if (niveau === 1) {
            q.type = 'expr'; q.prefixe = 'BC ='; q.attendu = '(' + BE + ')/3';
            q.texte += ' Exprimer $BC$ en fonction de $x$.';
            q.explication = 'Les deux morceaux // mesurent $x$ : $AB+EF=2x$. Ce qui reste, $BE=' + BE + '$, est partagé en trois morceaux ○ : $BC=' + frac(BE, 3) + '$.';
            return q;
        }
        if (niveau === 2) {
            q.type = 'expr'; q.prefixe = 'AC ='; q.attendu = '(x+' + T + ')/3';
            q.texte += ' Exprimer $AC$ en fonction de $x$, sous la forme d\'un seul quotient.';
            q.explication = '$BC=' + frac(BE, 3) + '$, donc $AC=AB+BC=x+' + frac(BE, 3) + '=' + frac('3x', 3) + '+' + frac(BE, 3) + '=' + frac('x+' + T, 3) + '$.';
            return q;
        }
        q.type = 'champs';
        q.texte += ' Pour quelles valeurs de $x$ le morceau $BC$ est-il plus long que le morceau $AB$ ?';
        q.gabarit = '$0<x<$ []';
        q.attendus = [T / 5];
        q.explication = 'Il faut $' + frac(BE, 3) + '>x$, c\'est-à-dire $' + BE + '>3x$, donc $' + T + '>5x$ et $x<' + fr(T / 5) + '$. Comme $x$ est une longueur, $x>0$.';
        return q;
    };

    /* ----- Vecteurs sur un quadrillage ----- */
    // o = { l, h (carreaux), vecteurs: [{ x, y, dx, dy, nom, libre (nom en italique fléché) , v2 (seconde couleur) }] }
    function quadrillage(o) {
        var c = 30, m = 14, W = o.l * c + 2 * m, H = o.h * c + 2 * m, k;
        function X(x) { return m + x * c; }
        function Y(y) { return m + (o.h - y) * c; }
        var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Quadrillage">';
        for (k = 0; k <= o.l; k++) s += '<line class="fig-grille" x1="' + X(k) + '" y1="' + m + '" x2="' + X(k) + '" y2="' + (H - m) + '"/>';
        for (k = 0; k <= o.h; k++) s += '<line class="fig-grille" x1="' + m + '" y1="' + Y(k) + '" x2="' + (W - m) + '" y2="' + Y(k) + '"/>';
        o.vecteurs.forEach(function (v) {
            var x1 = X(v.x), y1 = Y(v.y), x2 = X(v.x + v.dx), y2 = Y(v.y + v.dy), L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
            var bx = x2 - 12 * ux, by = y2 - 12 * uy;
            s += '<g class="fig-vec' + (v.v2 ? ' v2' : '') + '"><line x1="' + x1 + '" y1="' + y1 + '" x2="' + bx + '" y2="' + by + '"/>' +
                '<polygon points="' + x2 + ',' + y2 + ' ' + (bx - 5 * uy) + ',' + (by + 5 * ux) + ' ' + (bx + 5 * uy) + ',' + (by - 5 * ux) + '"/></g>';
            if (v.libre) {
                var mx = (x1 + x2) / 2 - 13 * uy, my = (y1 + y2) / 2 + 13 * ux + 5;   // nom à côté du milieu
                s += '<text class="fig-vnom' + (v.v2 ? ' v2' : '') + '" x="' + mx + '" y="' + my + '" text-anchor="middle">' + v.nom + '</text>' +
                    '<path class="fig-vfleche' + (v.v2 ? ' v2' : '') + '" d="M' + (mx - 5) + ',' + (my - 15) + ' h10 m-3,-3 l3,3 l-3,3"/>';
            } else {
                s += '<circle class="fig-pt" cx="' + x1 + '" cy="' + y1 + '" r="3"/><circle class="fig-pt" cx="' + x2 + '" cy="' + y2 + '" r="3"/>';
                // noms dans le prolongement du vecteur, de part et d'autre
                s += '<text class="fig-nom" x="' + (x1 - 15 * ux) + '" y="' + (y1 - 15 * uy + 6) + '" text-anchor="middle">' + v.nom[0] + '</text>';
                s += '<text class="fig-nom" x="' + (x2 + 15 * ux) + '" y="' + (y2 + 15 * uy + 6) + '" text-anchor="middle">' + v.nom[1] + '</text>';
            }
        });
        return s + '</svg>';
    }
    function vec(n) { return '\\overrightarrow{' + n + '}'; }
    function norme(n) { return '\\lVert' + vec(n) + '\\rVert'; }
    // racine simplifiée : n = a²·b -> [a, b]
    function racine(n) { for (var a = Math.floor(Math.sqrt(n)); a > 1; a--) if (n % (a * a) === 0) return [a, n / (a * a)]; return [1, n]; }
    function racineTex(n) { var r = racine(n); return r[1] === 1 ? String(r[0]) : (r[0] === 1 ? '' : r[0]) + '\\sqrt{' + r[1] + '}'; }
    function deplacement(dx, dy) {
        return Math.abs(dx) + ' carreau' + (Math.abs(dx) > 1 ? 'x' : '') + ' vers la ' + (dx > 0 ? 'droite' : 'gauche') + ' et ' + Math.abs(dy) + ' vers le ' + (dy > 0 ? 'haut' : 'bas');
    }
    // un vecteur AB dessiné seul, départ choisi pour tenir dans le quadrillage
    function vecteurSeul(dx, dy, nom) {
        var l = Math.abs(dx) + 2, h = Math.abs(dy) + 2;
        return quadrillage({ l: Math.max(l, 6), h: Math.max(h, 4), vecteurs: [{ x: dx < 0 ? -dx + 1 : 1, y: dy < 0 ? -dy + 1 : 1, dx: dx, dy: dy, nom: nom }] });
    }
    function pythagore(nom, dx, dy) {
        var n2 = dx * dx + dy * dy;
        return '$' + vec(nom) + '$ correspond à un déplacement de ' + deplacement(dx, dy) + '. Pythagore : $' + nom + '^2=' + Math.abs(dx) + '^2+' + Math.abs(dy) + '^2=' + n2 + '$, donc $' + norme(nom) + '=\\sqrt{' + n2 + '}' + (racineTex(n2) !== '\\sqrt{' + n2 + '}' ? '=' + racineTex(n2) : '') + '$.';
    }
    var TRIPLETS = [[3, 4], [4, 3], [6, 8], [8, 6], [5, 12]];
    // norme entière (QCM)
    function normeEntiere(niveau) {
        var t = A.choix(TRIPLETS), dx = t[0] * (Math.random() < 0.3 ? -1 : 1), dy = t[1] * (Math.random() < 0.3 ? -1 : 1), n = Math.hypot(dx, dy);
        var q = { niveau: niveau, objectif: 'Vecteurs' };
        q.figure = vecteurSeul(dx, dy, 'AB'); q.figureNote = 'AB(' + dx + ' ; ' + dy + ')';
        q.texte = 'Les carreaux ont pour côté $1$. Quelle est la norme $' + norme('AB') + '$ ?';
        q.explication = pythagore('AB', dx, dy);
        return qcm(q, [{ t: '$' + n + '$', ok: true }, { t: '$' + (t[0] + t[1]) + '$', ok: false }, { t: '$\\sqrt{' + (t[0] + t[1]) + '}$', ok: false }, { t: '$' + n * n + '$', ok: false }]);
    }
    function nonCarreSomme() {
        var dx, dy, n2; do { dx = A.nonNul(-4, 5); dy = A.nonNul(-4, 4); n2 = dx * dx + dy * dy; } while (racine(n2)[0] !== 1); return [dx, dy];
    }
    function avecCarre() {
        var dx, dy, n2; do { dx = A.nonNul(-6, 6); dy = A.nonNul(-5, 5); n2 = dx * dx + dy * dy; } while (racine(n2)[0] === 1 || racine(n2)[1] === 1); return [dx, dy];
    }
    Auto.normeVecteur = function (niveau) {
        if (niveau === 1) return normeEntiere(1);
        var q = { niveau: niveau, objectif: 'Vecteurs', type: 'champs' };
        if (niveau === 2) {
            var d = nonCarreSomme(), n2 = d[0] * d[0] + d[1] * d[1];
            q.figure = vecteurSeul(d[0], d[1], 'CD'); q.figureNote = 'CD(' + d[0] + ' ; ' + d[1] + ')';
            q.texte = 'Les carreaux ont pour côté $1$. Quelle est la norme $' + norme('CD') + '$ ?';
            q.gabarit = '$' + norme('CD') + '=\\sqrt{b}$ avec $b=$ []';
            q.attendus = [n2];
            q.explication = pythagore('CD', d[0], d[1]) + ' La racine ne se simplifie pas.';
            return q;
        }
        var t = A.choix([[12, 13], [8, 10], [6, 10], [9, 15], [5, 13], [15, 17], [24, 25]]), dy = Math.sqrt(t[1] * t[1] - t[0] * t[0]);
        q.type = 'nombre';
        q.texte = 'Le vecteur $' + vec('EF') + '$ correspond à un déplacement de $' + t[0] + '$ carreaux vers la droite et sa norme vaut $' + t[1] + '$. De combien de carreaux monte-t-il ?';
        q.attendu = dy;
        q.explication = 'On appelle $v$ le déplacement vertical. Pythagore : $' + t[0] + '^2+v^2=' + t[1] + '^2$, donc $v^2=' + t[1] * t[1] + '-' + t[0] * t[0] + '=' + dy * dy + '$ et $v=' + dy + '$.';
        return q;
    };
    Auto.normeSimplifier = function (niveau) {
        var q = { niveau: niveau, objectif: 'Vecteurs' };
        if (niveau === 1) {
            var d = avecCarre(), n2 = d[0] * d[0] + d[1] * d[1], r = racine(n2);
            q.figure = vecteurSeul(d[0], d[1], 'AB'); q.figureNote = 'AB(' + d[0] + ' ; ' + d[1] + ')';
            q.texte = 'Les carreaux ont pour côté $1$. Quelle est la norme $' + norme('AB') + '$ ?';
            q.explication = pythagore('AB', d[0], d[1]).replace('$, donc', '$ et $' + n2 + '=' + r[0] * r[0] + '\\times' + r[1] + '$, donc');
            var opts = [{ t: '$' + racineTex(n2) + '$', ok: true }, { t: '$' + (Math.abs(d[0]) + Math.abs(d[1])) + '$', ok: false }, { t: '$' + r[1] + '\\sqrt{' + r[0] + '}$', ok: false }, { t: '$' + n2 + '$', ok: false }];
            if (r[0] === r[1]) opts[2] = { t: '$' + r[0] * r[0] + '\\sqrt{' + r[1] + '}$', ok: false };
            return qcm(q, opts);
        }
        q.type = 'champs';
        var u, v, s, s2, rs, op = niveau === 3 ? -1 : 1;
        do { u = [A.nonNul(-3, 4), A.nonNul(-3, 3)]; v = [A.nonNul(-3, 4), A.nonNul(-3, 3)]; s = [u[0] + op * v[0], u[1] + op * v[1]]; s2 = s[0] * s[0] + s[1] * s[1]; rs = racine(s2); }
        while (rs[0] === 1 || rs[1] === 1 || !s[0] || !s[1] || u[0] * v[1] === u[1] * v[0]);
        q.figure = quadrillage({ l: 15, h: 6, vecteurs: [{ x: u[0] < 0 ? 4 : 1, y: u[1] < 0 ? 4 : 1, dx: u[0], dy: u[1], nom: 'AB' }, { x: v[0] < 0 ? 12 : 9, y: v[1] < 0 ? 4 : 1, dx: v[0], dy: v[1], nom: 'CD', v2: true }] });
        q.figureNote = 'AB(' + u + ') CD(' + v + ')';
        q.texte = 'Les carreaux ont pour côté $1$. Calculer la norme du vecteur $' + vec('AB') + (op > 0 ? '+' : '-') + vec('CD') + '$ et l\'écrire sous la forme $a\\sqrt{b}$ ($b$ le plus petit possible).';
        q.gabarit = '$a=$ [] et $b=$ []';
        q.attendus = [rs[0], rs[1]];
        q.explication = (op > 0 ? 'Bout à bout' : 'On ajoute l\'opposé de $' + vec('CD') + '$') + ' : le vecteur va de $' + s[0] + '$ carreau(x) horizontalement et $' + s[1] + '$ verticalement.<br>' +
            'Sa norme vaut $\\sqrt{' + Interactif.par(s[0]) + '^2+' + Interactif.par(s[1]) + '^2}=\\sqrt{' + s2 + '}=\\sqrt{' + rs[0] * rs[0] + '\\times' + rs[1] + '}=' + racineTex(s2) + '$.';
        return q;
    };
    Auto.normeColineaire = function (niveau) {
        var q = { niveau: niveau, objectif: 'Vecteurs' }, d = nonCarreSomme(), n2 = d[0] * d[0] + d[1] * d[1], k = A.entier(2, 3);
        if (niveau === 1) {
            var D = [k * d[0], k * d[1]], N2 = D[0] * D[0] + D[1] * D[1];
            q.figure = vecteurSeul(D[0], D[1], 'AB'); q.figureNote = 'AB(' + D + ')';
            q.texte = 'Les carreaux ont pour côté $1$. Quelle est la norme $' + norme('AB') + '$ ?';
            q.explication = pythagore('AB', D[0], D[1]);
            var opts = [{ t: '$' + k + '\\sqrt{' + n2 + '}$', ok: true }, { t: '$' + (Math.abs(D[0]) + Math.abs(D[1])) + '$', ok: false }, { t: '$' + N2 + '$', ok: false }];
            if (n2 !== k) opts.push({ t: '$' + n2 + '\\sqrt{' + k + '}$', ok: false }); else opts.push({ t: '$' + k * k + '\\sqrt{' + n2 + '}$', ok: false });
            return qcm(q, opts);
        }
        q.type = 'champs';
        if (niveau === 2) {
            do { d = [A.nonNul(-3, 3), A.nonNul(-3, 3)]; n2 = d[0] * d[0] + d[1] * d[1]; } while (racine(n2)[0] !== 1);
            var ax = Math.abs(d[0]), ay = Math.abs(d[1]), x0 = k * ax + 3;
            q.figure = quadrillage({ l: x0 + ax + 1, h: Math.max(k * ay + 2, 4), vecteurs: [
                { x: d[0] < 0 ? k * ax + 1 : 1, y: d[1] < 0 ? k * ay + 1 : 1, dx: k * d[0], dy: k * d[1], nom: 'AB' },
                { x: d[0] < 0 ? x0 + ax : x0, y: d[1] < 0 ? ay + 1 : 1, dx: d[0], dy: d[1], nom: 'CD', v2: true }] });
            q.figureNote = 'AB=' + k + 'CD, CD(' + d + ')';
            q.texte = 'Les carreaux ont pour côté $1$. Calculer $' + norme('CD') + '$, puis comparer $' + norme('AB') + '$ et $' + norme('CD') + '$.';
            q.gabarit = '$' + norme('CD') + '=\\sqrt{b}$ avec $b=$ [] ; $' + norme('AB') + '=$ [] $\\times' + norme('CD') + '$';
            q.attendus = [n2, k];
            q.explication = '$CD^2=' + Interactif.par(d[0]) + '^2+' + Interactif.par(d[1]) + '^2=' + n2 + '$, donc $' + norme('CD') + '=\\sqrt{' + n2 + '}$.<br>$' + vec('AB') + '$ fait $' + k + '$ fois le même déplacement : $' + vec('AB') + '=' + k + vec('CD') + '$, et $' + norme('AB') + '=' + k + '\\sqrt{' + n2 + '}$.';
            return q;
        }
        var a = A.entier(3, 7), b = -A.entier(2, 4);
        q.texte = 'On sait que $' + norme('CD') + '=\\sqrt{' + n2 + '}$. Sans refaire de calcul de Pythagore, compléter :';
        q.gabarit = '$\\lVert' + a + vec('CD') + '\\rVert=$ [] $\\sqrt{' + n2 + '}$ &nbsp; et &nbsp; $\\lVert' + b + vec('CD') + '\\rVert=$ [] $\\sqrt{' + n2 + '}$';
        q.attendus = [a, -b];
        q.explication = 'Multiplier un vecteur par $k$ multiplie sa norme par $|k|$ : $\\lVert' + a + vec('CD') + '\\rVert=' + a + '\\sqrt{' + n2 + '}$ et $\\lVert' + b + vec('CD') + '\\rVert=' + -b + '\\sqrt{' + n2 + '}$, et non $' + b + '\\sqrt{' + n2 + '}$ : une norme est toujours positive.';
        return q;
    };

    /* ===== Vecteurs : somme sur un quadrillage ===== */
    function figureSomme(u, v, cands) {
        var liste = [{ d: u, nom: 'u' }, { d: v, nom: 'v', v2: true }].concat(cands), x = 1, h = 2;
        liste.forEach(function (c) { h = Math.max(h, Math.abs(c.d[1]) + 2); });
        var vs = liste.map(function (c) {
            var o = { x: c.d[0] < 0 ? x - c.d[0] : x, y: c.d[1] < 0 ? -c.d[1] + 1 : 1, dx: c.d[0], dy: c.d[1], nom: c.nom, libre: true, v2: c.v2 };
            x += Math.abs(c.d[0]) + 2;
            return o;
        });
        return quadrillage({ l: x - 1, h: h, vecteurs: vs });
    }
    function petitVecteur() { var d; do { d = [A.entier(-1, 3), A.entier(-2, 2)]; } while (!d[0] || !d[1]); return d; }
    Auto.sommeVecteurs = function (niveau) {
        var q = { niveau: niveau, objectif: 'Vecteurs' }, u, v;
        do { u = petitVecteur(); v = petitVecteur(); } while (u[0] * v[1] === u[1] * v[0]);
        function cle(d) { return d[0] + ',' + d[1]; }
        function txt(d) { return deplacement(d[0], d[1]).replace(/^0 carreau vers la (droite|gauche) et /, '').replace(/ et 0 vers le (haut|bas)$/, ''); }
        if (niveau < 3) {
            var bon = niveau === 1 ? [u[0] + v[0], u[1] + v[1]] : [u[0] - v[0], u[1] - v[1]];
            if (!bon[0] && !bon[1]) return Auto.sommeVecteurs(niveau);
            var pieges = [[u[0] - v[0], u[1] - v[1]], [u[0] + v[0], v[1] - u[1]], [v[0] - u[0], v[1] - u[1]], [u[0] + v[0], u[1]], [u[0], u[1] + v[1]], [-bon[0], -bon[1]]];
            var vus = {}, cands = [{ d: bon, ok: true }];
            vus[cle(bon)] = true;
            pieges.forEach(function (d) { if (!vus[cle(d)] && (d[0] || d[1]) && cands.length < 4 && Math.abs(d[0]) <= 5 && Math.abs(d[1]) <= 4) { vus[cle(d)] = true; cands.push({ d: d }); } });
            cands = melanger(cands);
            var noms = ['a', 'b', 'c', 'd'];
            cands.forEach(function (c, k) { c.nom = noms[k]; });
            q.figure = figureSomme(u, v, cands);
            q.figureNote = 'u(' + u + ') v(' + v + ') ' + cands.map(function (c) { return c.nom + '(' + c.d + ')'; }).join(' ');
            q.texte = 'Quel vecteur est égal à $\\vec{u}' + (niveau === 1 ? '+' : '-') + '\\vec{v}$ ?';
            var nb = cands.filter(function (c) { return c.ok; })[0].nom;
            q.explication = (niveau === 1 ? 'On met $\\vec{v}$ bout à bout au bout de $\\vec{u}$' : 'On parcourt $\\vec{u}$, puis $\\vec{v}$ à l\'envers') + ' : au total, ' + txt(bon) + '. C\'est $\\vec{' + nb + '}$.';
            return qcm(q, cands.map(function (c) { return { t: '$\\vec{' + c.nom + '}$', ok: !!c.ok }; }));
        }
        var al, be, d;
        do { al = A.choix([-1, 1, 2]); be = A.choix([-1, 1, 2]); d = [al * u[0] + be * v[0], al * u[1] + be * v[1]]; } while ((!d[0] && !d[1]) || Math.abs(d[0]) > 5 || Math.abs(d[1]) > 4);
        q.type = 'champs';
        q.figure = figureSomme(u, v, [{ d: d, nom: 'd' }]);
        q.figureNote = 'u(' + u + ') v(' + v + ') d(' + d + ')';
        q.texte = 'Exprimer $\\vec{d}$ à l\'aide de $\\vec{u}$ et $\\vec{v}$ : trouver les nombres $\\alpha$ et $\\beta$ tels que $\\vec{d}=\\alpha\\vec{u}+\\beta\\vec{v}$.';
        q.gabarit = '$\\alpha=$ [] et $\\beta=$ []';
        q.attendus = [al, be];
        function terme(k, n) { return (k === 1 ? '' : k === -1 ? '-' : k) + '\\vec{' + n + '}'; }
        q.explication = '$\\vec{d}$ : ' + txt(d) + '. On le retrouve en parcourant ' + (Math.abs(al) === 2 ? 'deux fois ' : '') + '$\\vec{u}$' + (al < 0 ? ' à l\'envers' : '') + ', puis ' + (Math.abs(be) === 2 ? 'deux fois ' : '') + '$\\vec{v}$' + (be < 0 ? ' à l\'envers' : '') + ' : $\\vec{d}=' + terme(al, 'u') + (be > 0 ? '+' : '') + terme(be, 'v') + '$.';
        return q;
    };

    /* ===== Algo · Fonctions Python (produit, somme) ===== */
    Auto.fonctionPython = function (niveau) {
        var q = { niveau: niveau, objectif: 'Algo · Fonctions', type: 'nombre' }, c = A.entier(1, 5), a;
        if (niveau === 1) {
            a = A.entier(2, 9);
            q.texte = 'Que renvoie <code>f(' + a + ')</code> ?' + code(['def f(x):', '    return x * (x + ' + c + ')']);
            q.attendu = a * (a + c);
            q.explication = 'On remplace $x$ par $' + a + '$ : $' + a + '\\times(' + a + '+' + c + ')=' + a + '\\times' + (a + c) + '=' + a * (a + c) + '$.';
            return q;
        }
        if (niveau === 2) {
            a = A.entier(3, 9); var b = A.choix([100, 1000, 50, 250]);
            q.type = 'champs';
            q.texte = 'Que renvoient <code>h(' + a + ')</code> et <code>h(' + b + ')</code> ?' + code(['def h(x):', '    return x * (x + ' + c + ') - x * x']);
            q.gabarit = '<code>h(' + a + ')</code> renvoie [] et <code>h(' + b + ')</code> renvoie []';
            q.attendus = [c * a, c * b];
            q.explication = '$h(' + a + ')=' + a + '\\times' + (a + c) + '-' + a + '\\times' + a + '=' + a * (a + c) + '-' + a * a + '=' + c * a + '$.<br>En développant, $x(x+' + c + ')-x^2=x^2+' + c + 'x-x^2=' + (c === 1 ? '' : c) + 'x$ : donc $h(' + b + ')=' + fr(c * b) + '$.';
            return q;
        }
        var n = A.choix([50, 100, 25, 40]);
        q.texte = 'Que renvoie <code>k(' + n + ')</code> ? Sans calculatrice !' + code(['def k(x):', '    return (x + ' + c + ') * (x + ' + c + ') - x * x']);
        q.attendu = 2 * c * n + c * c;
        q.explication = '$(x+' + c + ')^2-x^2=x^2+' + 2 * c + 'x+' + c * c + '-x^2=' + 2 * c + 'x+' + c * c + '$ : donc $k(' + n + ')=' + 2 * c + '\\times' + n + '+' + c * c + '=' + fr(q.attendu) + '$.';
        return q;
    };

    /* =====================================================================
       Série 2 (semaine du 14 au 18 septembre) : translations, vecteurs, puissances, Python, écritures
       ===================================================================== */
    /* ----- Réseau de points (quadrillage de parallélogrammes) nommés par des lettres ----- */
    var LETTRES_RESEAU = 'ABCDEFGHIJKLMNRSTUVW';      // sans O, P, Q
    function reseau(nc, nl, marques) {
        var dx = 70, dy = 56, decal = 22, m = 30, W = (nc - 1) * dx + (nl - 1) * decal + 2 * m, H = (nl - 1) * dy + 2 * m;
        function pos(c, l) { return [m + c * dx + l * decal, m + (nl - 1 - l) * dy]; }
        var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Réseau de points">', c, l, p, q;
        for (l = 0; l < nl; l++) { p = pos(0, l); q = pos(nc - 1, l); s += '<line class="fig-grille" x1="' + p[0] + '" y1="' + p[1] + '" x2="' + q[0] + '" y2="' + q[1] + '"/>'; }
        for (c = 0; c < nc; c++) { p = pos(c, 0); q = pos(c, nl - 1); s += '<line class="fig-grille" x1="' + p[0] + '" y1="' + p[1] + '" x2="' + q[0] + '" y2="' + q[1] + '"/>'; }
        (marques || []).forEach(function (v) {
            var a = pos(v[0][0], v[0][1]), b = pos(v[1][0], v[1][1]), L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
            var bx = b[0] - 16 * ux, by = b[1] - 16 * uy;
            s += '<g class="fig-vec"><line x1="' + (a[0] + 6 * ux) + '" y1="' + (a[1] + 6 * uy) + '" x2="' + bx + '" y2="' + by + '"/><polygon points="' + (b[0] - 5 * ux) + ',' + (b[1] - 5 * uy) + ' ' + (bx - 5 * uy) + ',' + (by + 5 * ux) + ' ' + (bx + 5 * uy) + ',' + (by - 5 * ux) + '"/></g>';
        });
        for (l = 0; l < nl; l++) for (c = 0; c < nc; c++) {
            p = pos(c, l);
            s += '<circle class="fig-pt" cx="' + p[0] + '" cy="' + p[1] + '" r="3.5"/><text class="fig-nom-pt" x="' + (p[0] + 7) + '" y="' + (p[1] - 7) + '">' + LETTRES_RESEAU[l * nc + c] + '</text>';
        }
        return s + '</svg>';
    }
    function nomPoint(nc, c, l) { return LETTRES_RESEAU[l * nc + c]; }
    Auto.translationPoint = function (niveau) {
        var nc = 5, nl = 4, q = { niveau: niveau, objectif: 'Vecteurs · Translations' };
        function dans(c, l) { return c >= 0 && c < nc && l >= 0 && l < nl; }
        var PA, PB, K, v, im, w;
        do {
            PA = [A0(nc), A0(nl)]; PB = [A0(nc), A0(nl)]; K = [A0(nc), A0(nl)];
            v = [PB[0] - PA[0], PB[1] - PA[1]];
            if (niveau === 3) { w = [A.entier(-1, 1), A.entier(-1, 1)]; im = [K[0] + v[0] + w[0], K[1] + v[1] + w[1]]; }
            else { im = niveau === 2 ? [K[0] - v[0], K[1] - v[1]] : [K[0] + v[0], K[1] + v[1]]; }
        } while (!v[0] && !v[1] || (niveau === 1 && (!v[0] || !v[1]) && Math.random() < 0.5) || (niveau > 1 && (!v[0] || !v[1])) || !dans(im[0], im[1]) ||
                 (K[0] === PA[0] && K[1] === PA[1]) || (K[0] === PB[0] && K[1] === PB[1]) || (niveau === 3 && (!w[0] && !w[1] || (w[0] === -v[0] && w[1] === -v[1]))));
        function A0(n) { return Math.floor(Math.random() * n); }
        var nA = nomPoint(nc, PA[0], PA[1]), nB = nomPoint(nc, PB[0], PB[1]), nK = nomPoint(nc, K[0], K[1]), nI = nomPoint(nc, im[0], im[1]);
        var marques = [[PA, PB]], C, D, nC, nD;
        if (niveau === 3) {
            do { C = [A0(nc), A0(nl)]; D = [C[0] + w[0], C[1] + w[1]]; } while (!dans(D[0], D[1]) || (C[0] === PA[0] && C[1] === PA[1]) || (C[0] === PB[0] && C[1] === PB[1]));
            nC = nomPoint(nc, C[0], C[1]); nD = nomPoint(nc, D[0], D[1]);
            marques.push([C, D]);
        }
        q.figure = reseau(nc, nl, marques);
        q.figureNote = nA + nB + ' ; ' + nK + ' -> ' + nI;
        function dep(d) {
            var t = [];
            if (d[0]) t.push(Math.abs(d[0]) + ' colonne' + (Math.abs(d[0]) > 1 ? 's' : '') + ' vers la ' + (d[0] > 0 ? 'droite' : 'gauche'));
            if (d[1]) t.push(Math.abs(d[1]) + ' rangée' + (Math.abs(d[1]) > 1 ? 's' : '') + ' vers le ' + (d[1] > 0 ? 'haut' : 'bas'));
            return t.join(' et ') || 'aucun déplacement';
        }
        if (niveau === 1) {
            q.texte = 'Par la translation qui transforme $' + nA + '$ en $' + nB + '$, quelle est l\'image du point $' + nK + '$ ?';
            q.explication = 'De $' + nA + '$ à $' + nB + '$ : ' + dep(v) + '. On applique le même déplacement à partir de $' + nK + '$ : on arrive en $' + nI + '$.';
        } else if (niveau === 2) {
            q.texte = 'Par la translation qui transforme $' + nB + '$ en $' + nA + '$, quelle est l\'image du point $' + nK + '$ ?';
            q.explication = 'Attention au sens : de $' + nB + '$ à $' + nA + '$, c\'est ' + dep([-v[0], -v[1]]) + ' (le vecteur $\\overrightarrow{' + nB + nA + '}$, opposé de $\\overrightarrow{' + nA + nB + '}$). À partir de $' + nK + '$, on arrive en $' + nI + '$.';
        } else {
            q.texte = 'Quelle est l\'image du point $' + nK + '$ par la translation de vecteur $\\overrightarrow{' + nA + nB + '}+\\overrightarrow{' + nC + nD + '}$ ?';
            q.explication = 'On enchaîne les deux déplacements : ' + dep(v) + ', puis ' + dep(w) + '. Au total, ' + dep([v[0] + w[0], v[1] + w[1]]) + ' : à partir de $' + nK + '$, on arrive en $' + nI + '$.';
        }
        var pieges = [[K[0] - v[0], K[1] - v[1]], [K[0] + v[0], K[1] + v[1]], [K[0] + v[1], K[1] + v[0]], [K[0] + v[0], K[1]], [K[0], K[1] + v[1]], [A0(nc), A0(nl)], [A0(nc), A0(nl)], [A0(nc), A0(nl)]];
        if (niveau === 3) pieges.unshift([K[0] + v[0] - w[0], K[1] + v[1] - w[1]], [K[0] + w[0], K[1] + w[1]]);
        var vus = {}, opts = [{ t: '$' + nI + '$', ok: true }];
        vus[nI] = true;
        pieges.forEach(function (p) {
            if (!dans(p[0], p[1]) || opts.length >= 4) return;
            var n = nomPoint(nc, p[0], p[1]);
            if (!vus[n]) { vus[n] = true; opts.push({ t: '$' + n + '$', ok: false }); }
        });
        while (opts.length < 4) { var n2 = LETTRES_RESEAU[A0(nc * nl)]; if (!vus[n2]) { vus[n2] = true; opts.push({ t: '$' + n2 + '$', ok: false }); } }
        return qcm(q, opts);
    };

    /* ===== Vecteurs · Égalité et parallélogramme ===== */
    function quatreLettres() {
        var l = melanger('ABCDEFGHKLMNRST'.split('')).slice(0, 4);
        if (l.indexOf('P') >= 0 && l.indexOf('Q') >= 0) return quatreLettres();
        return l;
    }
    Auto.vecteurEgalite = function (niveau) {
        var q = { niveau: niveau, objectif: 'Vecteurs · Égalité' }, L = quatreLettres(), a = L[0], b = L[1], c = L[2], d = L[3];
        function v(x, y) { return '$\\overrightarrow{' + x + y + '}$'; }
        function ve(x, y, z, t) { return '$\\overrightarrow{' + x + y + '}=\\overrightarrow{' + z + t + '}$'; }
        if (niveau === 1) {
            q.texte = 'On sait que ' + ve(a, b, d, c) + '. Quel quadrilatère est un parallélogramme ?';
            q.explication = ve(a, b, d, c) + ' signifie que ' + a + b + c + d + ' est un parallélogramme : on lit les sommets dans l\'ordre $' + a + '\\to' + b + '\\to' + c + '\\to' + d + '$ (le second vecteur se lit « à l\'envers », de $' + d + '$ vers $' + c + '$).';
            return qcm(q, [{ t: a + b + c + d, ok: true }, { t: a + b + d + c, ok: false }, { t: a + c + b + d, ok: false }]);
        }
        if (niveau === 2) {
            q.texte = a + b + c + d + ' est un parallélogramme. Quelle égalité est vraie ?';
            q.explication = 'Dans le parallélogramme ' + a + b + c + d + ', ' + ve(a, b, d, c) + ' (côtés opposés, même sens) et ' + ve(a, d, b, c) + '. Attention, ' + v(a, b) + ' et ' + v(c, d) + ' sont opposés.';
            return qcm(q, [{ t: ve(a, b, d, c), ok: true }, { t: ve(a, b, c, d), ok: false }, { t: ve(a, d, c, b), ok: false }, { t: ve(a, c, b, d), ok: false }]);
        }
        q.texte = 'On sait que ' + ve(a, b, d, c) + '. Compléter : $\\overrightarrow{' + a + d + '}=\\ ?$';
        q.explication = ve(a, b, d, c) + ' : ' + a + b + c + d + ' est un parallélogramme. Ses autres côtés opposés donnent ' + ve(a, d, b, c) + '.';
        return qcm(q, [{ t: v(b, c), ok: true }, { t: v(c, b), ok: false }, { t: v(d, b), ok: false }, { t: v(c, a), ok: false }]);
    };

    /* ===== A3 · Puissances de x ===== */
    function px(n) { return n === 1 ? 'x' : 'x^{' + n + '}'; }
    Auto.puissancesX = function (niveau) {
        var q = { niveau: niveau, objectif: 'A3 · Puissances' }, a = A.entier(2, 7), b = A.entier(2, 7);
        if (niveau === 1) {
            q.texte = 'Simplifier $' + px(a) + '\\times ' + px(b) + '$ (le résultat sera écrit sous la forme $x^n$).';
            q.explication = 'Pour multiplier deux puissances de même base, on additionne les exposants : $' + px(a) + '\\times ' + px(b) + '=x^{' + a + '+' + b + '}=' + px(a + b) + '$.';
            var opts = [{ t: '$' + px(a + b) + '$', ok: true }, { t: '$' + px(a * b) + '$', ok: false }, { t: '$2' + px(a + b) + '$', ok: false }];
            opts.push({ t: '$' + (a === b ? '2' + px(a) : px(Math.abs(a - b))) + '$', ok: false });
            if (a * b === a + b) opts[1] = { t: '$' + px(a + b + 1) + '$', ok: false };
            return qcm(q, opts);
        }
        q.type = 'nombre'; q.prefixe = 'n =';
        if (niveau === 2) {
            if (Math.random() < 0.5) {
                do { a = A.entier(4, 12); b = A.entier(2, 9); } while (b >= a);
                q.texte = 'Simplifier $' + frac(px(a), px(b)) + '$ sous la forme $x^n$ ($x\\neq0$). Donner $n$.';
                q.attendu = a - b;
                q.explication = 'Pour diviser deux puissances de même base, on soustrait les exposants : $' + frac(px(a), px(b)) + '=x^{' + a + '-' + b + '}=' + px(a - b) + '$.';
            } else {
                q.texte = 'Simplifier $(' + px(a) + ')^{' + b + '}$ sous la forme $x^n$. Donner $n$.';
                q.attendu = a * b;
                q.explication = 'Puissance d\'une puissance : on multiplie les exposants, $(' + px(a) + ')^{' + b + '}=x^{' + a + '\\times' + b + '}=' + px(a * b) + '$.';
            }
            return q;
        }
        var c = A.entier(2, 4), d = A.entier(1, 6), e = A.entier(2, 9);
        q.texte = 'Écrire $A=' + frac(px(a) + '\\times(' + px(b) + ')^{' + c + '}\\times ' + px(d), px(e)) + '$ sous la forme $x^n$ ($x\\neq0$). Donner $n$.';
        q.attendu = a + b * c + d - e;
        q.explication = '$(' + px(b) + ')^{' + c + '}=' + px(b * c) + '$, puis au numérateur $x^{' + a + '+' + b * c + '+' + d + '}=' + px(a + b * c + d) + '$, et $' + frac(px(a + b * c + d), px(e)) + '=x^{' + (a + b * c + d) + '-' + e + '}=x^{' + q.attendu + '}$.';
        return q;
    };

    /* ===== Calcul littéral · Distributivité ===== */
    Auto.distributiviteS2 = function (niveau) {
        var poly = Interactif.poly, q, k, b;
        if (niveau === 1) {
            q = { niveau: 1, objectif: 'Calcul littéral · Distributivité' };
            k = A.entier(2, 9) * A.signe(); b = A.nonNul(-9, 9);
            q.texte = 'Développer $' + k + '(' + poly([1, b]) + ')$ :';
            q.explication = '$' + k + '(' + poly([1, b]) + ')=' + k + '\\times x+' + Interactif.par(k) + '\\times' + Interactif.par(b) + '=' + poly([k, k * b]) + '$. Le nombre devant multiplie <b>chaque</b> terme, signe compris.';
            var opts = [{ t: '$' + poly([k, k * b]) + '$', ok: true }, { t: '$' + poly([k, b]) + '$', ok: false }, { t: '$' + poly([k, -k * b]) + '$', ok: false }, { t: '$' + poly([k + b, 0]) + '$', ok: false }];
            if (k + b === 0 || k + b === k) opts[3] = { t: '$' + poly([1, k * b]) + '$', ok: false };
            return qcm(q, opts);
        }
        q = { niveau: niveau, objectif: 'Calcul littéral · Distributivité', type: 'expr', forme: 'developpee', consigne: 'Développer et réduire :', prefixe: 'A =' };
        if (niveau === 2) {
            var a, c;
            do { k = A.entier(2, 9); a = A.nonNul(-9, 9); c = A.nonNul(-9, 9); } while (c === k || c === 0);
            q.enonce = 'A = ' + k + '(' + a + '-x)' + (c > 0 ? '+' : '') + poly([c, 0]);
            q.attendu = poly([c - k, k * a]);
            q.correction = ['A&=' + poly([k * a]) + (-k > 0 ? '+' : '') + poly([-k, 0]) + (c > 0 ? '+' : '') + poly([c, 0]), '&=' + q.attendu];
            return q;
        }
        var q3 = Auto.developper(2); q3.niveau = 3; q3.objectif = 'Calcul littéral · Distributivité';
        return q3;
    };

    /* ===== Algo · Fonctions Python à deux paramètres ===== */
    Auto.fonctionDeuxParametres = function (niveau) {
        var q = { niveau: niveau, objectif: 'Algo · Lire un programme' }, k, a, b, r;
        if (niveau === 1) {
            k = A.entier(2, 4); a = A.entier(3, 12); b = A.entier(2, 9); r = k * a + b;
            q.texte = 'Que renvoie la console si on saisit <code>prix_total(' + a + ', ' + b + ')</code> ?' + code(['def prix_total(prix, frais):', '    return ' + k + ' * prix + frais']);
            q.explication = '<code>prix</code> vaut $' + a + '$ et <code>frais</code> vaut $' + b + '$ (dans l\'ordre des parenthèses) : $' + k + '\\times' + a + '+' + b + '=' + r + '$.';
            return qcmNombres(q, r, [k * b + a, k * (a + b), a + b, k * a], '');
        }
        q.type = 'nombre';
        if (niveau === 2) {
            var c = A.choix([1.5, 2.5, 0.5]); a = A.entier(2, 9) * 2; b = A.entier(1, 5); r = c * a + b;
            q.texte = 'Que renvoie la console si on saisit <code>note_finale(' + a + ', ' + b + ')</code> ?' + code(['def note_finale(devoir, bonus):', '    return ' + String(c) + ' * devoir + bonus']);
            q.attendu = r;
            q.explication = '$' + fr(c) + '\\times' + a + '+' + b + '=' + fr(c * a) + '+' + b + '=' + fr(r) + '$. Comme <code>' + c + '</code> est un nombre à virgule, Python affiche <code>' + r.toFixed(1) + '</code>.';
            return q;
        }
        a = A.entier(2, 6); k = A.entier(2, 4); var m = A.entier(1, 9), bv = A.entier(2, 12); r = a * a + k * bv + m;
        q.texte = 'En Python, <code>a**2</code> calcule $a^2$. On saisit <code>mystere(' + a + ', b)</code> et la console renvoie $' + r + '$. Quelle est la valeur de <code>b</code> ?' + code(['def mystere(a, b):', '    return a**2 + ' + k + '*b + ' + m]);
        q.prefixe = 'b =';
        q.attendu = bv;
        q.explication = '$' + a + '^2+' + k + 'b+' + m + '=' + r + '$, donc $' + k + 'b=' + r + '-' + a * a + '-' + m + '=' + k * bv + '$ et $b=' + bv + '$.';
        return q;
    };

    /* ===== A4 · Écritures d'un nombre ===== */
    Auto.ecrituresNombre = function (niveau) {
        var q = { niveau: niveau, objectif: 'A4 · Écritures d\'un nombre' };
        if (niveau === 1) {
            var f = A.choix([[3, 8], [5, 8], [1, 8], [7, 8], [3, 4], [1, 4], [2, 5], [3, 5], [7, 20], [9, 25], [3, 16]]), v = f[0] / f[1];
            q.texte = 'L\'écriture décimale de $' + frac(f[0], f[1]) + '$ est :';
            q.explication = '$' + frac(f[0], f[1]) + '=' + f[0] + '\\div' + f[1] + '=' + fr(v) + '$.';
            var faux = [arrondi(f[1] / f[0]), arrondi(f[0] + f[1] / 10), arrondi(f[0] / 10 + f[1] / 100), Math.round(v * 100) / 100];
            var vus = {}, opts = [{ t: '$' + fr(v) + '$', ok: true }];
            vus[fr(v)] = true;
            faux.forEach(function (x) { if (!vus[fr(x)] && opts.length < 4) { vus[fr(x)] = true; opts.push({ t: '$' + fr(x) + '$', ok: false }); } });
            while (opts.length < 4) { var y = arrondi(v * 10); if (!vus[fr(y)]) { vus[fr(y)] = true; opts.push({ t: '$' + fr(y) + '$', ok: false }); } else { y = arrondi(v + 1); vus[fr(y)] = true; opts.push({ t: '$' + fr(y) + '$', ok: false }); } }
            return qcm(q, opts);
        }
        q.type = 'champs';
        if (niveau === 2) {
            var n, d0 = 100, g;
            do { n = A.entier(2, 98); g = pgcd(n, d0); } while (g === 1 || n % 10 === 0);
            q.texte = 'Donner l\'écriture fractionnaire irréductible de $' + fr(n / 100) + '$.';
            q.gabarit = '[] $/$ []';
            q.attendus = [n / g, d0 / g];
            q.explication = '$' + fr(n / 100) + '=' + frac(n, 100) + '=' + frac(n / g + '\\times' + g, d0 / g + '\\times' + g) + '=' + frac(n / g, d0 / g) + '$.';
            return q;
        }
        var a = A.entier(1, 9), b = A.entier(1, 9), c = A.entier(1, 9), e1 = A.entier(2, 4), e2 = A.entier(0, e1 - 1), e3 = -A.entier(1, 3);
        var val = a * Math.pow(10, e1) + b * Math.pow(10, e2) + c * Math.pow(10, e3), mant = arrondi(val / Math.pow(10, e1));
        q.texte = 'Écrire en notation scientifique, sous la forme $a\\times10^n$, le nombre $' + a + '\\times10^{' + e1 + '}+' + b + '\\times10^{' + e2 + '}+' + c + '\\times10^{' + e3 + '}$.';
        q.gabarit = '$a=$ [] et $n=$ []';
        q.attendus = [mant, e1];
        q.explication = 'On calcule : $' + fr(a * Math.pow(10, e1)) + '+' + fr(b * Math.pow(10, e2)) + '+' + fr(arrondi(c * Math.pow(10, e3))) + '=' + fr(arrondi(val)) + '$, soit $' + fr(mant) + '\\times10^{' + e1 + '}$ en notation scientifique.';
        return q;
    };

    /* =====================================================================
       Série 1 (semaine du 7 au 11 septembre) : comparer, fractions, puissances de 10, notation scientifique, Pythagore
       ===================================================================== */
    function signeComp(x, y) { return x < y ? '<' : x > y ? '>' : '='; }
    function qcmComparaison(q, g, d, sym) {
        return qcm(q, ['<', '>', '='].map(function (s) { return { t: '$' + g + s + d + '$', ok: s === sym }; }));
    }

    /* ===== A1 · Comparer deux nombres ===== */
    Auto.comparerFractions = function (niveau) {
        var q = { niveau: niveau, objectif: 'A1 · Comparer deux nombres' }, a, b, c, d;
        if (niveau === 1) {                    // même numérateur
            do { a = A.entier(1, 7); b = A.entier(2, 12); c = A.entier(2, 12); } while (b === c || pgcd(a, b) > 1 || pgcd(a, c) > 1);
            var s1 = signeComp(a / b, a / c);
            q.texte = 'Comparer $' + frac(a, b) + '$ et $' + frac(a, c) + '$.';
            q.explication = 'Les deux fractions ont le même numérateur $' + a + '$ : la plus grande est celle qui a le plus <b>petit</b> dénominateur (on partage en moins de parts). Donc $' + frac(a, b) + s1 + frac(a, c) + '$.';
            return qcmComparaison(q, frac(a, b), frac(a, c), s1);
        }
        if (niveau === 2) {                    // a/b et c/d proches
            do { b = A.entier(3, 9); d = A.entier(3, 9); a = A.entier(b + 1, 2 * b); c = A.entier(d + 1, 2 * d); } while (b === d || pgcd(a, b) > 1 || pgcd(c, d) > 1 || a * d === b * c);
            var s2 = signeComp(a / b, c / d);
            q.texte = 'Sans calculatrice, comparer $A=' + frac(a, b) + '$ et $B=' + frac(c, d) + '$.';
            q.explication = 'On réduit au même dénominateur $' + b * d + '$ : $A=' + frac(a * d, b * d) + '$ et $B=' + frac(c * b, b * d) + '$, donc $A' + s2 + 'B$.';
            return qcmComparaison(q, 'A', 'B', s2);
        }
        if (Math.random() < 0.5) {             // fractions négatives
            do { b = A.entier(3, 9); d = A.entier(3, 9); a = A.entier(1, b - 1); c = A.entier(1, d - 1); } while (b === d || pgcd(a, b) > 1 || pgcd(c, d) > 1 || a * d === b * c);
            var s3 = signeComp(-a / b, -c / d);
            q.texte = 'Comparer $A=-' + frac(a, b) + '$ et $B=-' + frac(c, d) + '$.';
            q.explication = '$' + frac(a, b) + '=' + frac(a * d, b * d) + '$ et $' + frac(c, d) + '=' + frac(c * b, b * d) + '$, donc $' + frac(a, b) + signeComp(a / b, c / d) + frac(c, d) + '$.<br>Pour des nombres <b>négatifs</b>, l\'ordre est inversé : $A' + s3 + 'B$.';
            return qcmComparaison(q, 'A', 'B', s3);
        }
        var p = A.choix([[6, 5, 2, 15], [4, 9, 6, 6], [10, 3, 5, 6], [3, 8, 5, 4], [7, 4, 5, 6], [9, 4, 6, 5], [12, 5, 7, 9]]);   // p0²·p1² comparé à p2²·p3²
        var x = p[0] * p[1], y = p[2] * p[3], s4 = signeComp(x, y);
        q.texte = 'Comparer $a=' + p[0] + '^{2}\\times' + p[1] + '^{2}$ et $b=' + p[2] + '^{2}\\times' + p[3] + '^{2}$.';
        q.explication = '$a=(' + p[0] + '\\times' + p[1] + ')^2=' + x + '^2$ et $b=(' + p[2] + '\\times' + p[3] + ')^2=' + y + '^2$, donc $a' + s4 + 'b$.';
        return qcmComparaison(q, 'a', 'b', s4);
    };

    /* ===== A2 · Fractions ===== */
    Auto.fractionsCalcul = function (niveau) {
        var q = { niveau: niveau, objectif: 'A2 · Fractions' }, a, b, c, d;
        if (niveau === 1) {                    // une seule égalité fausse
            var k = A.entier(2, 5), n = A.entier(1, 6), m = A.entier(2, 9);
            do { a = A.entier(1, 8); b = A.entier(2, 9); } while (pgcd(a, b) > 1 || a === b);
            var vraies = [frac(a * k, b * k) + '=' + frac(a, b), frac(n * m, m) + '=' + n, frac(a, b) + '+' + frac(1, b) + '=' + frac(a + 1, b)];
            var fausses = [frac(a, b) + '+' + frac(1, b) + '=' + frac(a + 1, 2 * b), frac(a + k, b + k) + '=' + frac(a, b), frac(a, b) + '\\times' + k + '=' + frac(a * k, b * k)];
            var f = A.choix(fausses);
            if (f.indexOf('+' + frac(1, b) + '=') >= 0) vraies[2] = frac(a, b) + '\\times' + k + '=' + frac(a * k, b);
            q.texte = 'Une seule de ces égalités est <b>fausse</b>. Laquelle ?';
            q.explication = '$' + f + '$ est fausse. ' + (f.indexOf('+') >= 0 && f.indexOf(frac(1, b)) >= 0 ? 'Pour additionner deux fractions de même dénominateur, on additionne les numérateurs et on <b>garde</b> le dénominateur.' :
                f.indexOf('\\times') >= 0 ? 'Pour multiplier une fraction par un entier, on ne multiplie que le numérateur.' : 'On ne peut pas ajouter le même nombre en haut et en bas : il faut <b>multiplier</b> (ou diviser) les deux par le même nombre.');
            return qcm(q, [{ t: '$' + f + '$', ok: true }].concat(vraies.map(function (t) { return { t: '$' + t + '$', ok: false }; })));
        }
        q.type = 'nombre';
        if (niveau === 2) {                    // fraction d'une quantité, à l'envers
            var p = A.choix([[2, 3], [3, 4], [2, 5], [3, 5], [5, 6], [3, 8]]), tot = p[1] * A.entier(4, 15), part = tot * p[0] / p[1];
            var mots = { '2/3': 'deux tiers', '3/4': 'trois quarts', '2/5': 'deux cinquièmes', '3/5': 'trois cinquièmes', '5/6': 'cinq sixièmes', '3/8': 'trois huitièmes' };
            q.texte = 'Dans les ' + mots[p.join('/')] + ' d\'un gâteau, il y a $' + part + '$ grammes de sucre. Combien y a-t-il de grammes de sucre dans le gâteau entier ?';
            q.attendu = tot;
            q.explication = '$' + frac(p[0], p[1]) + '$ du gâteau contiennent $' + part + '$ g, donc $' + frac(1, p[1]) + '$ contient $' + part + '\\div' + p[0] + '=' + part / p[0] + '$ g, et le gâteau entier $' + p[1] + '\\times' + part / p[0] + '=' + tot + '$ g.';
            return q;
        }
        var e, f2, g2, h2, r;
        do {
            b = A.choix([3, 4, 6]); d = A.choix([2, 3, 6, 12]); a = A.entier(1, b * 2); c = A.entier(1, d);
            e = A.entier(1, 4); f2 = A.choix([3, 5, 7]); g2 = 1; h2 = A.choix([2, 5, 10]);
            r = (a / b - c / d) * e / f2 + g2 / h2;
        } while (a / b <= c / d || pgcd(a, b) > 1 || pgcd(c, d) > 1 || b === d || Math.abs(r * 60 * f2 - Math.round(r * 60 * f2)) > 1e-9);
        q.texte = 'Calculer $A=\\left(' + frac(a, b) + '-' + frac(c, d) + '\\right)\\times' + frac(e, f2) + '+' + frac(g2, h2) + '$ (résultat exact, sous forme de fraction si besoin).';
        q.attendu = r;
        var den1 = b * d / pgcd(b, d), n1 = a * den1 / b - c * den1 / d;
        q.explication = '$' + frac(a, b) + '-' + frac(c, d) + '=' + frac(n1, den1) + (pgcd(n1, den1) > 1 ? '=' + fracTex(n1, den1) : '') + '$, puis $' + fracTex(n1, den1) + '\\times' + frac(e, f2) + '=' + fracTex(n1 * e, den1 * f2) + '$, et $' + fracTex(n1 * e, den1 * f2) + '+' + frac(g2, h2) + '=' + fracTex(n1 * e * h2 + den1 * f2 * g2, den1 * f2 * h2) + '$.';
        return q;
    };

    /* ===== A3 · Puissances de 10 ===== */
    Auto.puissancesDix = function (niveau) {
        var q = { niveau: niveau, objectif: 'A3 · Puissances' }, a, b, c;
        if (niveau === 1) {
            a = A.entier(2, 4); b = A.entier(0, 1); c = -A.entier(1, 3);
            var v = Math.pow(10, a) + Math.pow(10, b) + Math.pow(10, c);
            q.texte = 'Calculer $10^{' + a + '}+10^{' + b + '}+10^{' + c + '}$.';
            q.explication = '$10^{' + a + '}=' + fr(Math.pow(10, a)) + '$, $10^{' + b + '}=' + Math.pow(10, b) + '$' + (b === 0 ? ' (tout nombre non nul à la puissance $0$ vaut $1$)' : '') + ' et $10^{' + c + '}=' + fr(Math.pow(10, c)) + '$. Total : $' + fr(arrondi(v)) + '$.';
            return qcm(q, [
                { t: '$' + fr(arrondi(v)) + '$', ok: true },
                { t: '$' + fr(arrondi(Math.pow(10, a) + (b === 0 ? 0 : 1) + Math.pow(10, c))) + '$', ok: false },
                { t: '$' + fr(arrondi(Math.pow(10, a) + Math.pow(10, b) + Math.pow(10, -c))) + '$', ok: false },
                { t: '$' + fr(Math.pow(10, a + b + c)) + '$', ok: false }
            ]);
        }
        q.type = 'nombre';
        if (niveau === 2) {
            var e = -A.entier(1, 4), mant = A.entier(11, 99) / 10, x = arrondi(mant * Math.pow(10, e));
            q.texte = 'On écrit $10^{a}<' + fr(x) + '<10^{b}$, où $a$ et $b$ sont deux entiers relatifs consécutifs. Quelle est la valeur de $b$ ?';
            q.prefixe = 'b =';
            q.attendu = e + 1;
            q.explication = '$10^{' + e + '}=' + fr(Math.pow(10, e)) + '$ et $10^{' + (e + 1) + '}=' + fr(Math.pow(10, e + 1)) + '$ : $' + fr(Math.pow(10, e)) + '<' + fr(x) + '<' + fr(Math.pow(10, e + 1)) + '$, donc $a=' + e + '$ et $b=' + (e + 1) + '$.';
            return q;
        }
        var base = A.choix([2, 3, 5, 6, 7]), p = A.entier(2, 5), r = A.entier(2, 4), s = A.entier(8, 18);
        q.prefixe = 'n =';
        q.texte = 'Écrire $' + frac('(' + base + '^{' + p + '})^{' + r + '}', base + '^{' + s + '}') + '$ sous la forme d\'une puissance de $' + base + '$. Donner l\'exposant $n$.';
        q.attendu = p * r - s;
        q.explication = '$(' + base + '^{' + p + '})^{' + r + '}=' + base + '^{' + p * r + '}$, puis $' + frac(base + '^{' + p * r + '}', base + '^{' + s + '}') + '=' + base + '^{' + p * r + '-' + s + '}=' + base + '^{' + q.attendu + '}$.';
        return q;
    };

    /* ===== A4 · Notation scientifique ===== */
    Auto.notationScientifique = function (niveau) {
        var q = { niveau: niveau, objectif: 'A4 · Écritures d\'un nombre' }, m, e;
        if (niveau === 1) {
            m = A.entier(11, 99) / 10; e = A.entier(2, 4); var v = arrondi(m * Math.pow(10, e));
            q.texte = 'Quelle est l\'écriture décimale du nombre dont l\'écriture scientifique est $' + fr(m) + '\\times10^{' + e + '}$ ?';
            q.explication = 'Multiplier par $10^{' + e + '}$, c\'est décaler la virgule de $' + e + '$ rangs vers la droite : $' + fr(m) + '\\times10^{' + e + '}=' + fr(v) + '$.';
            return qcm(q, [{ t: '$' + fr(v) + '$', ok: true }, { t: '$' + fr(arrondi(v / 10)) + '$', ok: false }, { t: '$' + fr(arrondi(v * 10)) + '$', ok: false }, { t: '$' + fr(arrondi(m + Math.pow(10, e))) + '$', ok: false }]);
        }
        q.type = 'champs'; q.gabarit = '$a=$ [] et $n=$ []';
        if (niveau === 2) {
            m = A.entier(11, 99) / 10; e = -A.entier(2, 5); var x = arrondi(m * Math.pow(10, e));
            q.texte = 'Donner l\'écriture scientifique $a\\times10^n$ du nombre $' + fr(x) + '$.';
            q.attendus = [m, e];
            q.explication = 'On place la virgule après le premier chiffre non nul : $' + fr(m) + '$ ; pour revenir à $' + fr(x) + '$, on la décale de $' + -e + '$ rangs vers la gauche : $' + fr(x) + '=' + fr(m) + '\\times10^{' + e + '}$.';
            return q;
        }
        var a = A.entier(2, 9), b = A.entier(2, 9), p = A.entier(2, 6), r = -A.entier(1, 5), pr = a * b, mm = pr >= 10 ? pr / 10 : pr, ee = p + r + (pr >= 10 ? 1 : 0);
        q.texte = 'Calculer $(' + a + '\\times10^{' + p + '})\\times(' + b + '\\times10^{' + r + '})$ et donner le résultat en écriture scientifique $a\\times10^n$.';
        q.attendus = [mm, ee];
        q.explication = 'On regroupe : $' + a + '\\times' + b + '=' + pr + '$ et $10^{' + p + '}\\times10^{' + r + '}=10^{' + (p + r) + '}$, soit $' + pr + '\\times10^{' + (p + r) + '}$' +
            (pr >= 10 ? ' $=' + fr(mm) + '\\times10^{1}\\times10^{' + (p + r) + '}=' + fr(mm) + '\\times10^{' + ee + '}$ (car $' + pr + '$ n\'est pas entre $1$ et $10$).' : ', déjà en écriture scientifique.');
        return q;
    };

    /* ===== A22 · Pythagore ===== */
    // triangle rectangle quelconque (jamais isocèle), angle droit au sommet nom[0] ; cotes = textes des trois côtés [c1 (nom0-nom1), c2 (nom0-nom2), hyp]
    function triangleRectangle(noms, c1, c2, cotes) {
        var k = 150 / Math.max(c1, c2), ang = A.choix([0, 15, -15, 25]) * Math.PI / 180;
        var u1 = [Math.cos(ang), -Math.sin(ang)], u2 = [-Math.sin(ang), -Math.cos(ang)];      // u2 ⟂ u1, vers le haut (y vers le bas en SVG)
        var P0 = [0, 0], pts = [P0, [c1 * k * u1[0], c1 * k * u1[1]], [c2 * k * u2[0], c2 * k * u2[1]]];
        var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; }), m = 64;
        var minx = Math.min.apply(null, xs) - m, miny = Math.min.apply(null, ys) - m, W = Math.max.apply(null, xs) - minx + m, H = Math.max.apply(null, ys) - miny + m;
        function X(p) { return p[0] - minx; } function Y(p) { return p[1] - miny; }
        var s = '<svg viewBox="0 0 ' + W.toFixed(0) + ' ' + H.toFixed(0) + '" width="' + W.toFixed(0) + '" height="' + H.toFixed(0) + '" role="img" aria-label="Triangle rectangle">';
        s += '<polygon class="fig-forme" points="' + pts.map(function (p) { return X(p).toFixed(1) + ',' + Y(p).toFixed(1); }).join(' ') + '"/>';
        var e = 12;
        s += '<path class="fig-seg" fill="none" d="M' + (X(P0) + e * u1[0]).toFixed(1) + ',' + (Y(P0) + e * u1[1]).toFixed(1) + ' L' + (X(P0) + e * u1[0] + e * u2[0]).toFixed(1) + ',' + (Y(P0) + e * u1[1] + e * u2[1]).toFixed(1) + ' L' + (X(P0) + e * u2[0]).toFixed(1) + ',' + (Y(P0) + e * u2[1]).toFixed(1) + '"/>';
        var G = [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3];
        pts.forEach(function (p, i) {
            var dx = p[0] - G[0], dy = p[1] - G[1], n = Math.hypot(dx, dy);
            s += '<text class="fig-nom-pt" x="' + (X(p) + 18 * dx / n).toFixed(1) + '" y="' + (Y(p) + 18 * dy / n + 6).toFixed(1) + '" text-anchor="middle">' + noms[i] + '</text>';
        });
        [[0, 1, cotes[0]], [0, 2, cotes[1]], [1, 2, cotes[2]]].forEach(function (c) {
            if (!c[2]) return;
            var a = pts[c[0]], b = pts[c[1]], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = mx - G[0], dy = my - G[1], n = Math.hypot(dx, dy);
            s += '<text class="fig-txt fig-cote" x="' + (X([mx, my]) + 20 * dx / n).toFixed(1) + '" y="' + (Y([mx, my]) + 20 * dy / n + 5).toFixed(1) + '" text-anchor="middle">' + c[2] + '</text>';
        });
        return s + '</svg>';
    }
    function nomsTriangle() { return A.choix([['A', 'B', 'C'], ['E', 'D', 'F'], ['K', 'L', 'M'], ['R', 'S', 'T']]); }
    Auto.pythagore = function (niveau) {
        var q = { niveau: niveau, objectif: 'A22 · Pythagore, Thalès' }, N = nomsTriangle(), a, b, h2, r;
        var c1 = N[0] + N[1], c2 = N[0] + N[2], hyp = N[1] + N[2];
        if (niveau === 1) {
            do { a = A.entier(2, 9); b = A.entier(2, 9); h2 = a * a + b * b; } while (a === b || racine(h2)[0] !== 1);
            q.figure = triangleRectangle(N, a, b, [a + ' cm', b + ' cm', '?']); q.figureNote = c1 + '=' + a + ' ' + c2 + '=' + b;
            q.texte = 'Le triangle $' + N.join('') + '$ est rectangle en $' + N[0] + '$, avec $' + c1 + '=' + a + '$ cm et $' + c2 + '=' + b + '$ cm. Quelle est la longueur du segment $[' + hyp + ']$ ?';
            q.explication = 'Pythagore dans le triangle rectangle en $' + N[0] + '$ ($[' + hyp + ']$ est l\'hypoténuse) : $' + hyp + '^2=' + a + '^2+' + b + '^2=' + a * a + '+' + b * b + '=' + h2 + '$, donc $' + hyp + '=\\sqrt{' + h2 + '}$ cm.';
            return qcm(q, [{ t: '$\\sqrt{' + h2 + '}$ cm', ok: true }, { t: '$' + (a + b) + '$ cm', ok: false }, { t: '$' + h2 + '$ cm', ok: false }, { t: '$\\sqrt{' + Math.abs(a * a - b * b) + '}$ cm', ok: false }]);
        }
        q.type = 'champs';
        do { a = A.entier(3, 12); b = A.entier(2, a - 1); r = a * a - b * b; } while (niveau === 2 ? racine(r)[0] !== 1 : (racine(r)[0] === 1 || racine(r)[1] === 1));
        var cote = Math.sqrt(r);
        q.figure = triangleRectangle(N, b, cote, [b + ' cm', '?', a + ' cm']); q.figureNote = hyp + '=' + a + ' ' + c1 + '=' + b;
        q.texte = 'Le triangle $' + N.join('') + '$ est rectangle en $' + N[0] + '$, avec l\'hypoténuse $' + hyp + '=' + a + '$ cm et $' + c1 + '=' + b + '$ cm. ' +
            (niveau === 2 ? 'Calculer la valeur exacte de $' + c2 + '$.' : 'Déterminer la valeur exacte de $' + c2 + '$, sous la forme $a\\sqrt{b}$ ($b$ le plus petit possible).');
        q.gabarit = niveau === 2 ? '$' + c2 + '=\\sqrt{b}$ avec $b=$ []' : '$a=$ [] et $b=$ []';
        q.attendus = niveau === 2 ? [r] : racine(r);
        q.explication = 'Pythagore : $' + hyp + '^2=' + c1 + '^2+' + c2 + '^2$, donc $' + c2 + '^2=' + a + '^2-' + b + '^2=' + a * a + '-' + b * b + '=' + r + '$ et $' + c2 + '=\\sqrt{' + r + '}' + (niveau === 3 ? '=\\sqrt{' + racine(r)[0] * racine(r)[0] + '\\times' + racine(r)[1] + '}=' + racineTex(r) : '') + '$ cm.';
        return q;
    };

    /* =====================================================================
       Série 8 (semaine du 9 au 13 novembre) : les trois QCM révisent le DS 2
       (identités remarquables, Chasles, if / else) ; puis puissances, repère, images
       (questions simples) ; pourcentages, ordre de grandeur, ranger (automatismes finaux)
       ===================================================================== */
    /* ===== A9 · Identités remarquables ===== */
    Auto.identitesRemarquables = function (niveau) {
        var poly = Interactif.poly, a, k, b, s, q;
        if (niveau === 1) {
            q = { niveau: 1, objectif: 'A9 · Identités remarquables' };
            a = A.entier(2, 9);
            var cas = A.choix(['plus', 'moins', 'produit']), tx, bon, faux, regle;
            if (cas === 'plus') {
                tx = '(x+' + a + ')^2'; bon = poly([1, 2 * a, a * a]); regle = '(a+b)^2=a^2+2ab+b^2';
                faux = ['x^2+' + a * a, 'x^2+' + a + 'x+' + a * a, '2x+' + 2 * a];
            } else if (cas === 'moins') {
                tx = '(x-' + a + ')^2'; bon = poly([1, -2 * a, a * a]); regle = '(a-b)^2=a^2-2ab+b^2';
                faux = ['x^2-' + a * a, 'x^2+' + 2 * a + 'x+' + a * a, 'x^2-' + 2 * a + 'x-' + a * a];
            } else {
                tx = '(x+' + a + ')(x-' + a + ')'; bon = poly([1, 0, -a * a]); regle = '(a+b)(a-b)=a^2-b^2';
                faux = ['x^2+' + a * a, 'x^2-' + a * a + 'x', 'x^2-' + 2 * a + 'x-' + a * a];
            }
            q.texte = 'Le développement de $' + tx + '$ est :';
            q.explication = '$' + regle + '$ avec $a=x$ et $b=' + a + '$ : $' + tx + '=' + bon + '$.' +
                (cas === 'produit' ? '' : '<br>Il ne faut pas oublier le double produit $2ab=2\\times x\\times' + a + '=' + 2 * a + 'x$.');
            return qcm(q, [{ t: '$' + bon + '$', ok: true }].concat(faux.map(function (f) { return { t: '$' + f + '$', ok: false }; })));
        }
        if (niveau === 2) {
            k = A.entier(2, 5); b = A.entier(1, 9); s = A.signe();
            q = { niveau: 2, objectif: 'A9 · Identités remarquables', type: 'expr', forme: 'developpee', consigne: 'Développer et réduire :', prefixe: 'A =' };
            q.enonce = 'A = (' + poly([k, s * b]) + ')^2';
            q.attendu = poly([k * k, 2 * k * s * b, b * b]);
            q.correction = ['A&=(' + k + 'x)^2' + (s > 0 ? '+' : '-') + '2\\times ' + k + 'x\\times ' + b + '+' + b + '^2', '&=' + q.attendu];
            return q;
        }
        do { k = A.entier(2, 7); b = A.entier(1, 9); } while (pgcd(k, b) !== 1);
        var kx = k + 'x';
        q = factoQ(3, poly([k * k, 0, -b * b]), '(' + poly([k, -b]) + ')(' + poly([k, b]) + ')', poly([k, b]));
        q.objectif = 'A9 · Identités remarquables';
        q.explication = '$' + poly([k * k, 0, 0]) + '=(' + kx + ')^2$ et $' + b * b + '=' + b + '^2$ : on reconnaît $a^2-b^2=(a-b)(a+b)$ avec $a=' + kx + '$ et $b=' + b + '$.<br>' +
            '$A=(' + poly([k, -b]) + ')(' + poly([k, b]) + ')$.';
        return q;
    };

    /* ===== A3 · Puissances (sans choix proposés) ===== */
    Auto.puissancesSimple = function (niveau) {
        function pw(x, n) { return n === 1 ? String(x) : x + '^{' + n + '}'; }
        if (niveau === 2) return Auto.puissances(2);
        var q = { niveau: niveau, objectif: 'A3 · Puissances' };
        if (niveau === 1) {
            var a = A.entier(2, 9), m, n, produit = Math.random() < 0.5;
            do { m = A.nonNul(-6, 8); n = A.nonNul(-6, 8); } while (m === n || (produit ? m + n : m - n) === 0 || (m > 0 && n > 0 && produit));
            var r = produit ? m + n : m - n;
            q.type = 'nombre'; q.prefixe = 'n =';
            q.texte = 'Écrire sous la forme $' + a + '^n$ : $' + (produit ? a + '^{' + m + '}\\times' + a + '^{' + n + '}' : frac(a + '^{' + m + '}', a + '^{' + n + '}')) + '$. Donner $n$.';
            q.attendu = r;
            q.explication = (produit ? '$a^m\\times a^n=a^{m+n}$ : $' + m + '+' + Interactif.par(n) : '$' + frac('a^m', 'a^n') + '=a^{m-n}$ : $' + m + '-' + Interactif.par(n)) + '=' + r + '$, donc le résultat est $' + a + '^{' + r + '}$.';
            return q;
        }
        // c^u / (p^v × r^w) = p^(u-v) × r^(u-w), avec c = p × r
        var cas = A.choix([[2, 3], [2, 5], [3, 5]]), p = cas[0], rr = cas[1], c = p * rr, u = A.entier(3, 4), v = A.entier(1, u - 1), w = A.entier(1, u - 1);
        q.type = 'champs';
        q.texte = 'Écrire sous la forme $' + p + '^a\\times' + rr + '^b$ : $C=' + frac(pw(c, u), pw(p, v) + '\\times' + pw(rr, w)) + '$.';
        q.gabarit = '$a=$ [] et $b=$ []';
        q.attendus = [u - v, u - w];
        q.explication = '$' + c + '^{' + u + '}=(' + p + '\\times' + rr + ')^{' + u + '}=' + p + '^{' + u + '}\\times' + rr + '^{' + u + '}$.<br>' +
            '$C=' + p + '^{' + u + '-' + v + '}\\times' + rr + '^{' + u + '-' + w + '}=' + p + '^{' + (u - v) + '}\\times' + rr + '^{' + (u - w) + '}$ : $a=' + (u - v) + '$ et $b=' + (u - w) + '$.';
        return q;
    };

    /* ===== A13 · Pourcentages (automatisme final) ===== */
    Auto.pourcentageFinal = function (niveau) {
        var q = { niveau: niveau, objectif: 'A13 · Proportions', type: 'nombre' }, p, N;
        function detail(p, N) {
            var dix = N / 10, cinq = N / 20, k = Math.floor(p / 10);
            return '$10\\,\\%$ de $' + fr(N) + '$ : $' + fr(dix) + '$ ; $5\\,\\%$ : $' + fr(cinq) + '$.<br>$' + pct(p) + '=' + (k > 1 ? k + '\\times' : '') + '10\\,\\%+5\\,\\%$ : $' + (k > 1 ? k + '\\times' : '') + fr(dix) + '+' + fr(cinq) + '=' + fr(p * N / 100) + '$.';
        }
        if (niveau < 3) {
            p = A.choix(niveau === 1 ? [15, 35, 45, 55] : [45, 55, 65, 85, 95]);
            N = A.entier(niveau === 1 ? 3 : 6, niveau === 1 ? 20 : 30) * 20;
            q.texte = 'Calculer $' + pct(p) + '$ de $' + fr(N) + '$.';
            q.attendu = p * N / 100;
            q.explication = detail(p, N);
            return q;
        }
        var g = A.choix(GROUPES_ELEVES);
        do { N = A.choix([200, 250, 400, 480, 500, 600, 800, 1200, 1250]); p = A.entier(1, 19) * 5; } while ((p * N / 100) % 1 || p === 50);
        var n = p * N / 100;
        q.type = 'champs';
        q.texte = 'Dans un groupe de $' + fr(N) + '$ ' + g[0] + ', $' + fr(n) + '$ ' + g[1] + '. Quel est le pourcentage ' + g[2] + ' ?';
        q.gabarit = '[] $\\,\\%$';
        q.attendus = [p];
        q.explication = 'Proportion : $' + frac(fr(n), fr(N)) + '=' + fr(p / 100) + '$, soit $' + pct(p) + '$.';
        return q;
    };

    /* ===== Vecteurs · Relation de Chasles ===== */
    Auto.chasles = function (niveau) {
        if (niveau === 3) { var q3 = Auto.normeSimplifier(2); q3.niveau = 3; q3.objectif = 'Vecteurs · Chasles et norme'; return q3; }
        var q = { niveau: niveau, objectif: 'Vecteurs · Relation de Chasles' };
        var L = melanger(LETTRES_RESEAU.split('')).slice(0, 4), X = L[0], Y = L[1], Z = L[2], W = L[3];
        var termes, explication;
        if (niveau === 1) {
            termes = melanger(['+' + vec(X + Y), '+' + vec(Y + Z), '+' + vec(Z + W)]);
            if (termes.join('') === '+' + vec(X + Y) + '+' + vec(Y + Z) + '+' + vec(Z + W)) termes = [termes[1], termes[0], termes[2]];
            explication = 'On remet les vecteurs bout à bout : $' + vec(X + Y) + '+' + vec(Y + Z) + '+' + vec(Z + W) + '=' + vec(X + Z) + '+' + vec(Z + W) + '=' + vec(X + W) + '$.';
        } else {
            termes = ['+' + vec(X + Y), '-' + vec(Z + Y), '+' + vec(Z + W)];
            explication = '$-' + vec(Z + Y) + '=' + vec(Y + Z) + '$ (vecteur opposé), donc $' + vec(X + Y) + '+' + vec(Y + Z) + '+' + vec(Z + W) + '=' + vec(X + W) + '$.';
        }
        q.texte = (niveau === 1 ? '' : 'Simplifier : ') + '$' + termes.join('').replace(/^\+/, '') + '$' + (niveau === 1 ? ' est égal à :' : '');
        q.explication = explication;
        return qcm(q, [{ t: '$' + vec(X + W) + '$', ok: true }, { t: '$' + vec(W + X) + '$', ok: false },
            { t: '$' + vec(X + Z) + '$', ok: false }, { t: niveau === 1 ? '$' + vec(Y + W) + '$' : '$\\vec{0}$', ok: false }]);
    };

    /* ===== A20 · Lire des coordonnées (sans choix proposés) ===== */
    Auto.lireCoordonneesSimple = function (niveau) {
        if (niveau === 2) return Auto.lireCoordonnees(2);
        var q = { niveau: niveau, objectif: 'A20 · Repère orthogonal', type: 'champs' }, x, y;
        do { x = A.nonNul(-3, 3); y = A.nonNul(-2, 2); } while (Math.abs(x) === Math.abs(y));
        if (niveau === 1) {
            q.figure = repere({ xmin: -4, xmax: 4, ymin: -3, ymax: 3, points: [{ nom: 'A', x: x, y: y }] });
            q.figureNote = 'A(' + x + ' ; ' + y + ')';
            q.texte = 'Lire les coordonnées du point $A$.';
            q.gabarit = '$A\\Big($ [] $;$ [] $\\Big)$';
            q.attendus = [x, y];
            q.explication = 'On lit d\'abord l\'abscisse (axe horizontal), puis l\'ordonnée (axe vertical) : $A' + coord(x, y) + '$.';
            return q;
        }
        var bx, by;
        do { bx = A.nonNul(-7, 7) / 2; by = A.nonNul(-5, 5) / 2; } while (bx % 1 === 0 || by % 1 === 0 || Math.abs(bx) > 3.5 || Math.abs(by) > 2.5 || Math.sign(bx) === Math.sign(x));
        var abscB = Math.random() < 0.5, ex = abscB ? bx : x, ey = abscB ? y : by;
        q.figure = repere({ xmin: -4, xmax: 4, ymin: -3, ymax: 3, sub: 2, points: [{ nom: 'A', x: x, y: y }, { nom: 'B', x: bx, y: by }] });
        q.figureNote = 'A(' + x + ' ; ' + y + ') B(' + bx + ' ; ' + by + ')';
        q.texte = 'Chaque unité est partagée en deux carreaux. Le point $E$ a la même abscisse que $' + (abscB ? 'B' : 'A') + '$ et la même ordonnée que $' + (abscB ? 'A' : 'B') + '$. Donner ses coordonnées.';
        q.gabarit = '$E\\Big($ [] $;$ [] $\\Big)$';
        q.attendus = [ex, ey];
        q.explication = '$A' + coord(x, y) + '$ et $B' + coord(bx, by) + '$. Abscisse de $' + (abscB ? 'B' : 'A') + '$, ordonnée de $' + (abscB ? 'A' : 'B') + '$ : $E' + coord(ex, ey) + '$.';
        return q;
    };

    /* ===== A5 · Ordre de grandeur (automatisme final) ===== */
    Auto.ordreGrandeurFinal = function (niveau) {
        var q = { niveau: niveau, objectif: 'A5 · Encadrer, ordre de grandeur', type: 'nombre' };
        function proche(v0, ecart) { return arrondi(v0 + A.choix([-1, 1]) * A.entier(1, ecart)); }
        if (niveau === 1) {
            var p0 = A.choix([10, 25, 50, 75]), N0 = A.entier(2, 12) * 400, p = arrondi(p0 + A.choix([-1, 1]) * A.entier(1, 9) / 10), N = proche(N0, Math.round(N0 / 100));
            var nom = { 10: 'le dixième', 25: 'le quart', 50: 'la moitié', 75: 'les trois quarts' }[p0];
            q.texte = 'Donner un ordre de grandeur de $' + pct(p) + '$ de $' + fr(N) + '$.';
            q.attendu = p0 * N0 / 100;
            q.explication = '$' + pct(p) + '\\approx' + pct(p0) + '$ (' + nom + ') et $' + fr(N) + '\\approx' + fr(N0) + '$ : environ $' + fr(q.attendu) + '$.';
            return q;
        }
        if (niveau === 2) {
            var a0 = A.entier(2, 9) * 10, b0 = A.choix([20, 25, 40, 50]), a = arrondi(a0 + A.choix([-1, 1]) * A.entier(1, 4) / 10), b = arrondi(b0 + A.choix([-1, 1]) * A.entier(1, 4) / 10);
            q.texte = 'Donner un ordre de grandeur de $' + fr(a) + '\\times' + fr(b) + '$.';
            q.attendu = a0 * b0;
            q.explication = '$' + fr(a) + '\\approx' + a0 + '$ et $' + fr(b) + '\\approx' + b0 + '$ : environ $' + a0 + '\\times' + b0 + '=' + fr(a0 * b0) + '$.';
            return q;
        }
        var M0 = A.entier(1, 9) * 1000, d0 = A.choix([0.5, 0.25, 0.2]), M = proche(M0, 15), d = arrondi(d0 + A.choix([-1, 1]) * (d0 === 0.5 ? 0.01 : 0.001));
        var inv = Math.round(1 / d0);
        q.texte = 'Donner un ordre de grandeur de $' + frac(fr(M), fr(d)) + '$.';
        q.attendu = M0 * inv;
        q.explication = '$' + fr(M) + '\\approx' + fr(M0) + '$ et $' + fr(d) + '\\approx' + fr(d0) + '$. Diviser par $' + fr(d0) + '$, c\'est multiplier par $' + inv + '$ : environ $' + fr(M0) + '\\times' + inv + '=' + fr(q.attendu) + '$.';
        return q;
    };

    /* ===== Algo · if / else et affectations ===== */
    Auto.scriptSiSinon = function (niveau) {
        var q = { niveau: niveau, objectif: 'Algo · Structures conditionnelles' };
        var AIDE = '<span class="q-aide-code"><code>if</code> signifie « si » et <code>else</code> signifie « sinon ».</span>';
        if (niveau === 1) {
            var a, b, sup, vrai, bon, autre, opts;
            do {
                a = A.entier(3, 20); b = A.entier(3, 20); sup = Math.random() < 0.6;
                vrai = sup ? a > b : a < b;
                bon = vrai ? [a - b, b] : [a, b - a];
                autre = vrai ? [a, b - a] : [a - b, b];
                opts = [bon, autre, [bon[1], bon[0]], [a, b]];
            } while (a === b || opts.some(function (o, k) { return opts.some(function (p, j) { return j < k && p[0] === o[0] && p[1] === o[1]; }); }));
            var lignes = ['a = ' + a, 'b = ' + b, 'if a ' + (sup ? '>' : '<') + ' b:', '    a = a - b', 'else:', '    b = b - a', 'print(a, b)'];
            q.texte = 'Qu\'affiche ce script ?' + AIDE + code(lignes);
            q.explication = '$' + a + (sup ? '>' : '<') + b + '$ est ' + (vrai ? '<b>vrai</b> : on exécute seulement <code>a = a - b</code>, <code>a</code> devient $' + a + '-' + b + '=' + (a - b) + '$'
                : '<b>faux</b> : on exécute seulement le bloc <code>else</code>, <code>b</code> devient $' + b + '-' + a + '=' + (b - a) + '$') +
                '.<br>Le script affiche ' + console2(bon[0], bon[1]) + '.';
            return qcm(q, opts.map(function (o, k) { return { t: console2(o[0], o[1]), ok: k === 0 }; }));
        }
        // f(x) : y = c x - d ; renvoie y si y >= 0, sinon -y (c'est la distance entre c x et d)
        var c = A.entier(2, 4), m = A.entier(1, 5), d = c * m;
        var fonction = ['def f(x):', '    y = ' + lin(c, -d), '    if y >= 0:', '        return y', '    else:', '        return -y'];
        q.type = 'champs';
        if (niveau === 2) {
            var x1 = m + A.entier(1, 4), x2 = m - A.entier(1, 5), y1 = c * x1 - d, y2 = c * x2 - d;
            q.texte = 'Que renvoient <code>f(' + x1 + ')</code> et <code>f(' + x2 + ')</code> ?' + code(fonction);
            q.gabarit = '<code>f(' + x1 + ')</code> renvoie [] et <code>f(' + x2 + ')</code> renvoie []';
            q.attendus = [y1, -y2];
            q.explication = '<code>f(' + x1 + ')</code> : $y=' + c + '\\times' + Interactif.par(x1) + '-' + d + '=' + y1 + '\\geqslant0$, la fonction renvoie $' + y1 + '$.<br>' +
                '<code>f(' + x2 + ')</code> : $y=' + c + '\\times' + Interactif.par(x2) + '-' + d + '=' + y2 + '<0$, la fonction renvoie $-' + Interactif.par(y2) + '=' + (-y2) + '$.';
            return q;
        }
        var t = A.entier(1, 5), k = c * t;
        q.texte = 'Trouver <b>tous</b> les nombres $x$ pour lesquels <code>f(x)</code> renvoie $' + k + '$ (du plus petit au plus grand).' + code(fonction);
        q.gabarit = '$x=$ [] et $x=$ []';
        q.attendus = [m - t, m + t];
        q.explication = 'Si $y\\geqslant0$ : $' + Interactif.poly([c, -d]) + '=' + k + '$ donne $x=' + (m + t) + '$ (alors $y=' + k + '\\geqslant0$ ✓).<br>' +
            'Si $y<0$ : $-(' + Interactif.poly([c, -d]) + ')=' + k + '$, donc $' + Interactif.poly([c, -d]) + '=-' + k + '$ et $x=' + (m - t) + '$ (alors $y=-' + k + '<0$ ✓).<br>Deux nombres : $' + (m - t) + '$ et $' + (m + t) + '$.';
        return q;
    };

    /* ===== A16 · Image par une fonction (sans choix proposés) ===== */
    Auto.imageSimple = function (niveau) {
        if (niveau === 2) return Auto.imageFonction(2);
        var poly = Interactif.poly, par = Interactif.par, q = { niveau: niveau, objectif: 'A16 · Images et antécédents' };
        if (niveau === 1) {
            var a = A.entier(2, 7) * A.signe(), b = A.nonNul(-9, 9), x0 = -A.entier(2, 6);
            q.type = 'nombre';
            q.texte = 'Soit $f$ la fonction définie par $f(x)=' + poly([a, b]) + '$. Calculer $f(' + x0 + ')$.';
            q.prefixe = 'f(' + x0 + ')=';
            q.attendu = a * x0 + b;
            q.explication = '$f(' + x0 + ')=' + a + '\\times' + par(x0) + (b > 0 ? '+' : '') + b + '=' + a * x0 + (b > 0 ? '+' : '') + b + '=' + q.attendu + '$.';
            return q;
        }
        var r = A.entier(2, 9), c = A.nonNul(-9, 9), k = r * r + c;
        q.type = 'champs';
        q.texte = 'Soit $h$ la fonction définie par $h(x)=' + poly([1, 0, c]) + '$. Déterminer les antécédents de $' + k + '$ par $h$ (du plus petit au plus grand).';
        q.gabarit = '$x=$ [] et $x=$ []';
        q.attendus = [-r, r];
        q.explication = '$' + poly([1, 0, c]) + '=' + k + '$, donc $x^2=' + k + (c > 0 ? '-' + c : '+' + -c) + '=' + r * r + '$ : $x=' + r + '$ ou $x=-' + r + '$.<br>' +
            '$' + k + '$ a deux antécédents : $-' + r + '$ et $' + r + '$.';
        return q;
    };

    /* ===== A1 · Ranger des nombres (automatisme final) ===== */
    Auto.rangerFinal = function (niveau) {
        var q = { niveau: niveau, objectif: 'A1 · Comparer deux nombres', type: 'ordre' }, vals;
        do {
            if (niveau < 3) {
                var base = A.entier(1, 3) + A.choix([0.25, 0.75]), s = niveau === 1 ? 1 : -1, dixieme = Math.floor(base * 10) / 10;
                vals = [ecrFraction(s * base, 4), ecrDecimal(arrondi(s * (base + A.choix([-0.03, -0.04, 0.02])))),
                        ecrPuissance(arrondi(s * dixieme), 1), ecrDecimal(arrondi(s * (dixieme + A.choix([0.005, 0.01]))))];
            } else {
                var f = A.choix([[5, 7], [4, 7], [3, 7], [2, 7], [2, 3], [5, 6], [5, 9], [7, 9]]), v = f[0] / f[1];
                var d = Math.floor(v * 100) / 100, t = Math.floor(v * 10) / 10;
                if (arrondi(t) === arrondi(d)) t = arrondi(t + 0.1);
                vals = [{ v: v, t: '$' + frac(f[0], f[1]) + '$' }, ecrDecimal(d), ecrDecimal(arrondi(d + 0.01)), { v: t, t: '$' + fracTex(Math.round(t * 10), 10) + '$' }];
            }
            vals = vals.map(function (x) { x.v = arrondi(x.v); return x; });
        } while (!distincts(vals.map(function (x) { return x.v; })));
        vals = melanger(vals);
        var L = 'ABCD';
        q.texte = 'Ranger dans l\'ordre croissant (écris les lettres, du plus petit au plus grand) :<br>' +
            vals.map(function (x, k) { return '<b>' + L[k] + '</b> : ' + x.t; }).join(' &nbsp; ');
        var ordre = vals.map(function (x, k) { return { v: x.v, l: L[k], t: x.t }; }).sort(function (u, w) { return u.v - w.v; });
        q.attendu = ordre.map(function (o) { return o.l; }).join('');
        q.explication = ordre.map(function (o) { return o.t === '$' + fr(o.v) + '$' ? o.t : o.t.replace(/\$$/, '') + (o.v * 1000 % 1 ? '\\approx' + fr(Math.round(o.v * 1000) / 1000) : '=' + fr(o.v)) + '$'; }).join(' $<$ ') +
            ', donc <b>' + q.attendu + '</b>.' + (niveau === 2 ? '<br>Chez les négatifs, le plus petit est le plus éloigné de $0$.' : '');
        return q;
    };

    /* =====================================================================
       Série 9 (semaine du 16 au 20 novembre) : arithmétique, isoler une variable,
       produit nul (QCM) ; identités remarquables, Chasles, if / else (questions simples) ;
       puissances, repère, images (automatismes finaux)
       ===================================================================== */
    /* ===== Arithmétique : nombres premiers, décomposition ===== */
    var PREMIERS = [53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113];
    var FAUX_PREMIERS = [[51, 3, 17], [57, 3, 19], [69, 3, 23], [87, 3, 29], [93, 3, 31], [111, 3, 37], [77, 7, 11], [91, 7, 13], [119, 7, 17], [133, 7, 19], [143, 11, 13]];
    function decompTex(e) {                 // e = {2: a, 3: b, 5: c} -> 2^{3}\times3\times5^{2}
        return [2, 3, 5].filter(function (p) { return e[p]; }).map(function (p) { return e[p] === 1 ? String(p) : p + '^{' + e[p] + '}'; }).join('\\times');
    }
    Auto.arithmetique = function (niveau) {
        var q = { niveau: niveau, objectif: 'Arithmétique · Nombres premiers' };
        if (niveau === 1) {
            var p = A.choix(PREMIERS), faux = melanger(FAUX_PREMIERS).slice(0, 3);
            q.texte = 'Parmi les nombres suivants, lequel est un nombre premier ?';
            q.explication = faux.map(function (f) { return '$' + f[0] + '=' + f[1] + '\\times' + f[2] + '$'; }).join(' ; ') + ' : ces nombres ne sont pas premiers.<br>' +
                '$' + p + '$ n\'a que deux diviseurs, $1$ et lui-même : il est premier.';
            return qcm(q, [{ t: '$' + p + '$', ok: true }].concat(faux.map(function (f) { return { t: '$' + f[0] + '$', ok: false }; })));
        }
        if (niveau === 2) {
            var a, b, c, n;
            do { a = A.entier(1, 3); b = A.entier(1, 3); c = A.entier(1, 2); n = Math.pow(2, a) * Math.pow(3, b) * Math.pow(5, c); } while (n > 1000);
            q.type = 'champs';
            q.texte = 'Décomposer $' + fr(n) + '$ en produit de facteurs premiers sous la forme $2^a\\times3^b\\times5^c$.';
            q.gabarit = '$a=$ [] ; $b=$ [] ; $c=$ []';
            q.attendus = [a, b, c];
            var etapes = [], m = n;
            [2, 3, 5].forEach(function (pr) { while (m % pr === 0) { etapes.push('$' + fr(m) + '=' + pr + '\\times' + fr(m / pr) + '$'); m /= pr; } });
            q.explication = 'On divise par $2$ tant que c\'est possible, puis par $3$, puis par $5$ :<br>' + etapes.join(' ; ') + '.<br>Donc $' + fr(n) + '=' + decompTex({ 2: a, 3: b, 5: c }) + '$.';
            return q;
        }
        var e, k, r;
        do {
            e = { 2: A.entier(0, 4), 3: A.entier(0, 3), 5: A.entier(0, 2) };
            k = Math.pow(2, e[2]) * Math.pow(3, e[3]) * Math.pow(5, e[5]);
            r = (e[2] % 2 ? 2 : 1) * (e[3] % 2 ? 3 : 1) * (e[5] % 2 ? 5 : 1);
        } while (k < 12 || k > 400 || r === 1 || [2, 3, 5].filter(function (pr) { return e[pr]; }).length < 2);
        q.type = 'nombre'; q.prefixe = 'n =';
        q.texte = 'Quel est le plus petit entier $n\\geqslant1$ tel que $' + k + '\\times n$ soit le carré d\'un nombre entier ?';
        q.attendu = r;
        var e2 = { 2: e[2] + (e[2] % 2), 3: e[3] + (e[3] % 2), 5: e[5] + (e[5] % 2) };
        q.explication = '$' + k + '=' + decompTex(e) + '$. Dans un carré, tous les exposants de la décomposition sont pairs : il faut multiplier par $' + r + '$.<br>' +
            '$' + k + '\\times' + r + '=' + fr(k * r) + '=' + decompTex(e2) + '=' + Math.sqrt(k * r) + '^2$.';
        return q;
    };

    /* ===== A9 · Identités remarquables (sans choix proposés) ===== */
    Auto.identitesSimple = function (niveau) {
        if (niveau === 2) { var q2 = Auto.identitesRemarquables(3); q2.niveau = 2; return q2; }
        var poly = Interactif.poly, q = { niveau: niveau, objectif: 'A9 · Identités remarquables' };
        if (niveau === 1) {
            var a = A.entier(2, 9), cas = A.choix(['plus', 'moins', 'produit']), tx, ligne;
            q.type = 'expr'; q.forme = 'developpee'; q.consigne = 'Développer et réduire :'; q.prefixe = 'A =';
            if (cas === 'plus') { tx = '(x+' + a + ')^2'; q.attendu = poly([1, 2 * a, a * a]); ligne = 'x^2+2\\times x\\times ' + a + '+' + a + '^2'; }
            else if (cas === 'moins') { tx = '(x-' + a + ')^2'; q.attendu = poly([1, -2 * a, a * a]); ligne = 'x^2-2\\times x\\times ' + a + '+' + a + '^2'; }
            else { tx = '(x+' + a + ')(x-' + a + ')'; q.attendu = poly([1, 0, -a * a]); ligne = 'x^2-' + a + '^2'; }
            q.enonce = 'A = ' + tx;
            q.correction = ['A&=' + ligne, '&=' + q.attendu];
            return q;
        }
        var m = A.entier(2, 10) * 10, forme = A.choix(['produit', 'plus', 'moins']), tx3, v, det;
        if (forme === 'produit') { tx3 = (m - 1) + '\\times' + (m + 1); v = m * m - 1; det = '(' + m + '-1)(' + m + '+1)=' + m + '^2-1^2=' + fr(m * m) + '-1'; }
        else if (forme === 'plus') { tx3 = (m + 1) + '^2'; v = (m + 1) * (m + 1); det = '(' + m + '+1)^2=' + m + '^2+2\\times' + m + '\\times1+1^2=' + fr(m * m) + '+' + 2 * m + '+1'; }
        else { tx3 = (m - 1) + '^2'; v = (m - 1) * (m - 1); det = '(' + m + '-1)^2=' + m + '^2-2\\times' + m + '\\times1+1^2=' + fr(m * m) + '-' + 2 * m + '+1'; }
        q.type = 'nombre';
        q.texte = 'Calculer <b>de tête</b> $' + tx3 + '$ à l\'aide d\'une identité remarquable.';
        q.attendu = v;
        q.explication = '$' + tx3 + '=' + det + '=' + fr(v) + '$.';
        return q;
    };

    /* ===== A3 · Puissances (automatisme final) ===== */
    Auto.puissancesFinal = function (niveau) {
        if (niveau === 2) return Auto.puissances(2);
        var q = { niveau: niveau, objectif: 'A3 · Puissances' };
        function pw(x, n) { return n === 1 ? String(x) : x + '^{' + n + '}'; }
        if (niveau === 1) {
            var a = A.entier(2, 9), m, n, produit = Math.random() < 0.5, r;
            do { m = A.nonNul(-8, 8); n = A.nonNul(-8, 8); r = produit ? m + n : m - n; } while (m === n || r === 0 || (m > 0 && n > 0) || Math.abs(r) > 12);
            q.type = 'nombre'; q.prefixe = 'n =';
            q.texte = 'Écrire sous la forme $' + a + '^n$ : $' + (produit ? a + '^{' + m + '}\\times' + a + '^{' + n + '}' : frac(a + '^{' + m + '}', a + '^{' + n + '}')) + '$. Donner $n$.';
            q.attendu = r;
            q.explication = (produit ? '$a^m\\times a^n=a^{m+n}$ : $' + m + '+' + Interactif.par(n) : '$' + frac('a^m', 'a^n') + '=a^{m-n}$ : $' + m + '-' + Interactif.par(n)) + '=' + r + '$, donc le résultat est $' + a + '^{' + r + '}$.';
            return q;
        }
        // c1 = p²r, c2 = pr² : c1^u / c2^v = p^(2u-v) × r^(u-2v)
        var cas = A.choix([[12, 18, 2, 3], [20, 50, 2, 5], [45, 75, 3, 5]]), u, v;
        do { u = A.entier(2, 3); v = A.entier(1, 2); } while (u - 2 * v === 0);
        var ea = 2 * u - v, eb = u - 2 * v;
        q.type = 'champs';
        q.texte = 'Écrire sous la forme $' + cas[2] + '^a\\times' + cas[3] + '^b$ : $C=' + frac(pw(cas[0], u), pw(cas[1], v)) + '$.';
        q.gabarit = '$a=$ [] et $b=$ []';
        q.attendus = [ea, eb];
        q.explication = '$' + cas[0] + '=' + cas[2] + '^2\\times' + cas[3] + '$ et $' + cas[1] + '=' + cas[2] + '\\times' + cas[3] + '^2$.<br>' +
            '$C=' + frac(cas[2] + '^{' + 2 * u + '}\\times' + cas[3] + '^{' + u + '}', pw(cas[2], v) + '\\times' + cas[3] + '^{' + 2 * v + '}') + '=' + cas[2] + '^{' + ea + '}\\times' + cas[3] + '^{' + eb + '}$ : $a=' + ea + '$ et $b=' + eb + '$.';
        return q;
    };

    /* ===== A11 · Isoler une variable ===== */
    var CTX_PROPORTION = ' ($p$ : proportion, $n$ : effectif de la partie, $N$ : effectif total)';
    var FORMULES = [
        { f: 'v=\\dfrac{d}{t}', l: 'd', ok: 'v\\times t', faux: ['\\dfrac{v}{t}', '\\dfrac{t}{v}', 'v+t'], ex: 'On multiplie les deux membres par $t$ : $v\\times t=d$.' },
        { f: 'v=\\dfrac{d}{t}', l: 't', ok: '\\dfrac{d}{v}', faux: ['d\\times v', '\\dfrac{v}{d}', 'd-v'], ex: 'On multiplie par $t$ : $v\\times t=d$, puis on divise par $v$ : $t=\\dfrac{d}{v}$.' },
        { f: 'p=\\dfrac{n}{N}', l: 'N', ok: '\\dfrac{n}{p}', faux: ['n\\times p', '\\dfrac{p}{n}', 'n-p'], ctx: CTX_PROPORTION,
          ex: 'Proportion $=\\dfrac{\\text{partie}}{\\text{total}}$, donc total $=\\dfrac{\\text{partie}}{\\text{proportion}}$ : $N=\\dfrac{n}{p}$.' },
        { f: 'p=\\dfrac{n}{N}', l: 'n', ok: 'p\\times N', faux: ['\\dfrac{p}{N}', '\\dfrac{N}{p}', 'N-p'], ctx: CTX_PROPORTION,
          ex: 'Partie $=$ proportion $\\times$ total : $n=p\\times N$.' },
        { f: 'V=\\dfrac{B\\times h}{3}', l: 'B', ok: '\\dfrac{3V}{h}', faux: ['\\dfrac{V}{3h}', '3Vh', '\\dfrac{V\\times h}{3}'], ctx: ' (volume d\'un cône)',
          ex: 'On multiplie par $3$ : $3V=B\\times h$, puis on divise par $h$ : $B=\\dfrac{3V}{h}$.' },
        { f: 'U=R\\times I', l: 'I', ok: '\\dfrac{U}{R}', faux: ['U\\times R', '\\dfrac{R}{U}', 'U-R'], ctx: ' (loi d\'Ohm)',
          ex: 'On divise les deux membres par $R$ : $I=\\dfrac{U}{R}$.' }
    ];
    Auto.isolerVariable = function (niveau) {
        var q = { niveau: niveau, objectif: 'A11 · Isoler une variable' };
        if (niveau === 1) {
            var F = A.choix(FORMULES);
            q.texte = 'On sait que $' + F.f + '$' + (F.ctx || '') + '. Alors :';
            q.explication = F.ex;
            return qcm(q, [{ t: '$' + F.l + '=' + F.ok + '$', ok: true }].concat(F.faux.map(function (f) { return { t: '$' + F.l + '=' + f + '$', ok: false }; })));
        }
        q.type = 'expr';
        if (niveau === 2) {             // a z - b y = c  ->  y = (a z - c) / b
            var a, b, c;
            do { a = A.entier(2, 9); b = A.entier(2, 9); c = A.nonNul(-9, 9); } while (a === b || pgcd(pgcd(a, b), Math.abs(c)) !== 1);
            var num = a + 'z' + (c > 0 ? '-' + c : '+' + -c);
            q.variables = 'yz'; q.prefixe = 'y =';
            q.texte = 'On donne la relation $' + a + 'z-' + b + 'y=' + c + '$. Exprimer $y$ en fonction de $z$.';
            q.attendu = '(' + num + ')/' + b;
            q.explication = 'On isole le terme en $y$ : $-' + b + 'y=' + c + '-' + a + 'z$, donc $' + b + 'y=' + num + '$.<br>On divise par $' + b + '$ : $y=' + frac(num, b) + '$.';
            return q;
        }
        if (Math.random() < 0.5) {      // w = (u - v) t  ->  u = w/t + v
            q.variables = 'tuvw'; q.prefixe = 'u =';
            q.texte = 'Les nombres $w$, $u$, $v$ et $t$ (avec $t\\neq0$) vérifient $w=(u-v)t$. Exprimer $u$ en fonction de $w$, $v$ et $t$.';
            q.attendu = 'w/t+v';
            q.explication = 'On divise par $t$ : $' + frac('w', 't') + '=u-v$, puis on ajoute $v$ : $u=' + frac('w', 't') + '+v$ (ou $u=' + frac('w+vt', 't') + '$).';
            return q;
        }
        var k = A.entier(2, 4), kb = (k - 1 === 1 ? '' : k - 1) + 'b';   // m = (a + (k-1) b) / k  ->  a = k m - (k-1) b
        q.variables = 'abm'; q.prefixe = 'a =';
        q.texte = 'Les nombres $a$, $b$ et $m$ vérifient $m=' + frac('a+' + kb, k) + '$. Exprimer $a$ en fonction de $m$ et $b$.';
        q.attendu = k + 'm-' + kb;
        q.explication = 'On multiplie par $' + k + '$ : $' + k + 'm=a+' + kb + '$, puis on soustrait $' + kb + '$ : $a=' + k + 'm-' + kb + '$.';
        return q;
    };

    /* ===== Vecteurs · Relation de Chasles (réponse à écrire) ===== */
    Auto.chaslesSimple = function (niveau) {
        var q = { niveau: niveau, objectif: 'Vecteurs · Relation de Chasles', type: 'ordre' };
        var L = melanger(LETTRES_RESEAU.split('')).slice(0, 4), X = L[0], Y = L[1], Z = L[2], W = L[3], expr, rep, ex;
        if (niveau === 1) {
            var t = melanger([vec(X + Y), vec(Y + Z), vec(Z + W)]);
            if (t[0] === vec(X + Y) && t[1] === vec(Y + Z)) t = [t[1], t[0], t[2]];
            expr = t.join('+'); rep = X + W;
            ex = 'On remet les vecteurs bout à bout : $' + vec(X + Y) + '+' + vec(Y + Z) + '+' + vec(Z + W) + '=' + vec(X + W) + '$.';
        } else if (niveau === 2) {
            expr = vec(X + Y) + '-' + vec(Z + Y) + '+' + vec(Z + W); rep = X + W;
            ex = '$-' + vec(Z + Y) + '=' + vec(Y + Z) + '$, donc $' + vec(X + Y) + '+' + vec(Y + Z) + '+' + vec(Z + W) + '=' + vec(X + W) + '$.';
        } else {
            expr = vec(X + Y) + '+' + vec(Z + X) + '-' + vec(Z + W); rep = W + Y;
            ex = '$' + vec(Z + X) + '+' + vec(X + Y) + '=' + vec(Z + Y) + '$, puis $' + vec(Z + Y) + '-' + vec(Z + W) + '=' + vec(W + Z) + '+' + vec(Z + Y) + '=' + vec(W + Y) + '$.';
        }
        q.texte = 'Simplifier $' + expr + '$ en un seul vecteur. Écris ses deux lettres dans l\'ordre (par exemple <b>AB</b> pour $\\overrightarrow{AB}$).';
        q.aideLettres = 'Écris les deux lettres du vecteur, dans l\'ordre (par exemple AB).';
        q.attendu = rep;
        q.explication = ex;
        return q;
    };

    /* ===== A20 · Repère (automatisme final) ===== */
    Auto.repereFinal = function (niveau) {
        if (niveau === 1) { var q1 = Auto.lireCoordonneesSimple(1); delete q1.rappel; return q1; }
        if (niveau === 2) { var q2 = Auto.lireCoordonnees(3); q2.niveau = 2; return q2; }
        var q = { niveau: 3, objectif: 'A20 · Repère orthogonal', type: 'champs' }, x1, x2, y1, y2;
        do { x1 = A.entier(-4, 3); x2 = A.entier(-3, 4); y1 = A.entier(-3, 3); y2 = A.entier(-3, 3); } while (Math.abs(x1 - x2) < 2 || Math.abs(y1 - y2) < 2 || !x1 || !x2 || !y1 || !y2);
        q.figure = repere({ xmin: -5, xmax: 5, ymin: -4, ymax: 4, points: [{ nom: 'A', x: x1, y: y1 }, { nom: 'B', x: x2, y: y1 }, { nom: 'C', x: x2, y: y2 }] });
        q.figureNote = 'A(' + x1 + ' ; ' + y1 + ') B(' + x2 + ' ; ' + y1 + ') C(' + x2 + ' ; ' + y2 + ')';
        q.texte = 'Donner les coordonnées du point $D$ tel que $ABCD$ soit un rectangle.';
        q.gabarit = '$D\\Big($ [] $;$ [] $\\Big)$';
        q.attendus = [x1, y2];
        q.explication = '$[AB]$ est horizontal et $[BC]$ vertical. $D$ a la même abscisse que $A$ ($' + x1 + '$) et la même ordonnée que $C$ ($' + y2 + '$) : $D' + coord(x1, y2) + '$.';
        return q;
    };

    /* ===== A10 · Équation produit nul ===== */
    Auto.produitNul = function (niveau) {
        var q = { niveau: niveau, objectif: 'A10 · Équation produit nul' }, poly = Interactif.poly;
        if (niveau === 1) {
            var a, b;
            do { a = A.nonNul(-9, 9); b = A.nonNul(-9, 9); } while (Math.abs(a) === Math.abs(b));
            var s = [a, b].sort(function (u, v) { return u - v; });
            var paire = function (u, v) { var t = [u, v].sort(function (x, y) { return x - y; }); return '$' + t[0] + '$ et $' + t[1] + '$'; };
            var bon = paire(a, b), vus = {}, opts = [{ t: bon, ok: true }];
            vus[bon] = 1;
            [paire(-a, -b), paire(Math.abs(a), Math.abs(b)), paire(-s[0], s[1]), paire(s[0], -s[1]), '$' + a * b + '$'].forEach(function (t) {
                if (!vus[t] && opts.length < 4) { vus[t] = 1; opts.push({ t: t, ok: false }); }
            });
            q.texte = 'Les solutions de l\'équation $(' + poly([1, -a]) + ')(' + poly([1, -b]) + ')=0$ sont :';
            q.explication = 'Un produit est nul si et seulement si l\'un de ses facteurs est nul : $' + poly([1, -a]) + '=0$ ou $' + poly([1, -b]) + '=0$, donc $x=' + a + '$ ou $x=' + b + '$.';
            return qcm(q, opts);
        }
        q.type = 'champs';
        q.gabarit = '$x=$ [] et $x=$ []';
        if (niveau === 2) {
            var k, p, c;
            do { k = A.entier(2, 5); p = A.nonNul(-7, 7); c = A.nonNul(-7, 7); } while (pgcd(k, Math.abs(p)) !== 1);
            var r1 = -p / k, sol = [r1, c].sort(function (u, v) { return u - v; });
            q.texte = 'Résoudre l\'équation $(' + poly([k, p]) + ')(' + poly([1, -c]) + ')=0$ (solutions du plus petit au plus grand ; une fraction s\'écrit par exemple <code>-2/3</code>).';
            q.attendus = sol;
            q.explication = '$' + poly([k, p]) + '=0$ donne $x=' + fracTex(-p, k) + '$ ; $' + poly([1, -c]) + '=0$ donne $x=' + c + '$.<br>Solutions : $' +
                (sol[0] === r1 ? fracTex(-p, k) + '$ et $' + c : c + '$ et $' + fracTex(-p, k)) + '$.';
            return q;
        }
        var m = A.nonNul(-9, 9);
        if (Math.abs(m) === 1) m *= 3;
        q.texte = 'Résoudre l\'équation $x^2=' + m + 'x$ (solutions du plus petit au plus grand).';
        q.attendus = [Math.min(0, m), Math.max(0, m)];
        q.explication = 'On ramène tout dans un membre et on factorise : $' + poly([1, -m, 0]) + '=0$, soit $x(' + poly([1, -m]) + ')=0$.<br>' +
            'Produit nul : $x=0$ ou $x=' + m + '$. Attention : diviser par $x$ ferait perdre la solution $0$.';
        return q;
    };

    /* ===== Algo · if / else (réponse à écrire) ===== */
    Auto.scriptSiSinonSimple = function (niveau) {
        if (niveau > 1) return Auto.scriptConditionnel(niveau);
        var q = { niveau: 1, objectif: 'Algo · Structures conditionnelles', type: 'champs' }, a, b, sup;
        do { a = A.entier(3, 20); b = A.entier(3, 20); sup = Math.random() < 0.6; } while (a === b);
        var vrai = sup ? a > b : a < b, res = vrai ? [a - b, b] : [a, b - a];
        q.texte = 'Qu\'affiche ce script ?' + code(['a = ' + a, 'b = ' + b, 'if a ' + (sup ? '>' : '<') + ' b:', '    a = a - b', 'else:', '    b = b - a', 'print(a, b)']);
        q.gabarit = 'La console affiche : [] []';
        q.attendus = res;
        q.explication = '$' + a + (sup ? '>' : '<') + b + '$ est ' + (vrai ? '<b>vrai</b> : seul <code>a</code> change, il vaut $' + a + '-' + b + '=' + (a - b) + '$'
            : '<b>faux</b> : on exécute seulement le bloc <code>else</code>, <code>b</code> vaut $' + b + '-' + a + '=' + (b - a) + '$') + '.<br>Le script affiche ' + console2(res[0], res[1]) + '.';
        return q;
    };

    /* ===== A16 · Images et antécédents (automatisme final) ===== */
    Auto.imageFinal = function (niveau) {
        if (niveau === 1) { var q1 = Auto.imageSimple(1); delete q1.rappel; return q1; }
        var poly = Interactif.poly, par = Interactif.par, q = { niveau: niveau, objectif: 'A16 · Images et antécédents', type: 'nombre' };
        if (niveau === 2) {             // h(x) = (a x + b) / (x + c) en x0, avec x0 + c = ±1 ou ±2
            var a, b, x0, d, c;
            do { a = A.entier(2, 5) * A.signe(); b = A.nonNul(-9, 9); x0 = -A.entier(1, 5); d = A.choix([1, 2, -1, -2]); c = d - x0; } while (c === 0 || a * x0 + b === 0);
            q.texte = 'Soit $h$ la fonction définie par $h(x)=' + frac(poly([a, b]), poly([1, c])) + '$. Calculer $h(' + x0 + ')$ (valeur exacte).';
            q.prefixe = 'h(' + x0 + ')=';
            q.attendu = (a * x0 + b) / d;
            q.explication = '$h(' + x0 + ')=' + frac(a + '\\times' + par(x0) + (b > 0 ? '+' : '') + b, x0 + (c > 0 ? '+' : '') + c) + '=' + frac(a * x0 + b, d) + '=' + fr(arrondi(q.attendu)) + '$.';
            return q;
        }
        var a3, b3, k;
        do { a3 = A.entier(2, 8) * A.signe(); b3 = A.nonNul(-9, 9); k = A.nonNul(-12, 12); } while ((k - b3) % a3 === 0);
        q.texte = 'Soit $f$ la fonction définie par $f(x)=' + poly([a3, b3]) + '$. Déterminer l\'antécédent de $' + k + '$ par $f$ (valeur exacte : une fraction s\'écrit par exemple <code>-5/2</code>).';
        q.prefixe = 'x =';
        q.attendu = (k - b3) / a3;
        q.correction = [poly([a3, b3]) + '&=' + k, a3 + 'x&=' + (k - b3), 'x&=' + fracTex(k - b3, a3)];
        return q;
    };

    /* =====================================================================
       Série 10 (semaine du 23 au 27 novembre) : moyenne et médiane, inéquations,
       Pythagore (QCM) ; arithmétique, isoler une variable, produit nul (questions simples) ;
       identités remarquables, Chasles, if / else (automatismes finaux)
       ===================================================================== */
    function serieTex(t) { return t.map(function (x) { return fr(x); }).join('\\ ;\\ '); }

    /* ===== A25 · Moyenne, médiane ===== */
    Auto.moyenneMediane = function (niveau) {
        var q = { niveau: niveau, objectif: 'A25 · Moyenne, médiane' }, t, s;
        if (niveau === 1) {
            var tri, med, moy, et, vus;
            do {
                t = []; while (t.length < 5) { var v = A.entier(3, 20); if (t.indexOf(v) < 0) t.push(v); }
                t = melanger(t); tri = t.slice().sort(function (a, b) { return a - b; });
                med = tri[2]; s = t.reduce(function (a, b) { return a + b; }, 0); moy = arrondi(s / 5); et = tri[4] - tri[0];
                vus = {}; [med, t[2], moy, et].forEach(function (x) { vus[x] = 1; });
            } while (Object.keys(vus).length < 4);
            q.texte = 'On considère la série : $' + serieTex(t) + '$. Sa médiane est :';
            q.explication = 'On range d\'abord les valeurs dans l\'ordre croissant : $' + serieTex(tri) + '$. Il y a $5$ valeurs : la médiane est la $3^{\\text{e}}$, soit $' + med + '$.<br>' +
                'Pièges : $' + t[2] + '$ (valeur du milieu sans ranger), $' + fr(moy) + '$ (c\'est la moyenne), $' + et + '$ (c\'est l\'étendue).';
            return qcm(q, [{ t: '$' + med + '$', ok: true }, { t: '$' + t[2] + '$', ok: false }, { t: '$' + fr(moy) + '$', ok: false }, { t: '$' + et + '$', ok: false }]);
        }
        q.type = 'nombre';
        if (niveau === 2) {
            var n = A.choix([5, 6]), m = A.entier(9, 14);
            do { t = []; for (var k = 0; k < n - 1; k++) t.push(m + A.entier(-5, 5)); t.push(n * m - t.reduce(function (a, b) { return a + b; }, 0)); } while (t[n - 1] < 2 || t[n - 1] > 20);
            q.texte = 'Calculer la moyenne de la série : $' + serieTex(t) + '$.';
            q.attendu = m;
            q.explication = 'Somme : $' + t.join('+') + '=' + n * m + '$. Il y a $' + n + '$ valeurs : moyenne $=' + frac(n * m, n) + '=' + m + '$.';
            return q;
        }
        var kk = A.entier(3, 5), m1, M, need;
        do { m1 = A.entier(8, 14); M = m1 + A.entier(1, 2); need = (kk + 1) * M - kk * m1; } while (need > 20);
        q.texte = 'Après $' + kk + '$ contrôles, Léa a $' + m1 + '$ de moyenne. Quelle note doit-elle avoir au contrôle suivant pour avoir $' + M + '$ de moyenne sur les $' + (kk + 1) + '$ contrôles ?';
        q.attendu = need;
        q.explication = 'Somme de ses $' + kk + '$ notes : $' + kk + '\\times' + m1 + '=' + kk * m1 + '$. Pour $' + M + '$ de moyenne sur $' + (kk + 1) + '$ notes, il faut une somme de $' + (kk + 1) + '\\times' + M + '=' + (kk + 1) * M + '$.<br>' +
            'Note nécessaire : $' + (kk + 1) * M + '-' + kk * m1 + '=' + need + '$.';
        return q;
    };

    /* ===== Arithmétique (sans choix proposés) ===== */
    Auto.arithmetiqueSimple = function (niveau) {
        if (niveau > 1) { return Auto.arithmetique(niveau); }
        var f = A.choix(FAUX_PREMIERS), q = { niveau: 1, objectif: 'Arithmétique · Nombres premiers', type: 'nombre' };
        q.texte = 'Le nombre $' + f[0] + '$ n\'est pas premier. Donner son plus petit diviseur autre que $1$.';
        q.attendu = f[1];
        q.explication = 'On teste $2$, $3$, $5$, $7$… dans l\'ordre : $' + f[0] + '=' + f[1] + '\\times' + f[2] + '$. Le plus petit diviseur autre que $1$ est $' + f[1] + '$.' +
            (f[1] === 3 ? '<br>Critère : la somme des chiffres est un multiple de $3$.' : '');
        return q;
    };

    /* ===== A9 · Identités remarquables (automatisme final) ===== */
    Auto.identitesFinal = function (niveau) {
        if (niveau === 1) { var q1 = Auto.identitesSimple(1); delete q1.rappel; return q1; }
        if (niveau === 3) return Auto.identitesSimple(3);
        var poly = Interactif.poly, a = A.entier(2, 9), s = A.signe();
        var q = factoQ(2, poly([1, 2 * s * a, a * a]), '(' + poly([1, s * a]) + ')^2', poly([1, s * a]));
        q.objectif = 'A9 · Identités remarquables';
        q.explication = '$x^2=x^2$, $' + a * a + '=' + a + '^2$ et $' + 2 * a + 'x=2\\times x\\times' + a + '$ : on reconnaît $a^2' + (s > 0 ? '+' : '-') + '2ab+b^2=(a' + (s > 0 ? '+' : '-') + 'b)^2$.<br>' +
            '$A=(' + poly([1, s * a]) + ')^2$.';
        return q;
    };

    /* ===== A10 · Inéquations ===== */
    function signeIneg(s) { return { '<': '<', '>': '>', '<=': '\\leqslant', '>=': '\\geqslant' }[s]; }
    function inverse(s) { return { '<': '>', '>': '<', '<=': '>=', '>=': '<=' }[s]; }
    Auto.inequation = function (niveau) {
        var q = { niveau: niveau, objectif: 'A10 · Inéquations' }, poly = Interactif.poly, a, b, c, s, x0;
        if (niveau < 3) {
            s = A.choix(['<', '>', '<=', '>=']);
            do { a = A.entier(2, 6) * (niveau === 1 ? 1 : -1); x0 = A.nonNul(-6, 6); b = A.nonNul(-9, 9); c = a * x0 + b; } while (c === 0);
            var sol = niveau === 1 ? s : inverse(s), tex = function (sg, v) { return '$x' + signeIneg(sg) + v + '$'; };
            q.texte = 'Les solutions de l\'inéquation $' + poly([a, b]) + signeIneg(s) + c + '$ sont les nombres $x$ tels que :';
            q.explication = '$' + poly([a, 0]) + signeIneg(s) + c + (b > 0 ? '-' + b : '+' + -b) + '$, soit $' + poly([a, 0]) + signeIneg(s) + (c - b) + '$.<br>' +
                (niveau === 1 ? 'On divise par $' + a + '$, qui est <b>positif</b> : le sens ne change pas, $x' + signeIneg(s) + x0 + '$.'
                    : 'On divise par $' + a + '$, qui est <b>négatif</b> : le sens de l\'inégalité <b>change</b>, $x' + signeIneg(sol) + x0 + '$.');
            var faux = [tex(inverse(sol), x0), tex(sol, -x0), tex(sol, fracTex(c, a))];
            var vus = {}; vus[tex(sol, x0)] = 1;
            faux = faux.filter(function (f) { if (vus[f]) return false; vus[f] = 1; return true; });
            if (faux.length < 3) faux.push(tex(sol, x0 + (x0 > 0 ? 1 : -1) * Math.abs(b)));
            return qcm(q, [{ t: tex(sol, x0), ok: true }].concat(faux.slice(0, 3).map(function (f) { return { t: f, ok: false }; })));
        }
        var d, num, den;
        do { a = A.entier(3, 8); c = A.entier(1, a - 1); b = A.nonNul(-9, 9); d = A.nonNul(-15, 15); num = d - b; den = a - c; } while (num % den === 0);
        var borne = num / den, rep = Math.floor(borne) + 1;
        q.type = 'nombre';
        q.texte = 'Quel est le plus petit nombre <b>entier</b> solution de l\'inéquation $' + poly([a, b]) + '>' + poly([c, d]) + '$ ?';
        q.attendu = rep;
        q.explication = '$' + poly([a - c, 0]) + '>' + num + '$, donc $x>' + fracTex(num, den) + '$ (division par $' + den + '>0$, le sens ne change pas).<br>' +
            '$' + fracTex(num, den) + '\\approx' + fr(Math.round(borne * 100) / 100) + '$ : le plus petit entier strictement supérieur est $' + rep + '$.';
        return q;
    };

    /* ===== A11 · Isoler une variable (réponse à écrire) ===== */
    var FORMULES_SIMPLES = [
        { f: 'v=\\dfrac{d}{t}', l: 'd', att: 'v*t', vars: 'dtv', ex: 'On multiplie les deux membres par $t$ : $d=v\\times t$.' },
        { f: 'v=\\dfrac{d}{t}', l: 't', att: 'd/v', vars: 'dtv', ex: 'On multiplie par $t$ : $v\\times t=d$, puis on divise par $v$ : $t=\\dfrac{d}{v}$.' },
        { f: 'a=\\dfrac{b\\times h}{2}', l: 'h', att: '2a/b', vars: 'abh', ex: 'On multiplie par $2$ : $2a=b\\times h$, puis on divise par $b$ : $h=\\dfrac{2a}{b}$.', ctx: ' (aire $a$ d\'un triangle de base $b$ et de hauteur $h$)' },
        { f: 'y=3x-2', l: 'x', att: '(y+2)/3', vars: 'xy', ex: 'On ajoute $2$ : $y+2=3x$, puis on divise par $3$ : $x=\\dfrac{y+2}{3}$.' },
        { f: 'y=5x+4', l: 'x', att: '(y-4)/5', vars: 'xy', ex: 'On soustrait $4$ : $y-4=5x$, puis on divise par $5$ : $x=\\dfrac{y-4}{5}$.' }
    ];
    Auto.isolerSimple = function (niveau) {
        if (niveau > 1) return Auto.isolerVariable(niveau);
        var F = A.choix(FORMULES_SIMPLES), q = { niveau: 1, objectif: 'A11 · Isoler une variable', type: 'expr' };
        q.variables = F.vars; q.prefixe = F.l + ' =';
        q.texte = 'On sait que $' + F.f + '$' + (F.ctx || '') + '. Exprimer $' + F.l + '$ en fonction des autres lettres.';
        q.attendu = F.att;
        q.explication = F.ex;
        return q;
    };

    /* ===== Vecteurs (automatisme final) ===== */
    Auto.chaslesFinal = function (niveau) {
        var q;
        if (niveau === 1) { q = Auto.chaslesSimple(1); delete q.rappel; return q; }
        if (niveau === 2) { q = Auto.chaslesSimple(3); q.niveau = 2; return q; }
        q = Auto.normeSimplifier(2); q.niveau = 3; q.objectif = 'Vecteurs · Chasles et norme';
        return q;
    };

    /* ===== A22 · Pythagore (longueurs entières, puis valeur exacte) ===== */
    var TRIPLETS_PYTHAGORE = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25], [15, 20, 25]];
    Auto.pythagoreQCM = function (niveau) {
        var q = { niveau: niveau, objectif: 'A22 · Pythagore' }, N = nomsTriangle(), c1 = N[0] + N[1], c2 = N[0] + N[2], hyp = N[1] + N[2], t = A.choix(TRIPLETS_PYTHAGORE);
        if (niveau === 1) {
            q.figure = triangleRectangle(N, t[0], t[1], [t[0] + ' cm', t[1] + ' cm', '?']); q.figureNote = c1 + '=' + t[0] + ' ' + c2 + '=' + t[1];
            q.texte = 'Le triangle $' + N.join('') + '$ est rectangle en $' + N[0] + '$, avec $' + c1 + '=' + t[0] + '$ cm et $' + c2 + '=' + t[1] + '$ cm. La longueur $' + hyp + '$ est égale à :';
            q.explication = 'Pythagore ($[' + hyp + ']$ est l\'hypoténuse) : $' + hyp + '^2=' + t[0] + '^2+' + t[1] + '^2=' + t[0] * t[0] + '+' + t[1] * t[1] + '=' + t[2] * t[2] + '$, donc $' + hyp + '=\\sqrt{' + t[2] * t[2] + '}=' + t[2] + '$ cm.<br>' +
                'Pièges : $' + (t[0] + t[1]) + '$ cm (on a additionné les longueurs), $' + t[2] * t[2] + '$ cm (on a oublié la racine).';
            return qcm(q, [{ t: '$' + t[2] + '$ cm', ok: true }, { t: '$' + (t[0] + t[1]) + '$ cm', ok: false }, { t: '$' + t[2] * t[2] + '$ cm', ok: false }, { t: '$\\sqrt{' + (t[0] + t[1]) + '}$ cm', ok: false }]);
        }
        q.type = 'nombre';
        if (niveau === 2) {
            q.figure = triangleRectangle(N, t[0], t[1], [t[0] + ' cm', '?', t[2] + ' cm']); q.figureNote = hyp + '=' + t[2] + ' ' + c1 + '=' + t[0];
            q.texte = 'Le triangle $' + N.join('') + '$ est rectangle en $' + N[0] + '$, avec $' + hyp + '=' + t[2] + '$ cm et $' + c1 + '=' + t[0] + '$ cm. Calculer $' + c2 + '$ (en cm).';
            q.attendu = t[1];
            q.explication = 'Pythagore : $' + hyp + '^2=' + c1 + '^2+' + c2 + '^2$, donc $' + c2 + '^2=' + t[2] + '^2-' + t[0] + '^2=' + t[2] * t[2] + '-' + t[0] * t[0] + '=' + t[1] * t[1] + '$ et $' + c2 + '=' + t[1] + '$ cm.';
            return q;
        }
        var a, b, h2;
        do { a = A.entier(1, 7); b = A.entier(2, 8); h2 = a * a + b * b; } while (a === b || racine(h2)[0] === 1 || racine(h2)[1] === 1);
        q.type = 'champs';
        q.figure = triangleRectangle(N, a, b, [a + ' cm', b + ' cm', '?']); q.figureNote = c1 + '=' + a + ' ' + c2 + '=' + b;
        q.texte = 'Le triangle $' + N.join('') + '$ est rectangle en $' + N[0] + '$, avec $' + c1 + '=' + a + '$ cm et $' + c2 + '=' + b + '$ cm. Donner la valeur exacte de $' + hyp + '$ sous la forme $a\\sqrt{b}$ ($b$ le plus petit possible).';
        q.gabarit = '$a=$ [] et $b=$ []';
        q.attendus = racine(h2);
        q.explication = '$' + hyp + '^2=' + a * a + '+' + b * b + '=' + h2 + '$, donc $' + hyp + '=\\sqrt{' + h2 + '}=\\sqrt{' + racine(h2)[0] * racine(h2)[0] + '\\times' + racine(h2)[1] + '}=' + racineTex(h2) + '$ cm.';
        return q;
    };

    /* ===== A10 · Produit nul (réponse à écrire) ===== */
    Auto.produitNulSimple = function (niveau) {
        var poly = Interactif.poly, q = { niveau: niveau, objectif: 'A10 · Équation produit nul', type: 'champs', gabarit: '$x=$ [] et $x=$ []' }, a, b;
        if (niveau === 1) {
            do { a = A.nonNul(-9, 9); b = A.nonNul(-9, 9); } while (Math.abs(a) === Math.abs(b));
            q.texte = 'Résoudre l\'équation $(' + poly([1, -a]) + ')(' + poly([1, -b]) + ')=0$ (solutions du plus petit au plus grand).';
            q.attendus = [Math.min(a, b), Math.max(a, b)];
            q.explication = 'Un produit est nul si l\'un de ses facteurs est nul : $' + poly([1, -a]) + '=0$ ou $' + poly([1, -b]) + '=0$, donc $x=' + a + '$ ou $x=' + b + '$.';
            return q;
        }
        if (niveau === 2) return Auto.produitNul(2);
        var p, r;                       // x(x - p) = r x  ->  x(x - p - r) = 0
        do { p = A.nonNul(-6, 6); r = A.nonNul(-6, 6); } while (p + r === 0);
        var s = p + r;
        q.texte = 'Résoudre l\'équation $x(' + poly([1, -p]) + ')=' + (r === 1 ? '' : r === -1 ? '-' : r) + 'x$ (solutions du plus petit au plus grand).';
        q.attendus = [Math.min(0, s), Math.max(0, s)];
        q.explication = 'On ne divise surtout pas par $x$ (on perdrait la solution $0$). On ramène tout dans un membre et on factorise par $x$ :<br>' +
            '$x(' + poly([1, -p]) + ')-' + (r < 0 ? '(' + poly([r, 0]) + ')' : poly([r, 0])) + '=0$, soit $x(' + poly([1, -p]) + (r > 0 ? '-' + r : '+' + -r) + ')=0$, c\'est-à-dire $x(' + poly([1, -s]) + ')=0$.<br>' +
            'Donc $x=0$ ou $x=' + s + '$.';
        return q;
    };

    /* ===== Algo · if / else (automatisme final) ===== */
    Auto.scriptFinal = function (niveau) {
        var q;
        if (niveau === 1) { q = Auto.scriptSiSinonSimple(1); delete q.rappel; return q; }
        if (niveau === 2) return Auto.scriptConditionnel(2);
        return Auto.scriptSiSinon(3);
    };

    /* =====================================================================
       Série 11 (semaine du 30 novembre au 4 décembre ; J4 = bilan à la maison, DS 3) :
       probabilités, milieu, proportion de proportion (QCM) ; médiane, inéquations,
       Pythagore (questions simples) ; arithmétique, isoler, produit nul (automatismes finaux)
       ===================================================================== */
    /* ===== A30 · Probabilités : tirage dans une urne ===== */
    var COULEURS = [['rouge', 'rouges'], ['verte', 'vertes'], ['bleue', 'bleues'], ['jaune', 'jaunes'], ['noire', 'noires']];
    Auto.probaUrne = function (niveau) {
        var q = { niveau: niveau, objectif: 'A30 · Probabilités' }, c = melanger(COULEURS).slice(0, 3), n, N, i;
        do { n = [A.entier(1, 9), A.entier(1, 9), A.entier(1, 9)]; N = n[0] + n[1] + n[2]; } while (N < 8 || n[0] === n[1] || n[1] === n[2] || n[0] === n[2]);
        var urne = 'Une urne contient ' + n.map(function (k, j) { return '$' + k + '$ boule' + (k > 1 ? 's ' + c[j][1] : ' ' + c[j][0]); }).join(', ').replace(/, ([^,]*)$/, ' et $1') +
            ', indiscernables au toucher. On tire une boule au hasard.';
        i = A.entier(0, 2);
        if (niveau === 1) {
            q.texte = urne + ' La probabilité de tirer une boule ' + c[i][0] + ' est :';
            q.explication = 'Il y a $' + N + '$ boules, toutes ont la même chance d\'être tirées (équiprobabilité) : $P=' + frac('\\text{nombre de boules ' + c[i][1] + '}', '\\text{nombre total de boules}') + '=' + frac(n[i], N) +
                (pgcd(n[i], N) > 1 ? '=' + fracTex(n[i], N) : '') + '$.';
            var vus = {}, opts = [];
            [['$' + fracTex(n[i], N) + '$', true], ['$' + n[i] + '$'], ['$' + fracTex(n[i], N - n[i]) + '$'], ['$' + fracTex(1, n[i]) + '$'], ['$' + fracTex(N - n[i], N) + '$']].forEach(function (o) {
                if (!vus[o[0]] && opts.length < 4) { vus[o[0]] = 1; opts.push({ t: o[0], ok: !!o[1] }); }
            });
            return qcm(q, opts);
        }
        q.type = 'nombre';
        if (niveau === 2) {
            q.texte = urne + ' Quelle est la probabilité de <b>ne pas</b> tirer une boule ' + c[i][0] + ' ? (fraction, par exemple <code>3/8</code>)';
            q.attendu = (N - n[i]) / N;
            q.explication = '$P(\\text{' + c[i][0] + '})=' + frac(n[i], N) + '$. Évènement contraire : $1-' + frac(n[i], N) + '=' + frac(N - n[i], N) + (pgcd(N - n[i], N) > 1 ? '=' + fracTex(N - n[i], N) : '') + '$.';
            return q;
        }
        var k = N - 2 * n[i];
        if (k <= 0) return Auto.probaUrne(3);
        q.texte = urne + ' Combien de boules ' + c[i][1] + ' faut-il ajouter pour que la probabilité de tirer une boule ' + c[i][0] + ' soit égale à $' + frac(1, 2) + '$ ?';
        q.attendu = k;
        q.explication = 'Il faut autant de boules ' + c[i][1] + ' que d\'autres boules. Il y a $' + (N - n[i]) + '$ boules d\'une autre couleur et $' + n[i] + '$ boules ' + c[i][1] + ' : on en ajoute $' + (N - n[i]) + '-' + n[i] + '=' + k + '$.<br>' +
            'Vérification : $' + frac(n[i] + k, N + k) + '=' + frac(1, 2) + '$.';
        return q;
    };

    /* ===== A25 · Médiane, moyenne (sans choix proposés) ===== */
    Auto.medianeSimple = function (niveau) {
        if (niveau === 2) return Auto.moyenneMediane(2);
        var q = { niveau: niveau, objectif: 'A25 · Moyenne, médiane', type: 'nombre' }, t = [], nb = niveau === 1 ? 5 : 6;
        while (t.length < nb) { var v = A.entier(2, 20); if (t.indexOf(v) < 0) t.push(v); }
        var tri = t.slice().sort(function (a, b) { return a - b; });
        if (niveau === 1 && t[2] === tri[2]) { t = [t[2], t[0], t[1], t[3], t[4]]; }
        q.texte = 'Donner la médiane de la série : $' + serieTex(t) + '$.';
        if (niveau === 1) {
            q.attendu = tri[2];
            q.explication = 'Rangée : $' + serieTex(tri) + '$. Avec $5$ valeurs, la médiane est la $3^{\\text{e}}$ : $' + tri[2] + '$.';
        } else {
            q.attendu = (tri[2] + tri[3]) / 2;
            q.explication = 'Rangée : $' + serieTex(tri) + '$. Avec $6$ valeurs (nombre pair), la médiane est la moyenne des $3^{\\text{e}}$ et $4^{\\text{e}}$ valeurs : $' + frac(tri[2] + '+' + tri[3], 2) + '=' + fr(q.attendu) + '$.';
        }
        return q;
    };

    /* ===== Arithmétique (automatisme final) ===== */
    Auto.arithmetiqueFinal = function (niveau) {
        var q = niveau === 1 ? Auto.arithmetiqueSimple(1) : Auto.arithmetique(niveau);
        if (niveau === 1) delete q.rappel;
        return q;
    };

    /* ===== Repère · Milieu d'un segment ===== */
    Auto.milieu = function (niveau) {
        var q = { niveau: niveau, objectif: 'Repère · Milieu d\'un segment' }, xa, ya, xb, yb;
        function m(u, v) { return arrondi((u + v) / 2); }
        if (niveau === 1) {
            do { xa = A.entier(-6, 8); ya = A.entier(-6, 8); xb = xa + 2 * A.nonNul(-4, 4); yb = ya + 2 * A.nonNul(-4, 4); } while (xa === ya || Math.abs(xb) > 9 || Math.abs(yb) > 9);
            var M = [m(xa, xb), m(ya, yb)];
            q.texte = 'Dans un repère, $A' + coord(xa, ya) + '$ et $B' + coord(xb, yb) + '$. Le milieu $M$ de $[AB]$ a pour coordonnées :';
            q.explication = '$x_M=' + frac('x_A+x_B', 2) + '=' + frac(xa + (xb < 0 ? '' : '+') + xb, 2) + '=' + M[0] + '$ et $y_M=' + frac('y_A+y_B', 2) + '=' + frac(ya + (yb < 0 ? '' : '+') + yb, 2) + '=' + M[1] + '$.<br>' +
                'On fait la <b>moyenne</b> des coordonnées : $M' + coord(M[0], M[1]) + '$.';
            var vus = {}, opts = [];
            [[M, true], [[xa + xb, ya + yb]], [[(xb - xa) / 2, (yb - ya) / 2]], [[M[1], M[0]]], [[(xa - xb) / 2, (ya - yb) / 2]], [[M[0] + 1, M[1] - 1]], [[-M[0] + 2, M[1] + 2]]].forEach(function (o) {
                var t = '$' + coord(o[0][0], o[0][1]) + '$';
                if (!vus[t] && opts.length < 4) { vus[t] = 1; opts.push({ t: t, ok: !!o[1] }); }
            });
            return qcm(q, opts);
        }
        q.type = 'champs';
        if (niveau === 2) {
            do { xa = A.entier(-6, 6); ya = A.entier(-6, 6); xb = A.entier(-6, 6); yb = A.entier(-6, 6); } while ((xa + xb) % 2 === 0 || (ya + yb) % 2 === 0 || xa === xb || ya === yb);
            q.texte = 'Dans un repère, $A' + coord(xa, ya) + '$ et $B' + coord(xb, yb) + '$. Donner les coordonnées du milieu $M$ de $[AB]$ (écriture décimale).';
            q.gabarit = '$M\\Big($ [] $;$ [] $\\Big)$';
            q.attendus = [m(xa, xb), m(ya, yb)];
            q.explication = '$x_M=' + frac(xa + (xb < 0 ? '' : '+') + xb, 2) + '=' + fr(q.attendus[0]) + '$ et $y_M=' + frac(ya + (yb < 0 ? '' : '+') + yb, 2) + '=' + fr(q.attendus[1]) + '$ : $M' + coord(q.attendus[0], q.attendus[1]) + '$.';
            return q;
        }
        var xm, ym;
        do { xa = A.entier(-5, 5); ya = A.entier(-5, 5); xm = A.entier(-5, 5); ym = A.entier(-5, 5); } while (xa === xm || ya === ym);
        q.texte = 'Dans un repère, $A' + coord(xa, ya) + '$ et $M' + coord(xm, ym) + '$. Le point $M$ est le milieu de $[AB]$. Donner les coordonnées de $B$.';
        q.gabarit = '$B\\Big($ [] $;$ [] $\\Big)$';
        q.attendus = [2 * xm - xa, 2 * ym - ya];
        q.explication = '$x_M=' + frac('x_A+x_B', 2) + '$ donne $x_B=2x_M-x_A=2\\times' + Interactif.par(xm) + '-' + Interactif.par(xa) + '=' + q.attendus[0] + '$ ; de même $y_B=2\\times' + Interactif.par(ym) + '-' + Interactif.par(ya) + '=' + q.attendus[1] + '$.<br>' +
            'Astuce : de $A$ à $M$, on se déplace de $' + (xm - xa) + '$ et $' + (ym - ya) + '$ ; on refait le même déplacement à partir de $M$.';
        return q;
    };

    /* ===== A10 · Inéquations (sans choix proposés) ===== */
    Auto.inequationSimple = function (niveau) {
        if (niveau === 3) return Auto.inequation(3);
        var poly = Interactif.poly, q = { niveau: niveau, objectif: 'A10 · Inéquations' }, a, b, c, x0;
        if (niveau === 1) {
            var s = A.choix(['<', '>', '<=', '>=']);
            do { a = A.entier(2, 7); x0 = A.nonNul(-8, 8); b = A.nonNul(-9, 9); c = a * x0 + b; } while (c === 0);
            q.type = 'champs';
            q.texte = 'Résoudre l\'inéquation $' + poly([a, b]) + signeIneg(s) + c + '$ en complétant.';
            q.gabarit = '$x' + signeIneg(s) + '$ []';
            q.attendus = [x0];
            q.explication = '$' + poly([a, 0]) + signeIneg(s) + (c - b) + '$, puis division par $' + a + '>0$ (le sens ne change pas) : $x' + signeIneg(s) + x0 + '$.';
            return q;
        }
        var d, num;           // -a x + b >= c  ->  x <= (b - c)/a : plus grand entier solution
        do { a = A.entier(2, 6); b = A.nonNul(-9, 9); c = A.nonNul(-15, 15); num = b - c; } while (num % a === 0 || c === b);
        var borne = num / a, rep = Math.floor(borne);
        q.type = 'nombre';
        q.texte = 'Quel est le plus grand nombre <b>entier</b> solution de l\'inéquation $' + poly([-a, b]) + '\\geqslant' + c + '$ ?';
        q.attendu = rep;
        q.explication = '$' + poly([-a, 0]) + '\\geqslant' + (c - b) + '$. On divise par $' + -a + '<0$ : le sens <b>change</b>, $x\\leqslant' + fracTex(num, a) + '\\approx' + fr(Math.round(borne * 100) / 100) + '$.<br>Le plus grand entier solution est $' + rep + '$.';
        return q;
    };

    /* ===== A11 · Isoler une variable (automatisme final) ===== */
    Auto.isolerFinal = function (niveau) {
        if (niveau === 1) { var q1 = Auto.isolerSimple(1); delete q1.rappel; return q1; }
        return Auto.isolerVariable(niveau);
    };

    /* ===== A14 · Proportion de proportion (pourcentages) ===== */
    // [population (avec « d'un… »), population (avec « du… »), sous-groupe, pronom, propriété]
    var GROUPES_PP = [
        ['élèves d\'un lycée', 'élèves du lycée', 'sont demi-pensionnaires', 'eux', 'prennent le bus'],
        ['spectateurs d\'un concert', 'spectateurs', 'sont des enfants', 'eux', 'ont moins de $8$ ans'],
        ['adhérents d\'un club', 'adhérents du club', 'sont des filles', 'elles', 'font de la compétition'],
        ['salariés d\'une entreprise', 'salariés de l\'entreprise', 'travaillent à temps partiel', 'eux', 'sont des femmes']
    ];
    Auto.proportionPourcent = function (niveau) {
        var q = { niveau: niveau, objectif: 'A14 · Proportion de proportion' }, g = A.choix(GROUPES_PP), p1, p2;
        if (niveau === 1) {
            do { p1 = A.choix([20, 30, 40, 50, 60, 80]); p2 = A.choix([10, 20, 25, 50]); } while (p1 * p2 % 100 || p1 === p2);
            var r = p1 * p2 / 100;
            q.texte = '$' + pct(p1) + '$ des ' + g[0] + ' ' + g[2] + '. Parmi ' + g[3] + ', $' + pct(p2) + '$ ' + g[4] + '. Quelle proportion des ' + g[1] + ' cela représente-t-il ?';
            q.explication = 'Proportion de proportion : on <b>multiplie</b>, $' + fr(p1 / 100) + '\\times' + fr(p2 / 100) + '=' + fr(r / 100) + '$, soit $' + pct(r) + '$.<br>' +
                'Pièges : $' + pct(p1 + p2) + '$ (on a additionné), $' + pct(p2) + '$ (c\'est la proportion parmi le sous-groupe seulement).';
            var vus = {}, opts = [];
            [[r, true], [p1 + p2], [p2], [Math.abs(p1 - p2)], [p1]].forEach(function (o) { if (!vus[o[0]] && opts.length < 4) { vus[o[0]] = 1; opts.push({ t: '$' + pct(o[0]) + '$', ok: !!o[1] }); } });
            return qcm(q, opts);
        }
        if (niveau === 2) {
            var N, n, f = A.choix([[1, 4], [3, 4], [2, 5], [3, 5], [1, 3], [2, 3]]);
            do { N = A.entier(4, 30) * 50; p2 = A.choix([10, 20, 25, 30, 40, 50]); n = N * f[0] / f[1] * p2 / 100; } while (n % 1 || (N * f[0] / f[1]) % 1);
            q.type = 'nombre';
            q.texte = 'Un club compte $' + fr(N) + '$ adhérents. Les $' + frac(f[0], f[1]) + '$ des adhérents sont des filles et, parmi elles, $' + pct(p2) + '$ font de la compétition. Combien de filles font de la compétition ?';
            q.attendu = n;
            q.explication = 'Filles : $' + frac(f[0], f[1]) + '\\times' + fr(N) + '=' + fr(N * f[0] / f[1]) + '$. Parmi elles : $' + fr(p2 / 100) + '\\times' + fr(N * f[0] / f[1]) + '=' + fr(n) + '$.';
            return q;
        }
        var pf, af, ag;
        do { pf = A.choix([40, 60, 70, 80, 30]); af = A.choix([10, 20, 30, 40, 50]); ag = A.choix([10, 20, 30, 40]); } while (af === ag);
        var tot = arrondi(pf * af / 100 + (100 - pf) * ag / 100);
        q.type = 'champs';
        q.texte = 'Dans un club, $' + pct(pf) + '$ des adhérents sont des filles. $' + pct(af) + '$ des filles et $' + pct(ag) + '$ des garçons font de la compétition. Quel pourcentage des adhérents font de la compétition ?';
        q.gabarit = '[] $\\,\\%$';
        q.attendus = [tot];
        q.explication = 'Filles en compétition : $' + fr(af / 100) + '\\times' + fr(pf / 100) + '=' + fr(arrondi(pf * af / 10000)) + '$. Garçons ($' + pct(100 - pf) + '$) en compétition : $' + fr(ag / 100) + '\\times' + fr((100 - pf) / 100) + '=' + fr(arrondi((100 - pf) * ag / 10000)) + '$.<br>' +
            'Total : $' + fr(arrondi(tot / 100)) + '$, soit $' + pct(tot) + '$ (et non la moyenne des deux pourcentages).';
        return q;
    };

    /* ===== A22 · Pythagore (sans choix proposés) ===== */
    Auto.pythagoreSimple = function (niveau) {
        if (niveau > 1) return Auto.pythagoreQCM(niveau);
        var q = { niveau: 1, objectif: 'A22 · Pythagore', type: 'nombre' }, N = nomsTriangle(), c1 = N[0] + N[1], c2 = N[0] + N[2], hyp = N[1] + N[2], t = A.choix(TRIPLETS_PYTHAGORE);
        q.figure = triangleRectangle(N, t[0], t[1], [t[0] + ' cm', t[1] + ' cm', '?']); q.figureNote = c1 + '=' + t[0] + ' ' + c2 + '=' + t[1];
        q.texte = 'Le triangle $' + N.join('') + '$ est rectangle en $' + N[0] + '$, avec $' + c1 + '=' + t[0] + '$ cm et $' + c2 + '=' + t[1] + '$ cm. Calculer $' + hyp + '$ (en cm).';
        q.attendu = t[2];
        q.explication = 'Pythagore ($[' + hyp + ']$ est l\'hypoténuse) : $' + hyp + '^2=' + t[0] * t[0] + '+' + t[1] * t[1] + '=' + t[2] * t[2] + '$, donc $' + hyp + '=' + t[2] + '$ cm.';
        return q;
    };

    /* ===== A10 · Produit nul (automatisme final) ===== */
    Auto.produitNulFinal = function (niveau) {
        if (niveau === 2) return Auto.produitNul(2);
        var q = Auto.produitNulSimple(niveau);
        if (niveau === 1) delete q.rappel;
        return q;
    };

    /* =====================================================================
       Rappels des questions vertes (bouton « Je ne sais pas, j'ai besoin d'un rappel ») :
       la méthode et un exemple différent de la question. Texte mixte HTML + $maths$.
       ===================================================================== */
    var RAPPEL_DECIMAL = 'Pour comparer des nombres décimaux, on compare d\'abord les parties entières, puis les dixièmes, puis les centièmes, puis les millièmes.<br>' +
        'Astuce : on écrit tous les nombres avec autant de chiffres après la virgule.<br>' +
        'Exemple : $0{,}3=0{,}300$ ; $0{,}03=0{,}030$ ; $0{,}033$. Donc $0{,}030<0{,}033<0{,}300$.';
    var RAPPEL_ECRITURES = 'On écrit tous les nombres sous forme décimale, puis on compare.<br>' +
        '• Diviser par $10$, $100$, $1\\,000$ : la virgule se décale de $1$, $2$, $3$ rangs vers la gauche : $' + frac(237, 100) + '=2{,}37$.<br>' +
        '• Fractions à connaître : $' + frac(1, 2) + '=0{,}5$ ; $' + frac(1, 4) + '=0{,}25$ ; $' + frac(3, 4) + '=0{,}75$ ; $' + frac(1, 5) + '=0{,}2$. Par exemple $' + frac(9, 4) + '=2+' + frac(1, 4) + '=2{,}25$.<br>' +
        '• $\\times10^{-1}$, c\'est diviser par $10$ : $23\\times10^{-1}=2{,}3$.';
    var RAPPEL_ORDRE_GRANDEUR = 'On remplace chaque nombre par une valeur « ronde » proche, puis on calcule de tête.<br>' +
        '$10\\,\\%$ d\'un nombre, c\'est ce nombre divisé par $10$ ; $50\\,\\%$, c\'est la moitié.<br>' +
        'Exemple : $49{,}7\\,\\%$ de $812$ : $49{,}7\\,\\%\\approx50\\,\\%$ et $812\\approx800$, donc environ la moitié de $800$, soit $400$.';
    var RAPPEL_POURCENTAGE = 'Prendre $p\\,\\%$ d\'un nombre $N$, c\'est multiplier $N$ par $' + frac('p', 100) + '$ : $p\\,\\%$ de $N=' + frac('p\\times N', 100) + '$.<br>' +
        'Exemple : $30\\,\\%$ de $200$ $=' + frac('30\\times200', 100) + '=60$.';
    var RAPPEL_RACINE = 'Pour encadrer $\\sqrt{a}$, on cherche les deux carrés parfaits qui entourent $a$.<br>' +
        'Exemple : $25<30<36$, c\'est-à-dire $5^2<30<6^2$, donc $5<\\sqrt{30}<6$.';
    var RAPPELS_TRIANGLE = 'Le <b>triangle magique</b> de $v=' + frac('d', 't') + '$ : on cache la lettre cherchée, ce qui reste donne la formule.<br>' +
            '<svg viewBox="0 0 180 150" width="180" height="150" role="img" aria-label="Triangle magique : d en haut, v et t en bas" style="display:block;margin:8px 0">' +
            '<polygon points="90,6 6,144 174,144" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>' +
            '<line x1="47" y1="76" x2="133" y2="76" stroke="currentColor" stroke-width="2"/>' +
            '<line x1="90" y1="76" x2="90" y2="144" stroke="currentColor" stroke-width="2"/>' +
            '<g font-family="Georgia, serif" font-style="italic" font-size="30" fill="currentColor" text-anchor="middle">' +
            '<text x="90" y="62">d</text><text x="62" y="124">v</text><text x="118" y="124">t</text></g>' +
            '<text x="90" y="104" font-size="16" fill="currentColor" text-anchor="middle" font-family="system-ui, sans-serif">×</text></svg>' +
            '• On cache $d$ : il reste $v$ à côté de $t$, donc $d=v\\times t$.<br>' +
            '• On cache $t$ : il reste $d$ au-dessus de $v$, donc $t=' + frac('d', 'v') + '$.<br>' +
            '• On cache $v$ : il reste $d$ au-dessus de $t$, donc $v=' + frac('d', 't') + '$.<br>' +
            'Exemple : une voiture roule à $v=60$ km/h pendant $t=2$ h. On cherche $d$ : $d=v\\times t=60\\times2=120$ km.';
    var RAPPELS = {
        plusGrand: RAPPEL_ECRITURES,
        pourcentage: RAPPEL_POURCENTAGE,
        encadrerRacine: RAPPEL_RACINE + '<br>Carrés à connaître : $1$, $4$, $9$, $16$, $25$, $36$, $49$, $64$, $81$, $100$, $121$, $144$.',
        petitsNombres: RAPPEL_DECIMAL,
        fractionDecimale: 'Diviser par $10$ : la virgule se décale de $1$ rang vers la gauche ; par $100$ : de $2$ rangs.<br>' +
            'Exemples : $' + frac(347, 10) + '=34{,}7$ et $' + frac(347, 100) + '=3{,}47$.',
        distributivite: 'Pour développer, on multiplie le nombre devant la parenthèse par <b>chaque</b> terme : $k(a+b)=k\\times a+k\\times b$.<br>' +
            'Exemple : $3(x-4)=3\\times x+3\\times(-4)=3x-12$.',
        ordreGrandeur: RAPPEL_ORDRE_GRANDEUR,
        equation: 'Pour trouver $x$, on fait la même opération des deux côtés de l\'égalité.<br>' +
            '• Si on ajoute un nombre à $x$, on le soustrait : $x+7=3$ donne $x=3-7=-4$.<br>' +
            '• Si $x$ est multiplié par un nombre, on divise par ce nombre : $-5x=20$ donne $x=' + frac(20, -5) + '=-4$.',
        ranger: RAPPEL_DECIMAL + '<br>Réponds avec les lettres, du plus petit au plus grand.',
        coefMultiplicateur: 'Augmenter de $t\\,\\%$, c\'est multiplier par $1+' + frac('t', 100) + '$. Diminuer de $t\\,\\%$, c\'est multiplier par $1-' + frac('t', 100) + '$.<br>' +
            'Exemples : hausse de $8\\,\\%$ : $\\times1{,}08$ ; baisse de $15\\,\\%$ : $\\times0{,}85$.',
        calculPourcentage: RAPPEL_POURCENTAGE + '<br>Astuces : $10\\,\\%$, c\'est diviser par $10$ ; $25\\,\\%$, c\'est le quart ; $50\\,\\%$, la moitié ; $75\\,\\%$, les trois quarts.<br>' +
            'Exemple : $30\\,\\%$ de $140$ : $10\\,\\%$ font $14$, donc $30\\,\\%$ font $3\\times14=42$.',
        equationDeuxMembres: 'On regroupe les $x$ d\'un côté et les nombres de l\'autre, puis on divise.<br>' +
            'Exemple : $5x+3=2x-9$ ; on enlève $2x$ des deux côtés : $3x+3=-9$ ; on enlève $3$ : $3x=-12$ ; on divise par $3$ : $x=-4$.',
        lireCoordonnees: 'Les coordonnées d\'un point s\'écrivent $(x\\ ;\\ y)$ : d\'abord l\'<b>abscisse</b>, lue sur l\'axe horizontal, puis l\'<b>ordonnée</b>, lue sur l\'axe vertical.<br>' +
            'Exemple : un point situé $2$ carreaux à gauche de l\'origine et $1$ carreau au-dessus a pour coordonnées $(-2\\ ;\\ 1)$.',
        ordreGrandeurNombre: RAPPEL_ORDRE_GRANDEUR,
        sommeDecimale: 'On écrit chaque fraction en décimal, puis on additionne en alignant les virgules.<br>' +
            'Exemple : $' + frac(3, 10) + '+' + frac(45, 100) + '+' + frac(7, '1\\,000') + '=0{,}3+0{,}45+0{,}007=0{,}757$.',
        imageFonction: 'L\'image de $a$ par $f$, c\'est $f(a)$ : on remplace $x$ par $a$ dans l\'expression, avec des parenthèses si $a$ est négatif.<br>' +
            'Exemple : si $f(x)=3x-5$, alors $f(-2)=3\\times(-2)-5=-6-5=-11$.',
        rangerEcritures: RAPPEL_ECRITURES + '<br>Réponds avec les lettres, du plus petit au plus grand.',
        encadrerRacineFinal: RAPPEL_RACINE.replace('$25<30<36$, c\'est-à-dire $5^2<30<6^2$, donc $5<\\sqrt{30}<6$', '$121<130<144$, c\'est-à-dire $11^2<130<12^2$, donc $11<\\sqrt{130}<12$') +
            '<br>Carrés à connaître : $1$, $4$, $9$, $16$, $25$, $36$, $49$, $64$, $81$, $100$, $121$, $144$.',
        puissances: 'Règles de calcul : $a^m\\times a^n=a^{m+n}$ et $' + frac('a^m', 'a^n') + '=a^{m-n}$.<br>' +
            'Attention aux exposants négatifs : $' + frac('5^3', '5^{-2}') + '=5^{3-(-2)}=5^5$ et $5^3\\times5^{-2}=5^{3+(-2)}=5^1$.',
        proportionGroupe: 'La proportion d\'une partie dans un groupe, c\'est $' + frac('\\text{effectif de la partie}', '\\text{effectif total}') + '$. Pour l\'avoir en pourcentage, on l\'écrit avec le dénominateur $100$.<br>' +
            'Exemple : $9$ externes sur $30$ élèves : $' + frac(9, 30) + '=' + frac(3, 10) + '=' + frac(30, 100) + '$, soit $30\\,\\%$.',
        fractionQuantite: 'Prendre les $' + frac('a', 'b') + '$ d\'une quantité $N$, c\'est calculer $' + frac('a\\times N', 'b') + '$ : on divise $N$ par $b$, puis on multiplie par $a$.<br>' +
            'Exemple : les $' + frac(3, 4) + '$ de $48$ : $48\\div4=12$, puis $3\\times12=36$.',
        pourcentageQuantite: RAPPEL_POURCENTAGE + '<br>Astuce : $10\\,\\%$, c\'est diviser par $10$ ; $5\\,\\%$, c\'est la moitié de $10\\,\\%$.',
        proportionDeProportion: 'Pour prendre une proportion d\'une proportion, on <b>multiplie</b> les deux proportions.<br>' +
            'Exemple : la moitié des élèves sont des filles et, parmi elles, les $' + frac(2, 3) + '$ font du sport : $' + frac(2, 3) + '\\times' + frac(1, 2) + '=' + frac(2, 6) + '=' + frac(1, 3) + '$ des élèves sont des filles qui font du sport.',
        scriptAffectations: 'Un script s\'exécute ligne par ligne, de haut en bas. <code>a = b + 1</code> calcule <code>b + 1</code> avec la valeur <b>actuelle</b> de <code>b</code>, puis range le résultat dans <code>a</code> (l\'ancienne valeur de <code>a</code> est effacée).<br>' +
            'Exemple : <code>a = 3</code>, <code>b = 5</code>, <code>a = a + b</code> (<code>a</code> vaut $8$), <code>b = a - 1</code> (<code>b</code> vaut $7$). <code>print(a, b)</code> affiche ' + console2(8, 7) + '.',
        scriptConditionnel: 'Avec <code>if</code> … <code>else</code>, on teste d\'abord la condition : si elle est vraie, on exécute le bloc sous <code>if</code> ; sinon, celui sous <code>else</code>.<br>' +
            'Exemple : avec <code>if x &gt;= 5:</code> <code>return 2 * x</code> <code>else:</code> <code>return x + 1</code>, on a <code>f(7)</code> $=2\\times7=14$ (car $7\\geqslant5$) et <code>f(3)</code> $=3+1=4$ (car $3<5$).',
        equationParentheses: 'On regroupe les $x$ dans un membre et les nombres dans l\'autre, puis on divise.<br>' +
            'Exemple : $5x+3=2x-9$ ; on soustrait $2x$ aux deux membres : $3x+3=-9$ ; on soustrait $3$ : $3x=-12$ ; on divise par $3$ : $x=-4$.',
        equationReduire: 'Pour trouver $x$, on fait la même opération sur les deux membres de l\'équation.<br>' +
            'Exemple : $4x-7=13$ ; on ajoute $7$ aux deux membres : $4x=20$ ; on divise par $4$ : $x=' + frac(20, 4) + '=5$.',
        perimetreAire: 'Le <b>périmètre</b> est la longueur du contour : on additionne les longueurs de tous les côtés (il faut parfois retrouver celles qui ne sont pas écrites).<br>' +
            'L\'<b>aire</b> d\'une figure « rectangle moins un morceau » : aire du grand rectangle moins aire du morceau retiré.<br>' +
            'Exemple : rectangle de $10$ m sur $6$ m privé d\'un carré de $2$ m : aire $10\\times6-2^2=56$ m².',
        factoriser: 'Factoriser, c\'est écrire une somme sous la forme d\'un produit : on cherche le <b>facteur commun</b> à tous les termes, puis on utilise $ka+kb=k(a+b)$.<br>' +
            'Exemple : $6x+15=3\\times2x+3\\times5=3(2x+5)$.',
        factoriserCommun: 'Factoriser, c\'est écrire une somme sous la forme d\'un produit : on cherche le <b>facteur commun</b> à tous les termes, puis on utilise $ka+kb=k(a+b)$.<br>' +
            'Exemple : $4x-28=4\\times x-4\\times7=4(x-7)$. On vérifie en développant.',
        factoriserParX: 'Factoriser, c\'est écrire une somme sous la forme d\'un produit : on cherche le <b>facteur commun</b> à tous les termes, puis on utilise $ka+kb=k(a+b)$.<br>' +
            'Exemple : $x^2+5x=x\\times x+x\\times5=x(x+5)$.',
        developper: 'Pour développer, on multiplie le nombre devant la parenthèse par <b>chaque</b> terme, signe compris : $k(a+b)=k\\times a+k\\times b$.<br>' +
            'Exemple : $-2(3x-4)=-2\\times3x+(-2)\\times(-4)=-6x+8$.',
        segmentSomme: 'Des morceaux qui portent le même codage ont la même longueur. On additionne la longueur de tous les morceaux, puis on réduit.<br>' +
            'Exemple : trois morceaux de longueur $x$ et deux de longueur $4$ : $x+x+x+4+4=3x+8$.',
        segmentReste: 'Des morceaux qui portent le même codage ont la même longueur. Ce qui reste d\'un segment, c\'est la longueur totale moins les morceaux connus.<br>' +
            'Exemple : un segment de $15$ dont on retire deux morceaux de longueur $x$ : il reste $15-2x$.',
        segmentQuotient: 'Si une longueur $L$ est partagée en $3$ morceaux de même longueur, chaque morceau mesure $' + frac('L', 3) + '$.<br>' +
            'Exemple : un segment de $12$ dont on retire $x$, puis partagé en $2$ : chaque morceau mesure $' + frac('12-x', 2) + '$.',
        normeVecteur: 'La norme d\'un vecteur, c\'est sa longueur. Sur un quadrillage, on compte le déplacement horizontal $a$ et le déplacement vertical $b$, puis Pythagore : norme $=\\sqrt{a^2+b^2}$.<br>' +
            'Exemple : $2$ carreaux à droite et $1$ en haut : $\\sqrt{2^2+1^2}=\\sqrt{5}$.',
        normeSimplifier: 'Norme sur un quadrillage : $\\sqrt{a^2+b^2}$. Pour simplifier une racine, on fait apparaître un carré : $\\sqrt{k^2\\times n}=k\\sqrt{n}$.<br>' +
            'Exemple : $4$ à droite et $2$ en haut : $\\sqrt{16+4}=\\sqrt{20}=\\sqrt{4\\times5}=2\\sqrt{5}$.',
        normeColineaire: 'Norme sur un quadrillage : $\\sqrt{a^2+b^2}$, puis on simplifie : $\\sqrt{k^2\\times n}=k\\sqrt{n}$.<br>' +
            'Exemple : $6$ à droite et $2$ en haut : $\\sqrt{36+4}=\\sqrt{40}=\\sqrt{4\\times10}=2\\sqrt{10}$.',
        sommeVecteurs: 'Pour additionner deux vecteurs, on les met <b>bout à bout</b> : on parcourt le premier, puis le second à partir de son extrémité. On additionne les déplacements horizontaux, puis les verticaux.<br>' +
            'Exemple : $2$ à droite et $1$ en haut, puis $1$ à droite et $3$ en haut : au total $3$ à droite et $4$ en haut.',
        fonctionPython: '<code>def f(x):</code> définit une fonction ; <code>return</code> donne le résultat. Pour calculer <code>f(4)</code>, on remplace <code>x</code> par $4$ dans l\'expression.<br>' +
            'Exemple : avec <code>return x * (x - 2)</code>, <code>f(4)</code> renvoie $4\\times(4-2)=4\\times2=8$.',
        translationPoint: 'La translation qui transforme $A$ en $B$ fait subir à <b>tous</b> les points le même déplacement que celui qui va de $A$ à $B$ (même direction, même sens, même longueur).<br>' +
            'On compte ce déplacement sur le réseau (colonnes, rangées), puis on le refait à partir du point de départ.',
        vecteurEgalite: '$\\overrightarrow{AB}=\\overrightarrow{DC}$ signifie que $ABCD$ est un parallélogramme (éventuellement aplati) : les sommets se lisent dans l\'ordre $A\\to B\\to C\\to D$.<br>' +
            'Astuce : dans $\\overrightarrow{AB}=\\overrightarrow{DC}$, on lit le premier vecteur à l\'endroit ($A$, $B$) et le second à l\'envers ($C$, $D$).',
        puissancesX: 'Règles de calcul : $x^m\\times x^n=x^{m+n}$ ; $' + frac('x^m', 'x^n') + '=x^{m-n}$ ; $(x^m)^n=x^{m\\times n}$.<br>' +
            'Exemple : $x^4\\times x^3=x^{4+3}=x^7$.',
        distributiviteS2: 'Pour développer, on multiplie le nombre devant la parenthèse par <b>chaque</b> terme, signe compris : $k(a+b)=k\\times a+k\\times b$.<br>' +
            'Exemple : $-3(x-5)=-3\\times x+(-3)\\times(-5)=-3x+15$.',
        fonctionDeuxParametres: 'Avec <code>def f(a, b):</code>, l\'appel <code>f(4, 7)</code> donne <code>a = 4</code> et <code>b = 7</code>, <b>dans l\'ordre</b>. On remplace dans la ligne <code>return</code>.<br>' +
            'Exemple : avec <code>return 3 * a + b</code>, <code>f(4, 7)</code> renvoie $3\\times4+7=19$.',
        ecrituresNombre: 'Une fraction est une division : $' + frac(3, 4) + '=3\\div4=0{,}75$.<br>À connaître : $' + frac(1, 2) + '=0{,}5$ ; $' + frac(1, 4) + '=0{,}25$ ; $' + frac(1, 5) + '=0{,}2$ ; $' + frac(1, 8) + '=0{,}125$.',
        comparerFractions: 'Deux fractions de même numérateur : la plus grande a le plus <b>petit</b> dénominateur, $' + frac(3, 5) + '>' + frac(3, 7) + '$.<br>' +
            'Sinon, on les réduit au même dénominateur : $' + frac(2, 3) + '=' + frac(8, 12) + '$ et $' + frac(3, 4) + '=' + frac(9, 12) + '$, donc $' + frac(2, 3) + '<' + frac(3, 4) + '$.',
        fractionsCalcul: 'On ne change pas une fraction en <b>multipliant</b> (ou divisant) son numérateur et son dénominateur par le même nombre : $' + frac(2, 3) + '=' + frac(8, 12) + '$.<br>' +
            'Pour additionner deux fractions de même dénominateur, on additionne les numérateurs : $' + frac(2, 7) + '+' + frac(3, 7) + '=' + frac(5, 7) + '$.',
        puissancesDix: '$10^n$ ($n$ positif) : un $1$ suivi de $n$ zéros. $10^0=1$. $10^{-n}$ : $0{,}0\\ldots01$ avec le $1$ au $n$-ième rang après la virgule.<br>' +
            'Exemples : $10^3=1\\,000$ ; $10^{-2}=0{,}01$.',
        notationScientifique: 'Multiplier par $10^n$ ($n>0$), c\'est décaler la virgule de $n$ rangs vers la <b>droite</b> ; par $10^{-n}$, de $n$ rangs vers la <b>gauche</b>.<br>' +
            'Exemple : $3{,}7\\times10^{2}=370$ et $3{,}7\\times10^{-2}=0{,}037$.',
        pythagore: 'Dans un triangle rectangle, le carré de l\'<b>hypoténuse</b> (le côté opposé à l\'angle droit, le plus long) est égal à la somme des carrés des deux autres côtés.<br>' +
            'Exemple : triangle rectangle de côtés $5$ et $12$ : hypoténuse$^2=5^2+12^2=169$, donc hypoténuse $=\\sqrt{169}=13$.',
        identitesRemarquables: 'Les trois identités remarquables : $(a+b)^2=a^2+2ab+b^2$ ; $(a-b)^2=a^2-2ab+b^2$ ; $(a+b)(a-b)=a^2-b^2$.<br>' +
            'Exemple : $(x+5)^2=x^2+2\\times x\\times5+5^2=x^2+10x+25$. Attention à ne pas oublier le double produit $2ab$.',
        puissancesSimple: 'Règles de calcul : $a^m\\times a^n=a^{m+n}$ et $' + frac('a^m', 'a^n') + '=a^{m-n}$.<br>' +
            'Exemples : $3^{-2}\\times3^{5}=3^{-2+5}=3^3$ et $' + frac('3^{2}', '3^{-4}') + '=3^{2-(-4)}=3^6$.',
        pourcentageFinal: RAPPEL_POURCENTAGE + '<br>De tête : $10\\,\\%$, c\'est diviser par $10$ ; $5\\,\\%$, c\'est la moitié de $10\\,\\%$.<br>' +
            'Exemple : $35\\,\\%$ de $120$ : $10\\,\\%$ font $12$, $5\\,\\%$ font $6$, donc $35\\,\\%$ font $3\\times12+6=42$.',
        chasles: 'Relation de Chasles : $\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}$ (l\'extrémité du premier vecteur est l\'origine du second).<br>' +
            'On peut changer l\'ordre des termes pour les mettre bout à bout : $\\overrightarrow{BC}+\\overrightarrow{AB}=\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}$.',
        lireCoordonneesSimple: 'Les coordonnées d\'un point s\'écrivent $(x\\ ;\\ y)$ : d\'abord l\'<b>abscisse</b>, lue sur l\'axe horizontal, puis l\'<b>ordonnée</b>, lue sur l\'axe vertical.<br>' +
            'Exemple : un point situé $3$ carreaux à droite de l\'origine et $2$ carreaux en dessous a pour coordonnées $(3\\ ;\\ -2)$.',
        ordreGrandeurFinal: RAPPEL_ORDRE_GRANDEUR + '<br>$25\\,\\%$, c\'est le quart ; $75\\,\\%$, les trois quarts.',
        scriptSiSinon: 'Avec <code>if</code> … <code>else</code>, on teste la condition avec les valeurs <b>actuelles</b> des variables : si elle est vraie, on exécute seulement le bloc sous <code>if</code> ; sinon, seulement celui sous <code>else</code>.<br>' +
            'Exemple : <code>a = 4</code>, <code>b = 10</code>, <code>if a &gt; b:</code> <code>a = a - b</code> <code>else:</code> <code>b = b - a</code>. Comme $4>10$ est faux, seul <code>b</code> change : il vaut $6$. <code>print(a, b)</code> affiche ' + console2(4, 6) + '.',
        imageSimple: 'L\'image de $a$ par $f$, c\'est $f(a)$ : on remplace $x$ par $a$ dans l\'expression, avec des parenthèses si $a$ est négatif.<br>' +
            'Exemple : si $f(x)=-2x+5$, alors $f(-3)=-2\\times(-3)+5=6+5=11$.',
        rangerFinal: RAPPEL_ECRITURES + '<br>Réponds avec les lettres, du plus petit au plus grand.',
        arithmetique: 'Un nombre <b>premier</b> a exactement deux diviseurs : $1$ et lui-même ($2$, $3$, $5$, $7$, $11$, $13$, $17$, $19$, $23$…).<br>' +
            'Pour vérifier, on cherche s\'il est divisible par $2$, $3$, $5$, $7$, $11$… Astuce pour $3$ : la somme des chiffres est un multiple de $3$.<br>' +
            'Exemple : $57$ : $5+7=12$, donc $57=3\\times19$ n\'est pas premier.',
        identitesSimple: 'Les trois identités remarquables : $(a+b)^2=a^2+2ab+b^2$ ; $(a-b)^2=a^2-2ab+b^2$ ; $(a+b)(a-b)=a^2-b^2$.<br>' +
            'Exemple : $(x-4)^2=x^2-2\\times x\\times4+4^2=x^2-8x+16$.',
        puissancesFinal: 'Règles de calcul : $a^m\\times a^n=a^{m+n}$ et $' + frac('a^m', 'a^n') + '=a^{m-n}$.<br>' +
            'Exemples : $7^{-5}\\times7^{3}=7^{-5+3}=7^{-2}$ et $' + frac('7^{-1}', '7^{4}') + '=7^{-1-4}=7^{-5}$.',
        isolerVariable: RAPPELS_TRIANGLE,
        chaslesSimple: 'Relation de Chasles : $\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}$. On change l\'ordre des termes pour mettre les vecteurs bout à bout.<br>' +
            'Exemple : $\\overrightarrow{BC}+\\overrightarrow{AB}=\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}$ : on répond <b>AC</b>.',
        repereFinal: 'Les coordonnées d\'un point s\'écrivent $(x\\ ;\\ y)$ : d\'abord l\'<b>abscisse</b> (axe horizontal), puis l\'<b>ordonnée</b> (axe vertical).<br>' +
            'Exemple : $2$ carreaux à gauche de l\'origine et $3$ au-dessus : $(-2\\ ;\\ 3)$.',
        produitNul: 'Un produit est nul si et seulement si l\'un au moins de ses facteurs est nul.<br>' +
            'Exemple : $(x-2)(x+7)=0$ : $x-2=0$ ou $x+7=0$, donc $x=2$ ou $x=-7$.',
        scriptSiSinonSimple: 'Avec <code>if</code> … <code>else</code>, on teste la condition avec les valeurs actuelles : si elle est vraie, on exécute seulement le bloc sous <code>if</code> ; sinon, seulement celui sous <code>else</code>.<br>' +
            'Exemple : <code>a = 4</code>, <code>b = 10</code>, <code>if a &gt; b:</code> <code>a = a - b</code> <code>else:</code> <code>b = b - a</code> : $4>10$ est faux, <code>b</code> vaut $6$, la console affiche ' + console2(4, 6) + '.',
        imageFinal: 'L\'image de $a$ par $f$, c\'est $f(a)$ : on remplace $x$ par $a$, avec des parenthèses si $a$ est négatif.<br>' +
            'Exemple : si $f(x)=-4x+1$, alors $f(-2)=-4\\times(-2)+1=8+1=9$.',
        moyenneMediane: 'La <b>médiane</b> partage la série rangée en deux groupes de même effectif : on <b>range d\'abord</b> les valeurs dans l\'ordre croissant, puis on prend celle du milieu.<br>' +
            'Exemple : $9\\ ;\\ 2\\ ;\\ 7\\ ;\\ 4\\ ;\\ 12$ rangée donne $2\\ ;\\ 4\\ ;\\ 7\\ ;\\ 9\\ ;\\ 12$ : la médiane est $7$ (et la moyenne $' + frac(34, 5) + '=6{,}8$).',
        arithmetiqueSimple: 'Pour trouver le plus petit diviseur d\'un nombre (autre que $1$), on teste $2$, puis $3$, puis $5$, puis $7$…<br>' +
            'Divisible par $3$ : la somme des chiffres est un multiple de $3$. Exemple : $87$ : $8+7=15$, donc $87=3\\times29$ ; le plus petit diviseur est $3$.',
        identitesFinal: 'Les trois identités remarquables : $(a+b)^2=a^2+2ab+b^2$ ; $(a-b)^2=a^2-2ab+b^2$ ; $(a+b)(a-b)=a^2-b^2$.<br>' +
            'Exemple : $(x+3)^2=x^2+2\\times x\\times3+3^2=x^2+6x+9$.',
        inequation: 'On résout une inéquation comme une équation, avec une règle en plus : quand on multiplie ou divise par un nombre <b>négatif</b>, on <b>change le sens</b> de l\'inégalité.<br>' +
            'Exemple : $2x+1<7$ ; $2x<6$ ; $x<3$ (division par $2>0$). Mais $-2x<6$ donne $x>-3$ (division par $-2<0$).',
        isolerSimple: RAPPELS_TRIANGLE,
        chaslesFinal: 'Relation de Chasles : $\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}$. On change l\'ordre des termes pour mettre les vecteurs bout à bout.<br>' +
            'Exemple : $\\overrightarrow{BC}+\\overrightarrow{AB}=\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}$ : on répond <b>AC</b>.',
        pythagoreQCM: 'Dans un triangle rectangle, le carré de l\'<b>hypoténuse</b> (côté opposé à l\'angle droit) est égal à la somme des carrés des deux autres côtés.<br>' +
            'Exemple : côtés de l\'angle droit $3$ cm et $4$ cm : hypoténuse$^2=9+16=25$, donc hypoténuse $=\\sqrt{25}=5$ cm.',
        produitNulSimple: 'Un produit est nul si et seulement si l\'un au moins de ses facteurs est nul.<br>' +
            'Exemple : $(x+3)(x-8)=0$ : $x+3=0$ ou $x-8=0$, donc $x=-3$ ou $x=8$.',
        scriptFinal: 'Avec <code>if</code> … <code>else</code>, on teste la condition avec les valeurs actuelles : si elle est vraie, on exécute seulement le bloc sous <code>if</code> ; sinon, seulement celui sous <code>else</code>.<br>' +
            'Exemple : <code>a = 4</code>, <code>b = 10</code>, <code>if a &gt; b:</code> <code>a = a - b</code> <code>else:</code> <code>b = b - a</code> : $4>10$ est faux, <code>b</code> vaut $6$, la console affiche ' + console2(4, 6) + '.',
        probaUrne: 'Quand toutes les issues ont la même chance (équiprobabilité) : $P=' + frac('\\text{nombre d\'issues favorables}', '\\text{nombre total d\'issues}') + '$.<br>' +
            'Exemple : $3$ boules rouges et $5$ vertes ($8$ boules) : $P(\\text{rouge})=' + frac(3, 8) + '$ et $P(\\text{pas rouge})=1-' + frac(3, 8) + '=' + frac(5, 8) + '$.',
        medianeSimple: 'La <b>médiane</b> : on <b>range d\'abord</b> les valeurs dans l\'ordre croissant, puis on prend celle du milieu.<br>' +
            'Exemple : $9\\ ;\\ 2\\ ;\\ 7\\ ;\\ 4\\ ;\\ 12$ rangée donne $2\\ ;\\ 4\\ ;\\ 7\\ ;\\ 9\\ ;\\ 12$ : la médiane est $7$. Avec un nombre pair de valeurs, on prend la moyenne des deux valeurs du milieu.',
        arithmetiqueFinal: 'Pour trouver le plus petit diviseur d\'un nombre (autre que $1$), on teste $2$, puis $3$, puis $5$, puis $7$…<br>' +
            'Divisible par $3$ : la somme des chiffres est un multiple de $3$. Exemple : $91$ n\'est divisible ni par $2$, ni par $3$, ni par $5$, mais $91=7\\times13$.',
        milieu: 'Le milieu $M$ de $[AB]$ a pour coordonnées la <b>moyenne</b> des coordonnées de $A$ et de $B$ : $M\\left(' + frac('x_A+x_B', 2) + '\\ ;\\ ' + frac('y_A+y_B', 2) + '\\right)$.<br>' +
            'Exemple : $A(1\\ ;\\ 4)$ et $B(5\\ ;\\ -2)$ : $M\\left(' + frac('1+5', 2) + '\\ ;\\ ' + frac('4+(-2)', 2) + '\\right)=M(3\\ ;\\ 1)$.',
        inequationSimple: 'On résout une inéquation comme une équation ; quand on divise par un nombre <b>positif</b>, le sens de l\'inégalité ne change pas.<br>' +
            'Exemple : $3x-4\\geqslant8$ ; $3x\\geqslant12$ ; $x\\geqslant4$.',
        isolerFinal: RAPPELS_TRIANGLE,
        proportionPourcent: 'Pour une proportion de proportion, on <b>multiplie</b> les deux proportions.<br>' +
            'Exemple : $50\\,\\%$ des élèves sont des filles et, parmi elles, $40\\,\\%$ font du sport : $0{,}5\\times0{,}4=0{,}2$, soit $20\\,\\%$ des élèves.',
        pythagoreSimple: 'Dans un triangle rectangle, le carré de l\'<b>hypoténuse</b> (côté opposé à l\'angle droit) est égal à la somme des carrés des deux autres côtés.<br>' +
            'Exemple : côtés de l\'angle droit $6$ cm et $8$ cm : hypoténuse$^2=36+64=100$, donc hypoténuse $=10$ cm.',
        produitNulFinal: 'Un produit est nul si et seulement si l\'un au moins de ses facteurs est nul.<br>' +
            'Exemple : $(x-5)(x+1)=0$ : $x-5=0$ ou $x+1=0$, donc $x=5$ ou $x=-1$.'
    };
    // chaque question verte reçoit son rappel
    Object.keys(RAPPELS).forEach(function (nom) {
        var generer = Auto[nom];
        Auto[nom] = function (niveau) {
            var q = generer(niveau);
            if (niveau === 1) q.rappel = RAPPELS[nom];
            return q;
        };
    });

    window.Auto = Auto;
})();
