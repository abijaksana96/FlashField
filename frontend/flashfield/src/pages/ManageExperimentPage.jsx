import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LoadingSkeleton = () => <div className="animate-pulse"><div className="h-10 bg-slate-700 rounded w-1/2 mb-8"></div><div className="bg-light-navy rounded-lg"><div className="p-6 h-16 bg-slate-700/30 rounded-t-lg"></div><div className="p-4 space-y-3"><div className="h-12 bg-slate-700 rounded"></div><div className="h-12 bg-slate-700 rounded"></div></div></div></div>;
const ErrorMessage = ({ message, onRetry }) => <div className="text-center py-20 px-6 bg-light-navy rounded-lg"><h3 className="text-lg font-semibold text-red-400">Terjadi Kesalahan</h3><p className="mt-1 text-sm text-slate">{message}</p>{onRetry && <button onClick={onRetry} className="mt-6 btn-cyan text-sm font-bold py-2 px-5 rounded-md">Coba Lagi</button>}</div>;
const EmptyState = ({ title, message }) => <tr><td colSpan="5" className="text-center py-24 px-6"><svg className="mx-auto h-12 w-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg><h3 className="mt-2 text-lg font-semibold text-lightest-slate">{title}</h3><p className="mt-1 text-sm text-slate">{message}</p></td></tr>;
const FormattedJsonData = ({ data }) => {
    if (typeof data !== 'object' || data === null || Object.keys(data).length === 0) return <span className="text-slate/70 italic">N/A</span>;
    return <div className="flex flex-col gap-1.5">{Object.entries(data).map(([key, value]) => (<div key={key} className="text-xs p-2 bg-navy/50 rounded flex justify-between items-center"><span className="font-semibold text-slate capitalize">{key.replace(/_/g, ' ')}:</span><span className="text-light-slate ml-2 font-mono break-all text-right">{Array.isArray(value) ? value.join('; ') : String(value)}</span></div>))}</div>;
};

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const start = Math.max(1, currentPage - 2);
            const end = Math.min(totalPages, start + maxVisible - 1);
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }
        
        return pages;
    };

    const pageNumbers = getPageNumbers();
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalPages <= 1) return null;

    return (
        <div className="bg-light-navy border-t border-navy/50">
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 gap-4">
                <div className="text-sm text-slate">
                    Menampilkan <span className="font-medium text-lightest-slate">{startItem}</span> sampai{' '}
                    <span className="font-medium text-lightest-slate">{endItem}</span> dari{' '}
                    <span className="font-medium text-lightest-slate">{totalItems}</span> total submisi
                </div>
                
                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                            currentPage === 1
                                ? 'text-slate/40 cursor-not-allowed bg-navy/20'
                                : 'text-slate hover:text-cyan hover:bg-navy/50 bg-navy/30'
                        }`}
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Sebelumnya
                    </button>
                    
                    <div className="flex items-center space-x-1">
                        {pageNumbers.map(page => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                    page === currentPage
                                        ? 'bg-cyan text-navy font-bold shadow-lg transform scale-105'
                                        : 'text-slate hover:text-cyan hover:bg-navy/50 bg-navy/30'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                            currentPage === totalPages
                                ? 'text-slate/40 cursor-not-allowed bg-navy/20'
                                : 'text-slate hover:text-cyan hover:bg-navy/50 bg-navy/30'
                        }`}
                    >
                        Selanjutnya
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatsTab = ({ submissions, experiment }) => {
    const analysis = useMemo(() => {
        if (!submissions || submissions.length === 0 || !experiment?.input_fields) {
            return [];
        }

        return experiment.input_fields.map(field => {
            if (field.type === 'number') {
                const values = submissions.map(s => parseFloat(s.data_json[field.name])).filter(v => !isNaN(v));
                if (values.length === 0) return null;
                return {
                    type: 'numeric',
                    label: field.label, unit: field.unit || '',
                    avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
                    min: Math.min(...values), max: Math.max(...values),
                };
            }
            if (['select', 'radio', 'checkbox'].includes(field.type)) {
                const counts = submissions.reduce((acc, s) => {
                    const value = s.data_json[field.name];
                    if (Array.isArray(value)) {
                        value.forEach(item => acc[item] = (acc[item] || 0) + 1);
                    } else if (value) { 
                        acc[value] = (acc[value] || 0) + 1;
                    }
                    return acc;
                }, {});
                if (Object.keys(counts).length === 0) return null;
                return {
                    type: 'categorical',
                    label: `Distribusi Jawaban: "${field.label}"`,
                    chartData: {
                        labels: Object.keys(counts),
                        datasets: [{ data: Object.values(counts), backgroundColor: 'rgba(100, 255, 218, 0.6)', borderColor: '#64ffda' }],
                    }
                };
            }
            return null;
        }).filter(Boolean); 
    }, [submissions, experiment]);

    if (submissions.length === 0) {
        return <div className="p-6 bg-light-navy rounded-lg text-center text-slate">Belum ada data untuk dianalisis.</div>;
    }
    if (analysis.length === 0) {
        return <div className="p-6 bg-light-navy rounded-lg text-center text-slate">Eksperimen ini tidak memiliki field yang dapat divisualisasikan.</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {analysis.map((stat, index) => (
                stat.type === 'numeric' ? (
                    <div key={index} className="bg-light-navy p-6 rounded-lg">
                        <h3 className="text-xl font-bold text-lightest-slate mb-4">{stat.label}</h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div><p className="text-3xl font-bold text-cyan">{stat.avg} <span className="text-lg text-slate">{stat.unit}</span></p><p className="text-xs text-slate uppercase">Rata-rata</p></div>
                            <div><p className="text-3xl font-bold text-cyan">{stat.min} <span className="text-lg text-slate">{stat.unit}</span></p><p className="text-xs text-slate uppercase">Terendah</p></div>
                            <div><p className="text-3xl font-bold text-cyan">{stat.max} <span className="text-lg text-slate">{stat.unit}</span></p><p className="text-xs text-slate uppercase">Tertinggi</p></div>
                        </div>
                    </div>
                ) : (
                    <div key={index} className="bg-light-navy p-6 rounded-lg">
                        <h3 className="text-xl font-bold text-lightest-slate mb-4">{stat.label}</h3>
                        <div className="h-64">
                            <Bar data={stat.chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#8892b0' } }, x: { ticks: { color: '#ccd6f6' } } } }} />
                        </div>
                    </div>
                )
            ))}
        </div>
    );
};


function ManageExperimentPage() {
    const { id: experimentId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [experiment, setExperiment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('submissions');
    const [deletingSubmissionId, setDeletingSubmissionId] = useState(null);
    const [notification, setNotification] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalSubmissions, setTotalSubmissions] = useState(0);
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchData = useCallback(async (page = 1) => {
        if (!user || !experimentId) return;
        setLoading(true); setError('');
        try {
            const [expRes, subRes] = await Promise.all([
                apiClient.get(`/experiments/${experimentId}`),
                apiClient.get(`/experiments/${experimentId}/submissions?skip=${(page - 1) * itemsPerPage}&limit=${itemsPerPage}`),
            ]);
            if (expRes.data.owner?.id !== user.id && user.role !== 'admin') {
                setError("Anda tidak memiliki izin untuk mengelola eksperimen ini."); return;
            }
            setExperiment(expRes.data);
            setSubmissions(subRes.data);
            
            if (subRes.data.length < itemsPerPage && page === 1) {
                setTotalSubmissions(subRes.data.length);
            } else {
                try {
                    const countRes = await apiClient.get(`/experiments/${experimentId}/submissions`);
                    setTotalSubmissions(countRes.data.length);
                } catch {
                    setTotalSubmissions(page * itemsPerPage + (subRes.data.length === itemsPerPage ? itemsPerPage : 0));
                }
            }
        } catch (err) {
            setError("Gagal memuat data. Pastikan ID eksperimen benar.");
        } finally {
            setLoading(false);
        }
    }, [experimentId, user, itemsPerPage]);

    useEffect(() => {
        if (!authLoading && experimentId) { fetchData(currentPage); }
    }, [authLoading, experimentId, fetchData, currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setLoading(true);
        fetchData(page);
    };

    const totalPages = Math.ceil(totalSubmissions / itemsPerPage);

    const handleDeleteExperiment = async () => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus eksperimen "${experiment?.title}"?`)) {
            try {
                await apiClient.delete(`/experiments/${experimentId}`);
                alert('Eksperimen berhasil dihapus.');
                navigate('/researcher/dashboard');
            } catch (err) {
                alert('Gagal menghapus eksperimen.');
            }
        }
    };

    const handleDeleteSubmission = async (submissionId) => {
        const submission = submissions.find(sub => sub.id === submissionId);
        if (!submission) {
            showNotification('Submisi tidak ditemukan.', 'error');
            return;
        }

        const confirmMessage = `Apakah Anda yakin ingin menghapus submisi ini?

Waktu: ${formatDate(submission.timestamp)}
User ID: ${submission.user_id || 'N/A'}
Submission ID: ${submissionId}

Tindakan ini tidak dapat dibatalkan.`;

        if (window.confirm(confirmMessage)) {
            setDeletingSubmissionId(submissionId);
            try {
                await apiClient.delete(`/experiments/${experimentId}/submissions/${submissionId}`);
                setSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
                showNotification('Submisi berhasil dihapus.', 'success');
                
            } catch (err) {
                console.error('Error deleting submission:', err);
                let errorMessage = 'Terjadi kesalahan yang tidak diketahui';
                
                if (err.response) {
                    if (err.response.status === 404) {
                        errorMessage = 'Submisi tidak ditemukan di server';
                    } else if (err.response.status === 403) {
                        errorMessage = 'Anda tidak memiliki izin untuk menghapus submisi ini';
                    } else if (err.response.status === 401) {
                        errorMessage = 'Sesi Anda telah berakhir, silakan login ulang';
                    } else {
                        errorMessage = err.response.data?.detail || err.response.data?.message || `Error ${err.response.status}`;
                    }
                } else if (err.request) {
                    errorMessage = 'Tidak dapat terhubung ke server';
                } else {
                    errorMessage = err.message;
                }
                
                showNotification(`Gagal menghapus submisi: ${errorMessage}`, 'error');
                fetchData();
            } finally {
                setDeletingSubmissionId(null);
            }
        }
    };
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            
            if (isNaN(date.getTime())) return 'Invalid Date';
            
            return date.toLocaleString('id-ID', { 
                dateStyle: 'long', 
                timeStyle: 'short',
                timeZone: 'Asia/Jakarta'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    const handleExportCSV = () => {
        if (submissions.length === 0) { alert("Tidak ada data untuk diekspor."); return; }
        const headers = ['submission_id', 'user_id', 'timestamp', 'latitude', 'longitude', ...experiment.input_fields.map(f => f.name)];
        let csvContent = headers.join(',') + '\n';
        submissions.forEach(sub => {
            const row = [sub.id, sub.user_id, `"${formatDate(sub.timestamp)}"`, sub.geo_lat || '', sub.geo_lng || ''];
            experiment.input_fields.forEach(field => {
                let value = sub.data_json[field.name];
                if (value === undefined || value === null) value = '';
                else if (Array.isArray(value)) value = `"${value.join('; ')}"`;
                else if (typeof value === 'string' && value.includes(',')) value = `"${value}"`;
                row.push(value);
            });
            csvContent += row.join(',') + '\n';
        });
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
            {notification && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
                    notification.type === 'error' 
                        ? 'bg-red-900/90 border border-red-500 text-red-100' 
                        : 'bg-green-900/90 border border-green-500 text-green-100'
                }`}>
                    <div className="flex items-center space-x-2">
                        {notification.type === 'error' ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        )}
                        <span>{notification.message}</span>
                        <button 
                            onClick={() => setNotification(null)}
                            className="ml-2 text-current hover:opacity-70"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <div className="mb-8">
                <Link to="/researcher/dashboard" className="text-sm text-slate hover:text-cyan">&larr; Kembali ke Dashboard</Link>
                <h1 className="text-4xl font-extrabold text-lightest-slate mt-1">Kelola: <span className="font-normal">{experiment?.title}</span></h1>
            </div>
            <div className="border-b border-navy/50 mb-8">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('submissions')} className={`${activeTab === 'submissions' ? 'border-cyan text-cyan' : 'border-transparent text-slate hover:text-light-slate'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Submisi ({submissions.length})</button>
                    <button onClick={() => setActiveTab('stats')} className={`${activeTab === 'stats' ? 'border-cyan text-cyan' : 'border-transparent text-slate hover:text-light-slate'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Statistik</button>
                    <button onClick={() => setActiveTab('settings')} className={`${activeTab === 'settings' ? 'border-cyan text-cyan' : 'border-transparent text-slate hover:text-light-slate'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Pengaturan</button>
                </nav>
            </div>
            <div>
                {activeTab === 'submissions' && (
                    <div className="bg-light-navy rounded-lg shadow-lg overflow-hidden">
                        <div className="p-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-lightest-slate">Daftar Data Masuk</h2>
                            <button onClick={handleExportCSV} className="btn-cyan text-sm font-bold py-2 px-4 rounded-md flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                <span>Export CSV</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-navy">
                                <thead className="bg-navy/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Waktu</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">User ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Lokasi</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Data</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-navy">
                                    {submissions.length > 0 ? submissions.map(sub => (
                                        <tr key={sub.id} className="hover:bg-navy/20 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate">
                                                {formatDate(sub.timestamp)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate">
                                                {sub.user_id || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate">
                                                {sub.geo_lat ? `${sub.geo_lat.toFixed(4)}, ${sub.geo_lng.toFixed(4)}` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <FormattedJsonData data={sub.data_json} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button 
                                                    onClick={() => handleDeleteSubmission(sub.id)} 
                                                    disabled={deletingSubmissionId === sub.id}
                                                    className={`inline-flex items-center p-2 rounded-md transition-colors group ${
                                                        deletingSubmissionId === sub.id 
                                                            ? 'bg-red-500/20 text-red-300 cursor-not-allowed' 
                                                            : 'hover:bg-red-500/10 text-red-500 hover:text-red-400'
                                                    }`}
                                                    title={deletingSubmissionId === sub.id ? 'Menghapus...' : `Hapus Submisi ID: ${sub.id}`}
                                                >
                                                    {deletingSubmissionId === sub.id ? (
                                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    <span className={`ml-1 text-xs transition-opacity ${
                                                        deletingSubmissionId === sub.id 
                                                            ? 'opacity-100' 
                                                            : 'opacity-0 group-hover:opacity-100'
                                                    }`}>
                                                        {deletingSubmissionId === sub.id ? 'Menghapus...' : 'Hapus'}
                                                    </span>
                                                </button>
                                            </td>
                                        </tr>
                                    )) : <EmptyState title="Belum Ada Submisi" message="Bagikan eksperimen Anda untuk mulai mengumpulkan data." />}
                                </tbody>
                            </table>
                        </div>
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            totalItems={totalSubmissions}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                )}
                {activeTab === 'stats' && <StatsTab submissions={submissions} experiment={experiment} />}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl">
                        <h3 className="text-xl font-bold text-lightest-slate">Pengaturan Eksperimen</h3>
                        <p className="text-slate mt-2 mb-6">Kelola pengaturan dan konfigurasi eksperimen Anda.</p>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-navy/50 rounded-lg border border-slate-700">
                                <h4 className="font-semibold text-lightest-slate mb-2">Edit Eksperimen</h4>
                                <p className="text-sm text-slate mb-4">Ubah judul, deskripsi, deadline, atau field input eksperimen.</p>
                                <Link 
                                    to={`/experiments/edit/${experimentId}`}
                                    className="inline-flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-md transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    Edit Eksperimen
                                </Link>
                            </div>

                            <div className="p-4 bg-red-900/20 rounded-lg border border-red-700">
                                <h4 className="font-semibold text-red-400 mb-2">Zona Bahaya</h4>
                                <p className="text-sm text-slate mb-4">Tindakan ini akan menghapus eksperimen beserta semua data submisi. Tindakan ini tidak dapat diurungkan.</p>
                                <button 
                                    onClick={handleDeleteExperiment} 
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                                >
                                    Hapus Eksperimen Ini
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageExperimentPage;