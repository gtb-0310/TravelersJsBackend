const allowedOrigins = ['http://localhost:3000', 'https://adresse-front-travelers'];
const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];

const customCorsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  const method = req.method;
  
  if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  
  else if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    return res.status(403).json({ message: 'Origine non autorisée' });
  }

  
  res.setHeader('Access-Control-Allow-Methods', allowedMethods.join(','));

  
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  
  if (method === 'OPTIONS') {
    return res.sendStatus(204); 
  }


  next();
};

module.exports = customCorsMiddleware;
