/* Connexion à la base Supabase (Project Settings > API).
   La clé « publishable » (ou « anon ») est faite pour être publique :
   elle ne permet que d'appeler les fonctions prévues dans schema.sql. */
window.INTERACTIF_CONFIG = {
    url: 'https://cxpupcwsafrfxdlgytwh.supabase.co',
    cle: 'sb_publishable_ryT5LKm_TWnjc9u1fxqShA_s-jmtT34'
};

/* Notifications push (« Série N disponible », « Série pas finie »).
   comptes : seuls ces comptes voient le bouton d'activation (null = tous les élèves).
   cle : clé publique VAPID (la clé privée est dans le fichier local cles-notifications-push.txt). */
window.NOTIF_CONFIG = {
    comptes: ['PROF-2NDE'],
    cle: 'BFIKG36b9xdoHXRqkVH6JkwC7Iw8ayZt1g9LDL7unT7wYYMZNhFHQxdJzyh-OGjwsb8Aeixkd16f0APFZt6sOA8'
};

/* Liste des exercices : regroupés par semaine (groupe), dans l'ordre d'affichage.
   « niveau » (seconde, premiere, terminale) : un élève ne voit que ceux de sa classe.
   « court » sert d'en-tête de colonne sur la page prof.
   « codeAcces » : empreinte SHA-256 du code d'accès d'un TP, à taper EXACTEMENT (majuscules et tiret compris) ;
     sans le code, le TP reste fermé (sauf TEST-01 et vue professeure).
   « codeAccesClasses: { '2F': empreinte } » : code propre à une classe (remplace codeAcces pour elle ;
     l'ancien accès mémorisé ne vaut plus, la classe est donc bloquée jusqu'au nouveau code) ;
     Empreinte d'un nouveau code : python3 -c "import hashlib;print(hashlib.sha256(b'ABC-234').hexdigest())" ;
   « vueProf: true » : la page sait s'ouvrir telle que l'élève l'a laissée (bouton dans Suivi TP) ;
   « tp: true » : TP en plusieurs étapes (score = étapes réussies, une ligne enregistrée par étape : pas de compteur de séries).
   « comptes: ['TEST-01'] » : visible seulement de ces comptes (séries préparées à l'avance, pour les tester) ;
   « antiTriche: true » : quiz final en mode surveillé (plein écran, blocage à la sortie, code de déblocage ci-dessous) ;
   « archive: true » : retiré du site (invisible pour les élèves et dans le suivi prof) ;
   les résultats restent dans la base. */
/* Code de déblocage du quiz surveillé (« antiTriche: true » sur un TP, voir anti-triche.js) : empreinte SHA-256.
   Le quiz se bloque dès que l'élève quitte la page ; la professeure tape ce code sur l'appareil de l'élève.
   Nouveau code : python3 -c "import hashlib;print(hashlib.sha256(b'QUIZ-1234').hexdigest())" */
window.INTERACTIF_CODE_DEBLOCAGE = '81fea9c97d311bb5192cf2554509b7f790d43628be32a19ef19e633154cacbc6';

