import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
  withCredentials: true,
  timeout: 60000,
});


api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    } else {
        config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sesi kadaluarsa atau token tidak valid.");
      
      localStorage.clear(); 
      
      if (window.location.pathname !== '/login') {
         alert("Sesi Anda telah berakhir. Silakan login kembali.");
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;