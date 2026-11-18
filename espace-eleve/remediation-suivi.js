/* ==========================================================================
   Espace professeure · onglet « Remédiation »
   Progression des élèves sur les pages de remédiation en ligne (remediation-seconde/remediation-ds2.html…).
   La page envoie, pour l'élève connecté, les exercices réussis par thème, les thèmes ouverts et le temps
   passé (exercice « remediation-ds2 » dans la table resultats ; voir maj-remediation.sql).
   Les noms viennent des fichiers comptes-*.csv chargés dans l'onglet Comptes (sur cet ordinateur seulement).
   ========================================================================== */
var SuiviRemed = (function () {
    var REMEDIATIONS = [
        { id: 'remediation-ds2', titre: 'Remédiation DS2', niveau: 'seconde', themes: [
            ['ir', 'Identités remarquables', 'Calcul littéral'], ['dev', 'Développer et réduire', 'Calcul littéral'], ['facto', 'Factoriser', 'Calcul littéral'],
            ['eq', 'Équations', 'Équations'], ['ineq', 'Inéquations', 'Équations'], ['aires', 'Problème (aires)', 'Équations'],
            ['colin', 'Colinéarité', 'Vecteurs'], ['transl', 'Translation, Chasles', 'Vecteurs'], ['comb', 'k u + m v', 'Vecteurs'], ['align', 'Alignement ★★★', 'Vecteurs'],
            ['py-err', 'Script avec conditions', 'Python'], ['py-suivi', 'Suivi des variables', 'Python']] }
    ];
    var $ = function (id) { return document.getElementById(id); };
    function esc(t) { return String(t).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
    function noms() { return window.interactifNoms ? window.interactifNoms() : {}; }
    function donnees() { return window.interactifDonnees ? window.interactifDonnees() : null; }
    function remed() { return REMEDIATIONS.filter(function (r) { return r.id === $('rm-choix').value; })[0] || REMEDIATIONS[0]; }
    function duree(s) { if (!s) return '—'; var m = Math.round(s / 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0'); }
    function quand(d) {
        var j = Math.floor((Date.now() - new Date(d)) / 86400000);
        return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' ' + new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + (j === 0 ? '' : ' (il y a ' + j + ' j)');
    }
    function cellule(v) {
        if (!v || !v[1]) return '<td class="rm-c">—</td>';
        var p = v[0] / v[1], fond = v[0] === 0 ? '#fff' : p >= 0.8 ? '#D3F9D8' : p >= 0.4 ? '#EBFBEE' : '#FFF4E5';
        return '<td class="rm-c" style="background:' + fond + '">' + v[0] + '/' + v[1] + '</td>';
    }

    function remplir() {
        var d = donnees(); if (!d) return;
        var sel = $('rm-classe'), avant = sel.value;
        var classes = Array.from(new Set(d.eleves.map(function (e) { return e.classe; }))).sort();
        sel.innerHTML = '';
        classes.forEach(function (c) { sel.appendChild(new Option(c, c)); });
        if (classes.indexOf(avant) >= 0) sel.value = avant;
        else if (classes.indexOf('2B') >= 0) sel.value = '2B';
        afficher();
    }

    function afficher() {
        var d = donnees(), zone = $('rm-tableau'), resume = $('rm-resume');
        if (!d) { resume.textContent = 'Connecte-toi d’abord (onglet Suivi QF).'; return; }
        var R = remed(), classe = $('rm-classe').value, n = noms();
        var eleves = d.eleves.filter(function (e) { return e.classe === classe; });
        var derniers = {};
        d.resultats.forEach(function (r) {
            if (r.exercice !== R.id) return;
            if (!derniers[r.code] || new Date(r.fait_le) > new Date(derniers[r.code].fait_le)) derniers[r.code] = r;
        });
        var lignes = eleves.map(function (e) { return { code: e.code, nom: n[e.code] || '', r: derniers[e.code] || null }; });
        lignes.sort(function (a, b) { return (!!b.r - !!a.r) || (a.nom || a.code).localeCompare(b.nom || b.code, 'fr'); });
        var actifs = lignes.filter(function (l) { return l.r; });
        resume.innerHTML = '<b>' + actifs.length + '</b> élève' + (actifs.length > 1 ? 's' : '') + ' sur ' + lignes.length + ' ont ouvert la page connectés' +
            (actifs.length ? ' · ' + actifs.reduce(function (s, l) { return s + l.r.score; }, 0) + ' exercices réussis au total' : '');
        var doms = [];
        R.themes.forEach(function (t) { if (doms.indexOf(t[2]) < 0) doms.push(t[2]); });
        var tete = '<tr><th>Élève</th><th>Réussis</th>' + R.themes.map(function (t) { return '<th class="rm-c" title="' + esc(t[2]) + '">' + esc(t[1]) + '</th>'; }).join('') + '<th>Temps</th><th>Dernière activité</th></tr>';
        zone.innerHTML = tete + lignes.map(function (l) {
            var nom = esc(l.nom || l.code) + (l.nom ? ' <span class="rm-code">' + esc(l.code) + '</span>' : '');
            if (!l.r) return '<tr class="rm-vide"><td>' + nom + '</td><td colspan="' + (R.themes.length + 3) + '">pas encore ouverte (connecté·e)</td></tr>';
            var th = (l.r.details && l.r.details.themes) || {}, vus = (l.r.details && l.r.details.vus) || [];
            return '<tr><td>' + nom + '</td><td><b>' + l.r.score + '</b>/' + l.r.total + '</td>' +
                R.themes.map(function (t) {
                    var v = th[t[0]];
                    if (v && v[0] === 0 && vus.indexOf(t[0]) >= 0) return '<td class="rm-c rm-vu" title="ouvert, aucun exercice réussi">vu</td>';
                    return cellule(v);
                }).join('') +
                '<td>' + duree(l.r.duree_s) + '</td><td>' + quand(l.r.fait_le) + '</td></tr>';
        }).join('');
    }

    function exporter() {
        var d = donnees(); if (!d) return;
        var R = remed(), classe = $('rm-classe').value, n = noms(), der = {};
        d.resultats.forEach(function (r) { if (r.exercice === R.id && (!der[r.code] || new Date(r.fait_le) > new Date(der[r.code].fait_le))) der[r.code] = r; });
        var l = [['Élève', 'Code', 'Réussis', 'Total'].concat(R.themes.map(function (t) { return t[1]; })).concat(['Temps (min)', 'Dernière activité']).join(';')];
        d.eleves.filter(function (e) { return e.classe === classe; }).forEach(function (e) {
            var r = der[e.code], th = r && r.details && r.details.themes || {};
            l.push([n[e.code] || '', e.code, r ? r.score : '', r ? r.total : ''].concat(R.themes.map(function (t) { var v = th[t[0]]; return v ? v[0] + '/' + v[1] : ''; }))
                .concat([r ? Math.round((r.duree_s || 0) / 60) : '', r ? new Date(r.fait_le).toLocaleString('fr-FR') : '']).join(';'));
        });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob(['﻿' + l.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
        a.download = R.titre + ' - suivi ' + classe + '.csv'; a.click();
    }

    function init() {
        var c = $('rm-choix'); if (!c || c.options.length) return;
        REMEDIATIONS.forEach(function (r) { c.appendChild(new Option(r.titre, r.id)); });
        c.onchange = afficher; $('rm-classe').onchange = afficher; $('rm-csv').onclick = exporter;
    }
    return { demarrer: function () { init(); remplir(); }, afficher: function () { init(); remplir(); } };
})();