window.INTERACTIF_CATALOGUE = [
    { niveau: 'seconde', id: 'seconde/serie8-j1', groupe: 'Série 8 · semaine du 9 au 13 novembre', titre: 'Jour 1', court: 'S8 · J1', url: 'seconde/serie8.html?j=1' },
    { niveau: 'seconde', id: 'seconde/serie8-j2', groupe: 'Série 8 · semaine du 9 au 13 novembre', titre: 'Jour 2', court: 'S8 · J2', url: 'seconde/serie8.html?j=2' },
    { niveau: 'seconde', id: 'seconde/serie8-j3', groupe: 'Série 8 · semaine du 9 au 13 novembre', titre: 'Jour 3', court: 'S8 · J3', url: 'seconde/serie8.html?j=3' },
    { niveau: 'seconde', id: 'seconde/serie8-bilan', groupe: 'Facultatif · Série 8 en temps limité ⏱', titre: 'Bilan Série 8 (10 questions chronométrées)', court: 'S8 · Bilan', url: 'seconde/serie8-bilan.html' },
    // Séries préparées à l'avance : visibles seulement des comptes listés dans « comptes » (à retirer à la publication)
    { niveau: 'seconde', id: 'seconde/serie9-j1', groupe: 'Série 9 · semaine du 16 au 20 novembre', titre: 'Jour 1', court: 'S9 · J1', url: 'seconde/serie9.html?j=1', comptes: ['TEST-01', 'JIMMY'] },
    { niveau: 'seconde', id: 'seconde/serie9-j2', groupe: 'Série 9 · semaine du 16 au 20 novembre', titre: 'Jour 2', court: 'S9 · J2', url: 'seconde/serie9.html?j=2', comptes: ['TEST-01', 'JIMMY'] },
    { niveau: 'seconde', id: 'seconde/serie9-j3', groupe: 'Série 9 · semaine du 16 au 20 novembre', titre: 'Jour 3', court: 'S9 · J3', url: 'seconde/serie9.html?j=3', comptes: ['TEST-01', 'JIMMY'] },
    { niveau: 'seconde', id: 'seconde/serie9-bilan', groupe: 'Facultatif · Série 9 en temps limité ⏱', titre: 'Bilan Série 9 (10 questions chronométrées)', court: 'S9 · Bilan', url: 'seconde/serie9-bilan.html', comptes: ['TEST-01', 'JIMMY'] },
    { niveau: 'seconde', id: 'seconde/serie10-j1', groupe: 'Série 10 · semaine du 23 au 27 novembre', titre: 'Jour 1', court: 'S10 · J1', url: 'seconde/serie10.html?j=1', comptes: ['TEST-01', 'JIMMY'] },
    { niveau: 'seconde', id: 'seconde/serie10-j2', groupe: 'Série 10 · semaine du 23 au 27 novembre', titre: 'Jour 2', court: 'S10 · J2', url: 'seconde/serie10.html?j=2', comptes: ['TEST-01', 'JIMMY'] },
    { niveau: 'seconde', id: 'seconde/serie10-j3', groupe: 'Série 10 · semaine du 23 au 27 novembre', titre: 'Jour 3', court: 'S10 · J3', url: 'seconde/serie10.html?j=3', comptes: ['TEST-01', 'JIMMY'] },
    { niveau: 'seconde', id: 'seconde/serie10-bilan', groupe: 'Facultatif · Série 10 en temps limité ⏱', titre: 'Bilan Série 10 (10 questions chronométrées)', court: 'S10 · Bilan', url: 'seconde/serie10-bilan.html', comptes: ['TEST-01', 'JIMMY'] },
    { niveau: 'seconde', id: 'seconde/serie11-j1', groupe: 'Série 11 · semaine du 30 novembre au 4 décembre', titre: 'Jour 1', court: 'S11 · J1', url: 'seconde/serie11.html?j=1', comptes: ['TEST-01', 'JIMMY'] },
    { niveau: 'seconde', id: 'seconde/serie11-j2', groupe: 'Série 11 · semaine du 30 novembre au 4 décembre', titre: 'Jour 2', court: 'S11 · J2', url: 'seconde/serie11.html?j=2', comptes: ['TEST-01', 'JIMMY'] },
    { niveau: 'seconde', id: 'seconde/serie11-j3', groupe: 'Série 11 · semaine du 30 novembre au 4 décembre', titre: 'Jour 3', court: 'S11 · J3', url: 'seconde/serie11.html?j=3', comptes: ['TEST-01', 'JIMMY'] },
    { niveau: 'seconde', id: 'seconde/serie11-j4', groupe: 'Série 11 · semaine du 30 novembre au 4 décembre', titre: 'Jour 4 · bilan (à la maison)', court: 'S11 · J4', url: 'seconde/serie11.html?j=4', comptes: ['TEST-01', 'JIMMY'] },
    { niveau: 'seconde', id: 'seconde/tp-photo', groupe: 'TP Python · Photographie numérique', titre: 'Créer et modifier une image (10 étapes)', court: 'TP Photo', url: 'seconde/tp-photo.html', tp: true,
      codeAcces: '2a04e66a8ad28d6c60b6cd57d4d4b45e894397c1baeb56b20bbe306c107ee99d' },   // empreinte SHA-256 du code d'accès (le code lui-même n'est pas dans le site)
    // TP1 Premiers pas (version interactive du TP Capytale) : en préparation (PROF-2NDE et 2H-TARTAGLIA seulement ; retirer « comptes » pour publier)
    { niveau: 'seconde', id: 'seconde/tp-premiers-pas', groupe: 'TP Python · Premiers pas : affectation et fonctions', titre: 'Variables, affectation, fonctions (20 étapes)', court: 'TP Premiers pas', url: 'seconde/tp-premiers-pas.html', tp: true, vueProf: true, comptes: ['PROF-2NDE', '2H-TARTAGLIA'], antiTriche: true },   // sans code d'accès
    // TP3 Boucles, TP4 Pixels et TP5 Filtres : en préparation (PROF-2NDE seulement ; retirer « comptes » pour publier)
    // Codes d'accès : TP3 BOUCLE-327, TP4 PIXEL-482, TP5 FILTRE-519 (seule l'empreinte est dans le site)
    { niveau: 'seconde', id: 'seconde/tp-boucles', groupe: 'TP Python · Les boucles', titre: 'for, while, range (16 étapes)', court: 'TP Boucles', url: 'seconde/tp-boucles.html', tp: true, vueProf: true, comptes: ['PROF-2NDE'],
      codeAcces: 'f6e6d5215e50d0a94a9c4b3278f315616612eca19e6ccf2e48e2576f9485f8d8', antiTriche: true },
    { niveau: 'seconde', id: 'seconde/tp-pixels', groupe: 'TP Python · Créer une image pixel par pixel', titre: 'Pixels, couleurs, double boucle (9 étapes)', court: 'TP Pixels', url: 'seconde/tp-pixels.html', tp: true, vueProf: true, comptes: ['PROF-2NDE'],
      codeAcces: '0e9a00530e9b3e7bb719421ed987bc824b42e1415efed2b85a4cefabec7162bc', antiTriche: true },
    { niveau: 'seconde', id: 'seconde/tp-filtres', groupe: 'TP Python · Retoucher une photo : les filtres', titre: 'getpixel, filtres, contours (9 étapes)', court: 'TP Filtres', url: 'seconde/tp-filtres.html', tp: true, vueProf: true, comptes: ['PROF-2NDE'],
      codeAcces: '37add347a24e9e04cf1a91317563727261e1122f32b4ec611c81fb60a5c575ff', antiTriche: true },
    // TP2 hybride (PDF grands caractères à lire + questions en ligne, mêmes numéros) : PROF-2NDE et 2H-TARTAGLIA seulement, même code d'accès que le TP2
    { niveau: 'seconde', id: 'seconde/tp-conditions-hybride', groupe: 'TP Python · Les structures conditionnelles', titre: 'Si… sinon, elif · questions en ligne (13 questions)', court: 'TP Cond. hyb.', url: 'seconde/tp-conditions-hybride.html', tp: true, vueProf: true, comptes: ['PROF-2NDE', '2H-TARTAGLIA'],
      codeAcces: '7bceb7c3c796d4df2b37ee3dbeaf01030c22455f16ffb3f942d3a83c96b01460',   // mêmes codes d'accès que le TP2 habituel
      codeAccesClasses: { '2F': 'e6a96a2b74d96829918f25d0f14c93c9171cfed689c8abf25745f2e2b0f2b056' } },
    // TP Conditions V1 (20 étapes) : archivé, la page reste dans seconde/tp-conditions-v1.html
    { niveau: 'seconde', id: 'seconde/tp-conditions', groupe: 'TP Python · Les structures conditionnelles', titre: 'Si… sinon, elif (20 étapes)', court: 'TP Cond.', url: 'seconde/tp-conditions-v1.html', tp: true, vueProf: true, archive: true,
      codeAcces: 'd7c6ed760ed5b07f0c2766b06a63c0d5ddcec26f17c19db9e3d2a541645aca9c' },   // empreinte SHA-256 du code d'accès (le code lui-même n'est pas dans le site)
    { niveau: 'seconde', id: 'seconde/tp-conditions-v2', groupe: 'TP Python · Les structures conditionnelles', titre: 'Si… sinon, elif (13 étapes)', court: 'TP Cond.', url: 'seconde/tp-conditions.html', tp: true, vueProf: true,
      codeAcces: '7bceb7c3c796d4df2b37ee3dbeaf01030c22455f16ffb3f942d3a83c96b01460',   // empreinte SHA-256 du code d'accès (le code lui-même n'est pas dans le site)
      codeAccesClasses: { '2F': 'e6a96a2b74d96829918f25d0f14c93c9171cfed689c8abf25745f2e2b0f2b056' } },   // 2F : code à part depuis le 08/11/2026
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
    { niveau: 'seconde', id: 'seconde/serie1-j4', groupe: 'Série 1 · semaine du 7 au 11 septembre', titre: 'Jour 4', court: 'S1 · J4', url: 'seconde/serie1.html?j=4' },
    // Terminale ST2S
    { niveau: 'terminale', id: 'terminale/serie6-j1', groupe: 'Série 6 · semaine du 9 au 13 novembre', titre: 'Jour 1', court: 'T · S6 · J1', url: 'terminale/serie6.html?j=1' },
    { niveau: 'terminale', id: 'terminale/serie6-j2', groupe: 'Série 6 · semaine du 9 au 13 novembre', titre: 'Jour 2', court: 'T · S6 · J2', url: 'terminale/serie6.html?j=2' },
    { niveau: 'terminale', id: 'terminale/serie6-j3', groupe: 'Série 6 · semaine du 9 au 13 novembre', titre: 'Jour 3', court: 'T · S6 · J3', url: 'terminale/serie6.html?j=3' },
    { niveau: 'terminale', id: 'terminale/serie6-bilan', groupe: 'Facultatif · Série 6 TST2S en temps limité ⏱', titre: 'Bilan Série 6 (10 questions chronométrées)', court: 'T · S6 · Bilan', url: 'terminale/serie6-bilan.html' },
    { niveau: 'terminale', id: 'terminale/serie7-j1', groupe: 'Série 7 · semaine du 16 au 20 novembre', titre: 'Jour 1', court: 'T · S7 · J1', url: 'terminale/serie7.html?j=1' },
    { niveau: 'terminale', id: 'terminale/serie7-j2', groupe: 'Série 7 · semaine du 16 au 20 novembre', titre: 'Jour 2', court: 'T · S7 · J2', url: 'terminale/serie7.html?j=2' },
    { niveau: 'terminale', id: 'terminale/serie7-j3', groupe: 'Série 7 · semaine du 16 au 20 novembre', titre: 'Jour 3', court: 'T · S7 · J3', url: 'terminale/serie7.html?j=3' },
    { niveau: 'terminale', id: 'terminale/serie7-bilan', groupe: 'Facultatif · Série 7 TST2S en temps limité ⏱', titre: 'Bilan Série 7 (10 questions chronométrées)', court: 'T · S7 · Bilan', url: 'terminale/serie7-bilan.html' },
    // Première (1TC) : une série par semaine, à faire à la maison pour le vendredi suivant (10 questions par couleur, validation question par question)
    { niveau: 'premiere', id: 'premiere/serie1', groupe: 'Série 1 · à faire pour le vendredi 13 novembre', titre: '30 questions (10 vertes, 10 bleues, 10 rouges)', court: '1 · S1', url: 'premiere/serie1.html' }
];

