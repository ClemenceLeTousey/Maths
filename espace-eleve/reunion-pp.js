/* ==========================================================================
   Espace professeure · onglet « Réunion P-P » (rencontres parents-professeurs)
   Rendez-vous rangés par heure ; note de préparation et case « fait » enregistrées
   dans la base (codes élèves seulement). Les noms viennent des fichiers comptes-*.csv
   chargés dans l'onglet Comptes (sur cet ordinateur seulement).
   Nécessite le script maj-reunion-pp.sql dans Supabase.
   ========================================================================== */
var ReunionPP = (function () {
    var liste = null, erreur = '';
    var $ = function (id) { return document.getElementById(id); };

    function mdpProf() { try { return sessionStorage.getItem('interactif-prof'); } catch (e) { return null; } }
    function esc(t) { return String(t).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
    function noms() { return window.interactifNoms ? window.interactifNoms() : {}; }
    function jourLong(j) {
        var d = new Date(j + 'T12:00:00');
        return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    function etat(t) { $('rp-etat').textContent = t || ''; }

    function peindre() {
        var zone = $('rp-tableau');
        if (liste == null) { zone.innerHTML = '<p class="aide">' + esc(erreur || 'Chargement…') + '</p>'; return; }
        var n = noms(), sansNoms = !Object.keys(n).length;
        // élèves proposés à l'ajout : les noms chargés (classes de seconde et autres)
        var opts = Object.keys(n).sort(function (a, b) { return a.slice(0, 3).localeCompare(b.slice(0, 3)) || n[a].localeCompare(n[b], 'fr'); });
        $('rp-eleve').innerHTML = '<option value="">— élève —</option>' + opts.map(function (c) {
            return '<option value="' + esc(c) + '">' + esc(c.split('-')[0] + ' · ' + n[c]) + '</option>';
        }).join('');
        if (!liste.length) { zone.innerHTML = '<p class="aide">Aucun rendez-vous.</p>'; return; }
        var html = '', jour = null, faits = 0;
        var parHeure = {};
        liste.forEach(function (r) { var k = r.jour + r.heure; parHeure[k] = (parHeure[k] || 0) + 1; if (r.fait) faits++; });
        liste.forEach(function (r) {
            if (r.jour !== jour) {
                if (jour) html += '</table></div>';
                jour = r.jour;
                var nb = liste.filter(function (x) { return x.jour === jour; }).length;
                html += '<h3 style="text-transform:capitalize">' + esc(jourLong(jour)) + ' · ' + nb + ' rendez-vous</h3>' +
                    '<div class="tableau-defile"><table class="res rp-table"><tr><th>Heure</th><th>Élève</th><th>Classe</th><th>Notes</th><th>Fait</th><th class="rp-ecran"></th></tr>';
            }
            var double = parHeure[r.jour + r.heure] > 1;
            html += '<tr data-id="' + r.id + '"' + (r.fait ? ' class="rp-fait"' : '') + '>' +
                '<td class="rp-heure' + (double ? ' rp-double' : '') + '"' + (double ? ' title="Deux rendez-vous à la même heure"' : '') + '>' +
                    '<input type="time" value="' + esc(r.heure) + '" step="300" data-champ="heure">' + (double ? ' ⚠️' : '') + '</td>' +
                '<td>' + (n[r.code] ? '<b>' + esc(n[r.code]) + '</b> <span class="n-tent">' + esc(r.code) + '</span>' : esc(r.code)) + '</td>' +
                '<td>' + esc(r.classe) + '</td>' +
                '<td><textarea rows="1" data-champ="note" placeholder="à préparer…">' + esc(r.note) + '</textarea></td>' +
                '<td style="text-align:center"><input type="checkbox" data-champ="fait"' + (r.fait ? ' checked' : '') + ' aria-label="Rendez-vous fait"></td>' +
                '<td class="rp-ecran"><button type="button" class="secondaire" data-suppr title="Supprimer ce rendez-vous">✕</button></td></tr>';
        });
        html += '</table></div>';
        html += '<p class="aide">' + faits + ' / ' + liste.length + ' rendez-vous faits.' +
            (sansNoms ? ' Pour voir les noms, chargez les fichiers comptes-*.csv dans l\'onglet Comptes.' : '') + '</p>';
        zone.innerHTML = html;
        Array.prototype.forEach.call(zone.querySelectorAll('tr[data-id]'), function (tr) {
            var r = liste.filter(function (x) { return String(x.id) === tr.dataset.id; })[0];
            tr.querySelector('[data-champ="heure"]').onchange = function () { if (this.value) { r.heure = this.value; enregistrer(r, true); } };
            var ta = tr.querySelector('[data-champ="note"]');
            var ajuster = function () { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; };
            ajuster();
            ta.oninput = ajuster;
            ta.onchange = function () { r.note = ta.value; enregistrer(r); };
            tr.querySelector('[data-champ="fait"]').onchange = function () { r.fait = this.checked; tr.classList.toggle('rp-fait', r.fait); enregistrer(r); };
            tr.querySelector('[data-suppr]').onclick = function () {
                if (!confirm('Supprimer le rendez-vous de ' + (noms()[r.code] || r.code) + ' (' + r.heure + ') ?')) return;
                Interactif.rpc('prof_supprimer_rdv', { p_mdp: mdpProf(), p_id: r.id }).then(charger, function (x) { etat('Erreur : ' + x.message); });
            };
        });
    }

    function enregistrer(r, retrier) {
        etat('Enregistrement…');
        return Interactif.rpc('prof_enregistrer_rdv', {
            p_mdp: mdpProf(), p_id: r.id || null, p_code: r.code, p_jour: r.jour, p_heure: r.heure, p_note: r.note || '', p_fait: !!r.fait
        }).then(function () {
            etat('Enregistré ✓');
            if (retrier) charger();
        }, function (x) { etat('Erreur : ' + x.message); });
    }

    function charger() {
        var mdp = mdpProf();
        if (!mdp) { liste = null; erreur = 'Reconnectez-vous à l\'espace professeure.'; peindre(); return; }
        Interactif.rpc('prof_reunion_pp', { p_mdp: mdp }).then(function (l) { liste = l || []; erreur = ''; peindre(); }, function (x) {
            liste = null;
            erreur = 'Liste indisponible (' + x.message + ')' + (/prof_reunion_pp/.test(x.message) ? ' : lancer maj-reunion-pp.sql dans Supabase.' : '.');
            peindre();
        });
    }

    var lance = false;
    function demarrer() {
        if (!lance) {
            lance = true;
            var st = document.createElement('style');
            st.textContent =
                '.rp-table td { vertical-align: top; }' +
                '.rp-table input[type=time] { font: inherit; }' +
                '.rp-table textarea { width: 100%; min-width: 16em; min-height: 1.8em; font: inherit; resize: vertical; box-sizing: border-box; }' +
                '.rp-double input { outline: 2px solid #d97706; }' +
                '.rp-fait td { opacity: .55; }' +
                '@media print { body > nav, header, .onglets, .outils, #rp-etat, .rp-ecran, footer { display: none !important; }' +
                ' .rp-table textarea { border: none; resize: none; } .rp-fait td { opacity: 1; } }';
            document.head.appendChild(st);
            $('rp-ajouter').onclick = function () {
                var code = $('rp-eleve').value, jour = $('rp-jour').value, heure = $('rp-heure').value;
                if (!code || !jour || !heure) { etat('Choisir un élève, une date et une heure.'); return; }
                enregistrer({ id: null, code: code, jour: jour, heure: heure, note: '', fait: false }, true);
            };
            $('rp-imprimer').onclick = function () { window.print(); };
            $('rp-actualiser').onclick = charger;
        }
        charger();
    }

    return { demarrer: demarrer, peindre: function () { if (liste) peindre(); } };
})();
