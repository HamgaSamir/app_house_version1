const bcrypt = require('bcrypt');
const db = require('../database'); // Chemin vers le fichier où tu as créé la connexion
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../middlewares/jwt');

exports.showLogin = (req, res) => {
  res.render('login');
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error("Erreur DB :", err);
      return res.render('login', { error: "Erreur interne." });
    }

    if (!user) {
      console.log("Utilisateur non trouvé pour :", email);
      return res.render('login', { error: "Utilisateur introuvable." });
    }

    // Si mot de passe en clair
    if (user.password !== password) {
      return res.render('login', { error: "Mot de passe incorrect." });
    }

    // Si mot de passe haché avec bcrypt :
    // if (!bcrypt.compareSync(password, user.password)) {
    //   return res.render('login', { error: "Mot de passe incorrect." });
    // }

    // Authentification réussie : on enregistre la session
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.nom = user.nom;
    req.session.email =user.email,

    res.redirect('/dashboard');
  });
};



// Affiche le formulaire d’inscription
exports.showRegister = (req, res) => {
  res.render('register', { error: null }); // <-- On fournit toujours 'error'
};


exports.register = (req, res) => {
  const { name, email, password, role } = req.body;

  // Étape 1 : vérifier si l'email existe déjà
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error("❌ Erreur SQL lors de la vérification de l'email :", err);
      return res.render('register', { error: "Erreur serveur." });
    }

    if (user) {
      console.warn("❗ Email déjà utilisé :", email);
      return res.render('register', { error: "Cet email est déjà utilisé." });
    }

    // Étape 2 : insérer le nouvel utilisateur
    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role],
      function (err) {
        if (err) {
          console.error("❌ Erreur SQL à l'inscription :", err.message);
          return res.render('register', { error: "Erreur d'inscription." });
        }

        console.log("✅ Inscription réussie pour :", email);
        return res.redirect('/login');
      }
    );
  });
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
