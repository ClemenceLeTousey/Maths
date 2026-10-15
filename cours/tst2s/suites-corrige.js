/* Corrigés interactifs TST2S - Séquence 2 (Suites) : feuilles 4 et 5.
   - chaque question : « Voir la correction » (tout d'un coup) ou « Pas à pas » (une étape à la fois) ;
   - quiz à boutons (.quiz[data-rep]) ;
   - schémas « de proche en proche » (.schema[data-…]) ;
   - explorateur de termes (.explore[data-…]) : tableau + nuage de points + curseur. */
'use strict';

window.MathJax = {
  tex: { inlineMath: [['\\(', '\\)']], displayMath: [['\\[', '\\]']], packages: { '[+]': ['color'] } },
  svg: { fontCache: 'global' },
  startup: { typeset: true }
};

const fr = (x, dec = 2) => {
  const r = Math.round(x * 10 ** dec) / 10 ** dec;
  return r.toLocaleString('fr-FR', { maximumFractionDigits: dec }).replace(/ /g, ' ');
};
function typeset(el) {
  if (window.MathJax && MathJax.startup && MathJax.startup.promise) {
    MathJax.startup.promise.then(() => MathJax.typesetPromise([el])).catch(() => {});
  }
}

/* ---------- Questions : correction en un clic ou pas à pas ---------- */
function initQuestions() {
  document.querySelectorAll('.q').forEach(q => {
    const sol = q.querySelector(':scope > .sol');
    if (!sol) return;
    const steps = [...sol.children];
    steps.forEach(s => s.classList.add('st'));
    sol.hidden = true;
    const btns = document.createElement('div');
    btns.className = 'q-btns';
    const voir = document.createElement('button');
    voir.type = 'button'; voir.className = 'btn solid sm'; voir.textContent = 'Voir la correction';
    btns.append(voir);
    let pas = null;
    if (steps.length > 1) {
      pas = document.createElement('button');
      pas.type = 'button'; pas.className = 'btn sm'; pas.textContent = 'Pas à pas';
      btns.append(pas);
    }
    sol.before(btns);

    let shown = 0;   // nombre d'étapes visibles en mode pas à pas
    const ouvrir = tout => {
      sol.hidden = false; q.classList.add('vu');
      if (tout) { shown = steps.length; steps.forEach(s => s.classList.remove('cache')); }
      voir.textContent = 'Masquer';
    };
    const fermer = () => {
      sol.hidden = true; q.classList.remove('vu'); shown = 0;
      voir.textContent = 'Voir la correction';
      if (pas) { pas.disabled = false; pas.textContent = 'Pas à pas'; }
    };
    q._ouvrir = ouvrir; q._fermer = fermer;
    voir.addEventListener('click', () => (sol.hidden ? (ouvrir(true), pas && (pas.disabled = true)) : fermer()));
    if (pas) pas.addEventListener('click', () => {
      if (sol.hidden) { steps.forEach(s => s.classList.add('cache')); shown = 0; ouvrir(false); }
      steps[shown].classList.remove('cache'); shown++;
      pas.textContent = 'Étape suivante (' + shown + '/' + steps.length + ')';
      if (shown >= steps.length) { pas.disabled = true; pas.textContent = 'Terminé'; }
    });
  });

  const tout = document.getElementById('tout');
  if (tout) {
    let ouvert = false;
    tout.addEventListener('click', () => {
      ouvert = !ouvert;
      document.querySelectorAll('.q').forEach(q => q._ouvrir && (ouvert ? q._ouvrir(true) : q._fermer()));
      document.querySelectorAll('.q .q-btns .btn:not(.solid)').forEach(b => { b.disabled = ouvert; });
      tout.textContent = ouvert ? 'Tout masquer' : 'Tout afficher';
    });
  }
}

/* ---------- Quiz : <div class="quiz" data-rep="Arithmétique" data-fb="…"><button>…</button>… ---------- */
function initQuiz() {
  document.querySelectorAll('.quiz').forEach(z => {
    const rep = z.dataset.rep;
    const fb = document.createElement('span'); fb.className = 'fb';
    z.append(fb);
    z.querySelectorAll('button').forEach(b => {
      b.type = 'button';
      b.addEventListener('click', () => {
        if (b.textContent.trim() === rep) {
          b.classList.add('ok'); fb.textContent = '✓ Bien vu !';
          z.querySelectorAll('button').forEach(o => { o.disabled = true; });
        } else { b.classList.add('ko'); fb.textContent = 'Non, essaie encore.'; }
      });
    });
  });
}

