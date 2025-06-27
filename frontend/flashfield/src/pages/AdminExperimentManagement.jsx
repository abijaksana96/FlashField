import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

// Komponen UI (bisa dipisah ke file sendiri nanti)
const LoadingSpinner = () => <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div><p className="mt-4 text-cyan">Memuat Semua Eksperimen...</p></div>;
const ErrorMessage = ({ message }) => <div className="text-center py-10 text-red-400 bg-red-500/10 p-4 rounded-md">{message}</div>;

const EmptyState = () => (
    <tr>
        <td colSpan="4" className="text-center py-24 px-6">
            <div className="flex flex-col items-center">
                <svg className="mx-auto h-12 w-12 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <h3 className="mt-2 text-lg font-semibold text-lightest-slate">Platform Masih Kosong</h3>
                <p className="mt-1 text-sm text-slate">Belum ada satupun eksperimen yang dibuat oleh para peneliti.</p>
            </div>
        </td>
    </tr>
);


function AdminExperimentManagement() {
    const [experiments, setExperiments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAllExperiments = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/experiments/');
            setExperiments(response.data);
        } catch (err) {
            setError("Gagal memuat data eksperimen.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllExperiments();
    }, []);

    const handleDeleteExperiment = async (experimentId) => {
        if (window.confirm(`ADMIN: Apakah Anda yakin ingin menghapus eksperimen dengan ID ${experimentId}? Tindakan ini tidak dapat diurungkan.`)) {
            try {
                await apiClient.delete(`/experiments/${experimentId}`);
                fetchAllExperiments(); // Muat ulang data setelah berhasil
                alert('Eksperimen berhasil dihapus.');
            } catch (err) {
                alert('Gagal menghapus eksperimen.');
            }
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { dateStyle: 'long' });

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold text-lightest-slate mb-8">Manajemen Eksperimen</h1>
            <div className="bg-light-navy rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-navy">
                        <thead className="bg-navy/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Judul Eksperimen</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Pembuat</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate uppercase">Tanggal</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-navy">
                            {experiments.length > 0 ? (
                                experiments.map(exp => (
                                    <tr key={exp.id} className="hover:bg-navy/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-lightest-slate">{exp.title}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate">{exp.owner.full_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate">{formatDate(exp.created_at)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                            <Link to={`/experiments/${exp.id}/manage`} className="text-cyan hover:underline">Kelola Submisi</Link>
                                            <button onClick={() => handleDeleteExperiment(exp.id)} className="text-red-500 hover:text-red-400">Hapus</button>
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

export default AdminExperimentManagement;