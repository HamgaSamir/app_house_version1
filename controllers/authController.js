const bcrypt = require('bcrypt');
const db = require('../database');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../middlewares/jwt');

// Afficher le formulaire de connexion
exports.showLogin = (req, res) => {
  res.render('login', {
    title: "Connexion",
    error: null
  });
};

// Traitement de la connexion
exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error("Erreur DB :", err);
      return res.render('login', { error: "Erreur interne." });
    }

    if (results.length === 0) {
      return res.render('login', {
        error: "Cet utilisateur n'existe pas. Merci de créer un compte en cliquant sur Inscription."
      });
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', { error: "Mot de passe incorrect." });
    }

    // Authentification réussie
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.nom = user.name;
    req.session.email = user.email;

    res.redirect('/dashboard');
  });
};

// Afficher le formulaire d'inscription
exports.showRegister = (req, res) => {
  res.render('register', { error: null });
};

// Traitement de l'inscription
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error("Erreur SQL vérification email :", err);
      return res.render('register', { error: "Erreur serveur." });
    }

    if (results.length > 0) {
      return res.render('register', { error: "Cet email est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role],
      (err, result) => {
        if (err) {
          console.error("Erreur SQL inscription :", err);
          return res.render('register', { error: "Erreur d'inscription." });
        }

        res.redirect('/login');
      }
    );
  });
};

// Déconnexion
exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
