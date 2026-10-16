/* Connexion à la base Supabase (Project Settings > API).
   La clé « publishable » (ou « anon ») est faite pour être publique :
   elle ne permet que d'appeler les fonctions prévues dans schema.sql. */
window.INTERACTIF_CONFIG = {
    url: 'https://cxpupcwsafrfxdlgytwh.supabase.co',
    cle: 'sb_publishable_ryT5LKm_TWnjc9u1fxqShA_s-jmtT34'
};

/* Liste des exercices : regroupés par semaine (groupe), dans l'ordre d'affichage.
   « niveau » (seconde, premiere, terminale) : un élève ne voit que ceux de sa classe.
   « court » sert d'en-tête de colonne sur la page prof.
   « archive: true » : retiré du site (invisible pour les élèves et dans le suivi prof) ;
   les résultats restent dans la base. */
window.INTERACTIF_CATALOGUE = [
    { niveau: 'seconde', id: 'seconde/serie7-j1', groupe: 'Série 7 · semaine du 2 au 6 novembre', titre: 'Jour 1', court: 'S7 · J1', url: 'seconde/serie7.html?j=1' },
    { niveau: 'seconde', id: 'seconde/serie7-j2', groupe: 'Série 7 · semaine du 2 au 6 novembre', titre: 'Jour 2', court: 'S7 · J2', url: 'seconde/serie7.html?j=2' },
    { niveau: 'seconde', id: 'seconde/serie7-j3', groupe: 'Série 7 · semaine du 2 au 6 novembre', titre: 'Jour 3', court: 'S7 · J3', url: 'seconde/serie7.html?j=3' },
    { niveau: 'seconde', id: 'seconde/serie7-bilan', groupe: 'Facultatif · Série 7 en temps limité ⏱', titre: 'Bilan Série 7 (10 questions chronométrées)', court: 'S7 · Bilan', url: 'seconde/serie7-bilan.html' },
    { niveau: 'seconde', id: 'seconde/serie6-j1', groupe: 'Série 6 · semaine du 12 au 16 octobre', titre: 'Jour 1', court: 'S6 · J1', url: 'seconde/serie6.html?j=1' },
    { niveau: 'seconde', id: 'seconde/serie6-j2', groupe: 'Série 6 · semaine du 12 au 16 octobre', titre: 'Jour 2', court: 'S6 · J2', url: 'seconde/serie6.html?j=2' },
    { niveau: 'seconde', id: 'seconde/serie6-j3', groupe: 'Série 6 · semaine du 12 au 16 octobre', titre: 'Jour 3', court: 'S6 · J3', url: 'seconde/serie6.html?j=3' }
];

/* Description de chaque groupe (même libellé que « groupe » ci-dessus), affichée sous son titre sur la page élève :
   themes = automatismes travaillés ; texte = explication ; section = rubrique (« Anciennes séries »),
   absente pour la série en cours. Quand une nouvelle série arrive, mettre la précédente (et son bilan facultatif) en section: 'Anciennes séries'. */
window.INTERACTIF_GROUPES = {
    'Série 7 · semaine du 2 au 6 novembre': {
        themes: ['A1 · Comparer deux nombres', 'A3 · Puissances', 'A4 · Écritures d\'un nombre', 'A5 · Encadrer, ordre de grandeur',
                 'A10 · Équations', 'A13 · Proportions', 'A16 · Images et antécédents', 'A20 · Repère orthogonal']
    },
    'Série 6 · semaine du 12 au 16 octobre': {
        section: 'Anciennes séries',
        themes: ['A1 · Comparer deux nombres', 'A4 · Écritures d\'un nombre', 'A5 · Encadrer, ordre de grandeur',
                 'A9 · Développer', 'A10 · Équations', 'A13 · Proportions']
    },
    'Facultatif · Série 7 en temps limité ⏱': {
        texte: 'Ces bilans ne sont pas obligatoires : ils sont là pour celles et ceux qui veulent s\'entraîner davantage. ' +
               'Un bilan reprend en 10 questions les types de questions de la série, avec d\'autres nombres, mais cette fois ' +
               '<strong>en temps limité</strong> : chaque question a son propre chrono (de 30 secondes à 1 min 15), comme lors d\'une interrogation en classe. ' +
               'Les questions arrivent une par une, sans rappel ni retour en arrière, et la correction s\'affiche à la fin. ' +
               'Conseil : commence par réussir les séries vertes des Jours 1 à 3, puis lance le bilan pour vérifier que tu sais faire vite et seul(e). ' +
               'Tu peux le refaire autant de fois que tu veux : les nombres changent à chaque fois.'
    }
};

/* Exercices retirés qui ne sont plus au catalogue : masqués dans le suivi prof
   (leurs résultats restent dans la base). */
window.INTERACTIF_MASQUES_PROF = ['seconde/s3-developper'];
