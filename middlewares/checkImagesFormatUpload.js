const multer = require('multer');
const fs = require('fs');
const getLanguageFromHeaders = require('../utils/languageUtils');
const messages = require('../utils/messages');


const fileFilter = (req, file, cb) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(messages[lang].INVALID_FILE_TYPE));
    }
};


const upload = multer({
    dest: 'uploads/',
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});


const deleteTemporaryFile = (req, res, next) => {
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error(messages[lang].FAILED_DELETE_TEMP_FILE, err);
            }
        });
    }
    next();
};

module.exports = { upload, deleteTemporaryFile };
