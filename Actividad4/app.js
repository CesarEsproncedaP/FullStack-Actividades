require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const path     = require('path');

const authRoutes     = require('./routes/authRoutes');
const productoRoutes = require('./routes/productoRoutes');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'FrontEnd')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'FrontEnd', 'login.html')));
app.use('/api/auth',      authRoutes);
app.use('/api/productos', productoRoutes);

// Conectar a MongoDB y exportar la app para Vercel
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error MongoDB:', err.message));

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
}

module.exports = app;