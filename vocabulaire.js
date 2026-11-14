/* Bouton « 📖 Vocabulaire » : l'élève tape un mot de l'énoncé qui lui échappe, on lui explique.
   Les mots et leurs explications sont dans lexique.js (même dossier).
   Chargé par :
   - barre.js (séries d'automatismes en pages fixes, corrigés, cours) → bouton dans la barre .barre-site ;
   - les automatismes.js de l'espace élève (seconde, premiere, terminale) → bouton dans la barre .navbar.
   Dans l'espace élève, chaque question a aussi son petit bouton 📖 (à côté des drapeaux de traduction) :
   il ouvre le panneau avec les mots du lexique repérés dans la question.
   Mot absent du lexique : l'élève connecté peut en demander l'ajout ; la demande arrive comme un message
   ordinaire dans l'onglet « Messages » de l'espace professeure (fonction envoyer_message, rien à ajouter dans Supabase).
   Pas de bouton sur les pages d'évaluation (nom de fichier contenant « evaluation »). */
(function () {
    'use strict';
    if (window.VOCABULAIRE_CHARGE) return;
    window.VOCABULAIRE_CHARGE = true;
    if (/evaluation/i.test(decodeURIComponent(location.pathname))) return;

    var racine = document.documentElement;
    var script = document.currentScript;
    var base = script ? script.src.replace(/vocabulaire\.js(\?.*)?$/, '') : '';

    /* ---------- Styles ---------- */
    function sombre(p) {     // règles du thème sombre, préfixées par p
        return [
            p + ' .barre-site .b-vocab,' + p + ' .navbar .b-vocab{background:#1d2a44;color:#9cbcf5;border-color:#30456e}',
            p + ' .b-vocab[aria-expanded="true"]{background:#3b7be6!important;color:#fff!important;border-color:#3b7be6!important}',
            p + ' .barre-vocab{background:#1b2130;color:#e6eaf2;border-color:#2f384c;box-shadow:0 12px 32px rgba(0,0,0,.5)}',
            p + ' .barre-vocab .v-fermer{color:#98a2b6}',
            p + ' .barre-vocab .v-fermer:hover{background:#283042;color:#e6eaf2}',
            p + ' .barre-vocab input{background:#141925;color:#e6eaf2;border-color:#3a445a}',
            p + ' .barre-vocab input:focus{border-color:#6f9cf0}',
            p + ' .barre-vocab .v-info,' + p + ' .barre-vocab .v-sous{color:#98a2b6}',
            p + ' .barre-vocab .v-fiche h3{color:#8fb3f5}',
            p + ' .barre-vocab .v-ex{background:#2e2418;border-color:#e08a5c}',
            p + ' .barre-vocab .v-ex b:first-child{color:#f0a77a}',
            p + ' .barre-vocab .v-astuce{background:#15302a;border-color:#34c79c}',
            p + ' .barre-vocab .v-astuce b:first-child{color:#5fd8b0}',
            p + ' .barre-vocab .v-demande{border-color:#3a445a}',
            p + ' .barre-vocab .v-etat a{color:#8fb3f5}',
            p + ' .barre-vocab .v-puces button{background:#232a3a;border-color:#3a445a;color:#e6eaf2}'
        ].join('');
    }
    var css = [
        // le bouton, dans la barre des séries (barre.js) ou dans celle du site (espace élève)
        '.barre-site .b-vocab{all:unset;cursor:pointer;border:1px solid #c9d6f2;border-radius:999px;padding:3px 12px;color:#2f6fdf;font-weight:600;font-size:14px;background:#f1f5fd}',
        '.navbar .b-vocab{margin:9px 0 9px 8px;padding:4px 12px;font:inherit;font-size:.85rem;font-weight:600;color:#2f6fdf;background:#f1f5fd;border:1px solid #c9d6f2;border-radius:999px;cursor:pointer}',
        '.navbar .b-vocab:hover,.navbar .b-vocab:focus-visible{border-color:#2f6fdf;outline:none}',
        '.b-vocab[aria-expanded="true"]{background:#2f6fdf!important;color:#fff!important;border-color:#2f6fdf!important}',
        // le bouton 📖 de chaque question (espace élève), à côté des drapeaux de traduction
        '.interactif .q-vocab-barre{margin-left:auto;display:flex;gap:6px}',
        '.interactif .q-langues .q-vocab{order:-1}',
        '.interactif button.q-vocab{display:inline-flex;align-items:center;gap:4px;margin:0;padding:2px 7px;border-radius:5px;font:inherit;font-size:13px;font-weight:600;line-height:1.3;',
        'color:#2f6fdf;background:var(--surface,#fff);border:1px solid var(--line,#e3e7ef);opacity:.85;cursor:pointer;box-shadow:none}',
        '.interactif button.q-vocab:hover,.interactif button.q-vocab:focus-visible{opacity:1;border-color:#2f6fdf;outline:none}',
        '.interactif button.q-vocab[aria-expanded="true"]{opacity:1;background:#2f6fdf;color:#fff;border-color:#2f6fdf}',
        'html[data-theme="dark"] .interactif button.q-vocab:not([aria-expanded="true"]){color:#9cbcf5}',
        '@media (max-width:600px){.interactif button.q-vocab span{display:none}}',
        '@media print{.q-vocab{display:none!important}}',
        // le panneau
        '.barre-vocab{all:initial;display:block;position:fixed;top:64px;right:max(16px,calc((100% - 1100px)/2 + 20px));z-index:2000;width:min(400px,calc(100vw - 32px));max-height:calc(100vh - 84px);',
        'overflow:auto;box-sizing:border-box;padding:14px 16px 16px;background:#fff;color:#14213d;border:1px solid #d5dcea;border-radius:14px;box-shadow:0 12px 32px rgba(20,33,61,.18);',
        'font:400 15px/1.5 Lexend,system-ui,-apple-system,"Segoe UI",sans-serif}',
        '.barre-vocab[hidden]{display:none}',
        '.barre-vocab *{box-sizing:border-box;font-family:inherit}',
        '.barre-vocab .v-tete{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;font-weight:700;font-size:16px}',
        '.barre-vocab .v-fermer{all:unset;cursor:pointer;width:30px;height:30px;border-radius:50%;text-align:center;line-height:30px;font-size:20px;color:#66708a}',
        '.barre-vocab .v-fermer:hover{background:#eef1f7;color:#14213d}',
        '.barre-vocab input{all:unset;display:block;width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid #c9d1e1;border-radius:10px;background:#fff;color:#14213d;font-size:16px}',
        '.barre-vocab input:focus{border-color:#2f6fdf;box-shadow:0 0 0 3px rgba(47,111,223,.18)}',
        '.barre-vocab input::placeholder{color:#8a93a8}',
        '.barre-vocab .v-res{margin-top:12px}',
        '.barre-vocab .v-info{margin:0 0 8px;color:#66708a;font-size:14px}',
        '.barre-vocab .v-fiche h3{margin:0 0 6px;padding:0;border:0;font-size:18px;font-weight:700;color:#2f6fdf}',
        '.barre-vocab .v-fiche p{margin:0 0 8px}',
        '.barre-vocab .f{white-space:nowrap}',
        '.barre-vocab .v-ex{padding:8px 10px;border-left:3px solid #e8740c;background:#fdf4ea;border-radius:0 8px 8px 0}',
        '.barre-vocab .v-ex b:first-child{color:#b5511f}',
        '.barre-vocab .v-astuce{padding:8px 10px;border-left:3px solid #0f9d76;background:#e9f7f2;border-radius:0 8px 8px 0}',
        '.barre-vocab .v-astuce b:first-child{color:#0b7a5c}',
        '.barre-vocab .v-puces{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 0}',
        '.barre-vocab .v-puces button{all:unset;cursor:pointer;padding:3px 10px;border-radius:999px;border:1px solid #d5dcea;background:#f6f8fc;color:#14213d;font-size:14px}',
        '.barre-vocab .v-puces button:hover,.barre-vocab .v-puces button:focus-visible{border-color:#2f6fdf;color:#2f6fdf}',
        '.barre-vocab .v-demande{margin:14px 0 0;padding:10px 12px;border:1px dashed #c9d1e1;border-radius:10px;font-size:14px}',
        '.barre-vocab .v-demande p{margin:0 0 8px}',
        '.barre-vocab .v-demander{all:unset;cursor:pointer;display:inline-block;padding:5px 12px;border-radius:8px;background:#2f6fdf;color:#fff;font-weight:600;font-size:14px}',
        '.barre-vocab .v-demander:hover,.barre-vocab .v-demander:focus-visible{background:#1f58c0}',
        '.barre-vocab .v-demander[disabled]{opacity:.6;cursor:default}',
        '.barre-vocab .v-etat{display:block;margin-top:6px;font-size:13px}',
        '.barre-vocab .v-etat a{color:#2f6fdf}',
        '.barre-vocab .v-sous{margin:12px 0 4px;font-size:13px;font-weight:600;color:#66708a;text-transform:uppercase;letter-spacing:.04em}',
        sombre('html[data-theme="dark"]'),
        // espace élève sur téléphone : thème sombre du téléphone (comme style.css)
        '@media (prefers-color-scheme:dark) and (hover:none) and (pointer:coarse){' + sombre('html.vocab-site:not([data-theme="light"])') + '}',
        '@media (max-width:600px){.barre-vocab{top:auto;bottom:16px;right:16px;max-height:70vh}}',
        '@media print{.barre-vocab,.b-vocab{display:none!important}}'
    ].join('');
    var style = document.createElement('style');
    style.textContent = css;
    (document.head || racine).appendChild(style);

    /* ---------- Bouton dans la barre du haut ---------- */
    function installer() {
        var menu = document.querySelector('.barre-site ul'), site = false;
        if (!menu) { menu = document.querySelector('.navbar .nav-links'); site = true; }
        equiperQuestions();
        if (!menu || menu.querySelector('.b-vocab')) return;
        if (site) racine.classList.add('vocab-site');
        var li = document.createElement('li');
        li.innerHTML = '<button type="button" class="b-vocab" aria-expanded="false" aria-controls="barre-vocab" title="Un mot de l\'énoncé que tu ne comprends pas ?">📖 Vocabulaire</button>';
        // avant le bouton Sombre / Clair s'il est déjà là
        var theme = menu.querySelector('.b-theme, .theme-toggle');
        var avant = theme ? theme.closest('li') : null;
        if (avant && avant.parentNode === menu) menu.insertBefore(li, avant); else menu.appendChild(li);
        // site.js ajoute son bouton Sombre à la fin : on le garde après celui-ci
        if (site && !theme) new MutationObserver(function (m, obs) {
            var t = menu.querySelector('.theme-toggle');
            if (t) { obs.disconnect(); var l = t.closest('li'); if (l && l.parentNode === menu) menu.insertBefore(li, l); }
        }).observe(menu, { childList: true });
        panneau().lier(li.firstChild);
    }

    /* ---------- Bouton 📖 dans chaque question de l'espace élève ---------- */
    function equiperQuestions() {
        var zone = document.getElementById('exercice');
        if (!zone) return;
        function equiper() {
            zone.querySelectorAll('li.q:not([data-vocab])').forEach(function (li) {
                li.setAttribute('data-vocab', '');
                var meta = li.querySelector('.q-meta');
                if (!meta) { meta = document.createElement('div'); meta.className = 'q-meta'; li.insertBefore(meta, li.firstChild); }
                var barre = meta.querySelector('.q-langues');
                if (!barre) { barre = document.createElement('span'); barre.className = 'q-vocab-barre'; meta.appendChild(barre); }
                var b = document.createElement('button');
                b.type = 'button'; b.className = 'q-vocab';
                b.title = 'Un mot de cette question que tu ne comprends pas ?';
                b.setAttribute('aria-label', 'Vocabulaire de cette question');
                b.setAttribute('aria-expanded', 'false');
                b.innerHTML = '📖 <span>Vocabulaire</span>';
                b.addEventListener('click', function () {
                    var texte = Array.prototype.map.call(li.querySelectorAll('.q-meta > span:not(.q-langues):not(.q-vocab-barre), .q-enonce'),
                        function (e) { return e.textContent; }).join(' ');
                    var num = li.querySelector('.q-num'), obj = li.querySelector('.q-meta > span:not(.q-niveau):not(.q-langues):not(.q-vocab-barre)');
                    var info = 'Question ' + (num ? num.textContent.trim() : '?') + (obj ? ' · ' + obj.textContent.trim() : '');
                    panneau().basculer(b, texte, info);
                });
                barre.appendChild(b);
            });
        }
        equiper();
        // les questions sont créées (et recréées : « refaire la série ») par moteur.js
        new MutationObserver(equiper).observe(zone, { childList: true, subtree: true });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installer);
    else installer();

    /* ---------- Panneau et recherche ---------- */
    var api = null;
    function panneau() { return api || (api = panneauVocabulaire()); }
    function panneauVocabulaire() {
        var panneau = null, champ, zone, lexique = null, index = [];
        var boutonBarre = null, declencheur = null, texteQuestion = null, motsQuestion = null, infoQuestion = null;

        // minuscules, sans accents, sans article, au singulier : « Les valeurs rondes » → « valeur ronde »
        function normaliser(t) {
            return String(t).toLowerCase().replace(/%/g, ' pourcent ').replace(/√/g, ' racine ').replace(/≈/g, ' environ ')
                .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’`]/g, "'")
                .replace(/\b(l|d|qu|c)'/g, ' ').replace(/[^a-z0-9()' ]+/g, ' ').replace(/'/g, ' ')
                .split(/\s+/).filter(function (m) { return m && !/^(le|la|les|l|un|une|des|du|de|d|au|aux|a|c|est|quoi|que|qu|veut|dire|ca|mot)$/.test(m); })
                .map(function (m) { return m.length > 3 ? m.replace(/(s|x)$/, '') : m; }).join(' ');
        }
        function distance(a, b) {                       // nombre de fautes de frappe entre deux mots
            var p = [], i, j, c;
            for (j = 0; j <= b.length; j++) p[j] = j;
            for (i = 1; i <= a.length; i++) {
                var d = p[0]; p[0] = i;
                for (j = 1; j <= b.length; j++) { c = p[j]; p[j] = Math.min(p[j] + 1, p[j - 1] + 1, d + (a[i - 1] === b[j - 1] ? 0 : 1)); d = c; }
            }
            return p[b.length];
        }
        function note(q, cle) {
            if (cle === q) return 100;
            if (q.length >= 2 && cle.indexOf(q) === 0) return 85;
            if (cle.length >= 4 && (' ' + q + ' ').indexOf(' ' + cle + ' ') >= 0) return 70 + Math.min(14, cle.length / 2);   // « c'est quoi un antécédent » (clé la plus longue = la plus précise)
            if (q.length >= 3 && (' ' + cle).indexOf(' ' + q) >= 0) return 70;
            if (q.length >= 4 && cle.indexOf(q) >= 0) return 60;
            var tol = q.length <= 4 ? 1 : q.length <= 8 ? 2 : 3, d = distance(q, cle);
            if (d <= tol) return 55 - 5 * d;
            // un des mots tapés ressemble à un mot de la clé (ex. « ypothenuse »)
            var mieux = 0;
            q.split(' ').forEach(function (a) {
                if (a.length < 4) return;
                cle.split(' ').forEach(function (b) {
                    var e = distance(a, b);
                    if (e <= (a.length <= 6 ? 1 : 2)) mieux = Math.max(mieux, 45 - 5 * e);
                });
            });
            return mieux;
        }
        function chercher(texte) {
            var q = normaliser(texte);
            if (!q) return [];
            return index.map(function (x) {
                return { f: x.f, n: Math.max.apply(null, x.cles.map(function (c) { return note(q, c); })) };
            }).filter(function (r) { return r.n > 0; })
              .sort(function (a, b) { return b.n - a.n || a.f.mot.localeCompare(b.f.mot, 'fr'); });
        }
        // mots du lexique présents dans le texte d'une question (mots entiers, clés d'au moins 4 lettres)
        function motsDans(texte) {
            var t = ' ' + normaliser(texte) + ' ', vus = [];
            index.forEach(function (x) {
                if (x.cles.some(function (c) { return c.length >= 4 && t.indexOf(' ' + c + ' ') >= 0; })) vus.push(x.f.mot);
            });
            return vus.sort(function (a, b) { return a.localeCompare(b, 'fr'); });
        }
        function trouver(mot) { var n = normaliser(mot); return (lexique || []).filter(function (f) { return normaliser(f.mot) === n; })[0]; }
        function echapper(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
        function puces(mots) {
            return '<div class="v-puces">' + mots.map(function (m) { return '<button type="button" data-mot="' + echapper(m) + '">' + echapper(m) + '</button>'; }).join('') + '</div>';
        }
        function fiche(f) {
            return '<div class="v-fiche"><h3>' + echapper(f.mot) + '</h3><p>' + f.def + '</p>' +
                (f.ex ? '<p class="v-ex"><b>Exemple :</b> ' + f.ex + '</p>' : '') +
                (f.astuce ? '<p class="v-astuce"><b>💡 Astuce :</b> ' + f.astuce + '</p>' : '') +
                (f.voir && f.voir.length ? '<div class="v-sous">Voir aussi</div>' + puces(f.voir.filter(trouver)) : '') + '</div>';
        }
        function tousLesMots() {
            return lexique.map(function (f) { return f.mot; }).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
        }
        function afficher() {
            if (!lexique) { zone.innerHTML = '<p class="v-info">Chargement…</p>'; return; }
            var t = champ.value.trim();
            if (!t && texteQuestion != null) {
                if (!motsQuestion) motsQuestion = motsDans(texteQuestion);
                zone.innerHTML = motsQuestion.length
                    ? '<p class="v-info">Mots de cette question : clique sur celui qui te pose problème, ou tape un autre mot.</p>' + puces(motsQuestion)
                    : '<p class="v-info">Je n\'ai pas repéré de mot du lexique dans cette question. Tape le mot qui te pose problème, ou choisis-le dans la liste.</p>' +
                      '<div class="v-sous">Tous les mots</div>' + puces(tousLesMots());
                return;
            }
            if (!t) {
                zone.innerHTML = '<p class="v-info">Tape le mot de l\'énoncé qui te pose problème, ou choisis-le dans la liste.</p>' +
                    '<div class="v-sous">Tous les mots</div>' + puces(tousLesMots());
                return;
            }
            var r = chercher(t);
            if (!r.length) {
                zone.innerHTML = '<p class="v-info">Je ne connais pas encore « ' + echapper(t) + ' ». Vérifie l\'orthographe ou essaie un mot plus court.</p>' +
                    blocDemande(t, true) + '<div class="v-sous">Tous les mots</div>' + puces(tousLesMots());
                return;
            }
            // mot trouvé tel quel : on ne propose que des mots vraiment proches (pas les ressemblances approximatives)
            var premier = r[0], autres = r.slice(1).filter(function (x) { return x.n >= (premier.n === 100 ? 70 : 45); }).slice(0, 6);
            // une fiche si le mot est reconnu sans ambiguïté ; sinon (ex. « valeur » : ronde, exacte, approchée ?) la liste des possibilités
            if (premier.n === 100 || !autres.length || premier.n > autres[0].n) {
                zone.innerHTML = fiche(premier.f) +
                    (autres.length ? '<div class="v-sous">Tu cherchais peut-être</div>' + puces(autres.map(function (x) { return x.f.mot; })) : '') +
                    (premier.n < 100 ? blocDemande(t, false) : '');
            } else {
                zone.innerHTML = '<p class="v-info">Tu cherches peut-être :</p>' + puces(r.slice(0, 8).map(function (x) { return x.f.mot; })) + blocDemande(t, false);
            }
        }

        /* ---------- Demande d'ajout d'un mot (message dans l'onglet « Messages » de l'espace professeure) ---------- */
        var CLE_DEMANDES = 'vocabulaire-demandes';
        function dejaDemandes() { try { return JSON.parse(localStorage.getItem(CLE_DEMANDES)) || []; } catch (e) { return []; } }
        function blocDemande(t, absent) {
            var deja = dejaDemandes().indexOf(normaliser(t)) >= 0;
            return '<div class="v-demande"><p>' + (absent ? 'Ce mot manque ?' : 'Ce n\'est pas le mot que tu cherchais ?') +
                ' Demande à ta professeure de l\'ajouter.</p>' +
                (deja ? '<span class="v-etat">✓ Tu as déjà demandé « ' + echapper(t) + ' ». Merci !</span>'
                      : '<button type="button" class="v-demander" data-demande="' + echapper(t) + '">📨 Demander l\'ajout de « ' + echapper(t) + ' »</button><span class="v-etat" aria-live="polite"></span>') +
                '</div>';
        }
        function session() { try { return JSON.parse(localStorage.getItem('interactif-session')); } catch (e) { return null; } }
        function config() {         // config.js de l'espace élève (déjà là sur ses pages, chargé à la demande ailleurs)
            if (window.INTERACTIF_CONFIG) return Promise.resolve(window.INTERACTIF_CONFIG);
            return new Promise(function (ok, ko) {
                var s = document.createElement('script');
                s.src = base + 'espace-eleve/config.js';
                s.onload = function () { window.INTERACTIF_CONFIG ? ok(window.INTERACTIF_CONFIG) : ko(new Error('configuration absente')); };
                s.onerror = function () { ko(new Error('Pas de connexion internet ?')); };
                document.head.appendChild(s);
            });
        }
        function envoyer(texte, s) {
            if (window.Interactif && window.Interactif.rpc) return window.Interactif.rpc('envoyer_message', { p_jeton: s.jeton, p_texte: texte });
            return config().then(function (c) {
                var entetes = { 'Content-Type': 'application/json', apikey: c.cle };
                if (!/^sb_/.test(c.cle)) entetes.Authorization = 'Bearer ' + c.cle;
                return fetch(c.url + '/rest/v1/rpc/envoyer_message', { method: 'POST', headers: entetes, body: JSON.stringify({ p_jeton: s.jeton, p_texte: texte }) })
                    .then(function (r) {
                        if (r.ok) return;
                        return r.json().then(function (d) { throw new Error((d && d.message) || 'Erreur du serveur (' + r.status + ')'); },
                                             function () { throw new Error('Erreur du serveur (' + r.status + ')'); });
                    }, function () { throw new Error('Pas de connexion internet ?'); });
            });
        }
        function demander(bouton) {
            var mot = bouton.dataset.demande, etat = bouton.parentNode.querySelector('.v-etat'), s = session();
            if (!s || !s.jeton) {
                etat.innerHTML = 'Connecte-toi d\'abord à ton <a href="' + base + 'espace-eleve/">espace élève</a>, puis recommence.';
                return;
            }
            var page = decodeURIComponent(location.pathname).replace(/^.*\/(espace-eleve|Maths)\//, '');
            var texte = '📖 Vocabulaire : peux-tu ajouter le mot « ' + mot + ' » au lexique ?\n' +
                'Page : ' + (document.title || page) + ' (' + page + ')' + (infoQuestion ? '\n' + infoQuestion : '');
            bouton.disabled = true;
            etat.textContent = 'Envoi…';
            envoyer(texte, s).then(function () {
                var l = dejaDemandes(); l.push(normaliser(mot));
                try { localStorage.setItem(CLE_DEMANDES, JSON.stringify(l.slice(-100))); } catch (e) {}
                bouton.remove();
                etat.textContent = '✓ Demande envoyée à ta professeure, merci !';
            }, function (x) {
                bouton.disabled = false;
                etat.textContent = 'Non envoyée : ' + x.message;
            });
        }
        function preparer() {
            lexique = (window.LEXIQUE || []).slice();
            index = lexique.map(function (f) {
                var cles = [f.mot].concat(f.aussi || []).map(normaliser).filter(Boolean);
                return { f: f, cles: cles };
            });
            afficher();
        }
        function charger() {
            if (window.LEXIQUE) { preparer(); return; }
            var s = document.createElement('script');
            s.src = base + 'lexique.js';
            s.onload = preparer;
            s.onerror = function () { zone.innerHTML = '<p class="v-info">Le lexique n\'a pas pu être chargé. Vérifie la connexion puis réessaie.</p>'; };
            document.head.appendChild(s);
        }
        function creer() {
            panneau = document.createElement('div');
            panneau.className = 'barre-vocab';
            panneau.id = 'barre-vocab';
            panneau.setAttribute('role', 'dialog');
            panneau.setAttribute('aria-label', 'Vocabulaire');
            panneau.hidden = true;
            panneau.innerHTML = '<div class="v-tete"><span>📖 Vocabulaire</span><button type="button" class="v-fermer" aria-label="Fermer">×</button></div>' +
                '<input type="search" placeholder="Ex. : valeur ronde, antécédent…" aria-label="Mot à chercher" autocomplete="off" autocapitalize="off" spellcheck="false">' +
                '<div class="v-res" aria-live="polite"></div>';
            document.body.appendChild(panneau);
            champ = panneau.querySelector('input');
            zone = panneau.querySelector('.v-res');
            champ.addEventListener('input', afficher);
            panneau.querySelector('.v-fermer').onclick = fermer;
            zone.addEventListener('click', function (e) {
                var d = e.target.closest('button[data-demande]');
                if (d) { demander(d); return; }
                var b = e.target.closest('button[data-mot]');
                if (!b) return;
                champ.value = b.dataset.mot;
                afficher();
                panneau.scrollTop = 0;
            });
            // les séries utilisent Espace, Entrée et les flèches : les touches tapées ici ne doivent pas les déclencher
            panneau.addEventListener('keydown', function (e) {
                e.stopPropagation();
                if (e.key === 'Escape') { e.preventDefault(); fermer(); }
                else if (e.key === 'Enter' && e.target === champ) {
                    e.preventDefault();
                    var b = zone.querySelector('button[data-mot]');
                    if (b && !zone.querySelector('.v-fiche')) b.click();
                }
            });
            ['keyup', 'keypress'].forEach(function (t) { panneau.addEventListener(t, function (e) { e.stopPropagation(); }); });
            charger();
        }
        function ouvrir(depuis, texte, info) {
            if (!panneau) creer();
            if (declencheur && declencheur !== depuis) declencheur.setAttribute('aria-expanded', 'false');
            declencheur = depuis;
            texteQuestion = texte == null ? null : texte;
            infoQuestion = info || null;
            motsQuestion = null;
            champ.value = '';
            // juste sous la barre (sa hauteur varie quand elle passe sur deux lignes) ; en bas de l'écran sur téléphone (CSS)
            if (window.innerWidth > 600) {
                var nav = document.querySelector('.barre-site, .navbar');
                var haut = Math.max(16, nav ? nav.getBoundingClientRect().bottom + 8 : 16);
                panneau.style.top = haut + 'px';
                panneau.style.maxHeight = 'calc(100vh - ' + (haut + 16) + 'px)';
            } else { panneau.style.top = ''; panneau.style.maxHeight = ''; }
            panneau.hidden = false;
            if (declencheur) declencheur.setAttribute('aria-expanded', 'true');
            afficher();
            champ.focus();
            champ.select();
        }
        function fermer() {
            if (!panneau || panneau.hidden) return;
            panneau.hidden = true;
            if (declencheur) { declencheur.setAttribute('aria-expanded', 'false'); declencheur.focus(); }
            declencheur = null;
        }
        // même bouton : on ferme ; autre bouton : le panneau passe à celui-ci
        function basculer(depuis, texte, info) {
            if (panneau && !panneau.hidden && declencheur === depuis) fermer(); else ouvrir(depuis, texte, info);
        }
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fermer(); });
        return {
            basculer: basculer,
            lier: function (b) { boutonBarre = b; b.onclick = function () { basculer(b, null); }; }
        };
    }
})();
