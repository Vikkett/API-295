// On crée un tableau nommé 'activities' qui contiendra toutes nos activités
let activities  = [

    // Première activité : football
    {
        // Identifiant unique de l’activité
        id: 1,

        // Nom de l’activité
        nom: "foot",

        // Date de début de l’activité
        dateDebut: "2025-04-06",

        // Durée de l’activité
        durée: "1h30"
    },

    // Deuxième activité : volley-ball
    {
        id: 2,
        nom: "volley",
        dateDebut: "2024-11-06",
        durée: "4h"
    },

    // Troisième activité : course automobile
    {
        id: 3,
        nom: "racing",
        dateDebut: "2025-03-06",
        durée: "3h"
    }
];

// On exporte le tableau 'activities' pour qu’il puisse être importé dans d’autres fichiers
export default activities;
