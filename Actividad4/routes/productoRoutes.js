const express        = require('express');
const router         = express.Router();
const verificarToken = require('../middlewares/verificarToken');
const { obtenerTodos, obtenerUno, crear, actualizar, eliminar } = require('../controllers/productoController');

// Todas las rutas pasan primero por verificarToken antes de ejecutarse
// Si el usuario no tiene sesión activa, se bloquea el acceso

router.get('/',       verificarToken, obtenerTodos); // Ver todos los productos
router.get('/:id',    verificarToken, obtenerUno);   // Ver un producto por ID
router.post('/',      verificarToken, crear);        // Crear un producto
router.put('/:id',    verificarToken, actualizar);   // Editar un producto por ID
router.delete('/:id', verificarToken, eliminar);     // Eliminar un producto por ID

module.exports = router;