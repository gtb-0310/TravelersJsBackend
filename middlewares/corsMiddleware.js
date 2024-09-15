const allowedOrigins = ['http://localhost:3000', 'https://adresse-front-travelers'];
const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];

const customCorsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;  // Récupérer l'origine de la requête
  const method = req.method;  // Récupérer la méthode HTTP utilisée

  console.log('Origine de la requête:', origin);
  console.log('Méthode de la requête:', method);

  // Si l'origine est absente (undefined), on permet l'accès (par exemple pour les requêtes simples ou locales)
  if (!origin) {
    console.log('Origine absente, requête locale ou simple');
    res.setHeader('Access-Control-Allow-Origin', '*');  // Permettre l'accès à toutes les origines si non spécifiée
  }
  // Vérifier si l'origine est dans la liste des origines autorisées
  else if (allowedOrigins.includes(origin)) {
    console.log('Origine autorisée:', origin);  // Log si l'origine est autorisée
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    console.log('Origine non autorisée:', origin);  // Log si l'origine n'est pas autorisée
    return res.status(403).json({ message: 'Origine non autorisée' });
  }

  // Autoriser les méthodes spécifiées
  res.setHeader('Access-Control-Allow-Methods', allowedMethods.join(','));

  // Autoriser les headers nécessaires, y compris Authorization
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Gérer les requêtes préliminaires (OPTIONS)
  if (method === 'OPTIONS') {
    console.log('Requête OPTIONS interceptée');
    return res.sendStatus(204);  // Répondre directement pour les requêtes OPTIONS
  }

  // Passer au middleware suivant
  next();
};

module.exports = customCorsMiddleware;
