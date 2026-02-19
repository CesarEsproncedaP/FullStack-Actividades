// Clase que se pide en las instrucciones, la cual representa cada movimiento.
class Movimiento {
    constructor(id, tipo, categoria, monto, descripcion, fecha) {
        this.id = id;
        this.tipo = tipo;
        this.categoria = categoria;
        this.monto = monto;
        this.descripcion = descripcion;
        this.fecha = fecha;
    }
}

class GestorDeGastos { // Clase que maneja la lista de movimientos
    constructor() {
        this.movimientos = [];
        this.API_URL = 'http://localhost:3000';
        this.token = localStorage.getItem('token');
    }

    async cargarMovimientos() { // Cargar movimientos desde la API.
        try {
            const res = await fetch(`${this.API_URL}/movimientos`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            this.movimientos = data.map(m => ({...m})); // Copio los movimientos con id para que funcione el refresh.
            renderizarMovimientos();
        } catch {
            mostrarError('Error al cargar');
        }
    }

    async agregarMovimiento(tipo, categoria, monto, descripcion, fecha) { // Agregar movimiento a la API.
        try {
            const res = await fetch(`${this.API_URL}/movimientos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ tipo, categoria, monto: parseFloat(monto), descripcion, fecha })
            });
            if (!res.ok) throw new Error();
            const nuevo = await res.json();
            this.movimientos.push({...nuevo}); // Agrego con id para que persista al refresh.
            renderizarMovimientos();
        } catch {
            mostrarError('Error al agregar');
        }
    }

    async eliminarMovimiento(id) { // Eliminar movimiento de la API.
        try {
            await fetch(`${this.API_URL}/movimientos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            this.movimientos = this.movimientos.filter(m => m.id !== id);
            renderizarMovimientos();
        } catch {
            mostrarError('Error al eliminar');
        }
    }

    async limpiarTodo() { // Limpiar todos los movimientos de la API.
        try {
            const promesas = this.movimientos.map(m =>
                fetch(`${this.API_URL}/movimientos/${m.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${this.token}` }
                })
            );
            await Promise.all(promesas);
            this.movimientos = [];
            renderizarMovimientos();
        } catch {
            mostrarError('Error al limpiar');
        }
    }
}

const gestor = new GestorDeGastos();

// Funciones de autentificación.
async function registrar() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    if (!username || !password) return mostrarError('Completa campos');

    try {
        const res = await fetch(`${gestor.API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Error en registro');
        mostrarMensaje('¡Registrado! Inicia sesión');
        mostrarLogin();
    } catch (e) {
        mostrarError(e.message);
    }
}

async function login() { // Función para iniciar sesión
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    if (!username || !password) return mostrarError('Completa campos');

    try {
        const res = await fetch(`${gestor.API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        gestor.token = data.token;
        localStorage.setItem('token', data.token);
        document.getElementById('usuarioNombre').textContent = data.usuario.username;

        mostrarApp();
        gestor.cargarMovimientos();
    } catch (e) {
        mostrarError(e.message);
    }
}

function logout() { // Función para cerrar sesión.
    if (confirm('¿Cerrar sesión?')) {
        localStorage.removeItem('token');
        gestor.token = null;
        mostrarLogin();
    }
}

// UI
function mostrarLogin() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function mostrarRegistro() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function mostrarApp() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
}

function calcularResumen() { // Función que calcula y muestra el resumen financiero.
    let ingresos = 0;
    let gastos = 0;
    gestor.movimientos.forEach(m => {
        if (m.tipo === 'ingreso') ingresos += m.monto;
        else gastos += m.monto;
    });
    const saldo = ingresos - gastos;
    document.getElementById('totalIngresos').textContent = ingresos.toFixed(2);
    document.getElementById('totalGastos').textContent = gastos.toFixed(2);
    const saldoEl = document.getElementById('saldo');
    saldoEl.textContent = saldo.toFixed(2);
    saldoEl.style.color = saldo >= 0 ? '#4CAF50' : '#eb4d4b';
}

