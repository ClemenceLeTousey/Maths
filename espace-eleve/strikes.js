/* ==========================================================================
   Strikes : série d'automatismes pas faite en entier à la date limite.
   - Espace professeure, onglet « Strikes » : Strikes.demarrer()
       · élèves proposés pour la série choisie (cases cochées), la prof valide ;
       · compteurs de la classe, « Colle faite » à 3 strikes.
   - Espace élève, onglet Automatismes : Strikes.eleve(session) → compteur.
   Règles dans STRIKES_CONFIG (config.js). Base : maj-strikes.sql.
   Seule la série VERTE est obligatoire : un strike = un jour de la série (J1, J2, J3,
   et J4 s'il existe) dont la série verte n'est pas validée avant la date limite.
   Le bleu, le rouge et le bilan facultatif ne comptent pas.
   ========================================================================== */
var Strikes = (function () {
    var $ = function (id) { return document.getElementById(id); };
    function conf() {
        return Object.assign({ niveaux: ['seconde'], comptes: [], limite: { jour: 'vendredi', heure: '23:59' }, seuil: 3 }, window.STRIKES_CONFIG || {});
    }
    function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
    function dateCourte(d) { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }); }
    function dateLongue(d) { return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }); }
    function pions(n, seuil) {
        var h = '';
        for (var i = 0; i < Math.max(n, seuil); i++) h += '<span class="sk-pion' + (i < n ? ' plein' : '') + '" aria-hidden="true"></span>';
        return '<span class="sk-pions" role="img" aria-label="' + n + ' strike' + (n > 1 ? 's' : '') + ' sur ' + seuil + '">' + h + '</span>';
    }

    /* ---------- Séries et date limite (lundi lu dans « Série N · semaine du 23 au 27 novembre ») ---------- */
    var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    var JOURS = { lundi: 0, mardi: 1, mercredi: 2, jeudi: 3, vendredi: 4, samedi: 5, dimanche: 6 };
    function lundi(groupe) {
        var m = /semaine du (\d+)(?:er)?(?: ([a-zéû]+))? au (\d+)(?:er)? ([a-zéû]+)/i.exec(groupe || '');
        if (!m) return null;
        var mois = MOIS.indexOf((m[2] || m[4]).toLowerCase());
        if (mois < 0) return null;
        var auj = new Date(), debut = auj.getMonth() >= 7 ? auj.getFullYear() : auj.getFullYear() - 1;
        var d = new Date(mois >= 7 ? debut : debut + 1, mois, +m[1]);
        return d.getDay() === 1 ? d : null;
    }
    function limiteDe(groupe) {
        var l = lundi(groupe), c = conf().limite;
        if (!l) return null;
        var h = String(c.heure || '23:59').split(':');
        return new Date(l.getFullYear(), l.getMonth(), l.getDate() + (JOURS[c.jour] != null ? JOURS[c.jour] : 4), +h[0], +(h[1] || 0), 59);
    }
    function ouverte(ex, classe) {
        if (ex.archive) return false;
        if (ex.ouverture === 'auto') { var d = Interactif.ouvertureSerie(ex, classe); return !!d && d <= new Date(); }
        return !ex.comptes;
    }
    // séries ouvertes pour la classe : [{ nom: 'Série 10', jours: [{ id, nom: 'J1' }], limite }], plus récente d'abord
    function series(classe) {
        var niv = Interactif.niveauClasse(classe), parNom = {};
        (window.INTERACTIF_CATALOGUE || []).forEach(function (ex) {
            var m = /^Série (\d+) · semaine du/.exec(ex.groupe || '');
            if (!m || ex.tp || (niv && ex.niveau !== niv) || !ouverte(ex, classe)) return;
            var nom = 'Série ' + m[1], s = parNom[nom];
            if (!s) s = parNom[nom] = { nom: nom, num: +m[1], jours: [], limite: limiteDe(ex.groupe) };
            var j = /-j(\d+)$/.exec(ex.id);
            s.jours.push({ id: ex.id, nom: j ? 'J' + j[1] : 'Série' });   // 1TC : un seul exercice par série
        });
        return Object.keys(parNom).map(function (k) { return parNom[k]; })
            .filter(function (s) { return s.limite; })
            .sort(function (a, b) { return b.num - a.num; });
    }

    /* ---------- État d'un élève pour une série ---------- */
    var OBLIGATOIRES = [1];   // couleurs obligatoires : la verte seulement
    function etatJour(resultats, code, id, limite) {
        var tous = resultats.filter(function (r) { return r.code === code && r.exercice === id; });
        var aTemps = tous.filter(function (r) { return new Date(r.fait_le) <= limite; });
        function manque(liste) {
            if (!liste.length) return OBLIGATOIRES.slice();
            var c = Interactif.bilanCouleurs(liste).couleurs;
            if (!c) return [];                       // exercice sans couleurs : un résultat suffit
            return OBLIGATOIRES.filter(function (n) { return !c[n]; });
        }
        var m = manque(aTemps);
        return { ok: !m.length, manque: m, retard: m.length > 0 && !manque(tous).length, rien: !tous.length };
    }
    function etatSerie(resultats, code, s) {
        var jours = s.jours.map(function (j) { return Object.assign({ nom: j.nom }, etatJour(resultats, code, j.id, s.limite)); });
        var incomplets = jours.filter(function (j) { return !j.ok; });
        var motif = incomplets.map(function (j) { return j.nom; }).join(', ');
        if (motif) motif = motif === 'Série' ? 'Série verte non faite' : motif + ' : série verte non faite';   // 1TC : un seul exercice
        return { jours: jours, complet: !incomplets.length, motif: motif };
    }

    /* =================== Espace professeure =================== */
    var strikes = null, erreur = '', classe = '', serieChoisie = '', lance = false;
    function mdpProf() { try { return sessionStorage.getItem('interactif-prof'); } catch (e) { return null; } }
    function noms() { return window.interactifNoms ? window.interactifNoms() : {}; }
    function donnees() { return window.interactifDonnees ? window.interactifDonnees() : null; }
    function etat(t) { $('sk-etat').textContent = t || ''; }
    function ouverts(code) { return (strikes || []).filter(function (s) { return s.code === code && !s.solde_le; }); }

    function peindre() {
        var d = donnees(), zone = $('sk-zone');
        if (!d) { zone.innerHTML = '<p class="aide">Chargement…</p>'; return; }
        if (strikes == null) { zone.innerHTML = '<p class="aide">' + esc(erreur || 'Chargement…') + '</p>'; return; }
        var n = noms(), seuil = conf().seuil;
        // classes
        var classes = Array.from(new Set(d.eleves.map(function (e) { return e.classe; }))).sort();
        var selC = $('sk-classe');
        if (!classe || classes.indexOf(classe) < 0) classe = classes.filter(function (c) { return /^2/.test(c); })[0] || classes[0] || '';
        selC.innerHTML = classes.map(function (c) { return '<option' + (c === classe ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('');
        // séries : par défaut la plus récente dont la date limite est passée
        var liste = series(classe), maintenant = new Date();
        if (!liste.some(function (s) { return s.nom === serieChoisie; })) {
            var passee = liste.filter(function (s) { return s.limite < maintenant; })[0];
            serieChoisie = (passee || liste[0] || {}).nom || '';
        }
        $('sk-serie').innerHTML = liste.map(function (s) {
            return '<option value="' + esc(s.nom) + '"' + (s.nom === serieChoisie ? ' selected' : '') + '>' + esc(s.nom) +
                ' · limite ' + dateCourte(s.limite) + (s.limite > maintenant ? ' (en cours)' : '') + '</option>';
        }).join('');
        var eleves = d.eleves.filter(function (e) { return e.classe === classe; }).sort(function (a, b) {
            return (n[a.code] || a.code).localeCompare(n[b.code] || b.code, 'fr');
        });
        var nomDe = function (code) { return n[code] ? '<b>' + esc(n[code]) + '</b> <span class="n-tent">' + esc(code) + '</span>' : esc(code); };

        var html = '';
        var s = liste.filter(function (x) { return x.nom === serieChoisie; })[0];
        if (!s) html += '<p class="aide">Aucune série ouverte pour cette classe.</p>';
        else {
            var enCours = s.limite > maintenant, c = conf();
            // classe pas encore concernée par les strikes : seuls les comptes de test sont cochés d'avance
            var horsNiveau = c.niveaux.indexOf(Interactif.niveauClasse(classe)) < 0;
            var cocher = function (code) { return !enCours && (!horsNiveau || c.comptes.indexOf(code) >= 0); };
            html += '<h3>' + esc(s.nom) + ' · date limite ' + esc(dateLongue(s.limite)) + ' ' +
                s.limite.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</h3>';
            if (enCours) html += '<p class="sk-alerte">⏳ La date limite n\'est pas encore passée : l\'état ci-dessous est provisoire.</p>';
            if (horsNiveau) html += '<p class="sk-alerte">🧪 Classe pas encore ouverte aux strikes (STRIKES_CONFIG.niveaux) : seuls les comptes de test (' + esc(c.comptes.join(', ') || 'aucun') + ') sont cochés, et les élèves ne voient pas leur compteur.</p>';
            html += '<div class="tableau-defile"><table class="res sk-table"><tr><th>Élève</th>' +
                s.jours.map(function (j) { return '<th>' + esc(j.nom) + '</th>'; }).join('') + '<th>Compteur</th><th>Strike</th></tr>';
            var aDonner = 0;
            eleves.forEach(function (e) {
                var st = etatSerie(d.resultats, e.code, s);
                var deja = (strikes || []).filter(function (x) { return x.code === e.code && x.serie === s.nom; })[0];
                html += '<tr data-code="' + esc(e.code) + '"' + (st.complet ? '' : ' class="sk-incomplet"') + '><td>' + nomDe(e.code) + '</td>';
                st.jours.forEach(function (j) {
                    if (j.ok) html += '<td class="sk-ok" title="Fait à temps">✓</td>';
                    else if (j.retard) html += '<td class="sk-retard" title="Fini après la date limite">⏰ retard</td>';
                    else html += '<td class="sk-ko" title="Série verte pas faite à la date limite">✗</td>';
                });
                html += '<td>' + pions(ouverts(e.code).length, seuil) + '</td><td>';
                if (deja) html += '<span class="sk-donne" title="' + esc(deja.motif) + '">⚡ le ' + dateCourte(deja.donne_le) + '</span>' +
                    (deja.solde_le ? ' <span class="n-tent">(soldé)</span>' : ' <button type="button" class="lien" data-retirer="' + deja.id + '">retirer</button>');
                else if (!st.complet) {
                    aDonner++;
                    html += '<label class="sk-case"><input type="checkbox" data-motif="' + esc(st.motif) + '"' + (cocher(e.code) ? ' checked' : '') + '> ' +
                        '<span class="n-tent">' + esc(st.motif) + '</span></label>';
                }
                html += '</td></tr>';
            });
            html += '</table></div>';
            html += '<p class="outils"><button type="button" id="sk-valider"' + (aDonner ? '' : ' disabled') + '>Valider les strikes cochés</button>' +
                ' <span class="aide" style="margin:0">' + (aDonner ? 'Décocher les élèves excusés (absence, problème de connexion…).' : 'Aucun strike à donner pour cette série.') + '</span></p>';
        }

        // compteurs de la classe
        var lignes = eleves.map(function (e) { return { e: e, o: ouverts(e.code), tous: (strikes || []).filter(function (x) { return x.code === e.code; }) }; })
            .filter(function (l) { return l.tous.length; })
            .sort(function (a, b) { return b.o.length - a.o.length; });
        html += '<h3>Compteurs · ' + esc(classe) + '</h3>';
        if (!lignes.length) html += '<p class="aide">Aucun strike dans cette classe.</p>';
        else {
            html += '<div class="tableau-defile"><table class="res sk-table"><tr><th>Élève</th><th>Compteur</th><th>Strikes en cours</th><th>Colle</th><th>Colles faites</th></tr>';
            lignes.forEach(function (l) {
                var colle = l.o.length >= seuil;
                var soldes = {};
                l.tous.forEach(function (x) { if (x.solde_le) soldes[x.solde_le] = (soldes[x.solde_le] || 0) + 1; });
                html += '<tr' + (colle ? ' class="sk-colle"' : '') + '><td>' + nomDe(l.e.code) + '</td><td>' + pions(l.o.length, seuil) + '</td><td>' +
                    (l.o.map(function (x) { return '<span title="' + esc(x.motif) + '">' + esc(x.serie) + '</span>'; }).join(', ') || '—') + '</td><td>' +
                    (colle ? '🔒 <b>à donner</b> <button type="button" data-colle="' + esc(l.e.code) + '">Colle faite</button>' : '—') + '</td><td>' +
                    (Object.keys(soldes).length ? Object.keys(soldes).sort().map(function (k) { return dateCourte(k); }).join(', ') +
                        ' <button type="button" class="lien" data-annuler="' + esc(l.e.code) + '" title="Annuler la dernière colle">annuler</button>' : '—') + '</td></tr>';
            });
            html += '</table></div>';
        }
        if (!Object.keys(n).length) html += '<p class="aide">Pour voir les noms, chargez les fichiers comptes-*.csv dans l\'onglet Comptes.</p>';
        zone.innerHTML = html;

        var bv = $('sk-valider');
        if (bv) bv.onclick = function () {
            var choix = Array.prototype.map.call(zone.querySelectorAll('.sk-case input:checked'), function (c) {
                return { code: c.closest('tr').dataset.code, motif: c.dataset.motif };
            });
            if (!choix.length) { etat('Aucun élève coché.'); return; }
            if (!confirm('Donner ' + choix.length + ' strike' + (choix.length > 1 ? 's' : '') + ' pour la ' + serieChoisie + ' (' + classe + ') ?')) return;
            appel('prof_donner_strikes', { p_serie: serieChoisie, p_strikes: choix }, function (nb) { etat(nb + ' strike(s) enregistré(s) ✓'); });
        };
        Array.prototype.forEach.call(zone.querySelectorAll('[data-retirer]'), function (b) {
            b.onclick = function () {
                if (!confirm('Retirer ce strike ?')) return;
                appel('prof_retirer_strike', { p_id: +b.dataset.retirer }, function () { etat('Strike retiré ✓'); });
            };
        });
        Array.prototype.forEach.call(zone.querySelectorAll('[data-colle]'), function (b) {
            b.onclick = function () {
                var c = b.dataset.colle;
                if (!confirm('Colle faite pour ' + (n[c] || c) + ' ? Ses ' + seuil + ' strikes les plus anciens sont soldés.')) return;
                appel('prof_colle_faite', { p_code: c }, function () { etat('Colle enregistrée ✓'); });
            };
        });
        Array.prototype.forEach.call(zone.querySelectorAll('[data-annuler]'), function (b) {
            b.onclick = function () {
                var c = b.dataset.annuler;
                if (!confirm('Annuler la dernière colle de ' + (n[c] || c) + ' ? Ses strikes redeviennent en cours.')) return;
                appel('prof_annuler_colle', { p_code: c }, function () { etat('Colle annulée ✓'); });
            };
        });
    }

    function appel(fn, params, ok) {
        etat('Enregistrement…');
        Interactif.rpc(fn, Object.assign({ p_mdp: mdpProf() }, params)).then(function (r) { ok(r); charger(); }, function (x) { etat('Erreur : ' + x.message); });
    }
    function charger() {
        var mdp = mdpProf();
        if (!mdp) { strikes = null; erreur = 'Reconnectez-vous à l\'espace professeure.'; peindre(); return; }
        Interactif.rpc('prof_strikes', { p_mdp: mdp }).then(function (l) { strikes = l || []; erreur = ''; peindre(); }, function (x) {
            strikes = null;
            erreur = 'Strikes indisponibles (' + x.message + ')' + (/prof_strikes/.test(x.message) ? ' : lancer maj-strikes.sql dans Supabase.' : '.');
            peindre();
        });
    }

    function styles() {
        if ($('sk-styles')) return;
        var st = document.createElement('style');
        st.id = 'sk-styles';
        st.textContent =
            '.sk-pions { display: inline-flex; gap: 4px; vertical-align: middle; }' +
            '.sk-pion { width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--ko, #c92a2a); box-sizing: border-box; }' +
            '.sk-pion.plein { background: var(--ko, #c92a2a); }' +
            '.sk-table td { text-align: center; vertical-align: middle; }' +
            '.sk-table td:first-child { text-align: left; }' +
            '.sk-table td.sk-ok { color: #2b8a3e; font-weight: 700; }' +
            '.sk-table td.sk-ko { color: var(--ko, #c92a2a); font-weight: 700; }' +
            '.sk-table td.sk-retard { color: #b45309; }' +
            '.sk-table tr.sk-colle td { background: color-mix(in srgb, var(--ko, #c92a2a) 12%, transparent); }' +
            '.sk-case { display: inline-flex; gap: 6px; align-items: center; cursor: pointer; text-align: left; }' +
            '.sk-donne { white-space: nowrap; font-weight: 600; }' +
            '.sk-alerte { padding: 8px 12px; border-radius: 8px; border: 1px solid #d97706; }' +
            '.strikes-eleve { margin: 0 0 16px; padding: 12px 16px; border: 1px solid var(--line); border-left: 4px solid var(--line); border-radius: 10px; background: var(--surface); }' +
            '.strikes-eleve.alerte { border-left-color: var(--ko, #c92a2a); }' +
            '.strikes-eleve h2 { margin: 0 0 6px; font-size: 1.1rem; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }' +
            '.strikes-eleve .sk-pion { width: 18px; height: 18px; }' +
            '.strikes-eleve p, .strikes-eleve ul { margin: 6px 0 0; }' +
            '.strikes-eleve .sk-regle { color: var(--muted); font-size: 0.9rem; }';
        document.head.appendChild(st);
    }

    function demarrer() {
        styles();
        if (!lance) {
            lance = true;
            $('sk-classe').onchange = function () { classe = this.value; serieChoisie = ''; peindre(); };
            $('sk-serie').onchange = function () { serieChoisie = this.value; peindre(); };
            $('sk-actualiser').onclick = charger;
        }
        charger();
    }

    /* =================== Espace élève : compteur =================== */
    function eleve(s) {
        var bloc = $('strikes-eleve');
        if (!bloc) return;
        bloc.hidden = true;
        if (!s) return;
        var niv = Interactif.niveauClasse(s.classe), c = conf();
        var test = c.comptes.indexOf(String(s.code || '').toUpperCase()) >= 0;
        if (!test && (!niv || c.niveaux.indexOf(niv) < 0)) return;
        styles();
        Interactif.rpc('mes_strikes', { p_jeton: s.jeton }).then(function (l) {
            l = l || [];
            var o = l.filter(function (x) { return !x.solde_le; }), seuil = c.seuil, colle = o.length >= seuil;
            var html = '<h2>⚡ Strikes ' + pions(o.length, seuil) + ' <span>' + o.length + ' / ' + seuil + '</span></h2>';
            if (colle) html += '<p><b>🔒 Tu as ' + o.length + ' strikes : tu auras une colle.</b> Ta professeure te dira quand.</p>';
            else if (!o.length) html += '<p>Aucun strike en cours. Continue comme ça !</p>';
            if (o.length) html += '<ul>' + o.map(function (x) {
                return '<li><b>' + esc(x.serie) + '</b>' + (x.motif ? ' · ' + esc(x.motif) : '') + ' <span class="sk-regle">(le ' + dateCourte(x.donne_le) + ')</span></li>';
            }).join('') + '</ul>';
            var soldes = l.length - o.length;
            if (soldes) html += '<p class="sk-regle">Strikes effacés après une colle : ' + soldes + '.</p>';
            html += '<p class="sk-regle">Série verte (obligatoire) pas faite le vendredi soir = 1 strike. À ' + seuil + ' strikes : colle.</p>';
            bloc.innerHTML = html;
            bloc.classList.toggle('alerte', o.length > 0);
            bloc.hidden = false;
        }, function () { bloc.hidden = true; });   // maj-strikes.sql pas encore lancé : rien d'affiché
    }

    return { demarrer: demarrer, peindre: function () { if (strikes) peindre(); }, eleve: eleve, series: series, etatSerie: etatSerie };
})();
