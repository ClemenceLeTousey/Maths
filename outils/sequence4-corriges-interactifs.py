"""Génère les corrigés interactifs (HTML) des fiches « Exercices Partie 1/2/3 »
de la Séquence 4 à partir des sources LaTeX (énoncés, corrigés, listes des fiches)."""
import os, re, shutil, html, unicodedata

SEQ = "/Users/clem/Nextcloud/2026 2027 LEBRUN/2NDE 2026-2027/Séquence 4 - Information chiffrée"
SITE = "/Users/clem/Nextcloud/2026 2027 LEBRUN/Maths/cours/seconde"
IMG_DIR = "img-sequence4"
MODELE = os.path.join(SITE, "sequence3-correction-feuille4.html")

def N(s): return unicodedata.normalize("NFC", s)
def lire(nom):
    for f in os.listdir(SEQ):
        if N(f) == N(nom):
            return open(os.path.join(SEQ, f), encoding="utf-8").read()
    raise FileNotFoundError(nom)

COMMUN = lire("Séquence 4 - Exercices manuel - commun.tex")
CORR = lire("Séquence 4 - Exercices manuel - corrigés.tex")

# ---------------------------------------------------------------- accolades
def arg(s, i):
    """Argument entre accolades commençant à s[i] (après espaces) -> (contenu, fin)."""
    while i < len(s) and s[i] in " \n\t":
        i += 1
    if i >= len(s) or s[i] != "{":
        raise ValueError("accolade attendue : " + s[i:i + 40])
    d, j = 0, i
    while j < len(s):
        c = s[j]
        if c == "\\":
            j += 2
            continue
        if c == "{":
            d += 1
        elif c == "}":
            d -= 1
            if d == 0:
                return s[i + 1:j], j + 1
        j += 1
    raise ValueError("accolade non fermée")

def opt(s, i):
    """Argument optionnel [..] éventuel."""
    j = i
    while j < len(s) and s[j] in " \n":
        j += 1
    if j < len(s) and s[j] == "[":
        k = s.index("]", j)
        return s[j + 1:k], k + 1
    return None, i

def sans_commentaires(s):
    return re.sub(r"(?<!\\)%[^\n]*", "", s)

# ---------------------------------------------------------------- données
EXOS, CORRS = {}, {}
for m in re.finditer(r"\\DefExo\{", COMMUN):
    i = m.end() - 1
    num, i = arg(COMMUN, i)
    page, i = arg(COMMUN, i)
    niv, i = arg(COMMUN, i)
    comp, i = arg(COMMUN, i)
    corps, i = arg(COMMUN, i)
    EXOS[num.strip()] = dict(page=page.strip(), niv=niv.strip(), comp=comp.strip(), corps=sans_commentaires(corps))
for m in re.finditer(r"\\DefCorr\{", CORR):
    i = m.end() - 1
    num, i = arg(CORR, i)
    corps, i = arg(CORR, i)
    CORRS[num.strip()] = sans_commentaires(corps)
# Objectif de chaque exercice : classement de "Séquence 4 - Exercices manuel.tex".
OBJ_EXO, _obj = {}, None
for m in re.finditer(r"\\Objectif\{(\d+)\}|\\UseExo(?:\[\w+\])?\{(\d+)\}", sans_commentaires(lire("Séquence 4 - Exercices manuel.tex"))):
    if m.group(1):
        _obj = m.group(1)
    else:
        OBJ_EXO[m.group(2)] = _obj
DETAILS = {}
DET = lire("Séquence 4 - Corrigés interactifs - détails.tex")
for m in re.finditer(r"\\DefDetail\{", DET):
    i = m.end() - 1
    num, i = arg(DET, i)
    corps, i = arg(DET, i)
    DETAILS[num.strip()] = sans_commentaires(corps)
ENONCES_WEB = {}
for m in re.finditer(r"\\DefEnonceWeb\{", DET):
    i = m.end() - 1
    num, i = arg(DET, i)
    corps, i = arg(DET, i)
    ENONCES_WEB[num.strip()] = sans_commentaires(corps)
TEMPS = dict(re.findall(r"\\TempsExo\{(\d+)\}\{(\d+)\}", sans_commentaires(DET)))
mm = re.search(r"\\ExoMaison\{([^}]*)\}", sans_commentaires(COMMUN))
MAISON = set(x.strip() for x in mm.group(1).split(",")) if mm else set()

