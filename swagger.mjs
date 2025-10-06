// swagger.js
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Configuration Swagger
const options = {
    definition: {
        openapi: '3.0.0', // version d’OpenAPI utilisée
        info: {
            title: 'API des Activités', // titre affiché dans la doc
            version: '1.0.0', // version de ton API
            description: 'Documentation de l’API des activités', // petite description
        },
    },
    // chemin vers les fichiers où Swagger doit chercher les commentaires @swagger
    apis: ['./routes/*.mjs'],
};

// Génère la spécification Swagger à partir des options
const swaggerSpec = swaggerJSDoc(options);

// Export pour l’utiliser dans server.js (ou app.js)
export { swaggerUi, swaggerSpec };
