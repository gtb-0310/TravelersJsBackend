const jwt = require('jsonwebtoken');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];


    if (!token) {
        const lang = getLanguageFromHeaders(req) || 'en';
        return res.status(401).json({ message: messages[lang].CONNECTION_REQUIRED });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            const lang = getLanguageFromHeaders(req) || 'en';
            return res.status(403).json({ message: messages[lang].SESSION_EXPIRED });
        }

        req.user = user;
        next();
    });
};

module.exports = authenticateToken;