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
    { niveau: 'seconde', id: 'seconde/serie6-j3', groupe: 'Série 6 · semaine du 12 au 16 octobre', titre: 'Jour 3', court: 'S6 · J3', url: 'seconde/serie6.html?j=3' },
    { niveau: 'seconde', id: 'seconde/serie6-evaluation', groupe: 'Facultatif · Série 6 en temps limité ⏱', titre: 'Évaluation Série 6 (7 questions chronométrées)', court: 'S6 · Éval', url: 'seconde/serie6-evaluation.html' },
    { niveau: 'seconde', id: 'seconde/serie5-j1', groupe: 'Série 5 · semaine du 5 au 9 octobre', titre: 'Jour 1', court: 'S5 · J1', url: 'seconde/serie5.html?j=1' },
    { niveau: 'seconde', id: 'seconde/serie5-j2', groupe: 'Série 5 · semaine du 5 au 9 octobre', titre: 'Jour 2', court: 'S5 · J2', url: 'seconde/serie5.html?j=2' },
    { niveau: 'seconde', id: 'seconde/serie5-j3', groupe: 'Série 5 · semaine du 5 au 9 octobre', titre: 'Jour 3', court: 'S5 · J3', url: 'seconde/serie5.html?j=3' },
    { niveau: 'seconde', id: 'seconde/serie5-j4', groupe: 'Série 5 · semaine du 5 au 9 octobre', titre: 'Jour 4', court: 'S5 · J4', url: 'seconde/serie5.html?j=4' },
    { niveau: 'seconde', id: 'seconde/serie4-j1', groupe: 'Série 4 · semaine du 28 septembre au 2 octobre', titre: 'Jour 1', court: 'S4 · J1', url: 'seconde/serie4.html?j=1' },
    { niveau: 'seconde', id: 'seconde/serie4-j2', groupe: 'Série 4 · semaine du 28 septembre au 2 octobre', titre: 'Jour 2', court: 'S4 · J2', url: 'seconde/serie4.html?j=2' },
    { niveau: 'seconde', id: 'seconde/serie4-j3', groupe: 'Série 4 · semaine du 28 septembre au 2 octobre', titre: 'Jour 3', court: 'S4 · J3', url: 'seconde/serie4.html?j=3' },
    { niveau: 'seconde', id: 'seconde/serie3-j1', groupe: 'Série 3 · semaine du 21 au 25 septembre', titre: 'Jour 1', court: 'S3 · J1', url: 'seconde/serie3.html?j=1' },
    { niveau: 'seconde', id: 'seconde/serie3-j2', groupe: 'Série 3 · semaine du 21 au 25 septembre', titre: 'Jour 2', court: 'S3 · J2', url: 'seconde/serie3.html?j=2' },
    { niveau: 'seconde', id: 'seconde/serie3-j3', groupe: 'Série 3 · semaine du 21 au 25 septembre', titre: 'Jour 3', court: 'S3 · J3', url: 'seconde/serie3.html?j=3' },
    { niveau: 'seconde', id: 'seconde/serie3-j4', groupe: 'Série 3 · semaine du 21 au 25 septembre', titre: 'Jour 4', court: 'S3 · J4', url: 'seconde/serie3.html?j=4' },
    { niveau: 'seconde', id: 'seconde/serie2-j1', groupe: 'Série 2 · semaine du 14 au 18 septembre', titre: 'Jour 1', court: 'S2 · J1', url: 'seconde/serie2.html?j=1' },
    { niveau: 'seconde', id: 'seconde/serie2-j2', groupe: 'Série 2 · semaine du 14 au 18 septembre', titre: 'Jour 2', court: 'S2 · J2', url: 'seconde/serie2.html?j=2' },
    { niveau: 'seconde', id: 'seconde/serie2-j3', groupe: 'Série 2 · semaine du 14 au 18 septembre', titre: 'Jour 3', court: 'S2 · J3', url: 'seconde/serie2.html?j=3' },
    { niveau: 'seconde', id: 'seconde/serie2-j4', groupe: 'Série 2 · semaine du 14 au 18 septembre', titre: 'Jour 4', court: 'S2 · J4', url: 'seconde/serie2.html?j=4' },
    { niveau: 'seconde', id: 'seconde/serie1-j1', groupe: 'Série 1 · semaine du 7 au 11 septembre', titre: 'Jour 1', court: 'S1 · J1', url: 'seconde/serie1.html?j=1' },
    { niveau: 'seconde', id: 'seconde/serie1-j2', groupe: 'Série 1 · semaine du 7 au 11 septembre', titre: 'Jour 2', court: 'S1 · J2', url: 'seconde/serie1.html?j=2' },
    { niveau: 'seconde', id: 'seconde/serie1-j3', groupe: 'Série 1 · semaine du 7 au 11 septembre', titre: 'Jour 3', court: 'S1 · J3', url: 'seconde/serie1.html?j=3' },
    { niveau: 'seconde', id: 'seconde/serie1-j4', groupe: 'Série 1 · semaine du 7 au 11 septembre', titre: 'Jour 4', court: 'S1 · J4', url: 'seconde/serie1.html?j=4' }
];

