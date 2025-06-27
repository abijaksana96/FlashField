import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

// --- Komponen-komponen UI yang Dipercantik ---

const LoadingSkeleton = () => (
    <div className="space-y-12 animate-pulse">
        {/* Skeleton untuk Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-28 bg-light-navy rounded-lg"></div>
            <div className="h-28 bg-light-navy rounded-lg"></div>
        </div>
        {/* Skeleton untuk Tabel Terbaru */}
        <div className="bg-light-navy rounded-lg">
            <div className="p-6 h-16 bg-slate-700/30 rounded-t-lg"></div>
            <div className="p-4 space-y-3">
                <div className="h-10 bg-slate-700 rounded w-full"></div>
                <div className="h-10 bg-slate-700 rounded w-full"></div>
                <div className="h-10 bg-slate-700 rounded w-full"></div>
            </div>
        </div>
        {/* Skeleton untuk Accordion */}
        <div className="bg-light-navy rounded-lg">
            <div className="p-6 h-16 bg-slate-700/30 rounded-t-lg"></div>
            <div className="p-6 space-y-2">
                <div className="h-14 bg-slate-700 rounded w-full"></div>
                <div className="h-14 bg-slate-700 rounded w-full"></div>
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

const EmptyState = ({ icon, title, message }) => (
    <div className="text-center py-16 px-6 bg-navy rounded-lg mt-4">
        <div className="flex justify-center text-slate-600">{icon}</div>
        <h3 className="mt-4 text-lg font-semibold text-lightest-slate">{title}</h3>
        <p className="mt-1 text-sm text-slate">{message}</p>
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

// Komponen untuk satu baris eksperimen, dengan kolom Submisi
const ExperimentRow = ({ experiment, onDelete }) => {
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { dateStyle: 'long' });
    return (
        <tr className="hover:bg-navy/50 transition-colors">
            <td className="px-6 py-4">
                <p className="text-sm font-medium text-lightest-slate">{experiment.title}</p>
                <p className="text-xs text-slate">oleh {experiment.owner?.full_name || 'Pengguna Dihapus'}</p>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate">{formatDate(experiment.created_at)}</td>
            {/* PERBAIKAN: Menambahkan kolom jumlah submisi */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan text-center">{experiment.submissions?.length || 0}</td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                    <Link to={`/admin/experiments/${experiment.id}/manage`} className="p-2 rounded-md hover:bg-cyan/10 text-cyan transition-colors" title="Kelola Submisi">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 7.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-7.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                    </Link>
                    <button onClick={() => onDelete(experiment.id, experiment.title)} className="p-2 rounded-md hover:bg-red-500/10 text-red-500 transition-colors" title="Hapus Eksperimen">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            </td>
        </tr>
    );
};

function AdminExperimentManagement() {
    const [allExperiments, setAllExperiments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedResearcher, setExpandedResearcher] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [filteredResearchers, setFilteredResearchers] = useState({});

    const fetchAllExperiments = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.get('/experiments/');
            setAllExperiments(response.data);
        } catch (err) {
            setError("Gagal memuat data eksperimen.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllExperiments();
    }, []);

    const handleDeleteExperiment = async (experimentId, experimentTitle) => {
        if (window.confirm(`ADMIN: Apakah Anda yakin ingin menghapus eksperimen "${experimentTitle}"?`)) {
            try {
                await apiClient.delete(`/experiments/${experimentId}`);
                fetchAllExperiments();
            } catch (err) {
                alert('Gagal menghapus eksperimen.');
            }
        }
    };

    const { recentExperiments, groupedByResearcher, researcherCount } = useMemo(() => {
        const recent = [...allExperiments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);
        const grouped = allExperiments.reduce((acc, exp) => {
            const ownerName = exp.owner?.full_name || 'Pengguna Tidak Diketahui';
            if (!acc[ownerName]) acc[ownerName] = [];
            acc[ownerName].push(exp);
            return acc;
        }, {});
        
        return {
            recentExperiments: recent,
            groupedByResearcher: grouped,
            researcherCount: Object.keys(grouped).filter(name => name !== 'Pengguna Tidak Diketahui').length,
        };
    }, [allExperiments]);

    useEffect(() => {
        setIsSearching(true);
        const debounce = setTimeout(() => {
            const filtered = Object.entries(groupedByResearcher).filter(([researcherName]) =>
                researcherName.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredResearchers(Object.fromEntries(filtered));
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchQuery, groupedByResearcher]);
    
    const toggleResearcher = (researcherName) => {
        setExpandedResearcher(prev => (prev === researcherName ? null : researcherName));
    };

    if (loading) return <LoadingSkeleton />;
    if (error) return <ErrorMessage message={error} onRetry={fetchAllExperiments} />;

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
            <div>
                <h1 className="text-4xl font-extrabold text-lightest-slate">Manajemen Eksperimen</h1>
                <p className="mt-2 text-lg text-slate">Pantau dan kelola semua riset yang ada di platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Total Peneliti Terdaftar" value={researcherCount} icon={<svg className="h-6 w-6 text-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
                <StatCard title="Total Eksperimen" value={allExperiments.length} icon={<svg className="h-6 w-6 text-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>} />
            </div>
            
            <div className="bg-light-navy rounded-lg shadow-lg">
                <div className="p-6"><h2 className="text-xl font-bold text-lightest-slate">10 Eksperimen Terbaru</h2></div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-navy">
                        <thead className="bg-navy/50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Judul & Pembuat</th><th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Tanggal</th><th className="px-6 py-3 text-center text-xs font-medium text-slate uppercase">Submisi</th><th className="px-6 py-3 text-right text-xs font-medium text-slate uppercase">Aksi</th></tr></thead>
                        <tbody className="divide-y divide-navy">
                            {recentExperiments.map(exp => <ExperimentRow key={`recent-${exp.id}`} experiment={exp} onDelete={handleDeleteExperiment} />)}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-lightest-slate">Eksperimen per Peneliti</h2>
                    <div className="relative w-full md:w-1/3">
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari nama peneliti..." className="w-full p-2 pl-10 bg-navy text-light-slate rounded-md border border-slate/50" />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                <div className="space-y-2">
                    {isSearching ? <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div></div> :
                    Object.keys(filteredResearchers).length > 0 ? (
                        Object.entries(filteredResearchers).map(([researcherName, experiments]) => (
                            <div key={researcherName} className="bg-light-navy rounded-lg overflow-hidden">
                                <button onClick={() => toggleResearcher(researcherName)} className="w-full flex justify-between items-center p-4 text-left hover:bg-navy/50 transition-colors">
                                    <span className="font-bold text-lightest-slate">{researcherName} <span className="text-sm font-normal text-slate">({experiments.length} eksperimen)</span></span>
                                    <svg className={`w-5 h-5 text-slate transform transition-transform ${expandedResearcher === researcherName ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {expandedResearcher === researcherName && (
                                    <div className="overflow-x-auto border-t border-navy">
                                        <table className="min-w-full">
                                            <thead className="bg-navy/70"><tr className="border-b border-navy"><th className="px-6 py-2 text-left text-xs font-medium text-slate uppercase">Judul</th><th className="px-6 py-2 text-left text-xs font-medium text-slate uppercase">Dibuat</th><th className="px-6 py-2 text-center text-xs font-medium text-slate uppercase">Submisi</th><th className="px-6 py-2 text-right text-xs font-medium text-slate uppercase">Aksi</th></tr></thead>
                                            <tbody className="divide-y divide-navy">
                                                {experiments.map(exp => <ExperimentRow key={`grouped-${exp.id}`} experiment={exp} onDelete={handleDeleteExperiment} />)}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <EmptyState 
                            icon={<svg className="h-12 w-12 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                            title={searchQuery ? "Peneliti Tidak Ditemukan" : "Belum Ada Eksperimen"}
                            message={searchQuery ? "Tidak ada peneliti yang cocok dengan pencarian Anda." : "Platform belum memiliki satupun eksperimen."}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminExperimentManagement;