/* Description de chaque groupe (même libellé que « groupe » ci-dessus), affichée sous son titre sur la page élève :
   themes = automatismes travaillés (pour mémoire, plus affichés) ; texte = explication ;
   section = 'Anciennes séries' (absente pour la série en cours) ; serie = entrée du menu déroulant des anciennes séries.
   Quand une nouvelle série arrive, mettre la précédente ET son bilan facultatif en section: 'Anciennes séries', avec le même serie: 'Série N'.
   Chaque libellé ne doit figurer qu'une fois : une clé répétée plus bas écrase la première (le bilan resterait affiché). */
window.INTERACTIF_GROUPES = {
    'Facultatif · Série 8 en temps limité ⏱': {},
    'Série 8 · semaine du 9 au 13 novembre': {},
    'Facultatif · Série 9 en temps limité ⏱': {},
    'Série 9 · semaine du 16 au 20 novembre': {},
    'Facultatif · Série 10 en temps limité ⏱': {},
    'Série 10 · semaine du 23 au 27 novembre': {},
    'Série 11 · semaine du 30 novembre au 4 décembre': {},
    'Série 7 · semaine du 2 au 6 novembre': {
        section: 'Anciennes séries', serie: 'Série 7',
        themes: ['A1 · Comparer deux nombres', 'A3 · Puissances', 'A4 · Écritures d\'un nombre', 'A5 · Encadrer, ordre de grandeur',
                 'A10 · Équations', 'A13 · Proportions', 'A16 · Images et antécédents', 'A20 · Repère orthogonal']
    },
    'Facultatif · Série 7 en temps limité ⏱': {
        section: 'Anciennes séries', serie: 'Série 7'
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
    'TP Python · Photographie numérique': {},
    'TP Python · Les structures conditionnelles': {},
    // Terminale ST2S : « serie » distinct des séries de Seconde (sinon la page prof mélange les colonnes des deux Séries 6)
    'Série 6 · semaine du 9 au 13 novembre': { serie: 'TST2S · Série 6',
        themes: ['Proportions', 'Coefficient multiplicateur', 'Équations du premier degré', 'Suites par récurrence', 'Images et antécédents',
                 'Évolutions successives', 'Résolution graphique', 'Équation de droite', 'Fonction inverse'] },
    'Facultatif · Série 6 TST2S en temps limité ⏱': { serie: 'TST2S · Série 6' },
    'Série 7 · semaine du 16 au 20 novembre': { serie: 'TST2S · Série 7',
        themes: ['Taux d\'évolution, indices', 'Inéquations', 'Suites : terme général, modélisation', 'Dérivée de k/x, variations',
                 'Proportion de proportion', 'Signe', 'Dérivée d\'un polynôme', 'Résolution graphique', 'Évolutions successives'] },
    'Facultatif · Série 7 TST2S en temps limité ⏱': { serie: 'TST2S · Série 7' },
    // Première (1TC) : « serie » distinct des séries de Seconde et de TST2S
    'Série 1 · à faire pour le vendredi 13 novembre': { serie: '1TC · Série 1',
        themes: ['Proportions', 'Appliquer un taux d\'évolution', 'Fractions', 'Équations du premier degré', 'Lire un diagramme'] }
};

/* Onglet « TP Python » de la page élève : les TP dans l'ordre d'affichage.
   id = TP interactif du catalogue (ligne affichée seulement si l'élève y a accès, voir « comptes ») ;
   pdf / corrige = TP sur papier ou Capytale (liens vers les PDF) ; aVenir: true = annoncé, pas encore ouvert.
   Un TP interactif absent de cette liste s'affiche à la fin. */
window.INTERACTIF_TP_ORDRE = [
    // TP1 : version interactive réservée à PROF-2NDE et 2H-TARTAGLIA pour l'instant ; les élèves voient la fiche PDF (Capytale) de la même ligne
    { niveau: 'seconde', nom: 'TP1 · Affectations et fonctions', id: 'seconde/tp-premiers-pas', texte: 'Premiers pas en Python avec Capytale', pdf: 'seconde/tp/tp1-sujet.pdf', corrige: 'seconde/tp/tp1-corrige.pdf' },
    // TP2 : version hybride pour les comptes qui la voient (PROF-2NDE, 2H-TARTAGLIA), sinon le TP2 habituel
    { niveau: 'seconde', nom: 'TP2 · Les structures conditionnelles', id: 'seconde/tp-conditions-hybride', sinon: 'seconde/tp-conditions-v2' },
    // id = TP interactif ; tant qu'il est réservé à PROF-2NDE, les élèves voient « sinon » (ancien TP) ou la fiche PDF
    { niveau: 'seconde', nom: 'TP3 · Les boucles en Python', id: 'seconde/tp-boucles', texte: 'for, range, while', pdf: 'seconde/tp/tp3-sujet.pdf', corrige: 'seconde/tp/corrige-a-venir.html' },
    { niveau: 'seconde', nom: 'TP4 · Créer une image pixel par pixel', id: 'seconde/tp-pixels', sinon: 'seconde/tp-photo' },
    { niveau: 'seconde', nom: 'TP5 · Retoucher une photo : les filtres', id: 'seconde/tp-filtres' }
];

/* Barème automatique des TP (onglet « Suivi TP » de l'espace professeure).
   « points » : points de chaque étape, dans l'ordre (étape 1 en premier) ; note du TP = somme des points
   des étapes réussies, plafonnée à 20. Une étape passée (bouton « Passer ») ne rapporte rien.
   « bonus » : numéros des étapes en bonus (affichées à part ; leurs points rattrapent une étape manquée).
   « quiz » : numéros des étapes de quiz, notées à part sur « quizSur » points (au prorata des bonnes réponses).
   Sans « points » : note = 20 × étapes réussies / étapes comptées (hors bonus et quiz).
   TP Conditions : cumul 4 après le cours, 8 après l'Ex. 1, 9,5 après l'Ex. 2, 14 après l'Ex. 3, 15 après l'Ex. 4,
   17 après l'Ex. 5, 20 après l'Ex. 6 ; quiz final noté sur 5 (1 point par bonne réponse). */
window.INTERACTIF_BAREMES = {
    'seconde/tp-conditions': {   // V1 archivée
        //       cours        Ex. 1        Ex. 2  Ex. 3              Ex. 4  Ex. 5     Ex. 6     quiz  bonus
        points: [1.5, 1, 1.5, 1, 1.5, 1.5, 1.5,   1, 1, 1.5, 1,      1,     1.5, 0.5, 1, 1, 1,  0,    0.5, 0.5],
        bonus: [19, 20],
        quiz: [18], quizSur: 5
    },
    'seconde/tp-premiers-pas': { nonNote: true },   // TP1 : rappels (Capytale déjà fait en classe), non noté
    'seconde/tp-boucles': { nonNote: true },   // TP3 : entraînement, non noté
    'seconde/tp-pixels': {
        // TP4 · A : lire et prévoir (6,5) · B : modifier (8) · C : créer (5,5) · quiz à part
        //       A               B                C         quiz
        points: [2, 2, 2.5,      2.5, 2.5, 3,     2.5, 3,   0],
        quiz: [9], quizSur: 5
    },
    'seconde/tp-filtres': {
        // TP5 · A : lire et prévoir (4) · B : modifier (6) · C : créer (6) · quiz à part · D : défi (4) · bonus contours (1) ; « ta photo » = extra hors barème
        //       A        B        C        quiz  D   bonus
        points: [2, 2,    3, 3,    3, 3,    0,    4,  1],
        bonus: [9],
        quiz: [7], quizSur: 5
    },
    'seconde/tp-conditions-v2': {
        // A : lire et prévoir (6) · B : modifier (7) · C : créer (7) = 20 · quiz à part
        // D : défis 1 et 2 en bonus (2,5 chacun, rattrapent une étape manquée ; note plafonnée à 20)
        //       A          B                  C      quiz  D (bonus)
        points: [2, 2, 2,   2, 2, 1, 1, 1,     3, 4,  0,    2.5, 2.5],
        bonus: [12, 13],
        quiz: [11], quizSur: 5
    },
    'seconde/tp-conditions-hybride': {   // TP2 hybride : même barème que le TP2 en ligne (mêmes étapes, même ordre)
        points: [2, 2, 2,   2, 2, 1, 1, 1,     3, 4,  0,    2.5, 2.5],
        bonus: [12, 13],
        quiz: [11], quizSur: 5
    }
};

/* Exercices retirés qui ne sont plus au catalogue : masqués dans le suivi prof
   (leurs résultats restent dans la base). */
window.INTERACTIF_MASQUES_PROF = ['seconde/s3-developper'];
