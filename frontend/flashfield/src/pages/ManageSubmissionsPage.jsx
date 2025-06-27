import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Komponen-komponen UI ---
const LoadingSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-10 bg-slate-700 rounded w-1/2 mb-8"></div>
        <div className="bg-light-navy rounded-lg">
            <div className="p-6 h-16 bg-slate-700/30 rounded-t-lg"></div>
            <div className="p-4 space-y-3"><div className="h-12 bg-slate-700 rounded"></div><div className="h-12 bg-slate-700 rounded"></div></div>
        </div>
    </div>
);
const ErrorMessage = ({ message, onRetry }) => (
    <div className="text-center py-20 px-6 bg-light-navy rounded-lg"><h3 className="text-lg font-semibold text-red-400">Terjadi Kesalahan</h3><p className="mt-1 text-sm text-slate">{message}</p>{onRetry && <button onClick={onRetry} className="mt-6 btn-cyan text-sm font-bold py-2 px-5 rounded-md">Coba Lagi</button>}</div>
);
const EmptyState = ({ title, message }) => (
    <tr><td colSpan="4" className="text-center py-24 px-6"><svg className="mx-auto h-12 w-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg><h3 className="mt-2 text-lg font-semibold text-lightest-slate">{title}</h3><p className="mt-1 text-sm text-slate">{message}</p></td></tr>
);
const FormattedJsonData = ({ data }) => {
    if (typeof data !== 'object' || data === null || Object.keys(data).length === 0) return <span className="text-slate/70 italic">N/A</span>;
    return <div className="flex flex-col gap-1.5">{Object.entries(data).map(([key, value]) => (<div key={key} className="text-xs p-2 bg-navy/50 rounded flex justify-between items-center"><span className="font-semibold text-slate capitalize">{key.replace(/_/g, ' ')}:</span><span className="text-light-slate ml-2 font-mono break-all text-right">{Array.isArray(value) ? value.join(', ') : String(value)}</span></div>))}</div>;
};

// --- Komponen untuk Tab Statistik ---
const StatsTab = ({ submissions, experiment }) => {
    const stats = useMemo(() => {
        if (!submissions || submissions.length === 0 || !experiment?.input_fields) {
            return { numericStats: null, categoricalData: null };
        }
        let numericStats = null;
        let categoricalData = null;
        const numericField = experiment.input_fields.find(f => f.type === 'number');
        if (numericField) {
            const values = submissions.map(s => parseFloat(s.data_json[numericField.name])).filter(v => !isNaN(v));
            if (values.length > 0) {
                numericStats = {
                    label: numericField.label, unit: numericField.unit || '',
                    avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
                    min: Math.min(...values), max: Math.max(...values),
                };
            }
        }
        const categoricalField = experiment.input_fields.find(f => f.type === 'select' || f.type === 'radio');
        if (categoricalField) {
            const counts = submissions.reduce((acc, s) => {
                const value = s.data_json[categoricalField.name];
                if (value) acc[value] = (acc[value] || 0) + 1;
                return acc;
            }, {});
            categoricalData = {
                label: `Distribusi Jawaban untuk "${categoricalField.label}"`,
                chartData: {
                    labels: Object.keys(counts),
                    datasets: [{
                        label: 'Jumlah Jawaban', data: Object.values(counts),
                        backgroundColor: 'rgba(100, 255, 218, 0.6)', borderColor: '#64ffda', borderWidth: 1,
                    }],
                }
            };
        }
        return { numericStats, categoricalData };
    }, [submissions, experiment]);

    if (submissions.length === 0) return <div className="p-6 bg-light-navy rounded-lg text-center text-slate">Belum ada data untuk dianalisis.</div>;
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {stats.numericStats && (
                <div className="bg-light-navy p-6 rounded-lg">
                     <h3 className="text-xl font-bold text-lightest-slate mb-4">{stats.numericStats.label}</h3>
                     <div className="grid grid-cols-3 gap-4 text-center">
                        <div><p className="text-3xl font-bold text-cyan">{stats.numericStats.avg} <span className="text-lg text-slate">{stats.numericStats.unit}</span></p><p className="text-xs text-slate uppercase">Rata-rata</p></div>
                        <div><p className="text-3xl font-bold text-cyan">{stats.numericStats.min} <span className="text-lg text-slate">{stats.numericStats.unit}</span></p><p className="text-xs text-slate uppercase">Nilai Terendah</p></div>
                        <div><p className="text-3xl font-bold text-cyan">{stats.numericStats.max} <span className="text-lg text-slate">{stats.numericStats.unit}</span></p><p className="text-xs text-slate uppercase">Nilai Tertinggi</p></div>
                     </div>
                </div>
            )}
            {stats.categoricalData && (
                 <div className="bg-light-navy p-6 rounded-lg">
                     <h3 className="text-xl font-bold text-lightest-slate mb-4">{stats.categoricalData.label}</h3>
                     <div className="h-64">
                         <Bar data={stats.categoricalData.chartData} options={{ maintainAspectRatio: false, scales: {y: {ticks: {color: '#8892b0'}}, x: {ticks: {color: '#ccd6f6'}}} }} />
                     </div>
                 </div>
            )}
            {!stats.numericStats && !stats.categoricalData && (<div className="p-6 bg-light-navy rounded-lg text-center text-slate">Eksperimen ini tidak memiliki field numerik atau pilihan yang dapat divisualisasikan.</div>)}
        </div>
    );
};

