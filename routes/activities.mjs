// On importe le module Express
import express from "express";

// On importe la connexion à la base de données (db-activities.mjs)
import { db } from "../db/db-activities.mjs";

// On crée un routeur Express pour gérer toutes les routes liées aux activités
const activitiesRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Gestion des activités
 */

// =====================================================================
// ROUTE GET /api/activities
// Récupère toutes les activités OU filtre selon un mot clé + limite optionnelle
// =====================================================================
/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Récupère toutes les activités
 *     description: Retourne toutes les activités ou filtrées par nom et limitées par un paramètre 'limit'.
 *     tags: [Activities]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrer les activités par nom (au moins 3 caractères)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limiter le nombre de résultats
 *     responses:
 *       200:
 *         description: Liste des activités trouvées
 *       400:
 *         description: La chaîne de caractères recherchée doit contenir au moins 3 caractères
 *       500:
 *         description: Erreur serveur
 */
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
/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Crée une nouvelle activité
 *     tags: [Activities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - dateDebut
 *               - durée
 *             properties:
 *               nom:
 *                 type: string
 *               dateDebut:
 *                 type: string
 *               durée:
 *                 type: string
 *     responses:
 *       201:
 *         description: Activité créée avec succès
 *       400:
 *         description: Champs manquants
 *       500:
 *         description: Erreur serveur
 */
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
/**
 * @swagger
 * /api/activities/{id}:
 *   put:
 *     summary: Met à jour une activité
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l’activité à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - dateDebut
 *               - durée
 *             properties:
 *               nom:
 *                 type: string
 *               dateDebut:
 *                 type: string
 *               durée:
 *                 type: string
 *     responses:
 *       200:
 *         description: Activité mise à jour
 *       400:
 *         description: ID invalide ou champs manquants
 *       404:
 *         description: Activité non trouvée
 */
activitiesRouter.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nom, dateDebut, durée } = req.body;

        if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });
        if (!nom || !dateDebut || !durée) return res.status(400).json({
            error: "Les champs 'nom', 'dateDebut' et 'durée' sont requis pour la mise à jour."
        });

        const affectedRows = await db.updateActivities(id, { nom, dateDebut, durée });
        if (affectedRows === 0) return res.status(404).json({ error: "Activité non trouvée pour la mise à jour." });

        const activityUpdated = await db.getActivitiesById(id);
        res.json({ message: 'Activité mise à jour', activity: activityUpdated });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour de l'activité." });
    }
});

// =====================================================================
// ROUTE DELETE /api/activities/:id
// Supprime une activité selon son ID
// =====================================================================
/**
 * @swagger
 * /api/activities/{id}:
 *   delete:
 *     summary: Supprime une activité
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l’activité à supprimer
 *     responses:
 *       200:
 *         description: Activité supprimée
 *       400:
 *         description: ID invalide
 *       404:
 *         description: Activité non trouvée
 */
activitiesRouter.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

        const result = await db.deleteActivities(id);
        if (result.success) res.json({ message: 'Activité supprimée' });
        else res.status(404).json({ error: "Activité non trouvée pour la suppression." });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur lors de la suppression de l'activité." });
    }
});

// =====================================================================
// On exporte le routeur pour pouvoir l’utiliser dans d’autres fichiers
// =====================================================================
export default activitiesRouter;
