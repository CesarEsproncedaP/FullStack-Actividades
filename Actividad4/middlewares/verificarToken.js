const jwt = require('jsonwebtoken');

// Middleware que protege rutas
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Si no hay token o formato incorrecto
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Necesitas iniciar sesion primero.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = datos.id;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token invalido o expirado.' });
  }
}

module.exports = verificarToken;