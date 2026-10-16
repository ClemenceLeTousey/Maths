/* Créneaux de soutien (Seconde), de la Toussaint à Noël.
   Les disponibilités sont tirées des emplois du temps Pronote (29/09/2026) : un créneau n'est
   proposé que si l'élève n'a pas cours et qu'il lui reste une autre heure pour manger.
   Seuls les codes pseudonymes figurent ici, jamais les noms. */
window.SOUTIEN = (function () {
    'use strict';

    // jour : 0 = lundi … 4 = vendredi ; semaine : "AB" = chaque semaine, "A" ou "B" = une semaine sur deux.
    // exclusif : deux créneaux du même groupe le même jour s'excluent (garder une heure pour manger).
    var CRENEAUX = {
        L10: { jour: 0, debut: 10, horaire: '10h – 11h', semaine: 'AB' },
        M13: { jour: 1, debut: 13, horaire: '13h – 14h', semaine: 'AB' },
        J12: { jour: 3, debut: 12, horaire: '12h – 13h', semaine: 'AB', exclusif: 'jeudi-midi' },
        J13: { jour: 3, debut: 13, horaire: '13h – 14h', semaine: 'AB', exclusif: 'jeudi-midi' }
    };

    // Semaines de cours (lundi) et leur type, vacances exclues.
    var SEMAINES = [
        ['2026-11-02', 'B'], ['2026-11-09', 'A'], ['2026-11-16', 'B'], ['2026-11-23', 'A'],
        ['2026-11-30', 'B'], ['2026-12-07', 'A'], ['2026-12-14', 'B']
    ];

    // Jours fériés (aucun créneau ce jour-là)
    var FERIES = ['2026-11-11'];

    function pour(codes, creneaux, dispos) {
        codes.split(' ').forEach(function (c) { dispos[c] = creneaux; });
        return dispos;
    }
    var DISPOS = {};
    // 2B — lundi 10h : groupe sciences 2 (le groupe sciences 3 a physique jusqu'à 10h30) ;
    // jeudi 12h : germanistes seulement (les hispanistes ont espagnol de 11h à 12h, ce serait leur seule heure de repas) ;
    // jeudi 13h : histoire-géographie pour toute la classe.
    pour('2B-PASCAL 2B-CARDAN 2B-GERMAIN 2B-NASH 2B-CANTOR', ['L10', 'M13', 'J12'], DISPOS);
    pour('2B-LEGENDRE 2B-LOVELACE 2B-KEPLER 2B-CAUCHY', ['L10', 'M13'], DISPOS);
    pour('2B-MIRZAKHANI 2B-POISSON 2B-AGNESI 2B-GAUSS', ['M13'], DISPOS);
    pour('2B-FOURIER 2B-JOHNSON 2B-GALOIS 2B-BOOLE 2B-BOREL 2B-DESCARTES 2B-BERNOULLI 2B-NAPIER 2B-FERMAT 2B-PYTHAGORE 2B-HILBERT 2B-NEWTON', ['M13', 'J12'], DISPOS);
    // 2F — lundi 10h : groupe d'anglais de M. Arquié (sauf aide aux devoirs) ; mardi 13h : seule heure de repas.
    pour('2F-MIRZAKHANI 2F-LAPLACE 2F-NASH 2F-EULER 2F-LEGENDRE 2F-POISSON 2F-JOHNSON 2F-LAGRANGE 2F-BOREL 2F-FIBONACCI 2F-LEIBNIZ 2F-FOURIER 2F-TURING 2F-GAUSS 2F-RIEMANN 2F-HILBERT 2F-TARTAGLIA', ['L10', 'J12', 'J13'], DISPOS);
    pour('2F-AGNESI 2F-CANTOR 2F-NAPIER 2F-HYPATIE 2F-FERMAT 2F-EUCLIDE 2F-PASCAL 2F-DEDEKIND 2F-KEPLER 2F-NEWTON', ['J12', 'J13'], DISPOS);
    // 2H — mardi 13h : seule heure de repas.
    pour('2H-FIBONACCI 2H-GALOIS 2H-NASH 2H-FOURIER 2H-BOREL 2H-LEGENDRE 2H-NOETHER 2H-POISSON 2H-TARTAGLIA 2H-RIEMANN 2H-CARDAN 2H-BERNOULLI 2H-VILLANI 2H-BOOLE 2H-CANTOR 2H-GERMAIN 2H-CAUCHY 2H-HILBERT 2H-LOVELACE 2H-LEIBNIZ 2H-TURING 2H-KEPLER 2H-DESCARTES 2H-NEWTON 2H-GAUSS 2H-PASCAL', ['L10', 'J12', 'J13'], DISPOS);

    var JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

    function dateLocale(s) { var t = s.split('-').map(Number); return new Date(t[0], t[1] - 1, t[2]); }
    function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    function texteDate(d) { return (d.getDate() === 1 ? '1er' : d.getDate()) + ' ' + MOIS[d.getMonth()]; }

    /* Toutes les séances datées, par semaine. creneaux : liste d'identifiants (L10…) ou absent pour tous.
       Chaque séance : { id: '2026-11-02 10h', date, cle, texte, exclusif } */
    function seances(creneaux) {
        var ids = creneaux || Object.keys(CRENEAUX);
        return SEMAINES.map(function (s) {
            var lundi = dateLocale(s[0]), liste = [];
            ids.forEach(function (cle) {
                var c = CRENEAUX[cle];
                if (!c || c.semaine.indexOf(s[1]) < 0) return;
                var d = new Date(lundi); d.setDate(d.getDate() + c.jour);
                if (FERIES.indexOf(iso(d)) >= 0) return;
                liste.push({ id: iso(d) + ' ' + c.debut + 'h', date: d, cle: cle, exclusif: c.exclusif,
                             texte: JOURS[c.jour] + ' ' + texteDate(d) + ' — ' + c.horaire });
            });
            liste.sort(function (a, b) { return a.date - b.date || CRENEAUX[a.cle].debut - CRENEAUX[b.cle].debut; });
            return { titre: 'Semaine du ' + texteDate(lundi) + ' (semaine ' + s[1] + ')', seances: liste };
        }).filter(function (s) { return s.seances.length; });
    }

    return {
        dispos: function (code) { return DISPOS[String(code || '').toUpperCase()] || null; },
        seances: seances,
        // une séance est passée à partir du jour même (on ne s'inscrit plus le jour J)
        passee: function (id) { var a = new Date(); a.setHours(0, 0, 0, 0); return dateLocale(id.slice(0, 10)) <= a; }
    };
})();
