import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

// --- Komponen-komponen UI yang Dipercantik ---

// 1. Skeleton Loading BARU untuk setiap baris tabel
const SubmissionRowSkeleton = () => (
    <tr className="animate-pulse">
        <td className="px-6 py-4">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-3 bg-slate-700 rounded w-1/2 mt-2"></div>
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-slate-700 rounded w-full"></div>
        </td>
        <td className="px-6 py-4">
            <div className="space-y-2">
                <div className="h-3 bg-slate-700 rounded w-5/6"></div>
                <div className="h-3 bg-slate-700 rounded w-full"></div>
            </div>
        </td>
        <td className="px-6 py-4">
            <div className="h-6 bg-slate-700 rounded w-12 ml-auto"></div>
        </td>
    </tr>
);

const ErrorMessage = ({ message, onRetry }) => (
    <tr>
        <td colSpan="4" className="text-center py-20 px-6">
            <div className="flex flex-col items-center">
                <svg className="mx-auto h-12 w-12 text-red-500/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <h3 className="mt-2 text-lg font-semibold text-lightest-slate">Terjadi Kesalahan</h3>
                <p className="mt-1 text-sm text-slate">{message}</p>
                <button onClick={onRetry} className="mt-6 btn-cyan text-sm font-bold py-2 px-5 rounded-md">
                    Coba Lagi
                </button>
            </div>
        </td>
    </tr>
);

// 2. Tampilan Kosong (Empty State) yang dipercantik
const EmptyState = () => (
    <tr>
        <td colSpan="4" className="text-center py-24 px-6">
            <div className="flex flex-col items-center">
                <svg className="mx-auto h-12 w-12 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-lg font-semibold text-lightest-slate">Belum Ada Kontribusi</h3>
                <p className="mt-1 text-sm text-slate">Sepertinya Anda belum mengirimkan data apapun.</p>
                <div className="mt-6">
                    <Link to="/experiments" className="btn-cyan-solid text-sm font-bold py-2 px-5 rounded-md">
                        Mulai Berkontribusi
                    </Link>
                </div>
            </div>
        </td>
    </tr>
);

const FormattedJsonData = ({ data, schema }) => {
    if (typeof data !== 'object' || data === null || Object.keys(data).length === 0) {
        return <span className="text-slate/70 italic">N/A</span>;
    }
    const unitMap = {};
    if (schema) {
        schema.forEach(field => {
            if (field.unit) unitMap[field.name] = field.unit;
        });
    }
    return (
        <div className="flex flex-col gap-1.5">
            {Object.entries(data).map(([key, value]) => (
                <div key={key} className="text-xs">
                    <span className="font-semibold text-slate capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-light-slate ml-2">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                        {unitMap[key] && <span className="text-slate/80 ml-1">{unitMap[key]}</span>}
                    </span>
                </div>
            ))}
        </div>
    );
};

function Kontribusi() {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [experimentsMap, setExperimentsMap] = useState({});

    const fetchDashboardData = async () => {
        if (!user) { setLoading(false); return; }
        setLoading(true);
        setError('');
        try {
            const submissionsResponse = await apiClient.get('/users/me/submissions');
            const subs = submissionsResponse.data;
            setSubmissions(subs);
            const experimentIds = [...new Set(subs.map(s => s.experiment_id))];
            if (experimentIds.length > 0) {
                const experimentRequests = experimentIds.map(id => apiClient.get(`/experiments/${id}`));
                const experimentResponses = await Promise.all(experimentRequests);
                const expMap = {};
                experimentResponses.forEach(res => { expMap[res.data.id] = res.data; });
                setExperimentsMap(expMap);
            }
        } catch (err) {
            setError("Tidak dapat memuat riwayat kontribusi Anda.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const formatDate = (dateString) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-light-navy p-6 sm:p-8 rounded-lg shadow-lg mb-10">
                <h1 className="text-3xl md:text-4xl font-extrabold text-lightest-slate">
                    Selamat Datang, <span className="text-cyan">{user?.full_name || 'Volunteer'}</span>!
                </h1>
                <p className="mt-2 text-lg text-slate">Ini adalah ringkasan aktivitas dan kontribusi Anda.</p>
                <div className="mt-6 border-t border-navy/50 pt-4 flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-cyan">{loading ? '...' : submissions.length}</p>
                        <p className="text-xs text-slate uppercase">Total Submisi</p>
                    </div>
                </div>
            </div>

            <div className="bg-light-navy rounded-lg shadow-lg">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-lightest-slate">Riwayat Kontribusi Anda</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-navy/50">
                            <tr>
                                <th className="w-2/5 px-6 py-3 text-left text-xs font-medium text-slate uppercase tracking-wider">Eksperimen</th>
                                <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-slate uppercase tracking-wider">Tanggal</th>
                                <th className="w-2/5 px-6 py-3 text-left text-xs font-medium text-slate uppercase tracking-wider">Data Terkirim</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-navy">
                            {loading ? (
                                // Tampilkan efek loading skeleton
                                [...Array(3)].map((_, i) => <SubmissionRowSkeleton key={i} />)
                            ) : error ? (
                                <ErrorMessage message={error} onRetry={fetchDashboardData} />
                            ) : submissions.length > 0 ? (
                                submissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-navy/30 transition-colors duration-200">
                                        <td className="px-6 py-4 align-top">
                                            <Link to={`/experiments/${sub.experiment_id}`} className="font-bold text-base text-lightest-slate hover:text-cyan">
                                                {experimentsMap[sub.experiment_id]?.title || `Eksperimen #${sub.experiment_id}`}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 align-top whitespace-nowrap text-sm text-slate">{formatDate(sub.timestamp)}</td>
                                        <td className="px-6 py-4 align-top">
                                            <FormattedJsonData data={sub.data_json} schema={experimentsMap[sub.experiment_id]?.input_fields} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link to={`/experiments/${sub.experiment_id}`} className="text-cyan hover:underline">Lihat</Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <EmptyState />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Kontribusi;