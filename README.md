# API REST de usuarios, eventos y categorías

Proyecto integrador desarrollado con Node.js, Express, MongoDB y Mongoose. La API permite registrar e iniciar sesión, gestionar perfiles, crear eventos asociados a un organizador y relacionarlos con categorías.

## Requisitos

- Node.js y npm instalados.
- MongoDB local o una instancia accesible de MongoDB Atlas.
- Postman para enviar solicitudes HTTP.

## Instalación y configuración

1. Abrir una terminal en la carpeta raíz del proyecto.
2. Instalar dependencias:

   ```powershell
   npm install
   ```

3. Crear el archivo local `.env` copiando `.env.example`:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Completar las variables de entorno en `.env`.
5. Iniciar MongoDB localmente o confirmar que la instancia configurada en `MONGODB_URI` esté disponible.
6. Iniciar la API:

   ```powershell
   npm run dev
   ```

El servidor usa el puerto indicado por `PORT` y, si no se define, el puerto `3000`. Las rutas de la API comienzan con `/api`.

### Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto HTTP del servidor. | `3000` |
| `MONGODB_URI` | URI usada por Mongoose para conectarse. Es la variable que consume la configuración actual. | `mongodb://localhost:27017/trabajo-practico-integrador-3` |
| `JWT_SECRET` | Secreto para firmar y verificar tokens. Usar un valor aleatorio y privado. | `una-clave-aleatoria-larga` |
| `JWT_EXPIRES_IN` | Vigencia del JWT, en un formato aceptado por `jsonwebtoken`. Si queda vacío, la aplicación usa `1d`. | `1d` |
| `DB_HOST` | Campo auxiliar de `.env.example`; la conexión actual no lo utiliza. | `localhost` |
| `DB_PORT` | Campo auxiliar de `.env.example`; la conexión actual no lo utiliza. | `27017` |
| `DB_NAME` | Campo auxiliar de `.env.example`; la conexión actual no lo utiliza. | `trabajo-practico-integrador-3` |
| `DB_USER` | Campo auxiliar de `.env.example`; la conexión actual no lo utiliza. | Vacío para MongoDB local sin autenticación |
| `DB_PASSWORD` | Campo auxiliar de `.env.example`; la conexión actual no lo utiliza. | Vacío para MongoDB local sin autenticación |

Para MongoDB Atlas, colocar la URI completa de conexión de Atlas en `MONGODB_URI`. No publicar ni compartir el archivo `.env`.

## Uso desde Postman

### Configuración inicial

Crear un entorno de Postman con:

| Variable | Valor inicial |
|---|---|
| `baseUrl` | `http://localhost:3000/api` |

Para las solicitudes con JSON, seleccionar **Body → raw → JSON** y enviar el encabezado:

```text
Content-Type: application/json
```

Iniciar sesión con `POST /auth/login` antes de probar rutas protegidas. La API devuelve el JWT en una cookie llamada `token`, con `httpOnly`. Postman normalmente guarda y reenvía esa cookie automáticamente para el mismo host; si no ocurre, revisar **Cookies** en Postman para `localhost`. En producción la cookie se marca `Secure`, por lo que requiere HTTPS.

Las respuestas tienen este formato general:

```json
{
  "msg": "Mensaje descriptivo",
  "data": {}
}
```

Los errores de validación devuelven estado `400` e incluyen `errors`.

## Endpoints de autenticación

### Registrar usuario

`POST {{baseUrl}}/auth/register` — público; responde `201 Created`.

```json
{
  "username": "ana123",
  "email": "ana@example.com",
  "password": "Password1",
  "profile": {
    "firstName": "Ana",
    "lastName": "Perez",
    "birthDate": "1998-05-10",
    "phone": "1122334455"
  }
}
```

El rol se asigna con el valor por defecto `user`; el registro no permite enviar un rol para convertirse en administrador. El registro no inicia sesión automáticamente.

Validaciones: nombre de usuario alfanumérico de 3 a 20 caracteres, email válido, contraseña de al menos 8 caracteres con mayúscula, minúscula y número, y perfil con nombre y apellido. La fecha de nacimiento y el teléfono son opcionales.

### Iniciar sesión

`POST {{baseUrl}}/auth/login` — público; responde `200 OK` y establece la cookie `token`.

```json
{
  "email": "ana@example.com",
  "password": "Password1"
}
```

Las credenciales incorrectas responden `401 Unauthorized`.

### Ver perfil propio

`GET {{baseUrl}}/auth/profile` — requiere sesión.

### Actualizar perfil propio

`PUT {{baseUrl}}/auth/profile` — requiere sesión. Se puede enviar uno o más campos:

```json
{
  "profile": {
    "firstName": "Ana Maria",
    "phone": "1198765432"
  }
}
```

### Cerrar sesión

`POST {{baseUrl}}/auth/logout` — requiere sesión; limpia la cookie `token`.

