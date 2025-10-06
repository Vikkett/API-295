// On importe le module 'mysql2/promise' pour gérer MySQL avec la syntaxe async/await
import mysql from 'mysql2/promise';

// On crée un objet 'db' qui regroupera toutes les fonctions de manipulation de la base de données
const db = {

    // =====================================================================
    // Connexion à la base de données
    // =====================================================================
    connectToDatabase: async () => {
        // On crée une connexion unique à la base de données MySQL
        const con = await mysql.createConnection({
            host: 'localhost',     // Adresse du serveur MySQL
            user: 'root',          // Nom d’utilisateur MySQL
            password: 'alan',      // Mot de passe MySQL
            database: 'app_activities', // Nom de la base de données utilisée
        });
        // On retourne la connexion pour pouvoir exécuter des requêtes
        return con;
    },

    // =====================================================================
    // Déconnexion propre de la base de données
    // =====================================================================
    disconnectFromDatabase: async (con) => {
        try {
            // On ferme la connexion
            await con.end();
        } catch (error) {
            // Si une erreur survient lors de la fermeture, on l’affiche
            console.error('Erreur lors de la déconnexion:', error);
        }
    },

    // =====================================================================
    // Récupérer toutes les activités (READ - GET ALL)
    // =====================================================================
    getAllActivities: async () => {
        let con;
        try {
            // On établit la connexion
            con = await db.connectToDatabase();

            // On exécute la requête SQL pour récupérer toutes les activités
            const [rows] = await con.query('SELECT * FROM activities');

            // On retourne les résultats
            return rows;
        } catch (error) {
            // En cas d’erreur, on l’affiche et on la relance
            console.error(error);
            throw error;
        } finally {
            // On s’assure de fermer la connexion dans tous les cas
            if (con) await db.disconnectFromDatabase(con);
        }
    },

    // =====================================================================
    // Récupérer une activité par son ID (READ - GET ONE)
    // =====================================================================
    getActivitiesById: async (id) => {
        let con;
        try {
            // On établit la connexion
            con = await db.connectToDatabase();

            // On exécute une requête paramétrée (sécurisée) pour trouver une activité par ID
            const [rows] = await con.query('SELECT * FROM activities WHERE id = ?', [id]);

            // On retourne le premier élément (ou undefined si aucun résultat)
            return rows[0];
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            // Fermeture de la connexion
            if (con) await db.disconnectFromDatabase(con);
        }
    },

    // =====================================================================
    // Créer une nouvelle activité (CREATE)
    // =====================================================================
    createActivities: async ({ nom, dateDebut, duree }) => {
        let con;
        try {
            // On établit la connexion
            con = await db.connectToDatabase();

            // On exécute la requête SQL d’insertion avec des paramètres sécurisés
            const [result] = await con.query(
                'INSERT INTO activities (nom, dateDebut, duree) VALUES (?, ?, ?)',
                [nom, dateDebut, duree]
            );

            // On retourne l’objet représentant la nouvelle activité créée
            return { id: result.insertId, nom, dateDebut, duree };
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            // Fermeture de la connexion
            if (con) await db.disconnectFromDatabase(con);
        }
    },

    // =====================================================================
    // Mettre à jour une activité existante (UPDATE)
    // =====================================================================
    updateActivities: async (id, { nom, dateDebut, duree }) => {
        let con;
        try {
            // On établit la connexion
            con = await db.connectToDatabase();

            // Requête SQL pour mettre à jour l’activité correspondant à l’ID donné
            const [result] = await con.query(
                `UPDATE activities
                 SET nom = ?,
                     dateDebut = ?,
                     duree = ?
                 WHERE id = ?`,
                [nom, dateDebut, duree, id]
            );

            // On retourne le nombre de lignes affectées (0 si aucune mise à jour)
            return result.affectedRows;
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            // Fermeture de la connexion
            if (con) await db.disconnectFromDatabase(con);
        }
    },

    // =====================================================================
    // Supprimer une activité par son ID (DELETE)
    // =====================================================================
    deleteActivities: async (id) => {
        let con;
        try {
            // On établit la connexion
            con = await db.connectToDatabase();

            // On exécute une requête SQL DELETE avec un paramètre pour l’ID
            const [result] = await con.query('DELETE FROM activities WHERE id = ?', [id]);

            // Si au moins une ligne a été supprimée, on retourne un succès
            if (result.affectedRows > 0) {
                return { success: true };
            } else {
                // Sinon, on indique que l’activité n’a pas été trouvée
                return { success: false, message: 'Activité non trouvée.' };
            }
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            // Fermeture de la connexion
            if (con) await db.disconnectFromDatabase(con);
        }
    },

    // =====================================================================
    // Rechercher des activités par nom (SEARCH)
    // =====================================================================
    searchActivitiesByName: async (name) => {
        let con;
        try {
            // On établit la connexion
            con = await db.connectToDatabase();

            // On construit le motif de recherche pour le mot-clé fourni
            const searchPattern = `%${name}%`;

            // On exécute une requête SQL avec LIKE pour rechercher dans le champ 'nom'
            const [rows] = await con.query(
                'SELECT * FROM activities WHERE nom LIKE ?',
                [searchPattern]
            );

            // On retourne les résultats correspondants
            return rows;
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            // Fermeture de la connexion
            if (con) await db.disconnectFromDatabase(con);
        }
    }
}

// On exporte l’objet 'db' pour pouvoir l’utiliser dans d’autres fichiers (comme activitiesRouter)
export { db }
