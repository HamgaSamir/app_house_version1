const jwt = require('jsonwebtoken');
const SECRET_KEY = 'rayane2009++'; // Remplace par une clé plus sécurisée

function authenticateJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant.' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide.' });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateJWT, SECRET_KEY };