# ---------------------------------------------------------------- texte brut (schémas SVG)
SUB = str.maketrans("0123456789", "₀₁₂₃₄₅₆₇₈₉")
def brut(s):
    """LaTeX court -> texte brut pour les étiquettes des schémas."""
    s = s.replace("\\Inconnue", "?").replace("\\Inc", "?")
    s = re.sub(r"\\tiny|\\scriptsize|\\small", "", s)
    s = re.sub(r"\\d?frac\{([^{}]*)\}\{([^{}]*)\}", r"\1/\2", s)
    s = s.replace("\\times", "×").replace("\\div", "÷").replace("{,}", ",").replace("\\,", " ")
    s = s.replace("\\CM", "CM").replace("\\text{rec}", "rec")
    s = re.sub(r"([A-Za-zM])_\{?([0-9])\}?", lambda m: m.group(1) + m.group(2).translate(SUB), s)
    s = re.sub(r"_\{?g\}?", "g", s)
    s = s.replace("\\\\", " · ").replace("$", "").replace("{", "").replace("}", "").replace("~", " ")
    return re.sub(r"\s+", " ", s).strip()

def esc(t): return html.escape(t, quote=False)

VIOLET = "#6741D9"
def cercle(x, y, t, r=17):
    t = brut(t)
    fs = 12 if len(t) <= 5 else (10 if len(t) <= 7 else 8.5)
    col = VIOLET if t == "?" else "#1D2733"
    fw = "600" if t == "?" else "400"
    return (f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff" stroke="#1D2733" stroke-width="1.2"/>'
            f'<text x="{x}" y="{y + 4}" text-anchor="middle" font-size="{fs}" fill="{col}" font-weight="{fw}">{esc(t)}</text>')
DEFS = ('<defs><marker id="fl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
        '<path d="M0,0 L10,5 L0,10 z" fill="#1D2733"/></marker></defs>')
def svg(w, h, contenu):
    return (f'<svg viewBox="0 0 {w} {h}" width="{w}" height="{h}" font-family="Source Sans 3, sans-serif" role="img">'
            + DEFS + contenu + "</svg>")
def courbe(x1, x2, y, haut, lab, pointille=False):
    """Flèche courbe de x1 à x2 (haut=True : au-dessus)."""
    dy = -26 if haut else 26
    cx = (x1 + x2) / 2
    dash = ' stroke-dasharray="4 3"' if pointille else ""
    ly = y + dy - 4 if haut else y + dy + 12
    return (f'<path d="M{x1},{y} Q{cx},{y + dy * 1.6} {x2},{y}" fill="none" stroke="#1D2733" stroke-width="1.1" marker-end="url(#fl)"{dash}/>'
            f'<text x="{cx}" y="{ly}" text-anchor="middle" font-size="11">{esc(brut(lab))}</text>')
def droite(x1, x2, y, lab):
    return (f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="#1D2733" stroke-width="1.1" marker-end="url(#fl)"/>'
            f'<text x="{(x1 + x2) / 2}" y="{y - 6}" text-anchor="middle" font-size="11">{esc(brut(lab))}</text>')

def sch_un(a, b, l):
    return svg(170, 62, cercle(20, 44, a) + cercle(150, 44, b) + courbe(34, 136, 34, True, l))
def sch_retour(a, b, l1, l2):
    return svg(170, 108, cercle(20, 54, a) + cercle(150, 54, b) + courbe(34, 136, 44, True, l1) + courbe(136, 34, 64, False, l2, True))
def sch_rec(a, b, l1, l2):
    return svg(170, 108, cercle(20, 54, a) + cercle(150, 54, b) + courbe(34, 136, 44, True, l1) + courbe(136, 34, 64, False, l2))
def sch_n(vals, labs, glob):
    n = len(vals)
    pas = 100
    w = 40 + pas * (n - 1)
    c = "".join(cercle(20 + k * pas, 30, v) for k, v in enumerate(vals))
    c += "".join(droite(37 + k * pas, 3 + (k + 1) * pas, 30, l) for k, l in enumerate(labs))
    c += courbe(30, 10 + (n - 1) * pas, 46, False, glob)
    return svg(w, 96, c)
