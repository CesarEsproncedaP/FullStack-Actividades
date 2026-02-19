# 📋 Gestor de Gastos Personales – Actividad 3 Full Stack

Este proyecto es una aplicación web Full Stack para la administración de gastos personales, donde los usuarios pueden registrar sus ingresos y gastos, editarlos, eliminarlos y visualizar un resumen financiero en tiempo real.

El sistema está dividido en frontend y backend, comunicándose a través de una API Restful con autenticación JWT. Los datos se guardan en archivos JSON en lugar de una base de datos.

---

## ⚠️ Requisitos antes de ejecutar el proyecto

Antes de iniciar el sistema, es necesario:

- Tener instalado Node.js
- Instalar las dependencias del proyecto

Si no se siguen estos pasos, el sistema no funcionará correctamente.

---

## 1. Clonar o descargar el proyecto

Entrar a la carpeta de la actividad:

```
cd Actividad3
```

## 2. Instalar dependencias

```
npm install express body-parser jsonwebtoken bcryptjs
```

## 3. Ejecutar el servidor

```
npm start
```

El servidor quedará activo en http://localhost:3000 y servirá automáticamente el frontend.

---

## Estructura del proyecto
```
Actividad3/
│
├── FrontEnd/
│   ├── index.html
│   ├── app.js
│   └── styles.css
│
├── movimientos.json
├── usuarios.json
├── package.json
├── server.js
└── README.md
```

---

## Funcionalidades

El sistema permite:

- Registro de usuarios
- Inicio de sesión
- Autenticación con token JWT
- Registro de ingresos y gastos
- Editar movimientos
- Borrar movimientos
- Resumen financiero (ingresos, gastos y saldo)

---

## Creador

- César Julián Espronceda Pantoja | Matrícula: AL07040765