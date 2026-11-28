/* Jeu caché du mode Noël : « La course du traîneau » (course sans fin).
   Il s'ouvre quand on clique sur le traîneau qui traverse le ciel derrière la page (site.js).
   Le traîneau file sur la neige : on saute par-dessus les sapins et les bonshommes de neige ;
   plus loin arrivent des chouettes, à sauter si elles volent bas, à laisser passer si elles volent haut.
   Plus on appuie longtemps, plus on saute haut ; flèche du bas = redescendre plus vite. Tout accélère peu à peu.
   Record gardé sur l'appareil. */
(function () {
    'use strict';
    if (window.jeuTraineau) return;

    var W = 680, H = 240;                      // taille logique du terrain
    var SOL = H - 34;                          // niveau de la neige
    var X_JOUEUR = 90;
    var CLE_RECORD = 'site-maths-record-traineau';
    var fond = null, canvas, ctx, anim, dernier, retourFocus, ancienOverflow;
    var etat, distance, vitesse, record, obstacles, prochain, flocons, collines, joueur, appui, bas, finDepuis, eclat, temps;

    function hasard(a, b) { return a + Math.random() * (b - a); }
    function choix(t) { return t[Math.floor(Math.random() * t.length)]; }

    // le traîneau, vu de profil, tourné vers la droite ; (x, y) = bas des patins ; longueur 2s environ
    function dessinerTraineau(c, x, y, s, couleur, sac) {
        c.save();
        c.translate(x, y);
        c.scale(s / 30, s / 30);
        c.lineCap = 'round';
        c.lineJoin = 'round';
        // patins
        c.strokeStyle = couleur.patin;
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(-30, 0); c.lineTo(22, 0); c.quadraticCurveTo(34, 0, 32, -10); c.quadraticCurveTo(30, -15, 26, -11);
        c.moveTo(-18, 0); c.lineTo(-16, -8); c.moveTo(12, 0); c.lineTo(10, -8);
        c.stroke();
        // sac de cadeaux
        if (sac) {
            c.fillStyle = couleur.sac;
            c.beginPath(); c.ellipse(-12, -26, 13, 12, -0.2, 0, Math.PI * 2); c.fill();
            c.fillStyle = couleur.ruban;
            c.fillRect(-15, -40, 6, 5);
        }
        // caisse
        c.fillStyle = couleur.caisse;
        c.beginPath();
        c.moveTo(-30, -24); c.lineTo(-27, -8); c.lineTo(18, -8); c.quadraticCurveTo(28, -8, 28, -20);
        c.lineTo(16, -17); c.lineTo(-20, -17); c.lineTo(-24, -26); c.closePath();
        c.fill();
        c.strokeStyle = couleur.liseré;
        c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(-26, -12); c.lineTo(18, -12); c.stroke();
        c.restore();
    }

    // un renne au galop (silhouette), tourné vers la droite ; p = phase du galop
    function dessinerRenne(c, x, y, s, p, teinte) {
        c.save();
        c.translate(x, y);
        c.scale(s / 30, s / 30);
        c.fillStyle = teinte; c.strokeStyle = teinte;
        c.lineCap = 'round';
        c.beginPath(); c.ellipse(0, -14, 12, 5.5, 0, 0, Math.PI * 2); c.fill();          // corps
        c.lineWidth = 3.2;
        var a = Math.sin(p) * 5, b = Math.cos(p) * 5;
        c.beginPath();
        c.moveTo(-8, -11); c.lineTo(-12 - a, -1);
        c.moveTo(-5, -11); c.lineTo(-7 + b, -1);
        c.moveTo(7, -11); c.lineTo(11 + a, -2);
        c.moveTo(9, -11); c.lineTo(14 - b, -3);
        c.moveTo(10, -16); c.lineTo(15, -24);                                             // cou
        c.stroke();
        c.beginPath(); c.ellipse(18, -25, 5, 3, 0.3, 0, Math.PI * 2); c.fill();             // tête
        c.lineWidth = 1.6;
        c.beginPath();                                                                      // bois
        c.moveTo(15, -27); c.lineTo(12, -34); c.lineTo(9, -36); c.moveTo(12, -34); c.lineTo(13, -38);
        c.moveTo(17, -28); c.lineTo(17, -35); c.lineTo(15, -38); c.moveTo(17, -35); c.lineTo(20, -37);
        c.moveTo(-11, -16); c.lineTo(-15, -19);                                             // queue
        c.stroke();
        c.restore();
    }

    // l'attelage complet qui traverse le ciel (site.js) : deux rennes devant le traîneau
    function dessinerAttelage(c, x, y, s, p, teinte) {
        var coul = { patin: teinte, sac: teinte, ruban: teinte, caisse: teinte, liseré: 'rgba(0,0,0,0)' };
        c.save();
        c.strokeStyle = teinte;
        c.lineWidth = Math.max(0.8, s / 30);
        c.beginPath();
        c.moveTo(x + s * 0.9, y - s * 0.6);
        c.lineTo(x + s * 2.0, y - s * 0.55);
        c.lineTo(x + s * 3.1, y - s * 0.5);
        c.stroke();
        c.restore();
        dessinerTraineau(c, x, y, s, coul, true);
        dessinerRenne(c, x + s * 2.0, y - s * 0.05 + Math.sin(p) * s * 0.06, s * 0.8, p, teinte);
        dessinerRenne(c, x + s * 3.2, y - s * 0.1 + Math.cos(p) * s * 0.06, s * 0.8, p + 1.3, teinte);
    }


    /* ---------- Obstacles ---------- */
    function dessinerSapin(o) {
        var x = o.x, b = SOL + 2, h = o.h, l = o.w;
        ctx.fillStyle = '#6b4423';
        ctx.fillRect(x + l / 2 - 3, b - h * 0.16, 6, h * 0.16);
        for (var e = 0; e < 3; e++) {
            var base = b - h * 0.14 - e * h * 0.25, haut = base - h * 0.42, lg = l * (1 - e * 0.22) / 2;
            ctx.fillStyle = e % 2 ? '#1c7a4a' : '#16653d';
            ctx.beginPath(); ctx.moveTo(x + l / 2 - lg, base); ctx.lineTo(x + l / 2, haut); ctx.lineTo(x + l / 2 + lg, base); ctx.fill();
            ctx.fillStyle = '#f2f7ff';           // neige au bout des branches
            ctx.beginPath(); ctx.moveTo(x + l / 2 - lg, base); ctx.lineTo(x + l / 2 - lg * 0.55, base - 4); ctx.lineTo(x + l / 2 - lg * 0.2, base); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + l / 2 + lg * 0.25, base); ctx.lineTo(x + l / 2 + lg * 0.6, base - 4); ctx.lineTo(x + l / 2 + lg, base); ctx.fill();
        }
        ctx.fillStyle = '#ffd45a';             // petite étoile au sommet
        ctx.beginPath(); ctx.arc(x + l / 2, b - h + 1, 2.4, 0, Math.PI * 2); ctx.fill();
    }

    function dessinerBonhomme(o) {
        var cx = o.x + o.w / 2, b = SOL + 2;
        ctx.fillStyle = '#f4f8ff';
        ctx.strokeStyle = '#b9cbe2';
        ctx.lineWidth = 1.2;
        [[b - 11, 12], [b - 29, 9], [b - 42, 6.5]].forEach(function (r) { ctx.beginPath(); ctx.arc(cx, r[0], r[1], 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
        ctx.fillStyle = '#14213d';
        ctx.fillRect(cx - 7, b - 50, 14, 2.5); ctx.fillRect(cx - 4.5, b - 58, 9, 8);          // chapeau
        ctx.beginPath(); ctx.arc(cx - 3.5, b - 43, 1.1, 0, 7); ctx.arc(cx + 1.5, b - 43, 1.1, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(cx, b - 31, 1.2, 0, 7); ctx.arc(cx, b - 26, 1.2, 0, 7); ctx.fill();
        ctx.fillStyle = '#ff7a1a';                                                              // nez carotte
        ctx.beginPath(); ctx.moveTo(cx - 1, b - 42); ctx.lineTo(cx - 9, b - 40.5); ctx.lineTo(cx - 1, b - 39.5); ctx.fill();
        ctx.fillStyle = '#d6262f';                                                              // écharpe
        ctx.fillRect(cx - 7, b - 37.5, 14, 3); ctx.fillRect(cx + 2, b - 37, 3, 8);
        ctx.strokeStyle = '#6b4423'; ctx.lineWidth = 1.6;                                       // bras
        ctx.beginPath(); ctx.moveTo(cx - 8, b - 30); ctx.lineTo(cx - 17, b - 37); ctx.moveTo(cx + 8, b - 30); ctx.lineTo(cx + 16, b - 36); ctx.stroke();
    }

    function dessinerChouette(o) {
        var cx = o.x + o.w / 2, cy = o.y, battement = Math.sin(temps * 14 + o.p);
        ctx.fillStyle = '#e9eef6';
        ctx.beginPath();                                                                        // ailes
        ctx.moveTo(cx - 3, cy - 2); ctx.quadraticCurveTo(cx - 14, cy - 4 - battement * 12, cx - 22, cy - battement * 10);
        ctx.quadraticCurveTo(cx - 12, cy + 2, cx - 3, cy + 4);
        ctx.moveTo(cx + 3, cy - 2); ctx.quadraticCurveTo(cx + 14, cy - 4 - battement * 12, cx + 22, cy - battement * 10);
        ctx.quadraticCurveTo(cx + 12, cy + 2, cx + 3, cy + 4);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.ellipse(cx, cy + 1, 8, 10, 0, 0, Math.PI * 2); ctx.fill();          // corps
        ctx.fillStyle = '#7d8aa3';
        [[-3, 5], [2, 7], [-1, 9], [3, 3]].forEach(function (t) { ctx.fillRect(cx + t[0], cy + t[1], 2, 1.2); });
        ctx.fillStyle = '#ffd23a';
        ctx.beginPath(); ctx.arc(cx - 3.2, cy - 3, 2.6, 0, 7); ctx.arc(cx + 3.2, cy - 3, 2.6, 0, 7); ctx.fill();
        ctx.fillStyle = '#14213d';
        ctx.beginPath(); ctx.arc(cx - 2.6, cy - 3, 1.2, 0, 7); ctx.arc(cx + 2.6, cy - 3, 1.2, 0, 7); ctx.fill();
        ctx.fillStyle = '#c98f00';
        ctx.beginPath(); ctx.moveTo(cx - 1.3, cy - 0.5); ctx.lineTo(cx + 1.3, cy - 0.5); ctx.lineTo(cx, cy + 2); ctx.fill();
    }

    // boîte de collision un peu plus petite que le dessin, pour que les sauts « limites » passent
    function boite(o) {
        if (o.type === 'chouette') return { g: o.x + 8, d: o.x + o.w - 8, h: o.y - 6, b: o.y + 9 };
        if (o.type === 'sapin') return { g: o.x + o.w * 0.22, d: o.x + o.w * 0.78, h: SOL - o.h + 6, b: SOL };
        return { g: o.x + 6, d: o.x + o.w - 6, h: SOL - 46, b: SOL };
    }
    function boiteJoueur() { return { g: X_JOUEUR - 22, d: X_JOUEUR + 26, h: joueur.y - 30, b: joueur.y - 2 }; }

    function nouvelObstacle() {
        var x = W + 20, s = distance / 10;
        if (s > 350 && Math.random() < 0.28) {
            var hautVol = Math.random() < 0.5;
            obstacles.push({ type: 'chouette', x: x, w: 44, y: hautVol ? SOL - 62 : SOL - 20, p: Math.random() * 6 });
            return;
        }
        if (s > 120 && Math.random() < 0.25) { obstacles.push({ type: 'bonhomme', x: x, w: 30 }); return; }
        var n = s < 150 ? 1 : choix([1, 1, 2, 2, 3]);
        for (var i = 0; i < n; i++) {
            var w = hasard(18, 26), h = hasard(28, n === 3 ? 40 : 52);
            obstacles.push({ type: 'sapin', x: x, w: w, h: h });
            x += w - 2;
        }
    }

    /* ---------- Partie ---------- */
    function nouvellePartie() {
        distance = 0; vitesse = 340; obstacles = []; prochain = 1.2; eclat = 0;
        joueur = { y: SOL, v: 0, sol: true };
        etat = 'jeu';
    }

    function sauter() {
        if (etat !== 'jeu' || !joueur.sol) return;
        joueur.v = -720; joueur.sol = false;
    }

    function avancer(dt) {
        temps += dt;
        flocons.forEach(function (f) {
            f.y += f.v * dt; f.x -= (etat === 'jeu' ? vitesse * 0.15 : 10) * dt * f.r;
            if (f.y > H) f.y = -4;
            if (f.x < -4) f.x = W + 4;
        });
        if (eclat > 0) eclat -= dt;
        if (etat !== 'jeu') return;

        var avant = Math.floor(distance / 1000);
        distance += vitesse * dt;
        if (Math.floor(distance / 1000) > avant) eclat = 1;       // tous les 100 points, le score clignote
        vitesse = Math.min(820, vitesse + 7 * dt);
        collines.forEach(function (c) { c.decalage = (c.decalage + vitesse * c.k * dt) % W; });

        // saut : relâcher tôt = petit saut ; flèche du bas = redescendre vite
        if (!joueur.sol) {
            if (!appui && joueur.v < -280) joueur.v = -280;
            joueur.v += (bas ? 5200 : 2300) * dt;
            joueur.y += joueur.v * dt;
            if (joueur.y >= SOL) { joueur.y = SOL; joueur.v = 0; joueur.sol = true; }
        }

        prochain -= dt;
        if (prochain <= 0) {
            nouvelObstacle();
            prochain = (220 + hasard(0, 1) * 300) / vitesse + Math.max(0.35, 0.9 - vitesse / 1500);
        }
        obstacles.forEach(function (o) { o.x -= vitesse * dt * (o.type === 'chouette' ? 1.12 : 1); });
        obstacles = obstacles.filter(function (o) { return o.x + o.w > -30; });

        var j = boiteJoueur();
        for (var i = 0; i < obstacles.length; i++) {
            var b = boite(obstacles[i]);
            if (j.g < b.d && j.d > b.g && j.h < b.b && j.b > b.h) { finir(); break; }
        }
    }

    function finir() {
        etat = 'fin';
        finDepuis = performance.now();
        var s = Math.floor(distance / 10);
        if (s > record) { record = s; try { localStorage.setItem(CLE_RECORD, String(record)); } catch (e) {} }
    }

    function cinqChiffres(n) { return ('00000' + n).slice(-5); }

    function texte(t, x, y, police, couleur, align) {
        ctx.font = police;
        ctx.fillStyle = couleur;
        ctx.textAlign = align || 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t, x, y);
    }

    function dessiner() {
        var ciel = ctx.createLinearGradient(0, 0, 0, H);
        ciel.addColorStop(0, '#0a1a33'); ciel.addColorStop(1, '#1d3d66');
        ctx.fillStyle = ciel;
        ctx.fillRect(0, 0, W, H);
        // lune
        ctx.fillStyle = 'rgba(255, 246, 214, .9)';
        ctx.beginPath(); ctx.arc(W - 90, 46, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255, 240, 200, .12)';
        ctx.beginPath(); ctx.arc(W - 90, 46, 34, 0, Math.PI * 2); ctx.fill();
        // collines qui défilent (deux plans, plus lents que le sol)
        collines.forEach(function (c) {
            ctx.fillStyle = c.couleur;
            ctx.beginPath(); ctx.moveTo(0, H);
            for (var x = 0; x <= W; x += 8) ctx.lineTo(x, c.y - c.a * Math.sin((x + c.decalage) / c.l * Math.PI * 2) - c.a * 0.4 * Math.sin((x + c.decalage) / (c.l * 0.37)));
            ctx.lineTo(W, H); ctx.fill();
        });
        // sol enneigé
        ctx.fillStyle = '#e4edf8';
        ctx.fillRect(0, SOL, W, H - SOL);
        ctx.fillStyle = '#c3d3e8';
        var dec = (distance || 0) % 40;
        for (var x = -dec; x < W; x += 40) { ctx.fillRect(x, SOL + 9, 12, 2); ctx.fillRect(x + 22, SOL + 19, 7, 2); }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, SOL, W, 2);

        obstacles.forEach(function (o) {
            if (o.type === 'sapin') dessinerSapin(o);
            else if (o.type === 'bonhomme') dessinerBonhomme(o);
            else dessinerChouette(o);
        });

        // le traîneau (léger rebond quand il glisse, penché pendant le saut)
        ctx.save();
        var y = joueur.y - (joueur.sol && etat === 'jeu' ? Math.abs(Math.sin(temps * 18)) * 1.2 : 0);
        ctx.translate(X_JOUEUR, y);
        ctx.rotate(joueur.sol ? 0 : Math.max(-0.25, Math.min(0.2, joueur.v / 2600)));
        dessinerTraineau(ctx, 0, 0, 24, { patin: '#ffd45a', sac: '#8a5a2b', ruban: '#d6262f', caisse: '#c4202b', 'liseré': '#ffd45a' }, true);
        ctx.restore();
        if (joueur.sol && etat === 'jeu') {                     // gerbe de neige derrière les patins
            ctx.fillStyle = 'rgba(255,255,255,.75)';
            for (var i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(X_JOUEUR - 26 - hasard(0, 14), SOL - hasard(1, 7), hasard(0.8, 2), 0, 7); ctx.fill(); }
        }

        ctx.fillStyle = 'rgba(255,255,255,.85)';
        flocons.forEach(function (f) { ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill(); });

        // score
        var s = Math.floor((distance || 0) / 10);
        var visible = eclat <= 0 || Math.floor(eclat * 8) % 2 === 0;
        if (record > 0) texte('RECORD ' + cinqChiffres(record), W - 130, 20, '600 13px "JetBrains Mono", ui-monospace, monospace', '#a9bdd8', 'right');
        if (visible) texte(cinqChiffres(eclat > 0 ? Math.floor(s / 100) * 100 : s), W - 16, 20, '700 15px "JetBrains Mono", ui-monospace, monospace', '#eef4ff', 'right');

        if (etat === 'intro') {
            texte('La course du traîneau', W / 2, 74, '700 34px "Mountains of Christmas", Lexend, cursive', '#ffd45a');
            texte('Espace, flèche du haut ou clic pour sauter par-dessus les sapins', W / 2, 112, '500 14px Lexend, system-ui, sans-serif', '#eef4ff');
            texte('Appuie longtemps pour sauter plus haut · Espace pour partir', W / 2, 134, '500 13px Lexend, system-ui, sans-serif', '#a9bdd8');
        }
        if (etat === 'pause') texte('Pause : P pour reprendre', W / 2, 90, '600 16px Lexend, system-ui, sans-serif', '#eef4ff');
        if (etat === 'fin') {
            texte('Oh non, le traîneau s’est planté !', W / 2, 74, '700 30px "Mountains of Christmas", Lexend, cursive', '#ffd45a');
            texte(s >= record && s > 0 ? 'Nouveau record : ' + s + ' !' : 'Score : ' + s, W / 2, 110, '600 15px Lexend, system-ui, sans-serif', '#eef4ff');
            texte('Espace ou clic pour repartir', W / 2, 134, '500 13px Lexend, system-ui, sans-serif', '#8ff0b0');
        }
    }

    function boucle(now) {
        var dt = Math.min(0.04, (now - dernier) / 1000);
        dernier = now;
        avancer(dt);
        dessiner();
        anim = requestAnimationFrame(boucle);
    }

    /* ---------- Commandes ---------- */
    function presser() {
        appui = true;
        if (etat === 'intro') { nouvellePartie(); sauter(); }
        else if (etat === 'fin') { if (performance.now() - finDepuis > 500) { nouvellePartie(); } }
        else if (etat === 'pause') etat = 'jeu';
        else sauter();
    }

    function clavier(e) {
        var k = e.key.length === 1 ? e.key.toLowerCase() : e.key, enfonce = e.type === 'keydown';
        if (k === 'Escape') { if (enfonce) fermer(); }
        else if (k === ' ' || k === 'ArrowUp' || k === 'z' || k === 'w') { if (enfonce) { if (!e.repeat) presser(); } else appui = false; }
        else if (k === 'ArrowDown' || k === 's') bas = enfonce;
        else if (k === 'p') { if (enfonce && etat === 'jeu') etat = 'pause'; else if (enfonce && etat === 'pause') etat = 'jeu'; }
        else return;
        e.preventDefault();
        e.stopImmediatePropagation();          // Échap ne coupe pas le mode Noël, Espace ne fait pas défiler la page
    }

    function dimensionner() {
        var ech = Math.min((innerWidth - 44) / W, (innerHeight - 150) / H, 1.6);
        ech = Math.max(0.4, ech);
        var dpr = window.devicePixelRatio || 1;
        canvas.style.width = Math.round(W * ech) + 'px';
        canvas.style.height = Math.round(H * ech) + 'px';
        canvas.width = Math.round(W * ech * dpr);
        canvas.height = Math.round(H * ech * dpr);
        ctx.setTransform(ech * dpr, 0, 0, ech * dpr, 0, 0);
    }

    function cache() { if (document.hidden && etat === 'jeu') etat = 'pause'; }

    function ajouterStyle() {
        if (document.getElementById('traineau-style')) return;
        var st = document.createElement('style');
        st.id = 'traineau-style';
        st.textContent = [
            '.traineau-fond{position:fixed;inset:0;z-index:4000;display:flex;align-items:center;justify-content:center;padding:12px;',
            'background:rgba(4,10,20,.86);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);touch-action:none}',
            '.traineau-boite{display:flex;flex-direction:column;align-items:center;gap:8px;max-width:100%;padding:12px 14px 10px;',
            'background:#0b1626;border:2px solid #c4202b;border-radius:14px;box-shadow:0 0 40px rgba(255,90,98,.3)}',
            '.traineau-haut{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%}',
            '.traineau-titre{margin:0;font:700 26px/1 "Mountains of Christmas",Lexend,cursive;color:#ffd45a}',
            '.traineau-fermer{font:600 14px Lexend,system-ui,sans-serif;color:#eef4ff;background:#16304f;border:1px solid #26425f;border-radius:999px;padding:4px 12px;cursor:pointer}',
            '.traineau-fermer:focus-visible{outline:2px solid #ffd45a;outline-offset:2px}',
            '.traineau-boite canvas{display:block;border-radius:8px;outline:none;cursor:pointer;-webkit-user-select:none;user-select:none}',
            '.traineau-aide{margin:0;max-width:44em;font:13px/1.4 Lexend,system-ui,sans-serif;color:#a9bdd8;text-align:center}'
        ].join('');
        document.head.appendChild(st);
    }

    function relacher() { appui = false; }

    function ouvrir() {
        if (fond) return;
        ajouterStyle();
        retourFocus = document.activeElement;
        fond = document.createElement('div');
        fond.className = 'traineau-fond';
        fond.setAttribute('role', 'dialog');
        fond.setAttribute('aria-modal', 'true');
        fond.setAttribute('aria-label', 'La course du traîneau');
        fond.innerHTML = '<div class="traineau-boite"><div class="traineau-haut"><p class="traineau-titre">La course du traîneau</p>' +
            '<button type="button" class="traineau-fermer">Fermer ✕</button></div><canvas tabindex="0"></canvas>' +
            '<p class="traineau-aide">Espace, flèche du haut ou clic (sur téléphone : touche l’écran) pour sauter. Flèche du bas : redescendre plus vite. P : pause. Échap : fermer.</p></div>';
        document.body.appendChild(fond);
        canvas = fond.querySelector('canvas');
        ctx = canvas.getContext('2d');
        fond.querySelector('.traineau-fermer').addEventListener('click', fermer);
        canvas.addEventListener('pointerdown', function (e) { e.preventDefault(); presser(); });
        window.addEventListener('pointerup', relacher);
        window.addEventListener('pointercancel', relacher);
        window.addEventListener('resize', dimensionner);
        window.addEventListener('keydown', clavier, true);
        window.addEventListener('keyup', clavier, true);
        document.addEventListener('visibilitychange', cache);
        ancienOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        try { record = parseInt(localStorage.getItem(CLE_RECORD), 10) || 0; } catch (e) { record = 0; }
        flocons = Array.from({ length: 60 }, function () { return { x: Math.random() * W, y: Math.random() * H, r: 0.7 + Math.random() * 1.8, v: 18 + Math.random() * 35 }; });
        collines = [
            { couleur: '#2a4a74', y: SOL - 38, a: 16, l: 420, k: 0.12, decalage: 0 },
            { couleur: '#3b5f8c', y: SOL - 12, a: 10, l: 260, k: 0.3, decalage: 100 }
        ];
        temps = 0; appui = false; bas = false;
        distance = 0; vitesse = 340; obstacles = []; eclat = 0;
        joueur = { y: SOL, v: 0, sol: true };
        etat = 'intro';
        dimensionner();
        canvas.focus();
        dernier = performance.now();
        anim = requestAnimationFrame(boucle);
    }

    function fermer() {
        if (!fond) return;
        cancelAnimationFrame(anim);
        window.removeEventListener('pointerup', relacher);
        window.removeEventListener('pointercancel', relacher);
        window.removeEventListener('resize', dimensionner);
        window.removeEventListener('keydown', clavier, true);
        window.removeEventListener('keyup', clavier, true);
        document.removeEventListener('visibilitychange', cache);
        fond.remove();
        fond = null;
        document.body.style.overflow = ancienOverflow;
        if (retourFocus && retourFocus.focus) retourFocus.focus();
    }

    window.jeuTraineau = { ouvrir: ouvrir, fermer: fermer, attelage: dessinerAttelage };
})();