def tri_magique(h1, v1, g1, gv, d1, dv, formule):
    c = ('<path d="M10,110 L150,110 L80,8 z" fill="none" stroke="%s" stroke-width="1.6"/>'
         '<line x1="40" y1="64" x2="120" y2="64" stroke="%s"/><line x1="80" y1="64" x2="80" y2="110" stroke="%s"/>' % ((VIOLET,) * 3))
    def t(x, y, s, col="#1D2733"):
        s = brut(s)
        cc = VIOLET if s == "?" else col
        return f'<text x="{x}" y="{y}" text-anchor="middle" font-size="12" fill="{cc}">{esc(s)}</text>' if s else ""
    c += t(80, 38, h1) + t(80, 56, v1) + t(55, 82, g1) + t(55, 100, gv) + t(105, 82, d1) + t(105, 100, dv)
    lignes = [brut(x) for x in re.split(r"\\\\", formule)]
    for k, l in enumerate(lignes):
        c += f'<text x="80" y="{128 + 14 * k}" text-anchor="middle" font-size="11" fill="{VIOLET}">{esc(l)}</text>'
    return svg(160, 130 + 14 * len(lignes), c)
def schema_taux(col, taux, a, b):
    c = (f'<text x="110" y="16" text-anchor="middle" font-size="13">Taux d\'évolution {esc(brut(taux))}</text>'
         f'<circle cx="35" cy="70" r="28" fill="#fff" stroke="{col}" stroke-width="2"/>'
         f'<circle cx="185" cy="70" r="28" fill="#fff" stroke="{col}" stroke-width="2"/>'
         f'<text x="35" y="75" text-anchor="middle" font-size="14">{esc(brut(a))}</text>'
         f'<text x="185" y="75" text-anchor="middle" font-size="14">{esc(brut(b))}</text>'
         f'<path d="M55,50 Q110,15 165,50" fill="none" stroke="{col}" stroke-width="2" marker-end="url(#fl)"/>'
         f'<text x="110" y="52" text-anchor="middle" font-size="13">×…</text>')
    return svg(220, 105, c)

COULEURS = {"skyblue": "#339AF0", "diffred": "#FA5252", "diffgreen": "#40C057", "diffblue": "#228BE6"}
SCHEMAS = {  # nom -> (nb d'arguments, fonction)
    "SchUn": (3, sch_un), "SchRetour": (4, sch_retour), "SchRec": (4, sch_rec),
    "SchDeux": (6, lambda a, b, c, l1, l2, g: sch_n([a, b, c], [l1, l2], g)),
    "SchTrois": (8, lambda a, b, c, d, l1, l2, l3, g: sch_n([a, b, c, d], [l1, l2, l3], g)),
    "TriMagique": (4, lambda n, p, NN, f: tri_magique("$n$", n, "$p$", p, "$N$", NN, f)),
    "TriMagiqueCM": (4, lambda v2, v1, cm, f: tri_magique("$v_2$", v2, "$v_1$", v1, "CM", cm, f)),
    "SchemaTaux": (4, lambda col, t, a, b: schema_taux(COULEURS.get(col, "#339AF0"), t, a, b)),
}

# ---------------------------------------------------------------- maths
def maths(m):
    m = m.replace("\\CM", "\\textsf{CM}").replace("\\Inconnue", "\\color{%s}{\\textbf{?}}" % VIOLET)
    m = m.replace("\\Inc", "\\color{%s}{\\textbf{?}}" % VIOLET)
    m = m.replace("\\textperthousand", "\\text{‰}").replace("€", "\\text{€}")
    return m

# ---------------------------------------------------------------- conversion du texte
CERCLES = "①②③④⑤⑥⑦⑧⑨⑩"
def conv(s):
    """LaTeX (corps d'énoncé ou de corrigé) -> HTML."""
    out, i = [], 0
    while i < len(s):
        c = s[i]
        if c == "$":
            j = s.index("$", i + 1)
            out.append("\\(" + maths(s[i + 1:j]) + "\\)")
            i = j + 1
            continue
        if s.startswith("\\[", i):
            j = s.index("\\]", i)
            out.append("\\[" + maths(s[i + 2:j]) + "\\]")
            i = j + 2
            continue
        if c == "\\":
            m = re.match(r"\\([A-Za-z]+)\*?|\\(.)", s[i:])
            nom = m.group(1) or m.group(2)
            i += m.end()
            i = trait(nom, s, i, out)
            continue
        if c == "{":
            contenu, i = arg(s, i)
            out.append(conv(contenu))
            continue
        if c == "}":
            i += 1
            continue
        if c == "~":
            out.append("&nbsp;")
            i += 1
            continue
        if s.startswith("---", i):
            out.append("—"); i += 3; continue
        if s.startswith("--", i):
            out.append("–"); i += 2; continue
        if c == "\n" and s.startswith("\n\n", i):
            out.append("<br>"); i += 2; continue
        out.append(esc(c))
        i += 1
    return "".join(out)

