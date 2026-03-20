import axios from 'axios';
import { API_BASE_URL } from './endpoints';
import { useAuthStore } from '../store/authStore';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
