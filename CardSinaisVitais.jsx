// src/components/CardSinaisVitais.jsx
import React from 'react';

// Retorna cor de status baseada no valor e nos limiares normais
function statusBPM(bpm) {
  if (!bpm) return 'cinza';
  if (bpm < 45 || bpm > 120) return 'vermelho';
  if (bpm < 55 || bpm > 100) return 'amarelo';
  return 'verde';
}
function statusSPO2(spo2) {
  if (!spo2) return 'cinza';
  if (spo2 < 90) return 'vermelho';
  if (spo2 < 95) return 'amarelo';
  return 'verde';
}

const cores = {
  verde:    { bg: '#dcfce7', texto: '#166534', borda: '#16a34a' },
  amarelo:  { bg: '#fef9c3', texto: '#854d0e', borda: '#ca8a04' },
  vermelho: { bg: '#fee2e2', texto: '#991b1b', borda: '#dc2626' },
  cinza:    { bg: '#f3f4f6', texto: '#6b7280', borda: '#d1d5db' },
};

function Indicador({ rotulo, valor, unidade, status }) {
  const c = cores[status];
  return (
    <div style={{
      background: c.bg,
      border: `1.5px solid ${c.borda}`,
      borderRadius: 10,
      padding: '10px 14px',
      minWidth: 90,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 11, color: c.texto, fontWeight: 500, marginBottom: 2 }}>{rotulo}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: c.texto, lineHeight: 1.1 }}>
        {valor ?? '—'}
      </div>
      <div style={{ fontSize: 11, color: c.texto }}>{unidade}</div>
    </div>
  );
}

export default function CardSinaisVitais({ idoso, sinais }) {
  const s = sinais || {};
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 14,
      padding: '16px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{idoso.idoso_nome}</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>Device: {idoso.device_id}</div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 500,
          background: s.bpm ? '#dcfce7' : '#f3f4f6',
          color:      s.bpm ? '#166534' : '#6b7280',
          padding: '3px 10px', borderRadius: 20,
        }}>
          {s.bpm ? '● ao vivo' : '○ aguardando'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Indicador rotulo="Batimentos"  valor={s.bpm}                 unidade="bpm"  status={statusBPM(s.bpm)} />
        <Indicador rotulo="SpO₂"        valor={s.spo2}                unidade="%"    status={statusSPO2(s.spo2)} />
        <Indicador rotulo="Pressão"
          valor={s.pressao_sistolica && s.pressao_diastolica
            ? `${s.pressao_sistolica}/${s.pressao_diastolica}` : null}
          unidade="mmHg" status="cinza" />
      </div>

      {s.timestamp && (
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 10 }}>
          Última leitura: {new Date(s.timestamp).toLocaleTimeString('pt-BR')}
        </div>
      )}
    </div>
  );
}