def env(nom, s, i):
    """Contenu d'un environnement \\begin{nom}...\\end{nom} (imbrications comprises)."""
    d, j = 1, i
    pat = re.compile(r"\\(begin|end)\{" + re.escape(nom) + r"\}")
    while True:
        m = pat.search(s, j)
        d += 1 if m.group(1) == "begin" else -1
        if d == 0:
            return s[i:m.start()], m.end()
        j = m.end()

def items(contenu):
    parts = re.split(r"\\item\b", contenu)
    return [p for p in parts[1:]]

def separer(s, sep):
    """Découpe s sur sep (\\\\ ou &) hors accolades, hors maths, hors environnements."""
    res, d, k, start, enmath = [], 0, 0, 0, False
    while k < len(s):
        c = s[k]
        if c == "\\" and not s.startswith(sep, k):
            k += 2; continue
        if c == "$":
            enmath = not enmath
        elif c == "{":
            d += 1
        elif c == "}":
            d -= 1
        elif d == 0 and not enmath and s.startswith(sep, k):
            res.append(s[start:k]); k += len(sep); start = k; continue
        k += 1
    res.append(s[start:])
    return res

def tableau(contenu):
    contenu = contenu.lstrip()
    if contenu.startswith("["):                        # [t], [c]…
        contenu = contenu[contenu.index("]") + 1:].lstrip()
    if contenu.startswith("{"):                        # spécification des colonnes (accolades imbriquées)
        _, k = arg(contenu, 0)
        contenu = contenu[k:]
    contenu = contenu.replace("\\hline", "")
    lignes = [l for l in separer(contenu, "\\\\") if l.strip()]
    h = ['<table class="t">']
    for l in lignes:
        l = re.sub(r"^\s*\[[^\]]*\]", "", l)
        cells = separer(l, "&")
        tds = []
        for c in cells:
            cls = ""
            if "\\cellcolor" in c:
                cls = ' class="hd"'
                c = re.sub(r"\\cellcolor\{[^}]*\}", "", c)
            mc = re.match(r"\s*\\multicolumn\{(\d+)\}\{[^}]*\}", c)
            span = ""
            if mc:
                span = f' colspan="{mc.group(1)}"'
                c = c[mc.end():]
            tds.append(f"<td{cls}{span}>{conv(c.strip())}</td>")
        h.append("<tr>" + "".join(tds) + "</tr>")
    h.append("</table>")
    return "".join(h)

IGNORE_ARG = {"hspace", "vspace", "label"}
IGNORE = {"small", "footnotesize", "tiny", "scriptsize", "normalsize", "large", "itshape", "centering",
          "noindent", "raggedright", "smallskip", "medskip", "bigskip", "par", "hfill", "displaystyle", "ttfamily",
          "bfseries", "relax", "allowbreak", "linebreak", "newline"}
