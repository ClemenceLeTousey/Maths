/* Traductions anglais / néerlandais des énoncés d'automatismes (Seconde, Séries 7 et suivantes).
   Traduction.traduire(texte, 'en' | 'nl') -> texte traduit (maths $...$ et <code> conservés),
   ou null si une partie de l'énoncé n'est pas couverte par les règles ci-dessous
   (dans ce cas le moteur n'affiche pas les boutons pour cette question).

   Pour une nouvelle série : ajouter ici les phrases des nouveaux générateurs.
   Dans les motifs : @ = une formule ou un morceau de code (gardé tel quel),
   COUL = une couleur de boule (voir COULEURS). Les règles s'appliquent dans l'ordre :
   les phrases les plus précises d'abord, les plus générales (« Calculer @ ») à la fin. */
(function () {
    'use strict';

    var COULEURS = {
        rouge: ['red', 'rode'], verte: ['green', 'groene'], bleue: ['blue', 'blauwe'],
        jaune: ['yellow', 'gele'], noire: ['black', 'zwarte']
    };
    function coul(c, k) { return COULEURS[c.replace(/s$/, '')][k]; }

    // [français, anglais, néerlandais] ; une traduction peut être une fonction (groupes capturés) -> texte
    var R = [
        /* ----- Probabilités (urne) ----- */
        ['Une urne contient # , indiscernables au toucher.',
            function (l) { return 'An urn contains ' + boules(l, 0) + ', which cannot be told apart by touch.'; },
            function (l) { return 'Een vaas bevat ' + boules(l, 1) + ', die je op de tast niet van elkaar kunt onderscheiden.'; }],
        ['On tire une boule au hasard.', 'A ball is drawn at random.', 'Je trekt willekeurig één knikker.'],
        ['La probabilité de tirer une boule COUL est :',
            function (c) { return 'The probability of drawing a ' + coul(c, 0) + ' ball is:'; },
            function (c) { return 'De kans om een ' + coul(c, 1) + ' knikker te trekken is:'; }],
        ['Quelle est la probabilité de <b>ne pas</b> tirer une boule COUL ?',
            function (c) { return 'What is the probability of <b>not</b> drawing a ' + coul(c, 0) + ' ball?'; },
            function (c) { return 'Wat is de kans om <b>geen</b> ' + coul(c, 1) + ' knikker te trekken?'; }],
        ['Combien de boules COUL faut-il ajouter pour que la probabilité de tirer une boule COUL soit égale à @ ?',
            function (c, c2, m) { return 'How many ' + coul(c, 0) + ' balls must be added so that the probability of drawing a ' + coul(c2, 0) + ' ball is equal to ' + m + '?'; },
            function (c, c2, m) { return 'Hoeveel ' + coul(c, 1) + ' knikkers moet je toevoegen zodat de kans om een ' + coul(c2, 1) + ' knikker te trekken gelijk is aan ' + m + '?'; }],
        [' (fraction, par exemple @)', ' (fraction, for example $1)', ' (breuk, bijvoorbeeld $1)'],

        /* ----- Proportions, pourcentages ----- */
        ['@ des élèves d\'un lycée sont demi-pensionnaires. Parmi eux, @ prennent le bus. Quelle proportion des élèves du lycée cela représente-t-il ?',
            '$1 of the students at a high school have lunch in the school canteen. Of these, $2 take the bus. What proportion of all the students at the school is this?',
            '$1 van de leerlingen van een school eten \'s middags in de schoolkantine. Van hen neemt $2 de bus. Welk deel van alle leerlingen van de school is dat?'],
        ['@ des spectateurs d\'un concert sont des enfants. Parmi eux, @ ont moins de @ ans. Quelle proportion des spectateurs cela représente-t-il ?',
            '$1 of the spectators at a concert are children. Of these, $2 are under $3 years old. What proportion of the spectators is this?',
            '$1 van de toeschouwers van een concert zijn kinderen. Van hen is $2 jonger dan $3 jaar. Welk deel van de toeschouwers is dat?'],
        ['@ des adhérents d\'un club sont des filles. Parmi elles, @ font de la compétition. Quelle proportion des adhérents du club cela représente-t-il ?',
            '$1 of the members of a club are girls. Of these, $2 take part in competitions. What proportion of the club members is this?',
            '$1 van de leden van een club zijn meisjes. Van hen doet $2 mee aan wedstrijden. Welk deel van de leden van de club is dat?'],
        ['@ des salariés d\'une entreprise travaillent à temps partiel. Parmi eux, @ sont des femmes. Quelle proportion des salariés de l\'entreprise cela représente-t-il ?',
            '$1 of the employees of a company work part-time. Of these, $2 are women. What proportion of the company\'s employees is this?',
            '$1 van de werknemers van een bedrijf werken parttime. Van hen is $2 een vrouw. Welk deel van de werknemers van het bedrijf is dat?'],
        ['Un club compte @ adhérents. Les @ des adhérents sont des filles et, parmi elles, @ font de la compétition. Combien de filles font de la compétition ?',
            'A club has $1 members. $2 of the members are girls and, of these, $3 take part in competitions. How many girls take part in competitions?',
            'Een club telt $1 leden. $2 van de leden zijn meisjes en van hen doet $3 mee aan wedstrijden. Hoeveel meisjes doen mee aan wedstrijden?'],
        ['Dans un club, @ des adhérents sont des filles. @ des filles et @ des garçons font de la compétition. Quel pourcentage des adhérents font de la compétition ?',
            'In a club, $1 of the members are girls. $2 of the girls and $3 of the boys take part in competitions. What percentage of the members take part in competitions?',
            'In een club is $1 van de leden een meisje. $2 van de meisjes en $3 van de jongens doen mee aan wedstrijden. Hoeveel procent van de leden doet mee aan wedstrijden?'],
        ['Dans un groupe de @ élèves, @ sont externes. Quel est le pourcentage d\'externes ?',
            'In a group of $1 students, $2 go home for lunch. What percentage of the students go home for lunch?',
            'In een groep van $1 leerlingen gaan er $2 \'s middags thuis eten. Hoeveel procent van de leerlingen gaat \'s middags thuis eten?'],
        ['Dans un groupe de @ adhérents d\'un club, @ font de la compétition. Quel est le pourcentage de compétiteurs ?',
            'In a group of $1 club members, $2 take part in competitions. What percentage of the members take part in competitions?',
            'In een groep van $1 leden van een club doen er $2 mee aan wedstrijden. Hoeveel procent van de leden doet mee aan wedstrijden?'],
        ['Dans un groupe de @ enfants, @ sont des garçons. Quel est le pourcentage de garçons ?',
            'In a group of $1 children, $2 are boys. What percentage of the children are boys?',
            'In een groep van $1 kinderen zijn er $2 jongens. Hoeveel procent van de kinderen zijn jongens?'],
        ['Dans un groupe de @ spectateurs, @ sont abonnés. Quel est le pourcentage d\'abonnés ?',
            'In a group of $1 spectators, $2 have a season ticket. What percentage of the spectators have a season ticket?',
            'In een groep van $1 toeschouwers hebben er $2 een abonnement. Hoeveel procent van de toeschouwers heeft een abonnement?'],
        ['@ d\'un nombre valent @. Quel est ce nombre ?', '$1 of a number is equal to $2. What is this number?', '$1 van een getal is gelijk aan $2. Welk getal is dat?'],

        /* ----- Ordres de grandeur ----- */
        ['En remplaçant chaque nombre par une valeur « ronde », donner un ordre de grandeur de @ de @',
            'Replace each number with a “round” value and give an estimate of $1 of $2',
            'Vervang elk getal door een „rond” getal en geef een schatting van $1 van $2'],
        ['Donner un ordre de grandeur de @ de @', 'Give an estimate of $1 of $2', 'Geef een schatting van $1 van $2'],
        ['Donner un ordre de grandeur de @', 'Give an estimate of $1', 'Geef een schatting van $1'],

        /* ----- Racines carrées ----- */
        ['Sans calculatrice, encadrer @ entre deux entiers consécutifs',
            'Without a calculator, find two consecutive whole numbers between which $1 lies',
            'Zoek zonder rekenmachine twee opeenvolgende gehele getallen waartussen $1 ligt'],
        ['Encadrer @ entre deux décimaux consécutifs au dixième',
            'Find two consecutive decimals with one decimal place between which $1 lies',
            'Zoek twee opeenvolgende decimale getallen met één cijfer na de komma waartussen $1 ligt'],
        ['Encadrer @ entre deux entiers consécutifs',
            'Find two consecutive whole numbers between which $1 lies',
            'Zoek twee opeenvolgende gehele getallen waartussen $1 ligt'],

        /* ----- Repère, coordonnées, milieu ----- */
        ['Quelles sont les coordonnées du point @ ?', 'What are the coordinates of point $1?', 'Wat zijn de coördinaten van punt $1?'],
        ['Chaque unité est partagée en deux carreaux.', 'Each unit is divided into two squares.', 'Elke eenheid is verdeeld in twee hokjes.'],
        ['Lire les coordonnées du point @', 'Read the coordinates of point $1', 'Lees de coördinaten van punt $1 af'],
        ['Donner les coordonnées du point @, symétrique de @ par rapport à l\'axe des abscisses',
            'Give the coordinates of point $1, the reflection of $2 in the x-axis (axis of abscissas)',
            'Geef de coördinaten van punt $1, het spiegelbeeld van $2 ten opzichte van de x-as'],
        ['Donner les coordonnées du point @, symétrique de @ par rapport à l\'axe des ordonnées',
            'Give the coordinates of point $1, the reflection of $2 in the y-axis (axis of ordinates)',
            'Geef de coördinaten van punt $1, het spiegelbeeld van $2 ten opzichte van de y-as'],
        ['Donner les coordonnées du point @, symétrique de @ par rapport à l\'origine @',
            'Give the coordinates of point $1, symmetric to $2 with respect to the origin $3',
            'Geef de coördinaten van punt $1, het spiegelbeeld van $2 ten opzichte van de oorsprong $3'],
        ['Le point @ a la même abscisse que @ et la même ordonnée que @. Donner ses coordonnées.',
            'Point $1 has the same x-coordinate as $2 and the same y-coordinate as $3. Give its coordinates.',
            'Punt $1 heeft dezelfde x-coördinaat als $2 en dezelfde y-coördinaat als $3. Geef de coördinaten van dit punt.'],
        ['Donner les coordonnées du point @ tel que @ soit un rectangle', 'Give the coordinates of point $1 such that $2 is a rectangle', 'Geef de coördinaten van punt $1 zodat $2 een rechthoek is'],
        ['Dans un repère, @ et @.', 'In a coordinate system, $1 and $2.', 'In een assenstelsel zijn $1 en $2 gegeven.'],
        ['Le milieu @ de @ a pour coordonnées :', 'The midpoint $1 of $2 has coordinates:', 'Het midden $1 van $2 heeft als coördinaten:'],
        ['Donner les coordonnées du milieu @ de @', 'Give the coordinates of the midpoint $1 of $2', 'Geef de coördinaten van het midden $1 van $2'],
        ['Le point @ est le milieu de @.', 'Point $1 is the midpoint of $2.', 'Punt $1 is het midden van $2.'],
        ['Donner les coordonnées de @', 'Give the coordinates of $1', 'Geef de coördinaten van $1'],
        [' (écriture décimale)', ' (as a decimal)', ' (als decimaal getal)'],

        /* ----- Fonctions ----- */
        ['On considère la fonction @ définie par @.', 'Consider the function $1 defined by $2.', 'Gegeven is de functie $1 met $2.'],
        ['Soit @ la fonction définie par @.', 'Let $1 be the function defined by $2.', 'Gegeven is de functie $1 met $2.'],
        ['L\'image de @ par @ est :', 'The image of $1 under $2 is:', 'De functiewaarde van $2 bij $1 is:'],
        ['Déterminer l\'antécédent de @ par @', 'Find the preimage of $1 under $2', 'Bepaal de waarde van $x$ waarvoor de functiewaarde van $2 gelijk is aan $1'],
        ['Déterminer les antécédents de @ par @', 'Find the preimages of $1 under $2', 'Bepaal de waarden van $x$ waarvoor de functiewaarde van $2 gelijk is aan $1'],
        [' (valeur exacte : une fraction s\'écrit par exemple @)', ' (exact value: a fraction is written, for example, as $1)', ' (exacte waarde: een breuk schrijf je bijvoorbeeld als $1)'],
        [' (valeur exacte)', ' (exact value)', ' (exacte waarde)'],

        /* ----- Équations, inéquations ----- */
        ['Les solutions de l\'équation @ sont :', 'The solutions of the equation $1 are:', 'De oplossingen van de vergelijking $1 zijn:'],
        ['Les solutions de l\'inéquation @ sont les nombres @ tels que :', 'The solutions of the inequality $1 are the numbers $2 such that:', 'De oplossingen van de ongelijkheid $1 zijn de getallen $2 waarvoor geldt:'],
        ['Quel est le plus petit nombre <b>entier</b> solution de l\'inéquation @ ?', 'What is the smallest <b>whole</b> number that is a solution of the inequality $1?', 'Wat is het kleinste <b>gehele</b> getal dat een oplossing is van de ongelijkheid $1?'],
        ['Quel est le plus grand nombre <b>entier</b> solution de l\'inéquation @ ?', 'What is the largest <b>whole</b> number that is a solution of the inequality $1?', 'Wat is het grootste <b>gehele</b> getal dat een oplossing is van de ongelijkheid $1?'],
        ['Résoudre l\'inéquation @ en complétant.', 'Solve the inequality $1 by filling in the blank.', 'Los de ongelijkheid $1 op door aan te vullen.'],
        ['Résoudre l\'équation @', 'Solve the equation $1', 'Los de vergelijking $1 op'],
        ['Résoudre @', 'Solve $1', 'Los $1 op'],
        [' (solution exacte, sous forme de fraction si besoin)', ' (exact solution, as a fraction if needed)', ' (exacte oplossing, zo nodig als breuk)'],
        [' (solutions du plus petit au plus grand ; une fraction s\'écrit par exemple @)', ' (solutions from smallest to largest; a fraction is written, for example, as $1)', ' (oplossingen van klein naar groot; een breuk schrijf je bijvoorbeeld als $1)'],
        [' (solutions du plus petit au plus grand)', ' (solutions from smallest to largest)', ' (oplossingen van klein naar groot)'],
        [' (du plus petit au plus grand)', ' (from smallest to largest)', ' (van klein naar groot)'],

        /* ----- Isoler une variable ----- */
        ['On sait que @', 'We know that $1', 'We weten dat $1'],
        [' (volume d\'un cône)', ' (volume of a cone)', ' (inhoud van een kegel)'],
        [' (loi d\'Ohm)', ' (Ohm\'s law)', ' (wet van Ohm)'],
        [' (@ : proportion, @ : effectif de la partie, @ : effectif total)', ' ($1: proportion, $2: size of the part, $3: total size)', ' ($1: aandeel, $2: aantal in het deel, $3: totaal aantal)'],
        [' (aire @ d\'un triangle de base @ et de hauteur @)', ' (area $1 of a triangle with base $2 and height $3)', ' (oppervlakte $1 van een driehoek met basis $2 en hoogte $3)'],
        ['. Alors :', '. Then:', '. Dan geldt:'],
        ['Exprimer @ en fonction des autres lettres', 'Express $1 in terms of the other letters', 'Druk $1 uit in de andere letters'],
        ['On donne la relation @.', 'We are given the relation $1.', 'Gegeven is het verband $1.'],
        ['Les nombres @, @ et @ vérifient @.', 'The numbers $1, $2 and $3 satisfy $4.', 'De getallen $1, $2 en $3 voldoen aan $4.'],
        ['Les nombres @, @, @ et @ (avec @) vérifient @.', 'The numbers $1, $2, $3 and $4 (with $5) satisfy $6.', 'De getallen $1, $2, $3 en $4 (met $5) voldoen aan $6.'],
        ['Exprimer @ en fonction de @, @ et @', 'Express $1 in terms of $2, $3 and $4', 'Druk $1 uit in $2, $3 en $4'],
        ['Exprimer @ en fonction de @ et @', 'Express $1 in terms of $2 and $3', 'Druk $1 uit in $2 en $3'],
        ['Exprimer @ en fonction de @', 'Express $1 in terms of $2', 'Druk $1 uit in $2'],

        /* ----- Calcul littéral ----- */
        ['Le développement de @ est :', 'The expansion of $1 is:', 'De uitgewerkte vorm van $1 is:'],
        ['Développer et réduire :', 'Expand and simplify:', 'Werk uit en vereenvoudig:'],
        ['Factoriser @', 'Factorise $1', 'Ontbind $1 in factoren'],
        ['Calculer <b>de tête</b> @ à l\'aide d\'une identité remarquable', 'Calculate $1 <b>in your head</b> using a special product (identity)', 'Bereken $1 <b>uit het hoofd</b> met een bijzonder product'],

        /* ----- Nombres : puissances, écritures, rangement, arithmétique ----- */
        ['Écrire sous la forme @ : @', 'Write in the form $1: $2', 'Schrijf in de vorm $1: $2'],
        ['Écrire sous forme décimale : @', 'Write as a decimal: $1', 'Schrijf als decimaal getal: $1'],
        ['Ranger dans l\'ordre croissant (écris les lettres, du plus petit au plus grand) :',
            'Put in ascending order (write the letters, from smallest to largest):',
            'Rangschik van klein naar groot (schrijf de letters, van het kleinste naar het grootste getal):'],
        ['Parmi les nombres suivants, lequel est un nombre premier ?', 'Which of the following numbers is a prime number?', 'Welk van de volgende getallen is een priemgetal?'],
        ['Décomposer @ en produit de facteurs premiers sous la forme @', 'Write $1 as a product of prime factors in the form $2', 'Ontbind $1 in priemfactoren in de vorm $2'],
        ['Quel est le plus petit entier @ tel que @ soit le carré d\'un nombre entier ?', 'What is the smallest whole number $1 such that $2 is the square of a whole number?', 'Wat is het kleinste gehele getal $1 zodat $2 het kwadraat van een geheel getal is?'],
        ['Le nombre @ n\'est pas premier. Donner son plus petit diviseur autre que @', 'The number $1 is not prime. Give its smallest divisor other than $2', 'Het getal $1 is geen priemgetal. Geef de kleinste deler ervan, verschillend van $2'],

        /* ----- Vecteurs, Pythagore ----- */
        ['Simplifier @ en un seul vecteur. Écris ses deux lettres dans l\'ordre (par exemple @ pour @).',
            'Simplify $1 into a single vector. Write its two letters in order (for example $2 for $3).',
            'Vereenvoudig $1 tot één vector. Schrijf de twee letters in de juiste volgorde (bijvoorbeeld $2 voor $3).'],
        ['Les carreaux ont pour côté @.', 'The squares have side length $1.', 'De hokjes hebben zijde $1.'],
        ['Calculer la norme du vecteur @ et l\'écrire sous la forme @', 'Calculate the norm (length) of the vector $1 and write it in the form $2', 'Bereken de norm (lengte) van de vector $1 en schrijf die in de vorm $2'],
        ['Le triangle @ est rectangle en @, avec @ cm et @ cm.', 'Triangle $1 has a right angle at $2, with $3 cm and $4 cm.', 'Driehoek $1 is rechthoekig in $2, met $3 cm en $4 cm.'],
        ['La longueur @ est égale à :', 'The length $1 is equal to:', 'De lengte $1 is gelijk aan:'],
        ['Donner la valeur exacte de @ sous la forme @', 'Give the exact value of $1 in the form $2', 'Geef de exacte waarde van $1 in de vorm $2'],
        [' (@ le plus petit possible)', ' ($1 as small as possible)', ' ($1 zo klein mogelijk)'],
        [' (en cm)', ' (in cm)', ' (in cm)'],

        /* ----- Statistiques ----- */
        ['On considère la série : @. Sa médiane est :', 'Consider the data set: $1. Its median is:', 'Gegeven zijn de waarnemingsgetallen: $1. De mediaan is:'],
        ['Calculer la moyenne de la série : @', 'Calculate the mean of the data set: $1', 'Bereken het gemiddelde van de waarnemingsgetallen: $1'],
        ['Donner la médiane de la série : @', 'Give the median of the data set: $1', 'Geef de mediaan van de waarnemingsgetallen: $1'],
        ['Après @ contrôles, Léa a @ de moyenne. Quelle note doit-elle avoir au contrôle suivant pour avoir @ de moyenne sur les @ contrôles ?',
            'After $1 tests, Léa has an average of $2. What mark does she need on the next test to have an average of $3 over the $4 tests?',
            'Na $1 toetsen heeft Léa een gemiddelde van $2. Welk cijfer moet ze op de volgende toets halen om een gemiddelde van $3 te hebben over de $4 toetsen?'],

        /* ----- Python ----- */
        ['Qu\'affiche ce script ?', 'What does this script display?', 'Wat toont dit script?'],
        ['Qu\'affiche ce programme ?', 'What does this program display?', 'Wat toont dit programma?'],
        ['<span class="q-aide-code">@ signifie « si » et @ signifie « sinon ».</span>', '', '<span class="q-aide-code">$1 betekent „als” en $2 betekent „anders”.</span>'],
        ['Que renvoient @ et @ ?', 'What do $1 and $2 return?', 'Wat geven $1 en $2 terug?'],
        ['Que renvoie @ ?', 'What does $1 return?', 'Wat geeft $1 terug?'],
        ['Trouver <b>tous</b> les nombres @ pour lesquels @ renvoie @', 'Find <b>all</b> the numbers $1 for which $2 returns $3', 'Zoek <b>alle</b> getallen $1 waarvoor $2 de waarde $3 teruggeeft'],

        /* ----- Phrases générales (en dernier) ----- */
        ['@ est égal à :', '$1 is equal to:', '$1 is gelijk aan:'],
        ['Simplifier : @', 'Simplify: $1', 'Vereenvoudig: $1'],
        ['Calculer @ de @', 'Calculate $1 of $2', 'Bereken $1 van $2'],
        ['Calculer @', 'Calculate $1', 'Bereken $1'],
        ['Donner @', 'Give $1', 'Geef $1']
    ];

    // « $3$ boules rouges, $1$ boule verte et $5$ boules bleues » (déjà masqué) -> anglais / néerlandais
    function boules(liste, k) {
        return liste.replace(/(§\d+§) boule(s?) (\w+)/g, function (t, n, pl, c) {
            return k === 0 ? n + ' ' + coul(c, 0) + ' ball' + pl : n + ' ' + coul(c, 1) + ' knikker' + pl;
        }).replace(/ et /, k === 0 ? ' and ' : ' en ');
    }

    function echapper(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    var MATHS = '(§\\d+§)';
    var REGLES = R.map(function (r) {
        var motif = echapper(r[0]).replace(/@/g, MATHS).replace(/COUL/g, '(rouges?|vertes?|bleues?|jaunes?|noires?)').replace(/# /g, '(.+?)');
        return { re: new RegExp(motif, 'g'), en: r[1], nl: r[2] };
    });

    function traduire(texte, langue) {
        if (texte == null) return null;
        var gardes = [];
        function garder(m) { gardes.push(m); return '§' + (gardes.length - 1) + '§'; }
        var s = String(texte)
            .replace(/<pre[\s\S]*?<\/pre>/g, '')                       // le code est déjà affiché au-dessus
            .replace(/\$\$[\s\S]+?\$\$|\$[^$]+?\$/g, garder)
            .replace(/<code>[\s\S]*?<\/code>/g, garder)
            .replace(/<b>[A-Z]{1,2}<\/b>/g, garder);
        REGLES.forEach(function (r) {
            var cible = r[langue];
            s = s.replace(r.re, function () {
                var groupes = Array.prototype.slice.call(arguments, 1, -2);
                var t = typeof cible === 'function' ? cible.apply(null, groupes)
                    : cible.replace(/\$(\d)/g, function (x, k) { return groupes[k - 1]; });
                return '\u0001' + t + '\u0002';
            });
        });
        // reste-t-il du français non traduit ? (hors traductions, formules, balises, ponctuation)
        var reste = s.replace(/\u0001[^\u0002]*\u0002/g, '').replace(/§\d+§/g, '').replace(/<[^>]+>|&nbsp;/g, '').replace(/[\s.,;:!?()«»"'’]/g, '');
        if (reste) return null;
        return s.replace(/[\u0001\u0002]/g, '').replace(/§(\d+)§/g, function (x, k) { return gardes[+k]; }).replace(/^\s+|\s+$/g, '');
    }

    /* ===== Rappels (questions vertes), par générateur : Traduction.rappel(nom, langue, rappelFrançais) =====
       {SVG} est remplacé par la figure du rappel français (triangle magique). */
    var CONSOLE_4_6 = '<span class="q-console">4 6</span>';
    var CARRES = '$1$, $4$, $9$, $16$, $25$, $36$, $49$, $64$, $81$, $100$, $121$, $144$';
    var P = {
        en: {
            pourc: 'Taking $p\\,\\%$ of a number $N$ means multiplying $N$ by $\\dfrac{p}{100}$: $p\\,\\%$ of $N=\\dfrac{p\\times N}{100}$.<br>' +
                'Example: $30\\,\\%$ of $200$ $=\\dfrac{30\\times200}{100}=60$.',
            ordre: 'Replace each number with a nearby “round” value, then calculate in your head.<br>' +
                '$10\\,\\%$ of a number is that number divided by $10$; $50\\,\\%$ is half of it.<br>' +
                'Example: $49{,}7\\,\\%$ of $812$: $49{,}7\\,\\%\\approx50\\,\\%$ and $812\\approx800$, so about half of $800$, i.e. $400$.',
            racine: function (ex) {
                return 'To place $\\sqrt{a}$ between two whole numbers, look for the two perfect squares on either side of $a$.<br>Example: ' + ex +
                    '<br>Squares to know: ' + CARRES + '.';
            },
            ecritures: 'Write all the numbers as decimals, then compare.<br>' +
                '• Dividing by $10$, $100$, $1\\,000$: the decimal point moves $1$, $2$, $3$ places to the left: $\\dfrac{237}{100}=2{,}37$.<br>' +
                '• Fractions to know: $\\dfrac{1}{2}=0{,}5$ ; $\\dfrac{1}{4}=0{,}25$ ; $\\dfrac{3}{4}=0{,}75$ ; $\\dfrac{1}{5}=0{,}2$. For example $\\dfrac{9}{4}=2+\\dfrac{1}{4}=2{,}25$.<br>' +
                '• $\\times10^{-1}$ means dividing by $10$: $23\\times10^{-1}=2{,}3$.<br>Answer with the letters, from smallest to largest.',
            triangle: 'The <b>magic triangle</b> for $v=\\dfrac{d}{t}$: cover the letter you are looking for; what remains gives the formula.<br>{SVG}' +
                '• Cover $d$: $v$ is next to $t$, so $d=v\\times t$.<br>' +
                '• Cover $t$: $d$ is above $v$, so $t=\\dfrac{d}{v}$.<br>' +
                '• Cover $v$: $d$ is above $t$, so $v=\\dfrac{d}{t}$.<br>' +
                'Example: a car travels at $v=60$ km/h for $t=2$ h. We are looking for $d$: $d=v\\times t=60\\times2=120$ km.',
            image: function (f, calc) {
                return 'The image of $a$ under $f$ is $f(a)$: replace $x$ with $a$ in the expression, using brackets if $a$ is negative.<br>' +
                    'Example: if $f(x)=' + f + '$, then $' + calc + '$.';
            },
            coord: function (ex) {
                return 'The coordinates of a point are written $(x\\ ;\\ y)$: first the <b>x-coordinate</b> (abscissa), read on the horizontal axis, then the <b>y-coordinate</b> (ordinate), read on the vertical axis.<br>Example: ' + ex;
            },
            puiss: function (ex) { return 'Rules: $a^m\\times a^n=a^{m+n}$ and $\\dfrac{a^m}{a^n}=a^{m-n}$.<br>' + ex; },
            chasles: 'Chasles’ relation: $\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}$. Change the order of the terms to put the vectors head to tail.<br>' +
                'Example: $\\overrightarrow{BC}+\\overrightarrow{AB}=\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}$: the answer is <b>AC</b>.',
            identites: function (ex) {
                return 'The three special products: $(a+b)^2=a^2+2ab+b^2$ ; $(a-b)^2=a^2-2ab+b^2$ ; $(a+b)(a-b)=a^2-b^2$.<br>Example: ' + ex;
            },
            script: 'With <code>if</code> … <code>else</code>, the condition is tested with the current values: if it is true, only the block under <code>if</code> is executed; otherwise, only the block under <code>else</code>.<br>' +
                'Example: <code>a = 4</code>, <code>b = 10</code>, <code>if a &gt; b:</code> <code>a = a - b</code> <code>else:</code> <code>b = b - a</code>: $4>10$ is false, <code>b</code> becomes $6$, the console displays ' + CONSOLE_4_6 + '.',
            diviseur: function (ex) {
                return 'To find the smallest divisor of a number (other than $1$), try $2$, then $3$, then $5$, then $7$…<br>' +
                    'Divisible by $3$: the sum of the digits is a multiple of $3$. Example: ' + ex;
            },
            produit: function (eq, a, b, s1, s2) {
                return 'A product is zero if and only if at least one of its factors is zero.<br>' +
                    'Example: $' + eq + '$: $' + a + '=0$ or $' + b + '=0$, so $x=' + s1 + '$ or $x=' + s2 + '$.';
            },
            pythagore: function (a, b, calc) {
                return 'In a right-angled triangle, the square of the <b>hypotenuse</b> (the side opposite the right angle) equals the sum of the squares of the other two sides.<br>' +
                    'Example: sides of the right angle $' + a + '$ cm and $' + b + '$ cm: hypotenuse$^2=' + calc + '$ cm.';
            }
        },
        nl: {
            pourc: 'Om $p\\,\\%$ van een getal $N$ te nemen, vermenigvuldig je $N$ met $\\dfrac{p}{100}$: $p\\,\\%$ van $N=\\dfrac{p\\times N}{100}$.<br>' +
                'Voorbeeld: $30\\,\\%$ van $200$ $=\\dfrac{30\\times200}{100}=60$.',
            ordre: 'Vervang elk getal door een „rond” getal dat er dichtbij ligt en reken dan uit je hoofd.<br>' +
                '$10\\,\\%$ van een getal is dat getal gedeeld door $10$; $50\\,\\%$ is de helft.<br>' +
                'Voorbeeld: $49{,}7\\,\\%$ van $812$: $49{,}7\\,\\%\\approx50\\,\\%$ en $812\\approx800$, dus ongeveer de helft van $800$, namelijk $400$.',
            racine: function (ex) {
                return 'Om $\\sqrt{a}$ tussen twee gehele getallen te plaatsen, zoek je de twee kwadraten die $a$ insluiten.<br>Voorbeeld: ' + ex +
                    '<br>Kwadraten die je moet kennen: ' + CARRES + '.';
            },
            ecritures: 'Schrijf alle getallen als decimaal getal en vergelijk ze dan.<br>' +
                '• Delen door $10$, $100$, $1\\,000$: de komma schuift $1$, $2$, $3$ plaatsen naar links: $\\dfrac{237}{100}=2{,}37$.<br>' +
                '• Breuken die je moet kennen: $\\dfrac{1}{2}=0{,}5$ ; $\\dfrac{1}{4}=0{,}25$ ; $\\dfrac{3}{4}=0{,}75$ ; $\\dfrac{1}{5}=0{,}2$. Bijvoorbeeld $\\dfrac{9}{4}=2+\\dfrac{1}{4}=2{,}25$.<br>' +
                '• $\\times10^{-1}$ betekent delen door $10$: $23\\times10^{-1}=2{,}3$.<br>Antwoord met de letters, van het kleinste naar het grootste getal.',
            triangle: 'De <b>magische driehoek</b> van $v=\\dfrac{d}{t}$: bedek de letter die je zoekt; wat overblijft, geeft de formule.<br>{SVG}' +
                '• Bedek $d$: $v$ staat naast $t$, dus $d=v\\times t$.<br>' +
                '• Bedek $t$: $d$ staat boven $v$, dus $t=\\dfrac{d}{v}$.<br>' +
                '• Bedek $v$: $d$ staat boven $t$, dus $v=\\dfrac{d}{t}$.<br>' +
                'Voorbeeld: een auto rijdt $t=2$ uur met $v=60$ km/u. We zoeken $d$: $d=v\\times t=60\\times2=120$ km.',
            image: function (f, calc) {
                return 'De functiewaarde van $f$ bij $a$ is $f(a)$: vervang $x$ door $a$ in het functievoorschrift, met haakjes als $a$ negatief is.<br>' +
                    'Voorbeeld: als $f(x)=' + f + '$, dan is $' + calc + '$.';
            },
            coord: function (ex) {
                return 'De coördinaten van een punt schrijf je als $(x\\ ;\\ y)$: eerst de <b>x-coördinaat</b>, af te lezen op de horizontale as, dan de <b>y-coördinaat</b>, af te lezen op de verticale as.<br>Voorbeeld: ' + ex;
            },
            puiss: function (ex) { return 'Rekenregels: $a^m\\times a^n=a^{m+n}$ en $\\dfrac{a^m}{a^n}=a^{m-n}$.<br>' + ex; },
            chasles: 'Relatie van Chasles: $\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}$. Verander de volgorde van de termen om de vectoren kop aan staart te leggen.<br>' +
                'Voorbeeld: $\\overrightarrow{BC}+\\overrightarrow{AB}=\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}$: het antwoord is <b>AC</b>.',
            identites: function (ex) {
                return 'De drie bijzondere producten: $(a+b)^2=a^2+2ab+b^2$ ; $(a-b)^2=a^2-2ab+b^2$ ; $(a+b)(a-b)=a^2-b^2$.<br>Voorbeeld: ' + ex;
            },
            script: 'Bij <code>if</code> … <code>else</code> wordt de voorwaarde getest met de huidige waarden: als die waar is, wordt alleen het blok onder <code>if</code> uitgevoerd; anders alleen het blok onder <code>else</code>.<br>' +
                'Voorbeeld: <code>a = 4</code>, <code>b = 10</code>, <code>if a &gt; b:</code> <code>a = a - b</code> <code>else:</code> <code>b = b - a</code>: $4>10$ is niet waar, <code>b</code> wordt $6$, de console toont ' + CONSOLE_4_6 + '.',
            diviseur: function (ex) {
                return 'Om de kleinste deler van een getal (behalve $1$) te vinden, probeer je $2$, dan $3$, dan $5$, dan $7$…<br>' +
                    'Deelbaar door $3$: de som van de cijfers is een veelvoud van $3$. Voorbeeld: ' + ex;
            },
            produit: function (eq, a, b, s1, s2) {
                return 'Een product is nul als en slechts als minstens één van de factoren nul is.<br>' +
                    'Voorbeeld: $' + eq + '$: $' + a + '=0$ of $' + b + '=0$, dus $x=' + s1 + '$ of $x=' + s2 + '$.';
            },
            pythagore: function (a, b, calc) {
                return 'In een rechthoekige driehoek is het kwadraat van de <b>schuine zijde</b> (de zijde tegenover de rechte hoek) gelijk aan de som van de kwadraten van de twee andere zijden.<br>' +
                    'Voorbeeld: rechthoekszijden $' + a + '$ cm en $' + b + '$ cm: schuine zijde$^2=' + calc + '$ cm.';
            }
        }
    };
    var E = P.en, N = P.nl;
    var RAPPELS = {
        en: {
            calculPourcentage: E.pourc + '<br>Tips: $10\\,\\%$ means dividing by $10$; $25\\,\\%$ is a quarter; $50\\,\\%$ is half; $75\\,\\%$ is three quarters.<br>' +
                'Example: $30\\,\\%$ of $140$: $10\\,\\%$ is $14$, so $30\\,\\%$ is $3\\times14=42$.',
            pourcentageFinal: E.pourc + '<br>In your head: $10\\,\\%$ means dividing by $10$; $5\\,\\%$ is half of $10\\,\\%$.<br>' +
                'Example: $35\\,\\%$ of $120$: $10\\,\\%$ is $12$, $5\\,\\%$ is $6$, so $35\\,\\%$ is $3\\times12+6=42$.',
            encadrerRacineFinal: E.racine('$121<130<144$, i.e. $11^2<130<12^2$, so $11<\\sqrt{130}<12$.'),
            equationDeuxMembres: 'Put the $x$ terms on one side and the numbers on the other, then divide.<br>' +
                'Example: $5x+3=2x-9$; subtract $2x$ from both sides: $3x+3=-9$; subtract $3$: $3x=-12$; divide by $3$: $x=-4$.',
            imageFonction: E.image('3x-5', 'f(-2)=3\\times(-2)-5=-6-5=-11'),
            imageSimple: E.image('-2x+5', 'f(-3)=-2\\times(-3)+5=6+5=11'),
            imageFinal: E.image('-4x+1', 'f(-2)=-4\\times(-2)+1=8+1=9'),
            lireCoordonnees: E.coord('a point $2$ squares to the left of the origin and $1$ square up has coordinates $(-2\\ ;\\ 1)$.'),
            lireCoordonneesSimple: E.coord('a point $3$ squares to the right of the origin and $2$ squares down has coordinates $(3\\ ;\\ -2)$.'),
            repereFinal: E.coord('$2$ squares to the left of the origin and $3$ up: $(-2\\ ;\\ 3)$.'),
            ordreGrandeurNombre: E.ordre,
            ordreGrandeurFinal: E.ordre + '<br>$25\\,\\%$ is a quarter; $75\\,\\%$ is three quarters.',
            puissances: E.puiss('Watch out for negative exponents: $\\dfrac{5^3}{5^{-2}}=5^{3-(-2)}=5^5$ and $5^3\\times5^{-2}=5^{3+(-2)}=5^1$.'),
            puissancesSimple: E.puiss('Examples: $3^{-2}\\times3^{5}=3^{-2+5}=3^3$ and $\\dfrac{3^{2}}{3^{-4}}=3^{2-(-4)}=3^6$.'),
            puissancesFinal: E.puiss('Examples: $7^{-5}\\times7^{3}=7^{-5+3}=7^{-2}$ and $\\dfrac{7^{-1}}{7^{4}}=7^{-1-4}=7^{-5}$.'),
            rangerEcritures: E.ecritures,
            rangerFinal: E.ecritures,
            sommeDecimale: 'Two methods, your choice:<br>' +
                '• <b>Everything as decimals</b>: write each fraction as a decimal, then add, lining up the decimal points.<br>' +
                'Example: $\\dfrac{3}{10}+\\dfrac{45}{100}+\\dfrac{7}{1\\,000}=0{,}3+0{,}45+0{,}007=0{,}757$.<br>' +
                '• <b>Everything in thousandths</b>: write each fraction with denominator $1\\,000$, add the numerators, then write the result as a decimal.<br>' +
                'Example: $\\dfrac{3}{10}+\\dfrac{45}{100}+\\dfrac{7}{1\\,000}=\\dfrac{300}{1\\,000}+\\dfrac{450}{1\\,000}+\\dfrac{7}{1\\,000}=\\dfrac{757}{1\\,000}=0{,}757$.',
            chasles: 'Chasles’ relation: $\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}$ (the end point of the first vector is the starting point of the second).<br>' +
                'You may change the order of the terms to put them head to tail: $\\overrightarrow{BC}+\\overrightarrow{AB}=\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}$.',
            chaslesSimple: E.chasles,
            chaslesFinal: E.chasles,
            identitesRemarquables: E.identites('$(x+5)^2=x^2+2\\times x\\times5+5^2=x^2+10x+25$. Don’t forget the middle term $2ab$.'),
            identitesSimple: E.identites('$(x-4)^2=x^2-2\\times x\\times4+4^2=x^2-8x+16$.'),
            identitesFinal: E.identites('$(x+3)^2=x^2+2\\times x\\times3+3^2=x^2+6x+9$.'),
            scriptSiSinon: 'With <code>if</code> … <code>else</code>, the condition is tested with the <b>current</b> values of the variables: if it is true, only the block under <code>if</code> is executed; otherwise, only the block under <code>else</code>.<br>' +
                'Example: <code>a = 4</code>, <code>b = 10</code>, <code>if a &gt; b:</code> <code>a = a - b</code> <code>else:</code> <code>b = b - a</code>. Since $4>10$ is false, only <code>b</code> changes: it becomes $6$. <code>print(a, b)</code> displays ' + CONSOLE_4_6 + '.',
            scriptSiSinonSimple: E.script,
            scriptFinal: E.script,
            arithmetique: 'A <b>prime</b> number has exactly two divisors: $1$ and itself ($2$, $3$, $5$, $7$, $11$, $13$, $17$, $19$, $23$…).<br>' +
                'To check, see whether it is divisible by $2$, $3$, $5$, $7$, $11$… Tip for $3$: the sum of the digits is a multiple of $3$.<br>' +
                'Example: $57$: $5+7=12$, so $57=3\\times19$ is not prime.',
            arithmetiqueSimple: E.diviseur('$87$: $8+7=15$, so $87=3\\times29$; the smallest divisor is $3$.'),
            arithmetiqueFinal: E.diviseur('$91$ is not divisible by $2$, $3$ or $5$, but $91=7\\times13$.'),
            isolerVariable: E.triangle, isolerSimple: E.triangle, isolerFinal: E.triangle,
            produitNul: E.produit('(x-2)(x+7)=0', 'x-2', 'x+7', '2', '-7'),
            produitNulSimple: E.produit('(x+3)(x-8)=0', 'x+3', 'x-8', '-3', '8'),
            produitNulFinal: E.produit('(x-5)(x+1)=0', 'x-5', 'x+1', '5', '-1'),
            moyenneMediane: 'The <b>median</b> splits the ordered data into two groups of the same size: <b>first put</b> the values in ascending order, then take the middle one.<br>' +
                'Example: $9\\ ;\\ 2\\ ;\\ 7\\ ;\\ 4\\ ;\\ 12$ in order gives $2\\ ;\\ 4\\ ;\\ 7\\ ;\\ 9\\ ;\\ 12$: the median is $7$ (and the mean is $\\dfrac{34}{5}=6{,}8$).',
            medianeSimple: 'The <b>median</b>: <b>first put</b> the values in ascending order, then take the middle one.<br>' +
                'Example: $9\\ ;\\ 2\\ ;\\ 7\\ ;\\ 4\\ ;\\ 12$ in order gives $2\\ ;\\ 4\\ ;\\ 7\\ ;\\ 9\\ ;\\ 12$: the median is $7$. With an even number of values, take the mean of the two middle values.',
            inequation: 'Solve an inequality like an equation, with one extra rule: when you multiply or divide by a <b>negative</b> number, <b>reverse</b> the inequality sign.<br>' +
                'Example: $2x+1<7$ ; $2x<6$ ; $x<3$ (dividing by $2>0$). But $-2x<6$ gives $x>-3$ (dividing by $-2<0$).',
            inequationSimple: 'Solve an inequality like an equation; when you divide by a <b>positive</b> number, the inequality sign stays the same.<br>' +
                'Example: $3x-4\\geqslant8$ ; $3x\\geqslant12$ ; $x\\geqslant4$.',
            pythagoreQCM: E.pythagore(3, 4, '9+16=25$, so hypotenuse $=\\sqrt{25}=5'),
            pythagoreSimple: E.pythagore(6, 8, '36+64=100$, so hypotenuse $=10'),
            probaUrne: 'When all outcomes are equally likely: $P=\\dfrac{\\text{number of favourable outcomes}}{\\text{total number of outcomes}}$.<br>' +
                'Example: $3$ red balls and $5$ green balls ($8$ balls): $P(\\text{red})=\\dfrac{3}{8}$ and $P(\\text{not red})=1-\\dfrac{3}{8}=\\dfrac{5}{8}$.',
            milieu: 'The midpoint $M$ of $[AB]$ has as coordinates the <b>mean</b> of the coordinates of $A$ and $B$: $M\\left(\\dfrac{x_A+x_B}{2}\\ ;\\ \\dfrac{y_A+y_B}{2}\\right)$.<br>' +
                'Example: $A(1\\ ;\\ 4)$ and $B(5\\ ;\\ -2)$: $M\\left(\\dfrac{1+5}{2}\\ ;\\ \\dfrac{4+(-2)}{2}\\right)=M(3\\ ;\\ 1)$.',
            proportionPourcent: 'For a proportion of a proportion, <b>multiply</b> the two proportions.<br>' +
                'Example: $50\\,\\%$ of the students are girls and, of these, $40\\,\\%$ do sport: $0{,}5\\times0{,}4=0{,}2$, i.e. $20\\,\\%$ of the students.'
        },
        nl: {
            calculPourcentage: N.pourc + '<br>Tips: $10\\,\\%$ is delen door $10$; $25\\,\\%$ is een kwart; $50\\,\\%$ de helft; $75\\,\\%$ driekwart.<br>' +
                'Voorbeeld: $30\\,\\%$ van $140$: $10\\,\\%$ is $14$, dus $30\\,\\%$ is $3\\times14=42$.',
            pourcentageFinal: N.pourc + '<br>Uit het hoofd: $10\\,\\%$ is delen door $10$; $5\\,\\%$ is de helft van $10\\,\\%$.<br>' +
                'Voorbeeld: $35\\,\\%$ van $120$: $10\\,\\%$ is $12$, $5\\,\\%$ is $6$, dus $35\\,\\%$ is $3\\times12+6=42$.',
            encadrerRacineFinal: N.racine('$121<130<144$, dus $11^2<130<12^2$, dus $11<\\sqrt{130}<12$.'),
            equationDeuxMembres: 'Zet de termen met $x$ aan de ene kant en de getallen aan de andere kant, en deel dan.<br>' +
                'Voorbeeld: $5x+3=2x-9$; trek aan beide kanten $2x$ af: $3x+3=-9$; trek $3$ af: $3x=-12$; deel door $3$: $x=-4$.',
            imageFonction: N.image('3x-5', 'f(-2)=3\\times(-2)-5=-6-5=-11'),
            imageSimple: N.image('-2x+5', 'f(-3)=-2\\times(-3)+5=6+5=11'),
            imageFinal: N.image('-4x+1', 'f(-2)=-4\\times(-2)+1=8+1=9'),
            lireCoordonnees: N.coord('een punt $2$ hokjes links van de oorsprong en $1$ hokje omhoog heeft coördinaten $(-2\\ ;\\ 1)$.'),
            lireCoordonneesSimple: N.coord('een punt $3$ hokjes rechts van de oorsprong en $2$ hokjes omlaag heeft coördinaten $(3\\ ;\\ -2)$.'),
            repereFinal: N.coord('$2$ hokjes links van de oorsprong en $3$ omhoog: $(-2\\ ;\\ 3)$.'),
            ordreGrandeurNombre: N.ordre,
            ordreGrandeurFinal: N.ordre + '<br>$25\\,\\%$ is een kwart; $75\\,\\%$ is driekwart.',
            puissances: N.puiss('Let op bij negatieve exponenten: $\\dfrac{5^3}{5^{-2}}=5^{3-(-2)}=5^5$ en $5^3\\times5^{-2}=5^{3+(-2)}=5^1$.'),
            puissancesSimple: N.puiss('Voorbeelden: $3^{-2}\\times3^{5}=3^{-2+5}=3^3$ en $\\dfrac{3^{2}}{3^{-4}}=3^{2-(-4)}=3^6$.'),
            puissancesFinal: N.puiss('Voorbeelden: $7^{-5}\\times7^{3}=7^{-5+3}=7^{-2}$ en $\\dfrac{7^{-1}}{7^{4}}=7^{-1-4}=7^{-5}$.'),
            rangerEcritures: N.ecritures,
            rangerFinal: N.ecritures,
            sommeDecimale: 'Twee methoden, naar keuze:<br>' +
                '• <b>Alles als decimaal getal</b>: schrijf elke breuk als decimaal getal en tel op, met de komma’s onder elkaar.<br>' +
                'Voorbeeld: $\\dfrac{3}{10}+\\dfrac{45}{100}+\\dfrac{7}{1\\,000}=0{,}3+0{,}45+0{,}007=0{,}757$.<br>' +
                '• <b>Alles in duizendsten</b>: schrijf elke breuk met noemer $1\\,000$, tel de tellers op en schrijf het resultaat als decimaal getal.<br>' +
                'Voorbeeld: $\\dfrac{3}{10}+\\dfrac{45}{100}+\\dfrac{7}{1\\,000}=\\dfrac{300}{1\\,000}+\\dfrac{450}{1\\,000}+\\dfrac{7}{1\\,000}=\\dfrac{757}{1\\,000}=0{,}757$.',
            chasles: 'Relatie van Chasles: $\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}$ (het eindpunt van de eerste vector is het beginpunt van de tweede).<br>' +
                'Je mag de volgorde van de termen veranderen om ze kop aan staart te leggen: $\\overrightarrow{BC}+\\overrightarrow{AB}=\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}$.',
            chaslesSimple: N.chasles,
            chaslesFinal: N.chasles,
            identitesRemarquables: N.identites('$(x+5)^2=x^2+2\\times x\\times5+5^2=x^2+10x+25$. Vergeet het dubbele product $2ab$ niet.'),
            identitesSimple: N.identites('$(x-4)^2=x^2-2\\times x\\times4+4^2=x^2-8x+16$.'),
            identitesFinal: N.identites('$(x+3)^2=x^2+2\\times x\\times3+3^2=x^2+6x+9$.'),
            scriptSiSinon: 'Bij <code>if</code> … <code>else</code> wordt de voorwaarde getest met de <b>huidige</b> waarden van de variabelen: als die waar is, wordt alleen het blok onder <code>if</code> uitgevoerd; anders alleen het blok onder <code>else</code>.<br>' +
                'Voorbeeld: <code>a = 4</code>, <code>b = 10</code>, <code>if a &gt; b:</code> <code>a = a - b</code> <code>else:</code> <code>b = b - a</code>. Omdat $4>10$ niet waar is, verandert alleen <code>b</code>: die wordt $6$. <code>print(a, b)</code> toont ' + CONSOLE_4_6 + '.',
            scriptSiSinonSimple: N.script,
            scriptFinal: N.script,
            arithmetique: 'Een <b>priemgetal</b> heeft precies twee delers: $1$ en zichzelf ($2$, $3$, $5$, $7$, $11$, $13$, $17$, $19$, $23$…).<br>' +
                'Controleer of het deelbaar is door $2$, $3$, $5$, $7$, $11$… Tip voor $3$: de som van de cijfers is een veelvoud van $3$.<br>' +
                'Voorbeeld: $57$: $5+7=12$, dus $57=3\\times19$ is geen priemgetal.',
            arithmetiqueSimple: N.diviseur('$87$: $8+7=15$, dus $87=3\\times29$; de kleinste deler is $3$.'),
            arithmetiqueFinal: N.diviseur('$91$ is niet deelbaar door $2$, $3$ of $5$, maar $91=7\\times13$.'),
            isolerVariable: N.triangle, isolerSimple: N.triangle, isolerFinal: N.triangle,
            produitNul: N.produit('(x-2)(x+7)=0', 'x-2', 'x+7', '2', '-7'),
            produitNulSimple: N.produit('(x+3)(x-8)=0', 'x+3', 'x-8', '-3', '8'),
            produitNulFinal: N.produit('(x-5)(x+1)=0', 'x-5', 'x+1', '5', '-1'),
            moyenneMediane: 'De <b>mediaan</b> verdeelt de geordende waarnemingsgetallen in twee even grote groepen: zet de waarden <b>eerst</b> op volgorde van klein naar groot en neem dan de middelste.<br>' +
                'Voorbeeld: $9\\ ;\\ 2\\ ;\\ 7\\ ;\\ 4\\ ;\\ 12$ geordend geeft $2\\ ;\\ 4\\ ;\\ 7\\ ;\\ 9\\ ;\\ 12$: de mediaan is $7$ (en het gemiddelde is $\\dfrac{34}{5}=6{,}8$).',
            medianeSimple: 'De <b>mediaan</b>: zet de waarden <b>eerst</b> op volgorde van klein naar groot en neem dan de middelste.<br>' +
                'Voorbeeld: $9\\ ;\\ 2\\ ;\\ 7\\ ;\\ 4\\ ;\\ 12$ geordend geeft $2\\ ;\\ 4\\ ;\\ 7\\ ;\\ 9\\ ;\\ 12$: de mediaan is $7$. Bij een even aantal waarden neem je het gemiddelde van de twee middelste waarden.',
            inequation: 'Een ongelijkheid los je op als een vergelijking, met één extra regel: als je vermenigvuldigt of deelt door een <b>negatief</b> getal, <b>klapt</b> het ongelijkheidsteken <b>om</b>.<br>' +
                'Voorbeeld: $2x+1<7$ ; $2x<6$ ; $x<3$ (delen door $2>0$). Maar $-2x<6$ geeft $x>-3$ (delen door $-2<0$).',
            inequationSimple: 'Een ongelijkheid los je op als een vergelijking; als je deelt door een <b>positief</b> getal, blijft het ongelijkheidsteken hetzelfde.<br>' +
                'Voorbeeld: $3x-4\\geqslant8$ ; $3x\\geqslant12$ ; $x\\geqslant4$.',
            pythagoreQCM: N.pythagore(3, 4, '9+16=25$, dus schuine zijde $=\\sqrt{25}=5'),
            pythagoreSimple: N.pythagore(6, 8, '36+64=100$, dus schuine zijde $=10'),
            probaUrne: 'Als alle uitkomsten even waarschijnlijk zijn: $P=\\dfrac{\\text{aantal gunstige uitkomsten}}{\\text{totaal aantal uitkomsten}}$.<br>' +
                'Voorbeeld: $3$ rode en $5$ groene knikkers ($8$ knikkers): $P(\\text{rood})=\\dfrac{3}{8}$ en $P(\\text{niet rood})=1-\\dfrac{3}{8}=\\dfrac{5}{8}$.',
            milieu: 'De coördinaten van het midden $M$ van $[AB]$ zijn het <b>gemiddelde</b> van de coördinaten van $A$ en $B$: $M\\left(\\dfrac{x_A+x_B}{2}\\ ;\\ \\dfrac{y_A+y_B}{2}\\right)$.<br>' +
                'Voorbeeld: $A(1\\ ;\\ 4)$ en $B(5\\ ;\\ -2)$: $M\\left(\\dfrac{1+5}{2}\\ ;\\ \\dfrac{4+(-2)}{2}\\right)=M(3\\ ;\\ 1)$.',
            proportionPourcent: 'Voor een deel van een deel <b>vermenigvuldig</b> je de twee delen.<br>' +
                'Voorbeeld: $50\\,\\%$ van de leerlingen zijn meisjes en van hen sport $40\\,\\%$: $0{,}5\\times0{,}4=0{,}2$, dus $20\\,\\%$ van de leerlingen.'
        }
    };
    function rappel(nom, langue, francais) {
        var t = RAPPELS[langue] && RAPPELS[langue][nom];
        if (!t) return null;
        if (t.indexOf('{SVG}') >= 0) {
            var svg = /<svg[\s\S]*?<\/svg>/.exec(francais || '');
            t = t.replace('{SVG}', svg ? svg[0] : '');
        }
        return t;
    }
    // libellés autour du rappel
    var TEXTES = {
        en: { bouton: 'I don’t know, I need a reminder', titre: 'Reminder', fin: 'Your turn now: answer the question.' },
        nl: { bouton: 'Ik weet het niet, ik heb een geheugensteuntje nodig', titre: 'Geheugensteuntje', fin: 'Nu jij: beantwoord de vraag.' }
    };

    // petits drapeaux (SVG, lisibles partout, y compris sous Windows où les émojis-drapeaux ne s'affichent pas)
    var DRAPEAUX = {
        en: '<svg viewBox="0 0 60 30" width="26" height="16" preserveAspectRatio="none" aria-hidden="true"><rect width="60" height="30" fill="#012169"/>' +
            '<path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="2"/>' +
            '<path d="M30,0 V30 M0,15 H60" stroke="#fff" stroke-width="10"/><path d="M30,0 V30 M0,15 H60" stroke="#C8102E" stroke-width="6"/></svg>',
        nl: '<svg viewBox="0 0 9 6" width="24" height="16" aria-hidden="true"><rect width="9" height="2" fill="#AE1C28"/><rect y="2" width="9" height="2" fill="#fff"/><rect y="4" width="9" height="2" fill="#21468B"/></svg>'
    };

    window.Traduction = {
        traduire: traduire, rappel: rappel, textes: TEXTES,
        langues: [['en', 'English', DRAPEAUX.en], ['nl', 'Nederlands', DRAPEAUX.nl]]
    };
})();
