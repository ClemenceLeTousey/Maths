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
            do { p = A.nonNul(-5, 7); k = A.entier(2, 3); e = A.nonNul(-4, 3); d = A.nonNul(-4, 4); } while (p + k * e - d === 0);
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
            'Exemple : rectangle de $10$ m sur $6$ m privé d\'un carré de $2$ m : aire $10\\times6-2^2=56$ m².'
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
