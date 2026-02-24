// Se cargan las variables del archivo .env
require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const path     = require('path');

// Se importan las rutas de autenticación y productos
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

const PORT = process.env.PORT || 3000;

// Se conecta a MongoDB y se inicia el servidor
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
  })
  .catch(err => console.error('Error MongoDB:', err.message));

module.exports = app;