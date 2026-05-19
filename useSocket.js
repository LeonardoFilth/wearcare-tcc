// src/hooks/useSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export function useSocket() {
  const socketRef = useRef(null);
  const [conectado,    setConectado]    = useState(false);
  const [sinaisAoVivo, setSinaisAoVivo] = useState({});
  const [locAoVivo,    setLocAoVivo]    = useState({});
  const [ultimaQueda,  setUltimaQueda]  = useState(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { reconnectionAttempts: 5 });
    const s = socketRef.current;

    s.on('connect',    () => setConectado(true));
    s.on('disconnect', () => setConectado(false));

    s.on('sinais_vitais', (d) =>
      setSinaisAoVivo(prev => ({ ...prev, [d.idoso_id]: d }))
    );
    s.on('localizacao', (d) =>
      setLocAoVivo(prev => ({ ...prev, [d.idoso_id]: { lat: d.latitude, lng: d.longitude } }))
    );
    s.on('alerta_queda', (d) => {
      setUltimaQueda(d);
      try { new Audio('/alert.mp3').play(); } catch (_) {}
    });

    return () => s.disconnect();
  }, []);

  const dispensarAlerta = useCallback(() => setUltimaQueda(null), []);

  return { conectado, sinaisAoVivo, locAoVivo, ultimaQueda, dispensarAlerta };
}