// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { useSocket }          from '../hooks/useSocket';
import CardSinaisVitais       from '../components/CardSinaisVitais';
import AlertaQueda            from '../components/AlertaQueda';
import { getIdosos, getSinais } from '../services/api';

// Corrige o ícone padrão do Leaflet no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function Dashboard() {
  const { conectado, sinaisAoVivo, locAoVivo, ultimaQueda, dispensarAlerta } = useSocket();

  const [idosos,         setIdosos]         = useState([]);
  const [idosoSelecionado, setIdosoSel]     = useState(null);
  const [historicoSinais,  setHistorico]    = useState([]);

  // Carrega lista de idosos
  useEffect(() => {
    getIdosos().then(r => {
      setIdosos(r.data);
      if (r.data.length > 0) setIdosoSel(r.data[0].idoso_id);
    }).catch(console.error);
  }, []);

  // Carrega histórico do idoso selecionado
  useEffect(() => {
    if (!idosoSelecionado) return;
    getSinais(idosoSelecionado, 6).then(r => {
      const formatado = r.data.map(s => ({
        hora:  new Date(s.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        BPM:   s.bpm,
        'SpO₂': s.spo2,
      }));
      setHistorico(formatado);
    }).catch(console.error);
  }, [idosoSelecionado]);

  // Centro do mapa: usa primeira localização disponível ou São Paulo
  const primLoc = Object.values(locAoVivo)[0];
  const centroMapa = primLoc
    ? [primLoc.lat, primLoc.lng]
    : [-23.55, -46.63];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>

      {/* Alerta de queda (modal) */}
      <AlertaQueda queda={ultimaQueda} onDismiss={dispensarAlerta} />

      {/* Header */}
      <header style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>🩺</span>
          <span style={{ fontWeight: 700, fontSize: 17 }}>WearCare — Monitoramento de Idosos</span>
        </div>
        <div style={{
          fontSize: 12, fontWeight: 500,
          background: conectado ? '#dcfce7' : '#fee2e2',
          color:      conectado ? '#166534' : '#991b1b',
          padding: '4px 12px', borderRadius: 20,
        }}>
          {conectado ? '● Conectado' : '○ Desconectado'}
        </div>
      </header>

      <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Coluna esquerda: cards de idosos */}
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Monitoramento em tempo real
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {idosos.map(idoso => (
                <div
                  key={idoso.idoso_id}
                  onClick={() => setIdosoSel(idoso.idoso_id)}
                  style={{ cursor: 'pointer', outline: idoso.idoso_id === idosoSelecionado ? '2px solid #6366f1' : 'none', borderRadius: 14 }}
                >
                  <CardSinaisVitais
                    idoso={idoso}
                    sinais={sinaisAoVivo[idoso.idoso_id] || idoso}
                  />
                </div>
              ))}
              {idosos.length === 0 && (
                <div style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: 32 }}>
                  Nenhum dispositivo conectado ainda.
                </div>
              )}
            </div>
          </div>

          {/* Coluna direita: mapa */}
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Localização em tempo real
            </h2>
            <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb', height: 340 }}>
              <MapContainer center={centroMapa} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {Object.entries(locAoVivo).map(([idosoId, loc]) => {
                  const idoso = idosos.find(i => i.idoso_id === idosoId);
                  return (
                    <Marker key={idosoId} position={[loc.lat, loc.lng]}>
                      <Popup>{idoso?.idoso_nome ?? 'Idoso'}</Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>

        </div>

        {/* Gráfico histórico de sinais vitais */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 14, padding: '20px 24px', marginTop: 24,
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Histórico — últimas 6h
          </h2>
          {historicoSinais.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={historicoSinais}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="hora" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="BPM"   stroke="#6366f1" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="SpO₂"  stroke="#10b981" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: 32, fontSize: 13 }}>
              Selecione um idoso para ver o histórico.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}