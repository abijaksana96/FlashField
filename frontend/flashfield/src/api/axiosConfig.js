import axios from 'axios';

// Buat instance axios baru dengan konfigurasi dasar
const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000', // URL dasar dari API backend Anda
});

// Gunakan "interceptor" untuk memodifikasi request SEBELUM dikirim
apiClient.interceptors.request.use(
    (config) => {
        // Ambil token dari localStorage
        const token = localStorage.getItem('accessToken');
        
        // Jika token ada, tambahkan ke header Authorization
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config; // Lanjutkan request dengan header yang baru
    },
    (error) => {
        // Lakukan sesuatu jika ada error pada request
        return Promise.reject(error);
    }
);

export default apiClient;
