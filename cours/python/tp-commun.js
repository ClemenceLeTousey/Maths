/* Moteur commun des corrigés interactifs des TP Python (TP2 et suivants), repris du TP1 :
   - un mini-Python qui exécute les scripts du TP « à la main » et produit l'exécution pas à pas
     (affectations, print, if / elif / else, for … in range, while, fonctions, // et %) ;
   - le vrai Python (Pyodide, dans un worker) pour les boutons « ▶ » ;
   - questions, réponses à vérifier, corrections détaillées, entraînement avec nouvelles valeurs.
   Chaque page définit ses exercices (EX) puis appelle demarrer({ EX, partie, att }). */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fr = x => String(x).replace('.', ',');          // écriture française d'un nombre
const pyc = s => `<code>${esc(s)}</code>`;
const S1 = '<span style="color:var(--star-green)">★</span><span style="color:#C5CCD3">☆☆</span>';
const S2 = '<span style="color:var(--star-blue)">★★</span><span style="color:#C5CCD3">☆</span>';
const S3 = '<span style="color:var(--star-red)">★★★</span>';

/* =====================================================================
   1. Valeurs Python : nombres { v, f } (f vrai pour un float), textes { s }, booléens { b }, None
   ===================================================================== */
const I = v => ({ v, f: false }), F = v => ({ v, f: true });
const STR = s => ({ s }), BOOL = b => ({ b }), NONE = { none: true };
const isNum = x => x && typeof x.v === 'number';
const isStr = x => x && typeof x.s === 'string';
const isBool = x => x && typeof x.b === 'boolean';
function floatStr(v) {
  if (!Number.isFinite(v)) return v > 0 ? 'inf' : v < 0 ? '-inf' : 'nan';
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e16 || a < 1e-4)) return v.toExponential().replace(/e([+-])(\d)$/, 'e$10$2');
  const s = String(v);
  return /[.e]/.test(s) ? s : s + '.0';
}
function repr(x) {
  if (isNum(x)) return x.f ? floatStr(x.v) : String(x.v);
  if (isStr(x)) return x.s.includes("'") && !x.s.includes('"') ? `"${x.s}"` : `'${x.s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (isBool(x)) return x.b ? 'True' : 'False';
  if (x && x.fn) return `<function ${x.fn.name}>`;
  return 'None';
}
const pyStr = x => (isStr(x) ? x.s : repr(x));      // ce qu'affiche print
function truthy(x) {
  if (isNum(x)) return x.v !== 0;
  if (isStr(x)) return x.s !== '';
  if (isBool(x)) return x.b;
  return false;
}
class PyErr extends Error { constructor(m, ln) { super(m); this.ln = ln; } }
const asNum = x => (isNum(x) ? x : isBool(x) ? I(x.b ? 1 : 0) : null);
const TYPE = x => (isNum(x) ? (x.f ? 'float' : 'int') : isStr(x) ? 'str' : isBool(x) ? 'bool' : 'NoneType');
function opPy(op, a, b) {
  if (isStr(a) || isStr(b)) {
    if (op === '+' && isStr(a) && isStr(b)) return STR(a.s + b.s);
    if (op === '*' && isStr(a) && isNum(b) && !b.f) return STR(a.s.repeat(Math.max(0, b.v)));
    throw new PyErr(`TypeError: unsupported operand type(s) for ${op}: '${TYPE(a)}' and '${TYPE(b)}'`);
  }
  const A = asNum(a), B = asNum(b);
  if (!A || !B) throw new PyErr(`TypeError: unsupported operand type(s) for ${op}: '${TYPE(a)}' and '${TYPE(b)}'`);
  const fl = A.f || B.f;
  switch (op) {
    case '+': return { v: A.v + B.v, f: fl };
    case '-': return { v: A.v - B.v, f: fl };
    case '*': return { v: A.v * B.v, f: fl };
    case '/': if (B.v === 0) throw new PyErr('ZeroDivisionError: division by zero'); return F(A.v / B.v);
    case '//': if (B.v === 0) throw new PyErr('ZeroDivisionError: integer division or modulo by zero'); return { v: Math.floor(A.v / B.v), f: fl };
    case '%': if (B.v === 0) throw new PyErr('ZeroDivisionError: integer modulo by zero'); return { v: A.v - B.v * Math.floor(A.v / B.v), f: fl };
    case '**': return !fl && B.v >= 0 ? I(A.v ** B.v) : F(A.v ** B.v);
  }
  throw new PyErr('opération inconnue');
}
function cmpPy(op, a, b) {
  if (op === '==' || op === '!=') {
    let eq;
    if (isStr(a) || isStr(b)) eq = isStr(a) && isStr(b) && a.s === b.s;
    else if (a.none || b.none) eq = !!(a.none && b.none);
    else eq = asNum(a).v === asNum(b).v;
    return op === '==' ? eq : !eq;
  }
  let x, y;
  if (isStr(a) && isStr(b)) { x = a.s; y = b.s; }
  else if (asNum(a) && asNum(b)) { x = asNum(a).v; y = asNum(b).v; }
  else throw new PyErr(`TypeError: '${op}' not supported between instances of '${TYPE(a)}' and '${TYPE(b)}'`);
  return op === '<' ? x < y : op === '>' ? x > y : op === '<=' ? x <= y : x >= y;
}

/* =====================================================================
   2. Analyse : expressions, puis lignes regroupées en blocs selon l'indentation
   ===================================================================== */
function toks(s) {
  const t = [], re = /\s*(?:(\d+\.\d*(?:[eE][-+]?\d+)?|\.\d+(?:[eE][-+]?\d+)?|\d+[eE][-+]?\d+|\d+)|([A-Za-z_]\w*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\*\*|\/\/|==|!=|<=|>=|[-+*/%<>(),=:]))/y;
  re.lastIndex = 0;
  while (re.lastIndex < s.length) {
    if (/^\s*$/.test(s.slice(re.lastIndex))) break;
    const at = re.lastIndex, m = re.exec(s);
    if (!m) throw new PyErr(`SyntaxError: invalid syntax (près de « ${s.slice(at).trim().slice(0, 12)} »)`);
    if (m[1]) t.push({ k: 'num', x: m[1] });
    else if (m[2]) t.push({ k: 'name', x: m[2] });
    else if (m[3]) t.push({ k: 'str', x: m[3].slice(1, -1).replace(/\\(.)/g, '$1') });
    else t.push({ k: 'op', x: m[4] });
  }
  return t;
}
const CMP = ['<', '>', '<=', '>=', '==', '!='];
function exprParser(s) {
  const t = toks(s); let i = 0;
  const isOp = x => t[i] && t[i].k === 'op' && t[i].x === x;
  const isKw = x => t[i] && t[i].k === 'name' && t[i].x === x;
  const eat = x => { if (!isOp(x)) throw new PyErr(`SyntaxError: « ${x} » attendu`); i++; };
  function expr() { return or(); }
  function or() { let n = and(); while (isKw('or')) { i++; n = { t: 'bool', op: 'or', a: n, b: and() }; } return n; }
  function and() { let n = not(); while (isKw('and')) { i++; n = { t: 'bool', op: 'and', a: n, b: not() }; } return n; }
  function not() { if (isKw('not')) { i++; return { t: 'not', a: not() }; } return cmp(); }
  function cmp() {
    const a = arith(), ops = [], rest = [];
    while (t[i] && t[i].k === 'op' && CMP.includes(t[i].x)) { ops.push(t[i++].x); rest.push(arith()); }
    return ops.length ? { t: 'cmp', a, ops, rest } : a;
  }
  function arith() { let n = term(); while (isOp('+') || isOp('-')) { const op = t[i++].x; n = { t: 'bin', op, a: n, b: term() }; } return n; }
  function term() { let n = unary(); while (isOp('*') || isOp('/') || isOp('//') || isOp('%')) { const op = t[i++].x; n = { t: 'bin', op, a: n, b: unary() }; } return n; }
  function unary() { if (isOp('-')) { i++; return { t: 'neg', a: unary() }; } if (isOp('+')) { i++; return unary(); } return power(); }
  function power() { const n = call(); if (isOp('**')) { i++; return { t: 'bin', op: '**', a: n, b: unary() }; } return n; }
  function call() {
    const n = atom();
    if (n.t === 'var' && isOp('(')) {
      i++; const args = [];
      if (!isOp(')')) { args.push(expr()); while (isOp(',')) { i++; args.push(expr()); } }
      eat(')');
      return { t: 'call', f: n.n, args };
    }
    return n;
  }
  function atom() {
    const x = t[i++];
    if (!x) throw new PyErr('SyntaxError: expression incomplète');
    if (x.k === 'op' && x.x === '(') { const e = expr(); eat(')'); return { t: 'par', e }; }
    if (x.k === 'num') return { t: 'num', x: /[.eE]/.test(x.x) ? F(parseFloat(x.x)) : I(parseInt(x.x, 10)) };
    if (x.k === 'str') return { t: 'lit', x: STR(x.x) };
    if (x.k === 'name') {
      if (x.x === 'True' || x.x === 'False') return { t: 'lit', x: BOOL(x.x === 'True') };
      if (x.x === 'None') return { t: 'lit', x: NONE };
      return { t: 'var', n: x.x };
    }
    throw new PyErr(`SyntaxError: « ${x.x} » inattendu`);
  }
  return {
    one() { const n = expr(); if (i < t.length) throw new PyErr(`SyntaxError: « ${t[i].x} » inattendu`); return n; },
    list() { const a = [expr()]; while (isOp(',')) { i++; a.push(expr()); } if (i < t.length) throw new PyErr(`SyntaxError: « ${t[i].x} » inattendu`); return a; },
  };
}
const parseExpr = s => exprParser(s).one();
const parseList = s => exprParser(s).list();
function stripComment(l) {        // enlève un commentaire # (hors des guillemets)
  let q = null;
  for (let k = 0; k < l.length; k++) {
    const c = l[k];
    if (q) { if (c === q) q = null; } else if (c === '"' || c === "'") q = c; else if (c === '#') return l.slice(0, k);
  }
  return l;
}
function parseProg(src) {
  const lines = [];
  src.split('\n').forEach((r, i) => { const s = stripComment(r).replace(/\s+$/, ''); if (s.trim()) lines.push({ i, ind: s.match(/^ */)[0].length, s: s.trim() }); });
  let p = 0;
  const at = (ln, f) => { try { return f(); } catch (e) { if (e instanceof PyErr && e.ln === undefined) e.ln = ln; throw e; } };
  function block(ind) {
    const out = [];
    while (p < lines.length && lines[p].ind === ind) out.push(stmt(ind));
    if (p < lines.length && lines[p].ind > ind) throw new PyErr('IndentationError: unexpected indent', lines[p].i);
    return out;
  }
  function body(ind, ln) {
    if (p >= lines.length || lines[p].ind <= ind) throw new PyErr('IndentationError: expected an indented block', ln);
    return block(lines[p].ind);
  }
  function stmt(ind) {
    const L = lines[p++], s = L.s; let m;
    return at(L.i, () => {
      if ((m = s.match(/^def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:$/))) return { k: 'def', ln: L.i, name: m[1], params: m[2].split(',').map(x => x.trim()).filter(Boolean), body: body(ind, L.i) };
      if ((m = s.match(/^if\s+(.+):$/))) {
        const node = { k: 'if', ln: L.i, br: [{ ln: L.i, src: m[1].trim(), cond: parseExpr(m[1]), body: body(ind, L.i) }], els: null };
        while (p < lines.length && lines[p].ind === ind && /^elif\b/.test(lines[p].s)) {
          const E = lines[p++], mm = E.s.match(/^elif\s+(.+):$/);
          if (!mm) throw new PyErr("SyntaxError: expected ':'", E.i);
          node.br.push({ ln: E.i, src: mm[1].trim(), cond: at(E.i, () => parseExpr(mm[1])), body: body(ind, E.i) });
        }
        if (p < lines.length && lines[p].ind === ind && /^else\b/.test(lines[p].s)) {
          const E = lines[p++];
          if (!/^else\s*:$/.test(E.s)) throw new PyErr("SyntaxError: expected ':'", E.i);
          node.els = { ln: E.i, body: body(ind, E.i) };
        }
        return node;
      }
      if ((m = s.match(/^for\s+([A-Za-z_]\w*)\s+in\s+range\((.*)\)\s*:$/))) return { k: 'for', ln: L.i, v: m[1], src: m[2].trim(), args: parseList(m[2]), body: body(ind, L.i) };
      if ((m = s.match(/^while\s+(.+):$/))) return { k: 'while', ln: L.i, src: m[1].trim(), cond: parseExpr(m[1]), body: body(ind, L.i) };
      if ((m = s.match(/^return(?:\s+(.*))?$/))) return { k: 'ret', ln: L.i, e: m[1] ? parseExpr(m[1]) : null };
      if ((m = s.match(/^print\((.*)\)$/))) return { k: 'print', ln: L.i, src: m[1].trim(), args: m[1].trim() ? parseList(m[1]) : [] };
      if (/^(elif|else)\b/.test(s)) throw new PyErr('SyntaxError: invalid syntax');
      if (/^(if|elif|else|for|while|def)\b/.test(s)) throw new PyErr("SyntaxError: expected ':'");
      if ((m = s.match(/^([A-Za-z_]\w*)\s*(\+|-|\*|\/\/|\/|%)=\s*(.+)$/))) return { k: 'set', ln: L.i, tg: [m[1]], es: [{ t: 'bin', op: m[2], a: { t: 'var', n: m[1] }, b: parseExpr(m[3]) }] };
      if ((m = s.match(/^([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)\s*=(?!=)\s*(.+)$/))) {
        const tg = m[1].split(',').map(x => x.trim()), es = parseList(m[2]);
        if (tg.length !== es.length) throw new PyErr(`ValueError: ${tg.length} variables mais ${es.length} valeurs`);
        return { k: 'set', ln: L.i, tg, es };
      }
      return { k: 'expr', ln: L.i, e: parseExpr(s) };
    });
  }
  return block(0);
}

/* =====================================================================
   3. Exécution « à la main », avec une étape par instruction exécutée
   ===================================================================== */
// Réécriture d'une expression en remplaçant les variables par leur valeur
function prSub(n, env) {
  switch (n.t) {
    case 'num': return repr(n.x);
    case 'lit': return repr(n.x);
    case 'var': if (env && n.n in env && !env[n.n].fn) { const r = repr(env[n.n]); return /^-/.test(r) ? `(${r})` : r; } return n.n;
    case 'par': return '(' + prSub(n.e, env) + ')';
    case 'neg': return '-' + prSub(n.a, env);
    case 'bin': return prSub(n.a, env) + ' ' + n.op + ' ' + prSub(n.b, env);
    case 'cmp': return [prSub(n.a, env)].concat(n.ops.map((o, k) => o + ' ' + prSub(n.rest[k], env))).join(' ');
    case 'bool': return prSub(n.a, env) + ' ' + n.op + ' ' + prSub(n.b, env);
    case 'not': return 'not ' + prSub(n.a, env);
    case 'call': return n.f + '(' + n.args.map(a => prSub(a, env)).join(', ') + ')';
  }
  return '?';
}
const simple = n => n.t === 'num' || n.t === 'lit';
function hasCall(n) {
  if (!n || typeof n !== 'object') return false;
  if (n.t === 'call') return true;
  return ['a', 'b', 'e'].some(k => hasCall(n[k])) || (n.rest || []).some(hasCall) || (n.args || []).some(hasCall);
}
const BUILTINS = {
  round(a) { const x = a[0], n = a[1] ? a[1].v : 0; if (!isNum(x)) throw new PyErr('TypeError: round()'); if (!a[1]) return I(Math.round(x.v)); return x.f ? F(parseFloat(x.v.toFixed(Math.max(0, n)))) : x; },
  abs(a) { return { v: Math.abs(a[0].v), f: a[0].f }; },
  int(a) { if (isStr(a[0])) { const v = parseInt(a[0].s, 10); if (!/^\s*-?\d+\s*$/.test(a[0].s)) throw new PyErr(`ValueError: invalid literal for int(): '${a[0].s}'`); return I(v); } return I(Math.trunc(asNum(a[0]).v)); },
  float(a) { return F(isStr(a[0]) ? parseFloat(a[0].s) : asNum(a[0]).v); },
  str(a) { return STR(pyStr(a[0])); },
  len(a) { if (!isStr(a[0])) throw new PyErr('TypeError: len()'); return I(a[0].s.length); },
  max(a) { return a.reduce((m, x) => (cmpPy('>', x, m) ? x : m)); },
  min(a) { return a.reduce((m, x) => (cmpPy('<', x, m) ? x : m)); },
};
/* runTraced(src, { call, quiet }) → { steps, out, ret }.
   Chaque étape : { line, x (explication), chg, env, order, fn, cons (lignes de console) } */
function runTraced(src, opts = {}) {
  const prog = parseProg(src);
  const glob = {}, out = [], steps = [], frames = [{ env: glob, order: [], name: null }];
  const MAX = opts.max || 4000;
  let tours = 0, callDone = false, ret;
  const cur = () => frames[frames.length - 1];
  const view = () => (frames.length > 1 ? Object.assign({}, glob, cur().env) : glob);
  const consLines = () => (opts.call ? ['>>> ' + opts.call].concat(out, callDone ? (ret && !ret.none ? [repr(ret)] : []) : []) : ['>>> # script executed'].concat(out));
  function snap(line, x, chg = []) {
    if (opts.quiet) return;
    if (steps.length > MAX) throw new PyErr('trop d’étapes');
    const f = cur();
    steps.push({ line, x, chg, env: { ...f.env }, order: f.order.slice(), fn: f.name, cons: consLines() });
  }
  function setVar(n, v) { const f = cur(); if (!(n in f.env)) f.order.push(n); f.env[n] = v; }
  function E(n) {
    switch (n.t) {
      case 'num': case 'lit': return n.x;
      case 'var': {
        const f = cur();
        if (n.n in f.env) return f.env[n.n];
        if (n.n in glob) return glob[n.n];
        throw new PyErr(`NameError: name '${n.n}' is not defined`);
      }
      case 'par': return E(n.e);
      case 'neg': { const a = E(n.a); const A = asNum(a); if (!A) throw new PyErr(`TypeError: bad operand type for unary -: '${TYPE(a)}'`); return { v: -A.v, f: A.f }; }
      case 'bin': return opPy(n.op, E(n.a), E(n.b));
      case 'cmp': {
        let a = E(n.a); const vals = [a]; let ok = true;
        for (let k = 0; k < n.ops.length; k++) { const b = E(n.rest[k]); vals.push(b); if (!cmpPy(n.ops[k], a, b)) { ok = false; break; } a = b; }
        n._vals = vals;
        return BOOL(ok);
      }
      case 'bool': { const a = E(n.a); if (n.op === 'and' ? !truthy(a) : truthy(a)) return a; return E(n.b); }
      case 'not': return BOOL(!truthy(E(n.a)));
      case 'call': return callFn(n.f, n.args.map(E));
    }
    throw new PyErr('expression non reconnue');
  }
  function callFn(name, args) {
    const g = glob[name];
    if (!g || !g.fn) {
      if (BUILTINS[name]) return BUILTINS[name](args);
      throw new PyErr(`NameError: name '${name}' is not defined`);
    }
    const d = g.fn;
    if (args.length !== d.params.length) throw new PyErr(`TypeError: ${name}() takes ${d.params.length} positional argument${d.params.length > 1 ? 's' : ''} but ${args.length} ${args.length > 1 ? 'were' : 'was'} given`);
    if (frames.length > 200) throw new PyErr('RecursionError: maximum recursion depth exceeded');
    frames.push({ env: {}, order: [], name });
    d.params.forEach((p, k) => setVar(p, args[k]));
    snap(d.ln, `Appel de <code>${name}(${args.map(a => esc(repr(a))).join(', ')})</code> : ${d.params.length ? d.params.map((p, k) => `<code>${p}</code> = ${esc(repr(args[k]))}`).join(', ') + ' (chaque paramètre reçoit la valeur donnée, dans l’ordre).' : 'pas de paramètre.'}`, d.params);
    const r = block(d.body);
    frames.pop();
    return r ? r.ret : NONE;
  }
  function condTxt(src, ast, ok) {
    let sub = prSub(ast, view());
    if (ast.t === 'cmp' && ast._vals && hasCall(ast)) sub = [repr(ast._vals[0])].concat(ast.ops.slice(0, ast._vals.length - 1).map((o, k) => o + ' ' + repr(ast._vals[k + 1]))).join(' ');
    const same = sub.replace(/\s+/g, '') === src.replace(/\s+/g, '');
    return `Test <code>${esc(src)}</code>${same ? '' : ` : <code>${esc(sub)}</code>`} est <b>${ok ? 'vrai' : 'faux'}</b>`;
  }
  function block(b) { for (const s of b) { const r = stmt(s); if (r) return r; } return null; }
  function stmt(s) {
    try { return run(s); } catch (e) { if (e instanceof PyErr && e.ln === undefined) e.ln = s.ln; throw e; }
  }
  function run(s) {
    switch (s.k) {
      case 'def': glob[s.name] = { fn: s }; return null;
      case 'set': {
        const old = { ...view() }, vals = s.es.map(E);
        s.tg.forEach((n, k) => setVar(n, vals[k]));
        const parts = s.tg.map((n, k) => {
          const a = s.es[k];
          const calc = simple(a) ? '' : a.t === 'var' ? `la valeur de <code>${a.n}</code>, c’est-à-dire ` : `<code>${esc(prSub(a, old))}</code> = `;
          const lost = n in old && !old[n].fn && repr(old[n]) !== repr(vals[k]) ? ` (l’ancienne valeur ${esc(repr(old[n]))} est effacée)` : '';
          return `<code>${n}</code> prend ${calc}<b>${esc(repr(vals[k]))}</b>${lost}`;
        });
        let x = parts.join(' et ') + '.';
        if (s.tg.length > 1) x = 'Affectation simultanée : Python calcule d’abord toutes les valeurs à droite du <code>=</code>, puis les range. ' + x;
        else if (!simple(s.es[0]) && JSON.stringify(s.es[0]).includes(`"n":"${s.tg[0]}"`)) x = `On calcule d’abord le membre de droite avec l’<em>ancienne</em> valeur de <code>${s.tg[0]}</code>, puis on range le résultat. ` + x;
        snap(s.ln, x, s.tg);
        return null;
      }
      case 'print': {
        const old = view(), vs = s.args.map(E), txt = vs.map(pyStr).join(' ');
        out.push(txt);
        const sub = s.args.length === 1 && !simple(s.args[0]) ? ` : avec les valeurs actuelles, <code>${esc(prSub(s.args[0], old))}</code> = <code>${esc(repr(vs[0]))}</code>` : '';
        snap(s.ln, `<code>print(${esc(s.src)})</code> affiche <b>${esc(txt)}</b>${sub}.`);
        return null;
      }
      case 'expr': E(s.e); return null;
      case 'ret': {
        const old = view(), v = s.e ? E(s.e) : NONE;
        const sub = s.e && !simple(s.e) && !(s.e.t === 'call') ? ` : <code>${esc(prSub(s.e, old))}</code> = <code>${esc(repr(v))}</code>` : '';
        snap(s.ln, `<code>return</code> : la fonction <code>${cur().name || '?'}</code> s’arrête et renvoie <b>${esc(repr(v))}</b>${sub}.`);
        return { ret: v };
      }
      case 'if': {
        for (let k = 0; k < s.br.length; k++) {
          const br = s.br[k], ok = truthy(E(br.cond));
          let suite;
          if (ok) suite = `Python exécute le bloc ${k ? 'de ce <code>elif</code>' : 'du <code>if</code>'}${s.br.length > 1 || s.els ? ' et ignore la suite des tests' : ''}.`;
          else if (k < s.br.length - 1) suite = 'on passe au test suivant (<code>elif</code>).';
          else if (s.els) suite = 'aucune condition n’est vraie : Python exécute le bloc du <code>else</code>.';
          else suite = 'le bloc est ignoré, Python passe à la suite.';
          snap(br.ln, condTxt(br.src, br.cond, ok) + ' : ' + suite);
          if (ok) return block(br.body);
        }
        return s.els ? block(s.els.body) : null;
      }
      case 'for': {
        const a = s.args.map(E).map(x => { if (!isNum(x) || x.f) throw new PyErr(`TypeError: '${TYPE(x)}' object cannot be interpreted as an integer`); return x.v; });
        const [d, f, p] = a.length === 1 ? [0, a[0], 1] : [a[0], a[1], a.length > 2 ? a[2] : 1];
        if (p === 0) throw new PyErr('ValueError: range() arg 3 must not be zero');
        const vals = [];
        for (let v = d; p > 0 ? v < f : v > f; v += p) { vals.push(v); if (vals.length > 100000) throw new PyErr('trop de tours'); }
        const liste = vals.length <= 8 ? vals.join(', ') : vals.slice(0, 4).join(', ') + ', …, ' + vals.slice(-2).join(', ');
        if (!vals.length) { snap(s.ln, `<code>range(${esc(s.src)})</code> ne contient aucune valeur : la boucle n’est pas exécutée.`); return null; }
        for (let k = 0; k < vals.length; k++) {
          setVar(s.v, I(vals[k]));
          snap(s.ln, `${k === 0 ? `<code>${s.v}</code> va prendre les valeurs de <code>range(${esc(s.src)})</code> : ${liste} (${vals.length} tour${vals.length > 1 ? 's' : ''}). ` : ''}Tour n°${k + 1} : <code>${s.v}</code> prend la valeur <b>${vals[k]}</b>.`, [s.v]);
          if (++tours > 200000) throw new PyErr('trop de tours');
          const r = block(s.body); if (r) return r;
        }
        snap(s.ln, `<code>${s.v}</code> a pris toutes les valeurs de <code>range(${esc(s.src)})</code> : la boucle est terminée, Python passe à la suite.`);
        return null;
      }
      case 'while': {
        for (let n = 0; ; n++) {
          const ok = truthy(E(s.cond));
          snap(s.ln, condTxt(s.src, s.cond, ok) + ' : ' + (ok ? `on fait ${n ? 'un tour de plus' : 'un premier tour'} (tour n°${n + 1}).` : `la boucle s’arrête${n ? ` après ${n} tour${n > 1 ? 's' : ''}` : ' sans faire aucun tour'}, Python passe à la suite.`));
          if (!ok) return null;
          if (++tours > 200000) throw new PyErr('boucle sans fin ?');
          const r = block(s.body); if (r) return r;
        }
      }
    }
    return null;
  }
  block(prog);
  if (opts.call) {
    ret = E(parseExpr(opts.call));
    callDone = true;
    snap(-1, `Dans la console, <code>${esc(opts.call)}</code> renvoie <b>${esc(repr(ret))}</b>.`);
  }
  return { steps, out, ret };
}
const sortie = src => runTraced(src, { quiet: true }).out;
const renvoie = (src, call) => repr(runTraced(src, { call, quiet: true }).ret);
const testsDe = (src, calls) => calls.map(c => [c, renvoie(src, c)]);

/* =====================================================================
   4. Coloration et encadrés Script / Console
   ===================================================================== */
const KW = new Set(['def', 'return', 'print', 'if', 'else', 'elif', 'for', 'while', 'in', 'range', 'import', 'from', 'and', 'or', 'not', 'True', 'False', 'None', 'round', 'abs', 'len', 'int', 'float', 'str']);
function hl(line) {
  let h = '', m; const re = /(#.*$)|('[^']*'|"[^"]*")|([A-Za-z_]\w*)|(\d+\.?\d*)|(\*\*|\/\/|[-+*/=<>%:!])|(\s+)|(.)/g;
  while ((m = re.exec(line))) {
    if (m[1]) h += `<span class="c">${esc(m[1])}</span>`;
    else if (m[2]) h += `<span class="s">${esc(m[2])}</span>`;
    else if (m[3]) h += KW.has(m[3]) ? `<span class="k">${m[3]}</span>` : m[3];
    else if (m[4]) h += m[4];
    else if (m[5]) h += `<span class="o">${esc(m[5])}</span>`;
    else h += esc(m[0]);
  }
  return h;
}
// Script : opts.cur = ligne courante, opts.marks = {n° de ligne: classe}, opts.raw = HTML imposé par ligne
function scriptHTML(src, opts = {}) {
  const ls = src.replace(/\n$/, '').split('\n');
  return `<div class="code"><span class="tab">${opts.tab || 'Script'}</span><pre>${ls.map((l, i) => {
    let c = 'l'; if (opts.cur === i) c += ' cur';
    if (opts.marks && opts.marks[i]) c += ' ' + opts.marks[i];
    return `<span class="${c}" data-n="${i + 1}">${opts.raw && opts.raw[i] !== undefined ? opts.raw[i] : hl(l)}</span>`;
  }).join('')}</pre></div>`;
}
// Console : lignes « >>> ... » colorées, sorties en blanc, « ! » en tête = erreur
function consoleHTML(lines, tab = 'Console') {
  return `<div class="code console"><span class="tab">${tab}</span><pre>${lines.map(l => {
    if (l.startsWith('>>>')) return `<span class="l"><span class="o">&gt;&gt;&gt;</span> ${hl(l.slice(4))}</span>`;
    if (l.startsWith('!')) return `<span class="l err">${esc(l.slice(1))}</span>`;
    return `<span class="l out">${esc(l)}</span>`;
  }).join('')}</pre></div>`;
}
/* Exécution pas à pas : une étape « trace » par instruction (script, variables, console).
   Une boucle longue est abrégée : on garde le début et la fin. */
function traceSteps(src, opts = {}) {
  const t = runTraced(src, opts);
  let st = t.steps, saut = 0;
  const A = 28, B = 8;
  if (st.length > A + B + 4) { saut = st.length - A - B; st = st.slice(0, A).concat(st.slice(-B)); }
  return { out: t.out, ret: t.ret, steps: st.map((s, k) => {
    const names = s.order.filter(n => !(s.env[n] && s.env[n].fn));
    const tab = names.length ? `<table class="vars"><caption>${s.fn ? `Variables de la fonction <code>${s.fn}</code>` : 'Variables'}</caption><tr>${names.map(n => `<th>${n}</th>`).join('')}</tr><tr>${names.map(n => `<td class="${s.chg.includes(n) ? 'chg' : ''}">${esc(repr(s.env[n]))}</td>`).join('')}</tr></table>` : '';
    let c = s.cons;
    if (c.length > 13) c = [c[0], '…'].concat(c.slice(-11));
    const showCons = opts.call || s.cons.length > 1;
    const pre = saut && k === A ? `<em>(… ${saut} étapes sautées : les tours suivants se déroulent de la même façon.)</em><br>` : '';
    return { replace: true, h: `<div class="trace"><div>${scriptHTML(src, { cur: s.line })}</div><div>${tab}${showCons ? consoleHTML(c) : ''}</div></div>`, x: pre + s.x };
  }) };
}

/* =====================================================================
   5. Le vrai Python (Pyodide dans un worker, chargé au premier clic)
   ===================================================================== */
const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/';
const PY_AIDE = String.raw`
import sys, io, traceback
def __fmt(e):
    if isinstance(e, SyntaxError):
        return ''.join(traceback.format_exception_only(type(e), e)).rstrip()
    tb = [f for f in traceback.extract_tb(e.__traceback__) if f.filename.startswith('<')]
    t = 'Traceback (most recent call last):\n' + ''.join(traceback.format_list(tb)) + ''.join(traceback.format_exception_only(type(e), e))
    return t.rstrip()
def __run(src, cmds):
    ns = {'__name__': '__main__'}
    vieux = sys.stdout
    buf = io.StringIO(); sys.stdout = buf
    res = {'out': '', 'err': None, 'cmds': []}
    try:
        try:
            exec(compile(src, '<script>', 'exec'), ns)
        except BaseException as e:
            res['err'] = __fmt(e)
        res['out'] = buf.getvalue()
        for c in cmds:
            buf = io.StringIO(); sys.stdout = buf
            r = {'cmd': c, 'val': None, 'err': None}
            try:
                try:
                    code = compile(c, '<console>', 'eval')
                    v = eval(code, ns)
                    if v is not None:
                        r['val'] = repr(v)
                except SyntaxError:
                    exec(compile(c, '<console>', 'exec'), ns)
            except BaseException as e:
                r['err'] = __fmt(e)
            r['out'] = buf.getvalue()
            res['cmds'].append(r)
    finally:
        sys.stdout = vieux
    return res
`;
const WORKER_SRC = `importScripts(${JSON.stringify(PYODIDE + 'pyodide.js')});
var pret = loadPyodide({ indexURL: ${JSON.stringify(PYODIDE)} }).then(function (p) { p.runPython(${JSON.stringify(PY_AIDE)}); postMessage({ type: 'pret' }); return p; },
  function (e) { postMessage({ type: 'echec', t: String(e) }); });
onmessage = async function (e) {
  var p = await pret;
  p.globals.set('__src', e.data.src); p.globals.set('__cmds', p.toPy(e.data.cmds));
  var r = p.runPython('__run(__src, __cmds)');
  var o = r.toJs({ dict_converter: Object.fromEntries }); r.destroy();
  postMessage({ type: 'res', id: e.data.id, r: o });
};`;
const Py = (() => {
  const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
  let w = null, ready = null, n = 0;
  const wait = new Map();
  function start() {
    w = new Worker(url);
    ready = new Promise((ok, ko) => {
      w.onmessage = e => {
        const d = e.data;
        if (d.type === 'pret') ok();
        else if (d.type === 'echec') ko(new Error(d.t));
        else if (d.type === 'res' && wait.has(d.id)) { wait.get(d.id)(d.r); wait.delete(d.id); }
      };
    });
  }
  async function run(src, cmds = [], onState) {
    if (!w) start();
    let loaded = false;
    const t = setTimeout(() => { if (!loaded && onState) onState('Chargement de Python… (quelques secondes la première fois)'); }, 150);
    try { await ready; } finally { loaded = true; clearTimeout(t); }
    if (onState) onState('');
    const id = ++n;
    return new Promise((ok, ko) => {
      const lim = setTimeout(() => { wait.delete(id); w.terminate(); w = null; ko(new Error('Le programme met trop de temps (boucle sans fin ?). Python a été relancé.')); }, 6000);
      wait.set(id, r => { clearTimeout(lim); ok(r); });
      w.postMessage({ id, src, cmds });
    });
  }
  return { run };
})();
function consoleLines(r) {
  const L = [];
  if (r.out) r.out.replace(/\n$/, '').split('\n').forEach(x => L.push(x));
  if (r.err) r.err.split('\n').forEach(x => L.push('!' + x));
  r.cmds.forEach(c => {
    L.push('>>> ' + c.cmd);
    if (c.out) c.out.replace(/\n$/, '').split('\n').forEach(x => L.push(x));
    if (c.val !== null && c.val !== undefined) L.push(c.val);
    if (c.err) c.err.split('\n').forEach(x => L.push('!' + x));
  });
  return L;
}
function sameNum(a, b) {
  const x = parseFloat(a), y = parseFloat(b);
  return /^-?[\d.]+(e[-+]?\d+)?$/i.test(String(a).trim()) && Number.isFinite(x) && Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y));
}

/* Encadré « exécutable » : script (fixe ou modifiable) + commandes de console + tests éventuels.
   o = { src, cmds:[], edit:bool, tests:[[appel, attendu]], label } */
let boxId = 0;
const RUNBOX = {};
function runBoxHTML(o) {
  const id = 'rb' + (++boxId);
  o.id = id; RUNBOX[id] = o;
  const script = o.edit
    ? `<div class="code"><span class="tab">Script (modifiable)</span><textarea spellcheck="false" autocapitalize="off" autocomplete="off" rows="${Math.max(3, o.src.split('\n').length + 1)}">${esc(o.src)}</textarea></div>`
    : (o.src.trim() ? scriptHTML(o.src) : '');
  return `<div class="runbox" data-rb="${id}">
    ${script}
    <div class="runbar"><button type="button" class="btn sm run" data-run>▶ ${o.label || (o.tests ? 'Exécuter et tester' : 'Exécuter dans Python')}</button>${o.edit ? '<button type="button" class="btn ghost sm" data-reinit>Revenir au script de départ</button>' : ''}<span class="pystat"></span></div>
    <div class="sortie"></div>
  </div>`;
}
function wireRunBoxes(root) {
  $$('.runbox', root).forEach(el => {
    if (el.dataset.wired) return; el.dataset.wired = 1;
    const o = RUNBOX[el.dataset.rb], ta = $('textarea', el), stat = $('.pystat', el), sortieEl = $('.sortie', el), b = $('[data-run]', el);
    if (ta) {
      ta.addEventListener('keydown', e => {
        if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); document.execCommand('insertText', false, '    '); }
        if (e.key === 'Enter') {          // garde le décalage, et l'augmente après « : »
          const deb = ta.value.lastIndexOf('\n', ta.selectionStart - 1) + 1, ligne = ta.value.slice(deb, ta.selectionStart);
          const ind = ligne.match(/^\s*/)[0] + (/:\s*$/.test(ligne) ? '    ' : '');
          e.preventDefault(); document.execCommand('insertText', false, '\n' + ind);
        }
      });
      $('[data-reinit]', el).addEventListener('click', () => { ta.value = o.src; sortieEl.innerHTML = ''; });
    }
    b.addEventListener('click', async () => {
      const src = ta ? ta.value : o.src;
      const cmds = (o.cmds || []).concat((o.tests || []).map(t => t[0]));
      b.disabled = true; stat.textContent = '';
      try {
        const r = await Py.run(src, cmds, s => { stat.textContent = s; });
        const shown = { ...r, cmds: r.cmds.slice(0, (o.cmds || []).length) };
        let h = '';
        const lines = consoleLines(shown);
        r.cmds.slice((o.cmds || []).length).forEach(c => { lines.push('>>> ' + c.cmd); if (c.out) c.out.replace(/\n$/, '').split('\n').forEach(x => lines.push(x)); if (c.val !== null && c.val !== undefined) lines.push(c.val); if (c.err) c.err.split('\n').forEach(x => lines.push('!' + x)); });
        lines.unshift('>>> # script executed');
        h += consoleHTML(lines.length > 60 ? lines.slice(0, 60).concat(['… (' + (lines.length - 60) + ' lignes de plus)']) : lines);
        if (o.tests) {
          const tr = r.cmds.slice((o.cmds || []).length);
          const ok = tr.map((c, k) => c.val !== null && c.val !== undefined && (c.val === o.tests[k][1] || sameNum(c.val, o.tests[k][1])));
          h += `<div class="tests">${tr.map((c, k) => `<div class="${ok[k] ? 'ok' : 'ko'}"><code>${esc(c.cmd)}</code> ${ok[k] ? `renvoie bien <code>${esc(c.val)}</code> ✓` : (c.err ? `provoque une erreur ✗ (attendu : <code>${esc(o.tests[k][1])}</code>)` : `renvoie <code>${esc(String(c.val))}</code> ✗ (attendu : <code>${esc(o.tests[k][1])}</code>)`)}</div>`).join('')}</div>`;
          if (ok.every(Boolean)) h += `<div class="fb ok" style="margin-top:6px">✓ Bravo, ta fonction passe tous les tests !</div>`;
          else if (r.err) h += `<div class="fb ko" style="margin-top:6px">Le script contient une erreur : lis le message en rouge (numéro de <b>ligne</b> et <b>type</b> d’erreur), corrige, puis relance.</div>`;
        }
        sortieEl.innerHTML = h;
      } catch (e) {
        sortieEl.innerHTML = `<div class="fb ko">${esc(e.message)}</div>`;
      } finally { b.disabled = false; stat.textContent = ''; }
    });
  });
}

/* =====================================================================
   6. Questions : { l, q, fig, res, steps:[{h, x, m}], concl, piege, run, ans }
   ans = { fields:[{lab, want, kind}], aide } pour l'entraînement.
   kind : 'py' (ce qu'affiche Python), 'num' (nombre, virgule acceptée), 'txt' (liste de réponses),
          'seq' (plusieurs valeurs à la suite), 'set' (solutions dans n'importe quel ordre)
   ===================================================================== */
function typeset(el) {
  if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([el]).catch(() => {});
  else setTimeout(() => typeset(el), 200);
}
function answerHTML(it) {
  return `<div class="answer">
    <div class="ab">${it.ans.fields.map((f, k) => `<label><span>${f.lab}</span><input type="text" data-f="${k}" autocomplete="off" autocapitalize="off" spellcheck="false"></label>`).join('')}</div>
    <div class="ans-btns"><button type="button" class="btn solid sm" data-check>Vérifier</button><button type="button" class="btn ghost sm" data-raw>Réponse brute</button></div>
    <div class="fb" hidden></div>
  </div>`;
}
function itemHTML(it, id, ans) {
  return `<div class="item" data-id="${id}">
    <div class="row"><span class="q">${it.l ? `<b>${it.l}</b> ` : ''}${it.q}</span>${it.steps && it.steps.length ? '<button type="button" class="btn sm" data-open>Correction détaillée</button>' : ''}</div>
    ${it.fig || ''}
    ${ans && it.ans ? answerHTML(it) : ''}
    <div class="resline">Réponse : <span class="res">${it.res}</span></div>
    <div class="corr" hidden><ol class="steps"></ol>
      <div class="step-ctrl"><button type="button" class="btn solid sm" data-next>Étape suivante</button><button type="button" class="btn ghost sm" data-all>Tout afficher</button><button type="button" class="btn ghost sm" data-reset hidden>Recommencer</button></div>
      <div class="end" hidden><div class="concl">${it.concl || 'Réponse : ' + it.res}</div>${it.piege ? `<div class="piege" style="margin-top:8px"><b>Erreur à éviter :</b> ${it.piege}</div>` : ''}</div>
    </div>
    ${it.run ? runBoxHTML(it.run) : ''}
  </div>`;
}
const unq = s => s.trim().replace(/^(['"])(.*)\1$/, '$2');
function checkField(f, s) {
  s = s.trim();
  if (!s) return ['vide'];
  if (f.kind === 'txt') {
    const n = x => x.toLowerCase().replace(/\s+/g, '').replace(',', '.');
    return [[].concat(f.want).map(n).includes(n(s)) ? 'ok' : 'ko'];
  }
  if (f.kind === 'num') return [sameNum(s.replace(',', '.').replace(/\s/g, ''), String(f.want)) ? 'ok' : 'ko'];
  if (f.kind === 'set') {
    const want = [].concat(f.want).map(Number).sort((a, b) => a - b);
    if (!want.length) return [/^(aucun|aucune|pas de|rien|∅)/i.test(s) ? 'ok' : 'ko'];
    const got = s.split(/\s*(?:;|\bet\b|\bou\b)\s*/).filter(Boolean).map(x => parseFloat(x.replace(',', '.').replace(/^x\s*=\s*/, ''))).sort((a, b) => a - b);
    return [got.length === want.length && got.every((x, k) => Math.abs(x - want[k]) < 1e-9) ? 'ok' : 'ko'];
  }
  if (f.kind === 'seq') {
    const got = s.split(/[\s,;]+/).filter(Boolean).map(unq), want = f.want;
    if (got.length !== want.length) return ['ko', `Python affiche ${want.length} ligne${want.length > 1 ? 's' : ''} ; tu en as écrit ${got.length}.`];
    return [got.every((x, k) => x === want[k] || sameNum(x, want[k])) ? 'ok' : 'ko'];
  }
  const w = String(f.want);
  if (/^['"]/.test(w)) {               // valeur texte : Python l'affiche entre guillemets dans la console
    if (s === w) return ['ok'];
    if (unq(s) === unq(w)) return ['ok', /^['"]/.test(s) ? '' : `(dans la console, Python l’affiche entre guillemets : <code>${esc(w)}</code>, car c’est du texte.)`];
    return ['ko'];
  }
  if (s === w) return ['ok'];
  if (s.replace(',', '.') === w || (s.includes(',') && sameNum(s.replace(',', '.'), w))) return ['warn', `Valeur juste, mais Python écrit les nombres à virgule avec un <b>point</b> : <code>${esc(w)}</code>.`];
  if (sameNum(s, w)) {
    if (/\.0$/.test(w) && !s.includes('.')) return ['warn', `Valeur juste, mais c’est un <em>float</em> : Python affiche <code>${esc(w)}</code> (avec <code>.0</code>).`];
    if (!w.includes('.') && s.includes('.')) return ['warn', `Valeur juste, mais c’est un entier : Python affiche <code>${esc(w)}</code> (sans <code>.0</code>).`];
    return ['ok', `Python affiche exactement <code>${esc(w)}</code> (petite erreur d’arrondi des nombres à virgule en machine).`];
  }
  return ['ko'];
}
function wireAnswer(el, it) {
  const box = $('.answer', el), fb = $('.fb', box), bRaw = $('[data-raw]', box);
  const say = (k, h) => { fb.hidden = false; fb.className = 'fb ' + k; fb.innerHTML = h; typeset(fb); el.classList.toggle('good', k === 'ok'); };
  bRaw.addEventListener('click', () => { const on = el.classList.toggle('raw'); bRaw.textContent = on ? 'Masquer la réponse' : 'Réponse brute'; });
  const go = () => {
    const ins = $$('input', box), rs = it.ans.fields.map((f, k) => checkField(f, ins[k].value));
    if (rs.some(r => r[0] === 'vide')) return say('ko', 'Complète toutes les cases.');
    const notes = rs.filter(r => r[1]).map(r => r[1]);
    if (rs.every(r => r[0] === 'ok')) return say('ok', '✓ Bravo, c’est juste !' + (notes.length ? ' ' + notes.join(' ') : ''));
    if (rs.every(r => r[0] !== 'ko')) return say('warn', notes.join(' '));
    const faux = rs.map((r, k) => r[0] === 'ko' ? it.ans.fields[k].lab : null).filter(Boolean);
    say('ko', `✗ Pas encore : ${it.ans.fields.length > 1 ? 'regarde ' + faux.map(x => `« ${x} »`).join(', ') : 'ce n’est pas le bon résultat'}. ${notes.join(' ')} ${it.ans.aide || 'Exécute le programme ligne par ligne sur ton cahier, ou ouvre la correction détaillée.'}`);
  };
  $('[data-check]', box).addEventListener('click', go);
  $$('input', box).forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') go(); }));
}
function stepHTML(st, k) {
  let inner = '';
  if (st.h) inner += `<div class="h">${st.h}</div>`;
  if (st.m) inner += `<div class="m">\\[${st.m}\\]</div>`;
  if (st.x) inner += `<div class="x">${st.x}</div>`;
  return `<span class="n">${k}</span><div>${inner}</div>`;
}
function wireItem(el, it) {
  if ($('.answer', el)) wireAnswer(el, it);
  if (!it.steps || !it.steps.length) return;
  const corr = $('.corr', el), ol = $('.steps', corr), end = $('.end', corr);
  const bN = $('[data-next]', corr), bA = $('[data-all]', corr), bR = $('[data-reset]', corr);
  let k = 0;
  // une étape « trace » remplace la précédente (exécution pas à pas), les autres s'ajoutent
  const add = () => {
    const st = it.steps[k];
    if (st.replace && ol.lastElementChild && ol.lastElementChild.dataset.replace) ol.lastElementChild.remove();
    const li = document.createElement('li'); li.className = 'step'; if (st.replace) li.dataset.replace = 1;
    li.innerHTML = stepHTML(st, k + 1); k++; ol.appendChild(li); wireRunBoxes(li); typeset(li);
  };
  const sync = () => { const fin = k >= it.steps.length; bN.hidden = fin; bA.hidden = fin; bR.hidden = !fin; end.hidden = !fin; if (fin) typeset(end); };
  $('[data-open]', el).addEventListener('click', e => {
    const open = corr.hidden;
    corr.hidden = !open; el.classList.toggle('open', open);
    e.currentTarget.textContent = open ? 'Masquer la correction' : 'Correction détaillée';
    if (open && k === 0) { add(); sync(); }
  });
  bN.addEventListener('click', () => { add(); sync(); });
  bA.addEventListener('click', () => { while (k < it.steps.length) add(); sync(); });
  bR.addEventListener('click', () => { ol.innerHTML = ''; k = 0; add(); sync(); });
}

/* ---------- Fabriques de questions ---------- */
// « Qu'affiche ce script ? » (exécution pas à pas)
function itScript(l, src, ans, extra = {}) {
  const t = traceSteps(src);
  const outs = t.out;
  return Object.assign({ l, q: '', fig: scriptHTML(src), res: outs.length ? outs.map(pyc).join(' puis ') : 'rien',
    steps: t.steps, concl: outs.length ? `Python affiche ${outs.map(x => `<b>${esc(x)}</b>`).join(' puis ')}.` : 'Python n’affiche rien.',
    run: { src, cmds: [], label: 'Vérifier dans Python' },
    ans: ans ? { fields: outs.length <= 3 ? outs.map((w, k) => ({ lab: outs.length > 1 ? `Ligne ${k + 1} affichée` : 'Python affiche', want: w, kind: 'py' })) : [{ lab: 'Python affiche', want: outs, kind: 'seq' }],
      aide: outs.length > 3 ? 'Écris les valeurs affichées dans l’ordre, séparées par des espaces (point pour les nombres à virgule). ' : 'Exécute le script ligne par ligne sur ton cahier, en notant la valeur de chaque variable, ou ouvre la correction détaillée.' } : null }, extra);
}
// « f(…) renvoie ? » (exécution pas à pas de l'appel)
function itCall(l, src, call, ans, extra = {}) {
  const t = traceSteps(src, { call });
  const w = repr(t.ret);
  return Object.assign({ l, q: `${pyc(call)} renvoie ?`, res: pyc(w), steps: t.steps, concl: `${pyc(call)} renvoie ${pyc(w)}.`,
    run: { src, cmds: [call], label: 'Vérifier dans Python' },
    ans: ans ? { fields: [{ lab: 'renvoie', want: w, kind: 'py' }] } : null }, extra);
}
// Fonction à écrire : script modifiable + tests calculés avec la solution
function itFn(l, q, depart, sol, appels, extra = {}) {
  return Object.assign({ l, q, fig: runBoxHTML({ src: depart, edit: true, tests: testsDe(sol, appels) }),
    res: `<pre style="margin:0;font-family:var(--f-mono);font-size:14px">${esc(sol)}</pre>`,
    steps: [{ h: scriptHTML(sol, { tab: 'Une solution' }) }] }, extra);
}

/* =====================================================================
   7. Affichage d'un exercice
   ===================================================================== */
function demarrer(cfg) {
  const EX = cfg.EX, app = $('#app'), nav = $('#exnav');
  const sheet = {};
  let train = 0;
  function itemsBlock(set, pre, ans) {
    let h = `<div class="items">${set.main.map((it, i) => itemHTML(it, `${pre}m${i}`, ans)).join('')}</div>`;
    if (set.more) h += `<h2 class="part">Questions</h2><div class="items">${set.more.map((it, i) => itemHTML(it, `${pre}p${i}`, ans)).join('')}</div>`;
    return h;
  }
  function wireBlock(root, set, pre) {
    set.main.forEach((it, i) => wireItem($(`[data-id="${pre}m${i}"]`, root), it));
    (set.more || []).forEach((it, i) => wireItem($(`[data-id="${pre}p${i}"]`, root), it));
    wireRunBoxes(root);
  }
  function render(n) {
    const ex = EX.find(e => e.n === n) || EX[0];
    nav.querySelectorAll('button').forEach(b => b.classList.toggle('on', +b.dataset.n === ex.n));
    const set = sheet[ex.n] || (sheet[ex.n] = ex.build(false));
    app.innerHTML = `
      <p class="obj"><b>${cfg.partie}</b> ${cfg.partieTitre}</p>
      <article class="exo">
        <div class="exo-h"><span class="pill">Exercice ${ex.n}</span><span class="stars">${ex.stars}</span><span class="titre-ex">${ex.titre}</span><span class="comp">${ex.comp}</span></div>
        <div class="exo-b">
          <div class="consigne">${ex.consigne}</div>
          <div class="tools">
            <button type="button" class="btn" data-rappel>Rappel</button>
            <button type="button" class="btn ghost" data-res>Réponses seules</button>
            <button type="button" class="btn green" data-train>↻ Nouvelles valeurs pour s’entraîner</button>
          </div>
          <div class="rappel" hidden>${ex.rappel.map(b => `<div><h3>${b.t}</h3>${b.h}</div>`).join('')}<div class="att"><h3>Règles d’or</h3>${cfg.att}</div></div>
          <div class="sheet"><h2 class="part">Corrigé du TP <small>« Correction détaillée » pour suivre étape par étape, « ▶ » pour exécuter le vrai Python</small></h2>${itemsBlock(set, 's')}</div>
          <div class="train" hidden></div>
        </div>
      </article>
      <nav class="foot">${ex.n > 1 ? `<button type="button" class="btn ghost" data-go="${ex.n - 1}">← Exercice ${ex.n - 1}</button>` : '<span></span>'}${ex.n < EX.length ? `<button type="button" class="btn ghost" data-go="${ex.n + 1}">Exercice ${ex.n + 1} →</button>` : ''}</nav>`;
    wireBlock($('.sheet', app), set, 's');
    wireRunBoxes($('.consigne', app));
    const rap = $('.rappel', app), bRap = $('[data-rappel]', app);
    bRap.addEventListener('click', () => { rap.hidden = !rap.hidden; bRap.classList.toggle('on', !rap.hidden); if (!rap.hidden) typeset(rap); });
    const bRes = $('[data-res]', app), body = $('.exo-b', app);
    bRes.addEventListener('click', () => { body.classList.toggle('showres'); bRes.classList.toggle('on'); });
    const tr = $('.train', app);
    $('[data-train]', app).addEventListener('click', () => {
      const fresh = ex.build(true), pre = `t${++train}`;
      tr.hidden = false;
      tr.innerHTML = `<h2 class="part">Entraînement : nouvelles valeurs <small>cherche d’abord sur ton cahier, écris ta réponse, puis vérifie</small></h2>
        <p class="aide">Écris ce que Python affiche ou renvoie, exactement comme lui : un point pour les nombres à virgule, et <code>.0</code> quand c’est un <em>float</em> (par exemple <code>7.0</code>). Le bouton « ▶ » vérifie dans le vrai Python.</p>${itemsBlock(fresh, pre, true)}`;
      wireBlock(tr, fresh, pre);
      typeset(tr);
      tr.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    app.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { location.hash = 'ex' + b.dataset.go; }));
    typeset(app);
    window.scrollTo(0, 0);
  }
  nav.innerHTML = EX.map(e => `<button type="button" data-n="${e.n}">Exercice ${e.n}</button>`).join('');
  nav.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { location.hash = 'ex' + b.dataset.n; }));
  const route = () => render(+(location.hash.match(/^#ex(\d+)$/) || [])[1] || 1);
  window.addEventListener('hashchange', route);
  route();
}