def trait(nom, s, i, out):
    if nom in ("\\",):
        _, i = opt(s, i)
        out.append("<br>"); return i
    if nom in (",", " "):
        out.append("&thinsp;" if nom == "," else " "); return i
    if nom in ("%", "&", "#", "_", "{", "}", "$"):
        out.append(esc(nom)); return i
    if nom == "'":
        return i
    if nom in IGNORE:
        return i
    if nom in IGNORE_ARG:
        _, i = arg(s, i); return i
    if nom == "renewcommand":
        _, i = arg(s, i); _, i = arg(s, i); return i
    if nom == "setlength":
        _, i = arg(s, i); _, i = arg(s, i); return i
    if nom in ("textbf", "emph", "textit", "texttt", "textsuperscript", "text", "textsf", "underline"):
        c, i = arg(s, i)
        tag = {"textbf": "b", "emph": "i", "textit": "i", "texttt": "code", "textsuperscript": "sup", "underline": "u"}.get(nom)
        out.append(f"<{tag}>{conv(c)}</{tag}>" if tag else conv(c)); return i
    if nom == "textcolor":
        _, i = arg(s, i); c, i = arg(s, i); out.append(conv(c)); return i
    if nom == "numeroCerne":
        c, i = arg(s, i)
        try:
            out.append(f'<span class="nc">{CERCLES[int(c) - 1]}</span>')
        except Exception:
            out.append(f"({esc(c)})")
        return i
    if nom == "Pointilles":
        out.append("……"); return i
    if nom in ("quad", "qquad"):
        out.append("&emsp;"); return i
    if nom == "dots":
        out.append("…"); return i
    if nom == "textperthousand":
        out.append("‰"); return i
    if nom in ("euro", "EUR"):
        out.append("€"); return i
    if nom == "CM":
        out.append('<span class="cm">CM</span>'); return i
    if nom in ("Inc", "Inconnue"):
        out.append('<b style="color:%s">?</b>' % VIOLET); return i
    if nom == "includegraphics":
        _, i = opt(s, i)
        f, i = arg(s, i)
        base = os.path.basename(f.strip())
        out.append(f'<img src="{IMG_DIR}/{base}" alt="" loading="lazy">'); return i
    if nom in SCHEMAS:
        n, fn = SCHEMAS[nom]
        args = []
        for _ in range(n):
            a, i = arg(s, i); args.append(a)
        out.append('<span class="fig">' + fn(*args) + "</span>"); return i
    if nom in ("AvecTriangle", "AvecSchema"):
        a, i = arg(s, i); b, i = arg(s, i)
        out.append(f'<div class="avec"><div>{conv(a)}</div><div class="figs">{conv(b)}</div></div>'); return i
    if nom in BLOCS:
        titre, cls = BLOCS[nom]
        c, i = arg(s, i)
        if nom == "Reperage" and "\\item" in c and "\\begin{itemize}" not in c:
            c = "\\begin{itemize}" + c + "\\end{itemize}"
        out.append(f'<div class="blk {cls}"><div class="blk-t">{titre}</div><div class="blk-c">{conv(c)}</div></div>'); return i
    if nom == "HTML":
        c, i = arg(s, i)
        out.append(c); return i
    if nom == "CodeBlocs":
        blocs = []
        for _ in range(2):
            t, i = arg(s, i); c, i = arg(s, i)
            lignes = c.strip("\n").split("\n")
            blocs.append(f'<div class="codeb"><div class="codeb-t">{esc(t)}</div><pre class="code">{esc(chr(10).join(lignes))}</pre></div>')
        out.append('<div class="codes">' + "".join(blocs) + "</div>"); return i
    if nom == "Q":
        q, i = arg(s, i); c, i = arg(s, i)
        out.append(f'<div class="qq"><div class="qq-n">Question {esc(q)}</div>{conv(c)}</div>'); return i
    if nom in ("TriangleApres", "SchemaApres"):
        a, i = arg(s, i); b, i = arg(s, i)
        out.append(f'<div>{conv(a)}</div><div class="figs c">{conv(b)}</div>'); return i
    if nom == "fbox":
        c, i = arg(s, i)
        if "\\ttfamily" in c:
            code = re.sub(r"\\begin\{minipage\}\{[^}]*\}|\\end\{minipage\}|\\ttfamily|\\small", "", c)
            lignes = [re.sub(r"~", " ", l).strip("\n") for l in separer(code, "\\\\")]
            lignes = [l.replace("\\dots", "…").replace("\\_", "_").replace("\\%", "%").strip() if not l.startswith(" ") else l for l in lignes]
            txt = "\n".join(re.sub(r"\\textbf\{([^}]*)\}", r"\1", l).replace("\\dots", "…") for l in lignes if l.strip())
            out.append(f'<pre class="code">{esc(txt)}</pre>')
        else:
            out.append(f'<span class="fbox">{conv(c)}</span>')
        return i
    if nom == "begin":
        e, i = arg(s, i)
        if e in ("enumerate", "itemize"):
            o, i = opt(s, i)
            contenu, i = env(e, s, i)
            tag = "ol" if e == "enumerate" else "ul"
            out.append(f"<{tag}>" + "".join(f"<li>{conv(it)}</li>" for it in items(contenu)) + f"</{tag}>")
            return i
        if e == "center":
            contenu, i = env(e, s, i)
            out.append(f'<div class="c">{conv(contenu)}</div>'); return i
        if e in ("tabular", "tabularx"):
            if e == "tabularx":
                _, i = arg(s, i)
            contenu, i = env(e, s, i)
            out.append(f'<div class="tw">{tableau(contenu)}</div>'); return i
        if e == "minipage":
            _, i = opt(s, i); _, i = arg(s, i)
            contenu, i = env(e, s, i)
            out.append(f"<div>{conv(contenu)}</div>"); return i
        if e == "multicols":
            _, i = arg(s, i)
            contenu, i = env(e, s, i)
            out.append(conv(contenu)); return i
        contenu, i = env(e, s, i)
        out.append(conv(contenu)); return i
    if nom == "end":
        _, i = arg(s, i); return i
    # macro inconnue : on la signale dans le texte pour la repérer
    INCONNUES.add(nom)
    return i
