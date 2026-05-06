const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const [duenos] = await pool.query(`
      SELECT d.id_dueno, d.nombre, d.telefono, COUNT(m.id_mascota) AS total_mascotas
      FROM duenos d
      LEFT JOIN mascotas m ON m.id_dueno = d.id_dueno
      GROUP BY d.id_dueno
      ORDER BY d.id_dueno DESC
    `);

    res.render('duenos/index', { title: 'Duenos', duenos });
  } catch (error) {
    next(error);
  }
});

router.get('/crear', (_req, res) => {
  res.render('duenos/form', {
    title: 'Nuevo dueno',
    dueno: {},
    action: '/duenos',
    method: 'POST',
    errors: []
  });
});

router.post('/', async (req, res, next) => {
  try {
    const { nombre, telefono } = req.body;
    const errors = validateDueno(nombre, telefono);

    if (errors.length) {
      res.status(422).render('duenos/form', {
        title: 'Nuevo dueno',
        dueno: { nombre, telefono },
        action: '/duenos',
        method: 'POST',
        errors
      });
      return;
    }

    await pool.query('INSERT INTO duenos (nombre, telefono) VALUES (?, ?)', [
      nombre.trim(),
      telefono.trim()
    ]);

    res.redirect('/duenos');
  } catch (error) {
    next(error);
  }
});

router.get('/:id/editar', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM duenos WHERE id_dueno = ?', [req.params.id]);

    if (!rows.length) {
      res.redirect('/duenos');
      return;
    }

    res.render('duenos/form', {
      title: 'Editar dueno',
      dueno: rows[0],
      action: `/duenos/${req.params.id}?_method=PUT`,
      method: 'POST',
      errors: []
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { nombre, telefono } = req.body;
    const errors = validateDueno(nombre, telefono);

    if (errors.length) {
      res.status(422).render('duenos/form', {
        title: 'Editar dueno',
        dueno: { id_dueno: req.params.id, nombre, telefono },
        action: `/duenos/${req.params.id}?_method=PUT`,
        method: 'POST',
        errors
      });
      return;
    }

    await pool.query('UPDATE duenos SET nombre = ?, telefono = ? WHERE id_dueno = ?', [
      nombre.trim(),
      telefono.trim(),
      req.params.id
    ]);

    res.redirect('/duenos');
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [mascotas] = await pool.query('SELECT COUNT(*) AS total FROM mascotas WHERE id_dueno = ?', [
      req.params.id
    ]);

    if (mascotas[0].total > 0) {
      const [duenos] = await pool.query(`
        SELECT d.id_dueno, d.nombre, d.telefono, COUNT(m.id_mascota) AS total_mascotas
        FROM duenos d
        LEFT JOIN mascotas m ON m.id_dueno = d.id_dueno
        GROUP BY d.id_dueno
        ORDER BY d.id_dueno DESC
      `);

      res.status(409).render('duenos/index', {
        title: 'Duenos',
        duenos,
        alert: 'No se puede eliminar un dueno que tiene mascotas registradas.'
      });
      return;
    }

    await pool.query('DELETE FROM duenos WHERE id_dueno = ?', [req.params.id]);
    res.redirect('/duenos');
  } catch (error) {
    next(error);
  }
});

function validateDueno(nombre, telefono) {
  const errors = [];

  if (!nombre || !nombre.trim()) errors.push('El nombre del dueno es obligatorio.');
  if (!telefono || !telefono.trim()) errors.push('El telefono es obligatorio.');

  return errors;
}

module.exports = router;
