const rateLimit = require('express-rate-limit'),
    messages = require('../utils/messages'),
    getLanguageFromHeaders = require('../utils/languageUtils');

function getRateLimitMessage(req) {
    const lang = getLanguageFromHeaders(req) || 'en';
    return messages[lang].TOO_MANY_REQUESTS;
}


const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 1000,
    message: (req, res) => {
      return getRateLimitMessage(req);
    },
    headers: true,
  });
  
  module.exports = limiter;
