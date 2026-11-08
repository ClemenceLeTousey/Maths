/* ==========================================================================
   Mode anti-triche du quiz final des TP Python (TP3, TP4, TP5…)
   Activé par « antiTriche: true » sur la fiche du TP dans config.js.

   - Le quiz ne s'affiche qu'après « Commencer le quiz » : la page passe en plein écran
     (si l'appareil le permet) et tout le reste de la page (étapes, barre, menus) est masqué.
   - Quitter (autre onglet, autre application, sortie du plein écran, rechargement, fermeture,
     bouton « Quitter le quiz ») bloque le quiz : il faut le code de déblocage de la professeure
     (empreinte SHA-256 dans window.INTERACTIF_CODE_DEBLOCAGE, config.js).
   - Le nombre de sorties est enregistré avec le quiz (champ « s » des détails) et affiché dans Suivi TP.
   - Pas de contrôle dans la vue professeure ni en mode professeure (le TP passe actif: false).
   Limite : rien n'empêche un autre appareil (téléphone) ; le blocage est gardé sur l'appareil.
   ========================================================================== */
(function () {
    'use strict';
    var CLE = 'tp-quiz:';
    var courant = null;          // garde active sur cette page
    var dejaLance = {};          // quiz commencé depuis le chargement de la page (par id)

    function lire(id) { try { return JSON.parse(localStorage.getItem(CLE + id)) || {}; } catch (x) { return {}; } }
    function ecrire(id, s) { try { localStorage.setItem(CLE + id, JSON.stringify(s)); } catch (x) {} }
    function el(tag, classe, html) { var e = document.createElement(tag); if (classe) e.className = classe; if (html != null) e.innerHTML = html; return e; }
    function empreinte(t) {
        return crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)).then(function (b) {
            return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
        });
    }
    function pleinEcran() {
        var d = document.documentElement, f = d.requestFullscreen || d.webkitRequestFullscreen;
        if (!f || document.fullscreenElement || document.webkitFullscreenElement) return;
        try { var p = f.call(d); if (p && p.catch) p.catch(function () {}); } catch (x) {}
    }
    function enPleinEcran() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
    function sortirPleinEcran() {
        var f = document.exitFullscreen || document.webkitExitFullscreen;
        if (f && enPleinEcran()) { try { var p = f.call(document); if (p && p.catch) p.catch(function () {}); } catch (x) {} }
    }

    var style = el('style', null,
        '.at-panneau { border: 2px solid var(--c-seconde, #2563eb); border-radius: 10px; padding: 12px 16px; margin: 8px 0; max-width: 40em; }' +
        '.at-panneau.bloque { border-color: var(--ko, #dc2626); background: var(--ko-fond, #fef2f2); }' +
        '.at-panneau h3 { margin: 0 0 6px; font-size: 1.05em; }' +
        '.at-panneau ul { margin: 6px 0 10px; padding-left: 1.2em; }' +
        '.at-panneau form { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 8px; }' +
        '.at-panneau input { font: inherit; padding: 4px 8px; width: 11em; }' +
        '.at-quitter { margin-top: 14px; }' +
        'html.at-actif, html.at-actif body { background: var(--bg, #fff); }' +
        'html.at-actif { overflow-y: auto; }');
    document.head.appendChild(style);

    /* options : id, carte (section de l'étape), formulaire (questions), actif (booléen) */
    function proteger(o) {
        if (courant) courant.detacher();
        var g = { terminer: function () {}, confirmer: function (m) { return confirm(m); }, detacher: function () {} };
        if (!o.actif || !window.INTERACTIF_CODE_DEBLOCAGE) return g;

        var id = o.id, fq = o.formulaire, carte = o.carte;
        var etat = lire(id);
        if (etat.etat === 'fini') etat = {};   // quiz remis à zéro depuis : on recommence
        // page rechargée ou rouverte pendant le quiz : c'est une sortie
        if (etat.etat === 'en-cours' && !dejaLance[id]) { etat.etat = 'bloque'; etat.sorties = (etat.sorties || 0) + 1; ecrire(id, etat); }

        var actif = false, dialogue = false, caches = [];
        var panneau = el('div', 'at-panneau');
        fq.parentNode.insertBefore(panneau, fq);
        var bQuit = el('button', 'secondaire at-quitter', 'Quitter le quiz'); bQuit.type = 'button';
        fq.appendChild(bQuit);

        function isoler() {
            // masque tout ce qui n'est pas la carte du quiz (frères de chaque ancêtre)
            for (var n = carte; n && n !== document.body; n = n.parentNode) {
                var p = n.parentNode; if (!p) break;
                Array.prototype.forEach.call(p.children, function (f) {
                    if (f === n || f.hidden || /^(SCRIPT|STYLE|LINK)$/.test(f.tagName)) return;
                    f.hidden = true; caches.push(f);
                });
            }
            document.documentElement.classList.add('at-actif');
        }
        function liberer() {
            caches.forEach(function (f) { f.hidden = false; }); caches = [];
            document.documentElement.classList.remove('at-actif');
        }
        function ecouter(on) {
            var m = on ? 'addEventListener' : 'removeEventListener';
            document[m]('visibilitychange', surVisibilite);
            window[m]('blur', surBlur);
            window[m]('beforeunload', surDepart);
            document[m]('fullscreenchange', surPleinEcran);
            document[m]('webkitfullscreenchange', surPleinEcran);
        }
        function surVisibilite() { if (document.hidden) sortie(); }
        function surBlur() { setTimeout(function () { if (actif && !dialogue && !document.hasFocus()) sortie(); }, 300); }
        function surPleinEcran() { if (actif && etat.pleinEcran && !enPleinEcran()) sortie(); }
        function surDepart(ev) { if (!actif) return; sortie(); ev.preventDefault(); ev.returnValue = ''; return ''; }

        function sortie() {
            if (!actif) return;
            actif = false; ecouter(false);
            etat.etat = 'bloque'; etat.sorties = (etat.sorties || 0) + 1; ecrire(id, etat);
            sortirPleinEcran(); liberer();
            montrer();
        }
        function commencer() {
            etat.etat = 'en-cours'; etat.pleinEcran = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
            ecrire(id, etat); dejaLance[id] = true;
            pleinEcran(); isoler();
            actif = true; ecouter(true);
            montrer();
            carte.scrollIntoView({ block: 'start' });
        }
        function montrer() {
            var bloque = etat.etat === 'bloque', enCours = etat.etat === 'en-cours' && actif;
            fq.hidden = !enCours;
            panneau.hidden = enCours;
            panneau.className = 'at-panneau' + (bloque ? ' bloque' : '');
            if (bloque) {
                panneau.innerHTML = '<h3>🔒 Quiz bloqué</h3><p>Tu as quitté la page du quiz' +
                    (etat.sorties > 1 ? ' (' + etat.sorties + ' sorties)' : '') +
                    '. Appelle ta professeure : elle seule peut le débloquer.</p>' +
                    '<form><label>Code de la professeure <input type="password" autocomplete="off" spellcheck="false" autocapitalize="off"></label>' +
                    '<button type="submit">Débloquer</button></form><p class="retour"></p>';
                var f = panneau.querySelector('form'), r = panneau.querySelector('.retour');
                f.onsubmit = function (ev) {
                    ev.preventDefault();
                    empreinte(f.querySelector('input').value.trim()).then(function (h) {
                        if (h !== window.INTERACTIF_CODE_DEBLOCAGE) { r.className = 'retour ko'; r.textContent = '✗ Code incorrect.'; return; }
                        etat.etat = 'pret'; ecrire(id, etat); montrer();
                    });
                };
            } else {
                panneau.innerHTML = '<h3>🛡️ Quiz en mode surveillé</h3><ul>' +
                    '<li>Le quiz s’affiche en plein écran, sans le reste du TP.</li>' +
                    '<li>Si tu quittes la page (autre onglet, autre application, sortie du plein écran, rechargement…), <b>le quiz se bloque</b> : seule ta professeure pourra le débloquer.</li>' +
                    '<li>Pour arrêter avant la fin, utilise le bouton « Quitter le quiz ».</li></ul>' +
                    (etat.sorties ? '<p class="aide">Sorties déjà enregistrées : ' + etat.sorties + '.</p>' : '');
                var b = el('button', null, (etat.sorties ? 'Reprendre' : 'Commencer') + ' le quiz'); b.type = 'button';
                b.onclick = commencer; panneau.appendChild(b);
            }
        }
        bQuit.onclick = function () {
            if (g.confirmer('Quitter le quiz ?\n\nIl sera bloqué : seule ta professeure pourra le débloquer.')) sortie();
        };
        g.confirmer = function (m) { dialogue = true; try { return confirm(m); } finally { setTimeout(function () { dialogue = false; }, 400); } };
        g.terminer = function () {   // réponses validées
            actif = false; ecouter(false);
            etat.etat = 'fini'; ecrire(id, etat);
            sortirPleinEcran(); liberer();
            panneau.remove(); bQuit.remove(); fq.hidden = false;
            courant = null;
        };
        g.detacher = function () { actif = false; ecouter(false); liberer(); };
        courant = g;
        // carte recréée pendant le quiz (même chargement de page) : on continue
        if (etat.etat === 'en-cours' && dejaLance[id]) { isoler(); actif = true; ecouter(true); }
        montrer();
        return g;
    }

    window.AntiTriche = {
        proteger: proteger,
        sorties: function (id) { return lire(id).sorties || 0; }
    };
})();
