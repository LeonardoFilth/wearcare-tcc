// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
});

export const getIdosos      = ()           => api.get('/api/idosos');
export const getSinais      = (id, horas)  => api.get(`/api/idosos/${id}/sinais?horas=${horas || 6}`);
export const getLocalizacao = (id)         => api.get(`/api/idosos/${id}/localizacao`);
export const getQuedas      = (id)         => api.get(`/api/idosos/${id}/quedas`);
export const confirmarQueda = (id, body)   => api.patch(`/api/quedas/${id}/confirmar`, body);

export default api;
