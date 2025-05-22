const db = require('../database'); // Chemin vers le fichier où tu as créé la connexion

exports.showDashboard = (req, res) => {
  const { role, userId } = req.session;

  if (role === 'etudiant') {
    db.all(`
       SELECT s.*, u.name AS teacher_name, b.id AS booking_id, b.student_id
  FROM slots s
  LEFT JOIN bookings b ON s.id = b.slot_id
  JOIN users u ON u.id = s.teacher_id
`, [], (err, slots) => {
        if (err) {
          return res.render('error', { message: "Erreur lors du chargement du tableau de bord étudiant." });
        }

        res.render('dashboard_student', {
          session: req.session,
          user: user,
          slots: slots,
          title: "Dashboard Etudiant"
        });
      }
    );

 } else if (role === 'enseignant') {
  db.all(
    `SELECT s.id, s.date, s.time, b.id AS booking_id, u.name AS student_name
FROM slots s
LEFT JOIN bookings b ON b.slot_id = s.id
LEFT JOIN users u ON b.student_id = u.id
WHERE s.teacher_id = ?`,
    [userId],
    (err, slots) => {
      if (err) {
        return res.render('error', { message: "Erreur chargement slots" });
  }

      const totalHours = slots.filter(s => s.booking_id).length;

      // 🔽 Ajouter cette requête pour récupérer les messages
      db.all(
        `SELECT m.*, u.name AS sender_name
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.receiver_id = ?`,
        [userId],
        (err2, messages) => {
          if (err2) {
            return res.render('error', { message: "Erreur chargement messages" });
          }

          const unreadCount = messages.filter(m => m.lu === 0).length;

          // ✅ Ici, tout est prêt pour l'affichage
          res.render('dashboard_teacher', {
            slots,
            totalHours,
            messages,
            unreadCount,
            session: req.session,
            title: "Dashboard Enseignant"
          });
        }
      );
    }
  );
}}