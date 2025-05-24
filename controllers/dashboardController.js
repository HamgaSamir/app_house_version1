const db = require('../database'); // connexion MySQL

exports.showDashboard = (req, res) => {
  const { role, userId, name, email } = req.session;

  if (role === 'etudiant') {
    const querySlots = `
      SELECT s.*, u.name AS teacher_name, b.id AS booking_id, b.student_id
      FROM slots s
      LEFT JOIN bookings b ON s.id = b.slot_id
      JOIN users u ON u.id = s.teacher_id
    `;

    const queryMessages = `
      SELECT m.*, u.name AS sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.receiver_id = ?
    `;

    db.query(querySlots, (err, slots) => {
      if (err) {
        console.error("Erreur SQL (étudiant) :", err);
        return res.render('error', { message: "Erreur lors du chargement du tableau de bord étudiant.", title: "Erreur" });
      }

      db.query(queryMessages, [userId], (err2, messages) => {
        if (err2) {
          console.error("Erreur chargement messages :", err2);
          return res.render('error', { message: "Erreur chargement messages", title: "Erreur" });
        }

        const unreadCount = messages.filter(m => m.lu === 0).length;

        res.render('dashboard_student', {
          user: { name, email },
          session: req.session,
          slots,
          messages,
          unreadCount,
          title: "Dashboard Étudiant"
        });
      });
    });

  } else if (role === 'enseignant') {
    // Code pour enseignant (idem, à adapter)
  } else {
    res.status(403).render('error', { title: "Accès refusé", message: "Rôle non reconnu." });
  }
};
