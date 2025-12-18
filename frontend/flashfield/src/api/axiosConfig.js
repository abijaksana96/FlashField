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
        return Promise.reject(error);
    }
);

// Interceptor untuk handle response errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Jika mendapat 401 (Unauthorized), hapus token dan redirect ke login
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            // Hanya redirect jika tidak sedang di halaman login/register
            if (window.location.pathname !== '/login' && 
                window.location.pathname !== '/register' && 
                window.location.pathname !== '/') {
                window.location.href = '/login';
            }
        }
        
        // Jika mendapat 403 (Forbidden), user tidak punya permission
        if (error.response?.status === 403) {
            console.error('Access forbidden - insufficient permissions');
            // Redirect ke halaman unauthorized
            if (window.location.pathname !== '/unauthorized') {
                window.location.href = '/unauthorized';
            }
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;
