const mongoose = require('mongoose');

// Se define la estructura de un producto en la base de datos
const productoSchema = new mongoose.Schema({
  nombre:      { type: String, required: true },  
  descripcion: { type: String },                 
  precio:      { type: Number, required: true },  
  stock:       { type: Number, default: 0 }       
}, { timestamps: true }); 

module.exports = mongoose.model('Producto', productoSchema);