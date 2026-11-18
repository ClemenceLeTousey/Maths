/* ==========================================================================
   Sondage à la connexion
   Côté élève (index.html) : dès qu'un élève concerné est connecté et n'a pas encore répondu,
   une fenêtre s'ouvre avec la question. « Plus tard » la ferme jusqu'à la prochaine ouverture
   de l'espace élève (nouvel onglet ou navigateur relancé).
   Côté prof (prof.html) : onglet « Sondage », décompte des réponses et liste par élève.
   Nécessite le script maj-sondage.sql dans Supabase (une seule fois).

   POUR CHANGER DE QUESTION : modifier QUESTION ci-dessous et lui donner un NOUVEL id
   (sinon les élèves qui ont répondu à l'ancienne ne verront pas la nouvelle).
   Pour ne plus rien afficher : actif: false.
   ========================================================================== */
window.SONDAGE = (function () {
    'use strict';

    var QUESTION = {
        id: 'test-2026-11',            // lettres, chiffres, - ou _ (60 caractères au plus)
        actif: true,
        titre: 'Une petite question',
        question: 'Comment trouves-tu les automatismes en ce moment ?',
        choix: ['Trop faciles', 'Bien dosés', 'Un peu difficiles', 'Trop difficiles'],
        // Élèves concernés : codes précis et/ou classes entières. Les deux listes vides = tout le monde.
        codes: ['PROF-2NDE'],
        classes: []                    // ex. ['2B', '2F', '2H'] ou ['TST2S']
    };

    function concerne(s) {
        var q = QUESTION;
        if (!q.actif || !s) return false;
        if (!q.codes.length && !q.classes.length) return true;
        return q.codes.indexOf(String(s.code).toUpperCase()) >= 0 || q.classes.indexOf(s.classe) >= 0;
    }
    function cleReporte() { return 'sondage-plus-tard-' + QUESTION.id; }
    function reporte() { try { return sessionStorage.getItem(cleReporte()) === '1'; } catch (e) { return false; } }
    function reporter() { try { sessionStorage.setItem(cleReporte(), '1'); } catch (e) {} }
    function esc(t) { return String(t).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }

    var STYLE = '' +
        'dialog.sondage { border: 1px solid var(--line); border-radius: 14px; padding: 20px 22px; max-width: min(440px, calc(100vw - 32px)); width: 100%;' +
        '  background: var(--surface); color: var(--text); box-shadow: 0 12px 40px rgba(0,0,0,.25); }' +
        'dialog.sondage::backdrop { background: rgba(0,0,0,.45); }' +
        'dialog.sondage h2 { margin: 0 0 6px; font-size: 1.15rem; }' +
        'dialog.sondage p.sondage-q { margin: 0 0 14px; }' +
        'dialog.sondage fieldset { border: none; margin: 0 0 16px; padding: 0; display: flex; flex-direction: column; gap: 8px; }' +
        'dialog.sondage label { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border: 1px solid var(--line); border-radius: 10px; cursor: pointer; }' +
        'dialog.sondage label:has(input:checked) { border-color: var(--c-seconde); outline: 2px solid var(--c-seconde); }' +
        'dialog.sondage input[type=radio] { width: 1.1rem; height: 1.1rem; margin: 0; }' +
        'dialog.sondage .sondage-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 10px; }' +
        'dialog.sondage .sondage-etat { flex: 1 1 100%; margin: 0; color: var(--muted); font-size: 0.9rem; min-height: 1.2em; }';

    /* ---------- Élève : fenêtre à la connexion ---------- */
    var ouverte = null;
    function fenetre(s) {
        var q = QUESTION;
        if (!document.getElementById('sondage-style')) {
            var st = document.createElement('style'); st.id = 'sondage-style'; st.textContent = STYLE;
            document.head.appendChild(st);
        }
        var d = document.createElement('dialog');
        d.className = 'sondage';
        d.setAttribute('aria-labelledby', 'sondage-titre');
        d.innerHTML = '<form method="dialog">' +
            '<h2 id="sondage-titre">' + esc(q.titre) + '</h2>' +
            '<p class="sondage-q">' + esc(q.question) + '</p>' +
            '<fieldset><legend class="sr-only" style="position:absolute;left:-9999px">' + esc(q.question) + '</legend>' +
            q.choix.map(function (c) { return '<label><input type="radio" name="sondage" value="' + esc(c) + '"> ' + esc(c) + '</label>'; }).join('') +
            '</fieldset>' +
            '<div class="sondage-actions"><p class="sondage-etat" aria-live="polite"></p>' +
            '<button type="button" class="secondaire" data-action="plus-tard">Plus tard</button>' +
            '<button type="submit" data-action="envoyer">Envoyer</button></div></form>';
        // dans <main class="interactif"> pour reprendre le style des boutons du site
        (document.querySelector('main.interactif') || document.body).appendChild(d);
        var form = d.querySelector('form'), etat = d.querySelector('.sondage-etat'), envoyer = d.querySelector('[data-action="envoyer"]');

        function fermer() { if (d.open) d.close(); d.remove(); ouverte = null; }
        d.querySelector('[data-action="plus-tard"]').onclick = function () { reporter(); fermer(); };
        d.addEventListener('cancel', function () { reporter(); });     // touche Échap = « Plus tard »
        d.addEventListener('close', function () { if (ouverte === d) { d.remove(); ouverte = null; } });
        form.onsubmit = function (e) {
            e.preventDefault();
            var choisi = form.querySelector('input[name="sondage"]:checked');
            if (!choisi) { etat.textContent = 'Choisis une réponse.'; return; }
            envoyer.disabled = true; etat.textContent = 'Envoi…';
            Interactif.rpc('repondre_sondage', { p_jeton: s.jeton, p_sondage: q.id, p_reponse: choisi.value }).then(function () {
                etat.textContent = 'Merci !';
                setTimeout(fermer, 700);
            }, function (x) {
                envoyer.disabled = false;
                etat.textContent = 'Erreur : ' + (x && x.message || x);
            });
        };
        ouverte = d;
        if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    }

    function verifier(s) {
        if (!s) { if (ouverte) { ouverte.remove(); ouverte = null; } return; }   // déconnexion
        if (ouverte || !concerne(s) || reporte()) return;
        Interactif.rpc('ma_reponse_sondage', { p_jeton: s.jeton, p_sondage: QUESTION.id }).then(function (r) {
            if (r == null && !ouverte && Interactif.session() && Interactif.session().jeton === s.jeton) fenetre(s);
        }, function () { /* script SQL pas encore lancé ou session expirée : on n'insiste pas */ });
    }

    /* ---------- Prof : onglet « Sondage » ---------- */
    var reponses = null, erreurProf = '';
    var $ = function (id) { return document.getElementById(id); };
    function mdpProf() { try { return sessionStorage.getItem('interactif-prof'); } catch (e) { return null; } }
    function nomDe(code) { var n = window.interactifNoms ? window.interactifNoms() : {}; return n[code] || ''; }

    function peindre() {
        var zone = $('so-tableau'), resume = $('so-resume'), choix = $('so-choix');
        if (!zone) return;
        if (reponses == null) { resume.textContent = erreurProf || 'Chargement…'; zone.innerHTML = ''; return; }
        var ids = [QUESTION.id];
        reponses.forEach(function (r) { if (ids.indexOf(r.sondage) < 0) ids.push(r.sondage); });
        var garde = choix.value || QUESTION.id;
        choix.innerHTML = ids.map(function (i) { return '<option' + (i === garde ? ' selected' : '') + '>' + esc(i) + '</option>'; }).join('');
        var id = choix.value, liste = reponses.filter(function (r) { return r.sondage === id; });
        var enCours = id === QUESTION.id;
        // décompte : choix prévus (sondage en cours) puis toute autre réponse rencontrée
        var options = enCours ? QUESTION.choix.slice() : [];
        liste.forEach(function (r) { if (options.indexOf(r.reponse) < 0) options.push(r.reponse); });
        var n = {}; liste.forEach(function (r) { n[r.reponse] = (n[r.reponse] || 0) + 1; });
        resume.innerHTML = (enCours ? '« ' + esc(QUESTION.question) + ' » · ' : '') +
            '<b>' + liste.length + '</b> réponse' + (liste.length > 1 ? 's' : '');
        var max = Math.max(1, Math.max.apply(null, options.map(function (o) { return n[o] || 0; }).concat([0])));
        var barres = '<table class="res" style="width:auto;margin-bottom:16px">' + options.map(function (o) {
            var k = n[o] || 0, pc = liste.length ? Math.round(100 * k / liste.length) : 0;
            return '<tr><td style="text-align:left">' + esc(o) + '</td><td style="text-align:left;min-width:180px">' +
                '<span style="display:inline-block;height:12px;border-radius:4px;background:var(--c-seconde);vertical-align:middle;width:' + Math.round(160 * k / max) + 'px"></span> ' +
                k + (liste.length ? ' <span class="n-tent">(' + pc + ' %)</span>' : '') + '</td></tr>';
        }).join('') + '</table>';
        var lignes = liste.slice().sort(function (a, b) { return a.classe.localeCompare(b.classe) || (nomDe(a.code) || a.code).localeCompare(nomDe(b.code) || b.code, 'fr'); });
        zone.innerHTML = barres + (lignes.length ? '<div class="tableau-defile"><table class="res"><tr><th>Élève</th><th>Classe</th><th>Réponse</th><th>Date</th></tr>' +
            lignes.map(function (r) {
                var nom = nomDe(r.code);
                return '<tr><td>' + (nom ? esc(nom) + ' <span class="n-tent">' + esc(r.code) + '</span>' : esc(r.code)) + '</td><td>' + esc(r.classe) + '</td><td>' + esc(r.reponse) + '</td>' +
                    '<td>' + new Date(r.repondu_le).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + '</td></tr>';
            }).join('') + '</table></div>' : '<p class="aide">Aucune réponse pour l\'instant.</p>');
    }

    function charger() {
        var mdp = mdpProf();
        if (!mdp) { reponses = null; erreurProf = 'Reconnectez-vous à l\'espace professeure.'; peindre(); return; }
        Interactif.rpc('prof_sondages', { p_mdp: mdp }).then(function (l) { reponses = l || []; erreurProf = ''; peindre(); }, function (x) {
            reponses = null;
            erreurProf = 'Réponses indisponibles (' + x.message + ') : le script maj-sondage.sql a-t-il été lancé dans Supabase ?';
            peindre();
        });
    }

    function demarrer() {
        var c = $('so-choix'); if (!c) return;
        if (!c.dataset.pret) {
            c.dataset.pret = '1';
            c.onchange = peindre;
            $('so-actualiser').onclick = charger;
        }
        charger();
    }

    return { question: QUESTION, verifier: verifier, demarrer: demarrer };
})();
