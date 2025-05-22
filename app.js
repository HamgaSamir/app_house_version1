

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { requireLogin } = require('./middlewares/auth');
const db = require('./database'); // Chemin vers le fichier où tu as créé la connexion


const app = express();

const engine = require('ejs-mate'); // Ajout du moteur
const expressLayouts = require('express-ejs-layouts');
const { requireRole } = require('./middlewares/auth');
app.use(session({
  secret: 'rayane2009+',
  resave: false,
  saveUninitialized: false
}));

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const dashboardRoutes = require('./routes/dashboard'); // chemin correct


// Middleware global pour exposer la session à toutes les vues
app.use((req, res, next) => {
  res.locals.session = req.session || null;
  next();
});



const messagesRoutes = require('./routes/messages');
app.use('/', messagesRoutes); // ou app.use('/messages', messagesRoutes);


app.use('/', dashboardRoutes); // ✅ Important pour activer les routes de dashboard.js

// ✨ Permet de lire les données de formulaires (req.body)
app.use(express.urlencoded({ extended: true }));

// Pour analyser les données JSON (si besoin plus tard)
app.use(express.json());

app.set('view engine', 'ejs');
app.use(expressLayouts);

// Indiquer le layout par défaut
app.set('layout', 'layout'); // utilise views/layout.ejs


const bookingRoutes = require('./routes/bookings');
app.use('/', bookingRoutes);



const slotRoutes = require('./routes/slots');
app.use('/slots', slotRoutes); // Utilise /slots comme préfixe

app.engine('ejs', engine); // Déclare le moteur

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: "Une erreur interne est survenue." });
});



// Middlewares globaux
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(bodyParser.urlencoded({ extended: false }));



// Injecter la session dans les vues
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Routes
app.use('/', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/slots', require('./routes/slots'));
app.use('/messages', require('./routes/messages'));
app.use('/api', require('./routes/api'));


app.get('/', (req, res) => {
  res.redirect('/login'); // ou res.render('accueil'); si tu as une page d'accueil
});


// Lancement
app.listen(3000, () => console.log('✅ Serveur lancé sur http://localhost:3000'));
