/* Pac-Man caché du mode Halloween : il s'ouvre quand on clique sur un fantôme qui passe derrière la page (site.js).
   Flèches, ZQSD ou WASD pour diriger (sur téléphone : glisser le doigt), Espace ou P : pause, Échap : fermer.
   Les pastilles d'énergie sont des citrouilles, et le bonus est une citrouille-lanterne. */
(function () {
    'use strict';
    if (window.pacmanHalloween) return;

    // # mur, . pastille, o citrouille (énergie), - porte de la maison des fantômes
    var PLAN = [
        '############################',
        '#............##............#',
        '#.####.#####.##.#####.####.#',
        '#o####.#####.##.#####.####o#',
        '#.####.#####.##.#####.####.#',
        '#..........................#',
        '#.####.##.########.##.####.#',
        '#.####.##.########.##.####.#',
        '#......##....##....##......#',
        '######.##### ## #####.######',
        '     #.##### ## #####.#     ',
        '     #.##          ##.#     ',
        '     #.## ###--### ##.#     ',
        '######.## #      # ##.######',
        '      .   #      #   .      ',
        '######.## #      # ##.######',
        '     #.## ######## ##.#     ',
        '     #.##          ##.#     ',
        '     #.## ######## ##.#     ',
        '######.## ######## ##.######',
        '#............##............#',
        '#.####.#####.##.#####.####.#',
        '#.####.#####.##.#####.####.#',
        '#o..##.......  .......##..o#',
        '###.##.##.########.##.##.###',
        '###.##.##.########.##.##.###',
        '#......##....##....##......#',
        '#.##########.##.##########.#',
        '#.##########.##.##########.#',
        '#..........................#',
        '############################'
    ];
    var L = 28, H = 31;
    var G = [-1, 0], D = [1, 0], N = [0, -1], S = [0, 1];
    var TOUCHES = { ArrowLeft: G, ArrowRight: D, ArrowUp: N, ArrowDown: S, q: G, a: G, d: D, z: N, w: N, s: S };
    var COULEURS = ['#ff3b3b', '#ffb8ff', '#38e8ff', '#ffb852'];       // les quatre fantômes
    var COINS = [[25, -3], [2, -3], [27, 33], [0, 33]];                   // leurs coins en dispersion
    var CLE_RECORD = 'site-maths-pacman-record';

    var fond, canvas, ctx, murs, T = 16, dpr = 1, anim = null, dernier = 0, temps = 0, retourFocus = null, ancienOverflow = '';
    var grille, restants, mangees, score, record = 0, vies, niveau, pac, fantomes, etat, chrono, peur, combo, cycle, bonus, bulles;

    function lireRecord() { try { return parseInt(localStorage.getItem(CLE_RECORD), 10) || 0; } catch (e) { return 0; } }
    function noterRecord() {
        if (score <= record) return;
        record = score;
        try { localStorage.setItem(CLE_RECORD, String(record)); } catch (e) {}
    }

    /* ---------- Labyrinthe ---------- */
    function cellule(x, y) {
        if (y < 0 || y >= H) return '#';
        return grille[y][(x % L + L) % L];
    }
    function libre(x, y) { var c = cellule(x, y); return c !== '#' && c !== '-'; }
    function oppose(a, b) { return (a[0] || a[1]) && a[0] === -b[0] && a[1] === -b[1]; }

    /* ---------- Partie ---------- */
    function nouvellePartie() { score = 0; vies = 3; niveau = 1; nouveauNiveau(); }

    function nouveauNiveau() {
        grille = PLAN.map(function (r) { return r.split(''); });
        restants = PLAN.join('').replace(/[^.o]/g, '').length;
        mangees = 0;
        bonus = null;
        placer();
    }

    function placer() {
        pac = { x: 13, y: 23, p: 0, dir: G, voulue: G, angle: Math.PI };
        fantomes = [0, 1, 2, 3].map(function (n) {
            if (n === 0) return { n: 0, etat: 'normal', libre: false, x: 13, y: 11, p: 0, dir: G, effraye: false };
            return { n: n, etat: 'maison', libre: true, fx: [0, 13, 11, 15][n], fy: 14, x: 13, y: 11, p: 0, dir: N, effraye: false,
                     attente: [0, 1, 4, 7][n] * Math.max(0.4, 1 - 0.15 * (niveau - 1)) };
        });
        peur = 0; combo = 0; cycle = 0; bulles = [];
        etat = 'pret'; chrono = 2;
    }

    function position(a) { return a.libre ? [a.fx, a.fy] : [a.x + a.dir[0] * a.p, a.y + a.dir[1] * a.p]; }

    function vitessePac() { return Math.min(10, 7.2 + 0.4 * (niveau - 1)); }
    function vitesseFantome(g) {
        if (g.etat === 'yeux') return 15;
        if (g.effraye && peur > 0) return 4.2;
        var v = Math.min(9.5, 6.6 + 0.45 * (niveau - 1));
        if (g.y === 14 && (g.x < 6 || g.x > 21)) v *= 0.55;          // ralentis dans le tunnel
        return v;
    }

    // avance de d cases ; à chaque centre de case, choisir() fixe la nouvelle direction
    function avancer(a, d, choisir) {
        for (var garde = 0; d > 0 && garde < 12; garde++) {
            if (!a.dir[0] && !a.dir[1]) { choisir(a); if (!a.dir[0] && !a.dir[1]) return; }
            var reste = 1 - a.p;
            if (d < reste) { a.p += d; return; }
            d -= reste;
            a.x = (a.x + a.dir[0] + L) % L; a.y += a.dir[1]; a.p = 0;
            choisir(a);
            if (etat !== 'jeu') return;
        }
    }

    function inverser(a) {
        if (a.p > 0) { a.x = (a.x + a.dir[0] + L) % L; a.y += a.dir[1]; a.p = 1 - a.p; }
        a.dir = [-a.dir[0], -a.dir[1]];
    }

    function choisirPac(a) {
        manger(a.x, a.y);
        var v = a.voulue;
        if (v && libre(a.x + v[0], a.y + v[1])) a.dir = v;
        else if (!libre(a.x + a.dir[0], a.y + a.dir[1])) a.dir = [0, 0];
    }

    function manger(x, y) {
        var c = grille[y][x];
        if (c !== '.' && c !== 'o') return;
        grille[y][x] = ' ';
        restants--; mangees++;
        if (c === '.') score += 10;
        else {
            score += 50; combo = 0;
            peur = Math.max(2, 7.5 - 0.75 * (niveau - 1));
            fantomes.forEach(function (g) {
                if (g.etat === 'yeux' || g.etat === 'rentree') return;
                g.effraye = true;
                if (!g.libre && (g.dir[0] || g.dir[1])) inverser(g);
            });
        }
        if (mangees === 70 || mangees === 170) bonus = { t: 9 };
        noterRecord();
        if (restants === 0) { etat = 'gagne'; chrono = 2.2; }
    }

    function enDispersion() { return cycle % 27 < 7; }

    function cible(g) {
        if (g.etat === 'yeux') return [13, 11];
        if (enDispersion()) return COINS[g.n];
        var px = pac.x, py = pac.y, d = pac.dir;
        if (g.n === 0) return [px, py];                                   // rouge : fonce sur Pac-Man
        if (g.n === 1) return [px + 4 * d[0], py + 4 * d[1]];             // rose : vise devant lui
        if (g.n === 2) {                                                  // bleu : en tenaille avec le rouge
            var b = fantomes[0];
            return [2 * (px + 2 * d[0]) - b.x, 2 * (py + 2 * d[1]) - b.y];
        }
        var dx = g.x - px, dy = g.y - py;                                 // orange : approche puis s'enfuit
        return dx * dx + dy * dy > 64 ? [px, py] : COINS[3];
    }

    function choisirFantome(g) {
        if (g.etat === 'yeux' && g.x === 13 && g.y === 11) {
            g.etat = 'rentree'; g.libre = true; g.fx = 13; g.fy = 11; g.dir = S;
            return;
        }
        var options = [N, G, S, D].filter(function (d) {
            return !oppose(g.dir, d) && libre(g.x + d[0], g.y + d[1]);
        });
        if (!options.length) { g.dir = [-g.dir[0], -g.dir[1]]; return; }
        if (g.effraye && peur > 0) { g.dir = options[Math.floor(Math.random() * options.length)]; return; }
        var c = cible(g);
        options.sort(function (a, b) {
            var ax = g.x + a[0] - c[0], ay = g.y + a[1] - c[1], bx = g.x + b[0] - c[0], by = g.y + b[1] - c[1];
            return (ax * ax + ay * ay) - (bx * bx + by * by);
        });
        g.dir = options[0];
    }

    function approcher(a, b, v) { return Math.abs(b - a) <= v ? b : a + Math.sign(b - a) * v; }

    // dans la maison : attendre en flottant, sortir par la porte, ou y rentrer après avoir été mangé
    function bougerLibre(g, dt) {
        if (g.etat === 'maison') {
            g.attente -= dt;
            g.fy = 14 + Math.sin(temps * 6 + g.n) * 0.3;
            g.dir = Math.cos(temps * 6 + g.n) > 0 ? S : N;
            if (g.attente <= 0) g.etat = 'sortie';
            return;
        }
        var v = (g.etat === 'rentree' ? 8 : 3.5) * dt;
        if (g.etat === 'sortie') {
            if (g.fx !== 13) {
                g.fy = approcher(g.fy, 14, v);
                if (g.fy === 14) { g.dir = g.fx < 13 ? D : G; g.fx = approcher(g.fx, 13, v); }
                return;
            }
            g.dir = N;
            g.fy = approcher(g.fy, 11, v);
            if (g.fy === 11) {
                g.libre = false; g.x = 13; g.y = 11; g.p = 0; g.etat = 'normal';
                g.dir = Math.random() < 0.5 ? G : D;
            }
            return;
        }
        g.dir = S;
        g.fy = approcher(g.fy, 14, v);
        if (g.fy === 14) { g.etat = 'sortie'; g.effraye = false; }
    }

    function proche(a, b) {
        var dx = Math.abs(a[0] - b[0]);
        dx = Math.min(dx, L - dx);
        return dx < 0.65 && Math.abs(a[1] - b[1]) < 0.65;
    }

    function collisions() {
        var pp = position(pac);
        if (bonus && proche(pp, [13, 17])) {
            var prime = 500 * Math.min(niveau, 4);
            score += prime; noterRecord();
            bulles.push({ x: 13, y: 17, txt: prime, t: 1.2 });
            bonus = null;
        }
        fantomes.forEach(function (g) {
            if (etat !== 'jeu' || g.etat === 'yeux' || g.etat === 'rentree' || g.etat === 'maison') return;
            var gp = position(g);
            if (!proche(pp, gp)) return;
            if (g.effraye && peur > 0) {
                var gain = 200 * Math.pow(2, combo++);
                score += gain; noterRecord();
                bulles.push({ x: gp[0], y: gp[1], txt: gain, t: 1 });
                g.effraye = false;
                g.etat = g.libre ? 'rentree' : 'yeux';
            } else { etat = 'mort'; chrono = 1.8; }
        });
    }

    function mettreAJour(dt) {
        temps += dt;
        bulles = bulles.filter(function (b) { return (b.t -= dt) > 0; });
        if (etat === 'pause' || etat === 'fin') return;
        if (etat !== 'jeu') {
            chrono -= dt;
            if (chrono > 0) return;
            if (etat === 'pret') etat = 'jeu';
            else if (etat === 'gagne') { niveau++; nouveauNiveau(); }
            else if (--vies <= 0) etat = 'fin';
            else placer();
            return;
        }
        if (peur > 0) {
            peur -= dt;
            if (peur <= 0) { peur = 0; fantomes.forEach(function (g) { g.effraye = false; }); }
        } else cycle += dt;
        if (bonus && (bonus.t -= dt) <= 0) bonus = null;

        if (oppose(pac.dir, pac.voulue)) inverser(pac);
        avancer(pac, vitessePac() * dt, choisirPac);
        if (pac.dir[0] || pac.dir[1]) pac.angle = Math.atan2(pac.dir[1], pac.dir[0]);
        if (etat !== 'jeu') return;
        fantomes.forEach(function (g) {
            if (g.libre) bougerLibre(g, dt);
            else avancer(g, vitesseFantome(g) * dt, choisirFantome);
        });
        collisions();
    }

    /* ---------- Dessin ---------- */
    function mur(x, y) { return y < 0 || y >= H || x < 0 || x >= L || PLAN[y][x] === '#'; }

    function dessinerMurs() {
        murs = document.createElement('canvas');
        murs.width = L * T * dpr; murs.height = H * T * dpr;
        var m = murs.getContext('2d');
        m.scale(dpr, dpr);
        m.fillStyle = '#1b0a30';
        for (var y = 0; y < H; y++) for (var x = 0; x < L; x++) if (PLAN[y][x] === '#') m.fillRect(x * T, y * T, T, T);
        m.strokeStyle = '#a66bff';
        m.lineWidth = Math.max(1.5, T / 8);
        m.lineCap = 'round';
        m.shadowColor = '#a66bff';
        m.shadowBlur = T / 3;
        m.beginPath();
        for (y = 0; y < H; y++) for (x = 0; x < L; x++) {
            if (PLAN[y][x] !== '#') continue;
            if (!mur(x, y - 1)) { m.moveTo(x * T, y * T); m.lineTo((x + 1) * T, y * T); }
            if (!mur(x, y + 1)) { m.moveTo(x * T, (y + 1) * T); m.lineTo((x + 1) * T, (y + 1) * T); }
            if (!mur(x - 1, y)) { m.moveTo(x * T, y * T); m.lineTo(x * T, (y + 1) * T); }
            if (!mur(x + 1, y)) { m.moveTo((x + 1) * T, y * T); m.lineTo((x + 1) * T, (y + 1) * T); }
        }
        m.stroke();
        m.strokeStyle = m.shadowColor = '#ffb8ff';
        m.beginPath(); m.moveTo(13 * T, 12.5 * T); m.lineTo(15 * T, 12.5 * T); m.stroke();
    }

    function citrouille(cx, cy, r, visage) {
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(cx - r * 0.12, cy - r * 1.25, r * 0.24, r * 0.45);
        ctx.fillStyle = '#ff7518';
        ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.12, r, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#c24e00'; ctx.lineWidth = Math.max(1, r / 6);
        ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.4, r * 0.98, 0, 0, Math.PI * 2); ctx.stroke();
        if (!visage) return;
        ctx.fillStyle = '#ffe08a';
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.6, cy - r * 0.1); ctx.lineTo(cx - r * 0.38, cy - r * 0.5); ctx.lineTo(cx - r * 0.16, cy - r * 0.1);
        ctx.moveTo(cx + r * 0.16, cy - r * 0.1); ctx.lineTo(cx + r * 0.38, cy - r * 0.5); ctx.lineTo(cx + r * 0.6, cy - r * 0.1);
        ctx.moveTo(cx - r * 0.65, cy + r * 0.2);
        ctx.lineTo(cx - r * 0.3, cy + r * 0.38); ctx.lineTo(cx - r * 0.15, cy + r * 0.22); ctx.lineTo(cx, cy + r * 0.4);
        ctx.lineTo(cx + r * 0.15, cy + r * 0.22); ctx.lineTo(cx + r * 0.3, cy + r * 0.38); ctx.lineTo(cx + r * 0.65, cy + r * 0.2);
        ctx.quadraticCurveTo(cx, cy + r * 0.85, cx - r * 0.65, cy + r * 0.2);
        ctx.fill();
    }

    function dessinerPac() {
        if (etat === 'mort' && chrono < 0.5) return;
        var p = position(pac), cx = (p[0] + 0.5) * T, cy = (p[1] + 0.5) * T, r = T * 0.8, angle = pac.angle, bouche;
        if (etat === 'mort') { angle = -Math.PI / 2; bouche = Math.min(Math.PI * 0.98, (1.8 - chrono) / 1.2 * Math.PI); }
        else if (etat === 'jeu' && (pac.dir[0] || pac.dir[1])) bouche = 0.28 * Math.PI * Math.abs(Math.sin(temps * 14));
        else bouche = 0.18 * Math.PI;
        ctx.fillStyle = '#ffd23a';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, angle + bouche, angle + Math.PI * 2 - bouche);
        ctx.closePath();
        ctx.fill();
    }

    function dessinerFantome(g) {
        var p = position(g), cx = (p[0] + 0.5) * T, cy = (p[1] + 0.5) * T, r = T * 0.8;
        var yeuxSeuls = g.etat === 'yeux' || g.etat === 'rentree', effraye = !yeuxSeuls && g.effraye && peur > 0;
        var clignote = effraye && peur < 2 && Math.floor(temps * 6) % 2;
        if (!yeuxSeuls) {
            ctx.fillStyle = effraye ? (clignote ? '#f3e9ff' : '#3446ff') : COULEURS[g.n];
            ctx.beginPath();
            ctx.arc(cx, cy - r * 0.1, r, Math.PI, 0);
            var bas = cy + r * 0.85, decale = Math.floor(temps * 8) % 2;
            for (var i = 0; i <= 6; i++) ctx.lineTo(cx + r - i * r / 3, bas - ((i + decale) % 2 ? r * 0.28 : 0));
            ctx.closePath();
            ctx.fill();
        }
        if (effraye) {
            ctx.fillStyle = ctx.strokeStyle = clignote ? '#ff3b3b' : '#ffd9b0';
            ctx.fillRect(cx - r * 0.42, cy - r * 0.35, r * 0.24, r * 0.24);
            ctx.fillRect(cx + r * 0.18, cy - r * 0.35, r * 0.24, r * 0.24);
            ctx.lineWidth = Math.max(1, r / 8);
            ctx.beginPath();
            for (var k = 0; k <= 6; k++) ctx.lineTo(cx - r * 0.6 + k * r * 0.2, cy + r * 0.3 + (k % 2 ? -r * 0.12 : 0));
            ctx.stroke();
            return;
        }
        var d = g.dir;
        [-1, 1].forEach(function (s) {
            var ex = cx + s * r * 0.38, ey = cy - r * 0.2;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.ellipse(ex + d[0] * r * 0.08, ey + d[1] * r * 0.08, r * 0.25, r * 0.32, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#1d2bff';
            ctx.beginPath(); ctx.arc(ex + d[0] * r * 0.18, ey + d[1] * r * 0.2, r * 0.13, 0, Math.PI * 2); ctx.fill();
        });
    }

    function message(titre, sousTitre, couleur) {
        var cx = L * T / 2, cy = 17.5 * T, l = 13 * T, h = (sousTitre ? 3.4 : 2.2) * T;
        ctx.fillStyle = 'rgba(10, 4, 18, 0.88)';
        ctx.fillRect(cx - l / 2, cy - 1.1 * T, l, h);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = couleur;
        ctx.font = Math.round(T * 1.5) + 'px "Mystery Quest", Lexend, cursive';
        ctx.fillText(titre, cx, cy);
        if (sousTitre) {
            ctx.fillStyle = '#d6c4ea';
            ctx.font = Math.round(T * 0.7) + 'px Lexend, system-ui, sans-serif';
            ctx.fillText(sousTitre, cx, cy + 1.45 * T);
        }
    }

    function dessiner() {
        var W = L * T;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = '#0a0412';
        ctx.fillRect(0, 0, W, (H + 4) * T);

        ctx.fillStyle = '#f3e9ff';
        ctx.font = '600 ' + Math.round(T * 0.85) + 'px Lexend, system-ui, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left'; ctx.fillText('Score ' + score, T * 0.5, T);
        ctx.textAlign = 'center'; ctx.fillText('Niveau ' + niveau, W / 2, T);
        ctx.textAlign = 'right'; ctx.fillText('Record ' + record, W - T * 0.5, T);

        ctx.save();
        ctx.translate(0, 2 * T);
        ctx.beginPath(); ctx.rect(0, 0, W, H * T); ctx.clip();
        if (etat !== 'gagne' || Math.floor(temps * 5) % 2) ctx.drawImage(murs, 0, 0, W, H * T);

        ctx.fillStyle = '#ffd9b0';
        for (var y = 0; y < H; y++) for (var x = 0; x < L; x++) {
            var c = grille[y][x];
            if (c === '.') { ctx.beginPath(); ctx.arc((x + 0.5) * T, (y + 0.5) * T, Math.max(1.5, T * 0.12), 0, Math.PI * 2); ctx.fill(); }
            else if (c === 'o' && (etat !== 'jeu' || Math.floor(temps * 4) % 2)) { citrouille((x + 0.5) * T, (y + 0.5) * T, T * 0.36, false); ctx.fillStyle = '#ffd9b0'; }
        }
        if (bonus) citrouille(13.5 * T, 17.5 * T, T * 0.7, true);

        if (etat !== 'gagne' && !(etat === 'mort' && chrono < 1.3)) fantomes.forEach(dessinerFantome);
        dessinerPac();

        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '600 ' + Math.round(T * 0.75) + 'px Lexend, system-ui, sans-serif';
        ctx.fillStyle = '#38e8ff';
        bulles.forEach(function (b) { ctx.fillText(b.txt, (b.x + 0.5) * T, (b.y + 0.5 - (1 - b.t) * 0.8) * T); });

        if (etat === 'pret') message('Prêt !', '', '#ffd23a');
        else if (etat === 'pause') message('Pause', 'Espace pour reprendre', '#ffd23a');
        else if (etat === 'gagne') message('Bravo !', 'Niveau suivant…', '#8ee34a');
        else if (etat === 'fin') message('Partie terminée', 'Espace ou toucher l\'écran pour rejouer', '#ff7518');
        ctx.restore();

        // vies restantes
        ctx.fillStyle = '#ffd23a';
        for (var i = 0; i < vies - (etat === 'jeu' || etat === 'pause' ? 1 : 0); i++) {
            var vx = (1.2 + i * 1.8) * T, vy = (H + 3) * T;
            ctx.beginPath(); ctx.moveTo(vx, vy); ctx.arc(vx, vy, T * 0.6, Math.PI + 0.6, Math.PI * 3 - 0.6); ctx.closePath(); ctx.fill();
        }
    }

    /* ---------- Fenêtre ---------- */
    function dimensionner() {
        T = Math.max(8, Math.min(22, Math.floor(Math.min((innerWidth - 60) / L, (innerHeight - 170) / (H + 4)))));
        dpr = window.devicePixelRatio || 1;
        canvas.width = L * T * dpr; canvas.height = (H + 4) * T * dpr;
        canvas.style.width = L * T + 'px'; canvas.style.height = (H + 4) * T + 'px';
        dessinerMurs();
    }

    function boucle(now) {
        var dt = Math.min(0.05, Math.max(0, now - dernier) / 1000);
        dernier = now;
        mettreAJour(dt);
        dessiner();
        anim = requestAnimationFrame(boucle);
    }

    function action() {
        if (etat === 'fin') nouvellePartie();
        else if (etat === 'jeu') etat = 'pause';
        else if (etat === 'pause') etat = 'jeu';
    }

    function diriger(d) { pac.voulue = d; if (etat === 'pause') etat = 'jeu'; }

    function clavier(e) {
        var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (k === 'Escape') fermer();
        else if (TOUCHES[k]) diriger(TOUCHES[k]);
        else if (k === ' ' || k === 'p' || k === 'Enter') action();
        else if (k !== 'Tab') return;
        e.preventDefault();
        e.stopImmediatePropagation();          // Échap ne coupe pas le mode Halloween, les flèches ne font pas défiler la page
    }

    var depart = null;
    function toucheDebut(e) { var t = e.changedTouches[0]; depart = [t.clientX, t.clientY]; }
    function toucheFin(e) {
        if (!depart || e.target.closest('.pacman-fermer')) { depart = null; return; }
        var t = e.changedTouches[0], dx = t.clientX - depart[0], dy = t.clientY - depart[1];
        depart = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) { if (etat === 'fin' || etat === 'pause') action(); return; }
        diriger(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? D : G) : (dy > 0 ? S : N));
    }
    function cache() { if (document.hidden && etat === 'jeu') etat = 'pause'; }

    function ajouterStyle() {
        if (document.getElementById('pacman-style')) return;
        var st = document.createElement('style');
        st.id = 'pacman-style';
        st.textContent = [
            '.pacman-fond{position:fixed;inset:0;z-index:4000;display:flex;align-items:center;justify-content:center;padding:16px;',
            'background:rgba(8,3,14,.88);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);touch-action:none}',
            '.pacman-boite{display:flex;flex-direction:column;align-items:center;gap:8px;max-width:100%;padding:12px 14px 10px;',
            'background:#12081d;border:2px solid #ff7518;border-radius:14px;box-shadow:0 0 40px rgba(255,117,24,.35)}',
            '.pacman-haut{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%}',
            '.pacman-titre{margin:0;font:28px/1 "Mystery Quest",Lexend,cursive;color:#ff9a1f}',
            '.pacman-fermer{font:600 14px Lexend,system-ui,sans-serif;color:#f3e9ff;background:#2a1640;border:1px solid #4a2a68;border-radius:999px;padding:4px 12px;cursor:pointer}',
            '.pacman-fermer:focus-visible{outline:2px solid #ff7518;outline-offset:2px}',
            '.pacman-boite canvas{display:block;border-radius:6px;outline:none}',
            '.pacman-aide{margin:0;max-width:44em;font:13px/1.4 Lexend,system-ui,sans-serif;color:#b49cc9;text-align:center}'
        ].join('');
        document.head.appendChild(st);
    }

    function ouvrir() {
        if (fond) return;
        ajouterStyle();
        retourFocus = document.activeElement;
        fond = document.createElement('div');
        fond.className = 'pacman-fond';
        fond.setAttribute('role', 'dialog');
        fond.setAttribute('aria-modal', 'true');
        fond.setAttribute('aria-label', 'Pac-Man');
        fond.innerHTML = '<div class="pacman-boite"><div class="pacman-haut"><p class="pacman-titre">Pac-Man</p>' +
            '<button type="button" class="pacman-fermer">Fermer ✕</button></div><canvas tabindex="0"></canvas>' +
            '<p class="pacman-aide">Flèches ou ZQSD pour diriger (sur téléphone : glisse le doigt). Espace : pause. Échap : fermer.<br>' +
            'Mange une citrouille et les fantômes deviennent bleus : à toi de les croquer !</p></div>';
        document.body.appendChild(fond);
        canvas = fond.querySelector('canvas');
        ctx = canvas.getContext('2d');
        fond.querySelector('.pacman-fermer').addEventListener('click', fermer);
        canvas.addEventListener('click', function () { if (etat === 'fin') nouvellePartie(); });
        fond.addEventListener('touchstart', toucheDebut, { passive: true });
        fond.addEventListener('touchend', toucheFin);
        window.addEventListener('resize', dimensionner);
        window.addEventListener('keydown', clavier, true);
        document.addEventListener('visibilitychange', cache);
        ancienOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        record = lireRecord();
        dimensionner();
        nouvellePartie();
        canvas.focus();
        dernier = performance.now();
        anim = requestAnimationFrame(boucle);
    }

    function fermer() {
        if (!fond) return;
        cancelAnimationFrame(anim);
        window.removeEventListener('resize', dimensionner);
        window.removeEventListener('keydown', clavier, true);
        document.removeEventListener('visibilitychange', cache);
        fond.remove();
        fond = null;
        document.body.style.overflow = ancienOverflow;
        if (retourFocus && retourFocus.focus) retourFocus.focus();
    }

    window.pacmanHalloween = { ouvrir: ouvrir, fermer: fermer, plan: PLAN };   // plan : aussi dessiné en fond par site.js
})();
