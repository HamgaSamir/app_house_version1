

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Erreur de connexion à la base :", err.message);
  } else {
    console.log("Connecté à la base de données SQLite");
  }
});

module.exports = db;


db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    time TEXT,
    available INTEGER DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT,
    slot_id INTEGER,
    student_id INTEGER,
    FOREIGN KEY(slot_id) REFERENCES slots(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	sender_id INTEGER,
	receiver_id INTEGER,
	content TEXT,
	timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY(sender_id) REFERENCES users(id),
	FOREIGN KEY(receiver_id) REFERENCES users(id)
  )`);

  //db.run(`ALTER TABLE messages ADD COLUMN lu INTEGER DEFAULT 0`);
  //db.run(`ALTER TABLE slots ADD COLUMN subject TEXT`);
  //db.run(`ALTER TABLE slots ADD COLUMN teacher_id INTEGER`);
  //db.run(`ALTER TABLE slots ADD COLUMN file TEXT`);

  //db.run(`INSERT INTO bookings (student_name, slot_id, student_id) VALUES (?, ?, ?)`); 
  
});

module.exports = db;