## Endpoints de usuarios

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/users` | Lista usuarios activos y sus eventos organizados. |
| `GET` | `/users/:id` | Obtiene un usuario activo y sus eventos. |
| `PUT` | `/users/:id` | Actualiza campos permitidos de un usuario. |
| `DELETE` | `/users/:id` | Marca al usuario como eliminado y elimina los eventos que organizó. |

`id` debe ser un ObjectId válido de MongoDB. Las consultas excluyen usuarios con `deletedAt` distinto de `null` y no devuelven la contraseña.

Todas las rutas de usuarios requieren autenticación y rol `admin`. Los IDs se validan como ObjectId de MongoDB; la actualización admite campos permitidos de usuario y perfil, y valida los datos antes de aplicar cambios. No se puede actualizar la contraseña desde este endpoint.

## Endpoints de eventos

Todas las rutas de eventos requieren autenticación. Al crear un evento, el organizador se toma del usuario autenticado; no se debe enviar `organizer` en el cuerpo.

| Método | Ruta | Permiso |
|---|---|---|
| `POST` | `/events` | Usuario autenticado |
| `GET` | `/events` | Usuario autenticado |
| `GET` | `/events/my` | Usuario autenticado; eventos organizados por la sesión actual |
| `GET` | `/events/:id` | Usuario autenticado |
| `PUT` | `/events/:id` | Organizador del evento o admin |
| `DELETE` | `/events/:id` | Organizador del evento o admin |

### Crear evento

`POST {{baseUrl}}/events`

```json
{
  "title": "Conferencia de tecnología",
  "description": "Un encuentro para compartir novedades de tecnología.",
  "startDate": "2027-05-10T14:00:00.000Z",
  "endDate": "2027-05-10T18:00:00.000Z",
  "capacity": 120,
  "price": 0,
  "status": "scheduled",
  "location": {
    "venue": "Centro Cultural",
    "address": "Avenida Central 123",
    "city": "Cordoba"
  },
  "categories": []
}
```

`categories` es opcional; cuando se envía, debe ser un array de IDs de categorías existentes. La API valida que la fecha final sea posterior a la inicial. Los eventos devuelven `organizer` y `categories` poblados.

### Listar eventos y consultar por ID

- `GET {{baseUrl}}/events`
- `GET {{baseUrl}}/events/my`
- `GET {{baseUrl}}/events/{{eventId}}`

### Actualizar evento

`PUT {{baseUrl}}/events/{{eventId}}` — el cuerpo puede contener solo los campos que se desean cambiar. Ejemplo:

```json
{
  "title": "Conferencia de tecnología actualizada",
  "endDate": "2027-05-10T19:00:00.000Z"
}
```

Las validaciones comprueban los campos enviados y el controlador valida las fechas considerando también los valores existentes.

### Eliminar evento

`DELETE {{baseUrl}}/events/{{eventId}}` — solo el organizador del evento o un admin.

## Endpoints de categorías

Todas las rutas de categorías requieren autenticación. Crear, actualizar y eliminar requieren además rol `admin`.

| Método | Ruta | Permiso |
|---|---|---|
| `POST` | `/categories` | Admin |
| `GET` | `/categories` | Usuario autenticado |
| `GET` | `/categories/:id` | Usuario autenticado; incluye eventos relacionados |
| `PUT` | `/categories/:id` | Admin |
| `DELETE` | `/categories/:id` | Admin |

### Crear categoría

`POST {{baseUrl}}/categories`

```json
{
  "name": "Tecnologia",
  "description": "Eventos y actividades de tecnología."
}
```

El nombre debe tener entre 2 y 30 caracteres; la descripción es opcional y tiene un máximo de 200.

### Listar y consultar categorías

- `GET {{baseUrl}}/categories`
- `GET {{baseUrl}}/categories/{{categoryId}}`

La consulta por ID incluye el virtual populate `events`.

### Actualizar categoría

`PUT {{baseUrl}}/categories/{{categoryId}}`

```json
{
  "description": "Charlas y encuentros tecnológicos."
}
```

### Eliminar categoría

`DELETE {{baseUrl}}/categories/{{categoryId}}`

Antes de eliminarla, se quita su referencia del array `categories` de los eventos asociados.

## Crear o habilitar un administrador

El endpoint público de registro no permite elegir `role`, y las operaciones de categoría requieren un usuario con `role: "admin"`. Para preparar un administrador de desarrollo, registrar primero un usuario y luego cambiar su rol directamente en MongoDB:

```javascript
db.users.updateOne(
  { email: "ana@example.com" },
  { $set: { role: "admin" } }
)
```

Después, iniciar sesión con ese usuario en Postman para que la cookie corresponda al admin actualizado. No habilitar ni exponer este cambio directo a través de un endpoint público.

## Validaciones y relaciones

- **User:** nombre de usuario y email únicos; contraseña hasheada con bcrypt; perfil embebido; baja lógica mediante `deletedAt`.
- **Event:** contiene ubicación embebida, referencia al organizador y array de referencias a categorías. La baja de un usuario elimina los eventos que organizó.
- **Category:** expone eventos asociados mediante virtual populate. Al borrar una categoría, se la remueve de las referencias de eventos.
- Los esquemas habilitan `timestamps`; los modelos con virtual populate habilitan virtuales en `toJSON` y `toObject`.
- Las rutas con validaciones devuelven `400 Bad Request` si el cuerpo o el ID no son válidos. Rutas protegidas responden `401 Unauthorized` sin autenticación y `403 Forbidden` sin permisos.

## Estructura principal

```text
app.js
src/
  config/          conexión con MongoDB
  controllers/     lógica de endpoints
  helpers/         utilidades de bcrypt y JWT
  middlewares/     autenticación y validación de requests
  models/          esquemas de Mongoose
  routes/          definición de rutas
```

## Problemas comunes

- **No conecta a MongoDB:** comprobar que MongoDB esté iniciado y que `MONGODB_URI` sea correcta.
- **JWT_SECRET no configurado:** completar `JWT_SECRET` y volver a iniciar el servidor.
- **La ruta protegida devuelve `401`:** iniciar sesión primero y comprobar que Postman conserve la cookie `token`.
- **Una operación de categoría devuelve `403`:** iniciar sesión con una cuenta cuyo campo `role` sea `admin`.
- **Una operación de usuario devuelve `403`:** iniciar sesión con una cuenta cuyo campo `role` sea `admin`.
- El proceso HTTP puede anunciarse aunque la conexión a MongoDB falle, porque el manejador actual de conexión registra el error sin detener el servidor. Las operaciones que requieran la base no funcionarán hasta resolver la conexión.
