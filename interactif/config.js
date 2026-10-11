/* Connexion à la base Supabase (Project Settings > API).
   La clé « publishable » (ou « anon ») est faite pour être publique :
   elle ne permet que d'appeler les fonctions prévues dans schema.sql. */
window.INTERACTIF_CONFIG = {
    url: 'https://cxpupcwsafrfxdlgytwh.supabase.co',
    cle: 'sb_publishable_ryT5LKm_TWnjc9u1fxqShA_s-jmtT34'
};

/* Liste des exercices : regroupés par semaine (groupe), dans l'ordre d'affichage.
   « court » sert d'en-tête de colonne sur la page prof. */
window.INTERACTIF_CATALOGUE = [
    { id: 'seconde/serie6-j1', groupe: 'Série 6 · semaine du 12 au 16 octobre', titre: 'Jour 1', court: 'S6 · J1', url: 'seconde/serie6.html?j=1' },
    { id: 'seconde/serie6-j2', groupe: 'Série 6 · semaine du 12 au 16 octobre', titre: 'Jour 2', court: 'S6 · J2', url: 'seconde/serie6.html?j=2' },
    { id: 'seconde/serie6-j3', groupe: 'Série 6 · semaine du 12 au 16 octobre', titre: 'Jour 3', court: 'S6 · J3', url: 'seconde/serie6.html?j=3' }
];