INCONNUES = set()
BLOCS = {"Reperage": ("On repère", "rep"), "Formule": ("Formule utilisée", "form"), "Calcul": ("Calculs", "calc"),
         "Conclusion": ("Conclusion", "conc"), "Piege": ("Attention", "pg")}

# ---------------------------------------------------------------- page
NIV = {"\\NivVert": ("var(--star-green)", 1), "\\NivBleu": ("var(--star-blue)", 2), "\\NivRouge": ("var(--star-red)", 3)}
def etoiles(niv):
    col, n = NIV.get(niv.strip(), ("var(--muted)", 0))
    return f'<span class="stars" style="color:{col}">' + "★" * n + '<span style="color:#CED4DA">' + "★" * (3 - n) + "</span></span>"

def lire_fiche(nom):
    """Séquence des blocs d'une fiche corrigée : objectifs, rubriques, exercices."""
    s = sans_commentaires(lire(nom))
    s = s[s.index("\\begin{document}"):]
    blocs = []
    for m in re.finditer(r"\\ObjectifsFiche\{|\\RubriqueFiche(\[diffred\])?\{([^}]*)\}|\\ExoCorr(?:\[(\w+)\])?\{(\d+)\}", s):
        if m.group(0).startswith("\\ObjectifsFiche"):
            contenu, _ = arg(s, m.end() - 1)
            objs = re.findall(r"\\ObjLigne\{(\d+)\}\{([^}]*)\}", contenu)
            blocs.append(("obj", objs))
        elif m.group(0).startswith("\\RubriqueFiche"):
            blocs.append(("rub", m.group(2), bool(m.group(1))))
        else:
            blocs.append(("exo", m.group(4), {"diffred": " red", "tempsgris": " gris"}.get(m.group(3), "")))
    return blocs

