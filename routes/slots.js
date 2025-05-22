const express = require('express');
const router = express.Router();
const db = require('../database'); // Chemin vers le fichier où tu as créé la connexion
const { requireRole } = require('../middlewares/auth');

// Affichage du formulaire (GET)
router.get('/create', requireRole('enseignant'), (req, res) => {
  res.render('create_slot', {
    session: req.session,
    title: "Créer un créneau"
  });
});

// Enregistrement du créneau (POST)
router.post('/create', requireRole('enseignant'), (req, res) => {
  const { date, time } = req.body;
  const teacherId = req.session.userId;

  

   if (!date || !time) {
    return res.render('error', { title: "Erreur", message: "Tous les champs sont obligatoires." });
   }
  db.run(
    `INSERT INTO slots (teacher_id, date, time) VALUES (?, ?,?)`,
    [teacherId, date,time],
    function (err) {
      if (err) {
        console.error("Erreur création créneau :", err);
        return res.render('error', { message: "Erreur lors de la création du créneau." });
      }
      res.redirect('/dashboard');
    }
  );
});

module.exports = router;
