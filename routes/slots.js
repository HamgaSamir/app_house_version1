const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireRole } = require('../middlewares/auth');

// GET : Afficher le formulaire de création de créneau
router.get('/create', requireRole('enseignant'), (req, res) => {
  res.render('create_slot', {
    session: req.session,
    title: "Créer un créneau"
  });
});

// POST : Enregistrement d'un nouveau créneau
router.post('/create', requireRole('enseignant'), (req, res) => {
  const { date, time } = req.body;
  const teacherId = req.session.userId;

  if (!date || !time) {
    return res.render('error', {
      title: "Erreur",
      message: "Tous les champs sont obligatoires."
    });
  }

  const sql = `INSERT INTO slots (teacher_id, date, time, available) VALUES (?, ?, ?, 1)`;

  db.query(sql, [teacherId, date, time], (err, result) => {
    if (err) {
      console.error("Erreur lors de la création du créneau :", err);
      return res.render('error', {
        title: "Erreur",
        message: "Erreur lors de la création du créneau."
      });
    }

    res.redirect('/dashboard');
  });
});

module.exports = router;
