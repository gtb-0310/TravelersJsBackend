require('dotenv').config();

const express = require('express'),
    connectToDB = require('./config/db'),
    swaggerUi = require('swagger-ui-express'),
    swaggerJsdoc = require('swagger-jsdoc'),
    limiter = require('./middlewares/rateLimitRequest'),
    xssClean = require('xss-clean'),
    helmet = require('helmet'),
    app = express();


// Connexion à la base de données
connectToDB();

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'Documentation de l\'API Travelers',
        },
        servers: [
            {
                url: 'http://localhost:3000', 
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./routes/*.js'],
};


const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)); 

// Middlewares
app.use(express.json());

// Importation des fichiers de routes
const blockedUserRoutes = require('./routes/blockedUser.routes');
const countryRoutes = require('./routes/country.routes');
const groupRoutes = require('./routes/group.routes');
const authRoutes = require('./routes/auth.routes');
const groupJoinRoutes = require('./routes/groupJoinRequest.routes');
const groupMessageRoutes = require('./routes/groupMessage.routes');
const interestRoutes = require('./routes/interest.routes');
const languagesRoutes = require('./routes/language.routes');

// Utilisation de routes
app.use('/group-messages', groupMessageRoutes);
app.use('/blocked-users', blockedUserRoutes);
app.use('/group-join', groupJoinRoutes);
app.use('/languages', languagesRoutes);
app.use('/interests', interestRoutes);
app.use('/countries', countryRoutes);
app.use('/groups', groupRoutes);
app.use('/auth', authRoutes);
app.use(limiter);
app.use(helmet());
app.use(xssClean());

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
