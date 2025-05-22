const express = require('express');
const router = express.Router();
const db = require('../database'); // Chemin vers le fichier où tu as créé la connexion
const { requireLogin } = require('../middlewares/auth');







// Récupérer les créneaux disponibles au format JSON (ex: pour FullCalendar)
router.get('/slots', (req, res) => {
  db.all("SELECT * FROM slots WHERE available = 1", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const events = rows.map(slot => ({
      id: slot.id,
      title: "Disponible",
      start: `${slot.date}T${slot.time}`,
      url: `/book/${slot.id}`
    }));

    res.json(events);
  });
});


router.post('/messages/send', requireLogin, (req, res) => {
  const { userId } = req.session;
  const { receiverId, content } = req.body;

  db.run(`
    INSERT INTO messages (sender_id, receiver_id, content)
    VALUES (?, ?, ?)
  `, [userId, receiverId, content], function (err) {
    if (err) return res.status(500).json({ error: "Erreur d'envoi" });
    res.status(200).json({ success: true });
  });
});





module.exports = router;
