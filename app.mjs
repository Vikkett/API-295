// On importe le module Express, qui permet de créer un serveur web avec Node.js
import express from 'express';

// On importe le routeur des activités (fichier séparé contenant toutes les routes CRUD)
import activitiesRouter from "./routes/activities.mjs";

// ======================
// Partie Swagger
// ======================

// On importe Swagger JSDoc pour générer la documentation à partir des commentaires dans le code
import swaggerJSDoc from 'swagger-jsdoc';

// On importe Swagger UI Express pour afficher la documentation interactive dans le navigateur
import swaggerUi from 'swagger-ui-express';

// Définition des options de Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0', // Version OpenAPI
        info: {
            title: 'API des Activités', // Titre de la documentation
            version: '1.0.0',           // Version de l'API
            description: 'Géneration des activités, utilisaion de get, post, put et delete', // Description
        },
    },
    // Chemin vers les fichiers où Swagger va chercher les commentaires
    apis: ['./routes/*.mjs'],
};

// Génération de la spécification Swagger
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// ======================
// Partie Express
// ======================

// On crée une application Express (le cœur du serveur)
const app = express();

// On définit le port d'écoute : on prend celui défini dans les variables d'environnement, sinon 3000
const port = process.env.PORT || 3000;

// On indique à Express qu'il doit comprendre les corps de requêtes au format JSON
app.use(express.json());

// Middleware pour afficher la documentation Swagger à l’URL /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// On crée une route GET pour la racine du serveur (http://localhost:3000/)
app.get('/', (req, res) => {
    // Lorsqu’un utilisateur visite la racine, il est redirigé vers /api/activities
    res.redirect('/api/activities')
});

// On indique à Express d’utiliser le routeur "activitiesRouter" pour toutes les routes commençant par /api/activities
app.use('/api/activities', activitiesRouter);

// Middleware pour gérer les routes non trouvées (erreur 404)
app.use(({ res }) => {
    // Message d'erreur si la ressource demandée n’existe pas
    const message =
        "Impossible de trouver la ressource demandée ! Vous pouvez essayer une autre URL.";
    // On renvoie une réponse 404 (non trouvé) en JSON
    res.status(404).json(message);
});

// On démarre le serveur et on le fait écouter sur le port défini
app.listen(port, () => {
    // Message affiché dans la console lorsque le serveur démarre correctement
    console.log(`Express server listening at http://localhost:${port}`);
    // Message indiquant où accéder à la documentation Swagger
    console.log(`Documentation Swagger disponible sur http://localhost:${port}/api-docs`);
});
