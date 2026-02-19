const express = require('express'); // Se usa express para crear el servidor.
const bodyParser = require('body-parser'); // Se usa body-parser para que se escriba el JSON.
const fs = require('fs').promises; // Se usa fs.promises para realizar operaciones asíncronas.
const path = require('path'); // Se usa path para las rutas de archivos.
const bcrypt = require('bcryptjs'); // Se usa Bcrypt para encriptar las contraseñas.
const jwt = require('jsonwebtoken'); // Se usa JWT para los tokens.

const app = express(); // Se usa express para crear la aplicación.
const PORT = 3000; // Puerto del servidor
const SECRET_KEY = 'clave_secreta_act3_2026';

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Carpeta para el FrontEnd
const FRONTEND_PATH = path.join(__dirname, 'FrontEnd');
app.use(express.static(FRONTEND_PATH));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Ruta raíz para servir el index.html del frontend.
app.get('/', (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
});

// Funciones para manejar archivos con fs.promises.
async function leerMovimientos() { // Función para leer movimientos de movimientos.json.
    try {
        const data = await fs.readFile(path.join(__dirname, 'movimientos.json'), 'utf-8');
        return JSON.parse(data);
    } catch {
        await fs.writeFile(path.join(__dirname, 'movimientos.json'), JSON.stringify([]));
        return [];
    }
}

async function escribirMovimientos(movimientos) { // Función para escribir movimientos en movimientos.json.
    await fs.writeFile(path.join(__dirname, 'movimientos.json'), JSON.stringify(movimientos, null, 2));
}

async function leerUsuarios() { // Función para leer usuarios de usuarios.json.
    try {
        const data = await fs.readFile(path.join(__dirname, 'usuarios.json'), 'utf-8');
        return JSON.parse(data);
    } catch {
        await fs.writeFile(path.join(__dirname, 'usuarios.json'), JSON.stringify([]));
        return [];
    }
}

async function escribirUsuarios(usuarios) { // Función para escribir usuarios en usuarios.json.
    await fs.writeFile(path.join(__dirname, 'usuarios.json'), JSON.stringify(usuarios, null, 2));
}

// Middleware para verificar token de autenticación.
function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ error: 'Token requerido' });

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    try {
        req.usuario = jwt.verify(token, SECRET_KEY);
        next();
    } catch {
        res.status(401).json({ error: 'Token inválido' });
    }
}

// Ruta para registro de usuarios.
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Faltan datos' });

    const usuarios = await leerUsuarios();
    if (usuarios.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Usuario ya existe' });
    }

    const hash = await bcrypt.hash(password, 10);
    const nuevoUsuario = { id: Date.now(), username, password: hash };
    usuarios.push(nuevoUsuario);
    await escribirUsuarios(usuarios);

    res.status(201).json({ message: 'Usuario registrado' });
});

// Ruta para inicio de sesión.
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const usuarios = await leerUsuarios();
    const usuario = usuarios.find(u => u.username === username);
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: usuario.id, username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, usuario: { id: usuario.id, username } });
});

// Rutas protegidas para movimientos.
app.get('/movimientos', verificarToken, async (req, res) => { // Devuelve todos los movimientos del usuario.
    const movimientos = await leerMovimientos();
    const míos = movimientos.filter(m => m.usuarioId === req.usuario.id);
    res.json(míos);
});

app.post('/movimientos', verificarToken, async (req, res) => { // Agrega un nuevo movimiento.
    const { tipo, categoria, monto, descripcion, fecha } = req.body;
    if (!tipo || !categoria || !monto || !fecha) return res.status(400).json({ error: 'Faltan datos obligatorios' });

    const movimientos = await leerMovimientos();
    const nuevo = {
        id: Date.now(),
        tipo,
        categoria: categoria.trim(),
        monto: parseFloat(monto),
        descripcion: descripcion || '',
        fecha,
        usuarioId: req.usuario.id
    };
    movimientos.push(nuevo);
    await escribirMovimientos(movimientos);
    res.status(201).json(nuevo);
});

app.put('/movimientos/:id', verificarToken, async (req, res) => { // Actualiza un movimiento.
    const { id } = req.params;
    const { tipo, categoria, monto, descripcion, fecha } = req.body;
    const movimientos = await leerMovimientos();
    const movimiento = movimientos.find(m => m.id === parseInt(id) && m.usuarioId === req.usuario.id);
    if (!movimiento) return res.status(404).json({ error: 'Movimiento no encontrado' });

    movimiento.tipo = tipo;
    movimiento.categoria = categoria.trim();
    movimiento.monto = parseFloat(monto);
    movimiento.descripcion = descripcion || '';
    movimiento.fecha = fecha;
    await escribirMovimientos(movimientos);
    res.json(movimiento);
});

app.delete('/movimientos/:id', verificarToken, async (req, res) => { // Elimina un movimiento.
    const { id } = req.params;
    let movimientos = await leerMovimientos();
    const inicial = movimientos.length;
    movimientos = movimientos.filter(m => !(m.id === parseInt(id) && m.usuarioId === req.usuario.id));
    if (movimientos.length === inicial) return res.status(404).json({ error: 'Movimiento no encontrado' });

    await escribirMovimientos(movimientos);
    res.json({ message: 'Eliminado' });
});

// Se inicia el servidor en el puerto 3000.
app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
    console.log(`📁 Frontend servido desde: ${FRONTEND_PATH}`);
});