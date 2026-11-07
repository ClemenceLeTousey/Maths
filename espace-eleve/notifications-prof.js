/* ==========================================================================
   Espace professeure · onglet « Notifications »
   Programmer une notification (tout de suite ou à une date), à une classe ou à des élèves précis,
   éventuellement seulement à ceux qui n'ont pas fini une série ; voir celles à venir et envoyées.
   Base : maj-push-prof.sql (prof_notif_programmer, prof_notif_liste, prof_notif_supprimer).
   Envoi : la fonction Edge « notifier » (toutes les 15 min, ou aussitôt pour « Maintenant »).
   ========================================================================== */
(function () {
    var $ = function (id) { return document.getElementById(id); };
    var donnees = null, lance = false;
    var LIENS = [['espace-eleve/', 'Espace élève · Automatismes'], ['espace-eleve/#evaluations', 'Espace élève · Évaluations'],
                 ['espace-eleve/#soutien', 'Espace élève · Soutien'], ['espace-eleve/#echange', 'Espace élève · Messages'], ['./', 'Accueil du site']];
    var NIVEAUX = { seconde: 'Seconde', premiere: 'Première', terminale: 'TST2S' };
    // mêmes catégories que maj-push-categories.sql et que la cloche (site.js) ; « prof » ne peut pas être coupée
    var CATEGORIES = [['prof', '📣 Message de ta professeure'], ['serie', '📅 Nouvelle série disponible'], ['rappel', '⏰ Série pas finie'],
                      ['eval', '📆 Évaluation à venir'], ['note', '📝 Nouvelle note'], ['soutien', '🤝 Rappel soutien']];
    function emoji(c) { var x = CATEGORIES.filter(function (k) { return k[0] === c; })[0]; return x ? x[1].split(' ')[0] : ''; }

    function mdp() { try { return sessionStorage.getItem('interactif-prof'); } catch (e) { return null; } }
    function noms() { return window.interactifNoms ? window.interactifNoms() : {}; }
    function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
    function date(d) {
        return new Date(d).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }
    function etat(t, ko) { var e = $('nt-etat'); e.textContent = t; e.className = 'aide' + (ko ? ' ko' : ''); }

    /* ---------- Séries (pour « seulement à ceux qui n'ont pas fini ») : groupes du catalogue ---------- */
    function series() {
        var vus = {}, l = [];
        (window.INTERACTIF_CATALOGUE || []).forEach(function (x) {
            if (x.archive || x.tp || /bilan$/.test(x.id) || /^Facultatif/.test(x.groupe)) return;
            if (!vus[x.groupe]) { vus[x.groupe] = { groupe: x.groupe, niveau: x.niveau, ids: [] }; l.push(vus[x.groupe]); }
            vus[x.groupe].ids.push(x.id);
        });
        return l;
    }
    function nomSerie(ids) {
        var s = series().filter(function (g) { return g.ids.join() === (ids || []).join(); })[0];
        return s ? s.groupe.replace(/ · .*/, '') + (s.niveau !== 'seconde' ? ' (' + NIVEAUX[s.niveau] + ')' : '') : (ids || []).length + ' exercice(s)';
    }
    function serieCourte() {
        var o = $('nt-serie').selectedOptions[0];
        return o ? o.textContent.replace(/ · .*/, '').replace(/ \(.*\)$/, '') : 'la série';
    }

    /* ---------- Destinataires ---------- */
    // Menu « Classes » : valeur = motif de classe, ou « code:XXX » pour un seul compte (élève simulé)
    var CLASSES = [['2%', 'Toutes les Secondes'], ['2B', '2B'], ['2F', '2F'], ['2H', '2H'],
                   ['code:PROF-2NDE', 'PROF-2NDE (élève simulé, pour tester)']];
    function remplirClasses() {
        var sel = $('nt-classe'), avant = sel.value;
        sel.innerHTML = CLASSES.map(function (c) { return '<option value="' + esc(c[0]) + '">' + esc(c[1]) + '</option>'; }).join('');
        var rs = $('nt-r-classe'), ravant = rs.value;
        rs.innerHTML = sel.innerHTML;
        if (ravant) rs.value = ravant;
        if (avant && Array.prototype.some.call(sel.options, function (o) { return o.value === avant; })) sel.value = avant;
        remplirEleves();
    }
    function remplirEleves() {
        var c = $('nt-classe').value, n = noms(), abo = {};
        (donnees ? donnees.abonnes : []).forEach(function (a) { abo[a.code] = a.n; });
        var coupe = {};
        (donnees && donnees.coupees || []).forEach(function (x) { (coupe[x.code] = coupe[x.code] || []).push(emoji(x.categorie)); });
        var liste = (donnees ? donnees.eleves : []).filter(function (e) {
            return c.indexOf('code:') === 0 ? e.code === c.slice(5) : c === '2%' ? /^2/.test(e.classe) : e.classe === c;
        }).sort(function (a, b) { return (n[a.code] || a.code).localeCompare(n[b.code] || b.code, 'fr'); });
        $('nt-eleves').innerHTML = liste.map(function (e) {
            return '<label><input type="checkbox" value="' + esc(e.code) + '"> ' + esc(n[e.code] ? n[e.code] + ' (' + e.code + ')' : e.code) +
                   (abo[e.code] ? ' <span title="Notifications activées sur ' + abo[e.code] + ' appareil(s)' + (coupe[e.code] ? ' ; coupées sur le téléphone : ' + coupe[e.code].join(' ') : '') + '">📱' + (coupe[e.code] ? '⁻' : '') + '</span>' : '') + '</label>';
        }).join('') || '<p class="aide">Aucun élève.</p>';
        destinataires();
    }
    function codesCoches() {
        return Array.prototype.map.call(document.querySelectorAll('#nt-eleves input:checked'), function (i) { return i.value; });
    }
    function destinataires() {
        var codes = codesCoches(), c = $('nt-classe');
        $('nt-dest-resume').textContent = codes.length ? codes.length + ' élève(s) choisi(s)' : c.selectedOptions[0] ? c.selectedOptions[0].textContent : '';
    }
    function texteDest(n) {
        var nm = noms();
        if (n.codes && n.codes.length) return n.codes.length > 3 ? n.codes.length + ' élèves' : n.codes.map(function (c) { return nm[c] || c; }).join(', ');
        return (n.classes || []).map(function (c) { return c === '2%' ? 'Toutes les Secondes' : c; }).join(', ');
    }

    /* ---------- Formulaire ---------- */
    function apercu() {
        var t = $('nt-titre').value.trim() || 'Titre', x = $('nt-texte').value.trim();
        if ($('nt-rappel').checked) x = x.replace(/\{n\}/g, '2');
        $('nt-apercu-t').textContent = t; $('nt-apercu-x').textContent = x;
        $('nt-quand-date').hidden = !$('nt-plus-tard').checked;
        $('nt-serie-zone').hidden = !$('nt-rappel').checked;
        $('nt-envoyer').textContent = $('nt-plus-tard').checked ? 'Programmer' : 'Envoyer maintenant';
    }
    function modele(type) {
        var s = serieCourte();
        if (type === 'eval') {
            $('nt-rappel').checked = false; $('nt-categorie').value = 'eval'; $('nt-lien').value = 'espace-eleve/#evaluations';
            $('nt-titre').value = '📆 Interro demain';
            $('nt-texte').value = 'N\'oublie pas : interrogation demain. Le sujet d\'entraînement est dans l\'onglet Évaluations.';
        } else if (type === 'dispo') {
            $('nt-rappel').checked = false; $('nt-categorie').value = 'serie'; $('nt-lien').value = 'espace-eleve/';
            $('nt-titre').value = '📅 ' + s + ' disponible';
            $('nt-texte').value = 'Les automatismes de la semaine sont en ligne : 3 jours à faire.';
        } else {
            $('nt-rappel').checked = true; $('nt-categorie').value = 'rappel'; $('nt-lien').value = 'espace-eleve/';
            $('nt-titre').value = '⏰ Automatismes - ' + s;
            $('nt-texte').value = 'La série n\'est pas finie. Date limite : vendredi soir.';
        }
        apercu();
    }
    function envoyer() {
        var plusTard = $('nt-plus-tard').checked, quand = null;
        if (plusTard) {
            if (!$('nt-quand-date').value) return etat('Choisissez la date et l\'heure d\'envoi.', true);
            quand = new Date($('nt-quand-date').value);
            if (quand < new Date()) return etat('Cette date est déjà passée.', true);
        }
        var codes = codesCoches(), rappel = $('nt-rappel').checked, choix = $('nt-classe').value;
        if (!codes.length && choix.indexOf('code:') === 0) codes = [choix.slice(5)];
        var ids = rappel ? JSON.parse($('nt-serie').value || '[]') : [];
        if (rappel && !ids.length) return etat('Choisissez la série.', true);
        var dest = codes.length ? codes.length + ' élève(s)' : $('nt-classe').selectedOptions[0].textContent;
        if (!confirm((plusTard ? 'Programmer pour ' + date(quand) : 'Envoyer maintenant') + ' à : ' + dest +
                     (rappel ? ' (seulement à ceux qui n\'ont pas fini ' + serieCourte() + ')' : '') + ' ?')) return;
        etat('Enregistrement…');
        Interactif.rpc('prof_notif_programmer', {
            p_mdp: mdp(), p_envoyer_le: quand ? quand.toISOString() : null,
            p_titre: $('nt-titre').value, p_texte: $('nt-texte').value, p_url: $('nt-lien').value,
            p_codes: codes, p_classes: codes.length ? [] : [choix], p_exercices: ids, p_categorie: $('nt-categorie').value
        }).then(function () {
            if (!plusTard) {
                // envoi immédiat : on réveille la fonction Edge sans attendre le passage des 15 minutes
                fetch(window.INTERACTIF_CONFIG.url + '/functions/v1/notifier', { method: 'POST', mode: 'no-cors' })
                    .catch(function () {}).then(function () { setTimeout(charger, 2500); });
            }
            etat(plusTard ? '✓ Programmée.' : '✓ Envoyée (quelques secondes pour arriver).');
            $('nt-titre').value = ''; $('nt-texte').value = ''; apercu();
            charger();
        }, function (x) { etat('Non enregistrée : ' + x.message, true); });
    }

    /* ---------- Règles automatiques hebdomadaires (maj-push-regles.sql) ---------- */
    var JOURS = ['', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];
    var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    var REGLE_DEFAUT = {
        rappel: ['⏰ Automatismes - {serie}', 'La série n\'est pas finie. Date limite : vendredi soir.'],
        dispo: ['📅 Automatismes - {serie}', 'La nouvelle série est en ligne : 3 jours à faire avant vendredi soir.']
    };
    // « Série 8 · semaine du 9 au 13 novembre » -> lundi 2026-11-09 (année scolaire de septembre à août)
    function lundiDe(groupe) {
        var m = /semaine du (\d+)(?:er)?(?: ([a-zéû]+))? au (\d+)(?:er)? ([a-zéû]+)/i.exec(groupe);
        if (!m) return null;
        var mois = MOIS.indexOf((m[2] || m[4]).toLowerCase());
        if (mois < 0) return null;
        var auj = new Date(), debut = auj.getMonth() >= 7 ? auj.getFullYear() : auj.getFullYear() - 1;
        var d = new Date(mois >= 7 ? debut : debut + 1, mois, +m[1]);
        if (d.getDay() !== 1) return null;
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    // calendrier des séries envoyé à la base à chaque ouverture de l'onglet (d'après config.js)
    function synchroniserSeries() {
        var l = series().map(function (g) {
            return { niveau: g.niveau, lundi: lundiDe(g.groupe), serie: g.groupe.replace(/ · .*/, ''), exercices: g.ids };
        }).filter(function (x) { return x.lundi; });
        return Interactif.rpc('prof_series_sync', { p_mdp: mdp(), p_series: l }).catch(function () { /* maj-push-regles.sql pas encore lancé */ });
    }
    function texteDestRegle(r) { return texteDest({ codes: r.codes, classes: r.classes }); }
    function afficherRegles() {
        var l = donnees.regles, z = $('nt-regles');
        var s = donnees.serie_en_cours;
        $('nt-serie-cours').textContent = s ? 'Série de cette semaine : ' + s.serie + ' (' + s.exercices.length + ' jours : ' + s.exercices.map(function (x) { return x.replace(/.*-/, '').toUpperCase(); }).join(', ') + ').'
                                            : l ? 'Aucune série n\'est prévue cette semaine dans config.js : les règles ne partiront pas.' : '';
        if (!l) { z.innerHTML = '<p class="aide">Règles indisponibles : lancer maj-push-regles.sql dans Supabase.</p>'; $('nt-regle-form').hidden = true; return; }
        $('nt-regle-form').hidden = false;
        z.innerHTML = l.length
            ? '<div class="tableau-defile"><table class="res"><tr><th>Quand</th><th>Notification</th><th>Destinataires</th><th>Active</th><th></th></tr>' +
              l.map(function (r) {
                  return '<tr><td>Chaque ' + JOURS[r.jour] + ' à ' + esc(r.heure.replace(':', 'h')) + '</td><td>' + (r.type === 'rappel' ? '⏰' : '📅') + ' <b>' + esc(r.titre) + '</b><br><span class="aide">' + esc(r.texte) + '</span></td>' +
                         '<td>' + esc(texteDestRegle(r)) + (r.type === 'rappel' ? '<br><span class="aide">seulement si la série de la semaine n\'est pas finie</span>' : '') + '</td>' +
                         '<td><input type="checkbox" data-actif="' + r.id + '"' + (r.actif ? ' checked' : '') + ' aria-label="Règle active"></td>' +
                         '<td><button type="button" class="secondaire" data-suppr-regle="' + r.id + '">Supprimer</button></td></tr>';
              }).join('') + '</table></div>'
            : '<p class="aide">Aucune règle pour l\'instant.</p>';
    }
    function typeRegle() {
        var d = REGLE_DEFAUT[$('nt-r-type').value];
        $('nt-r-titre').value = d[0]; $('nt-r-texte').value = d[1];
        if ($('nt-r-type').value === 'dispo') { $('nt-r-jour').value = '1'; $('nt-r-heure').value = '07:30'; }
        else { $('nt-r-jour').value = '4'; $('nt-r-heure').value = '18:00'; }
    }
    function ajouterRegle() {
        var choix = $('nt-r-classe').value, codes = choix.indexOf('code:') === 0 ? [choix.slice(5)] : [];
        if (!$('nt-r-heure').value) return etatRegle('Choisissez l\'heure.', true);
        etatRegle('Enregistrement…');
        Interactif.rpc('prof_regle_ajouter', {
            p_mdp: mdp(), p_type: $('nt-r-type').value, p_jour: +$('nt-r-jour').value, p_heure: $('nt-r-heure').value.slice(0, 5),
            p_codes: codes, p_classes: codes.length ? [] : [choix], p_titre: $('nt-r-titre').value, p_texte: $('nt-r-texte').value
        }).then(function () { etatRegle('✓ Règle ajoutée.'); charger(); }, function (x) { etatRegle('Non enregistrée : ' + x.message, true); });
    }
    function etatRegle(t, ko) { var e = $('nt-r-etat'); e.textContent = t; e.className = 'aide' + (ko ? ' ko' : ''); }

    /* ---------- Listes ---------- */
    function afficherListes() {
        var l = donnees.notifs || [], avenir = l.filter(function (n) { return !n.envoye_le; }).reverse(), faites = l.filter(function (n) { return n.envoye_le; });
        function ligne(n, fait) {
            return '<tr><td>' + esc(date(fait ? n.envoye_le : n.envoyer_le)) + '</td><td><span title="Catégorie">' + emoji(n.categorie) + '</span> <b>' + esc(n.titre) + '</b><br><span class="aide">' + esc(n.texte) + '</span></td>' +
                   '<td>' + esc(texteDest(n)) + (n.exercices ? '<br><span class="aide">si ' + esc(nomSerie(n.exercices)) + ' pas finie</span>' : '') + '</td>' +
                   (fait ? '<td>' + n.recues + '</td><td>' + n.lues + '</td>'
                         : '<td><button type="button" class="secondaire" data-suppr="' + n.id + '">Supprimer</button></td>') + '</tr>';
        }
        $('nt-avenir').innerHTML = avenir.length
            ? '<div class="tableau-defile"><table class="res"><tr><th>Envoi prévu</th><th>Notification</th><th>Destinataires</th><th></th></tr>' + avenir.map(function (n) { return ligne(n, false); }).join('') + '</table></div>'
            : '<p class="aide">Aucune notification programmée.</p>';
        $('nt-faites').innerHTML = faites.length
            ? '<div class="tableau-defile"><table class="res"><tr><th>Envoyée</th><th>Notification</th><th>Destinataires</th><th>Reçues</th><th>Lues</th></tr>' + faites.map(function (n) { return ligne(n, true); }).join('') + '</table></div>' +
              '<p class="aide">Reçues : élèves visés (dans la cloche du site, et sur leur téléphone s\'ils ont activé les notifications). Lues : cloche ouverte.</p>'
            : '<p class="aide">Aucune notification envoyée ces 30 derniers jours.</p>';
        var abo = donnees.abonnes || [], nm = noms();
        $('nt-abonnes').textContent = abo.length
            ? 'Notifications activées sur un téléphone : ' + abo.map(function (a) { return (nm[a.code] || a.code) + (a.n > 1 ? ' (' + a.n + ' appareils)' : ''); }).join(', ') + '.'
            : 'Aucun élève n\'a encore activé les notifications sur son téléphone.';
    }
    function charger() {
        if (!mdp()) return etat('Reconnectez-vous à l\'espace professeure.', true);
        return synchroniserSeries().then(function () { return Interactif.rpc('prof_notif_liste', { p_mdp: mdp() }); }).then(function (d) {
            donnees = d; remplirClasses(); afficherListes(); afficherRegles();
        }, function (x) { etat('Notifications indisponibles (' + x.message + ') : le script maj-push-prof.sql a-t-il été lancé dans Supabase ?', true); });
    }

    window.NotifProf = {
        demarrer: function () {
            if (lance) { charger(); return; }
            // page prof.html restée en cache (plus ancienne que ce script) : le dire au lieu d'échouer en silence
            var manque = ['nt-classe', 'nt-categorie', 'nt-modele-eval', 'nt-lien', 'nt-serie', 'nt-regles', 'nt-r-type'].filter(function (id) { return !$(id); });
            if (manque.length) {
                var p = $('nt-etat') || $('panneau-notifs');
                if (p) p.textContent = 'Page pas à jour : rechargez-la en forçant la mise à jour (⌘ + Maj + R, ou Ctrl + F5).';
                return;
            }
            lance = true;
            $('nt-categorie').innerHTML = CATEGORIES.map(function (c) { return '<option value="' + c[0] + '">' + esc(c[1]) + '</option>'; }).join('');
            $('nt-lien').innerHTML = LIENS.map(function (l) { return '<option value="' + l[0] + '">' + esc(l[1]) + '</option>'; }).join('');
            var l = series(), courante = l.filter(function (g) { return g.niveau === 'seconde'; })[0];
            $('nt-serie').innerHTML = l.map(function (g) {
                return '<option value="' + esc(JSON.stringify(g.ids)) + '"' + (g === courante ? ' selected' : '') + '>' + esc(g.groupe) + (g.niveau !== 'seconde' ? ' (' + NIVEAUX[g.niveau] + ')' : '') + '</option>';
            }).join('');
            $('nt-classe').onchange = remplirEleves;
            $('nt-eleves').onchange = destinataires;
            ['nt-titre', 'nt-texte', 'nt-rappel', 'nt-maintenant', 'nt-plus-tard', 'nt-serie'].forEach(function (id) { $(id).addEventListener('input', apercu); $(id).addEventListener('change', apercu); });
            $('nt-modele-dispo').onclick = function () { modele('dispo'); };
            $('nt-modele-rappel').onclick = function () { modele('rappel'); };
            $('nt-modele-eval').onclick = function () { modele('eval'); };
            $('nt-envoyer').onclick = envoyer;
            $('nt-avenir').onclick = function (e) {
                var b = e.target.closest('[data-suppr]');
                if (!b || !confirm('Supprimer cette notification programmée ?')) return;
                Interactif.rpc('prof_notif_supprimer', { p_mdp: mdp(), p_id: +b.dataset.suppr }).then(charger, function (x) { etat('Erreur : ' + x.message, true); });
            };
            $('nt-r-type').onchange = typeRegle;
            $('nt-r-ajouter').onclick = ajouterRegle;
            $('nt-regles').onchange = function (e) {
                var c = e.target.closest('[data-actif]');
                if (c) Interactif.rpc('prof_regle_activer', { p_mdp: mdp(), p_id: +c.dataset.actif, p_actif: c.checked }).then(charger, function (x) { etatRegle('Erreur : ' + x.message, true); });
            };
            $('nt-regles').onclick = function (e) {
                var b = e.target.closest('[data-suppr-regle]');
                if (!b || !confirm('Supprimer cette règle ?')) return;
                Interactif.rpc('prof_regle_supprimer', { p_mdp: mdp(), p_id: +b.dataset.supprRegle }).then(charger, function (x) { etatRegle('Erreur : ' + x.message, true); });
            };
            typeRegle();
            apercu();
            charger();
        }
    };
})();
