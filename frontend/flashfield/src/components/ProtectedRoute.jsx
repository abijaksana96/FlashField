import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLoadingScreen = () => (
    <div className="flex justify-center items-center h-screen bg-navy">
        <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-4 text-cyan text-lg">Memverifikasi akses...</p>
        </div>
    </div>
);

export const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
        return <AuthLoadingScreen />;
    }

    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        console.warn(`Access denied: User role '${user.role}' not allowed. Required roles: [${allowedRoles.join(', ')}]`);
        return <Navigate to="/unauthorized" replace />;
    }

    if (!requireAuth && isAuthenticated) {
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

export const AdminRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['admin']}>
        {children}
    </ProtectedRoute>
);

export const ResearcherRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['researcher']}>
        {children}
    </ProtectedRoute>
);

export const VolunteerRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['volunteer']}>
        {children}
    </ProtectedRoute>
);

export const ResearcherAdminRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['researcher', 'admin']}>
        {children}
    </ProtectedRoute>
);

export const PublicRoute = ({ children }) => (
    <ProtectedRoute requireAuth={false}>
        {children}
    </ProtectedRoute>
);

export const VolunteerAdminRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
        {children}
    </ProtectedRoute>
);

export const VolunteerOnlyRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['volunteer']}>
        {children}
    </ProtectedRoute>
);