function renderizarMovimientos() { // Función que sirve para que los movimientos se puedan ver.
    const ul = document.getElementById('listaMovimientos');
    ul.innerHTML = '';
    gestor.movimientos.forEach((movimiento, index) => {
        const li = document.createElement('li');
        li.className = movimiento.tipo;
        const signo = movimiento.tipo === 'ingreso' ? '+' : '-';
        const color = movimiento.tipo === 'ingreso' ? '#4CAF50' : '#eb4d4b';
        li.innerHTML = `
            <span>
                <strong>${movimiento.categoria}</strong> - ${movimiento.descripcion || 'Sin descripción'}<br>
                <small>📅 ${movimiento.fecha}</small>
            </span>
            <span style="color:${color}; font-weight:bold; margin-right:10px;">${signo}$${parseFloat(movimiento.monto).toFixed(2)}</span>
            <button onclick="editar(${index})">Editar</button>
            <button class="delete" onclick="eliminar(${index})">Eliminar</button>
        `;
        ul.appendChild(li);
    });
    calcularResumen();
}

function mostrarMensaje(msg) { alert(msg); }
function mostrarError(msg) { alert('⚠️ ' + msg); }

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {

    // Eventos para autenticación
    document.getElementById('btnLogin').addEventListener('click', login);
    document.getElementById('btnRegister').addEventListener('click', registrar);
    document.getElementById('linkRegistro').addEventListener('click', (e) => { e.preventDefault(); mostrarRegistro(); });
    document.getElementById('linkLogin').addEventListener('click', (e) => { e.preventDefault(); mostrarLogin(); });
    document.getElementById('btnCerrarSesion').addEventListener('click', logout);

    // Fecha de hoy por defecto
    document.getElementById('fecha').valueAsDate = new Date();

    // Evento que sirve para el botón de agregar movimientos.
    document.getElementById('btnagregar').addEventListener('click', () => {
        const tipo = document.getElementById('tipo').value;
        const categoria = document.getElementById('categoria').value.trim();
        const monto = document.getElementById('monto').value;
        const descripcion = document.getElementById('descripcion').value.trim();
        const fecha = document.getElementById('fecha').value;
        if (!categoria || !monto || !fecha) return mostrarError('Categoría, monto y fecha son obligatorios');
        gestor.agregarMovimiento(tipo, categoria, monto, descripcion, fecha);
        document.getElementById('categoria').value = '';
        document.getElementById('monto').value = '';
        document.getElementById('descripcion').value = '';
        document.getElementById('fecha').valueAsDate = new Date();
    });

    // Evento para borrar todos los movimientos.
    document.getElementById('Borrar').addEventListener('click', () => {
        if (confirm('¿Limpiar todo?')) gestor.limpiarTodo();
    });

    // Verifica si hay una sesión iniciada al entrar a la página.
    if (gestor.token) {
        mostrarApp();
        gestor.cargarMovimientos();
    } else {
        mostrarLogin();
    }
});

window.eliminar = (index) => { // Función que sirve para eliminar solamente el movimiento seleccionado.
    const id = gestor.movimientos[index].id;
    if (confirm('¿Eliminar?')) gestor.eliminarMovimiento(id);
};

window.editar = (index) => { // Función para editar el movimiento seleccionado.
    const mov = gestor.movimientos[index];
    const nuevoTipo = prompt('Tipo (ingreso/gasto):', mov.tipo);
    if (!nuevoTipo) return;
    const nuevaCategoria = prompt('Categoría:', mov.categoria);
    if (!nuevaCategoria) return;
    const nuevoMonto = prompt('Monto:', mov.monto);
    if (!nuevoMonto) return;
    const nuevaDescripcion = prompt('Descripción:', mov.descripcion);
    const nuevaFecha = prompt('Fecha (YYYY-MM-DD):', mov.fecha);
    if (!nuevaFecha) return;

    fetch(`${gestor.API_URL}/movimientos/${mov.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${gestor.token}`
        },
        body: JSON.stringify({ tipo: nuevoTipo, categoria: nuevaCategoria, monto: parseFloat(nuevoMonto), descripcion: nuevaDescripcion, fecha: nuevaFecha })
    }).then(res => {
        if (!res.ok) throw new Error();
        mov.tipo = nuevoTipo;
        mov.categoria = nuevaCategoria;
        mov.monto = parseFloat(nuevoMonto); // Actualizo local para que persista al refresh.
        mov.descripcion = nuevaDescripcion;
        mov.fecha = nuevaFecha;
        renderizarMovimientos();
    }).catch(() => mostrarError('Error al editar'));
};