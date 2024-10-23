/*
const mongoSanitize = require('mongo-sanitize');


const sanitizeInputs = (req, res, next) => {
    if (req.body) {
        req.body = mongoSanitize(req.body);
    }

    if (req.query) {
        req.query = mongoSanitize(req.query);
    }

    if (req.params) {
        req.params = mongoSanitize(req.params);
    }

    next();
};

module.exports = sanitizeInputs;
*/
const mongoSanitize = require('mongo-sanitize');

const sanitizeString = (str) => {
    if (typeof str === 'string') {
        return str
            .replace(/"/g, '\\"')  // Échapper les guillemets doubles
            .replace(/'/g, "\\'")  // Échapper les guillemets simples
            .replace(/</g, "&lt;") // Échapper les chevrons pour éviter le HTML injection
            .replace(/>/g, "&gt;"); // Échapper les chevrons pour éviter le HTML injection
    }
    return str;
};

const sanitizeInputs = (req, res, next) => {
    const sanitizeObject = (obj) => {
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitizeObject(obj[key]); // Nettoyer récursivement les objets
            } else {
                obj[key] = sanitizeString(mongoSanitize(obj[key]));
            }
        });
    };

    if (req.body) {
        sanitizeObject(req.body);
    }

    if (req.query) {
        sanitizeObject(req.query);
    }

    if (req.params) {
        sanitizeObject(req.params);
    }

    next();
};

module.exports = sanitizeInputs;
