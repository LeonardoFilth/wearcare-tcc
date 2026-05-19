// src/server.js — ponto de entrada do backend
require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const routes = require('./index');
const mqttService = require('./services/mqttService');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
});

// ── Middlewares ─────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// ── Rotas REST ──────────────────────────────────────────────
app.use('/api', routes);

// ── Socket.io — conexão do dashboard ───────────────────────
io.on('connection', (socket) => {
  console.log(`📡 Dashboard conectado: ${socket.id}`);
  socket.on('disconnect', () => console.log(`Dashboard desconectado: ${socket.id}`));
});

// ── Inicia o serviço MQTT ───────────────────────────────────
mqttService.init(io);

// ── Sobe o servidor ─────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});