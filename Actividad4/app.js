// Cargamos las variables del archivo .env
require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const path     = require('path');

// Importamos las rutas de autenticación y productos
const authRoutes     = require('./routes/authRoutes');
const productoRoutes = require('./routes/productoRoutes');

const app = express();

// Middleware para leer el cuerpo de las peticiones en formato JSON
app.use(express.json());

// Servimos los archivos del frontend (login.html, dashboard.html)
app.use(express.static(path.join(__dirname, 'FrontEnd')));

// Ruta principal: muestra la página de login
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'FrontEnd', 'login.html')));

// Rutas de la API
app.use('/api/auth',      authRoutes);
app.use('/api/productos', productoRoutes);

// Conexión a MongoDB reutilizable (importante para Vercel serverless)
let isConnected = false;
const conectarDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
};

// Conectamos a MongoDB antes de cada petición
app.use(async (req, res, next) => {
  try {
    await conectarDB();
    next();
  } catch (err) {
    res.status(500).json({ mensaje: 'Error de conexión a MongoDB.', error: err.message });
  }
});

// Solo arranca el servidor local si NO estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  conectarDB()
    .then(() => {
      console.log('Conectado a MongoDB');
      app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
    })
    .catch(err => console.error('Error MongoDB:', err.message));
}

module.exports = app;