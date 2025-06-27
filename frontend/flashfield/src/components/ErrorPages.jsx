import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Komponen untuk halaman 404
export const NotFound = () => (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6">
        <div className="text-center">
            <div className="mb-8">
                <h1 className="text-9xl font-bold text-cyan opacity-50">404</h1>
            </div>
            <h2 className="text-3xl font-bold text-lightest-slate mb-4">
                Halaman Tidak Ditemukan
            </h2>
            <p className="text-slate mb-8 max-w-md">
                Maaf, halaman yang Anda cari tidak dapat ditemukan. 
                Mungkin halaman tersebut telah dipindahkan atau tidak pernah ada.
            </p>
            <div className="space-y-4">
                <Link 
                    to="/" 
                    className="inline-block btn-cyan-solid font-bold py-3 px-6 rounded-md"
                >
                    Kembali ke Beranda
                </Link>
                <br />
                <Link 
                    to="/experiments" 
                    className="inline-block text-cyan hover:text-lightest-slate transition-colors"
                >
                    Jelajahi Eksperimen
                </Link>
            </div>
        </div>
    </div>
);

// Komponen untuk akses tidak diizinkan
export const Unauthorized = () => {
    const { user, logout } = useAuth();
    
    const getDashboardUrl = () => {
        switch (user?.role) {
            case 'admin':
                return '/admin/usermanagement';
            case 'researcher':
                return '/researcher/dashboard';
            case 'volunteer':
            default:
                return '/homepage';
        }
    };

    return (
        <div className="min-h-screen bg-navy flex items-center justify-center px-6">
            <div className="text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-red-500 opacity-50">🚫</h1>
                </div>
                <h2 className="text-3xl font-bold text-lightest-slate mb-4">
                    Akses Ditolak
                </h2>
                <p className="text-slate mb-6 max-w-md">
                    Anda tidak memiliki izin untuk mengakses halaman ini. 
                    Role Anda saat ini: <span className="text-cyan font-semibold">{user?.role || 'Tidak diketahui'}</span>
                </p>
                <div className="space-y-4">
                    <Link 
                        to={getDashboardUrl()} 
                        className="inline-block btn-cyan-solid font-bold py-3 px-6 rounded-md"
                    >
                        Kembali ke Dashboard
                    </Link>
                    <br />
                    <button 
                        onClick={logout}
                        className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        Logout dan Login Ulang
                    </button>
                </div>
            </div>
        </div>
    );
};