/* ---------- Schéma « de proche en proche » ----------
   data-v="d" data-debut="1" data-op="+50" data-glob="+ (n−1) × 50" data-glob2="on ajoute 50, (n−1) fois"
   data-geo (couleur orange) data-cache (opérations masquées jusqu'au clic) */
function initSchemas() {
  const NS = 'http://www.w3.org/2000/svg';
  document.querySelectorAll('.schema').forEach(box => {
    const v = box.dataset.v || 'u', d0 = +(box.dataset.debut || 0);
    const col = box.hasAttribute('data-geo') ? '#D9480F' : '#1C7ED6';
    const labels = [v + sub(d0), v + sub(d0 + 1), v + sub(d0 + 2), v + sub(d0 + 3), '…', v + 'ₙ', v + 'ₙ₊₁'];
    const W = 640, H = 150, x0 = 40, dx = 90, y = 70;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.innerHTML = `<defs><marker id="fl${col.slice(1)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${col}"/></marker></defs>`;
    const mk = `url(#fl${col.slice(1)})`;
    const ops = [];
    labels.forEach((t, i) => {
      const tx = document.createElementNS(NS, 'text');
      tx.setAttribute('x', x0 + i * dx); tx.setAttribute('y', y + 6); tx.setAttribute('text-anchor', 'middle');
      tx.setAttribute('font-size', '19'); tx.setAttribute('font-style', t === '…' ? 'normal' : 'italic'); tx.textContent = t;
      svg.append(tx);
      if (i < labels.length - 1) {
        const a = x0 + i * dx + 14, b = x0 + (i + 1) * dx - 14;
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', `M${a} ${y - 14} Q${(a + b) / 2} ${y - 52} ${b} ${y - 14}`);
        p.setAttribute('fill', 'none'); p.setAttribute('stroke', col); p.setAttribute('stroke-width', '2');
        p.setAttribute('marker-end', mk);
        if (i === 3 || i === 4) p.setAttribute('stroke-dasharray', '5 4');
        svg.append(p);
        if (i !== 3 && i !== 4) {
          const o = document.createElementNS(NS, 'text');
          o.setAttribute('x', (a + b) / 2); o.setAttribute('y', y - 40); o.setAttribute('text-anchor', 'middle');
          o.setAttribute('font-size', '16'); o.setAttribute('fill', col); o.textContent = box.dataset.op;
          svg.append(o); ops.push(o);
        }
      }
    });
    const g = document.createElementNS(NS, 'path');
    const xa = x0, xb = x0 + 5 * dx;
    g.setAttribute('d', `M${xa} ${y + 14} V${y + 32} H${xb} V${y + 16}`);
    g.setAttribute('fill', 'none'); g.setAttribute('stroke', col); g.setAttribute('stroke-width', '2'); g.setAttribute('marker-end', mk);
    svg.append(g);
    const g1 = document.createElementNS(NS, 'text'), g2 = document.createElementNS(NS, 'text');
    [[g1, y + 52, 14, box.dataset.glob2 || ''], [g2, y + 74, 18, box.dataset.glob]].forEach(([t, yy, fs, s]) => {
      t.setAttribute('x', (xa + xb) / 2); t.setAttribute('y', yy); t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', fs); t.setAttribute('fill', col); t.textContent = s; svg.append(t); ops.push(t);
    });
    box.append(svg);
    if (box.hasAttribute('data-cache')) {
      ops.forEach(o => { o.dataset.vrai = o.textContent; o.textContent = o === g1 ? '' : '……'; });
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn sm'; b.textContent = 'Compléter le schéma';
      b.addEventListener('click', () => { ops.forEach(o => { o.textContent = o.dataset.vrai; }); b.remove(); });
      box.after(b);
    }
  });
  function sub(n) { return String(n).replace(/\d/g, c => '₀₁₂₃₄₅₆₇₈₉'[c]); }
}

