import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Loading component untuk saat auth sedang loading
const AuthLoadingScreen = () => (
    <div className="flex justify-center items-center h-screen bg-navy">
        <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-4 text-cyan text-lg">Memverifikasi akses...</p>
        </div>
    </div>
);

// Komponen untuk melindungi route yang membutuhkan autentikasi
export const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    // Jika masih loading, tampilkan loading screen
    if (loading) {
        return <AuthLoadingScreen />;
    }

    // Jika butuh auth tapi user tidak login
    if (requireAuth && !isAuthenticated) {
        // Simpan current location untuk redirect setelah login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Jika ada role yang diizinkan dan user tidak memiliki role yang sesuai
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        console.warn(`Access denied: User role '${user.role}' not allowed. Required roles: [${allowedRoles.join(', ')}]`);
        // Tampilkan halaman Unauthorized alih-alih redirect
        return <Navigate to="/unauthorized" replace />;
    }

    // Jika sudah login tapi mencoba akses halaman public (login/register)
    if (!requireAuth && isAuthenticated) {
        // Redirect ke dashboard sesuai role
        switch (user?.role) {
            case 'admin':
                return <Navigate to="/admin/usermanagement" replace />;
            case 'researcher':
                return <Navigate to="/researcher/dashboard" replace />;
            case 'volunteer':
            default:
                return <Navigate to="/homepage" replace />;
        }
    }

    return children;
};

// Komponen khusus untuk route admin
export const AdminRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['admin']}>
        {children}
    </ProtectedRoute>
);

// Komponen khusus untuk route researcher
export const ResearcherRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['researcher']}>
        {children}
    </ProtectedRoute>
);

// Komponen khusus untuk route volunteer
export const VolunteerRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['volunteer']}>
        {children}
    </ProtectedRoute>
);

// Komponen untuk route yang bisa diakses researcher dan admin
export const ResearcherAdminRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['researcher', 'admin']}>
        {children}
    </ProtectedRoute>
);

// Komponen untuk route public (tidak perlu login)
export const PublicRoute = ({ children }) => (
    <ProtectedRoute requireAuth={false}>
        {children}
    </ProtectedRoute>
);

// Komponen khusus untuk route yang bisa diakses volunteer dan admin (tidak termasuk researcher)
export const VolunteerAdminRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
        {children}
    </ProtectedRoute>
);

// Komponen khusus untuk route yang hanya bisa diakses volunteer
export const VolunteerOnlyRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['volunteer']}>
        {children}
    </ProtectedRoute>
);
