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

    window.Traduction = { traduire: traduire, langues: [['en', 'English'], ['nl', 'Nederlands']] };
})();
