<div align="center">

<img src="https://img.shields.io/badge/ESP32-Firmware-0f2744?style=for-the-badge&logo=espressif&logoColor=white"/>
<img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
<img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/PostgreSQL-Banco%20de%20Dados-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
<img src="https://img.shields.io/badge/MQTT-IoT-660066?style=for-the-badge&logo=eclipse-mosquitto&logoColor=white"/>
<img src="https://img.shields.io/badge/Socket.io-Tempo%20Real-010101?style=for-the-badge&logo=socket.io&logoColor=white"/>

<br/><br/>

# 🩺 WearCare

**Sistema de Monitoramento de Idosos com Dispositivo Vestível**

*Trabalho de Conclusão de Curso — Engenharia da Computação*
*Universidade Virtual do Estado de São Paulo — UNIVESP · 2026*

</div>

---

## 👥 Autores

| Nome | Curso | Instituição |
|---|---|---|
| Brenda Maria de Souza Santos | Engenharia da Computação | UNIVESP |
| Felipe Daher Rodrigues de Souza | Engenharia da Computação | UNIVESP |
| Gabriel Charlui Correa | Engenharia da Computação | UNIVESP |
| Leonardo Souza de Oliveira | Engenharia da Computação | UNIVESP |
| Tatiane de Sena Payao | Engenharia da Computação | UNIVESP |
| Thiago dos Santos Ribeiro | Engenharia da Computação | UNIVESP |
| Jamile Abnara de Oliveira | Engenharia da Computação | UNIVESP |

---

## 📋 Sobre o Projeto

O **WearCare** é um sistema completo de monitoramento contínuo de saúde para idosos. Um dispositivo vestível baseado no **ESP32** coleta dados dos sensores biomédicos e inerciais, publica via **MQTT** para um servidor backend que persiste tudo no **PostgreSQL** e exibe em tempo real no **dashboard React** via WebSocket.

O sistema foi desenvolvido como resposta ao acelerado envelhecimento da população brasileira e à alta incidência de quedas em idosos — terceira causa de mortalidade nessa faixa etária no Brasil (Ministério da Saúde, 2022).

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🚨 Detecção de quedas | Algoritmo baseado em acelerômetro MPU-6050 com limiar de 2,5g |
| ❤️ Frequência cardíaca | Leitura contínua via sensor óptico MAX30102 |
| 🩸 Oxigenação (SpO₂) | Fotopletismografia infravermelha pelo MAX30102 |
| 📍 Localização GPS | Posição em tempo real via módulo NEO-6M |
| 📲 Alertas instantâneos | SMS (Twilio) e e-mail ao cuidador em eventos de queda |
| 📊 Dashboard web | Gráficos históricos e cards de sinais vitais ao vivo |
| 🔐 Autenticação JWT | Login seguro do cuidador com token expiração configurável |
| 🔌 Tempo real | WebSocket via Socket.io — sem polling, sem recarregar a página |

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────┐
│           ESP32 — Dispositivo Vestível           │
│  MAX30102 (I²C) · MPU-6050 (I²C) · NEO-6M (UART)│
│  Algoritmo de queda: |a| = √(ax²+ay²+az²) > 2,5g│
└────────────────┬────────────────────────────────┘
                 │  MQTT  (JSON payload)
                 ▼
┌─────────────────────────────────────────────────┐
│              Broker MQTT                         │
│       HiveMQ Cloud (desenvolvimento)             │
│     Tópicos: wearable/{id}/sinais|gps|queda      │
└────────────────┬────────────────────────────────┘
                 │  Subscribe
                 ▼
┌─────────────────────────────────────────────────┐
│          Backend — Node.js + Express             │
│   mqttService → models → PostgreSQL              │
│   API REST (JWT) · Socket.io (WebSocket)         │
│   alertService → SMS + E-mail                    │
└────────────────┬──────────────────────┬─────────┘
                 │ REST API             │ WebSocket
                 ▼                     ▼
┌─────────────────────────────────────────────────┐
│           Frontend — React                       │
│   CardSinaisVitais · AlertaQueda · Dashboard     │
│   Recharts (gráficos) · Leaflet (mapa GPS)       │
└─────────────────────────────────────────────────┘
                       │
                       ▼
               Familiar / Cuidador
