import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(''); 
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!role) {
            setError('Silakan pilih peran Anda.');
            return; 
        }

        setLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:8000/auth/register', {
                full_name: fullName, 
                email: email, 
                password: password, 
                role: role,  
            });
            
            console.log('Registrasi berhasil:', response.data);
            alert('Registrasi berhasil! Anda akan diarahkan ke halaman login.');
            navigate('/login');

        } catch (err) {
            console.error('Registrasi gagal:', err.response ? err.response.data : err.message);
            if (err.response && err.response.data && err.response.data.detail) {
                 setError(err.response.data.detail);
            } else {
                setError('Registrasi gagal. Silakan coba lagi.');
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
                    Buat Akun Baru
                </h2>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4">
                        <label htmlFor="fullName" className="block text-slate text-sm font-medium mb-2">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full p-3 bg-navy text-lightest-slate rounded-md border border-slate/50 focus:border-cyan focus:ring-1 focus:ring-cyan focus:outline-none transition-colors"
                            placeholder="Nama Anda"
                            required
                            autoComplete="name"
                        />
                    </div>
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
                    <div className="mb-4">
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
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="role" className="block text-slate text-sm font-medium mb-2">
                            Daftar sebagai
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className={`w-full p-3 bg-navy rounded-md border border-slate/50 focus:border-cyan focus:ring-1 focus:ring-cyan focus:outline-none transition-colors ${!role ? 'text-slate' : 'text-lightest-slate'}`}
                            required>
                            <option value="" disabled>Pilih peran Anda...</option>
                            <option value="volunteer">Volunteer</option>
                            <option value="researcher">Researcher</option>
                        </select>
                    </div>
                    {error && (
                        <p className="text-red-400 text-sm text-center mb-4">{error}</p>
                    )}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full btn-cyan-solid font-bold py-3 px-4 rounded-md disabled:bg-slate/50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Mendaftarkan...' : 'Daftar'}
                    </button>
                </form>
                <p className="text-center text-slate text-sm mt-6">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="font-medium text-cyan hover:underline">
                        Masuk di sini
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

export default Register;