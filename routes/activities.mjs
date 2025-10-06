// On importe le module Express
import express from "express";

// On importe la connexion à la base de données (db-activities.mjs)
import { db } from "../db/db-activities.mjs";

// Si besoin, on peut importer une fonction utilitaire (par exemple pour valider les IDs)
// import { isValidId } from "../helper.mjs";

// On crée un routeur Express pour gérer toutes les routes liées aux activités
const activitiesRouter = express.Router();


// =====================================================================
// ROUTE GET /api/activities
// Récupère toutes les activités OU filtre selon un mot clé + limite optionnelle
// =====================================================================
activitiesRouter.get("/", async (req, res) => {
    try {
        // On récupère le paramètre de recherche "name" dans l’URL (ex: ?name=ski)
        const nameFilter = req.query.name;

        // On récupère le paramètre de limitation "limit" (ex: ?limit=5)
        const limit = parseInt(req.query.limit);

        // Variable qui contiendra la liste des activités
        let activities;

        // Si un mot clé est fourni dans l’URL
        if (nameFilter) {
            // On vérifie que le mot contient au moins 3 caractères
            if (nameFilter.length < 3) {
                return res.status(400).json({
                    error: "La chaîne de caractères recherchée doit contenir au moins 3 caractères."
                });
            }

            // Si le mot est valide, on recherche dans la BDD les activités dont le nom contient ce mot
            activities = await db.searchActivitiesByName(nameFilter);
        } else {
            // Si aucun mot clé n’est fourni, on récupère toutes les activités
            activities = await db.getAllActivities();
        }

        // Si un paramètre 'limit' est présent, on limite le nombre de résultats
        if (!isNaN(limit) && limit > 0) {
            activities = activities.slice(0, limit);
        }

        // On renvoie les activités sous forme de JSON
        res.json({ activities });
    } catch (error) {
        // Si une erreur se produit, on renvoie un message d’erreur 500 (erreur serveur)
        console.error(error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des activités." });
    }
});


// =====================================================================
// ROUTE POST /api/activities
// Permet d’ajouter une nouvelle activité
// =====================================================================
activitiesRouter.post("/", async (req, res) => {
    try {
        // On récupère les données envoyées dans le corps de la requête
        const { nom, dateDebut, durée } = req.body;

        // Vérification que tous les champs requis sont présents
        if (!nom || !dateDebut || !durée) {
            return res.status(400).json({
                error: "Les champs 'nom', 'dateDebut' et 'durée' sont requis."
            });
        }

        // On enregistre la nouvelle activité dans la BDD
        const newActivity = await db.createActivities({ nom, dateDebut, durée });

        // Message de confirmation
        const message = `L'événement ${newActivity.nom} a bien été créé !`;

        // On renvoie la nouvelle activité et un code 201 (création réussie)
        res.status(201).json({ message: message, activity: newActivity });
    } catch (error) {
        // Si une erreur survient, on renvoie une erreur 500
        res.status(500).json({ error: "Erreur serveur lors de la création de l'activité." });
    }
});


// =====================================================================
// ROUTE PUT /api/activities/:id
// Permet de modifier une activité existante
// =====================================================================
activitiesRouter.put('/:id', async (req, res) => {
    try {
        // On récupère l’ID de l’activité à modifier dans l’URL
        const id = parseInt(req.params.id);

        // On récupère les nouvelles données dans le corps de la requête
        const { nom, dateDebut, durée } = req.body;

        // Vérification que l’ID est bien un nombre
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        // Vérification que les champs requis sont présents
        if (!nom || !dateDebut || !durée) {
            return res.status(400).json({
                error: "Les champs 'nom', 'dateDebut' et 'durée' sont requis pour la mise à jour."
            });
        }

        // On met à jour l’activité dans la base de données
        const affectedRows = await db.updateActivities(id, { nom, dateDebut, durée });

        // Si aucune ligne n’a été modifiée, l’activité n’existe pas
        if (affectedRows === 0) {
            return res.status(404).json({ error: "Activité non trouvée pour la mise à jour." });
        }

        // On récupère l’activité mise à jour pour la renvoyer
        const activityUpdated = await db.getActivitiesById(id);

        // On renvoie un message de confirmation + l’objet mis à jour
        res.json({ message: 'Activité mise à jour', activity: activityUpdated });
    } catch (error) {
        // En cas d’erreur serveur
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour de l'activité." });
    }
});


// =====================================================================
// ROUTE DELETE /api/activities/:id
// Supprime une activité selon son ID
// =====================================================================
activitiesRouter.delete('/:id', async (req, res) => {
    try {
        // On récupère l’ID à supprimer depuis l’URL
        const id = parseInt(req.params.id);

        // On vérifie que l’ID est bien un nombre
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        // On appelle la méthode deleteActivities pour supprimer l’activité
        const result = await db.deleteActivities(id);

        // Si la suppression a réussi
        if (result.success) {
            res.json({ message: 'Activité supprimée' });
        } else {
            // Si l’activité n’existe pas
            res.status(404).json({ error: "Activité non trouvée pour la suppression." });
        }
    } catch (error) {
        // En cas d’erreur serveur
        res.status(500).json({ error: "Erreur serveur lors de la suppression de l'activité." });
    }
});


// =====================================================================
// On exporte le routeur pour pouvoir l’utiliser dans d’autres fichiers
// =====================================================================
export default activitiesRouter;
