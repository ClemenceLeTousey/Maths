/* ==========================================================================
   Maths dans les messages et les notifications (écriture LaTeX entre $…$ ou $$…$$).
   - MathsTexte.rendu(el, texte) : affiche le texte, maths rendues par KaTeX (le reste reste du texte brut,
     jamais interprété comme du HTML). KaTeX est chargé à la demande s'il manque sur la page.
   - MathsTexte.unicode(texte) : version texte seul (x², √(2), 1/2, ≤…), pour les notifications du
     téléphone, qui ne savent pas afficher KaTeX (utilisé aussi par sw.js).
   - MathsTexte.barre(zone, apercu) : petite barre de boutons au-dessus d'un champ de saisie + aperçu.
   « \$ » écrit un dollar sans ouvrir de formule.
   ========================================================================== */
(function (G) {
    var KATEX = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/';

    /* ---------- Découpage : [{t: texte} | {m: tex, bloc: bool}] ---------- */
    function morceaux(s) {
        s = String(s == null ? '' : s);
        var l = [], re = /\$\$([\s\S]+?)\$\$|\$((?:\\\$|[^$\n])+?)\$/g, i = 0, m;
        var src = s.replace(/\\\$/g, '\u0000');   // \$ : dollar littéral
        while ((m = re.exec(src))) {
            if (m.index > i) l.push({ t: src.slice(i, m.index) });
            l.push({ m: (m[1] || m[2]).replace(/\u0000/g, '\\$'), bloc: !!m[1] });
            i = re.lastIndex;
        }
        if (i < src.length) l.push({ t: src.slice(i) });
        l.forEach(function (x) { if (x.t != null) x.t = x.t.replace(/\u0000/g, '$'); });
        return l;
    }
    function aDesMaths(s) { return morceaux(s).some(function (x) { return x.m != null; }); }

    /* ---------- Conversion en texte Unicode ---------- */
    var EXP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ' };
    var IND = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'n': 'ₙ', 'i': 'ᵢ', 'k': 'ₖ', 'p': 'ₚ', 'x': 'ₓ' };
    var SYM = {
        times: '×', div: '÷', cdot: '·', pm: '±', mp: '∓', leq: '≤', le: '≤', geq: '≥', ge: '≥', neq: '≠', ne: '≠', approx: '≈',
        infty: '∞', in: '∈', notin: '∉', subset: '⊂', cup: '∪', cap: '∩', emptyset: '∅', varnothing: '∅', forall: '∀', exists: '∃',
        Rightarrow: '⇒', Leftrightarrow: '⇔', iff: '⇔', implies: '⇒', to: '→', rightarrow: '→', mapsto: '↦', perp: '⊥', parallel: '∥',
        alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ', epsilon: 'ε', varepsilon: 'ε', theta: 'θ', lambda: 'λ', mu: 'μ',
        pi: 'π', sigma: 'σ', Sigma: 'Σ', sum: 'Σ', omega: 'ω', Omega: 'Ω', phi: 'φ', varphi: 'φ', rho: 'ρ', tau: 'τ',
        ldots: '…', dots: '…', cdots: '⋯', degree: '°', circ: '°', angle: '∠', widehat: '', percent: '%', '%': '%',
        lbrace: '{', rbrace: '}', '{': '{', '}': '}', '$': '$', '&': '&', '#': '#', '_': '_', ',': ' ', ';': ' ', ':': ' ', '!': '', ' ': ' ', '\\': ' ',
        quad: '  ', qquad: '   ', left: '', right: '', displaystyle: '', textstyle: '', limits: '', big: '', Big: '', bigl: '', bigr: ''
    };
    var ENS = { R: 'ℝ', N: 'ℕ', Z: 'ℤ', Q: 'ℚ', C: 'ℂ', D: '𝔻' };
    // contenu d'un groupe {…} commençant à s[i] (ou un seul caractère / une commande)
    function groupe(s, i) {
        while (s[i] === ' ') i++;
        if (s[i] === '{') {
            var n = 1, j = i + 1;
            while (j < s.length && n) { if (s[j] === '{') n++; else if (s[j] === '}') n--; j++; }
            return { v: s.slice(i + 1, j - 1), fin: j };
        }
        if (s[i] === '\\') { var m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i)); if (m) return { v: m[0], fin: i + m[0].length }; }
        return { v: s[i] || '', fin: i + 1 };
    }
    function petit(t, table, marque) {
        var ok = t.split('').every(function (c) { return table[c]; });
        if (ok) return t.split('').map(function (c) { return table[c]; }).join('');
        return marque + (t.length > 1 ? '(' + t + ')' : t);
    }
    function paren(t) { return /^[\w.,²³√π]+$/.test(t) ? t : '(' + t + ')'; }
    function tex(s) {
        var r = '', i = 0;
        while (i < s.length) {
            var c = s[i];
            if (c === '^' || c === '_') {
                var g = groupe(s, i + 1);
                r += petit(tex(g.v), c === '^' ? EXP : IND, c);
                i = g.fin; continue;
            }
            if (c === '{' || c === '}') { i++; continue; }
            if (c === '~') { r += ' '; i++; continue; }
            if (c !== '\\') { r += c; i++; continue; }
            var m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i)), nom = m ? m[1] : '';
            i += m ? m[0].length : 1;
            var a, b;
            if (/^[dt]?frac$/.test(nom)) {
                a = groupe(s, i); b = groupe(s, a.fin); i = b.fin;
                r += paren(tex(a.v)) + '/' + paren(tex(b.v));
            } else if (nom === 'sqrt') {
                var ordre = '';
                if (s[i] === '[') { var f = s.indexOf(']', i); ordre = s.slice(i + 1, f); i = f + 1; }
                a = groupe(s, i); i = a.fin;
                r += (ordre === '3' ? '∛' : (ordre ? petit(ordre, EXP, '') : '') + '√') + paren(tex(a.v));
            } else if (nom === 'vec' || nom === 'overrightarrow') {
                a = groupe(s, i); i = a.fin;
                r += 'vect(' + tex(a.v) + ')';   // la flèche combinante s'affiche mal sur certains téléphones
            } else if (nom === 'overline' || nom === 'bar') {
                a = groupe(s, i); i = a.fin;
                r += tex(a.v).split('').map(function (x) { return x + '̅'; }).join('');
            } else if (/^(text|textbf|textit|mathrm|mathbf|operatorname|mbox|hat|widehat|boxed)$/.test(nom)) {
                a = groupe(s, i); i = a.fin;
                r += nom === 'widehat' || nom === 'hat' ? tex(a.v) + '̂' : /^(text|mbox)$/.test(nom) ? a.v : tex(a.v);
            } else if (nom === 'mathbb') {
                a = groupe(s, i); i = a.fin;
                r += ENS[a.v] || a.v;
            } else if (Object.prototype.hasOwnProperty.call(SYM, nom)) {
                r += SYM[nom];
            } else if (/^(cos|sin|tan|ln|log|exp|lim|max|min)$/.test(nom)) {
                r += nom;
            } else r += nom;
        }
        return r;
    }
    function unicode(s) {
        return morceaux(s).map(function (x) { return x.t != null ? x.t : tex(x.m).replace(/ {2,}/g, ' ').trim(); }).join('');
    }

    /* ---------- Rendu dans la page (KaTeX) ---------- */
    var attente = null;
    function chargerKatex() {
        if (G.katex) return Promise.resolve();
        if (attente) return attente;
        attente = new Promise(function (ok, ko) {
            if (!document.querySelector('link[href*="katex"]')) {
                var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = KATEX + 'katex.min.css'; document.head.appendChild(l);
            }
            var sc = document.createElement('script'); sc.src = KATEX + 'katex.min.js';
            sc.onload = ok; sc.onerror = ko; document.head.appendChild(sc);
        });
        return attente;
    }
    function rendu(el, texte) {
        el.textContent = '';
        var l = morceaux(texte);
        l.forEach(function (x) {
            if (x.t != null) { el.appendChild(document.createTextNode(x.t)); return; }
            var sp = document.createElement('span'); sp.className = 'maths-texte' + (x.bloc ? ' bloc' : '');
            if (G.katex) G.katex.render(x.m, sp, { throwOnError: false, displayMode: x.bloc });   // trust: false (défaut) : pas de \href, \html…
            else sp.textContent = '$' + x.m + '$';
            el.appendChild(sp);
        });
        if (!G.katex && l.some(function (x) { return x.m != null; })) {
            chargerKatex().then(function () { rendu(el, texte); }, function () {});
        }
        return el;
    }

    /* ---------- Barre de boutons + aperçu sous un champ de saisie ---------- */
    var BOUTONS = [
        ['$x$', 'Formule (entre deux $)', '$', '$'],
        ['a/b', 'Fraction', '\\frac{', '}{}'],
        ['x²', 'Puissance', '^{', '}'],
        ['xₙ', 'Indice', '_{', '}'],
        ['√', 'Racine carrée', '\\sqrt{', '}'],
        ['×', 'Multiplié par', '\\times ', ''],
        ['≤', 'Inférieur ou égal', '\\leq ', ''],
        ['≥', 'Supérieur ou égal', '\\geq ', ''],
        ['≠', 'Différent de', '\\neq ', ''],
        ['π', 'Pi', '\\pi ', ''],
        ['vect', 'Vecteur', '\\overrightarrow{', '}'],
        ['ℝ', 'Ensemble des réels', '\\mathbb{R}', '']
    ];
    var styleMis = false;
    function style() {
        if (styleMis) return; styleMis = true;
        var st = document.createElement('style');
        st.textContent =
            '.maths-barre { display: flex; flex-wrap: wrap; gap: 4px; margin: 0 0 4px; }' +
            '.maths-barre button { font: inherit; font-size: 0.85rem; min-width: 34px; padding: 2px 8px; border: 1px solid var(--line, #ccc); border-radius: 6px; background: var(--surface, #fff); color: var(--text, #222); cursor: pointer; }' +
            '.maths-barre button:hover, .maths-barre button:focus-visible { border-color: var(--muted, #888); outline: none; }' +
            '.maths-barre .aide-maths { font-size: 0.8rem; color: var(--muted, #777); align-self: center; margin-left: 4px; }' +
            '.maths-apercu { margin: 4px 0 0; padding: 6px 10px; border: 1px dashed var(--line, #ccc); border-radius: 8px; white-space: pre-wrap; overflow-wrap: anywhere; }' +
            '.maths-apercu::before { content: "Aperçu : "; color: var(--muted, #777); font-size: 0.85rem; }' +
            '.maths-texte.bloc { display: block; }';
        document.head.appendChild(st);
    }
    // zone : <textarea> ou <input> ; apercu : élément où montrer le rendu (créé sous la zone si absent, false = aucun)
    function barre(zone, apercu) {
        style();
        var b = document.createElement('div'); b.className = 'maths-barre';
        b.setAttribute('role', 'toolbar'); b.setAttribute('aria-label', 'Écrire des maths');
        BOUTONS.forEach(function (x) {
            var bt = document.createElement('button'); bt.type = 'button'; bt.textContent = x[0]; bt.title = x[1]; bt.setAttribute('aria-label', x[1]);
            bt.onmousedown = function (e) { e.preventDefault(); };   // garder la sélection dans le champ
            bt.onclick = function () { inserer(zone, x[2], x[3]); };
            b.appendChild(bt);
        });
        var a = document.createElement('span'); a.className = 'aide-maths'; a.textContent = 'maths entre $…$, ex. $\\frac{1}{2}$';
        b.appendChild(a);
        zone.parentNode.insertBefore(b, zone);
        if (apercu === false) return b;
        if (!apercu) { apercu = document.createElement('div'); zone.parentNode.insertBefore(apercu, zone.nextSibling); }
        apercu.classList.add('maths-apercu');
        function maj() { apercu.hidden = !aDesMaths(zone.value); if (!apercu.hidden) rendu(apercu, zone.value); }
        zone.addEventListener('input', maj); maj();
        b.maj = maj;
        return b;
    }
    function dansFormule(v, p) { return (v.slice(0, p).replace(/\\\$/g, '').match(/\$/g) || []).length % 2 === 1; }
    function inserer(zone, avant, apres) {
        var d = zone.selectionStart, f = zone.selectionEnd, v = zone.value, sel = v.slice(d, f);
        if (avant !== '$' && !dansFormule(v, d)) { avant = '$' + avant; apres = apres + '$'; }   // hors formule : on ouvre une formule
        if (avant[0] === '$' && v[d - 1] === '$') avant = ' ' + avant;   // pas de « $$ » collé (= formule centrée)
        var t = avant + sel + apres;
        if (zone.maxLength > 0 && v.length - sel.length + t.length > zone.maxLength) return;
        zone.focus();
        zone.setRangeText(t, d, f, 'end');
        // curseur : dans le premier groupe vide (le second pour une fraction dont le numérateur était sélectionné)
        var curseur = d + avant.length + sel.length + (sel && apres.indexOf('}{') === 0 ? 2 : 0);
        zone.setSelectionRange(curseur, curseur);
        zone.dispatchEvent(new Event('input', { bubbles: true }));
    }

    G.MathsTexte = { morceaux: morceaux, aDesMaths: aDesMaths, unicode: unicode, rendu: rendu, barre: barre, chargerKatex: chargerKatex };
})(typeof window !== 'undefined' ? window : self);
