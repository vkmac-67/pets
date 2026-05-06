const fs = require('fs');
const path = require('path');
const express = require('express');
const pool = require('../config/db');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const [mascotas] = await pool.query(`
      SELECT m.id_mascota, m.nombre, m.especie, m.foto, d.nombre AS dueno
      FROM mascotas m
      INNER JOIN duenos d ON d.id_dueno = m.id_dueno
      ORDER BY m.id_mascota DESC
    `);

    res.render('mascotas/index', { title: 'Mascotas', mascotas });
  } catch (error) {
    next(error);
  }
});

router.get('/crear', async (_req, res, next) => {
  try {
    const duenos = await getDuenos();

    res.render('mascotas/form', {
      title: 'Nueva mascota',
      mascota: {},
      duenos,
      action: '/mascotas',
      method: 'POST',
      errors: []
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', upload.single('foto'), async (req, res, next) => {
  try {
    const { nombre, especie, id_dueno } = req.body;
    const foto = req.file ? req.file.filename : null;
    const errors = validateMascota(nombre, especie, id_dueno, foto, true);

    if (errors.length) {
      if (foto) deleteUpload(foto);

      res.status(422).render('mascotas/form', {
        title: 'Nueva mascota',
        mascota: { nombre, especie, id_dueno },
        duenos: await getDuenos(),
        action: '/mascotas',
        method: 'POST',
        errors
      });
      return;
    }

    await pool.query(
      {
        sql: 'INSERT INTO mascotas (nombre, especie, foto, id_dueno) VALUES (?, ?, ?, ?)',
        timeout: 10000
      },
      [nombre.trim(), especie.trim(), foto, id_dueno]
    );

    res.redirect('/mascotas');
  } catch (error) {
    if (req.file) deleteUpload(req.file.filename);
    next(error);
  }
});

router.get('/:id/editar', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mascotas WHERE id_mascota = ?', [req.params.id]);

    if (!rows.length) {
      res.redirect('/mascotas');
      return;
    }

    res.render('mascotas/form', {
      title: 'Editar mascota',
      mascota: rows[0],
      duenos: await getDuenos(),
      action: `/mascotas/${req.params.id}?_method=PUT`,
      method: 'POST',
      errors: []
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', upload.single('foto'), async (req, res, next) => {
  try {
    const { nombre, especie, id_dueno, foto_actual } = req.body;
    const nuevaFoto = req.file ? req.file.filename : null;
    const fotoFinal = nuevaFoto || foto_actual || null;
    const errors = validateMascota(nombre, especie, id_dueno, fotoFinal, false);

    if (errors.length) {
      if (nuevaFoto) deleteUpload(nuevaFoto);

      res.status(422).render('mascotas/form', {
        title: 'Editar mascota',
        mascota: {
          id_mascota: req.params.id,
          nombre,
          especie,
          id_dueno,
          foto: foto_actual
        },
        duenos: await getDuenos(),
        action: `/mascotas/${req.params.id}?_method=PUT`,
        method: 'POST',
        errors
      });
      return;
    }

    await pool.query(
      {
        sql: 'UPDATE mascotas SET nombre = ?, especie = ?, foto = ?, id_dueno = ? WHERE id_mascota = ?',
        timeout: 10000
      },
      [nombre.trim(), especie.trim(), fotoFinal, id_dueno, req.params.id]
    );

    if (nuevaFoto && foto_actual) deleteUpload(foto_actual);
    res.redirect('/mascotas');
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT foto FROM mascotas WHERE id_mascota = ?', [req.params.id]);

    await pool.query('DELETE FROM mascotas WHERE id_mascota = ?', [req.params.id]);

    if (rows[0] && rows[0].foto) deleteUpload(rows[0].foto);

    res.redirect('/mascotas');
  } catch (error) {
    next(error);
  }
});

async function getDuenos() {
  const [duenos] = await pool.query('SELECT * FROM duenos ORDER BY nombre ASC');
  return duenos;
}

function validateMascota(nombre, especie, idDueno, foto, requireFoto) {
  const errors = [];

  if (!nombre || !nombre.trim()) errors.push('El nombre de la mascota es obligatorio.');
  if (!especie || !especie.trim()) errors.push('La especie es obligatoria.');
  if (!idDueno) errors.push('Debe seleccionar un dueno.');
  if (requireFoto && !foto) errors.push('La foto de la mascota es obligatoria.');

  return errors;
}

function deleteUpload(filename) {
  const filePath = path.join(__dirname, '../../uploads', filename);

  fs.unlink(filePath, error => {
    if (error && error.code !== 'ENOENT') {
      console.error(`No se pudo eliminar ${filename}:`, error.message);
    }
  });
}

module.exports = router;
