const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');


function checkOwnerProfil(req, res, next) {
    const lang = getLanguageFromHeaders(req) || 'en';
    const userIdFromToken = req.user.id;
    const userIdToDelete = req.params.id;
    
    
    if (userIdFromToken !== userIdToDelete) {
        return res.status(403).json({ message: messages[lang].NOT_ALLOWED_TO_DELETE_OTHER_PROFILE });
    }

    next();
}

module.exports = checkOwnerProfil;
