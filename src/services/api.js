import axios from 'axios';
import {BaseURL} from '../config.js';

const api = axios.create({
  baseURL: BaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
    console.log('Attaching token:', token); // 🔍 debug line
 if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;