```

---

## 🔩 Hardware

| Componente | Função | Interface | Pinos ESP32 |
|---|---|---|---|
| ESP32 DevKit | MCU + Wi-Fi | — | — |
| MAX30102 | SpO₂ + BPM | I²C | SDA=21, SCL=22 |
| MPU-6050 | Acelerômetro + Giroscópio (queda) | I²C | SDA=21, SCL=22 |
| NEO-6M | GPS | UART | RX2=16, TX2=17 |

### Algoritmo de detecção de queda

```
Passo 1: Lê ax, ay, az do MPU-6050
Passo 2: Calcula |a| = √(ax² + ay² + az²)
Passo 3: Se |a| > 2,5g → registra impacto
Passo 4: Aguarda 500ms
Passo 5: Se |a| < 0,3g → QUEDA CONFIRMADA → publica MQTT
         Se |a| ≥ 0,3g → movimento normal → descarta
```

---

## 📁 Estrutura do Repositório

```
wearcare-tcc/
│
├── 📁 firmware/
│   └── wearable_esp32.ino        ← Código C++ para o ESP32
│
├── 📁 database/
│   ├── schema.sql                 ← Cria todas as tabelas + VIEW
│   └── seed.sql                   ← Dados de exemplo (dev/teste)
│
├── 📁 backend/
│   ├── .env.example               ← Modelo de variáveis (NÃO commite .env)
│   ├── package.json
│   └── src/
│       ├── server.js              ← Ponto de entrada (HTTP + Socket.io)
│       ├── config/
│       │   └── database.js        ← Pool PostgreSQL
│       ├── routes/
│       │   └── index.js           ← Todos os endpoints REST
│       └── services/
│           └── mqttService.js     ← Subscribe MQTT + emissão WebSocket
│
├── 📁 frontend/
│   ├── .env.example
│   └── src/
│       ├── pages/
│       │   └── Dashboard.jsx      ← Página principal
│       ├── components/
│       │   ├── CardSinaisVitais.jsx
│       │   └── AlertaQueda.jsx
│       ├── hooks/
│       │   └── useSocket.js       ← WebSocket em tempo real
│       └── services/
│           └── api.js             ← Chamadas axios para o backend
│
├── 📁 .github/workflows/
│   └── ci.yml                     ← GitHub Actions (testes automáticos)
│
├── .gitignore                     ← Protege .env e node_modules
└── README.md
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org) v18 ou superior
- [PostgreSQL](https://www.postgresql.org) v14 ou superior  
- [Arduino IDE](https://www.arduino.cc/en/software) (para o firmware)
- [Git](https://git-scm.com)

### 1. Clone o repositório

```bash
git clone https://github.com/SEU_USUARIO/wearcare-tcc.git
cd wearcare-tcc
```

### 2. Configure o banco de dados

```bash
# Cria o banco
createdb wearcare

# Cria as tabelas e VIEW
psql -d wearcare -f database/schema.sql

# (Opcional) Popula com dados de exemplo para testar o dashboard
psql -d wearcare -f database/seed.sql
```

### 3. Configure e rode o backend

```bash
cd backend

# Cria seu .env a partir do modelo
cp .env.example .env

# Edite o .env com suas credenciais do PostgreSQL
# (veja a seção "Variáveis de Ambiente" abaixo)

# Instala dependências
npm install

# Inicia em modo desenvolvimento
npm start
# → Backend rodando em http://localhost:3001
```

### 4. Configure e rode o frontend

```bash
cd frontend

# Cria o .env do frontend
cp .env.example .env
# (REACT_APP_API_URL=http://localhost:3001 já está pré-configurado)

# Instala dependências
npm install

# Inicia
npm start
# → Abre automaticamente http://localhost:3000
```

### 5. Carregue o firmware no ESP32

1. Abra o Arduino IDE
2. Instale as bibliotecas via **Library Manager** (`Sketch → Include Library → Manage Libraries`):
   - `MAX30105` by SparkFun
   - `MPU6050` by Electronic Cats  
   - `TinyGPSPlus` by Mikal Hart
   - `PubSubClient` by Nick O'Leary
   - `ArduinoJson` by Benoit Blanchon
3. Abra `firmware/wearable_esp32.ino`
4. Edite as constantes no topo do arquivo:
   ```cpp
   const char* WIFI_SSID     = "SEU_WIFI";
   const char* WIFI_PASSWORD = "SUA_SENHA_WIFI";
   const char* DEVICE_ID     = "esp32_001";
   ```
5. Selecione a placa **ESP32 Dev Module** e a porta correta
6. Clique em **Upload**

---

## 🔑 Variáveis de Ambiente

Crie o arquivo `backend/.env` com base no `backend/.env.example`:

```env
# Servidor
PORT=3001
CORS_ORIGIN=http://localhost:3000

# PostgreSQL — preencha com suas credenciais reais
PGHOST=localhost
PGPORT=5432
PGDATABASE=wearcare
PGUSER=postgres
PGPASSWORD=sua_senha_aqui

# JWT — gere uma chave segura:
# node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=sua_chave_secreta_longa_aqui
JWT_EXPIRES_IN=7d

# MQTT
MQTT_URL=mqtt://broker.hivemq.com
MQTT_PORT=1883

# Notificações (opcional)
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
SMTP_HOST=smtp.gmail.com
SMTP_USER=seu@email.com
SMTP_PASS=senha_de_app
```

> ⚠️ **Segurança:** O arquivo `.env` está no `.gitignore` e **nunca** será enviado ao GitHub. Apenas o `.env.example` (sem valores reais) é versionado.

---

## 📡 API REST

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/idosos` | Lista todos os idosos com última leitura |
| `GET` | `/api/idosos/:id/sinais?horas=6` | Histórico de sinais vitais |
| `GET` | `/api/idosos/:id/localizacao` | Última posição GPS |
| `GET` | `/api/idosos/:id/quedas` | Histórico de eventos de queda |
| `PATCH` | `/api/quedas/:id/confirmar` | Confirmar ou negar queda |
| `POST` | `/api/idosos` | Cadastrar novo idoso |

### Payload MQTT publicado pelo ESP32

```json
// wearable/{device_id}/sinais
{
  "bpm": 72,
  "spo2": 98.5,
  "pressao_sistolica": 120,
  "pressao_diastolica": 80,
  "acel_x": 0.01,
  "acel_y": 0.02,
  "acel_z": 1.00,
  "qualidade": 95
}

// wearable/{device_id}/gps
{ "lat": -23.5489, "lng": -46.6388, "precisao": 5 }

// wearable/{device_id}/queda
{ "acel_pico": 3.24, "lat": -23.5489, "lng": -46.6388 }
```

---

## 🗄️ Banco de Dados (PostgreSQL)

```
cuidadores        idosos             sinais_vitais
──────────        ──────             ─────────────
id (UUID)         id (UUID)          id
nome              nome               idoso_id (FK)
email             device_id          timestamp
senha_hash        cuidador_id (FK)   bpm · spo2
                  ativo              pressao_sistolica/diastolica

localizacoes      eventos_queda      alertas_notificacoes
────────────      ─────────────      ────────────────────
idoso_id (FK)     idoso_id (FK)      cuidador_id (FK)
latitude          acel_pico          tipo (sms|email)
longitude         confirmado         status
timestamp         falso_positivo     enviado_em
```

---

## 🧪 Testes Automatizados

Os testes do backend rodam com **Jest + Supertest** e cobrem:

```bash
cd backend
npm test
```

| Arquivo de teste | Casos | O que testa |
|---|---|---|
| `auth.test.js` | 5 | Login, registro, token inválido |
| `idosos.test.js` | 8 | Todos os endpoints REST da API |
| `quedaDetection.test.js` | 6 | Algoritmo de detecção de queda |

O **GitHub Actions** (`.github/workflows/ci.yml`) roda os testes automaticamente a cada `push` ou `pull_request` para a branch `main`.

---

## 📚 Referências Bibliográficas

- ESPRESSIF SYSTEMS. *ESP32 Series Datasheet*. 2023. Disponível em: https://www.espressif.com
- MAXIM INTEGRATED. *MAX30102 High-Sensitivity Pulse Oximeter Datasheet*. 2018.
- INVENSENSE. *MPU-6050 Product Specification Rev 3.4*. 2013.
- U-BLOX. *NEO-6 GPS Module Data Sheet*. 2011.
- IBGE. *Projeções da População: Brasil e Unidades da Federação*. 2023.
- MINISTÉRIO DA SAÚDE. *Quedas de Idosos: Epidemiologia e Prevenção*. 2022.
- BANKS, A.; BRIGGS, R. *MQTT Version 5.0*. OASIS Standard. 2019.

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos como Trabalho de Conclusão de Curso da UNIVESP. Todos os direitos reservados aos autores.

---

<div align="center">

**WearCare · UNIVESP · Engenharia da Computação · 2026**

*Desenvolvido com dedicação para proteger quem mais amamos* 🩺

</div>