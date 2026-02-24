const express             = require('express');
const router              = express.Router();
const { registro, login } = require('../controllers/authController');

// Ruta para registrar un nuevo usuario 
router.post('/registro', registro);

// Ruta para iniciar sesión y obtener un token
router.post('/login',    login);

module.exports = router;