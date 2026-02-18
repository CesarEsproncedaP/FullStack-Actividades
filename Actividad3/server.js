const express = require('express'); // Se usa express para crear el servidor.
const bodyParser = require('body-parser'); // Se usa body-praser para que se escriba el JSON.
const fs = require('fs').promises;// Se usa fs.promises par realizar operaciones asíncronas.
const path = require('path'); // Se usa path para las rutas de archios.
const bcrypt = require('bcryptjs'); // Se isa Bcrypt para encriptar las contraseñas.
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

// Log  ging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Ruta raíz para servir el index.html del frontend.
app.get('/', (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
});

// Funciones para manejar archivos con fs.promises.
async function leerTareas() { // Función para leer tareas de tareas.json.
    try {
        const data = await fs.readFile(path.join(__dirname, 'tareas.json'), 'utf-8');
        return JSON.parse(data);
    } catch {
        await fs.writeFile(path.join(__dirname, 'tareas.json'), JSON.stringify([]));
        return [];
    }
}

async function escribirTareas(tareas) { // Función para escribir tareas en tareas.json.
    await fs.writeFile(path.join(__dirname, 'tareas.json'), JSON.stringify(tareas, null, 2));
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

// Rutas protegidas para tareas.
app.get('/tareas', verificarToken, async (req, res) => { //Devuelve todas las tareas del usuario.
    const tareas = await leerTareas();
    const mías = tareas.filter(t => t.usuarioId === req.usuario.id);
    res.json(mías);
});

app.post('/tareas', verificarToken, async (req, res) => { // Agrega una nueva tarea.
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });

    const tareas = await leerTareas();
    const nueva = { id: Date.now(), nombre: nombre.trim(), usuarioId: req.usuario.id };
    tareas.push(nueva);
    await escribirTareas(tareas);
    res.status(201).json(nueva);
});

app.put('/tareas/:id', verificarToken, async (req, res) => { // Actualiza una tarea.
    const { id } = req.params;
    const { nombre } = req.body;
    const tareas = await leerTareas();
    const tarea = tareas.find(t => t.id === parseInt(id) && t.usuarioId === req.usuario.id);
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

    tarea.nombre = nombre.trim();
    await escribirTareas(tareas);
    res.json(tarea);
});

app.delete('/tareas/:id', verificarToken, async (req, res) => { // Elimina una tarea.
    const { id } = req.params;
    let tareas = await leerTareas();
    const inicial = tareas.length;
    tareas = tareas.filter(t => !(t.id === parseInt(id) && t.usuarioId === req.usuario.id));
    if (tareas.length === inicial) return res.status(404).json({ error: 'Tarea no encontrada' });

    await escribirTareas(tareas);
    res.json({ message: 'Eliminada' });
});

// Se inicia el servidor en el puerto 3000.
app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
    console.log(`📁 Frontend servido desde: ${FRONTEND_PATH}`);
});