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
