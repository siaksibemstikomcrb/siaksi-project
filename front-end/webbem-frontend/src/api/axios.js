import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
  withCredentials: true,
  timeout: 60000, // <--- TAMBAHKAN INI (60 Detik / 1 Menit)
});

// 1. REQUEST INTERCEPTOR
// Kita HAPUS logika pengambilan token dari localStorage di sini.
// Karena token sekarang ada di dalam Cookie HTTP-Only yang tidak bisa dibaca JS.
// Browser otomatis akan menyertakan cookie tersebut di setiap request.

api.interceptors.request.use(
  (config) => {
    // CEK: Apakah data yang dikirim adalah FormData (Upload File)?
    if (config.data instanceof FormData) {
        // Jika ya, HAPUS header Content-Type.
        // Biarkan browser otomatis mengisinya dengan 'multipart/form-data; boundary=...'
        delete config.headers['Content-Type'];
    } else {
        // Jika bukan upload file (misal login, ambil data), baru set JSON
        config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. RESPONSE INTERCEPTOR (Tangkap Error 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika server membalas dengan 401 (Unauthorized) -> Token Cookie mati/salah
    if (error.response && error.response.status === 401) {
      console.warn("Sesi kadaluarsa atau token tidak valid.");
      
      // Hapus data user profile (bukan token, krn token di cookie)
      localStorage.clear(); 
      
      // Redirect paksa ke login page jika belum di sana
      if (window.location.pathname !== '/login') {
         alert("Sesi Anda telah berakhir. Silakan login kembali.");
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;