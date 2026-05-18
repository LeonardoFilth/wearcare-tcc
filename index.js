/**
 * src/routes/index.js
 * Endpoints da API REST do WearCare.
 */
const express = require('express');
const router  = express.Router();
const db      = require('../config/database');

// GET /api/idosos — lista todos com última leitura
router.get('/idosos', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM ultima_leitura_por_idoso');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/idosos/:id/sinais?horas=6
router.get('/idosos/:id/sinais', async (req, res) => {
  const horas = Math.min(Number(req.query.horas) || 6, 168);
  try {
    const { rows } = await db.query(
      `SELECT * FROM sinais_vitais
       WHERE idoso_id = $1
         AND timestamp >= NOW() - INTERVAL '${horas} hours'
       ORDER BY timestamp ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/idosos/:id/localizacao
router.get('/idosos/:id/localizacao', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM localizacoes
       WHERE idoso_id = $1
       ORDER BY timestamp DESC LIMIT 1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Localização não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/idosos/:id/quedas
router.get('/idosos/:id/quedas', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM eventos_queda
       WHERE idoso_id = $1
       ORDER BY timestamp DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PATCH /api/quedas/:id/confirmar
router.patch('/quedas/:id/confirmar', async (req, res) => {
  const { confirmado, falso_positivo, observacao } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE eventos_queda
       SET confirmado = $1, falso_positivo = $2,
           observacao = $3, atendido_em = NOW()
       WHERE id = $4 RETURNING *`,
      [confirmado ?? false, falso_positivo ?? false, observacao ?? null, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/idosos
router.post('/idosos', async (req, res) => {
  const { nome, data_nascimento, cuidador_id, device_id } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO idosos (nome, data_nascimento, cuidador_id, device_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nome, data_nascimento, cuidador_id, device_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
