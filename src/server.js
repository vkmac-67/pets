const path = require('path');
const express = require('express');
const methodOverride = require('method-override');
require('dotenv').config();

const duenosRoutes = require('./routes/duenos.routes');
const mascotasRoutes = require('./routes/mascotas.routes');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.get('/', (_req, res) => {
  res.redirect('/mascotas');
});

app.use('/duenos', duenosRoutes);
app.use('/mascotas', mascotasRoutes);

app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Pagina no encontrada' });
});

app.use((err, req, res, _next) => {
  console.error(err);
  const message = err.message || 'Ocurrio un problema inesperado.';
  const isUploadError = err.name === 'MulterError' || message.includes('Solo se permiten imagenes');

  res.status(isUploadError ? 400 : 500).render('errors/500', {
    title: isUploadError ? 'Archivo no valido' : 'Error del servidor',
    message
  });
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
