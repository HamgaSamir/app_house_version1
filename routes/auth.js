const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const db = require('../database'); // Chemin vers le fichier où tu as créé la connexion

router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.get('/register', authController.showRegister);
router.post('/register', authController.register);
router.get('/logout', authController.logout);





module.exports = router;


