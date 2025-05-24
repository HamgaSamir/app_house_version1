function requireLogin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

function requireRole(role) {
  return function (req, res, next) {
    if (!req.session || !req.session.userId) {
      return res.redirect('/login');
    }
    if (req.session.role !== role) {
      return res.status(403).send('Accès refusé');
    }
    next();
  };
}

module.exports = {
  requireLogin,
  requireRole
};
