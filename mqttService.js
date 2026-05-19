/**
 * src/services/mqttService.js
 * Conecta ao broker MQTT, assina tópicos do ESP32 e
 * repassa dados para o banco e para o dashboard via Socket.io.
 */
require('dotenv').config();
const mqtt = require('mqtt');
const db   = require('../config/database');

let _io = null;

function init(io) {
  _io = io;

  const client = mqtt.connect(process.env.MQTT_URL || 'mqtt://broker.hivemq.com', {
    port:       Number(process.env.MQTT_PORT) || 1883,
    clientId:   process.env.MQTT_CLIENT_ID   || `wearcare_${Date.now()}`,
    username:   process.env.MQTT_USER        || undefined,
    password:   process.env.MQTT_PASSWORD    || undefined,
    reconnectPeriod: 5000,
  });

  client.on('connect', () => {
    console.log(`✅ [MQTT] Conectado a ${process.env.MQTT_URL}`);
    client.subscribe('wearable/+/sinais', { qos: 1 });
    client.subscribe('wearable/+/gps',    { qos: 1 });
    client.subscribe('wearable/+/queda',  { qos: 1 });
  });

  client.on('message', async (topic, payload) => {
    try {
      const [, deviceId, tipo] = topic.split('/');
      const dados = JSON.parse(payload.toString());

      const { rows } = await db.query(
        'SELECT * FROM idosos WHERE device_id = $1 AND ativo = TRUE',
        [deviceId]
      );
      const idoso = rows[0];
      if (!idoso) return console.warn(`⚠️  [MQTT] Device desconhecido: ${deviceId}`);

      if (tipo === 'sinais') await processarSinais(idoso, dados);
      if (tipo === 'gps')    await processarGPS(idoso, dados);
      if (tipo === 'queda')  await processarQueda(idoso, dados);
    } catch (err) {
      console.error('❌ [MQTT]', err.message);
    }
  });

  client.on('error',     (err) => console.error('❌ [MQTT]', err.message));
  client.on('reconnect', ()    => console.log('🔄 [MQTT] Reconectando...'));
}

async function processarSinais(idoso, dados) {
  const { rows } = await db.query(
    `INSERT INTO sinais_vitais
       (idoso_id, bpm, spo2, pressao_sistolica, pressao_diastolica,
        acel_x, acel_y, acel_z, qualidade_sinal)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [idoso.id, dados.bpm ?? null, dados.spo2 ?? null,
     dados.pressao_sistolica ?? null, dados.pressao_diastolica ?? null,
     dados.acel_x ?? null, dados.acel_y ?? null, dados.acel_z ?? null,
     dados.qualidade ?? null]
  );
  _io?.emit('sinais_vitais', { idoso_id: idoso.id, idoso_nome: idoso.nome, ...rows[0] });
}

async function processarGPS(idoso, dados) {
  await db.query(
    `INSERT INTO localizacoes (idoso_id, latitude, longitude, precisao_m)
     VALUES ($1,$2,$3,$4)`,
    [idoso.id, dados.lat, dados.lng, dados.precisao ?? null]
  );
  _io?.emit('localizacao', { idoso_id: idoso.id, latitude: dados.lat, longitude: dados.lng, timestamp: new Date() });
}

async function processarQueda(idoso, dados) {
  const { rows } = await db.query(
    `INSERT INTO eventos_queda (idoso_id, latitude, longitude, acel_pico)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [idoso.id, dados.lat ?? null, dados.lng ?? null, dados.acel_pico ?? null]
  );
  const queda = rows[0];
  console.log(`🚨 [QUEDA] ${idoso.nome} — pico: ${dados.acel_pico}g`);
  _io?.emit('alerta_queda', {
    idoso_id: idoso.id, idoso_nome: idoso.nome,
    queda_id: queda.id, latitude: queda.latitude,
    longitude: queda.longitude, acel_pico: queda.acel_pico,
    timestamp: queda.timestamp,
  });
}

module.exports = { init };