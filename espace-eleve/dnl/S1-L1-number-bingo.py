# DNL Maths - Séquence 1 - Lesson 1 - Task "Number bingo"
# Script pour le professeur (à ne pas projeter : les élèves doivent ENTENDRE le nombre).
#  - tire au hasard les nombres de 11 à 99, sans répétition ;
#  - affiche le nombre en chiffres ET en anglais, à lire à voix haute ;
#  - insiste sur les paires pièges 13/30, 14/40, ..., 19/90 : quand l'un des deux
#    sort, l'autre a de bonnes chances de sortir juste après ;
#  - tape "c" pour vérifier la ligne du gagnant, "l" pour la liste, "q" pour quitter.
# Copie en ligne : Maths/espace-eleve/dnl/S1-L1-number-bingo.py (onglet DNL de l'espace prof).
from random import randint, random

UNITS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
TEENS = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
         "sixteen", "seventeen", "eighteen", "nineteen"]
TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]

PROBA_PIEGE = 0.6   # probabilité de tirer le "jumeau" juste après un nombre piège


def in_words(n):
    """Écriture en anglais d'un entier entre 10 et 99 (avec trait d'union : forty-two)."""
    if n < 20:
        return TEENS[n - 10]
    d, u = n // 10, n % 10
    if u == 0:
        return TENS[d]
    return TENS[d] + "-" + UNITS[u]


def jumeau(n):
    """Partenaire piège : 13 <-> 30, 14 <-> 40, ..., 19 <-> 90 (None sinon)."""
    if 13 <= n <= 19:
        return (n - 10) * 10
    if n % 10 == 0 and 30 <= n <= 90:
        return n // 10 + 10
    return None


def tirer(restants, dernier):
    """Tire un nombre parmi les restants, en favorisant le jumeau du dernier tiré."""
    j = jumeau(dernier) if dernier is not None else None
    if j in restants and random() < PROBA_PIEGE:
        return j
    return restants[randint(0, len(restants) - 1)]


def verifier(tires):
    """Demande les nombres du gagnant et indique ceux qui n'ont pas été tirés."""
    saisie = input("  Numbers of the winner (e.g. 14 50 72): ")
    nombres = [int(x) for x in saisie.replace(",", " ").split() if x.isdigit()]
    absents = [n for n in nombres if n not in tires]
    if nombres and not absents:
        print("  -> Bingo! All these numbers have been called.")
    else:
        print("  -> Not called:", ", ".join(str(n) for n in absents) or "(nothing typed)")


# Partie interactive (Thonny, EduPython...). La page DNL de l'espace prof importe seulement
# les fonctions ci-dessus et remplace input() par des boutons.
if __name__ == "__main__":
    restants = list(range(11, 100))
    tires = []
    dernier = None
    print("NUMBER BINGO - press Enter to draw a number (c = check, l = list, q = quit)\n")

    while restants:
        choix = input("> ").strip().lower()
        if choix == "q":
            break
        if choix == "c":
            verifier(tires)
            continue
        if choix == "l":
            print("  Called so far:", ", ".join(str(n) for n in sorted(tires)))
            continue
        n = tirer(restants, dernier)
        restants.remove(n)
        tires.append(n)
        dernier = n
        remarque = ""
        if jumeau(n) is not None:
            remarque = "   (trap! not " + in_words(jumeau(n)) + ")"
        print(f"  {len(tires):2d}.  {n}  ->  {in_words(n)}{remarque}")

    print("\nCalled:", ", ".join(str(n) for n in tires))
