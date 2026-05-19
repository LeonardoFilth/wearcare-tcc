-- ============================================================
--  WearCare — Dados de exemplo (seed)
--  Use APENAS em ambiente de desenvolvimento/testes.
--  NUNCA execute em produção.
--
--  Como usar:
--    psql -d wearcare -f database/seed.sql
--
--  Senha de exemplo para os cuidadores: wearcare123
--  (hash bcrypt 12 rounds)
-- ============================================================

INSERT INTO cuidadores (nome, email, telefone, senha_hash) VALUES
(
  'Maria Silva',
  'maria@wearcare.dev',
  '+5511999990001',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUJqZxKR8/JqQrY4xL9KqXe4i'
),
(
  'João Santos',
  'joao@wearcare.dev',
  '+5511999990002',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUJqZxKR8/JqQrY4xL9KqXe4i'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO idosos (nome, data_nascimento, cuidador_id, device_id) VALUES
(
  'Ana Pereira',
  '1942-03-15',
  (SELECT id FROM cuidadores WHERE email = 'maria@wearcare.dev'),
  'esp32_001'
),
(
  'José Oliveira',
  '1938-07-22',
  (SELECT id FROM cuidadores WHERE email = 'joao@wearcare.dev'),
  'esp32_002'
)
ON CONFLICT (device_id) DO NOTHING;

-- Leituras de sinais vitais simuladas (últimas 24h)
INSERT INTO sinais_vitais
  (idoso_id, timestamp, bpm, spo2, pressao_sistolica, pressao_diastolica, qualidade_sinal)
SELECT
  (SELECT id FROM idosos WHERE device_id = 'esp32_001'),
  NOW() - (n || ' minutes')::interval,
  65 + (random() * 15)::int,
  95 + (random() * 4)::numeric(5,2),
  110 + (random() * 20)::int,
  70 + (random() * 15)::int,
  85 + (random() * 15)::int
FROM generate_series(1, 288, 5) AS n;

-- Localização GPS de exemplo (São Paulo — UNIVESP)
INSERT INTO localizacoes (idoso_id, latitude, longitude, precisao_m) VALUES
(
  (SELECT id FROM idosos WHERE device_id = 'esp32_001'),
  -23.5489, -46.6388, 5
);

-- Queda de exemplo (não confirmada — aguardando revisão)
INSERT INTO eventos_queda (idoso_id, latitude, longitude, acel_pico) VALUES
(
  (SELECT id FROM idosos WHERE device_id = 'esp32_001'),
  -23.5491, -46.6390, 3.24
);