// --- Halaman Utama Pengelolaan Eksperimen ---
function ManageExperimentPage() {
    const { id: experimentId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [experiment, setExperiment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('submissions');

    const fetchData = useCallback(async () => {
        if (!user || !experimentId) return;
        setLoading(true);
        setError('');
        try {
            const [expRes, subRes] = await Promise.all([
                apiClient.get(`/experiments/${experimentId}`),
                apiClient.get(`/experiments/${experimentId}/submissions`),
            ]);
            
            if (expRes.data.owner?.id !== user.id && user.role !== 'admin') {
                setError("Anda tidak memiliki izin untuk mengelola eksperimen ini.");
                return;
            }
            setExperiment(expRes.data);
            setSubmissions(subRes.data);
        } catch (err) {
            setError("Gagal memuat data. Pastikan ID eksperimen benar.");
        } finally {
            setLoading(false);
        }
    }, [experimentId, user]);

    useEffect(() => {
        if (!authLoading && experimentId) { fetchData(); }
    }, [authLoading, experimentId, fetchData]);

    const handleDeleteExperiment = async () => { /* ... (fungsi tidak berubah) ... */ };
    const formatDate = (dateString) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

    // --- FUNGSI BARU UNTUK EXPORT CSV ---
    const handleExportCSV = () => {
        if (submissions.length === 0) {
            alert("Tidak ada data untuk diekspor.");
            return;
        }

        // 1. Tentukan header CSV
        const headers = ['submission_id', 'user_id', 'timestamp', 'latitude', 'longitude'];
        experiment.input_fields.forEach(field => headers.push(field.name));

        // 2. Buat konten CSV
        let csvContent = headers.join(',') + '\n';
        submissions.forEach(sub => {
            const row = [
                sub.id,
                sub.user_id,
                `"${formatDate(sub.timestamp)}"`, // Bungkus tanggal dengan kutip
                sub.geo_lat || '',
                sub.geo_lng || ''
            ];

            experiment.input_fields.forEach(field => {
                let value = sub.data_json[field.name];
                if (value === undefined || value === null) {
                    value = '';
                } else if (Array.isArray(value)) {
                    value = `"${value.join('; ')}"`; // Gabungkan array dengan semikolon
                } else if (typeof value === 'string' && value.includes(',')) {
                    value = `"${value}"`; // Bungkus string dengan koma
                }
                row.push(value);
            });
            csvContent += row.join(',') + '\n';
        });

        // 3. Buat file dan unduh
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${experiment.title.replace(/\s+/g, '_')}_submissions.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    if (authLoading || loading) return <div className="max-w-7xl mx-auto py-12 px-4"><LoadingSkeleton /></div>;
    if (error) return <div className="max-w-7xl mx-auto py-12 px-4"><ErrorMessage message={error} onRetry={fetchData} /></div>;

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            {/* ... (Header halaman tidak berubah) ... */}

            <div className="border-b border-navy/50 mb-8">
                {/* ... (Navigasi Tab tidak berubah) ... */}
            </div>

            <div>
                {activeTab === 'submissions' && (
                    <div className="bg-light-navy rounded-lg shadow-lg overflow-hidden">
                        {/* --- PERBAIKAN: Tambahkan tombol Export di sini --- */}
                        <div className="p-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-lightest-slate">Data Submisi</h2>
                            <button onClick={handleExportCSV} className="btn-cyan text-sm font-bold py-2 px-4 rounded-md flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                <span>Export CSV</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-navy">
                                <thead className="bg-navy/50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Waktu</th><th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Lokasi</th><th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Data</th></tr></thead>
                                <tbody className="divide-y divide-navy">
                                    {submissions.length > 0 ? submissions.map(sub => (
                                        <tr key={sub.id}><td className="px-6 py-4 whitespace-nowrap text-sm text-slate">{formatDate(sub.timestamp)}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate">{sub.geo_lat ? `${sub.geo_lat}, ${sub.geo_lng}` : 'N/A'}</td><td className="px-6 py-4 text-sm"><FormattedJsonData data={sub.data_json} /></td></tr>
                                    )) : <EmptyState title="Belum Ada Submisi" message="Bagikan eksperimen Anda untuk mulai mengumpulkan data."/>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {/* ... (konten tab lain) ... */}
            </div>
        </div>
    );
}

export default ManageExperimentPage;
