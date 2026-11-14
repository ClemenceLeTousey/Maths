/* Exercices interactifs : connexion élève, enregistrement des résultats, déroulé d'un exercice.
   Nécessite config.js, expr.js et KaTeX. */
(function () {
    'use strict';

    var CFG = window.INTERACTIF_CONFIG;
    var CLE_SESSION = 'interactif-session';
    var CLE_ATTENTE = 'interactif-attente';

    /* ---------- Stockage local (protégé : peut être bloqué) ---------- */
    function lireLocal(cle) { try { return JSON.parse(localStorage.getItem(cle)); } catch (e) { return null; } }
    function ecrireLocal(cle, v) {
        try { if (v == null) localStorage.removeItem(cle); else localStorage.setItem(cle, JSON.stringify(v)); } catch (e) {}
    }

    /* ---------- Appels à la base ---------- */
    function rpc(fonction, args) {
        var entetes = { 'Content-Type': 'application/json', apikey: CFG.cle };
        if (!/^sb_/.test(CFG.cle)) entetes.Authorization = 'Bearer ' + CFG.cle; // ancienne clé « anon »
        return fetch(CFG.url + '/rest/v1/rpc/' + fonction, {
            method: 'POST', headers: entetes, body: JSON.stringify(args || {})
        }).then(function (r) {
            return r.text().then(function (t) {
                var d = t ? JSON.parse(t) : null;
                if (!r.ok) throw new Error((d && d.message) || 'Erreur du serveur (' + r.status + ')');
                return d;
            });
        }, function () { throw new Error('Pas de connexion internet ?'); });
    }

    function session() { return lireLocal(CLE_SESSION); }
    // connexion / déconnexion : la cloche (site.js) s'installe ou se retire sans recharger la page
    function signalerSession() { try { window.dispatchEvent(new Event('interactif-session')); } catch (e) {} }

    function connecter(code, mdp) {
        return rpc('connexion', { p_code: code, p_mdp: mdp }).then(function (s) {
            ecrireLocal(CLE_SESSION, s);
            ecrireLocal('interactif-derniere-connexion', new Date().toISOString());
            signalerSession();
            return s;
        });
    }

    function deconnecter() {
        var s = session();
        ecrireLocal(CLE_SESSION, null);
        signalerSession();
        if (s) {
            var fin = function () { return rpc('deconnexion', { p_jeton: s.jeton }); };
            rpc('quitter_presence', { p_jeton: s.jeton }).then(fin, fin).catch(function () {});
        }
    }

    /* ---------- Présence (onglet « En ligne » de l'espace professeure) ----------
       Tant qu'une page de l'espace élève est ouverte ET visible, elle signale l'élève connecté
       toutes les minutes (code + page). Rien quand l'onglet est caché, ni sur la page professeure.
       Sans le script maj-en-ligne.sql dans Supabase, l'appel échoue en silence. */
    var PRESENCE_MS = 60000, dernierePresence = 0;
    function pagePresence() {
        var chemin = location.pathname.replace(/^.*\/espace-eleve\//, '') + location.search;
        if (/(^|\/)(index\.html)?$/.test(location.pathname.replace(/^.*\/espace-eleve/, ''))) {
            var onglet = (location.hash || '').replace('#', '');
            var ONGLETS = { automatismes: 'Automatismes', tp: 'Python', evaluations: 'Évaluations', soutien: 'Soutien', echange: 'Messages', remediation: 'Remédiation' };
            return 'Espace élève · ' + (ONGLETS[onglet] || 'Automatismes');
        }
        var cat = (window.INTERACTIF_CATALOGUE || []).filter(function (x) { return x.url === chemin; })[0];
        return cat ? cat.court : (document.title || chemin);
    }
    function signalerPresence(force) {
        var s = session();
        if (!s || document.hidden || /\/prof\.html$/.test(location.pathname)) return;
        if (!force && Date.now() - dernierePresence < PRESENCE_MS - 2000) return;
        dernierePresence = Date.now();
        rpc('signaler_presence', { p_jeton: s.jeton, p_page: pagePresence() }).catch(function () {});
    }
    setInterval(signalerPresence, PRESENCE_MS);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) signalerPresence(); });
    window.addEventListener('interactif-session', function () { signalerPresence(true); });
    window.addEventListener('hashchange', function () { signalerPresence(true); });
    setTimeout(function () { signalerPresence(true); }, 1500);

    /* Résultats non envoyés (réseau coupé) : gardés et renvoyés plus tard */
    function envoyerAttente() {
        var s = session(), file = lireLocal(CLE_ATTENTE) || [];
        if (!s || !file.length) return Promise.resolve();
        var r = file[0];
        if (r.code !== s.code) { file.shift(); ecrireLocal(CLE_ATTENTE, file); return envoyerAttente(); }
        return rpc('enregistrer', {
            p_jeton: s.jeton, p_exercice: r.exercice, p_score: r.score, p_total: r.total,
            p_details: r.details, p_duree: r.duree
        }).then(function () {
            ecrireLocal(CLE_ATTENTE, (lireLocal(CLE_ATTENTE) || []).slice(1));
            return envoyerAttente();
        });
    }

    // enregistre un résultat et l'indique dans l'élément etat
    function sauver(r, etat) {
        if (!session()) { etat.textContent = 'Tu n\'es pas connecté(e) : ce résultat n\'est pas enregistré.'; return; }
        etat.textContent = 'Enregistrement…';
        enregistrer(r).then(function () { etat.textContent = '✓ Résultat enregistré.'; },
            function (x) { etat.textContent = 'Résultat gardé sur cet appareil, il sera envoyé plus tard (' + x.message + ').'; });
    }

    function enregistrer(r) {
        var s = session();
        if (!s) return Promise.reject(new Error('non connecté'));
        r.code = s.code;
        ecrireLocal(CLE_ATTENTE, (lireLocal(CLE_ATTENTE) || []).concat([r]));
        return envoyerAttente();
    }

    /* ---------- Petits outils ---------- */
    function el(tag, classe, texte) {
        var e = document.createElement(tag);
        if (classe) e.className = classe;
        if (texte != null) e.textContent = texte;
        return e;
    }

    function maths(cible, tex, bloc) {
        if (window.katex) katex.render(tex, cible, { throwOnError: false, displayMode: !!bloc });
        else cible.textContent = tex;
    }

    /* Texte « mixte » (HTML + maths entre $...$ ou $$...$$) -> HTML */
    function mixte(s) {
        return String(s).replace(/\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g, function (tout, bloc, enLigne) {
            if (!window.katex) return tout;
            return katex.renderToString(bloc || enLigne, { throwOnError: false, displayMode: !!bloc });
        });
    }

    var alea = {
        entier: function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
        nonNul: function (a, b) { var n; do { n = alea.entier(a, b); } while (n === 0); return n; },
        choix: function (t) { return t[Math.floor(Math.random() * t.length)]; },
        signe: function () { return Math.random() < 0.5 ? -1 : 1; }
    };

    /* poly([3, -2, 1]) -> "3x^2-2x+1" (lisible par Expr et par KaTeX) */
    function poly(coefs, lettre) {
        lettre = lettre || 'x';
        var s = '', d = coefs.length - 1;
        coefs.forEach(function (c, i) {
            var deg = d - i;
            if (c === 0) return;
            var abs = Math.abs(c), signe = c < 0 ? '-' : (s ? '+' : '');
            var partie = deg === 0 ? '' : deg === 1 ? lettre : lettre + '^' + deg;
            var nombre = (abs === 1 && deg > 0) ? '' : String(abs);
            s += signe + nombre + partie;
        });
        return s || '0';
    }

    /* Nombre entre parenthèses s'il est négatif : 3 \times (-2) */
    function par(n) { return n < 0 ? '(' + n + ')' : String(n); }

    /* ---------- Bandeau de connexion ---------- */
    function bandeau(cible, auChangement) {
        cible.innerHTML = '';
        var s = session();
        if (s) {
            var p = el('p', 'connecte');
            p.appendChild(document.createTextNode('Connecté(e) : '));
            p.appendChild(el('strong', null, s.code));
            p.appendChild(document.createTextNode(' · '));
            var b = el('button', 'lien', 'Ce n\'est pas moi / Se déconnecter');
            b.type = 'button';
            b.onclick = function () { deconnecter(); bandeau(cible, auChangement); if (auChangement) auChangement(null); };
            p.appendChild(b);
            cible.appendChild(p);
            return;
        }
        var f = el('form', 'connexion');
        f.innerHTML =
            '<p class="connexion-titre">Connecte-toi pour que tes résultats soient enregistrés</p>' +
            '<label>Identifiant <input name="code" autocomplete="username" placeholder="2B-EULER" required></label>' +
            '<label>Mot de passe <input name="mdp" type="password" autocomplete="current-password" required></label>' +
            '<button type="submit">Se connecter</button><p class="erreur" aria-live="polite"></p>';
        f.onsubmit = function (e) {
            e.preventDefault();
            var err = f.querySelector('.erreur');
            err.textContent = 'Connexion…';
            connecter(f.code.value, f.mdp.value).then(function (s) {
                bandeau(cible, auChangement);
                envoyerAttente().catch(function () {});
                if (auChangement) auChangement(s);
            }, function (x) { err.textContent = x.message; });
        };
        cible.appendChild(f);
    }

    /* Boutons English / Nederlands (def.traduction, seconde/traduction.js) : traduction de l'énoncé
       affichée sous la question ; rien n'est affiché si une phrase n'est pas couverte. */
    function traductions(q, li, tete) {
        var src = q.texte != null ? q.texte : q.consigne;
        var trads = Traduction.langues.map(function (l) {
            var t = Traduction.traduire(src, l[0]);
            if (t != null && q.texte == null && q.enonce) t += ' $' + q.enonce + '$';
            return t;
        });
        if (trads.some(function (t) { return t == null; })) return;
        var meta = li.querySelector('.q-meta');
        if (!meta) { meta = el('div', 'q-meta'); li.insertBefore(meta, tete); }
        var barre = el('span', 'q-langues'), boite = el('div', 'q-traduction'), boutons = [];
        boite.hidden = true;
        Traduction.langues.forEach(function (l, k) {
            var b = el('button', 'q-langue');
            b.type = 'button'; b.lang = l[0]; b.title = l[1]; b.setAttribute('aria-label', l[1]);
            b.innerHTML = l[2] || l[1];
            b.setAttribute('aria-pressed', 'false');
            b.addEventListener('click', function () {
                var ouvert = b.getAttribute('aria-pressed') === 'true';
                boutons.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
                li.langue = ouvert ? null : l[0];       // langue choisie : le rappel suit
                if (li.majRappel) li.majRappel();
                if (ouvert) { boite.hidden = true; return; }
                b.setAttribute('aria-pressed', 'true');
                boite.lang = l[0];
                boite.innerHTML = mixte(trads[k]);
                boite.hidden = false;
            });
            boutons.push(b); barre.appendChild(b);
        });
        meta.appendChild(barre);
        tete.parentNode.insertBefore(boite, tete.nextSibling);
    }

    /* ---------- Déroulé d'un exercice ----------
       def = { id, titre, nb, generer: function (i) -> question,
               parNiveau (séries verte/bleue/rouge), parQuestion (avec parNiveau : chaque question se valide seule) }
       question = { consigne, enonce (TeX), prefixe (TeX), attendu (texte), forme: 'developpee' | 'factorisee' (+ facteur) | null,
                    irreductible (type 'nombre' : fraction irréductible exigée),
                    correction: [lignes TeX alignées sur =] } */
    function exercice(def) {
        var zone = document.getElementById('exercice');
        var zoneBandeau = document.getElementById('bandeau');
        bandeau(zoneBandeau);
        envoyerAttente().catch(function () {});

        function lancer() {
            zone.innerHTML = '';
            var debut = Date.now(), repondues = 0, score = 0, details = [], reprises = [], enregistre = false, conv = null;
            var liste = el('ol', 'questions');
            zone.appendChild(liste);

            var bilan = el('div', 'bilan');
            zone.appendChild(bilan);

            if (def.parNiveau) paliers();
            else if (def.chrono) { chrono(); return; }
            else for (var i = 0; i < def.nb; i++) liste.appendChild(question(def.generer(i), i));

            var premier = liste.querySelector('input');
            if (premier) premier.focus();

            function question(q, i, essai) {
                var li = el('li', 'q');
                if (q.objectif || q.niveau) {
                    var meta = el('div', 'q-meta');
                    if (q.niveau) {
                        var et = el('span', 'q-niveau n' + q.niveau);
                        et.textContent = '★★★'.slice(0, q.niveau) + '☆☆☆'.slice(0, 3 - q.niveau);
                        et.title = 'Niveau ' + q.niveau;
                        meta.appendChild(et);
                    }
                    if (q.objectif) meta.appendChild(el('span', null, q.objectif));
                    li.appendChild(meta);
                }
                var tete = el('div', 'q-enonce');
                tete.appendChild(el('span', 'q-num', String(i + 1)));
                if (q.texte != null) { var t = el('div', 'q-texte'); t.innerHTML = mixte(q.texte); tete.appendChild(t); }
                else {
                    if (q.consigne) tete.appendChild(el('span', 'q-consigne', q.consigne + ' '));
                    var e = el('span'); maths(e, q.enonce); tete.appendChild(e);
                }
                li.appendChild(tete);
                if (def.traduction && window.Traduction) traductions(q, li, tete);
                // figure (SVG) : affichée sous l'énoncé, non enregistrée (seule q.figureNote l'est)
                if (q.figure) { var fig = el('div', 'q-figure'); fig.innerHTML = q.figure; li.appendChild(fig); }

                var saisie = el('div', 'q-saisie');
                var apercu = el('div', 'q-apercu');
                var retour = el('div', 'q-retour');
                var bouton = el('button', null, 'Valider'); bouton.type = 'button';
                var type = q.type || 'expr', lire, champs = [];

                function champ(classe) {
                    var c = el('input', classe);
                    c.autocomplete = 'off'; c.spellcheck = false; c.setAttribute('autocapitalize', 'off');
                    c.setAttribute('aria-label', 'Réponse ' + (i + 1));
                    c.addEventListener('keydown', function (ev) {
                        if (ev.key !== 'Enter') return;
                        if (def.chrono) { if (li.entree) li.entree(); }
                        else if (!def.parNiveau || def.parQuestion) valider();
                    });
                    c.addEventListener('input', function () { retour.textContent = ''; retour.className = 'q-retour'; });
                    champs.push(c);
                    return c;
                }
                function prefixe() {
                    if (q.prefixe) { var pf = el('span', 'q-prefixe'); maths(pf, q.prefixe); saisie.appendChild(pf); }
                }
                function nombre(texte) { var v = Expr.valeur(Expr.lire(texte, ''), {}); if (!isFinite(v)) throw new Error('?'); return v; }
                function proche(u, v) { return Math.abs(u - v) < 1e-9 * Math.max(1, Math.abs(v)); }

                if (type === 'expr' || type === 'nombre') {
                    prefixe();
                    var c = champ(); saisie.appendChild(c);
                    var lettres = type === 'expr' ? (q.variables || 'x') : '';
                    var attendu = type === 'expr' ? Expr.lire(q.attendu, lettres) : null;
                    // type 'nombre' : calcul intermédiaire permis (0,4+0,23=0,63), la réponse est le dernier membre
                    function membres() {
                        return type === 'nombre' ? c.value.split('=') : [c.value];
                    }
                    c.addEventListener('input', function () {
                        if (!c.value.trim()) { apercu.textContent = ''; return; }
                        var ms = membres();
                        if (ms.length > 1 && !ms[ms.length - 1].trim()) ms.pop(); // « = » qu'on vient de taper
                        try { maths(apercu, (q.prefixe ? q.prefixe + ' ' : '') + ms.map(function (m) { return Expr.tex(Expr.lire(m, lettres)); }).join('=')); apercu.classList.remove('illisible'); }
                        catch (x) { apercu.textContent = x.message; apercu.classList.add('illisible'); }
                    });
                    lire = function () {
                        if (type === 'nombre') {
                            var ms = membres();
                            if (ms.some(function (m) { return !m.trim(); })) return { attention: 'Termine ton calcul : il manque un nombre autour d\'un signe « = ».' };
                            var arbres = ms.map(function (m) { return Expr.lire(m, ''); }), fin = arbres[arbres.length - 1];
                            if (q.decimal) {
                                if (/[\/]/.test(ms[ms.length - 1])) return { attention: 'Donne l\'écriture décimale (sans fraction).' };
                                if (ms.length > 1 && fin.t !== 'num' && !(fin.t === 'neg' && fin.a.t === 'num'))
                                    return { attention: 'Termine le calcul : écris un seul nombre après le dernier « = ».' };
                            }
                            var okN = arbres.every(function (a) { return proche(Expr.valeur(a, {}), q.attendu); });
                            if (okN && q.irreductible) {     // fraction attendue sous forme irréductible
                                var der = ms[ms.length - 1].replace(/\s/g, ''), mf = /^[-+]?\(?(-?\d+)\)?\/\(?(-?\d+)\)?$/.exec(der);
                                var pg = function (x, y) { x = Math.abs(x); y = Math.abs(y); while (y) { var t = y; y = x % y; x = t; } return x; };
                                if (mf && pg(+mf[1], +mf[2]) > 1) return { attention: 'C\'est égal, mais simplifie ta fraction (fraction irréductible).' };
                                if (mf && Math.abs(+mf[2]) === 1) return { attention: 'C\'est égal, mais écris simplement le nombre entier.' };
                                if (!mf && Math.abs(q.attendu % 1) > 1e-9) return { attention: 'Écris le résultat sous la forme d\'une fraction irréductible, par exemple 7/12.' };
                            }
                            return { ok: okN, r: c.value };
                        }
                        var arbre = Expr.lire(c.value, lettres);
                        var juste = Expr.egales(arbre, attendu, lettres);
                        if (juste && q.forme === 'developpee' && !Expr.developpeeReduite(arbre))
                            return { attention: 'C\'est égal, mais ce n\'est pas encore développé et réduit : continue !' };
                        if (juste && q.forme === 'factorisee') {
                            // un produit, dont une parenthèse est le facteur attendu (q.facteur), au signe près
                            var n = arbre, fs = [];
                            while (n.t === 'neg') n = n.a;
                            // (x-5)^2 compte comme le produit (x-5)(x-5)
                            (function facteurs(m) { if (m.t === '*') { facteurs(m.a); facteurs(m.b); } else if (m.t === '^' && m.a.t === 'par') fs.push(m.a); else fs.push(m); })(n);
                            var pars = fs.filter(function (f) { return f.t === 'par'; });
                            if ((n.t !== '*' && !(n.t === '^' && n.a.t === 'par')) || !pars.length)
                                return { attention: 'C\'est égal, mais ce n\'est pas un produit : factorise !' };
                            if (q.facteur) {
                                var fa = Expr.lire(q.facteur, lettres), oppose = { t: 'neg', a: fa };
                                if (!pars.some(function (f) { return Expr.egales(f.a, fa, lettres) || Expr.egales(f.a, oppose, lettres); }))
                                    return { attention: 'C\'est égal, mais on peut encore factoriser : cherche le plus grand facteur commun.' };
                                if (lettres === 'x' && !pars.every(function (f) { return Expr.developpeeReduite(f.a); }))
                                    return { attention: 'C\'est presque ça : réduis ce qu\'il y a dans la parenthèse.' };
                            }
                        }
                        return { ok: juste, r: c.value };
                    };
                } else if (type === 'champs') {
                    // gabarit : texte mixte où chaque [] devient une case ; attendus : nombres
                    var morceaux = q.gabarit.split('[]');
                    morceaux.forEach(function (m, k) {
                        if (m) { var sp = el('span', 'q-gabarit'); sp.innerHTML = mixte(m); saisie.appendChild(sp); }
                        if (k < morceaux.length - 1) saisie.appendChild(champ('court'));
                    });
                    lire = function () {
                        var vals = champs.map(function (c) { return nombre(c.value); });
                        return { ok: vals.every(function (v, k) { return proche(v, q.attendus[k]); }), r: champs.map(function (c) { return c.value; }).join(' ; ') };
                    };
                } else if (type === 'ordre') {
                    var cc = champ('lettres'); cc.placeholder = 'lettres';
                    saisie.appendChild(cc);
                    lire = function () {
                        var r = cc.value.toUpperCase().replace(/[^A-Z]/g, '');
                        if (r.length !== q.attendu.length) return { attention: q.aideLettres || 'Écris les ' + q.attendu.length + ' lettres, du plus petit au plus grand.' };
                        return { ok: r === q.attendu, r: r };
                    };
                } else if (type === 'qcm') {
                    var choix = -1, groupe = el('div', 'q-qcm');
                    q.options.forEach(function (o, k) {
                        var b = el('button', 'q-option'); b.type = 'button';
                        b.innerHTML = '<span class="q-lettre">' + 'ABCDEF'[k] + '</span> ' + mixte(o);
                        b.onclick = function () {
                            if (b.disabled) return;
                            choix = k;
                            groupe.querySelectorAll('.q-option').forEach(function (x) { x.classList.remove('choisie'); });
                            b.classList.add('choisie');
                            retour.textContent = '';
                        };
                        groupe.appendChild(b);
                    });
                    saisie.appendChild(groupe);
                    lire = function () {
                        if (choix < 0) return { attention: 'Choisis une réponse.' };
                        return { ok: choix === q.bonne, r: 'ABCDEF'[choix] };
                    };
                }
                // parQuestion (avec parNiveau) : un bouton « Valider » par question, en plus du bouton de la série
                if ((!def.parNiveau || def.parQuestion) && !def.chrono) saisie.appendChild(bouton);
                li.appendChild(saisie);
                li.appendChild(apercu); li.appendChild(retour);

                // questions vertes : rappel de méthode à la demande (noté dans le détail pour la professeure)
                var aide = false, btnRappel = null;
                if (q.rappel && !def.chrono) {
                    // rappel dans la langue choisie avec les drapeaux (li.langue), s'il est traduit ; sinon en français
                    var boiteRappel = null;
                    var rappelTraduit = function () {
                        var lg = li.langue, t = lg && window.Traduction && Traduction.rappel ? Traduction.rappel(q.rappelNom, lg, q.rappel) : null;
                        return t ? { lg: lg, texte: t, mots: Traduction.textes[lg] } : null;
                    };
                    var libelleRappel = function () {
                        var tr = rappelTraduit();
                        btnRappel.textContent = tr ? tr.mots.bouton : 'Je ne sais pas, j\'ai besoin d\'un rappel';
                        if (tr) btnRappel.lang = tr.lg; else btnRappel.removeAttribute('lang');
                    };
                    var remplirRappel = function () {
                        var tr = rappelTraduit();
                        boiteRappel.lang = tr ? tr.lg : 'fr';
                        boiteRappel.innerHTML = tr
                            ? '<strong>' + tr.mots.titre + '</strong><br>' + mixte(tr.texte) + '<br><em>' + tr.mots.fin + '</em>'
                            : '<strong>Rappel</strong><br>' + mixte(q.rappel) + '<br><em>À toi maintenant : réponds à la question.</em>';
                    };
                    li.majRappel = function () { if (boiteRappel) remplirRappel(); else if (btnRappel) libelleRappel(); };
                    btnRappel = el('button', 'secondaire rappel-btn'); btnRappel.type = 'button';
                    libelleRappel();
                    btnRappel.onclick = function () {
                        aide = true;
                        boiteRappel = el('div', 'q-rappel');
                        remplirRappel();
                        btnRappel.replaceWith(boiteRappel);
                        btnRappel = null;
                        var c0 = li.querySelector('input:not([disabled])');
                        if (c0) c0.focus();
                    };
                    li.appendChild(btnRappel);
                }
                bouton.onclick = valider;

                // Lit la réponse ; renvoie null (avec un message) si elle est vide ou mal écrite
                function controler() {
                    var res;
                    if (champs.length && champs.some(function (c) { return !c.value.trim(); })) {
                        retour.textContent = 'Réponse manquante.'; retour.className = 'q-retour attention'; return null;
                    }
                    try { res = lire(); }
                    catch (x) { retour.textContent = 'Corrige ta saisie avant de valider.'; retour.className = 'q-retour attention'; return null; }
                    if (res.attention) { retour.textContent = res.attention; retour.className = 'q-retour attention'; return null; }
                    return res;
                }
                function valider() {
                    if (bouton.disabled) return;
                    var res = controler();
                    if (res) appliquer(res);
                }
                li.controler = controler;
                li.appliquer = function (res) { appliquer(res); };

                function appliquer(res) {
                    var juste = res.ok;
                    bouton.disabled = true; bouton.remove();
                    if (btnRappel) { btnRappel.remove(); btnRappel = null; }
                    champs.forEach(function (c) { c.disabled = true; });
                    li.querySelectorAll('.q-option').forEach(function (b, k) {
                        b.disabled = true;
                        if (k === q.bonne) b.classList.add('bonne');
                    });
                    li.classList.add(juste ? 'juste' : 'faux');
                    retour.className = 'q-retour';
                    retour.textContent = juste ? '✓ Bravo !' : futur() ? '✗ Nom de Zeus ! Correction :' : halloween() ? '✗ Bouh ! Correction :' : '✗ Ce n\'est pas ça. Correction :';
                    if (q.correction || q.explication) {
                        var c = el('div', 'q-correction');
                        if (q.correction) maths(c, '\\begin{aligned}' + q.correction.join('\\\\') + '\\end{aligned}', true);
                        else c.innerHTML = mixte(q.explication);
                        li.appendChild(c);
                    }
                    var d = q.texte != null ? { t: q.texte + (q.figureNote ? ' <i>(figure : ' + q.figureNote + ')</i>' : ''), r: res.r, ok: juste } : { q: q.enonce, r: res.r, ok: juste };
                    if (type === 'qcm') d.b = 'ABCDEF'[q.bonne];
                    if (q.niveau) d.n = q.niveau;
                    if (aide) d.aide = 1;
                    li.d = d;
                    li.fait = true;
                    if (li.apresValidation) li.apresValidation();
                    if (def.parQuestion) {           // on passe à la question suivante de la série
                        var prochaine = li.nextElementSibling && li.nextElementSibling.querySelector('input:not([disabled]), .q-option:not([disabled])');
                        if (prochaine) prochaine.focus();
                    }
                    if (essai > 1) {             // série refaite : gardée dans le détail, hors score
                        d.e = essai;
                        if (!enregistre && !def.parNiveau) reprises.push(d);
                        return;
                    }
                    repondues++; if (juste) score++;
                    details[i] = d;
                    var suivant = !def.parNiveau && li.nextElementSibling && li.nextElementSibling.querySelector('input, .q-option');
                    if (suivant) suivant.focus();
                    if (repondues === def.nb && !def.parNiveau) terminer(score);
                }
                return li;
            }

            /* Mode « par niveau » : série verte, puis bleue, puis rouge, un bouton « Valider mes réponses »
               par série. Après validation : refaire la série avec d'autres nombres, ou passer à la suivante.
               Chaque série validée est enregistrée tout de suite (une ligne par couleur), pour qu'un élève
               puisse s'arrêter après la verte. Les reprises sont enregistrées aussi : pour chaque couleur,
               c'est le meilleur essai qui compte (bilanCouleurs). */
            function paliers() {
                var NOMS = { 1: 'Série verte', 2: 'Série bleue', 3: 'Série rouge' };
                var indices = {}, ordre = [];
                for (var i = 0; i < def.nb; i++) {
                    var n = def.niveau ? def.niveau(i) : def.generer(i).niveau || 1;
                    if (!indices[n]) { indices[n] = []; ordre.push(n); }
                    indices[n].push(i);
                }
                var meilleurs = {};             // meilleur essai de chaque couleur
                liste.remove();
                conv = convecteur(def.nb);
                zone.insertBefore(conv.bloc, bilan);
                ouvrir(0, 1);

                function ouvrir(k, essai) {
                    var n = ordre[k];
                    var bloc = el('section', 'palier p' + n);
                    var titre = el('h2', 'palier-titre');
                    titre.appendChild(el('span', 'q-niveau n' + n, '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n)));
                    titre.appendChild(document.createTextNode(' ' + (NOMS[n] || 'Niveau ' + n) + (essai > 1 ? ' · essai ' + essai : '')));
                    bloc.appendChild(titre);
                    var ol = el('ol', 'questions');
                    var lis = indices[n].map(function (i) { var li = question(def.generer(i), i, essai); ol.appendChild(li); return li; });
                    bloc.appendChild(ol);
                    var b = el('button', 'valider-palier', def.parQuestion ? 'Valider toutes mes réponses' : 'Valider mes réponses'); b.type = 'button';
                    var msg = el('p', 'palier-msg'), t0 = Date.now(), fini = false;
                    var actions = el('div', 'palier-actions');
                    // parQuestion : la série se termine (score, enregistrement) quand sa dernière question est validée
                    if (def.parQuestion) lis.forEach(function (li) {
                        li.apresValidation = function () { if (!fini && lis.every(function (x) { return x.fait; })) finir(); };
                    });
                    b.onclick = function () {
                        var restantes = lis.filter(function (li) { return !li.fait; });
                        var reponses = restantes.map(function (li) { return li.controler(); });
                        if (reponses.some(function (r) { return !r; })) {
                            msg.textContent = 'Réponds à toutes les questions de la série (voir les messages en orange).';
                            return;
                        }
                        restantes.forEach(function (li, j) { li.appliquer(reponses[j]); });
                        if (!fini) finir();
                    };
                    function finir() {
                        fini = true;
                        b.remove();
                        var bons = lis.filter(function (li) { return li.classList.contains('juste'); }).length;
                        msg.textContent = (NOMS[n] || 'Niveau ' + n) + ' : ' + bons + ' / ' + lis.length +
                            (bons === lis.length ? (futur() ? ' — 88 miles à l\'heure !' : halloween() ? ' — ensorcelant !' : ' — bravo !') : '');
                        meilleurs[n] = Math.max(meilleurs[n] || 0, bons);
                        var total = Object.keys(meilleurs).reduce(function (s, c) { return s + meilleurs[c]; }, 0);
                        conv.allumer(n, bons === lis.length, total);
                        var aides = lis.filter(function (li) { return li.d && li.d.aide; }).length;
                        if (aides) msg.appendChild(el('span', 'palier-aide', ' Tu as demandé ' + (aides > 1 ? aides + ' rappels' : 'un rappel') +
                            ' : refais la ' + (NOMS[n] || 'série').toLowerCase() + ' sans rappel pour vérifier que tu sais faire seul(e).'));
                        var etat = el('p', 'palier-etat');
                        bloc.appendChild(etat);
                        sauver({ exercice: def.id, score: bons, total: lis.length, details: lis.map(function (li) { return li.d; }),
                                 duree: Math.round((Date.now() - t0) / 1000) }, etat);
                        var refaire = el('button', 'secondaire', '↻ Refaire cette série avec d\'autres nombres'); refaire.type = 'button';
                        refaire.onclick = function () { actions.remove(); ouvrir(k, essai + 1); };
                        actions.appendChild(refaire);
                        if (ordre[k + 1]) {
                            var m = ordre[k + 1];
                            var suite = el('button', 'suite n' + m, (NOMS[m] || 'Niveau ' + m) + ' →'); suite.type = 'button';
                            suite.onclick = function () { actions.remove(); ouvrir(k + 1, 1); };
                            actions.appendChild(suite);
                        }
                        bloc.appendChild(actions);
                        if (Object.keys(meilleurs).length === ordre.length) terminer(total);
                    }
                    bloc.appendChild(b); bloc.appendChild(msg);
                    zone.insertBefore(bloc, bilan);
                    if (k > 0 || essai > 1) bloc.scrollIntoView({ behavior: 'smooth' });
                }
            }

            /* Mode chronométré (def.chrono(i) = secondes accordées à la question i) : une question à la fois,
               sans correction ni retour en arrière. « Valider » (ou Entrée) passe à la suivante ; à la fin du temps,
               la réponse saisie est prise si elle est lisible, sinon la question compte faux. À la fin, toutes les
               questions sont corrigées d'un coup et le résultat est enregistré (une ligne par bilan). */
            function chrono() {
                var lis = [], reponses = [], k = -1, fin = 0, minuteur = null;
                for (var i = 0; i < def.nb; i++) {
                    var li = question(def.generer(i), i);
                    li.hidden = true; lis.push(li); liste.appendChild(li);
                }
                liste.remove();
                var secondes = lis.map(function (li, j) { return def.chrono(j); });
                var total = secondes.reduce(function (s, t) { return s + t; }, 0);

                var accueil = el('div', 'chrono-accueil');
                accueil.innerHTML = '<p><strong>' + def.nb + ' questions chronométrées</strong>, de ' +
                    Math.min.apply(null, secondes) + ' à ' + Math.max.apply(null, secondes) + ' secondes chacune (' + duree(total) + ' au maximum).</p>' +
                    '<p>Les questions arrivent une par une. Quand tu as répondu, clique sur « Valider » (ou appuie sur Entrée) : tu passes à la suivante. ' +
                    'Quand le temps est écoulé, on passe tout seul à la suivante ; une réponse vide compte faux. Pas de retour en arrière.</p>' +
                    '<p>La correction s\'affiche à la fin. Prépare un brouillon !</p>';
                var go = el('button', 'chrono-go', 'Commencer ⏱'); go.type = 'button';
                accueil.appendChild(go);
                zone.insertBefore(accueil, bilan);

                var barre = el('div', 'chrono-barre');
                var pos = el('span', 'chrono-pos'), reste = el('span', 'chrono-reste');
                var jauge = el('div', 'chrono-jauge'), remplie = el('div');
                jauge.appendChild(remplie);
                barre.appendChild(pos); barre.appendChild(reste); barre.appendChild(jauge);
                var actions = el('div', 'chrono-actions');
                var valider = el('button', null, 'Valider →'); valider.type = 'button';
                var passer = el('button', 'secondaire', 'Je passe'); passer.type = 'button';
                var msg = el('p', 'chrono-msg');
                actions.appendChild(valider); actions.appendChild(passer); actions.appendChild(msg);
                valider.onclick = function () { suivante(false); };
                passer.onclick = function () { suivante(true); };

                go.onclick = function () {
                    accueil.remove();
                    zone.insertBefore(barre, bilan);
                    zone.insertBefore(liste, bilan);
                    zone.insertBefore(actions, bilan);
                    debut = Date.now();
                    montrer(0);
                };

                function duree(s) { return Math.floor(s / 60) + ' min ' + String(s % 60).padStart(2, '0'); }

                function montrer(j) {
                    k = j;
                    lis[j].hidden = false;
                    lis[j].entree = function () { suivante(false); };
                    pos.textContent = 'Question ' + (j + 1) + ' / ' + def.nb;
                    msg.textContent = '';
                    fin = Date.now() + secondes[j] * 1000;
                    clearInterval(minuteur);
                    minuteur = setInterval(tic, 200);
                    tic();
                    var c = lis[j].querySelector('input');
                    if (c) c.focus();
                    barre.scrollIntoView({ block: 'nearest' });
                }

                function tic() {
                    var ms = Math.max(0, fin - Date.now()), s = Math.ceil(ms / 1000);
                    reste.textContent = '⏱ ' + s + ' s';
                    remplie.style.width = (100 * ms / (secondes[k] * 1000)) + '%';
                    barre.classList.toggle('urgent', s <= 5);
                    if (ms <= 0) suivante(true, true);
                }

                // vide : « Je passe » ou fin du temps (la réponse saisie compte si elle est lisible)
                function suivante(vide, tempsEcoule) {
                    var li = lis[k], res = vide && !tempsEcoule ? null : li.controler();
                    if (!res) {
                        if (!vide) { msg.textContent = 'Réponds, ou clique sur « Je passe ».'; return; }
                        res = { ok: false, r: tempsEcoule ? '(temps écoulé)' : '(passée)' };
                        li.vide = tempsEcoule ? 'temps' : 'passe';
                    }
                    reponses[k] = res;
                    li.hidden = true; li.entree = null;
                    if (k + 1 < def.nb) montrer(k + 1);
                    else terminerChrono();
                }

                function terminerChrono() {
                    clearInterval(minuteur);
                    barre.remove(); actions.remove();
                    zone.appendChild(liste);             // la correction sous le score
                    lis.forEach(function (li, j) {
                        li.hidden = false;
                        li.appliquer(reponses[j]);
                        if (li.vide) li.querySelector('.q-retour').textContent = li.vide === 'temps' ? '⏱ Temps écoulé. Correction :' : '✗ Question passée. Correction :';
                    });
                }
            }

            // score = meilleur essai de chaque couleur (mode par niveau) ; rappelé après chaque reprise
            function terminer(score) {
                var premiere = !bilan.hasChildNodes();
                bilan.innerHTML = '';
                bilan.appendChild(el('p', 'bilan-score', (def.parNiveau ? 'Score (meilleur essai de chaque série) : ' : 'Score : ') + score + ' / ' + def.nb));
                if (conv) conv.terminer(score);
                var etat = el('p', 'bilan-etat');
                bilan.appendChild(etat);
                enregistre = true;
                if (def.parNiveau) etat.textContent = session() ? 'Chaque série est enregistrée dès que tu la valides.' : '';
                else sauver({ exercice: def.id, score: score, total: def.nb, details: details.concat(reprises.slice(-24)), duree: Math.round((Date.now() - debut) / 1000) }, etat);
                var encore = el('button', null, 'Nouvelle série'); encore.type = 'button';
                encore.onclick = function () { lancer(); window.scrollTo(0, 0); };
                bilan.appendChild(encore);
                if (premiere) bilan.scrollIntoView({ behavior: 'smooth' });
            }
        }
        lancer();
    }

    /* ---------- Mode Retour vers le futur (3e rond du logo) ----------
       Séries par niveau : un convecteur temporel dont les branches s'allument à chaque série validée
       (verte, bleue, rouge) ; la puissance monte avec le score : 1,21 gigowatt pour un sans-faute.
       Le bloc existe toujours mais n'est visible qu'en mode futur (le mode peut changer en cours de route). */
    function futur() { return document.documentElement.classList.contains('futur'); }
    function halloween() { return document.documentElement.classList.contains('halloween'); }   // 4e rond du logo

    function gw(x) { return x.toFixed(2).replace('.', ','); }

    function convecteur(nb) {
        var bloc = el('div', 'convecteur');
        bloc.setAttribute('aria-hidden', 'true');
        var branches = [[1, 24, 24], [2, 96, 24], [3, 60, 112]].map(function (b) {
            return '<line class="tube" x1="' + b[1] + '" y1="' + b[2] + '" x2="60" y2="64"/>' +
                '<line class="flux n' + b[0] + '" x1="' + b[1] + '" y1="' + b[2] + '" x2="60" y2="64"/>' +
                '<circle class="borne" cx="' + b[1] + '" cy="' + b[2] + '" r="6"/>';
        }).join('');
        bloc.innerHTML =
            '<svg viewBox="0 0 120 128" class="conv-schema">' +
            '<rect x="4" y="6" width="112" height="118" rx="8" class="boitier"/>' + branches +
            '<circle cx="60" cy="64" r="9" class="coeur"/></svg>' +
            '<div class="conv-infos"><span class="conv-nom">Convecteur temporel</span>' +
            '<span class="conv-gw">0,00</span><span class="conv-unite">gigowatt</span>' +
            '<p class="conv-msg">Valide la série verte pour allumer la première branche.</p></div>';
        var aff = bloc.querySelector('.conv-gw'), msg = bloc.querySelector('.conv-msg');

        function puissance(score) {
            var cible = 1.21 * score / nb, depart = parseFloat(aff.textContent.replace(',', '.')) || 0, t0 = performance.now();
            (function monter(now) {
                var t = Math.min(1, (now - t0) / 900);
                aff.textContent = gw(depart + (cible - depart) * t);
                if (t < 1) requestAnimationFrame(monter);
            })(t0);
        }
        return {
            bloc: bloc,
            // branche n allumée ; « pleine » si la série est sans faute ; score = total des meilleurs essais
            allumer: function (n, parfait, score) {
                var f = bloc.querySelector('.flux.n' + n);
                f.classList.add('on');
                if (parfait) f.classList.add('plein');
                puissance(score);
                if (n < 3) msg.textContent = 'Branche ' + ['verte', 'bleue'][n - 1] + ' allumée ! Passe à la série suivante.';
            },
            terminer: function (score) {
                puissance(score);
                if (score === nb) {
                    msg.textContent = '1,21 gigowatt ! Le convecteur est chargé : en route vers le futur !';
                    if (bloc.classList.contains('charge')) return;
                    bloc.classList.add('charge');
                    if (futur() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                        var e = el('div', 'conv-eclair');
                        document.body.appendChild(e);
                        setTimeout(function () { e.remove(); }, 1200);
                    }
                } else {
                    msg.textContent = gw(1.21 * score / nb) + ' gigowatt : il manquait ' + gw(1.21 * (nb - score) / nb) +
                        ' gigowatt pour voyager dans le temps. Refais une série pour faire monter la puissance !';
                }
            }
        };
    }

    /* Scores par couleur d'un résultat : {1: {ok, tot}, 2: …, 3: …} ou null */
    function couleurs(r) {
        var c = {}, det = (r && r.details) || [];
        // anciennes séries complètes : les reprises (d.e) sont jointes au détail, hors score ;
        // une ligne d'une seule couleur ne contient qu'un essai (premier ou reprise) : elle compte
        var reprise = det.length && det.every(function (d) { return !d || d.e; });
        det.forEach(function (d, k) {
            if (!d || (d.e && !reprise)) return;
            var n = d.n || (/serie\d+-j/.test(r.exercice) && r.total === 9 ? Math.floor(k / 3) + 1 : 0);
            if (!n) return;
            c[n] = c[n] || { ok: 0, tot: 0 };
            c[n].tot++; if (d.ok) c[n].ok++;
        });
        return Object.keys(c).length ? c : null;
    }

    /* Plusieurs résultats d'un même élève pour un même exercice : meilleur essai de chaque couleur
       {1: {ok, tot}, …} (null si l'exercice n'a pas de couleurs), nombre de séries faites
       (= séries vertes commencées) et meilleur résultat pour les exercices sans couleurs. */
    function bilanCouleurs(liste) {
        var c = {}, series = 0, meilleur = null;
        liste.forEach(function (r) {
            if (!meilleur || r.score / r.total > meilleur.score / meilleur.total) meilleur = r;
            var cr = couleurs(r);
            if (!cr) { series++; return; }
            if (cr[1] && !(r.details || []).every(function (d) { return !d || d.e; })) series++;
            Object.keys(cr).forEach(function (n) {
                if (!c[n] || cr[n].ok / cr[n].tot > c[n].ok / c[n].tot) c[n] = cr[n];
            });
        });
        return { couleurs: Object.keys(c).length ? c : null, series: series, meilleur: meilleur };
    }

    /* Pastilles colorées « 3/3 2/3 1/3 » dans un élément ;
       avec nonFaites, les couleurs pas encore faites (sur les 3) affichent « N.E. » (non évalué) */
    function pastilles(cible, c, nonFaites) {
        var NOMS = { 1: 'verte', 2: 'bleue', 3: 'rouge' };
        var niveaux = nonFaites ? ['1', '2', '3'] : Object.keys(c);
        niveaux.forEach(function (n) {
            var p = c[n] ? el('span', 'pastille n' + n, c[n].ok + '/' + c[n].tot) : el('span', 'pastille n' + n, 'N.E.');
            p.title = 'Série ' + (NOMS[n] || n) + (c[n] ? '' : ' : non évaluée');
            cible.appendChild(p);
        });
    }

    /* 2B -> seconde, 1TC -> premiere, TST2S -> terminale ; autre (TEST…) -> null = tout voir */
    function niveauClasse(classe) {
        var c = String(classe || '').toUpperCase();
        if (/^2/.test(c)) return 'seconde';
        if (/^1/.test(c)) return 'premiere';
        if (/^T(?!EST)/.test(c)) return 'terminale';
        return null;
    }

    /* Ouverture automatique d'une série (« ouverture: 'auto' » dans le catalogue, horaires dans OUVERTURE_SERIES) :
       date d'ouverture pour une classe, comptée à partir du lundi de « semaine du 23 au 27 novembre ». */
    var MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    var DECALAGE_JOUR = { lundi: 0, dimanche: -1, samedi: -2, vendredi: -3, jeudi: -4, mercredi: -5, mardi: -6 };
    function lundiGroupe(groupe) {
        var m = /semaine du (\d+)(?:er)?(?: ([a-zéû]+))? au (\d+)(?:er)? ([a-zéû]+)/i.exec(groupe || '');
        if (!m) return null;
        var mois = MOIS_FR.indexOf((m[2] || m[4]).toLowerCase());
        if (mois < 0) return null;
        var auj = new Date(), debut = auj.getMonth() >= 7 ? auj.getFullYear() : auj.getFullYear() - 1;
        var d = new Date(mois >= 7 ? debut : debut + 1, mois, +m[1]);
        return d.getDay() === 1 ? d : null;
    }
    function ouvertureSerie(ex, classe) {
        if (!ex || ex.ouverture !== 'auto') return null;
        var lundi = lundiGroupe(ex.groupe), regles = (window.OUVERTURE_SERIES || {})[ex.niveau] || {};
        if (!lundi) return null;
        var c = String(classe || '').toUpperCase(), noms = regles[c] ? [c] : Object.keys(regles), mieux = null;
        // classe sans horaire (comptes de test, vue prof) : la plus tôt des classes
        noms.forEach(function (n) {
            var r = regles[n], h = String(r.heure || '00:00').split(':');
            var d = new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + (DECALAGE_JOUR[r.jour] || 0), +h[0], +(h[1] || 0));
            if (!mieux || d < mieux) mieux = d;
        });
        return mieux || lundi;
    }
    /* Exercice visible pour cette session : pas archivé ; « comptes » = accès anticipé (tests) ;
       « ouverture: 'auto' » = visible de la classe à partir de son horaire d'ouverture */
    function visible(ex, s) {
        if (ex.archive) return false;
        var code = s ? String(s.code || '').toUpperCase() : '';
        if (ex.comptes && ex.comptes.indexOf(code) >= 0) return true;
        if (ex.ouverture === 'auto') { var d = ouvertureSerie(ex, classeSession(s)); return !!d && d <= new Date(); }
        return !ex.comptes;
    }
    /* Publiée pour au moins une classe (page prof) */
    function publie(ex) {
        if (ex.ouverture === 'auto') { var d = ouvertureSerie(ex, ''); return !!d && d <= new Date(); }
        return !ex.comptes;
    }

    /* Classe de la session (à défaut : début du code élève, ex. 2H-TARTAGLIA -> 2H) */
    function classeSession(s) {
        if (!s) return '';
        return String(s.classe || '').toUpperCase() || String(s.code || '').toUpperCase().split('-')[0];
    }
    /* TP clos pour la classe de l'élève (« fermeClasses » dans config.js) */
    function tpFerme(ex, s) {
        return !!(ex && ex.fermeClasses && s && ex.fermeClasses.indexOf(classeSession(s)) >= 0);
    }
    /* Empreinte du code d'accès d'un TP pour la session : codeAccesClasses[classe] s'il existe, sinon codeAcces ;
       TP clos pour la classe : « ferme », qu'aucune empreinte ne peut égaler */
    function codeAccesTP(ex, s) {
        if (!ex || !ex.codeAcces) return null;
        if (tpFerme(ex, s)) return 'ferme';
        var m = ex.codeAccesClasses, c = classeSession(s);
        return (m && c && m[c]) || ex.codeAcces;
    }

    /* Code d'accès temporaire d'un TP (« codeAccesTemporaire: { h: empreinte, min: 60, groupe: id } » dans config.js) :
       ouvre le TP pendant « min » minutes, une seule fois par élève (compte connecté obligatoire).
       La première saisie est enregistrée en base comme un résultat « <groupe>#acces-temp » : l'heure de départ
       est celle du serveur et l'usage unique vaut sur tous les appareils de l'élève ; le décompte suit l'heure d'internet. */
    function cleTemp(ex) { return 'tp-acces-temp:' + ((ex.codeAccesTemporaire && ex.codeAccesTemporaire.groupe) || ex.id); }

    /* Heure d'internet : l'en-tête « Date » renvoyé par le serveur du site (même origine, donc lisible),
       puis le chronomètre interne du navigateur (performance.now), que changer l'heure de l'ordinateur ne modifie pas.
       Sans réseau : heure de l'appareil. */
    var heureSite = null;
    function heureServeur() {
        if (heureSite) return heureSite;
        var t0 = performance.now();
        heureSite = fetch(location.pathname + '?heure=' + Date.now(), { method: 'HEAD', cache: 'no-store' }).then(function (r) {
            var d = Date.parse(r.headers.get('Date') || ''), t1 = performance.now();
            if (isNaN(d)) throw new Error('pas d’en-tête Date');
            var ref = d + 500 - (t1 + t0) / 2;   // l'en-tête est à la seconde près
            return function () { return ref + performance.now(); };
        }).catch(function () { return function () { return Date.now(); }; });
        return heureSite;
    }

    // fin de l'accès (ms) s'il est en cours sur cet appareil, -1 s'il est terminé, 0 sinon
    // (contrôle rapide à l'ouverture ; minuteurAcces revérifie aussitôt avec l'heure d'internet)
    function accesTemporaire(ex, s) {
        if (!ex || !ex.codeAccesTemporaire || !s || tpFerme(ex, s)) return 0;
        var t = lireLocal(cleTemp(ex));
        if (!t || t.code !== s.code) return 0;
        return !t.fini && t.fin > Date.now() ? t.fin : -1;
    }
    function ouvrirTemporaire(ex) {
        var T = ex.codeAccesTemporaire, s = session();
        if (!s) return Promise.reject(new Error('Connecte-toi d’abord à ton compte : ce code ne sert qu’une fois par élève.'));
        if (tpFerme(ex, s)) return Promise.reject(new Error('Ce TP est fermé pour ta classe.'));
        var id = (T.groupe || ex.id) + '#acces-temp', duree = (T.min || 60) * 60000;
        function debut() {
            return rpc('mes_resultats', { p_jeton: s.jeton }).then(function (l) {
                var d = (l || []).filter(function (r) { return r.exercice === id; })
                                 .map(function (r) { return new Date(r.fait_le).getTime(); }).sort()[0];
                return d || 0;
            });
        }
        return debut().then(function (d) {
            if (d) return d;
            return rpc('enregistrer', { p_jeton: s.jeton, p_exercice: id, p_score: 0, p_total: 1,
                                        p_details: { acces: 'temporaire', minutes: T.min || 60 }, p_duree: 0 }).then(debut);
        }).then(function (d) {
            if (!d) throw new Error('Impossible d’enregistrer l’accès, réessaie.');
            return heureServeur().then(function (maintenant) {
                var fin = d + duree, fini = fin <= maintenant();
                ecrireLocal(cleTemp(ex), { code: s.code, fin: fin, fini: fini });
                if (fini) throw new Error('Tu as déjà utilisé ce code : ton heure d’accès est terminée.');
                return fin;
            });
        });
    }
    // bandeau « il reste … min » pendant l'accès temporaire, décompté à l'heure d'internet ;
    // à la fin, l'accès est marqué terminé sur l'appareil et la page se recharge (TP refermé)
    function minuteurAcces(fin, ex) {
        var b = el('div', null);
        b.setAttribute('role', 'status');
        b.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:50;padding:6px 12px;border-radius:999px;' +
            'background:#fff6df;border:1.5px solid #c9a227;color:#3a2f00;font:600 0.9rem system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.15)';
        b.textContent = '⏱ Accès temporaire';
        document.body.appendChild(b);
        heureServeur().then(function (maintenant) {
            (function maj() {
                var r = fin - maintenant();
                if (r <= 0) {
                    if (ex) { var t = lireLocal(cleTemp(ex)); if (t) { t.fini = true; ecrireLocal(cleTemp(ex), t); } }
                    location.reload(); return;
                }
                var m = Math.ceil(r / 60000);
                b.textContent = '⏱ Accès temporaire : ' + (m > 1 ? 'il reste ' + m + ' min' : 'moins d’une minute');
                setTimeout(maj, Math.min(r, 20000));
            })();
        });
    }

    /* Script à exécuter sans le modifier (TP : après une prévision fausse, vérification d'un tableau) :
       éditeur en lecture seule ; si l'élève clique ou tape dedans, une fenêtre lui rappelle de cliquer sur ▶ Exécuter. */
    function fenetreScriptFige() {
        if (document.querySelector('.fige-fond')) return;
        var fond = document.createElement('div'); fond.className = 'fige-fond';
        var boite = document.createElement('div'); boite.className = 'fige-boite';
        boite.setAttribute('role', 'alertdialog'); boite.setAttribute('aria-modal', 'true'); boite.setAttribute('aria-labelledby', 'fige-texte');
        var p = document.createElement('p'); p.id = 'fige-texte';
        p.innerHTML = 'On ne te demande pas de modifier le script, mais juste de l’<b>exécuter</b> : clique sur <b>▶ Exécuter</b>.';
        var b = document.createElement('button'); b.type = 'button'; b.textContent = 'OK, j’ai compris';
        function fermer() { fond.remove(); document.removeEventListener('keydown', echap, true); }
        function echap(e) { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); fermer(); } }
        b.onclick = fermer;
        fond.onclick = function (e) { if (e.target === fond) fermer(); };
        document.addEventListener('keydown', echap, true);
        boite.appendChild(p); boite.appendChild(b); fond.appendChild(boite); document.body.appendChild(fond);
        b.focus();
    }
    function scriptFige(cm) {
        cm.setOption('readOnly', 'nocursor');
        var w = cm.getWrapperElement();
        w.classList.add('script-fige');
        w.title = 'Script à exécuter sans le modifier';
        // un tap sur téléphone produit aussi « mousedown » (pas un glissement pour faire défiler la page) ; barres de défilement permises
        w.addEventListener('mousedown', function (e) {
            if (e.target.closest && e.target.closest('.CodeMirror-hscrollbar, .CodeMirror-vscrollbar')) return;
            e.preventDefault(); fenetreScriptFige();
        });
        if (!document.getElementById('style-script-fige')) {
            var st = document.createElement('style'); st.id = 'style-script-fige';
            st.textContent = '.CodeMirror.script-fige { cursor: not-allowed; }' +
                '.CodeMirror.script-fige .CodeMirror-lines { cursor: not-allowed; }' +
                '.fige-fond { position: fixed; inset: 0; z-index: 3000; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; padding: 16px; }' +
                '.fige-boite { max-width: 420px; background: var(--surface, #fff); color: var(--text, #222); border-radius: 12px; padding: 20px 22px; box-shadow: 0 10px 30px rgba(0,0,0,.3); text-align: center; }' +
                '.fige-boite p { margin: 0 0 16px; font-size: 1.05rem; line-height: 1.5; }' +
                '.fige-boite button { font: inherit; font-weight: 600; padding: 8px 18px; border-radius: 8px; border: none; background: var(--c-seconde, #1c7ed6); color: #fff; cursor: pointer; }';
            document.head.appendChild(st);
        }
        return cm;
    }

    window.Interactif = {
        scriptFige: scriptFige,
        rpc: rpc, session: session, connecter: connecter, deconnecter: deconnecter,
        bandeau: bandeau, exercice: exercice, alea: alea, poly: poly, par: par, maths: maths, mixte: mixte, niveauClasse: niveauClasse, visible: visible, publie: publie, ouvertureSerie: ouvertureSerie, classeSession: classeSession, codeAccesTP: codeAccesTP, tpFerme: tpFerme, accesTemporaire: accesTemporaire, ouvrirTemporaire: ouvrirTemporaire, minuteurAcces: minuteurAcces, couleurs: couleurs, bilanCouleurs: bilanCouleurs, pastilles: pastilles
    };
})();
