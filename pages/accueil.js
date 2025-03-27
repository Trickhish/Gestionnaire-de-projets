
function accueil_load() {
    var cards = document.querySelectorAll("section#accueil .card");
    console.log(cards);
    setCardContent(cards[0], "Chiffre d'affaire de l'année en cours", "//");
    setCardContent(cards[1], "Bénéfice de l'année en cours", "//");
    setCardContent(cards[2], "Titre", "//");
}