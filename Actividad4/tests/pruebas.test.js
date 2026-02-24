const { registro, login }                                      = require('../controllers/authController');
const { obtenerTodos, obtenerUno, crear, actualizar, eliminar } = require('../controllers/productoController');
const Usuario  = require('../models/Usuario');
const Producto = require('../models/Producto');
const jwt      = require('jsonwebtoken');

// Reemplazamos los modelos con versiones falsas para no necesitar BD real
jest.mock('../models/Usuario');
jest.mock('../models/Producto');
jest.mock('jsonwebtoken');

process.env.JWT_SECRET = 'secreto_test';

// Función que crea un objeto "res" falso para simular las respuestas
function crearRes() {
  const res  = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

// PRUEBAS CON JTEST

describe('registro', () => {
  test('crea un usuario nuevo y devuelve token', async () => {
    const req = { body: { nombre: 'Ana', email: 'ana@test.com', password: '123456' } };
    const res = crearRes();
    Usuario.findOne.mockResolvedValue(null);
    Usuario.create.mockResolvedValue({ _id: '1', nombre: 'Ana' });
    jwt.sign.mockReturnValue('token_falso');

    await registro(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'token_falso' }));
  });

  test('rechaza si el email ya existe', async () => {
    const req = { body: { email: 'ana@test.com', password: '123456' } };
    const res = crearRes();
    Usuario.findOne.mockResolvedValue({ email: 'ana@test.com' });

    await registro(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('login', () => {
  test('devuelve token con credenciales correctas', async () => {
    const req = { body: { email: 'ana@test.com', password: '123456' } };
    const res = crearRes();
    Usuario.findOne.mockResolvedValue({
      _id: '1', nombre: 'Ana',
      verificarPassword: jest.fn().mockResolvedValue(true)
    });
    jwt.sign.mockReturnValue('token_falso');

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'token_falso' }));
  });

  test('rechaza si el usuario no existe', async () => {
    const req = { body: { email: 'noexiste@test.com', password: '123456' } };
    const res = crearRes();
    Usuario.findOne.mockResolvedValue(null);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ── PRUEBAS DE PRODUCTOS ──────────────────────────────────────────────────────

describe('productos', () => {
  test('obtenerTodos devuelve lista de productos', async () => {
    const req = {};
    const res = crearRes();
    Producto.find.mockResolvedValue([{ nombre: 'Set de 7 palos Inesis 100' }, { nombre: 'Rangefinder de laser' }]);

    await obtenerTodos(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('obtenerUno devuelve 404 si no existe', async () => {
    const req = { params: { id: 'id_falso' } };
    const res = crearRes();
    Producto.findById.mockResolvedValue(null);

    await obtenerUno(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('crear devuelve el producto creado', async () => {
    const req = { body: { nombre: 'Tees de bambu', precio: 120 } };
    const res = crearRes();
    Producto.create.mockResolvedValue({ _id: '99', nombre: 'Tees de bambu', precio: 120 });

    await crear(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('actualizar devuelve 404 si no existe', async () => {
    const req = { params: { id: 'id_falso' }, body: { precio: 130 } };
    const res = crearRes();
    Producto.findByIdAndUpdate.mockResolvedValue(null);

    await actualizar(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('eliminar confirma eliminación', async () => {
    const req = { params: { id: 'id_existente' } };
    const res = crearRes();
    Producto.findByIdAndDelete.mockResolvedValue({ _id: 'id_existente' });

    await eliminar(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});