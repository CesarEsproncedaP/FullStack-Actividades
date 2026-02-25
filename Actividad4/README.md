# 📦 Gestión de Productos - API RESTful

Aplicación fullstack para la gestión de productos de golf con autenticación JWT, pruebas unitarias automatizadas y despliegue.

## Aplicacion en vercel

**Aplicación desplegada en Vercel, tiene un token de 24 horas así que puede no funcionar, recomiendo ejecutar localmente:**  
[Ingresa aquí para ver la aplicación](https://full-stack-actividades-1pibg9irc-cesaresproncedaps-projects.vercel.app/)

**Credenciales de prueba:**

| Email | Contraseña |
|-------|------------|
| `cesarespronceda2@gmail.com` | `EJEMCONTRA` |
| `juanpruneda24@gmail.com` | `EJEMCONTRA` |

*También puedes crear tu propia cuenta desde el formulario de registro.*

---

## ⚙️ Instalación y Ejecución Local

### Requisitos previos:

Antes de comenzar, asegúrate de tener instalado:
- **Node.js** v18 o superior 
- **MongoDB**
- **Git** 
---

### Paso 1: Clonar el repositorio

### Paso 2: Instalar dependencias

Dentro de la carpeta del proyecto, ejecuta:

```bash
npm install
```

### Paso 3: Configurar variables de entorno

Crea un archivo llamado `.env` en la **raíz del proyecto** con el siguiente contenido:

```env
MONGODB_URI=mongodb+srv://cEspronceda<PASSWORD>@act4fullstack.jb4wa2t.mongodb.net/?appName=Act4FullStack
JWT_SECRET=cualquierPalabraSecreta123
PORT=3000
```
La contraseña no la incluí por seguridad, en caso de que la necesite me avisa para pasarsela por privado.

### Paso 4: Iniciar el servidor

Ejecuta el siguiente comando:

```bash
npm start
```

Deberías ver en la consola:

```
Conectado a MongoDB
🚀 Servidor en http://localhost:3000
```

---

### Paso 5: Abrir en el navegador

Abre tu navegador y ve a:

```
http://localhost:3000
```

Deberías ver la página de login/registro.

---

## 🧪 Ejecutar Pruebas

Para ejecutar las pruebas unitarias con Jest:

```bash
npm test
```

Deberías ver algo como:

```
 PASS  pruebas.test.js
  registro
    ✓ crea un usuario nuevo y devuelve token
    ✓ rechaza si el email ya existe
  login
    ✓ devuelve token con credenciales correctas
    ✓ rechaza si el usuario no existe
  productos
    ✓ obtenerTodos devuelve lista de productos
    ✓ obtenerUno devuelve 404 si no existe
    ✓ crear devuelve el producto creado
    ✓ actualizar devuelve 404 si no existe
    ✓ eliminar confirma eliminación

Tests:       9 passed, 9 total
```

---

## 🔐 Características de Seguridad

- ✅ **Contraseñas cifradas:** Todas las contraseñas se cifran con bcrypt usando 10 rondas antes de guardarse
- ✅ **Autenticación JWT:** Los tokens expiran en 24 horas por seguridad
- ✅ **Rutas protegidas:** Middleware verifica el token antes de permitir acceso a productos
- ✅ **Variables de entorno:** Secretos (JWT_SECRET, MONGODB_URI) nunca están en el código
- ✅ **HTTPS en producción:** Vercel proporciona SSL automáticamente

---

## ⚠️ Nota Importante sobre Tokens JWT

Los tokens JWT **expiran después de 24 horas** como medida de seguridad.

### ¿Qué significa esto?

Si inicias sesión y vuelves a entrar **después de 24 horas**, el token habrá expirado y no podrás cargar los productos.

### Solución rápida:

**Opción 1: Desde DevTools**
1. Presiona `F12` para abrir DevTools
2. Ve a la pestaña **Application** (o **Almacenamiento**)
3. En el menú izquierdo: **Local Storage** → selecciona tu dominio
4. Busca la key `token` y elimínala (🗑️)
5. Recarga la página (`F5`)
6. Vuelve a iniciar sesión

**Opción 2: Desde la consola del navegador**
1. Presiona `F12` para abrir DevTools
2. Ve a la pestaña **Console**
3. Escribe y presiona Enter:
```javascript
localStorage.removeItem('token');
location.reload();
```
## 🐛 Solución de Problemas Comunes

### Error: "Cannot connect to MongoDB"

**Causa:** No se puede conectar a la base de datos.

**Solución:**
1. Verifica que MongoDB esté corriendo (si es local)
2. Verifica que la URL en `.env` sea correcta
3. Si usas MongoDB Atlas, verifica:
   - Que tu IP esté en la whitelist
   - Que el usuario/contraseña sean correctos
   - Que la URL tenga el formato correcto

### Error: "Port 3000 is already in use"

**Causa:** El puerto 3000 ya está siendo usado por otro proceso.

**Solución:**
1. Cierra otras aplicaciones que puedan estar usando el puerto
2. O cambia el puerto en `.env`:
```env
PORT=3001
```

### Error: "jwt must be provided"

**Causa:** El token no se está enviando correctamente.

**Solución:**
1. Verifica que hayas iniciado sesión
2. Verifica que el token esté en localStorage (DevTools → Application → Local Storage)
3. Si no está, vuelve a iniciar sesión

### Página en blanco al abrir localhost:3000

**Causa:** Los archivos del frontend no se están sirviendo correctamente.

**Solución:**
1. Verifica que la carpeta `FrontEnd` exista
2. Verifica que tenga los archivos `login.html` y `dashboard.html`
3. Reinicia el servidor (`Ctrl+C` y luego `npm start`)

---

## 👨‍💻 Autor

**César Julián Espronceda Pantoja AL07040765**
- **Docente:** Ing. Paco Gómez Rubio
