/* ==========================================================================
   Espace professeure · onglet « En ligne »
   Élèves dont une page de l'espace élève est ouverte et visible (signal toutes les minutes,
   voir « Présence » dans moteur.js). En ligne = vu il y a moins de 2 minutes ;
   les élèves vus dans la dernière heure restent affichés en gris.
   Nécessite le script maj-en-ligne.sql dans Supabase. Les noms viennent des fichiers
   comptes-*.csv chargés dans Suivi QF (sur cet ordinateur seulement).
   ========================================================================== */
(function () {
    var EN_LIGNE_S = 120, ACTUALISER_MS = 20000;
    var liste = null, minuteur = null, erreur = '';
    var $ = function (id) { return document.getElementById(id); };

    function mdpProf() { try { return sessionStorage.getItem('interactif-prof'); } catch (e) { return null; } }
    function esc(t) { return String(t).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
    function nomDe(code) { var n = window.interactifNoms ? window.interactifNoms() : {}; return n[code] || ''; }
    function depuis(s) {
        if (s < 60) return 'à l\'instant';
        var m = Math.round(s / 60);
        return m < 60 ? 'il y a ' + m + ' min' : 'il y a 1 h';
    }
    function ongletOuvert() { var p = $('panneau-en-ligne'); return p && !p.hidden && !document.hidden; }

    function peindre() {
        var zone = $('el-tableau'), resume = $('el-resume'), choix = $('el-classe');
        if (!zone) return;
        if (liste == null) { resume.textContent = erreur || 'Chargement…'; zone.innerHTML = ''; return; }
        var maintenant = Date.now();
        var classes = [];
        liste.forEach(function (x) { if (classes.indexOf(x.classe) < 0) classes.push(x.classe); });
        classes.sort();
        var garde = choix.value;
        choix.innerHTML = '<option value="">Toutes</option>' + classes.map(function (c) { return '<option' + (c === garde ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('');
        var vus = liste.filter(function (x) { return !choix.value || x.classe === choix.value; }).map(function (x) {
            var s = Math.max(0, (maintenant - new Date(x.vu).getTime()) / 1000);
            return { code: x.code, classe: x.classe, page: x.page, s: s, actif: s < EN_LIGNE_S, nom: nomDe(x.code) };
        });
        var actifs = vus.filter(function (x) { return x.actif; });
        actifs.sort(function (a, b) { return a.classe.localeCompare(b.classe) || (a.nom || a.code).localeCompare(b.nom || b.code, 'fr'); });
        var recents = vus.filter(function (x) { return !x.actif; }).sort(function (a, b) { return a.s - b.s; });
        resume.innerHTML = '<b>' + actifs.length + '</b> élève' + (actifs.length > 1 ? 's' : '') + ' en ligne' +
            (choix.value ? ' en ' + esc(choix.value) : '') +
            (recents.length ? ' · ' + recents.length + ' vu' + (recents.length > 1 ? 's' : '') + ' dans la dernière heure' : '') +
            ' · actualisé à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        if (!vus.length) { zone.innerHTML = '<p class="aide">Personne pour l\'instant.</p>'; return; }
        var ligne = function (x) {
            return '<tr class="' + (x.actif ? '' : 'el-ancien') + '"><td><span class="el-point' + (x.actif ? ' on' : '') + '" aria-hidden="true"></span>' +
                (x.nom ? esc(x.nom) + ' <span class="n-tent">' + esc(x.code) + '</span>' : esc(x.code)) + '</td>' +
                '<td>' + esc(x.classe) + '</td><td>' + esc(x.page || '—') + '</td><td>' + depuis(x.s) + '</td></tr>';
        };
        zone.innerHTML = '<div class="tableau-defile"><table class="res"><tr><th>Élève</th><th>Classe</th><th>Page ouverte</th><th>Dernier signal</th></tr>' +
            actifs.map(ligne).join('') + recents.map(ligne).join('') + '</table></div>' +
            (Object.keys(window.interactifNoms ? window.interactifNoms() : {}).length ? '' : '<p class="aide">Pour voir les noms, chargez les fichiers comptes-*.csv dans l\'onglet Suivi QF (« Noms »).</p>');
    }

    function charger() {
        var mdp = mdpProf();
        if (!mdp) { liste = null; erreur = 'Reconnectez-vous à l\'espace professeure.'; peindre(); return; }
        Interactif.rpc('prof_en_ligne', { p_mdp: mdp }).then(function (l) { liste = l || []; erreur = ''; peindre(); }, function (x) {
            liste = null;
            erreur = 'Liste indisponible (' + x.message + ')' + (/prof_en_ligne/.test(x.message) ? ' : lancer maj-en-ligne.sql dans Supabase.' : '.');
            peindre();
        });
    }

    function boucle() {
        clearTimeout(minuteur);
        if (!ongletOuvert()) return;
        charger();
        minuteur = setTimeout(boucle, ACTUALISER_MS);
    }

    var lance = false;
    function demarrer() {
        if (!lance) {
            lance = true;
            $('el-classe').onchange = peindre;
            $('el-actualiser').onclick = boucle;
            document.addEventListener('visibilitychange', function () { if (ongletOuvert()) boucle(); });
            var st = document.createElement('style');
            st.textContent = '.el-point { display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: var(--line, #ccc); margin-right: 8px; vertical-align: middle; }' +
                '.el-point.on { background: #2f9e44; box-shadow: 0 0 0 3px rgba(47,158,68,.2); }' +
                '#panneau-en-ligne tr.el-ancien td { color: var(--muted, #888); }' +
                '#panneau-en-ligne td:first-child { text-align: left; }';
            document.head.appendChild(st);
        }
        boucle();
    }

    window.EnLigne = { demarrer: demarrer };
})();
