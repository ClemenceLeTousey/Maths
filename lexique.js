/* Lexique du bouton « 📖 Vocabulaire » (barre du haut, voir barre.js).
   Pour ajouter un mot : copier un bloc { ... }, le coller dans la liste et le modifier.
   - mot   : le mot tel qu'il s'affiche (titre de la fiche) ;
   - aussi : autres façons de l'écrire ou de le chercher (pluriel et accents inutiles : la recherche les ignore) ;
   - def   : l'explication, en mots simples ;
   - ex    : un exemple (facultatif) ;
   - astuce: un moyen mnémotechnique (facultatif) ;
   - voir  : mots proches, écrits exactement comme le « mot » d'une autre fiche (facultatif).
   On peut utiliser <b>gras</b>, <i>italique</i>, et <span class='f'>…</span> pour qu'une formule ne soit pas coupée en fin de ligne. Ne pas oublier la virgule entre deux blocs. */
window.LEXIQUE = [

    /* ---------- Nombres et calculs ---------- */
    { mot: "valeur ronde", aussi: ["nombre rond", "arrondir à une valeur ronde", "valeurs simples"],
      def: "Nombre « facile » pour calculer de tête : un nombre entier, souvent terminé par des zéros (10, 50, 200, 1 000…), ou un nombre simple comme 0,5 ou 2,5. On remplace un nombre compliqué par une valeur ronde proche pour trouver rapidement un <b>ordre de grandeur</b>.",
      ex: "49,7 × 2,02 : on prend les valeurs rondes 50 et 2, donc le résultat est proche de 50 × 2 = 100.",
      voir: ["ordre de grandeur", "arrondi", "valeur approchée", "de tête"] },

    { mot: "ordre de grandeur", aussi: ["estimer", "estimation", "estimer un résultat"],
      def: "Valeur approchée simple d'un résultat, trouvée de tête en remplaçant les nombres par des <b>valeurs rondes</b>. Elle sert à savoir « à peu près combien » et à repérer une erreur de calcul.",
      ex: "Ordre de grandeur de 19,7 % de 498 : environ 20 % de 500, c'est-à-dire 100.",
      voir: ["valeur ronde", "valeur approchée"] },

    { mot: "arrondi", aussi: ["arrondir", "arrondi au dixième", "arrondi à l'unité", "arrondi au centième"],
      def: "Valeur approchée la plus proche d'un nombre, avec le nombre de chiffres demandé. On regarde le chiffre juste après la position demandée : de 0 à 4, on garde ; de 5 à 9, on ajoute 1.",
      ex: "3,147 arrondi au dixième : 3,1 (le chiffre suivant est 4). Arrondi au centième : 3,15 (le chiffre suivant est 7).",
      voir: ["valeur approchée", "dixième", "valeur ronde"] },

    { mot: "valeur approchée", aussi: ["approximation", "environ", "≈"],
      def: "Nombre proche du résultat exact, mais pas égal. On utilise le signe ≈ (« environ égal »).",
      ex: "√2 ≈ 1,41 et 1/3 ≈ 0,333.",
      voir: ["valeur exacte", "arrondi"] },

    { mot: "valeur exacte", aussi: ["exacte", "résultat exact"],
      def: "Le résultat juste, sans aucun arrondi. On le laisse souvent sous forme de fraction ou de racine carrée.",
      ex: "La valeur exacte de 1 ÷ 3 est 1/3 (0,33 n'est qu'une valeur approchée). Une valeur exacte peut être √5.",
      voir: ["valeur approchée", "fraction", "racine carrée"] },

    { mot: "de tête", aussi: ["calcul mental", "sans calculatrice", "mentalement"],
      def: "Sans calculatrice et sans poser l'opération. On transforme le calcul pour le rendre simple : valeurs rondes, factorisation, découpage…",
      ex: "99 × 7 = 100 × 7 − 7 = 700 − 7 = 693.",
      voir: ["valeur ronde", "factoriser"] },

    { mot: "encadrer", aussi: ["encadrement"],
      def: "Trouver deux nombres, un plus petit et un plus grand, entre lesquels se trouve le nombre. On écrit : petit &lt; nombre &lt; grand.",
      ex: "Encadrer √30 entre deux entiers consécutifs : 25 &lt; 30 &lt; 36, donc 5 &lt; √30 &lt; 6.",
      voir: ["consécutifs", "comparer"] },

    { mot: "consécutifs", aussi: ["consécutif", "entiers consécutifs", "décimaux consécutifs"],
      def: "Qui se suivent directement, sans autre nombre du même type entre eux.",
      ex: "7 et 8 sont deux entiers consécutifs. 2,3 et 2,4 sont deux décimaux consécutifs au dixième.",
      voir: ["encadrer", "dixième"] },

    { mot: "dixième", aussi: ["centième", "millième", "au dixième", "au centième", "au millième"],
      def: "Un dixième = 1/10 = 0,1 (1<sup>er</sup> chiffre après la virgule). Un centième = 1/100 = 0,01 (2<sup>e</sup> chiffre). Un millième = 1/1 000 = 0,001 (3<sup>e</sup> chiffre). « Au dixième » veut dire « avec un seul chiffre après la virgule ».",
      ex: "Dans 5,382 : 3 est le chiffre des dixièmes, 8 celui des centièmes et 2 celui des millièmes.",
      voir: ["arrondi", "nombre décimal"] },

    { mot: "entier relatif", aussi: ["entier", "entier naturel", "nombre entier", "relatif"],
      def: "<b>Entier naturel</b> : nombre sans virgule, positif ou nul (0, 1, 2, 3…). <b>Entier relatif</b> : entier positif ou négatif (… −2, −1, 0, 1, 2…).",
      ex: "−5 est un entier relatif, mais pas un entier naturel. 2,5 n'est pas un entier.",
      voir: ["réel", "nombre décimal"] },

    { mot: "réel", aussi: ["nombre réel", "non nul"],
      def: "Un nombre réel est n'importe quel nombre qu'on peut placer sur une droite graduée : entier, décimal, fraction, √2, π… « Non nul » veut dire « différent de 0 ».",
      ex: "−3 ; 0,75 ; 2/3 ; √2 et π sont des nombres réels.",
      voir: ["entier relatif"] },

    { mot: "positif", aussi: ["négatif", "strictement positif", "strictement négatif", "strictement", "nul"],
      def: "Positif : supérieur ou égal à 0 (≥ 0). Négatif : inférieur ou égal à 0 (≤ 0). « <b>Strictement</b> » exclut le 0 : strictement positif veut dire &gt; 0.",
      ex: "0 est positif et négatif à la fois, mais il n'est pas strictement positif.",
      voir: ["comparer", "intervalle"] },

    { mot: "nombre décimal", aussi: ["décimal", "écriture décimale", "forme décimale"],
      def: "Nombre qui s'écrit avec un nombre <b>fini</b> de chiffres après la virgule. Son écriture décimale, c'est son écriture « avec une virgule ».",
      ex: "3/4 = 0,75 est un nombre décimal. 1/3 = 0,333… n'en est pas un (les 3 ne s'arrêtent jamais).",
      voir: ["fraction", "dixième"] },

    { mot: "fraction", aussi: ["écriture fractionnaire", "forme fractionnaire"],
      def: "Écriture a/b, qui veut dire « a divisé par b » (avec b ≠ 0). a est le <b>numérateur</b> (en haut), b le <b>dénominateur</b> (en bas).",
      ex: "3/4 : on partage en 4 parts égales et on en prend 3. 3/4 = 0,75.",
      voir: ["dénominateur", "fraction irréductible", "tiers", "quotient"] },

    { mot: "fraction irréductible", aussi: ["irréductible", "simplifier une fraction"],
      def: "Fraction qu'on ne peut plus simplifier : le numérateur et le dénominateur n'ont plus de diviseur commun (à part 1).",
      ex: "12/18 = 2/3 (on divise en haut et en bas par 6). 2/3 est irréductible.",
      voir: ["fraction", "simplifier"] },

    { mot: "dénominateur", aussi: ["numérateur", "même dénominateur", "réduire au même dénominateur", "dénominateur commun"],
      def: "Dans une fraction a/b : a est le numérateur (en haut), b le dénominateur (en bas). <b>Réduire au même dénominateur</b> : réécrire les fractions pour qu'elles aient le même nombre en bas, afin de les comparer ou de les additionner.",
      ex: "1/4 et 1/6 réduites au même dénominateur : 3/12 et 2/12.",
      voir: ["fraction"] },

    { mot: "tiers", aussi: ["moitié", "quart", "cinquième", "deux tiers", "trois quarts", "trois cinquièmes"],
      def: "Fractions dites avec des mots : la moitié = 1/2, un tiers = 1/3, un quart = 1/4, un cinquième = 1/5… « Deux tiers » = 2/3, « trois cinquièmes » = 3/5. Prendre une fraction d'un nombre, c'est multiplier.",
      ex: "Les deux tiers de 30 : 2/3 × 30 = 20.",
      voir: ["fraction", "proportion"] },

    { mot: "somme", aussi: ["addition", "terme d'une somme"],
      def: "Résultat d'une addition. Les nombres qu'on ajoute s'appellent les <b>termes</b>.",
      ex: "La somme de 5 et 8 est 13. 3x + 2 est une somme de deux termes.",
      voir: ["différence", "produit", "quotient"] },

    { mot: "différence", aussi: ["soustraction"],
      def: "Résultat d'une soustraction.",
      ex: "La différence de 10 et 4 est 10 − 4 = 6.",
      voir: ["somme"] },

    { mot: "produit", aussi: ["multiplication", "facteur"],
      def: "Résultat d'une multiplication. Les nombres qu'on multiplie s'appellent les <b>facteurs</b>.",
      ex: "Le produit de 6 par 7 est 42. (x + 1)(x − 2) est un produit de deux facteurs.",
      voir: ["somme", "quotient", "factoriser"] },

    { mot: "quotient", aussi: ["division"],
      def: "Résultat d'une division.",
      ex: "Le quotient de 12 par 4 est 12 ÷ 4 = 3.",
      voir: ["produit", "fraction"] },

    { mot: "inverse", aussi: [],
      def: "L'inverse d'un nombre a (non nul) est 1/a. Un nombre multiplié par son inverse donne 1. À ne pas confondre avec l'<b>opposé</b>.",
      ex: "L'inverse de 4 est 1/4 = 0,25. L'inverse de 2/3 est 3/2.",
      voir: ["opposé"] },

    { mot: "opposé", aussi: [],
      def: "L'opposé d'un nombre a est −a. Un nombre plus son opposé donne 0. À ne pas confondre avec l'<b>inverse</b>.",
      ex: "L'opposé de 5 est −5 ; l'opposé de −3 est 3.",
      voir: ["inverse"] },

    { mot: "carré", aussi: ["au carré", "élever au carré", "carré parfait"],
      def: "Le carré d'un nombre, c'est ce nombre multiplié par lui-même : a² = a × a. (Rien à voir ici avec la figure « carré ».)",
      ex: "5² = 25 ; (−3)² = 9.",
      voir: ["racine carrée", "puissance"] },

    { mot: "racine carrée", aussi: ["racine", "√"],
      def: "La racine carrée d'un nombre positif a, notée √a, est le nombre positif dont le carré vaut a.",
      ex: "√49 = 7 car 7² = 49. √2 ≈ 1,414.",
      voir: ["carré", "valeur exacte"] },

    { mot: "puissance", aussi: ["exposant", "puissance de 10"],
      def: "aⁿ (« a puissance n ») = a × a × … × a, avec n facteurs égaux à a. Le nombre n est l'<b>exposant</b>. Avec un exposant négatif : a⁻ⁿ = 1/aⁿ.",
      ex: "2⁵ = 2 × 2 × 2 × 2 × 2 = 32 ; 10⁻³ = 1/1 000 = 0,001.",
      voir: ["écriture scientifique", "carré"] },

    { mot: "écriture scientifique", aussi: ["notation scientifique"],
      def: "Écriture a × 10ⁿ, où a a <b>un seul chiffre non nul avant la virgule</b> (1 ≤ a &lt; 10) et n est un entier relatif.",
      ex: "45 000 = 4,5 × 10⁴ ; 0,0072 = 7,2 × 10⁻³.",
      voir: ["puissance"] },

    { mot: "comparer", aussi: ["comparaison", "supérieur", "inférieur"],
      def: "Dire lequel de deux nombres est le plus grand (ou s'ils sont égaux), avec les symboles &lt; (« inférieur à »), &gt; (« supérieur à ») ou =.",
      ex: "Comparer 5/6 et 0,85 : 5/6 ≈ 0,833, donc 5/6 &lt; 0,85.",
      voir: ["ordre croissant", "encadrer"] },

    { mot: "ordre croissant", aussi: ["croissant", "ordre décroissant", "décroissant", "ranger"],
      def: "Ordre croissant : du plus petit au plus grand. Ordre décroissant : du plus grand au plus petit.",
      ex: "Dans l'ordre croissant : 0,04 &lt; 0,045 &lt; 0,05.",
      voir: ["comparer"] },

    { mot: "intervalle", aussi: ["crochet", "crochets"],
      def: "Ensemble de tous les nombres compris entre deux bornes. Crochet tourné vers le nombre : borne comprise ; crochet tourné vers l'extérieur : borne exclue.",
      ex: "[2 ; 5] : de 2 à 5, 2 et 5 compris. ]2 ; 5[ : entre 2 et 5, 2 et 5 exclus.",
      voir: ["inéquation", "positif"] },

    { mot: "nombre premier", aussi: ["premier", "nombres premiers", "décomposition en facteurs premiers", "facteurs premiers"],
      def: "Nombre entier qui a <b>exactement deux diviseurs</b> : 1 et lui-même. 1 n'est pas premier. Tout entier (à partir de 2) s'écrit comme un produit de nombres premiers : c'est sa <b>décomposition en facteurs premiers</b>.",
      ex: "2, 3, 5, 7, 11, 13 sont premiers. 119 n'est pas premier : 119 = 7 × 17. Et 60 = 2² × 3 × 5.",
      voir: ["diviseur"] },

    { mot: "diviseur", aussi: ["multiple", "divisible", "diviser"],
      def: "a est un <b>diviseur</b> de b si la division de b par a tombe juste (reste 0). On dit aussi que b est <b>divisible</b> par a, ou que b est un <b>multiple</b> de a.",
      ex: "7 est un diviseur de 119, car 119 = 7 × 17. Donc 119 est un multiple de 7.",
      voir: ["nombre premier", "quotient"] },

    /* ---------- Calcul littéral et équations ---------- */
    { mot: "expression", aussi: ["expression littérale", "exprimer", "exprimer en fonction de", "en fonction de"],
      def: "Une expression littérale est un calcul qui contient des lettres. « <b>Exprimer A en fonction de x</b> » : écrire A avec un calcul dans lequel la seule lettre est x.",
      ex: "Le périmètre d'un carré de côté x s'exprime en fonction de x : P = 4x.",
      voir: ["développer", "réduire"] },

    { mot: "développer", aussi: ["développement", "développer et réduire"],
      def: "Transformer un produit en somme (on « enlève les parenthèses »), grâce à la distributivité. C'est le contraire de factoriser.",
      ex: "3(x + 2) = 3x + 6 ; (x + 1)(x + 2) = x² + 3x + 2.",
      voir: ["factoriser", "distributivité", "réduire"] },

    { mot: "factoriser", aussi: ["factorisation", "facteur commun"],
      def: "Transformer une somme en produit : c'est le contraire de développer. On repère un <b>facteur commun</b> et on le met devant des parenthèses.",
      ex: "6x + 9 = 3(2x + 3) ; x² + 5x = x(x + 5).",
      voir: ["développer", "produit"] },

    { mot: "distributivité", aussi: ["distribuer", "double distributivité"],
      def: "Règle qui permet de développer : k(a + b) = ka + kb, et (a + b)(c + d) = ac + ad + bc + bd.",
      ex: "4(x − 3) = 4x − 12.",
      voir: ["développer"] },

    { mot: "réduire", aussi: ["réduire une expression"],
      def: "Regrouper les termes de même nature (les x² ensemble, les x ensemble, les nombres ensemble) pour écrire l'expression le plus simplement possible.",
      ex: "3x + 5 + 2x − 1 = 5x + 4.",
      voir: ["développer", "simplifier", "dénominateur"] },

    { mot: "simplifier", aussi: ["simplification"],
      def: "Écrire un nombre ou une expression sous une forme plus courte, mais égale.",
      ex: "12/18 = 2/3 ; √12 = 2√3 ; 2x + 3x = 5x.",
      voir: ["fraction irréductible", "réduire"] },

    { mot: "coefficient", aussi: [],
      def: "Nombre qui multiplie une lettre.",
      ex: "Dans 7x, le coefficient de x est 7. Dans −x, il vaut −1.",
      voir: ["coefficient directeur", "coefficient multiplicateur"] },

    { mot: "équation", aussi: [],
      def: "Égalité qui contient une <b>inconnue</b> (souvent x). Résoudre l'équation, c'est trouver toutes les valeurs de l'inconnue qui rendent l'égalité vraie : ce sont les <b>solutions</b>.",
      ex: "3x + 5 = 11 a pour solution x = 2, car 3 × 2 + 5 = 11.",
      voir: ["inconnue", "solution", "membre", "inéquation"] },

    { mot: "inconnue", aussi: [],
      def: "Lettre (souvent x) qui représente le nombre qu'on cherche dans une équation.",
      ex: "Dans 2x − 1 = 7, l'inconnue est x.",
      voir: ["équation"] },

    { mot: "membre", aussi: ["deux membres", "membre de gauche", "membre de droite"],
      def: "Les deux côtés d'une égalité : le membre de gauche (avant le signe =) et le membre de droite (après).",
      ex: "Dans 3x + 5 = 7x − 2, le membre de gauche est 3x + 5 et le membre de droite est 7x − 2.",
      voir: ["équation"] },

    { mot: "solution", aussi: ["résoudre", "résolution"],
      def: "Valeur de l'inconnue qui rend une équation (ou une inéquation) vraie. <b>Résoudre</b>, c'est trouver toutes les solutions.",
      ex: "x = 4 est solution de 2x − 1 = 7, car 2 × 4 − 1 = 7.",
      voir: ["équation", "résoudre graphiquement"] },

    { mot: "inéquation", aussi: [],
      def: "Comme une équation, mais avec &lt;, &gt;, ≤ ou ≥ à la place de =. Les solutions sont en général tout un intervalle de nombres. Attention : quand on multiplie ou divise les deux membres par un nombre <b>négatif</b>, on <b>change le sens</b> de l'inégalité.",
      ex: "2x &lt; 6 donne x &lt; 3. Mais −2x &lt; 6 donne x &gt; −3 (on a divisé par −2).",
      voir: ["équation", "intervalle", "résoudre graphiquement"] },

    { mot: "identités remarquables", aussi: ["identité remarquable", "double produit"],
      def: "Trois formules à connaître pour développer (ou factoriser) vite : (a + b)² = a² + 2ab + b² ; (a − b)² = a² − 2ab + b² ; (a + b)(a − b) = a² − b². Le terme 2ab s'appelle le <b>double produit</b> : il ne faut pas l'oublier !",
      ex: "(x + 3)² = x² + 6x + 9 (et non x² + 9).",
      voir: ["développer", "factoriser"] },

    { mot: "équation produit nul", aussi: ["produit nul"],
      def: "Équation de la forme A × B = 0. Un produit est nul si et seulement si l'un de ses facteurs est nul : on résout donc A = 0 et B = 0.",
      ex: "(x − 2)(x + 5) = 0 : x − 2 = 0 ou x + 5 = 0, donc les solutions sont 2 et −5.",
      voir: ["équation", "factoriser", "produit"] },

    { mot: "isoler", aussi: ["isoler une variable", "isoler x"],
      def: "Transformer une égalité pour que la lettre demandée se retrouve <b>seule</b> d'un côté du signe =. On fait les mêmes opérations sur les deux membres.",
      ex: "Isoler r dans P = 2πr : on divise les deux membres par 2π, donc r = P ÷ (2π).",
      voir: ["membre", "équation"] },

    { mot: "premier degré", aussi: ["second degré", "degré", "affine"],
      def: "Une expression est <b>du premier degré</b> quand x n'y apparaît pas au carré (ni plus) : ax + b. Elle est <b>du second degré</b> quand le terme le plus haut est en x² : ax² + bx + c.",
      ex: "3x − 5 est du premier degré ; 2x² + x − 1 est du second degré.",
      voir: ["équation", "expression"] },

    /* ---------- Proportions et évolutions ---------- */
    { mot: "proportion", aussi: ["part", "fréquence"],
      def: "Part d'un ensemble par rapport au tout : proportion = effectif de la partie ÷ effectif total. Elle s'écrit en fraction, en nombre décimal ou en pourcentage, et elle est toujours entre 0 et 1 (entre 0 % et 100 %).",
      ex: "12 filles sur 30 élèves : 12/30 = 2/5 = 0,4 = 40 %.",
      voir: ["pourcentage", "effectif", "tiers"] },

    { mot: "pourcentage", aussi: ["pour cent", "%", "pourcent"],
      def: "Proportion écrite « sur 100 » : t % = t/100. Prendre t % d'un nombre, c'est le multiplier par t/100.",
      ex: "30 % de 700 = 0,30 × 700 = 210.",
      voir: ["proportion", "taux d'évolution"] },

    { mot: "effectif", aussi: ["effectif total"],
      def: "Nombre d'éléments (personnes, objets…). L'effectif total est le nombre d'éléments de tout l'ensemble.",
      ex: "Classe de 30 élèves dont 12 filles : l'effectif des filles est 12, l'effectif total est 30.",
      voir: ["proportion"] },

    { mot: "taux d'évolution", aussi: ["taux", "évolution", "augmentation", "diminution", "baisse", "hausse", "variation en pourcentage"],
      def: "Pourcentage d'augmentation (taux positif) ou de baisse (taux négatif) d'une quantité. t = (valeur d'arrivée − valeur de départ) ÷ valeur de départ.",
      ex: "Un prix passe de 50 € à 60 € : t = (60 − 50)/50 = 0,2, soit une hausse de 20 %.",
      voir: ["coefficient multiplicateur", "évolutions successives"] },

    { mot: "coefficient multiplicateur", aussi: ["cm", "coef multiplicateur", "coef"],
      def: "Nombre par lequel on multiplie une valeur pour appliquer une évolution. Augmenter de t % : multiplier par 1 + t/100. Baisser de t % : multiplier par 1 − t/100.",
      ex: "+8 % : × 1,08. −25 % : × 0,75. Un coefficient de 0,9 correspond à une baisse de 10 %.",
      voir: ["taux d'évolution", "évolutions successives"] },

    { mot: "proportionnalité", aussi: ["proportionnel", "proportionnelle", "tableau de proportionnalité"],
      def: "Deux grandeurs sont proportionnelles quand on passe de l'une à l'autre en multipliant toujours par le <b>même nombre</b>.",
      ex: "Le prix de pommes à 2 € le kg est proportionnel à la masse : 3 kg → 6 €, 5 kg → 10 €.",
      voir: ["proportion", "pourcentage"] },

    { mot: "évolutions successives", aussi: ["évolution globale", "taux global", "coefficient global", "coefficient multiplicateur global"],
      def: "Plusieurs évolutions à la suite. Le coefficient multiplicateur global est le <b>produit</b> des coefficients. Attention : on n'additionne pas les pourcentages !",
      ex: "+50 % puis −20 % : 1,5 × 0,8 = 1,2, donc une hausse globale de 20 % (et pas de 30 %).",
      voir: ["coefficient multiplicateur", "taux d'évolution"] },

    /* ---------- Fonctions et repérage ---------- */
    { mot: "fonction", aussi: ["f(x)"],
      def: "Procédé qui, à chaque nombre x, associe <b>un seul</b> nombre, noté f(x).",
      ex: "f(x) = 2x + 1 : au nombre 3, la fonction f associe f(3) = 2 × 3 + 1 = 7.",
      voir: ["image", "antécédent", "courbe représentative"] },

    { mot: "image", aussi: [],
      def: "L'image de x par f est le nombre f(x) obtenu à partir de x. Chaque nombre a une seule image. Sur la courbe : on part de x sur l'axe horizontal et on lit le résultat sur l'axe vertical. (En géométrie, l'image d'un point par une transformation est le point obtenu après la transformation.)",
      ex: "f(x) = x² : l'image de 3 est f(3) = 9.",
      astuce: "<b>A</b>ntécédent et <b>I</b>mage sont rangés dans l'ordre alphabétique, comme <b>H</b>orizontal et <b>V</b>ertical : sur la courbe, les antécédents se lisent sur l'axe horizontal, les images sur l'axe vertical.",
      voir: ["antécédent", "fonction", "translation"] },

    { mot: "antécédent", aussi: [],
      def: "Un antécédent de y par f est un nombre x tel que f(x) = y : on part du résultat pour retrouver le nombre de départ. Un nombre peut avoir aucun, un ou plusieurs antécédents. Sur la courbe : on part de y sur l'axe vertical et on lit sur l'axe horizontal.",
      ex: "f(x) = x² : 9 a deux antécédents, 3 et −3, car f(3) = 9 et f(−3) = 9.",
      astuce: "<b>A</b>ntécédent et <b>I</b>mage sont rangés dans l'ordre alphabétique, comme <b>H</b>orizontal et <b>V</b>ertical : sur la courbe, les antécédents se lisent sur l'axe horizontal, les images sur l'axe vertical.",
      voir: ["image", "fonction"] },

    { mot: "courbe représentative", aussi: ["courbe", "représentation graphique", "graphique"],
      def: "Ensemble des points de coordonnées (x ; f(x)) : chaque point de la courbe a pour abscisse un nombre x et pour ordonnée son image f(x).",
      ex: "Si le point (2 ; 5) est sur la courbe de f, alors f(2) = 5.",
      voir: ["image", "abscisse et ordonnée", "résoudre graphiquement"] },

    { mot: "résoudre graphiquement", aussi: ["résolution graphique", "graphiquement"],
      def: "Trouver les solutions en lisant la courbe. Pour f(x) = k : on trace la droite horizontale à la hauteur k et on lit les <b>abscisses</b> des points où elle coupe la courbe. Pour f(x) &gt; k : on lit les abscisses des points de la courbe situés <b>au-dessus</b> de cette droite.",
      ex: "Si la courbe coupe la droite horizontale y = 2 en x = −1 et en x = 3, les solutions de f(x) = 2 sont −1 et 3.",
      voir: ["courbe représentative", "antécédent", "solution"] },

    { mot: "abscisse et ordonnée", aussi: ["abscisse", "ordonnée", "coordonnées", "coordonnée", "axe des abscisses", "axe des ordonnées"],
      def: "Un point A(x ; y) a deux coordonnées : l'<b>abscisse</b> x, lue sur l'axe horizontal, puis l'<b>ordonnée</b> y, lue sur l'axe vertical. On donne toujours l'abscisse en premier.",
      ex: "A(2 ; −3) : abscisse 2, ordonnée −3.",
      astuce: "<b>A</b>bscisse et <b>O</b>rdonnée sont rangées dans l'ordre alphabétique, comme <b>H</b>orizontal et <b>V</b>ertical : l'abscisse se lit sur l'axe horizontal, l'ordonnée sur l'axe vertical.",
      voir: ["repère", "ordonnée à l'origine"] },

    { mot: "repère", aussi: ["repère orthogonal", "repère orthonormé", "orthonormé", "orthogonal", "origine"],
      def: "Deux axes gradués qui se coupent en un point O, l'<b>origine</b>, de coordonnées (0 ; 0). Orthogonal : les axes sont perpendiculaires. Orthonormé : en plus, la même unité sur les deux axes.",
      voir: ["abscisse et ordonnée"] },

    { mot: "équation réduite", aussi: ["équation de droite", "équation d'une droite", "appartenir", "appartient", "appartenance"],
      def: "Écriture d'une droite non verticale sous la forme y = mx + p. Un point <b>appartient</b> à la droite si ses coordonnées vérifient cette égalité. Une droite verticale a une équation du type x = c.",
      ex: "A(2 ; 7) est sur la droite y = 3x + 1, car 3 × 2 + 1 = 7.",
      voir: ["coefficient directeur", "ordonnée à l'origine"] },

    { mot: "coefficient directeur", aussi: ["pente", "coef directeur"],
      def: "Dans l'équation réduite y = mx + p, m est le coefficient directeur : quand x augmente de 1, y augmente de m. Avec deux points A et B de la droite : m = (y<sub>B</sub> − y<sub>A</sub>) ÷ (x<sub>B</sub> − x<sub>A</sub>).",
      ex: "A(1 ; 2) et B(3 ; 8) : m = (8 − 2)/(3 − 1) = 6/2 = 3.",
      voir: ["équation réduite", "ordonnée à l'origine"] },

    { mot: "ordonnée à l'origine", aussi: [],
      def: "Dans y = mx + p, p est l'ordonnée à l'origine : c'est l'ordonnée du point où la droite coupe l'axe vertical (là où x = 0).",
      ex: "La droite y = 2x − 5 coupe l'axe des ordonnées au point (0 ; −5).",
      voir: ["équation réduite", "coefficient directeur"] },

    { mot: "fonction inverse", aussi: ["1/x"],
      def: "La fonction qui, à tout nombre x non nul, associe son inverse 1/x. Elle n'est pas définie en 0.",
      ex: "L'image de 4 est 1/4 = 0,25. L'antécédent de 2 est 1/2 = 0,5.",
      voir: ["inverse", "fonction", "image"] },

    { mot: "sens de variation", aussi: ["variation", "croissante", "décroissante", "tableau de variation", "tableau de variations"],
      def: "Une fonction est <b>croissante</b> sur un intervalle si, quand x augmente, f(x) augmente aussi (la courbe « monte »). Elle est <b>décroissante</b> si f(x) diminue (la courbe « descend »).",
      ex: "La fonction inverse est décroissante sur ]0 ; +∞[ : 1/2 &gt; 1/3 &gt; 1/4…",
      voir: ["extremum", "courbe représentative"] },

    { mot: "extremum", aussi: ["maximum", "minimum", "extrema"],
      def: "Le <b>maximum</b> d'une fonction est la plus grande valeur prise par f(x) ; le <b>minimum</b> est la plus petite. Extremum = maximum ou minimum. Sur la courbe : le point le plus haut ou le plus bas.",
      ex: "Si le point le plus haut de la courbe est (2 ; 5), le maximum est 5, atteint en x = 2.",
      voir: ["sens de variation", "courbe représentative"] },

    { mot: "dérivée", aussi: ["dériver", "dérivation", "fonction dérivée", "nombre dérivé", "f'(x)"],
      def: "La fonction dérivée f' donne, en chaque point, le <b>coefficient directeur de la tangente</b> à la courbe. On dérive terme à terme : la dérivée de x² est 2x, celle de x est 1, celle d'un nombre seul est 0, et un coefficient devant reste devant.",
      ex: "f(x) = 3x² + 5x − 2 : f'(x) = 6x + 5. Donc f'(1) = 11 est le coefficient directeur de la tangente en x = 1.",
      voir: ["tangente", "coefficient directeur", "sens de variation"] },

    { mot: "tangente", aussi: [],
      def: "Droite qui « touche » la courbe en un point, en suivant sa direction à cet endroit. Son coefficient directeur est le nombre dérivé f'(a).",
      voir: ["dérivée", "coefficient directeur"] },

    { mot: "diagramme", aussi: ["diagramme en barres", "diagramme circulaire", "histogramme", "graduation", "graduations"],
      def: "Dessin qui représente des données. Avant de lire, on repère ce que représente chaque axe et la valeur d'une <b>graduation</b> (l'écart entre deux traits).",
      ex: "Si les graduations vont de 0 à 50 de 10 en 10 et qu'une barre s'arrête à mi-chemin entre 20 et 30, elle vaut 25.",
      voir: ["effectif", "pourcentage"] },

    /* ---------- Géométrie ---------- */
    { mot: "périmètre", aussi: ["contour", "périmètre du cercle", "circonférence"],
      def: "Longueur du contour d'une figure (on en fait le tour). Il s'exprime en m, en cm…<br><b>Formules :</b><br>• carré de côté c : <span class='f'>P = 4 × c</span><br>• rectangle de longueur L et de largeur ℓ : <span class='f'>P = 2 × (L + ℓ)</span><br>• triangle (ou tout polygone) : somme des longueurs des côtés<br>• cercle de rayon r : <span class='f'>P = 2 × π × r (ou π × d, avec d le diamètre)</span>",
      ex: "Rectangle de 5 cm sur 3 cm : P = 2 × (5 + 3) = 16 cm.",
      voir: ["aire"] },

    { mot: "aire", aussi: ["surface", "aire du disque", "aire du triangle"],
      def: "Mesure de la surface à l'intérieur d'une figure. Elle s'exprime en m², en cm²…<br><b>Formules :</b><br>• carré de côté c : <span class='f'>A = c × c = c²</span><br>• rectangle de longueur L et de largeur ℓ : <span class='f'>A = L × ℓ</span><br>• triangle de base b et de hauteur h : <span class='f'>A = (b × h) ÷ 2</span><br>• parallélogramme de base b et de hauteur h : <span class='f'>A = b × h</span><br>• trapèze de bases B et b, de hauteur h : <span class='f'>A = (B + b) × h ÷ 2</span><br>• disque de rayon r : <span class='f'>A = π × r²</span>",
      ex: "Rectangle de 5 cm sur 3 cm : A = 5 × 3 = 15 cm².",
      voir: ["périmètre"] },

    { mot: "codage", aussi: ["codé", "codée", "figure codée", "code"],
      def: "Petits signes dessinés sur une figure pour donner une information : des signes identiques (traits, ronds…) sur des segments indiquent qu'ils ont la <b>même longueur</b> ; un petit carré indique un <b>angle droit</b>.",
      ex: "Sur un segment partagé en morceaux, tous les morceaux marqués d'un petit rond ont la même longueur.",
      voir: ["périmètre"] },

    { mot: "hypoténuse", aussi: [],
      def: "Dans un triangle rectangle, c'est le côté opposé à l'angle droit. C'est le plus long des trois côtés.",
      ex: "ABC rectangle en A : l'hypoténuse est [BC].",
      voir: ["Pythagore"] },

    { mot: "Pythagore", aussi: ["théorème de Pythagore"],
      def: "Dans un triangle rectangle, le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés.",
      ex: "ABC rectangle en A, AB = 3 et AC = 4 : BC² = 3² + 4² = 25, donc BC = 5.",
      voir: ["hypoténuse", "racine carrée"] },

    { mot: "parallèle", aussi: ["parallèles", "perpendiculaire", "perpendiculaires"],
      def: "Deux droites parallèles ne se coupent jamais (elles ont la même direction). Deux droites perpendiculaires se coupent en formant un angle droit.",
      voir: ["parallélogramme", "repère"] },

    { mot: "quadrilatère", aussi: [],
      def: "Polygone à 4 côtés : carré, rectangle, losange, parallélogramme, trapèze…",
      voir: ["parallélogramme"] },

    { mot: "parallélogramme", aussi: [],
      def: "Quadrilatère dont les côtés opposés sont parallèles deux à deux. ABCD est un parallélogramme si et seulement si les vecteurs AB et DC sont égaux.",
      voir: ["quadrilatère", "vecteur"] },

    { mot: "superposable", aussi: ["superposer", "se superposent"],
      def: "Deux figures sont superposables si l'une peut recouvrir exactement l'autre : même forme et même taille.",
      voir: ["translation"] },

    { mot: "milieu", aussi: ["milieu d'un segment", "coordonnées du milieu"],
      def: "Le milieu d'un segment [AB] est le point situé à égale distance de A et de B. Ses coordonnées sont les <b>moyennes</b> des coordonnées de A et de B : ((x<sub>A</sub> + x<sub>B</sub>) ÷ 2 ; (y<sub>A</sub> + y<sub>B</sub>) ÷ 2).",
      ex: "A(1 ; 4) et B(5 ; 2) : le milieu est ((1 + 5)/2 ; (4 + 2)/2) = (3 ; 3).",
      voir: ["abscisse et ordonnée", "moyenne"] },

    { mot: "Thalès", aussi: ["théorème de Thalès"],
      def: "Avec deux droites parallèles qui coupent deux droites sécantes en A, on obtient deux triangles « emboîtés » dont les longueurs sont <b>proportionnelles</b> : AM/AB = AN/AC = MN/BC.",
      ex: "Si AM = 2, AB = 6 et BC = 9, alors MN = 9 × 2/6 = 3.",
      voir: ["proportionnalité", "parallèle"] },

    { mot: "vecteur", aussi: ["vecteurs égaux", "égalité de vecteurs"],
      def: "Un vecteur représente un déplacement : une direction, un sens et une longueur (sa <b>norme</b>). Le vecteur AB va de A vers B. Deux vecteurs sont égaux s'ils ont même direction, même sens et même longueur.",
      ex: "Le vecteur de coordonnées (3 ; −2) : 3 carreaux vers la droite, puis 2 carreaux vers le bas.",
      voir: ["norme", "translation"] },

    { mot: "relation de Chasles", aussi: ["Chasles", "somme de vecteurs", "additionner des vecteurs", "bout à bout"],
      def: "Pour additionner deux vecteurs, on les met <b>bout à bout</b> : aller de A à B, puis de B à C, revient à aller directement de A à C. On écrit : AB + BC = AC (en vecteurs).",
      ex: "Vecteurs (2 ; 1) + (3 ; −4) = (5 ; −3) : on additionne les déplacements horizontaux, puis les verticaux.",
      voir: ["vecteur", "translation"] },

    { mot: "norme", aussi: [],
      def: "Longueur d'un vecteur. Dans un repère orthonormé, le vecteur de coordonnées (x ; y) a pour norme √(x² + y²).",
      ex: "Vecteur (3 ; 4) : norme = √(9 + 16) = √25 = 5.",
      voir: ["vecteur", "Pythagore"] },

    { mot: "translation", aussi: [],
      def: "Transformation qui fait <b>glisser</b> une figure, sans la tourner ni la retourner : tous les points bougent du même déplacement. La translation qui transforme A en B est la translation de vecteur AB.",
      voir: ["vecteur", "image", "superposable"] },

    { mot: "symétrique", aussi: ["symétrie"],
      def: "Symétrique d'un point par rapport à un point O : O est le milieu du segment qui les relie. Par rapport à une droite : effet miroir, la droite coupe le segment en son milieu, à angle droit.",
      ex: "A(2 ; 3) a pour symétrique (−2 ; −3) par rapport à l'origine, et (2 ; −3) par rapport à l'axe des abscisses.",
      voir: ["repère"] },

    /* ---------- Statistiques et suites ---------- */
    { mot: "moyenne", aussi: [],
      def: "Somme de toutes les valeurs, divisée par le nombre de valeurs.",
      ex: "Moyenne de 8, 12 et 13 : (8 + 12 + 13) ÷ 3 = 33 ÷ 3 = 11.",
      voir: ["médiane", "effectif"] },

    { mot: "médiane", aussi: [],
      def: "Valeur qui partage la série, rangée dans l'ordre croissant, en deux groupes de même effectif : au moins la moitié des valeurs sont en dessous, au moins la moitié au-dessus.",
      ex: "Série 3 ; 5 ; 8 ; 10 ; 14 : la médiane est 8.",
      voir: ["moyenne", "ordre croissant"] },

    { mot: "suite", aussi: ["suite géométrique", "récurrence", "raison", "terme d'une suite", "rang"],
      def: "Liste de nombres numérotés u₀, u₁, u₂… (u<sub>n</sub> est le terme de <b>rang</b> n). Définie <b>par récurrence</b> : on donne le premier terme et une règle pour passer d'un terme au suivant. Suite <b>géométrique</b> : on multiplie toujours par le même nombre q, appelé la <b>raison</b>.",
      ex: "u₀ = 1 000 et u<sub>n+1</sub> = 0,9 × u<sub>n</sub> : u₁ = 900, puis u₂ = 810.",
      voir: ["coefficient multiplicateur"] },

    { mot: "probabilité", aussi: ["probabilités", "hasard", "au hasard", "équiprobable", "événement", "issue"],
      def: "Nombre entre 0 et 1 qui mesure les chances qu'un événement se produise. Quand toutes les issues ont la même chance (tirage <b>au hasard</b>) : probabilité = nombre d'issues favorables ÷ nombre total d'issues.",
      ex: "Une urne contient 1 boule verte, 4 rouges et 5 jaunes : la probabilité de tirer la verte est 1/10.",
      voir: ["indiscernable", "proportion", "fraction"] },

    { mot: "indiscernable", aussi: ["indiscernables", "indiscernables au toucher", "urne"],
      def: "Des objets indiscernables (au toucher) ne peuvent pas être distingués quand on les tire sans regarder : chacun a donc la <b>même chance</b> d'être tiré. Une <b>urne</b> est simplement un récipient (un sac, une boîte) dans lequel on tire au hasard.",
      voir: ["probabilité"] },

    /* ---------- Algorithmique ---------- */
    { mot: "variable", aussi: ["affectation", "affecter"],
      def: "En programmation, une variable est une « boîte » qui porte un nom et contient une valeur. L'<b>affectation</b> (en Python : a = 5) met une valeur dans la variable, en remplaçant l'ancienne.",
      ex: "a = 3, puis a = a + 2 : à la fin, a vaut 5.",
      voir: ["renvoyer", "condition"] },

    { mot: "renvoyer", aussi: ["renvoie", "return", "afficher", "affiche", "print", "console"],
      def: "<b>print(…)</b> affiche une valeur à l'écran (dans la console). <b>return …</b> renvoie le résultat d'une fonction Python : c'est la valeur que donne la fonction quand on l'utilise.",
      ex: "def double(x): return 2*x. Alors double(5) renvoie 10.",
      voir: ["variable"] },

    { mot: "condition", aussi: ["if", "else", "sinon", "elif", "structure conditionnelle", "instruction conditionnelle"],
      def: "if condition: … else: … : le programme exécute la première partie si la condition est vraie, sinon la deuxième.",
      ex: "if note >= 10: print(\"admis\") else: print(\"refusé\").",
      voir: ["variable", "boucle"] },

    { mot: "boucle", aussi: ["for", "while", "répéter", "tant que", "range"],
      def: "Instruction qui répète un bloc. <b>for i in range(n)</b> répète n fois (i prend les valeurs 0, 1, …, n − 1). <b>while condition</b> répète tant que la condition est vraie.",
      ex: "for i in range(3): print(i) affiche 0, puis 1, puis 2.",
      voir: ["condition", "variable"] }
];
