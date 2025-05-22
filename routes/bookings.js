const express = require('express');
const router = express.Router();
const db = require('../database'); // Chemin vers le fichier où tu as créé la connexion
const { requireRole } = require('../middlewares/auth');

// Annuler une réservation par l’étudiant
router.post('/cancel-booking/:id', requireRole('etudiant'), (req, res) => {
  const bookingId = req.params.id;
  const userId = req.session.userId;

  // Vérifier que la réservation appartient bien à l’étudiant connecté
  db.get('SELECT * FROM bookings WHERE id = ? AND student_id = ?', [bookingId, userId], (err, booking) => {
    if (err) return res.status(500).send("Erreur serveur");
    if (!booking) return res.status(403).send("Réservation non trouvée ou accès refusé");

    // Supprimer la réservation
    db.run('DELETE FROM bookings WHERE id = ?', [bookingId], function(err) {
      if (err) return res.status(500).send("Erreur lors de l'annulation");
      res.redirect('/dashboard');  // Retour au dashboard
    });
  });
});


// Rejeter une réservation par l’enseignant
router.post('/reject-booking/:id', requireRole('enseignant'), (req, res) => {
  const bookingId = req.params.id;
  const userId = req.session.userId;

  // Vérifier que la réservation appartient bien à un créneau de l’enseignant
  const query = `
    SELECT b.*, s.teacher_id FROM bookings b
    JOIN slots s ON b.slot_id = s.id
    WHERE b.id = ? AND s.teacher_id = ?`;

  db.get(query, [bookingId, userId], (err, booking) => {
    if (err) return res.status(500).send("Erreur serveur");
    if (!booking) return res.status(403).send("Réservation non trouvée ou accès refusé");

    // Supprimer la réservation (rejeter)
    db.run('DELETE FROM bookings WHERE id = ?', [bookingId], function(err) {
      if (err) return res.status(500).send("Erreur lors du rejet");
      res.redirect('/dashboard'); // Retour au dashboard
    });
  });
});

router.get('/book/:id', requireRole('etudiant'), (req, res) => {
  const slotId = req.params.id;
  res.render('book_slot', { slotId, session: req.session, title: "Réserver un créneau" });
});

// Route de réservation
router.post('/book/:id', requireRole('etudiant'), (req, res) => {
  const slotId = req.params.id;
  const studentId = req.session.userId;

  console.log("Tentative de réservation...");
  console.log("Slot ID:", slotId);
  console.log("Étudiant ID:", studentId);

  // Vérifier si le créneau est déjà réservé
  db.get(`SELECT * FROM bookings WHERE slot_id = ?`, [slotId], (err, existingBooking) => {
    if (err) {
      console.error("Erreur SQL lors de la vérification :", err);
      return res.render('error', { title: "Erreur", message: "Erreur lors de la réservation (vérification)." });
    }

    if (existingBooking) {
      console.log("Ce créneau est déjà réservé.");
      return res.render('error', { title: "Erreur", message: "Ce créneau est déjà réservé." });
    }

    // Insérer une nouvelle réservation
    db.run(
      `INSERT INTO bookings (student_id, slot_id) VALUES (?, ?)`,
      [studentId, slotId],
      function (err) {
        if (err) {
          console.error("Erreur SQL lors de l'insertion :", err);
          return res.render('error', { title: "Erreur", message: "Erreur lors de la réservation." });
        }

        console.log("Réservation réussie pour le slot", slotId, "par l'étudiant", studentId);
        res.redirect('/dashboard');
      }
    );
  });
});

router.post('/reject-booking/:id', requireRole('enseignant'), (req, res) => {
  const bookingId = req.params.id;
  const proposedDate = req.body.proposed_date;
  const teacherId = req.session.userId;

  console.log("Rejet avec proposition :", bookingId, proposedDate);

  // 1. Supprimer la réservation
  db.get(`SELECT slot_id, student_id FROM bookings WHERE id = ?`, [bookingId], (err, booking) => {
    if (err || !booking) {
      console.error("Erreur récupération réservation :", err);
      return res.render('error', { title: "Erreur", message: "Réservation introuvable." });
    }

    const { slot_id, student_id } = booking;

    db.run(`DELETE FROM bookings WHERE id = ?`, [bookingId], (err2) => {
      if (err2) {
        console.error("Erreur suppression réservation :", err2);
        return res.render('error', { title: "Erreur", message: "Erreur lors du rejet." });
      }

      // 2. Créer un nouveau créneau avec la date proposée
      db.run(`INSERT INTO slots (teacher_id, date, time ) VALUES (?, ?)`, [teacherId, proposedDate], function (err3) {
        if (err3) {
          console.error("Erreur insertion nouveau créneau :", err3);
          return res.render('error', { title: "Erreur", message: "Erreur lors de la création du nouveau créneau." });
        }

        const newSlotId = this.lastID;

        // 3. Envoyer un message à l'étudiant
        db.run(
          `INSERT INTO messages (sender_id, receiver_id, content, lu) VALUES (?, ?, ?, 0)`,
          [teacherId, student_id, `Votre réservation a été rejetée. Un nouveau créneau vous a été proposé pour le ${proposedDate}.`],
          (err4) => {
            if (err4) {
              console.error("Erreur envoi message :", err4);
            }

            return res.redirect('/dashboard');
          }
        );
      });
    });
  });
});



module.exports = router;
