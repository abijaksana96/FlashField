import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

// Komponen untuk loading dan error
const LoadingSpinner = () => <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div></div>;
const ErrorMessage = ({ message }) => <div className="text-center py-10 text-red-400">{message}</div>;

function Dashboard() {
    // State untuk data pengguna dan submisinya
    const [user, setUser] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Ambil data user dan data submisi secara bersamaan
                const [userResponse, submissionsResponse] = await Promise.all([
                    apiClient.get('/users/me'),
                    apiClient.get('/users/me/submissions') // Endpoint baru yang perlu Anda buat di backend
                ]);
                setUser(userResponse.data);
                setSubmissions(submissionsResponse.data);
            } catch (err) {
                console.error("Gagal memuat data dashboard:", err);
                setError("Tidak dapat memuat data Anda. Silakan coba lagi nanti.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Fungsi untuk memformat tanggal
    const formatDate = (dateString) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            {/* Header Dashboard */}
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-lightest-slate">
                    Selamat Datang, <span className="text-cyan">{user?.full_name || 'Volunteer'}</span>!
                </h1>
                <p className="mt-2 text-lg text-slate">Ini adalah ringkasan aktivitas dan kontribusi Anda.</p>
            </div>

            {/* Kontainer Utama */}
            <div className="space-y-10">
                {/* Kartu Statistik */}
                <div className="bg-light-navy p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold text-lightest-slate">Statistik Kontribusi</h2>
                    <div className="mt-4">
                        <p className="text-4xl font-bold text-cyan">{loading ? '...' : submissions.length}</p>
                        <p className="text-slate">Total Submisi Terkirim</p>
                    </div>
                </div>

                {/* Tabel Riwayat Submisi */}
                <div className="bg-light-navy rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-lightest-slate">Riwayat Submisi Anda</h2>
                    </div>
                    <div className="overflow-x-auto">
                        {loading ? <LoadingSpinner /> : error ? <ErrorMessage message={error} /> : (
                            <table className="min-w-full divide-y divide-navy">
                                <thead className="bg-navy/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate uppercase tracking-wider">Eksperimen</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate uppercase tracking-wider">Tanggal</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate uppercase tracking-wider">Data Terkirim</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-navy">
                                    {submissions.length > 0 ? submissions.map((sub) => (
                                        <tr key={sub.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-lightest-slate">{sub.experiment.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate">{formatDate(sub.timestamp)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate font-mono text-xs">{JSON.stringify(sub.data_json)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link to={`/experiments/${sub.experiment_id}`} className="text-cyan hover:underline">Lihat</Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-slate">
                                                Anda belum mengirimkan data apapun. Ayo mulai berkontribusi!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Tombol Aksi Lanjutan */}
                <div className="text-center pt-6">
                    <Link to="/experiments" className="btn-cyan text-lg font-bold py-3 px-8 rounded-md">
                        Jelajahi Eksperimen Lain
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;