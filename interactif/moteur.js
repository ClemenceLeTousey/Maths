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
            '<label>Identifiant <input name="code" autocomplete="username" placeholder="2B-07" required></label>' +
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
            var debut = Date.now(), repondues = 0, score = 0, details = [];
            var liste = el('ol', 'questions');
            zone.appendChild(liste);

            for (var i = 0; i < def.nb; i++) liste.appendChild(question(def.generer(i), i));

            var bilan = el('div', 'bilan');
            zone.appendChild(bilan);
            var premier = liste.querySelector('input');
            if (premier) premier.focus();

            function question(q, i) {
                var li = el('li', 'q');
                var tete = el('div', 'q-enonce');
                tete.appendChild(el('span', 'q-num', String(i + 1)));
                if (q.consigne) tete.appendChild(el('span', 'q-consigne', q.consigne + ' '));
                var e = el('span'); maths(e, q.enonce); tete.appendChild(e);
                li.appendChild(tete);

                var saisie = el('div', 'q-saisie');
                if (q.prefixe) { var pf = el('span', 'q-prefixe'); maths(pf, q.prefixe); saisie.appendChild(pf); }
                var champ = el('input');
                champ.autocomplete = 'off'; champ.spellcheck = false; champ.setAttribute('autocapitalize', 'off');
                champ.setAttribute('aria-label', 'Réponse ' + (i + 1));
                saisie.appendChild(champ);
                var bouton = el('button', null, 'Valider'); bouton.type = 'button';
                saisie.appendChild(bouton);
                li.appendChild(saisie);

                var apercu = el('div', 'q-apercu');
                var retour = el('div', 'q-retour');
                li.appendChild(apercu); li.appendChild(retour);

                var arbreAttendu = Expr.lire(q.attendu);

                champ.addEventListener('input', function () {
                    retour.textContent = ''; retour.className = 'q-retour';
                    if (!champ.value.trim()) { apercu.textContent = ''; return; }
                    try { maths(apercu, (q.prefixe ? q.prefixe + ' ' : '') + Expr.tex(Expr.lire(champ.value))); apercu.classList.remove('illisible'); }
                    catch (x) { apercu.textContent = x.message; apercu.classList.add('illisible'); }
                });
                champ.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') valider(); });
                bouton.onclick = valider;

                function valider() {
                    var arbre;
                    try { arbre = Expr.lire(champ.value); }
                    catch (x) { retour.textContent = 'Corrige ta saisie avant de valider.'; retour.className = 'q-retour attention'; return; }
                    var juste = Expr.egales(arbre, arbreAttendu);
                    if (juste && q.forme === 'developpee' && !Expr.developpeeReduite(arbre)) {
                        retour.textContent = 'C\'est égal, mais ce n\'est pas encore développé et réduit : continue !';
                        retour.className = 'q-retour attention';
                        return;
                    }
                    champ.disabled = true; bouton.remove();
                    li.classList.add(juste ? 'juste' : 'faux');
                    retour.className = 'q-retour';
                    retour.textContent = juste ? '✓ Bravo !' : '✗ Ce n\'est pas ça. Correction :';
                    if (q.correction) {
                        var c = el('div', 'q-correction');
                        maths(c, '\\begin{aligned}' + q.correction.join('\\\\') + '\\end{aligned}', true);
                        li.appendChild(c);
                    }
                    repondues++; if (juste) score++;
                    details[i] = { q: q.enonce, r: champ.value, ok: juste };
                    var suivant = li.nextElementSibling && li.nextElementSibling.querySelector('input');
                    if (suivant) suivant.focus();
                    if (repondues === def.nb) terminer();
                }
                return li;
            }

            function terminer() {
                bilan.innerHTML = '';
                bilan.appendChild(el('p', 'bilan-score', 'Score : ' + score + ' / ' + def.nb));
                var etat = el('p', 'bilan-etat');
                bilan.appendChild(etat);
                var r = { exercice: def.id, score: score, total: def.nb, details: details, duree: Math.round((Date.now() - debut) / 1000) };
                if (session()) {
                    etat.textContent = 'Enregistrement…';
                    enregistrer(r).then(function () { etat.textContent = '✓ Résultat enregistré.'; },
                        function (x) { etat.textContent = 'Résultat gardé sur cet appareil, il sera envoyé plus tard (' + x.message + ').'; });
                } else {
                    etat.textContent = 'Tu n\'es pas connecté(e) : ce résultat n\'est pas enregistré.';
                }
                var encore = el('button', null, 'Nouvelle série'); encore.type = 'button';
                encore.onclick = function () { lancer(); window.scrollTo(0, 0); };
                bilan.appendChild(encore);
                bilan.scrollIntoView({ behavior: 'smooth' });
            }
        }
        lancer();
    }

    window.Interactif = {
        rpc: rpc, session: session, connecter: connecter, deconnecter: deconnecter,
        bandeau: bandeau, exercice: exercice, alea: alea, poly: poly, par: par, maths: maths
    };
})();
