const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Necesitas iniciar sesión primero.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = datos.id;
    next();const jwt = require('jsonwebtoken');

// Middleware que protege las rutas que requieren inicio de sesión
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Si no hay token o no tiene el formato correcto le bloqueamos el acceso
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Necesitas iniciar sesión primero.' });
  }

  // Separamos la palabra "Bearer" del token real
  const token = authHeader.split(' ')[1];

  try {
    // Verificamos que el token sea válido y no esté expirado
    const datos = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos el ID del usuario para usarlo en el controlador
    req.usuarioId = datos.id;

    next();
  } catch {
    return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
}

module.exports = verificarToken;
  } catch {
    return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
}

module.exports = verificarToken;