STYLE_PLUS = """
.rub { margin: 22px 0 6px; font-size: 17px; color: var(--calc); border-bottom: 1px solid #CFE2F7; padding-bottom: 2px; }
.rub.red { color: var(--red); border-color: #F8C9C9; }
.objs { margin: 26px 0 4px; background: var(--calc-soft); border-left: 3px solid var(--calc); padding: 8px 14px; border-radius: 0 8px 8px 0; display: grid; gap: 2px; }
.objs b { color: var(--calc); font-weight: 600; }
.pill.red { background: var(--star-red); }
.pill.gris { background: #868E96; }
.graph { max-width: 620px; margin: 6px auto; }
.graph97 { max-width: 560px; margin: 8px auto; font-size: 13px; }
.g97-t { color: var(--ink); margin-bottom: 6px; line-height: 1.35; }
.g97-c { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.leg97 { display: grid; gap: 2px; }
.leg97 i { display: inline-block; width: 11px; height: 11px; border-radius: 2px; vertical-align: -1px; margin-right: 6px; }
.graph img { width: 100%; margin: 0; }
.leg61 { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 2px 14px; font-size: 13px; color: var(--ink); margin-top: 6px; padding-left: 8%; }
.leg61 i { display: inline-block; width: 18px; height: 4px; border-radius: 2px; vertical-align: middle; margin-right: 6px; }
.codes { display: flex; gap: 14px; flex-wrap: wrap; margin: 8px 0; }
.codeb { flex: 1 1 240px; min-width: 0; }
.codeb-t { font-size: 13px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .03em; margin-bottom: 2px; }
.codeb pre.code { margin: 0; font-size: 15px; line-height: 1.45; }
.temps { font-size: 14px; color: var(--muted); white-space: nowrap; }
.objn { font-family: var(--f-body); font-size: 14px; font-weight: 600; color: var(--calc); }
.pill.maison { background: #E8A200; color: #1D2733; }
.legende { display: flex; gap: 6px 14px; flex-wrap: wrap; font-size: 14px; color: var(--muted); margin-top: 10px; align-items: center; }
.legende span::before { content: ""; display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; background: var(--c); }
.blk { border-radius: 0 8px 8px 0; padding: 6px 12px; margin: 8px 0; border-left: 3px solid; overflow-x: auto; }
.blk-t { font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: .03em; margin-bottom: 2px; }
.blk-c ul, .blk-c ol { margin: 2px 0; }
.blk.rep { background: #FFF4E6; border-color: #F76707; } .blk.rep .blk-t { color: #D9480F; }
.blk.form { background: #F3F0FF; border-color: #7048E8; } .blk.form .blk-t { color: #6741D9; }
.blk.calc { background: #fff; border-color: #ADB5BD; } .blk.calc .blk-t { color: #495057; }
.blk.conc { background: #EBFBEE; border-color: #2F9E44; } .blk.conc .blk-t { color: #2B8A3E; }
.blk.pg { background: #FFF5F5; border-color: #E03131; } .blk.pg .blk-t { color: #C92A2A; }
.qq { border: 1px solid var(--line); border-radius: 8px; padding: 8px 12px; margin: 10px 0; background: #fff; }
.qq-n { font-weight: 600; color: var(--calc); margin-bottom: 2px; }
.corr-b { background: #F8F9FA; border-left-color: var(--green); }
.exo { margin-top: 12px; scroll-margin-top: 110px; }
.exo-b img { max-width: 100%; height: auto; display: block; margin: 4px auto; }
.exo-b ol, .exo-b ul { margin: 4px 0; padding-left: 24px; }
.exo-b li { margin: 2px 0; }
.c { text-align: center; }
.c > * { margin-inline: auto; }
.tw { overflow-x: auto; }
table.t { border-collapse: collapse; margin: 6px auto; font-size: 15px; }
table.t td { border: 1px solid var(--line); padding: 3px 10px; text-align: center; }
table.t td.hd { background: #FFE8CC; font-weight: 500; }
.nc { color: var(--calc); font-weight: 500; margin-right: 2px; }
.cm { font-family: var(--f-body); }
.fbox { border: 1px solid var(--ink); padding: 1px 6px; }
pre.code { background: var(--bg); border: 1px solid var(--line); border-radius: 6px; padding: 8px 12px; font-size: 14px; overflow-x: auto; margin: 6px 0; }
details.corr { border-top: 1px dashed var(--line); padding-top: 10px; }
details.corr > summary { list-style: none; cursor: pointer; display: inline-block; border: 1px solid var(--green); color: var(--green); border-radius: 6px; padding: 4px 14px; font-weight: 500; font-size: 15px; }
details.corr > summary::-webkit-details-marker { display: none; }
details.corr[open] > summary { background: var(--green); color: #fff; }
.corr-b { margin-top: 10px; background: var(--green-soft); border-left: 3px solid var(--green); padding: 10px 14px; border-radius: 0 8px 8px 0; overflow-x: auto; }
.avec { display: flex; gap: 14px; align-items: flex-start; flex-wrap: wrap; }
.avec > div:first-child { flex: 1 1 280px; min-width: 0; }
.figs { display: flex; flex-direction: column; gap: 6px; align-items: center; }
.figs.c { margin-top: 6px; flex-direction: row; flex-wrap: wrap; justify-content: center; }
.fig svg { display: block; max-width: none; }
.toutes { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 18px; }
"""

