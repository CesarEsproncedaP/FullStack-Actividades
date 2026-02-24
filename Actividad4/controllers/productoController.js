const Producto = require('../models/Producto');

// Obtiene todos los productos de la base de datos
async function obtenerTodos(req, res) {
  try {
    const productos = await Producto.find();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos.', error: error.message });
  }
}

// Obtiene un solo producto usando su ID
async function obtenerUno(req, res) {
  try {
    // Se busca el producto por el ID que viene en la URL
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el producto.', error: error.message });
  }
}

// Se crea un nuevo producto con los datos que vienen del formulario
async function crear(req, res) {
  try {
    const producto = await Producto.create(req.body);
    res.status(201).json({ mensaje: 'Producto creado.', producto });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear producto.', error: error.message });
  }
}

// Se actualiza un producto usando su ID
async function actualizar(req, res) {
  try {
    // { new: true } hace que devuelva el producto ya actualizado
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    res.status(200).json({ mensaje: 'Producto actualizado.', producto });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar.', error: error.message });
  }
}

// Elimina un producto de la base de datos usando su ID
async function eliminar(req, res) {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    res.status(200).json({ mensaje: 'Producto eliminado.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar.', error: error.message });
  }
}

module.exports = { obtenerTodos, obtenerUno, crear, actualizar, eliminar };