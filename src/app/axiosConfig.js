// src/app/axiosConfig.js
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://task-tracker-app.ap-south-1.elasticbeanstalk.com/api'
});

let getToken = () => null;
export const setTokenGetter = fn => { getToken = fn; };

instance.interceptors.request.use(config => {
  const token = getToken();
  if (token && config.url.startsWith('/api/')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;