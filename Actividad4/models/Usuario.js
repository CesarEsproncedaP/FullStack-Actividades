const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// Se define la estructura de un usuario en la base de datos
const usuarioSchema = new mongoose.Schema({
  nombre:   { type: String, required: true },         
  email:    { type: String, required: true, unique: true }, 
  password: { type: String, required: true }        
});

// Antes de guardar el usuario se cifra su contraseña automáticamente
usuarioSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Función para comparar la contraseña ingresada con la guardada al hacer login
usuarioSchema.methods.verificarPassword = function (passwordIngresada) {
  return bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);