import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const response = await apiClient.get('/users/me');
                    setUser(response.data);
                } catch (error) {
                    console.error("Token tidak valid atau sesi berakhir.", error);
                    localStorage.removeItem('accessToken');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, [token]);

    const login = (userData, accessToken, redirectPath = null) => {
        localStorage.setItem('accessToken', accessToken);
        setToken(accessToken);
        setUser(userData);
        
        // Redirect ke path yang diminta atau default dashboard
        if (redirectPath) {
            navigate(redirectPath);
        } else {
            navigate('/dashboardrole');
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setToken(null);
        setUser(null);
        delete apiClient.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    const authContextValue = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        loading
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};