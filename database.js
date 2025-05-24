const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'rayane2009+',
  database: 'school_app'
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connecté à MySQL !");
});

module.exports = db;
