import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        try {
            const response = await axios.post('http://127.0.0.1:8000/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            
            console.log('Login berhasil:', response.data);
            
            const from = location.state?.from?.pathname || null;
            login(response.data.user, response.data.access_token, from);

        } catch (err) {
            console.error('Login gagal:', err.response ? err.response.data : err.message);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Email atau password salah. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-navy min-h-screen flex flex-col items-center justify-center p-4">
            <div className="mb-8">
                <Link to="/" className="text-3xl font-bold text-lightest-slate">
                    Flash<span className="text-cyan">Field</span>
                </Link>
            </div>
            <div className="w-full max-w-md bg-light-navy p-8 rounded-lg shadow-lg shadow-black/50">
                <h2 className="text-2xl font-bold text-center text-lightest-slate mb-6">
                    Selamat Datang Kembali
                </h2>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-slate text-sm font-medium mb-2">
                            Alamat Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-navy text-lightest-slate rounded-md border border-slate/50 focus:border-cyan focus:ring-1 focus:ring-cyan focus:outline-none transition-colors"
                            placeholder="anda@email.com"
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password"  className="block text-slate text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-navy text-lightest-slate rounded-md border border-slate/50 focus:border-cyan focus:ring-1 focus:ring-cyan focus:outline-none transition-colors"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    {error && (
                        <p className="text-red-400 text-sm text-center mb-4">{error}</p>
                    )}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full btn-cyan-solid font-bold py-3 px-4 rounded-md disabled:bg-slate/50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>
                <p className="text-center text-slate text-sm mt-6">
                    Belum punya akun?{' '}
                    <Link to="/register" className="font-medium text-cyan hover:underline">
                        Daftar di sini
                    </Link>
                </p>
            </div>
            <div className="mt-4">
                <Link to="/" className="text-sm text-slate hover:text-cyan transition-colors">
                    &larr; Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}

export default Login;