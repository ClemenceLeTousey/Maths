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

    function connecter(code, mdp) {
        return rpc('connexion', { p_code: code, p_mdp: mdp }).then(function (s) {
            ecrireLocal(CLE_SESSION, s);
            ecrireLocal('interactif-derniere-connexion', new Date().toISOString());   // affichée par le mode Retour vers le futur
            return s;
        });
    }

    function deconnecter() {
        var s = session();
        ecrireLocal(CLE_SESSION, null);
        if (s) rpc('deconnexion', { p_jeton: s.jeton }).catch(function () {});
    }

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

    /* ---------- Déroulé d'un exercice ----------
       def = { id, titre, nb, generer: function (i) -> question }
       question = { consigne, enonce (TeX), prefixe (TeX), attendu (texte), forme: 'developpee' | null,
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
                    c.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' && !def.parNiveau) valider(); });
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
                    var attendu = type === 'expr' ? Expr.lire(q.attendu) : null;
                    c.addEventListener('input', function () {
                        if (!c.value.trim()) { apercu.textContent = ''; return; }
                        try { maths(apercu, (q.prefixe ? q.prefixe + ' ' : '') + Expr.tex(Expr.lire(c.value, lettres))); apercu.classList.remove('illisible'); }
                        catch (x) { apercu.textContent = x.message; apercu.classList.add('illisible'); }
                    });
                    lire = function () {
                        var arbre = Expr.lire(c.value, lettres);
                        if (type === 'nombre') {
                            if (q.decimal && /[\/]/.test(c.value)) return { attention: 'Donne l\'écriture décimale (sans fraction).' };
                            return { ok: proche(Expr.valeur(arbre, {}), q.attendu), r: c.value };
                        }
                        var juste = Expr.egales(arbre, attendu, lettres);
                        if (juste && q.forme === 'developpee' && !Expr.developpeeReduite(arbre))
                            return { attention: 'C\'est égal, mais ce n\'est pas encore développé et réduit : continue !' };
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
                        if (r.length !== q.attendu.length) return { attention: 'Écris les ' + q.attendu.length + ' lettres, du plus petit au plus grand.' };
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
                if (!def.parNiveau) saisie.appendChild(bouton);
                li.appendChild(saisie);
                li.appendChild(apercu); li.appendChild(retour);

                // questions vertes : rappel de méthode à la demande (noté dans le détail pour la professeure)
                var aide = false, btnRappel = null;
                if (q.rappel) {
                    btnRappel = el('button', 'secondaire rappel-btn', 'Je ne sais pas, j\'ai besoin d\'un rappel'); btnRappel.type = 'button';
                    btnRappel.onclick = function () {
                        aide = true;
                        var r = el('div', 'q-rappel');
                        r.innerHTML = '<strong>Rappel</strong><br>' + mixte(q.rappel) +
                            '<br><em>À toi maintenant : réponds à la question.</em>';
                        btnRappel.replaceWith(r);
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
                    retour.textContent = juste ? '✓ Bravo !' : futur() ? '✗ Nom de Zeus ! Correction :' : '✗ Ce n\'est pas ça. Correction :';
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
                    var b = el('button', 'valider-palier', 'Valider mes réponses'); b.type = 'button';
                    var msg = el('p', 'palier-msg'), t0 = Date.now();
                    var actions = el('div', 'palier-actions');
                    b.onclick = function () {
                        var reponses = lis.map(function (li) { return li.controler(); });
                        if (reponses.some(function (r) { return !r; })) {
                            msg.textContent = 'Réponds à toutes les questions de la série (voir les messages en orange).';
                            return;
                        }
                        lis.forEach(function (li, j) { li.appliquer(reponses[j]); });
                        b.remove();
                        var bons = lis.filter(function (li) { return li.classList.contains('juste'); }).length;
                        msg.textContent = (NOMS[n] || 'Niveau ' + n) + ' : ' + bons + ' / ' + lis.length +
                            (bons === lis.length ? (futur() ? ' — 88 miles à l\'heure !' : ' — bravo !') : '');
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
                    };
                    bloc.appendChild(b); bloc.appendChild(msg);
                    zone.insertBefore(bloc, bilan);
                    if (k > 0 || essai > 1) bloc.scrollIntoView({ behavior: 'smooth' });
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

    window.Interactif = {
        rpc: rpc, session: session, connecter: connecter, deconnecter: deconnecter,
        bandeau: bandeau, exercice: exercice, alea: alea, poly: poly, par: par, maths: maths, mixte: mixte, niveauClasse: niveauClasse, couleurs: couleurs, bilanCouleurs: bilanCouleurs, pastilles: pastilles
    };
})();
