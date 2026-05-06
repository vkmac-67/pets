# CRUD de Mascotas y Duenos

Sistema CRUD completo con Express.js, MySQL, relacion entre tablas y carga de imagenes usando Multer.

## Funcionalidades

- CRUD de duenos: listar, crear, editar y eliminar.
- CRUD de mascotas: listar, crear, editar y eliminar.
- Relacion `mascotas.id_dueno -> duenos.id_dueno`.
- Listado de mascotas mostrando el dueno asociado.
- Carga y reemplazo de foto de la mascota.
- Validacion basica de campos obligatorios en backend.
- Interfaz responsive con Tailwind CSS.

## Requisitos

- Node.js 18 o superior.
- XAMPP con MySQL activo para entorno local.
- Base de datos MySQL externa para Render, por ejemplo Railway, Aiven, PlanetScale u otro proveedor compatible.

## Instalacion local con XAMPP

1. Clona o abre este proyecto.
2. Inicia Apache y MySQL desde XAMPP.
3. En phpMyAdmin o consola MySQL, ejecuta:

```sql
SOURCE database/schema.sql;
```

Tambien puedes copiar y pegar el contenido de `database/schema.sql` en phpMyAdmin.

4. Copia el archivo de variables:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

5. Instala dependencias:

```bash
npm install
```

6. Ejecuta el proyecto:

```bash
npm run dev
```

7. Abre:

```text
http://localhost:3000
```

## Variables de entorno

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=crud_mascotas
```

## Despliegue en Railway

Railway permite tener la aplicacion Node.js y una base MySQL dentro del mismo proyecto.

Pasos recomendados:

1. Sube el proyecto a GitHub.
2. En Railway, crea un nuevo proyecto desde tu repositorio.
3. Agrega un servicio MySQL con `+ New`.
4. En el servicio MySQL, copia o abre las variables generadas:

```text
MYSQLHOST
MYSQLPORT
MYSQLUSER
MYSQLPASSWORD
MYSQLDATABASE
```

5. En el servicio de la app Node, agrega esas variables. Puedes usar variables de referencia de Railway o copiarlas manualmente.
6. Railway detectara `npm start` automaticamente. El archivo `railway.json` tambien deja configurado:

```text
Start Command: npm start
Healthcheck Path: /
```

7. Ejecuta las tablas en la base MySQL de Railway usando `database/railway-schema.sql`.

Puedes conectarte con MySQL Workbench, DBeaver o phpMyAdmin usando el TCP Proxy publico del servicio MySQL de Railway.

La app ya reconoce automaticamente las variables de Railway:

```env
MYSQLHOST
MYSQLPORT
MYSQLUSER
MYSQLPASSWORD
MYSQLDATABASE
```

Tambien sigue soportando las variables locales:

```env
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

## Nota sobre imagenes en hosting

Las imagenes se guardan en la carpeta `uploads`. En hosting el disco puede no ser ideal para produccion, asi que el CRUD funciona para la demostracion, pero en produccion conviene usar Cloudinary, S3 u otro almacenamiento persistente.

## Estructura

```text
src/
  config/db.js
  middleware/upload.js
  routes/
    duenos.routes.js
    mascotas.routes.js
  views/
    duenos/
    mascotas/
    errors/
    partials/
  public/css/styles.css
uploads/
database/schema.sql
```
