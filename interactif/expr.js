/* Lecture des expressions tapées par les élèves : 3x²-2(x+1), (2x-1)^2, 1/2x, 2,5x…
   - Expr.lire(texte)        -> arbre (lève une erreur si illisible)
   - Expr.tex(arbre)         -> LaTeX (aperçu en direct)
   - Expr.valeur(arbre, env) -> nombre
   - Expr.egales(a, b)       -> mêmes valeurs pour plusieurs x au hasard
   - Expr.developpeeReduite(arbre) -> somme de monômes de degrés tous différents */
(function () {
    'use strict';

    function normaliser(s) {
        return s.toLowerCase()
            .replace(/²/g, '^2').replace(/³/g, '^3')
            .replace(/[×·∗]/g, '*').replace(/÷/g, '/').replace(/[−–—]/g, '-')
            .replace(/,/g, '.').replace(/\s+/g, '');
    }

    function decouper(s) {
        var jetons = [], i = 0, m;
        while (i < s.length) {
            var c = s[i];
            if ((m = /^\d+(\.\d+)?|^\.\d+/.exec(s.slice(i)))) { jetons.push({ t: 'num', s: m[0] }); i += m[0].length; }
            else if (/[a-z]/.test(c)) { jetons.push({ t: 'var', s: c }); i++; }
            else if ('+-*/^()'.indexOf(c) >= 0) { jetons.push({ t: c }); i++; }
            else throw new Error('Caractère non reconnu : « ' + c + ' »');
        }
        return jetons;
    }

    function lire(texte, variables) {
        if (variables == null) variables = 'x';
        var s = normaliser(texte);
        if (!s) throw new Error('Réponse vide');
        var j = decouper(s), p = 0;
        function voir() { return j[p] && j[p].t; }

        function somme() {
            var a = produit();
            while (voir() === '+' || voir() === '-') { var op = j[p++].t; a = { t: op, a: a, b: produit() }; }
            return a;
        }
        function produit() {
            var a = signe();
            for (;;) {
                var v = voir();
                if (v === '*' || v === '/') { p++; a = { t: v, a: a, b: signe() }; }
                else if (v === 'var' || v === '(') a = { t: '*', a: a, b: puissance(), imp: true };
                else if (v === 'num') throw new Error('Écris le nombre avant la lettre (ex. 3x)');
                else return a;
            }
        }
        function signe() {
            if (voir() === '-') { p++; return { t: 'neg', a: signe() }; }
            if (voir() === '+') { p++; return signe(); }
            return puissance();
        }
        function puissance() {
            var a = atome();
            if (voir() === '^') { p++; return { t: '^', a: a, b: voir() === '-' ? signe() : atome() }; }
            return a;
        }
        function atome() {
            var k = j[p++];
            if (!k) throw new Error('Expression incomplète');
            if (k.t === 'num') return { t: 'num', s: k.s, v: parseFloat(k.s) };
            if (k.t === 'var') {
                if (variables.indexOf(k.s) < 0) throw new Error('Lettre inattendue : ' + k.s);
                return { t: 'var', n: k.s };
            }
            if (k.t === '(') {
                var a = somme();
                if (voir() !== ')') throw new Error('Parenthèse non fermée');
                p++;
                return { t: 'par', a: a };
            }
            throw new Error('« ' + k.t + ' » mal placé');
        }

        var arbre = somme();
        if (p < j.length) throw new Error('« ' + (j[p].s || j[p].t) + ' » mal placé');
        return arbre;
    }

    function valeur(n, env) {
        switch (n.t) {
            case 'num': return n.v;
            case 'var': return env[n.n];
            case 'par': return valeur(n.a, env);
            case 'neg': return -valeur(n.a, env);
            case '+': return valeur(n.a, env) + valeur(n.b, env);
            case '-': return valeur(n.a, env) - valeur(n.b, env);
            case '*': return valeur(n.a, env) * valeur(n.b, env);
            case '/': return valeur(n.a, env) / valeur(n.b, env);
            case '^': return Math.pow(valeur(n.a, env), valeur(n.b, env));
        }
    }

    function sansPar(n) { return n.t === 'par' ? n.a : n; }

    function tex(n) {
        switch (n.t) {
            case 'num': return n.s.replace('.', '{,}');
            case 'var': return n.n;
            case 'par': return '\\left(' + tex(n.a) + '\\right)';
            case 'neg': return '-' + tex(n.a);
            case '+': return tex(n.a) + '+' + tex(n.b);
            case '-': return tex(n.a) + '-' + tex(n.b);
            case '*': return tex(n.a) + (n.imp ? '' : '\\times ') + tex(n.b);
            case '/': return '\\dfrac{' + tex(sansPar(n.a)) + '}{' + tex(sansPar(n.b)) + '}';
            case '^': return '{' + tex(n.a) + '}^{' + tex(sansPar(n.b)) + '}';
        }
    }

    function egales(a, b, variables) {
        if (variables == null) variables = 'x';
        var essais = 0, ok = 0;
        for (var k = 0; k < 40 && ok < 8; k++) {
            var env = {};
            for (var i = 0; i < variables.length; i++) env[variables[i]] = Math.round((Math.random() * 10 - 5) * 1000) / 1000 + 0.137;
            var u = valeur(a, env), v = valeur(b, env);
            if (!isFinite(u) && !isFinite(v)) continue;
            essais++;
            if (!isFinite(u) || !isFinite(v)) return false;
            if (Math.abs(u - v) > 1e-9 * Math.max(1, Math.abs(u), Math.abs(v))) return false;
            ok++;
        }
        return essais > 0;
    }

    /* Monôme « réduit » : c, x, x^k, c·x, c·x^k (c entier, décimal ou fraction c/d) */
    function coefficient(n) {
        if (n.t === 'neg') return coefficient(n.a);
        return n.t === 'num' || (n.t === '/' && n.a.t === 'num' && n.b.t === 'num');
    }
    function partieLettre(n) {
        if (n.t === 'var') return 1;
        if (n.t === '^' && n.a.t === 'var' && n.b.t === 'num' && /^\d+$/.test(n.b.s) && n.b.v >= 2) return n.b.v;
        return -1;
    }
    function degreMonome(n) {
        if (n.t === 'neg') return degreMonome(n.a);
        if (coefficient(n)) return 0;
        var d = partieLettre(n);
        if (d > 0) return d;
        if (n.t === '*' && coefficient(n.a)) return partieLettre(n.b);
        if (n.t === '/' && n.b.t === 'num') return degreMonome(n.a); // ex. x/2
        return -1;
    }
    function termes(n, liste) {
        if (n.t === '+' || n.t === '-') { termes(n.a, liste); liste.push(n.b); }
        else liste.push(n);
        return liste;
    }
    function developpeeReduite(arbre) {
        var vus = {};
        var ts = termes(arbre, []);
        for (var i = 0; i < ts.length; i++) {
            var d = degreMonome(ts[i]);
            if (d < 0 || vus[d]) return false;
            vus[d] = true;
        }
        return true;
    }

    window.Expr = { lire: lire, tex: tex, valeur: valeur, egales: egales, developpeeReduite: developpeeReduite };
})();
