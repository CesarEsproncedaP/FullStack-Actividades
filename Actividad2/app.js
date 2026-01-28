class Tarea { //Clase que se pide en las instrucciones, la cual representa cada tarea.
    constructor(nombre) {
        this.nombre = nombre;
    }

    editar(contenido) { // Metodo para poder editar las tareas que ya fueron agregadas.
        this.nombre = contenido;
    }
}

class GestorDeTareas { // Clase que maneja a la lista de tareas
    constructor() {
        this.tareas = [];
        this.cargar();
    }

    agregarTarea(tarea) { // Metodo que sirve para agregar tareas al gestor.
        this.tareas.push(tarea);
        this.guardar();
    }

    eliminarTarea(index) {// Este metodo elimina la tarea que tu selecciones.
        this.tareas.splice(index, 1);
        this.guardar();
    }

    limpiarTodo() { // Elimina todas las tareas previamente agregadas.
        this.tareas = [];
        this.guardar();
    }

    cargar() { // Carga desde el LocalStorage.
        const saved = localStorage.getItem('tareas');
        if (saved) {
            this.tareas = JSON.parse(saved).map(t => new Tarea(t.nombre));
        }
    }

    guardar() {// Guarda las tareas en el LocalStoraghg.
        localStorage.setItem('tareas', JSON.stringify(this.tareas));
    }
}

const gestor = new GestorDeTareas();

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

// Evento que sirve para el botón de agregar tareas.
document.getElementById('btnagregar').addEventListener('click', () => {
    const input = document.getElementById('TareaNueva');
    const valor = input.value.trim();
    if (valor === '') {
        alert('No se puede agregar una tarea vacía.');
        return;
    }
    const tarea = new Tarea(valor);
    gestor.agregarTarea(tarea);
    renderizarTareas();
    input.value = '';
});
// Evento para borrar todas las tareas del gestor.
document.getElementById('Borrar').addEventListener('click', () => {
    if (confirm('¿Estás seguro de limpiar todas las tareas?')) {
        gestor.limpiarTodo();
        renderizarTareas();
    }
});

function eliminar(index) { // Funcion que sirve apra eliminar solamente la tarea seleccionada.
    gestor.eliminarTarea(index);
    renderizarTareas();
}

function editar(index) { // Función para editar la tarea seleccionada.
    const nuevo = prompt('Editar tarea:', gestor.tareas[index].nombre);
    if (nuevo !== null && nuevo.trim() !== '') {
        gestor.tareas[index].editar(nuevo.trim());
        gestor.guardar();
        renderizarTareas();
    } else if (nuevo !== null) {
        alert('La tarea no puede estar vacía.');
    }
}

// Muestra las tareas al iniciar o reiniciar la pagina.
renderizarTareas();