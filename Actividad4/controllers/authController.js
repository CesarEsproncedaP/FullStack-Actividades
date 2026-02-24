const jwt     = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Se registra un nuevo usuario en la base de datos
async function registro(req, res) {
  try {
    // Se extraen los datos del cuerpo de la petición
    const { nombre, email, password } = req.body;

    // Se verifica que el email no esté ya registrado
    const yaExiste = await Usuario.findOne({ email });
    if (yaExiste) return res.status(400).json({ mensaje: 'El email ya está registrado.' });

    // Se crea el usuario.
    const usuario = await Usuario.create({ nombre, email, password });

    // Se genera el token JWT con duración de 1 día.
    const token   = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ mensaje: 'Usuario creado.', token });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar.', error: error.message });
  }
}

// Inicia sesión y devuelve un token JWT
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Se busca el usuario por su email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(401).json({ mensaje: 'Email o contraseña incorrectas.' });

    // Se verifica que la contraseña ingresada coincida con la guardada
    const passwordCorrecta = await usuario.verificarPassword(password);
    if (!passwordCorrecta) return res.status(401).json({ mensaje: 'Email o contraseña incorrectas.' });

    // Se genera el token JWT con duración de 24 horas
    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({ mensaje: 'Login exitoso.', token, nombre: usuario.nombre });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión.', error: error.message });
  }
}

module.exports = { registro, login };