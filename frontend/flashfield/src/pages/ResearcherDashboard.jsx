import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const LoadingSkeleton = () => (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12 animate-pulse">
        <div className="flex justify-between items-center">
            <div className="space-y-2">
                <div className="h-10 bg-slate-700 rounded w-64"></div>
                <div className="h-6 bg-slate-700 rounded w-80"></div>
            </div>
            <div className="h-12 bg-slate-700 rounded w-48"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-24 bg-light-navy rounded-lg"></div>
            <div className="h-24 bg-light-navy rounded-lg"></div>
        </div>
        <div className="bg-light-navy rounded-lg">
            <div className="p-6 h-16 bg-slate-700/30 rounded-t-lg"></div>
            <div className="p-4 space-y-3">
                <div className="h-12 bg-slate-700 rounded"></div>
                <div className="h-12 bg-slate-700 rounded"></div>
                <div className="h-12 bg-slate-700 rounded"></div>
            </div>
        </div>
    </div>
);

const ErrorMessage = ({ message, onRetry }) => (
    <div className="text-center py-20 px-6 bg-light-navy rounded-lg">
        <svg className="mx-auto h-12 w-12 text-red-500/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <h3 className="mt-2 text-lg font-semibold text-lightest-slate">Terjadi Kesalahan</h3>
        <p className="mt-1 text-sm text-slate">{message}</p>
        <button onClick={onRetry} className="mt-6 btn-cyan text-sm font-bold py-2 px-5 rounded-md">Coba Lagi</button>
    </div>
);

const EmptyState = () => (
    <div className="text-center py-24 px-6 bg-navy rounded-lg">
        <svg className="mx-auto h-12 w-12 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
        <h3 className="mt-2 text-lg font-semibold text-lightest-slate">Anda Belum Memulai Riset</h3>
        <p className="mt-1 text-sm text-slate">Ayo buat eksperimen pertama Anda dan undang para volunteer untuk berkontribusi.</p>
        <div className="mt-6">
            <Link to="/experiments/create" className="btn-cyan-solid text-sm font-bold py-2 px-5 rounded-md">
                Buat Eksperimen Pertama
            </Link>
        </div>
    </div>
);

const StatCard = ({ title, value, icon }) => (
    <div className="bg-light-navy p-6 rounded-lg shadow-lg flex items-center gap-4">
        <div className="bg-navy p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-3xl font-bold text-lightest-slate">{value}</p>
            <p className="text-slate">{title}</p>
        </div>
    </div>
);

function ResearcherDashboard() {
    const { user, loading: authLoading } = useAuth(); 
    const [experiments, setExperiments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && user && !['researcher', 'admin'].includes(user.role)) {
            window.location.href = '/unauthorized';
        }
    }, [user, authLoading]);

    const fetchMyExperiments = useCallback(async () => {
        if (!user) return;
        
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.get('/experiments/');
            const filteredExperiments = response.data.filter(exp => exp.owner?.id === user.id);
            setExperiments(filteredExperiments);
        } catch (err) {
            setError('Gagal memuat daftar eksperimen Anda.');
        } finally {
            setLoading(false);
        }
    }, [user]);
    useEffect(() => {
        if (!authLoading) {
            fetchMyExperiments();
        }
    }, [authLoading, fetchMyExperiments]);

    const totalSubmissions = useMemo(() => {
        return experiments.reduce((sum, exp) => sum + (exp.submissions?.length || 0), 0);
    }, [experiments]);

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { dateStyle: 'long' });
    if (authLoading || loading) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <LoadingSkeleton />
            </div>
        );
    }
    
    if (error) {
        return (
             <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <ErrorMessage message={error} onRetry={fetchMyExperiments} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-lightest-slate">Dashboard Peneliti</h1>
                    <p className="mt-2 text-lg text-slate">Kelola semua proyek riset Anda dari satu tempat.</p>
                </div>
                <Link to="/experiments/create" className="btn-cyan-solid font-bold py-2 px-6 rounded-md whitespace-nowrap">
                    + Buat Eksperimen Baru
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <StatCard title="Total Eksperimen Saya" value={experiments.length} icon={<svg className="h-6 w-6 text-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>} />
                <StatCard title="Total Submisi Diterima" value={totalSubmissions} icon={<svg className="h-6 w-6 text-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
            </div>

            <div className="bg-light-navy rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-lightest-slate">Eksperimen Saya</h2>
                </div>
                <div className="overflow-x-auto">
                    {experiments.length > 0 ? (
                        <table className="min-w-full divide-y divide-navy">
                            <thead className="bg-navy/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Judul</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Tanggal Dibuat</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Submisi</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy">
                                {experiments.map(exp => (
                                    <tr key={exp.id} className="hover:bg-navy/30">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-lightest-slate">{exp.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate">{formatDate(exp.created_at)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan">{exp.submissions?.length || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link to={`/experiments/create/${exp.id}`} className="btn-cyan text-xs font-bold py-1 px-3 rounded-md">Kelola</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </div>
        </div>
    );
}

export default ResearcherDashboard;
