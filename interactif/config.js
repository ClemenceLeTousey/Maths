/* Connexion à la base Supabase (Project Settings > API).
   La clé « publishable » (ou « anon ») est faite pour être publique :
   elle ne permet que d'appeler les fonctions prévues dans schema.sql. */
window.INTERACTIF_CONFIG = {
    url: 'https://cxpupcwsafrfxdlgytwh.supabase.co',
    cle: 'sb_publishable_ryT5LKm_TWnjc9u1fxqShA_s-jmtT34'
};

/* Liste des exercices (ordre des colonnes de la page prof) */
window.INTERACTIF_CATALOGUE = [
    { id: 'seconde/s3-developper', classe: 'Seconde', sequence: 'Séquence 3', titre: 'Développer et réduire', url: 'seconde/s3-developper.html' },
    { id: 'seconde/serie6-j1', classe: 'Seconde', sequence: 'Automatismes', titre: 'Série 6 · Jour 1', url: 'seconde/serie6.html?j=1' },
    { id: 'seconde/serie6-j2', classe: 'Seconde', sequence: 'Automatismes', titre: 'Série 6 · Jour 2', url: 'seconde/serie6.html?j=2' },
    { id: 'seconde/serie6-j3', classe: 'Seconde', sequence: 'Automatismes', titre: 'Série 6 · Jour 3', url: 'seconde/serie6.html?j=3' }
];
