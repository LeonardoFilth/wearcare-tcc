// src/components/AlertaQueda.jsx
import React from 'react';
import { confirmarQueda } from '../services/api';

export default function AlertaQueda({ queda, onDismiss }) {
  if (!queda) return null;

  const mapLink = queda.latitude
    ? `https://maps.google.com/?q=${queda.latitude},${queda.longitude}`
    : null;

  async function handleConfirmar(falsoPositivo) {
    try {
      await confirmarQueda(queda.queda_id, {
        confirmado:     !falsoPositivo,
        falso_positivo: falsoPositivo,
      });
    } catch (_) {}
    onDismiss();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, padding: 32,
        maxWidth: 420, width: '90%',
        border: '3px solid #dc2626',
        boxShadow: '0 20px 50px rgba(220,38,38,0.3)',
        animation: 'pulse 1s ease-in-out infinite',
      }}>
        <style>{`@keyframes pulse { 0%,100%{box-shadow:0 20px 50px rgba(220,38,38,.3)} 50%{box-shadow:0 20px 50px rgba(220,38,38,.6)} }`}</style>

        <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 8 }}>🚨</div>
        <h2 style={{ textAlign: 'center', color: '#dc2626', margin: '0 0 6px', fontSize: 22 }}>
          Queda Detectada!
        </h2>
        <p style={{ textAlign: 'center', color: '#374151', margin: '0 0 20px' }}>
          <strong>{queda.idoso_nome}</strong> pode ter sofrido uma queda.
        </p>

        <div style={{ background: '#fef2f2', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
          <div>⏰ {new Date(queda.timestamp).toLocaleString('pt-BR')}</div>
          {mapLink && (
            <div style={{ marginTop: 6 }}>
              📍 <a href={mapLink} target="_blank" rel="noreferrer" style={{ color: '#dc2626' }}>
                Ver localização no mapa
              </a>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => handleConfirmar(false)} style={{
            flex: 1, background: '#dc2626', color: '#fff',
            border: 'none', borderRadius: 10, padding: '12px 0',
            fontWeight: 600, cursor: 'pointer', fontSize: 14,
          }}>
            ✅ Confirmar queda
          </button>
          <button onClick={() => handleConfirmar(true)} style={{
            flex: 1, background: '#f3f4f6', color: '#374151',
            border: 'none', borderRadius: 10, padding: '12px 0',
            fontWeight: 600, cursor: 'pointer', fontSize: 14,
          }}>
            ❌ Falso alarme
          </button>
        </div>
      </div>
    </div>
  );
}