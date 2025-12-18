import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoadingScreen = () => (
    <div className="flex justify-center items-center h-screen bg-navy">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500"></div>
    </div>
);

function DashboardPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) {
            return;
        }

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

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

    return <LoadingScreen />;
}

export default DashboardPage;