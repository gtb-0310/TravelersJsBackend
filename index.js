require('dotenv').config();

const express = require('express'),
    //customCorsMiddleware = require('./middlewares/corsMiddleware'),
    connectToDB = require('./config/db'),
    messages = require('./utils/messages'),
    swaggerUi = require('swagger-ui-express'),
    swaggerJsdoc = require('swagger-jsdoc'),
    limiter = require('./middlewares/rateLimitRequest'),
    xssClean = require('xss-clean'),
    helmet = require('helmet'),
    app = express(),
    sanitizeInputs = require('./middlewares/sanitizeInputs'),
    getLanguageFromHeaders = require('./utils/languageUtils');



// Connexion à la base de données
connectToDB();

app.use((req, res, next) => {
    for (let key in req.headers) {
        if (/\n|\r/.test(req.headers[key])) {
            delete req.headers[key];
        }
    }
    next();
});

app.get('/translations', (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const translations = messages[lang] || messages['en'];
    res.json(translations);
});

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
//app.use(customCorsMiddleware);
app.use(express.json());

// Importation des fichiers de routes
const blockedUserRoutes = require('./routes/blockedUser.routes');
const countryRoutes = require('./routes/country.routes');
const groupRoutes = require('./routes/group.routes');
const authRoutes = require('./routes/auth.routes');
const groupJoinRoutes = require('./routes/groupJoinRequest.routes');
const groupMessageRoutes = require('./routes/groupMessage.routes');
const groupConversationRoutes = require('./routes/groupConversation.routes');
const interestRoutes = require('./routes/interest.routes');
const languagesRoutes = require('./routes/language.routes');
const privateMessagesRoutes = require('./routes/privateMessage.routes');
const privateConversationsRoutes = require('./routes/privateConversation.routes');
const reportedUsersRoutes = require('./routes/reportedUser.routes');
const transportRoutes = require('./routes/transport.routes');
const tripTypesRoutes = require('./routes/tripType.routes');
const tripRoutes = require('./routes/trip.routes');
const usersRoutes = require('./routes/user.routes');

// Utilisation de routes
app.use('/private-conversations', privateConversationsRoutes);
app.use('/group-conversations', groupConversationRoutes);
app.use('/private-messages', privateMessagesRoutes);
app.use('/reported-users', reportedUsersRoutes);
app.use('/group-messages', groupMessageRoutes);
app.use('/blocked-users', blockedUserRoutes);
app.use('/transports', transportRoutes);
app.use('/group-join', groupJoinRoutes);
app.use('/tripTypes', tripTypesRoutes);
app.use('/languages', languagesRoutes);
app.use('/interests', interestRoutes);
app.use('/countries', countryRoutes);
app.use('/groups', groupRoutes);
app.use('/users', usersRoutes);
app.use('/trips', tripRoutes);
app.use('/auth', authRoutes);
app.use(limiter);
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'nonce-randomString'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: [],
            },
        },
        referrerPolicy: { policy: "no-referrer" },
        frameguard: { action: "deny" },
        xssFilter: true,
        hidePoweredBy: true,
        dnsPrefetchControl: { allow: false },
        noSniff: true,
        hsts: process.env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    })
);
app.use(xssClean());
app.use(sanitizeInputs);


// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
