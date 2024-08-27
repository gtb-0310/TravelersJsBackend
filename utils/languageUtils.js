const getLanguageFromHeaders = (req) => {
    return req.headers['accept-language']?.split(',')[0].split('-')[0];
};

module.exports = getLanguageFromHeaders;