def page(num, theme, nom_fiche, sortie):
    blocs = lire_fiche(nom_fiche)
    modele = open(MODELE, encoding="utf-8").read()
    style = modele[modele.index("<style>") + 7:modele.index("</style>")]
    corps, nav = [], []
    for b in blocs:
        if b[0] == "obj":
            corps.append('<div class="objs">' + "".join(
                f'<div><b>Objectif {n}&nbsp;:</b> {conv(t)}</div>' for n, t in b[1]) + "</div>")
        elif b[0] == "rub":
            corps.append(f'<h2 class="rub{" red" if b[2] else ""}">{esc(b[1])}</h2>')
        else:
            n, coul = b[1], b[2]
            if not coul and n in MAISON:
                coul = " maison"
            e = EXOS[n]
            maison = " 🏠" if n in MAISON else ""
            temps = f'<span class="temps">⏱ {TEMPS[n]} min</span>' if n in TEMPS else ""
            nav.append(f'<a class="nb{coul}" href="#ex{n}">{n}</a>')
            corr = DETAILS.get(n) or CORRS.get(n)
            corr_html = (f'<details class="corr"><summary>Voir le corrigé</summary><div class="corr-b">{conv(corr)}</div></details>'
                         if corr else '<p class="aide">Corrigé à venir.</p>')
            corps.append(
                f'<article class="exo" id="ex{n}"><div class="exo-h"><span class="pill{coul}">Ex {n} p {esc(e["page"])}</span>'
                f'{etoiles(e["niv"])}{temps}{maison}<span class="comp"><span class="objn">Objectif {OBJ_EXO.get(n, "?")}</span> · {esc(e["comp"])}</span></div>'
                f'<div class="exo-b"><div class="consigne">{conv(ENONCES_WEB.get(n, e["corps"]))}</div>{corr_html}</div></article>')
    nav_css = (".exnav a.nb { flex: none; border: 1px solid var(--sky); background: var(--paper); color: var(--sky); border-radius: 6px; padding: 3px 10px; text-decoration: none; font-weight: 500; font-size: 15px; }\n"
               ".exnav a.nb:hover { background: var(--calc-soft); }\n.exnav a.nb.red { border-color: var(--star-red); color: var(--star-red); }\n.exnav a.nb.gris { border-color: #868E96; color: #868E96; }\n.exnav a.nb.maison { border-color: #E8A200; color: #9C6B00; }\n")
    doc = f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Exercices Partie {num} – Corrigé</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;1,400&family=Playwrite+FR+Moderne:wght@300&display=swap">
<style>{style}{STYLE_PLUS}{nav_css}</style>
<script src="../../barre.js"></script>
</head>
<body>
<header class="top">
  <div class="wrap">
    <div class="brand"><b>Séquence 4 — Exercices Partie {num} — Corrigé</b><span>{esc(theme)}</span><a href="../../seconde/">Page des Secondes</a></div>
    <nav class="exnav" aria-label="Exercices">{"".join(nav)}</nav>
  </div>
</header>
<main class="wrap">
<div class="legende"><span style="--c:#339AF0">en classe</span><span style="--c:#868E96">si le temps le permet</span><span style="--c:#E8A200">à la maison</span><span style="--c:#FA5252">approfondissement</span></div>
<div class="toutes"><button class="btn green" id="tout">Afficher tous les corrigés</button><button class="btn ghost" id="rien">Masquer tous les corrigés</button></div>
{"".join(corps)}
</main>
<script>
window.MathJax = {{ tex: {{ inlineMath: [['\\\\(', '\\\\)']], displayMath: [['\\\\[', '\\\\]']], packages: {{ '[+]': ['color'] }} }}, svg: {{ fontCache: 'global' }} }};
document.getElementById('tout').onclick = () => document.querySelectorAll('details.corr').forEach(d => d.open = true);
document.getElementById('rien').onclick = () => document.querySelectorAll('details.corr').forEach(d => d.open = false);
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg-full.min.js"></script>
</body>
</html>
"""
    open(os.path.join(SITE, sortie), "w", encoding="utf-8").write(doc)
    return sortie

os.makedirs(os.path.join(SITE, IMG_DIR), exist_ok=True)
imgs = set(re.findall(r"images/([A-Za-z0-9_.-]+\.png)", COMMUN + CORR)) | set(re.findall(r"img-sequence4/([A-Za-z0-9_.-]+\.png)", DET))
for f in imgs:
    shutil.copy(os.path.join(SEQ, "images", f), os.path.join(SITE, IMG_DIR, f))
for num, theme, fiche, sortie in [
    (1, "Proportions", "Séquence 4 - Exercices Partie 1 - Proportions - Corrigé.tex", "sequence4-correction-partie1.html"),
    (2, "Taux d'évolution et coefficient multiplicateur", "Séquence 4 - Exercices Partie 2 - Taux et coefficient multiplicateur - Corrigé.tex", "sequence4-correction-partie2.html"),
    (3, "Évolutions successives et réciproques", "Séquence 4 - Exercices Partie 3 - Évolutions successives et réciproques - Corrigé.tex", "sequence4-correction-partie3.html"),
]:
    print(page(num, theme, fiche, sortie))
print("macros non traitées :", sorted(INCONNUES))