/* Description de chaque groupe (même libellé que « groupe » ci-dessus), affichée sous son titre sur la page élève :
   themes = automatismes travaillés (pour mémoire, plus affichés) ; texte = explication ;
   section = 'Anciennes séries' (absente pour la série en cours) ; serie = entrée du menu déroulant des anciennes séries.
   Quand une nouvelle série arrive, mettre la précédente et son bilan facultatif en section: 'Anciennes séries', avec le même serie: 'Série N'. */
window.INTERACTIF_GROUPES = {
    'Série 7 · semaine du 2 au 6 novembre': {
        themes: ['A1 · Comparer deux nombres', 'A3 · Puissances', 'A4 · Écritures d\'un nombre', 'A5 · Encadrer, ordre de grandeur',
                 'A10 · Équations', 'A13 · Proportions', 'A16 · Images et antécédents', 'A20 · Repère orthogonal']
    },
    'Série 6 · semaine du 12 au 16 octobre': {
        section: 'Anciennes séries', serie: 'Série 6',
        themes: ['A1 · Comparer deux nombres', 'A4 · Écritures d\'un nombre', 'A5 · Encadrer, ordre de grandeur',
                 'A9 · Développer', 'A10 · Équations', 'A13 · Proportions']
    },
    'Facultatif · Série 6 en temps limité ⏱': {
        section: 'Anciennes séries', serie: 'Série 6'
    },
    'Série 5 · semaine du 5 au 9 octobre': {
        section: 'Anciennes séries', serie: 'Série 5',
        themes: ['A10 · Équations', 'A13 · Proportions', 'Algo · Variables et affectations', 'Algo · Structures conditionnelles']
    },
    'Série 4 · semaine du 28 septembre au 2 octobre': {
        section: 'Anciennes séries', serie: 'Série 4',
        themes: ['A10 · Équations', 'A21 · Périmètres, aires', 'Algo · Structures conditionnelles', 'Algo · Variables et affectations']
    },
    'Série 3 · semaine du 21 au 25 septembre': {
        section: 'Anciennes séries', serie: 'Série 3',
        themes: ['A8 · Calcul littéral élémentaire', 'A9 · Développer, factoriser', 'Vecteurs', 'Algo · Fonctions']
    },
    'Série 2 · semaine du 14 au 18 septembre': {
        section: 'Anciennes séries', serie: 'Série 2',
        themes: ['A3 · Puissances', 'A4 · Écritures d\'un nombre', 'Vecteurs · Translations', 'Calcul littéral · Distributivité', 'Algo · Lire un programme']
    },
    'Série 1 · semaine du 7 au 11 septembre': {
        section: 'Anciennes séries', serie: 'Série 1',
        themes: ['A1 · Comparer deux nombres', 'A2 · Fractions', 'A3 · Puissances', 'A4 · Écritures d\'un nombre', 'A22 · Pythagore', 'Algo', 'Translations']
    },
    'Facultatif · Série 7 en temps limité ⏱': {}
};

/* Exercices retirés qui ne sont plus au catalogue : masqués dans le suivi prof
   (leurs résultats restent dans la base). */
window.INTERACTIF_MASQUES_PROF = ['seconde/s3-developper'];
