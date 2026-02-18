//Clase que se pide en las instrucciones, la cual representa cada tarea.
class Tarea {
    constructor(nombre) {
        this.nombre = nombre;
    }
}

class GestorDeTareas { // Clase que maneja a la lista de tareas
    constructor() {
        this.tareas = [];
        this.API_URL = 'http://localhost:3000';
        this.token = localStorage.getItem('token');
    }

    async cargarTareas() { // Cargar tareas desde la API.
        try { 
            const res = await fetch(`${this.API_URL}/tareas`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            this.tareas = data.map(t => ({...t})); // Copio las tareas con id para que funcione el refresh.
            renderizarTareas();
        } catch {
            mostrarError('Error al cargar');
        }
    }

    async agregarTarea(nombre) { // Agregar tarea a la API
        try {
            const res = await fetch(`${this.API_URL}/tareas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ nombre })
            });
            if (!res.ok) throw new Error();
            const nueva = await res.json();
            this.tareas.push({...nueva}); // Agrego con id para que persista al refresh.
            renderizarTareas();
        } catch {
            mostrarError('Error al agregar');
        }
    }

    async eliminarTarea(id) { // Eliminar tarea de la API.
        try {
            await fetch(`${this.API_URL}/tareas/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            this.tareas = this.tareas.filter(t => t.id !== id);
            renderizarTareas();
        } catch {
            mostrarError('Error al eliminar');
        }
    }

    async limpiarTodo() { // Limpiar todas las tareas de la API.
        try {
            const promesas = this.tareas.map(t => 
                fetch(`${this.API_URL}/tareas/${t.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${this.token}` }
                })
            );
            await Promise.all(promesas);
            this.tareas = [];
            renderizarTareas();
        } catch {
            mostrarError('Error al limpiar');
        }
    }
}

const gestor = new GestorDeTareas();

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
        gestor.cargarTareas();
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

function renderizarTareas() { // Funcion que sirve para que las tareas se puedan ver.
    const ul = document.getElementById('listaTareas');
    ul.innerHTML = '';
    gestor.tareas.forEach((tarea, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${tarea.nombre}</span>
            <button onclick="editar(${index})">Editar</button>
            <button class="delete" onclick="eliminar(${index})">Eliminar</button>
        `;
        ul.appendChild(li);
    });
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

    // Evento que sirve para el botón de agregar tareas.
    document.getElementById('btnagregar').addEventListener('click', () => {
        const input = document.getElementById('TareaNueva');
        const valor = input.value.trim();
        if (valor === '') return mostrarError('Tarea vacía');
        gestor.agregarTarea(valor);
        input.value = '';
    });

    // Evento para borrar todas las tareas.
    document.getElementById('Borrar').addEventListener('click', () => {
        if (confirm('¿Limpiar todo?')) gestor.limpiarTodo();
    });

    // Verifica si hay una sesion iniciada al entrar a la página.
    if (gestor.token) {
        mostrarApp();
        gestor.cargarTareas();
    } else {
        mostrarLogin();
    }
});

window.eliminar = (index) => { // Funcion que sirve para eliminar solamente la tarea seleccionada.
    const id = gestor.tareas[index].id;
    if (confirm('¿Eliminar?')) gestor.eliminarTarea(id);
};

window.editar = (index) => { // Función para editar la tarea seleccionada.
    const tarea = gestor.tareas[index];
    const nuevo = prompt('Editar:', tarea.nombre);
    if (nuevo && nuevo.trim() !== '') {
        fetch(`${gestor.API_URL}/tareas/${tarea.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${gestor.token}`
            },
            body: JSON.stringify({ nombre: nuevo.trim() })
        }).then(res => {
            if (!res.ok) throw new Error();
            tarea.nombre = nuevo.trim(); // Actualizo local para que persista al refresh.
            renderizarTareas();
        }).catch(() => mostrarError('Error al editar'));
    }
};