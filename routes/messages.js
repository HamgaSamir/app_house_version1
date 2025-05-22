const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireLogin } = require('../middlewares/auth');

// Afficher les messages reçus
router.get('/', requireLogin, (req, res) => {
  const userId = req.session.userId;

  db.all(`
    SELECT m.*, u.name AS sender_name
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.receiver_id = ?
  
  `, [userId], (err, messages) => {
    if (err) {
      console.error("Erreur récupération messages :", err);
      return res.render('error', { message: "Erreur chargement messages", title: "Erreur" });
    }

    res.render('messages', {
      session: req.session,
      messages,
      title: "Messages reçus"
    });
  });
});

// Afficher le formulaire d'envoi
router.get('/send', requireLogin, (req, res) => {
  // Charger la liste des utilisateurs pour choisir le destinataire
  db.all('SELECT id, name FROM users WHERE id != ?', [req.session.userId], (err, users) => {
    if (err) {
      console.error("Erreur récupération utilisateurs :", err);
      return res.render('error', { message: "Erreur chargement utilisateurs", title: "Erreur" });
    }

    res.render('send_message', {
      session: req.session,
      users,
      title: "Envoyer un message"
    });
  });
});

// Traitement de l’envoi
router.post('/send', requireLogin, (req, res) => {
  const sender_id = req.session.userId;
  const { receiver_id, content } = req.body;

  db.run(`
    INSERT INTO messages (sender_id, receiver_id, content, lu)
    VALUES (?, ?, ?, 0)
  `, [sender_id, receiver_id, content], (err) => {
    if (err) {
      console.error("Erreur envoi message :", err);
      return res.render('error', { message: "Erreur envoi message", title: "Erreur" });
    }

    res.redirect('/messages');
  });
});

// Voir un message en détail
router.get('/messages/:id', requireLogin, (req, res) => {
  const messageId = req.params.id;
  const userId = req.session.userId;

  db.get(`
    SELECT m.*, us.name AS sender_name, ur.name AS receiver_name
    FROM messages m
    JOIN users us ON m.sender_id = us.id
    JOIN users ur ON m.receiver_id = ur.id
    WHERE m.id = ? AND (m.sender_id = ? OR m.receiver_id = ?)
  `, [messageId, userId, userId], (err, message) => {
    if (err || !message) {
      console.error("Erreur message détail :", err);
      return res.render('error', { message: "Message introuvable", title: "Erreur" });
    }

    // Marquer comme lu si le destinataire est connecté
    if (message.receiver_id === userId && message.lu === 0) {
      db.run('UPDATE messages SET lu = 1 WHERE id = ?', [messageId]);
    }

    res.render('message_detail', {
      session: req.session,
      message,
      title: "Détail du message"
    });
  });
});

module.exports = router;
