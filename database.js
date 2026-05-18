/**
 * src/config/database.js
 * Pool de conexão com o PostgreSQL.
 * Lê as credenciais do .env — nunca hardcode aqui.
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.PGHOST     || 'localhost',
  port:     Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'wearcare',
  user:     process.env.PGUSER     || 'postgres',
  password: process.env.PGPASSWORD || '',
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

pool.on('connect', () => console.log('✅ [DB] Conectado ao PostgreSQL'));
pool.on('error',   (err) => console.error('❌ [DB] Erro no pool:', err.message));

module.exports = pool;