/* ---------- Explorateur de termes ----------
   data-v="d" data-debut="1" data-u="200" data-r="50" (arithmétique) ou data-q="1.1" (géométrique)
   data-max="20" data-seuil="1000" data-sens=">=" (ou "<", "<=", ">") data-unite="m" data-dec="2"
   data-annee="2025" (affiche l'année 2025+n), data-v2/data-u2/data-r2/data-q2 : 2e suite à comparer */
function initExplore() {
  document.querySelectorAll('.explore').forEach(box => {
    const D = box.dataset;
    const suite = (u, r, q) => n => (q !== undefined ? u * q ** (n - d0) : u + (n - d0) * r);
    const d0 = +(D.debut || 0), max = +(D.max || 15), dec = +(D.dec ?? 2);
    const f1 = suite(+D.u, +D.r, D.q !== undefined ? +D.q : undefined);
    const f2 = D.u2 !== undefined ? suite(+D.u2, +D.r2, D.q2 !== undefined ? +D.q2 : undefined) : null;
    const v = D.v || 'u', v2 = D.v2 || 'v', unite = D.unite ? ' ' + D.unite : '';
    const seuil = D.seuil !== undefined ? +D.seuil : null, sens = D.sens || '>=';
    const ok = x => (seuil === null ? false : sens === '>=' ? x >= seuil : sens === '>' ? x > seuil : sens === '<' ? x < seuil : x <= seuil);
    const test = n => (f2 ? f2(n) > f1(n) : ok(f1(n)));
    const ns = []; for (let n = d0; n <= max; n++) ns.push(n);
    const premier = ns.find(test);

    box.innerHTML = '';
    const h = document.createElement('div'); h.className = 'ex-h';
    h.innerHTML = `<b>Explorer</b><label>rang <i>n</i> = <input type="range" min="${d0}" max="${max}" value="${d0}"></label><span class="ex-out"></span>`;
    const grille = document.createElement('div'); grille.className = 'grille';
    let t = `<table><tr><th><i>n</i></th>${ns.map(n => `<th data-n="${n}">${n}</th>`).join('')}</tr>`;
    if (D.annee) t += `<tr><th>année</th>${ns.map(n => `<td data-n="${n}">${+D.annee + n}</td>`).join('')}</tr>`;
    t += `<tr><th><i>${v}</i><sub><i>n</i></sub></th>${ns.map(n => `<td data-n="${n}" class="${!f2 && ok(f1(n)) ? 'hit' : ''}">${fr(f1(n), dec)}</td>`).join('')}</tr>`;
    if (f2) t += `<tr><th><i>${v2}</i><sub><i>n</i></sub></th>${ns.map(n => `<td data-n="${n}" class="${test(n) ? 'hit' : ''}">${fr(f2(n), dec)}</td>`).join('')}</tr>`;
    grille.innerHTML = t + '</table>';
    box.append(h, grille, nuage());
    const out = h.querySelector('.ex-out'), range = h.querySelector('input');
    const maj = () => {
      const n = +range.value;
      grille.querySelectorAll('.cur').forEach(c => c.classList.remove('cur'));
      grille.querySelectorAll(`[data-n="${n}"]`).forEach(c => c.classList.add('cur'));
      const c = grille.querySelector(`th[data-n="${n}"]`);   // on fait défiler le tableau seul, jamais la page
      if (c) grille.scrollLeft = Math.max(0, c.offsetLeft - grille.clientWidth / 2);
      let s = `<i>${v}</i><sub>${n}</sub> ≈ <b>${fr(f1(n), dec)}${unite}</b>`;
      if (f2) s += ` &nbsp; <i>${v2}</i><sub>${n}</sub> ≈ <b>${fr(f2(n), dec)}${unite}</b>`;
      if (D.annee) s += ` &nbsp;(année ${+D.annee + n})`;
      out.innerHTML = s;
      box.querySelectorAll('circle[data-n], rect[data-n]').forEach(p => p.setAttribute('stroke', +p.dataset.n === n ? '#1D2733' : 'none'));
    };
    range.addEventListener('input', maj); maj();
    if (premier !== undefined && D.msg) {
      const m = document.createElement('p'); m.className = 'note'; m.style.margin = '0';
      m.innerHTML = D.msg.replace('{n}', premier).replace('{a}', D.annee ? +D.annee + premier : '');
      box.append(m);
    }

    function nuage() {
      const W = 600, H = 220, L = 52, B = 26, T = 12, R = 10;
      const vals = ns.flatMap(n => (f2 ? [f1(n), f2(n)] : [f1(n)])).concat(seuil !== null ? [seuil] : []);
      let lo = Math.min(0, ...vals), hi = Math.max(...vals); if (hi === lo) hi = lo + 1;
      const X = n => L + (n - d0) * (W - L - R) / Math.max(1, max - d0);
      const Y = y => H - B - (y - lo) * (H - B - T) / (hi - lo);
      const pas = Math.pow(10, Math.floor(Math.log10((hi - lo) / 4)));
      const step = [1, 2, 5, 10].map(k => k * pas).find(s => (hi - lo) / s <= 6) || pas * 10;
      let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Nuage de points de la suite">`;
      for (let y = Math.ceil(lo / step) * step; y <= hi + 1e-9; y += step) s += `<line x1="${L}" x2="${W - R}" y1="${Y(y)}" y2="${Y(y)}" stroke="#E6EBF1"/><text x="${L - 6}" y="${Y(y) + 4}" font-size="11" text-anchor="end" fill="#5B6878">${fr(y, 0)}</text>`;
      s += `<line x1="${L}" x2="${W - R}" y1="${Y(lo)}" y2="${Y(lo)}" stroke="#5B6878"/>`;
      ns.forEach(n => { if ((max - d0) <= 20 || n % 2 === 0) s += `<text x="${X(n)}" y="${H - 8}" font-size="11" text-anchor="middle" fill="#5B6878">${n}</text>`; });
      if (seuil !== null && !f2) s += `<line x1="${L}" x2="${W - R}" y1="${Y(seuil)}" y2="${Y(seuil)}" stroke="#E03131" stroke-dasharray="6 4"/><text x="${W - R}" y="${Y(seuil) - 5}" font-size="12" text-anchor="end" fill="#E03131">seuil ${fr(seuil, 0)}</text>`;
      const c1 = D.q !== undefined ? '#D9480F' : '#1C7ED6';
      ns.forEach(n => { s += `<circle data-n="${n}" cx="${X(n)}" cy="${Y(f1(n))}" r="5" fill="${c1}" stroke-width="2"/>`; });
      if (f2) ns.forEach(n => { s += `<rect data-n="${n}" x="${X(n) - 4.5}" y="${Y(f2(n)) - 4.5}" width="9" height="9" fill="#D9480F" stroke-width="2"/>`; });
      if (f2) s += `<circle cx="${L + 14}" cy="${T + 8}" r="5" fill="${c1}"/><text x="${L + 24}" y="${T + 12}" font-size="12">${v}ₙ</text><rect x="${L + 60}" y="${T + 3.5}" width="9" height="9" fill="#D9480F"/><text x="${L + 74}" y="${T + 12}" font-size="12">${v2}ₙ</text>`;
      const w = document.createElement('div'); w.className = 'grille'; w.innerHTML = s + '</svg>';
      return w;
    }
  });
}

/* ---------- Navigation : exercice visible surligné ---------- */
function initNav() {
  const nav = document.getElementById('exnav');
  if (!nav) return;
  document.querySelectorAll('.exo[id]').forEach(e => {
    const a = document.createElement('a');
    a.href = '#' + e.id; a.textContent = e.dataset.nav || e.id;
    nav.append(a);
  });
  const liens = [...nav.querySelectorAll('a')];
  const obs = new IntersectionObserver(es => {
    es.forEach(en => {
      if (!en.isIntersecting) return;
      liens.forEach(l => l.classList.toggle('on', l.getAttribute('href') === '#' + en.target.id));
      const on = nav.querySelector('.on'); if (on) nav.scrollLeft = Math.max(0, on.offsetLeft - nav.clientWidth / 2);
    });
  }, { rootMargin: '-130px 0px -60% 0px' });
  document.querySelectorAll('.exo[id]').forEach(e => obs.observe(e));
}

document.addEventListener('DOMContentLoaded', () => {
  initNav(); initQuestions(); initQuiz(); initSchemas(); initExplore();
});
