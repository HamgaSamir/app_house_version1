function requireLogin(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.session && req.session.role === role) {
      next();
    } else {
      res.status(403).send('Accès refusé.');
    }
  };
}

module.exports = {
  requireLogin,
  requireRole
};
