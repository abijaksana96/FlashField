import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Komponen loading sederhana
const LoadingScreen = () => (
    <div className="flex justify-center items-center h-screen bg-navy">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500"></div>
    </div>
);

// Komponen ini bertindak sebagai pemandu/router setelah login
function DashboardPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Jangan lakukan apa-apa jika masih loading
        if (loading) {
            return;
        }

        // Jika sudah tidak loading tapi tidak ada user, tendang ke login
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // Jika user ada, alihkan berdasarkan perannya
        if (user) {
            switch (user.role) {
                case 'admin':
                    navigate('/admin/usermanagement', { replace: true });
                    break;
                case 'researcher':
                    navigate('/researcher/dashboard', { replace: true });
                    break;
                case 'volunteer':
                default:
                    navigate('/homepage', { replace: true });
                    break;
            }
        }
    }, [user, loading, isAuthenticated, navigate]);

    // Selama proses pengalihan, tampilkan layar loading
    return <LoadingScreen />;
}

export default DashboardPage;