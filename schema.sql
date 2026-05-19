CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: cuidadores
-- Pessoas que recebem alertas e acompanham o idoso
-- ============================================================
CREATE TABLE cuidadores (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  telefone    VARCHAR(20),
  senha_hash  TEXT NOT NULL,
  criado_em   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABELA: idosos
-- Cada idoso monitorado com seu dispositivo ESP32
-- ============================================================
CREATE TABLE idosos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome            VARCHAR(100) NOT NULL,
  data_nascimento DATE,
  cuidador_id     UUID NOT NULL REFERENCES cuidadores(id) ON DELETE CASCADE,
  device_id       VARCHAR(50) UNIQUE NOT NULL,   -- ID único do ESP32 (ex: "esp32_001")
  ativo           BOOLEAN DEFAULT TRUE,
  criado_em       TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABELA: sinais_vitais
-- Leituras periódicas dos sensores de saúde
-- ============================================================
CREATE TABLE sinais_vitais (
  id              BIGSERIAL PRIMARY KEY,
  idoso_id        UUID NOT NULL REFERENCES idosos(id) ON DELETE CASCADE,
  timestamp       TIMESTAMP NOT NULL DEFAULT NOW(),

  -- MAX30102
  bpm             SMALLINT,          -- batimentos por minuto
  spo2            NUMERIC(5,2),      -- oxigenação (ex: 98.50%)

  -- Pressão sanguínea (estimativa PTT ou sensor dedicado)
  pressao_sistolica   SMALLINT,      -- ex: 120 mmHg
  pressao_diastolica  SMALLINT,      -- ex: 80 mmHg

  -- MPU-6050 (dados brutos opcionais para análise)
  acel_x          NUMERIC(8,4),
  acel_y          NUMERIC(8,4),
  acel_z          NUMERIC(8,4),

  -- Qualidade do sinal
  qualidade_sinal SMALLINT CHECK (qualidade_sinal BETWEEN 0 AND 100)
);

-- Índice para consultas por idoso + tempo (dashboards e histórico)
CREATE INDEX idx_sinais_vitais_idoso_time ON sinais_vitais (idoso_id, timestamp DESC);

-- ============================================================
-- TABELA: localizacoes
-- Posições GPS registradas periodicamente
-- ============================================================
CREATE TABLE localizacoes (
  id          BIGSERIAL PRIMARY KEY,
  idoso_id    UUID NOT NULL REFERENCES idosos(id) ON DELETE CASCADE,
  timestamp   TIMESTAMP NOT NULL DEFAULT NOW(),
  latitude    DOUBLE PRECISION NOT NULL,
  longitude   DOUBLE PRECISION NOT NULL,
  precisao_m  SMALLINT           -- precisão GPS em metros
);

CREATE INDEX idx_localizacoes_idoso_time ON localizacoes (idoso_id, timestamp DESC);

-- ============================================================
-- TABELA: eventos_queda
-- Registro de quedas detectadas pelo algoritmo no ESP32
-- ============================================================
CREATE TABLE eventos_queda (
  id              BIGSERIAL PRIMARY KEY,
  idoso_id        UUID NOT NULL REFERENCES idosos(id) ON DELETE CASCADE,
  timestamp       TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Localização no momento da queda
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,

  -- Dados do sensor no momento do impacto
  acel_pico       NUMERIC(6,3),      -- aceleração resultante máxima (em g)

  -- Gestão do alerta
  confirmado      BOOLEAN DEFAULT FALSE,   -- cuidador confirmou que é real
  falso_positivo  BOOLEAN DEFAULT FALSE,   -- cuidador marcou como falso alarme
  atendido_em     TIMESTAMP,              -- quando o cuidador visualizou
  observacao      TEXT
);

CREATE INDEX idx_quedas_idoso ON eventos_queda (idoso_id, timestamp DESC);

-- ============================================================
-- TABELA: alertas_notificacoes
-- Histórico de todas as notificações enviadas
-- ============================================================
CREATE TABLE alertas_notificacoes (
  id              BIGSERIAL PRIMARY KEY,
  idoso_id        UUID NOT NULL REFERENCES idosos(id) ON DELETE CASCADE,
  cuidador_id     UUID NOT NULL REFERENCES cuidadores(id),
  queda_id        BIGINT REFERENCES eventos_queda(id),
  tipo            VARCHAR(20) NOT NULL CHECK (tipo IN ('sms', 'email', 'push', 'webhook')),
  status          VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'erro')),
  mensagem        TEXT,
  enviado_em      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- VIEW: ultima_leitura_por_idoso
-- Facilita o dashboard com o status atual de cada idoso
-- ============================================================
CREATE VIEW ultima_leitura_por_idoso AS
SELECT DISTINCT ON (sv.idoso_id)
  i.id            AS idoso_id,
  i.nome          AS idoso_nome,
  i.device_id,
  sv.timestamp    AS ultima_leitura,
  sv.bpm,
  sv.spo2,
  sv.pressao_sistolica,
  sv.pressao_diastolica,
  loc.latitude,
  loc.longitude
FROM idosos i
LEFT JOIN sinais_vitais sv ON sv.idoso_id = i.id
LEFT JOIN LATERAL (
  SELECT latitude, longitude
  FROM localizacoes
  WHERE idoso_id = i.id
  ORDER BY timestamp DESC
  LIMIT 1
) loc ON TRUE
WHERE i.ativo = TRUE
ORDER BY sv.idoso_id, sv.timestamp DESC;