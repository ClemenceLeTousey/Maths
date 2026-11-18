/* ==========================================================================
   Sondages à la connexion
   Côté élève (index.html) : dès qu'un élève visé est connecté, une fenêtre s'ouvre pour chaque
   sondage actif auquel il n'a pas encore répondu. « Plus tard » (ou Échap) la ferme jusqu'à la
   prochaine ouverture de l'espace élève (nouvel onglet ou navigateur relancé).
   Côté prof (prof.html) : onglet « Sondage » pour créer, modifier, activer/arrêter ou supprimer
   un sondage, et voir les réponses. Les sondages sont rangés dans la base (table « sondages »).
   Nécessite le script maj-sondage.sql (version 2) dans Supabase.
   ========================================================================== */
window.SONDAGE = (function () {
    'use strict';

    var $ = function (id) { return document.getElementById(id); };
    function esc(t) { return String(t).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
    function cleReporte(id) { return 'sondage-plus-tard-' + id; }
    function reporte(id) { try { return sessionStorage.getItem(cleReporte(id)) === '1'; } catch (e) { return false; } }
    function reporter(id) { try { sessionStorage.setItem(cleReporte(id), '1'); } catch (e) {} }

    var STYLE = '' +
        'dialog.sondage { border: 1px solid var(--line); border-radius: 14px; padding: 20px 22px; max-width: min(440px, calc(100vw - 32px)); width: 100%;' +
        '  background: var(--surface); color: var(--text); box-shadow: 0 12px 40px rgba(0,0,0,.25); }' +
        'dialog.sondage::backdrop { background: rgba(0,0,0,.45); }' +
        'dialog.sondage h2 { margin: 0 0 6px; font-size: 1.15rem; }' +
        'dialog.sondage p.sondage-q { margin: 0 0 14px; white-space: pre-line; }' +
        'dialog.sondage fieldset { border: none; margin: 0 0 16px; padding: 0; display: flex; flex-direction: column; gap: 8px; }' +
        'dialog.sondage label { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border: 1px solid var(--line); border-radius: 10px; cursor: pointer; }' +
        'dialog.sondage label:has(input:checked) { border-color: var(--c-seconde); outline: 2px solid var(--c-seconde); }' +
        'dialog.sondage input[type=radio] { width: 1.1rem; height: 1.1rem; margin: 0; }' +
        'dialog.sondage .sondage-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 10px; }' +
        'dialog.sondage .sondage-etat { flex: 1 1 100%; margin: 0; color: var(--muted); font-size: 0.9rem; min-height: 1.2em; }' +
        '.so-statut { display: inline-block; font-size: 0.8rem; padding: 1px 8px; border-radius: 10px; border: 1px solid var(--line); color: var(--muted); }' +
        '.so-statut.on { color: #fff; background: #2f9e44; border-color: #2f9e44; }' +
        '.so-classes { display: flex; flex-wrap: wrap; gap: 4px 16px; }' +
        '.so-colonnes { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }' +
        '.so-col { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 10px 14px; }' +
        '.so-col h4 { margin: 0 0 6px; display: flex; justify-content: space-between; gap: 8px; }' +
        '.so-col ul { margin: 0; padding-left: 1.1em; font-size: 0.92rem; }' +
        '.so-nb { color: var(--muted); font-weight: 600; }' +
        '.so-manque { border-style: dashed; }';
    function style() {
        if ($('sondage-style')) return;
        var st = document.createElement('style'); st.id = 'sondage-style'; st.textContent = STYLE;
        document.head.appendChild(st);
    }

    /* ======================= Élève : fenêtre à la connexion ======================= */
    var ouverte = null;
    function fenetre(s, q) {
        style();
        var d = document.createElement('dialog');
        d.className = 'sondage';
        d.setAttribute('aria-labelledby', 'sondage-titre');
        d.innerHTML = '<form method="dialog">' +
            '<h2 id="sondage-titre">' + esc(q.titre || 'Une petite question') + '</h2>' +
            '<p class="sondage-q" id="sondage-q">' + esc(q.question) + '</p>' +
            '<fieldset aria-labelledby="sondage-q">' +
            q.choix.map(function (c) { return '<label><input type="radio" name="sondage" value="' + esc(c) + '"> ' + esc(c) + '</label>'; }).join('') +
            '</fieldset>' +
            '<div class="sondage-actions"><p class="sondage-etat" aria-live="polite"></p>' +
            '<button type="button" class="secondaire" data-action="plus-tard">Plus tard</button>' +
            '<button type="submit" data-action="envoyer">Envoyer</button></div></form>';
        // dans <main class="interactif"> pour reprendre le style des boutons du site
        (document.querySelector('main.interactif') || document.body).appendChild(d);
        var form = d.querySelector('form'), etat = d.querySelector('.sondage-etat'), envoyer = d.querySelector('[data-action="envoyer"]');

        function fermer() { ouverte = null; if (d.open) d.close(); d.remove(); }
        d.querySelector('[data-action="plus-tard"]').onclick = function () { reporter(q.id); fermer(); verifier(s); };
        d.addEventListener('cancel', function () { reporter(q.id); });          // touche Échap = « Plus tard »
        d.addEventListener('close', function () { if (ouverte === d) { ouverte = null; d.remove(); verifier(s); } });
        form.onsubmit = function (e) {
            e.preventDefault();
            var choisi = form.querySelector('input[name="sondage"]:checked');
            if (!choisi) { etat.textContent = 'Choisis une réponse.'; return; }
            envoyer.disabled = true; etat.textContent = 'Envoi…';
            Interactif.rpc('repondre_sondage', { p_jeton: s.jeton, p_sondage: q.id, p_reponse: choisi.value }).then(function () {
                etat.textContent = 'Merci !';
                setTimeout(function () { fermer(); verifier(s); }, 700);   // sondage suivant éventuel
            }, function (x) {
                envoyer.disabled = false;
                etat.textContent = 'Erreur : ' + (x && x.message || x);
            });
        };
        ouverte = d;
        if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    }

    function verifier(s) {
        if (!s) { if (ouverte) { var d = ouverte; ouverte = null; d.remove(); } return; }   // déconnexion
        if (ouverte) return;
        Interactif.rpc('sondages_en_cours', { p_jeton: s.jeton }).then(function (liste) {
            var q = (liste || []).filter(function (x) { return !reporte(x.id); })[0];
            var cur = Interactif.session();
            if (q && !ouverte && cur && cur.jeton === s.jeton) fenetre(s, q);
        }, function () { /* script SQL pas encore lancé ou session expirée : on n'insiste pas */ });
    }

    /* ======================= Prof : onglet « Sondage » ======================= */
    var sondages = null, reponses = [], erreurProf = '', courant = null;   // courant : id du sondage affiché ('' = nouveau)
    var CHOIX_DEFAUT = ['Oui', 'Non'];
    function mdpProf() { try { return sessionStorage.getItem('interactif-prof'); } catch (e) { return null; } }
    function noms() { return window.interactifNoms ? window.interactifNoms() : {}; }
    function eleves() { var d = window.interactifDonnees ? window.interactifDonnees() : null; return d ? d.eleves : []; }
    function sondage(id) { return (sondages || []).filter(function (x) { return x.id === id; })[0] || null; }
    function nouvelId() {
        var d = new Date(), z = function (n) { return String(n).padStart(2, '0'); };
        return 's' + d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + '-' + z(d.getHours()) + z(d.getMinutes()) + z(d.getSeconds());
    }
    function court(t, n) { t = String(t).replace(/\s+/g, ' '); return t.length > n ? t.slice(0, n - 1) + '…' : t; }
    function etat(t) { $('so-etat').textContent = t || ''; }

    function remplirListe() {
        var sel = $('so-choix');
        var opts = (sondages || []).map(function (x) {
            var n = reponses.filter(function (r) { return r.sondage === x.id; }).length;
            return '<option value="' + esc(x.id) + '">' + (x.actif ? '● ' : '○ ') + esc(court(x.question, 60)) + ' (' + n + ' rép.)</option>';
        });
        if (courant === '') opts.unshift('<option value="">Nouveau sondage (non enregistré)</option>');
        sel.innerHTML = opts.join('') || '<option value="">Aucun sondage</option>';
        sel.value = courant || '';
    }

    // Formulaire : classes (cases) et comptes précis (cases dans « Choisir des élèves précis »)
    function remplirFormulaire() {
        var x = courant ? sondage(courant) : null;
        var classesVisees = x ? x.classes : [], codesVises = x ? x.codes : [];
        $('so-titre').value = x ? x.titre : 'Une petite question';
        $('so-question').value = x ? x.question : '';
        $('so-reponses').value = (x ? x.choix : CHOIX_DEFAUT).join('\n');
        $('so-actif').checked = x ? x.actif : false;
        $('so-supprimer').hidden = !x;
        var lesEleves = eleves(), n = noms();
        var classes = Array.from(new Set(lesEleves.map(function (e) { return e.classe; }).concat(classesVisees))).sort();
        $('so-classes').innerHTML = classes.map(function (c) {
            return '<label><input type="checkbox" value="' + esc(c) + '"' + (classesVisees.indexOf(c) >= 0 ? ' checked' : '') + '> ' + esc(c) + '</label>';
        }).join('') || '<span class="aide" style="margin:0">Classes inconnues : connectez-vous d\'abord (onglet Suivi QF).</span>';
        var codes = lesEleves.map(function (e) { return e.code; });
        codesVises.forEach(function (c) { if (codes.indexOf(c) < 0) codes.push(c); });
        codes.sort(function (a, b) { return a.localeCompare(b, 'fr'); });
        $('so-eleves').innerHTML = codes.map(function (c) {
            return '<label><input type="checkbox" value="' + esc(c) + '"' + (codesVises.indexOf(c) >= 0 ? ' checked' : '') + '> ' +
                (n[c] ? esc(n[c]) + ' <span class="n-tent">' + esc(c) + '</span>' : esc(c)) + '</label>';
        }).join('');
        $('so-avertissement').hidden = !(x && reponses.some(function (r) { return r.sondage === x.id; }));
        resumeCible();
        etat('');
    }
    function coches(id) { return Array.prototype.map.call($(id).querySelectorAll('input:checked'), function (i) { return i.value; }); }
    function resumeCible() {
        var cl = coches('so-classes'), co = coches('so-eleves');
        $('so-cible').textContent = !cl.length && !co.length ? 'tout le monde' :
            [cl.length ? 'classe' + (cl.length > 1 ? 's ' : ' ') + cl.join(', ') : '', co.length ? co.length + ' compte' + (co.length > 1 ? 's' : '') : ''].filter(Boolean).join(' + ');
    }

    function peindreReponses() {
        var zone = $('so-tableau'), resume = $('so-resume');
        var x = courant ? sondage(courant) : null;
        if (!x) { resume.textContent = ''; zone.innerHTML = ''; return; }
        var liste = reponses.filter(function (r) { return r.sondage === x.id; }), n = noms();
        var options = x.choix.slice();
        liste.forEach(function (r) { if (options.indexOf(r.reponse) < 0) options.push(r.reponse); });
        var k = {}; liste.forEach(function (r) { k[r.reponse] = (k[r.reponse] || 0) + 1; });
        resume.innerHTML = '<span class="so-statut' + (x.actif ? ' on' : '') + '">' + (x.actif ? 'actif' : 'arrêté') + '</span> ' +
            '<b>' + liste.length + '</b> réponse' + (liste.length > 1 ? 's' : '') + ' · créé le ' + new Date(x.cree_le).toLocaleDateString('fr-FR');
        var max = Math.max.apply(null, options.map(function (o) { return k[o] || 0; }).concat([1]));
        var barres = '<table class="res" style="width:auto;margin-bottom:16px">' + options.map(function (o) {
            var v = k[o] || 0, pc = liste.length ? Math.round(100 * v / liste.length) : 0;
            return '<tr><td style="text-align:left">' + esc(o) + '</td><td style="text-align:left;min-width:180px">' +
                '<span style="display:inline-block;height:12px;border-radius:4px;background:var(--c-seconde);vertical-align:middle;width:' + Math.round(160 * v / max) + 'px"></span> ' +
                v + (liste.length ? ' <span class="n-tent">(' + pc + ' %)</span>' : '') + '</td></tr>';
        }).join('') + '</table>';
        function nomEleve(code) { return n[code] ? esc(n[code]) : esc(code); }
        function tri(a, b) { return (n[a] || a).localeCompare(n[b] || b, 'fr'); }
        function liEleve(code, classe) { return '<li>' + nomEleve(code) + ' <span class="n-tent">' + esc(n[code] ? code : classe) + '</span></li>'; }
        var classeDe = {}; eleves().forEach(function (e) { classeDe[e.code] = e.classe; });
        // une colonne par réponse : qui a répondu quoi
        var colonnes = options.map(function (o) {
            var codes = liste.filter(function (r) { return r.reponse === o; }).map(function (r) { classeDe[r.code] = r.classe; return r.code; }).sort(tri);
            return '<div class="so-col"><h4>' + esc(o) + ' <span class="so-nb">' + codes.length + '</span></h4>' +
                (codes.length ? '<ul>' + codes.map(function (c) { return liEleve(c, classeDe[c]); }).join('') + '</ul>' : '<p class="aide" style="margin:0">Personne</p>') + '</div>';
        });
        // élèves visés qui n'ont pas encore répondu
        var ont = {}; liste.forEach(function (r) { ont[r.code] = 1; });
        var tous = !x.codes.length && !x.classes.length;
        var manquent = eleves().filter(function (e) { return !ont[e.code] && (tous || x.codes.indexOf(e.code) >= 0 || x.classes.indexOf(e.classe) >= 0); })
            .map(function (e) { return e.code; }).sort(tri);
        if (eleves().length) colonnes.push('<div class="so-col so-manque"><h4>Pas encore répondu <span class="so-nb">' + manquent.length + '</span></h4>' +
            (manquent.length ? '<ul>' + manquent.map(function (c) { return liEleve(c, classeDe[c]); }).join('') + '</ul>' : '<p class="aide" style="margin:0">Tout le monde a répondu 🎉</p>') + '</div>');
        var lignes = liste.slice().sort(function (a, b) { return a.classe.localeCompare(b.classe) || (n[a.code] || a.code).localeCompare(n[b.code] || b.code, 'fr'); });
        zone.innerHTML = barres + '<div class="so-colonnes">' + colonnes.join('') + '</div>' +
            (Object.keys(n).length ? '' : '<p class="aide">Pour voir les noms à la place des codes, chargez les fichiers comptes-*.csv dans l\'onglet Comptes.</p>') +
            (lignes.length ? '<details style="margin-top:12px"><summary class="aide" style="margin:0;cursor:pointer">Détail avec les dates</summary><div class="tableau-defile"><table class="res"><tr><th>Élève</th><th>Classe</th><th>Réponse</th><th>Date</th></tr>' +
            lignes.map(function (r) {
                return '<tr><td>' + (n[r.code] ? esc(n[r.code]) + ' <span class="n-tent">' + esc(r.code) + '</span>' : esc(r.code)) + '</td><td>' + esc(r.classe) + '</td><td>' + esc(r.reponse) + '</td>' +
                    '<td>' + new Date(r.repondu_le).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + '</td></tr>';
            }).join('') + '</table></div></details>' : '');
    }

    function peindre() {
        $('so-erreur').textContent = sondages == null ? (erreurProf || 'Chargement…') : '';
        if (sondages == null) { $('so-zone').hidden = true; return; }
        if (courant == null || (courant && !sondage(courant))) courant = sondages.length ? sondages[0].id : '';
        $('so-zone').hidden = false;
        remplirListe(); remplirFormulaire(); peindreReponses();
    }

    function charger(garder, message) {
        var mdp = mdpProf();
        if (!mdp) { sondages = null; erreurProf = 'Reconnectez-vous à l\'espace professeure.'; peindre(); return; }
        Interactif.rpc('prof_sondages', { p_mdp: mdp }).then(function (d) {
            sondages = (d && d.sondages) || []; reponses = (d && d.reponses) || []; erreurProf = '';
            if (garder !== undefined) courant = garder;
            peindre();
            if (message) etat(message);
        }, function (x) {
            sondages = null;
            erreurProf = 'Sondages indisponibles (' + x.message + ') : le script maj-sondage.sql (version 2) a-t-il été lancé dans Supabase ?';
            peindre();
        });
    }

    function enregistrer() {
        var choix = $('so-reponses').value.split('\n').map(function (t) { return t.trim(); }).filter(Boolean);
        if (!$('so-question').value.trim()) { etat('Écrivez la question.'); return; }
        if (choix.length < 2 || choix.length > 10) { etat('Il faut entre 2 et 10 réponses possibles (une par ligne).'); return; }
        var id = courant || nouvelId();
        $('so-enregistrer').disabled = true; etat('Enregistrement…');
        Interactif.rpc('prof_enregistrer_sondage', {
            p_mdp: mdpProf(), p_id: id, p_titre: $('so-titre').value, p_question: $('so-question').value,
            p_choix: choix, p_codes: coches('so-eleves'), p_classes: coches('so-classes'), p_actif: $('so-actif').checked
        }).then(function () {
            $('so-enregistrer').disabled = false;
            charger(id, 'Enregistré ✓' + ($('so-actif').checked ? ' La fenêtre s\'ouvrira à la prochaine connexion des élèves visés.' : ' (arrêté : aucun élève ne le voit).'));
        }, function (x) { $('so-enregistrer').disabled = false; etat('Erreur : ' + x.message); });
    }

    function supprimer() {
        var x = sondage(courant); if (!x) return;
        var n = reponses.filter(function (r) { return r.sondage === x.id; }).length;
        if (!confirm('Supprimer ce sondage' + (n ? ' et ses ' + n + ' réponse' + (n > 1 ? 's' : '') : '') + ' ?\n\n« ' + court(x.question, 120) + ' »')) return;
        Interactif.rpc('prof_supprimer_sondage', { p_mdp: mdpProf(), p_sondage: x.id }).then(function () { charger(null); },
            function (e) { etat('Erreur : ' + e.message); });
    }

    function init() {
        var sel = $('so-choix'); if (!sel || sel.dataset.pret) return;
        sel.dataset.pret = '1';
        style();
        sel.onchange = function () { courant = sel.value; if (courant) remplirListe(); remplirFormulaire(); peindreReponses(); };
        $('so-nouveau').onclick = function () { courant = ''; remplirListe(); remplirFormulaire(); peindreReponses(); $('so-question').focus(); };
        $('so-actualiser').onclick = function () { charger(courant); };
        $('so-enregistrer').onclick = enregistrer;
        $('so-supprimer').onclick = supprimer;
        $('so-classes').onchange = resumeCible;
        $('so-eleves').onchange = resumeCible;
    }

    return { verifier: verifier, demarrer: function () { init(); charger(); } };
})();
