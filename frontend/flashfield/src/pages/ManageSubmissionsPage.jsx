import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

// --- Komponen-komponen UI ---
const LoadingSpinner = () => <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div><p className="mt-4 text-cyan">Memuat Data Submisi...</p></div>;
const ErrorMessage = ({ message, onRetry }) => (
    <div className="text-center py-20 px-6 bg-light-navy rounded-lg">
        <svg className="mx-auto h-12 w-12 text-red-500/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <h3 className="mt-2 text-lg font-semibold text-lightest-slate">Terjadi Kesalahan</h3>
        <p className="mt-1 text-sm text-slate">{message}</p>
        <button onClick={onRetry} className="mt-6 btn-cyan text-sm font-bold py-2 px-5 rounded-md">Coba Lagi</button>
    </div>
);
const EmptyState = () => (
    <tr>
        <td colSpan="5" className="text-center py-24 px-6">
            <svg className="mx-auto h-12 w-12 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <h3 className="mt-2 text-lg font-semibold text-lightest-slate">Belum Ada Submisi</h3>
            <p className="mt-1 text-sm text-slate">Saat ini belum ada data yang dikirim oleh volunteer untuk eksperimen ini.</p>
        </td>
    </tr>
);
const FormattedJsonData = ({ data }) => {
    if (typeof data !== 'object' || data === null || Object.keys(data).length === 0) return <span className="text-slate/70 italic">N/A</span>;
    return (
        <div className="flex flex-col gap-1.5">{Object.entries(data).map(([key, value]) => (
            <div key={key} className="text-xs"><span className="font-semibold text-slate capitalize">{key.replace(/_/g, ' ')}:</span><span className="text-light-slate ml-2 break-all">{Array.isArray(value) ? value.join(', ') : String(value)}</span></div>
        ))}</div>
    );
};


function ManageSubmissionsPage() {
    const { id: experimentId } = useParams();
    const [experiment, setExperiment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [expRes, subRes] = await Promise.all([
                apiClient.get(`/experiments/${experimentId}`),
                apiClient.get(`/experiments/${experimentId}/submissions`)
            ]);
            setExperiment(expRes.data);
            setSubmissions(subRes.data);
        } catch (err) {
            setError("Gagal memuat data. Pastikan Anda memiliki hak akses yang sesuai.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [experimentId]);

    const handleDeleteSubmission = async (submissionId) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus submisi dengan ID ${submissionId}?`)) {
            try {
                // Asumsi ada endpoint DELETE /submissions/{id} di backend
                await apiClient.delete(`/submissions/${submissionId}`);
                fetchData(); // Muat ulang data
                alert('Submisi berhasil dihapus.');
            } catch (err) {
                alert('Gagal menghapus submisi.');
            }
        }
    };
    
    const formatDate = (dateString) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Link to="/admin/experiments" className="text-sm text-slate hover:text-cyan">&larr; Kembali ke Manajemen Eksperimen</Link>
                <h1 className="text-4xl font-extrabold text-lightest-slate mt-2">Kelola Submisi</h1>
                <p className="text-2xl text-cyan">{experiment?.title}</p>
            </div>
            
            <div className="bg-light-navy rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-lightest-slate">Daftar Data Masuk ({submissions.length})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-navy">
                        <thead className="bg-navy/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Pengirim (ID)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Waktu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Lokasi (Lat, Lng)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Data JSON</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-navy">
                            {submissions.length > 0 ? submissions.map(sub => (
                                <tr key={sub.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate">{sub.user_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate">{formatDate(sub.timestamp)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate font-mono">{sub.geo_lat ? `${sub.geo_lat}, ${sub.geo_lng}`: 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-slate"><FormattedJsonData data={sub.data_json} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDeleteSubmission(sub.id)} className="p-2 rounded-md hover:bg-red-500/10 text-red-500 transition-colors" title="Hapus Submisi">
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            )) : <EmptyState />}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ManageSubmissionsPage;
