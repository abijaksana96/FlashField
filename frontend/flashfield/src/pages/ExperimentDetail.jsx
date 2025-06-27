import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

const LoadingSpinner = () => (
    <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
        <p className="mt-4 text-cyan">Memuat detail eksperimen...</p>
    </div>
);
const ErrorMessage = ({ message }) => (
    <div className="text-center py-20 text-red-400 bg-red-500/10 p-4 rounded-md max-w-2xl mx-auto">
        <p className="font-bold">Terjadi Kesalahan</p>
        <p>{message}</p>
    </div>
);
const InfoPill = ({ icon, text }) => (
    <div className="flex items-center gap-2 bg-navy p-2 px-3 rounded-full text-sm">
        {icon}
        <span className="text-light-slate">{text}</span>
    </div>
);

function ExperimentDetail() {
    const { id } = useParams();
    const [experiment, setExperiment] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExperiment = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`/experiments/${id}`);
                setExperiment(response.data);
            } catch (err) {
                setError(err.response?.data?.detail || "Gagal memuat detail eksperimen.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchExperiment();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return "Tidak ada";
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!experiment) return <ErrorMessage message="Data eksperimen tidak ditemukan." />;

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="border-b border-navy/50 pb-6 mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-lightest-slate mb-3">{experiment.title}</h1>
                <p className="text-slate mb-4">
                    Dibuat oleh: <span className="font-medium text-light-slate">{experiment.owner.full_name}</span>
                </p>
                <div className="flex flex-wrap gap-4">
                    <InfoPill 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                        text={`Deadline: ${formatDate(experiment.deadline)}`}
                    />
                    <InfoPill 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                        text={experiment.require_location ? "Memerlukan Lokasi" : "Tidak Memerlukan Lokasi"}
                    />
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-lightest-slate mb-4">Deskripsi Proyek</h2>
            <div className="prose prose-lg prose-invert max-w-none text-light-slate mb-12">
                <p>{experiment.description}</p>
            </div>

            <div className="bg-light-navy p-6 rounded-lg">
                 <h2 className="text-2xl font-bold text-lightest-slate mb-4">Data yang Diperlukan</h2>
                 {experiment.input_fields && experiment.input_fields.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2 text-slate">
                        {experiment.input_fields.map(field => (
                            <li key={field.name}>
                                <span className="font-medium text-light-slate">{field.label}</span>
                                <span className="text-xs"> (Tipe: {field.type})</span>
                            </li>
                        ))}
                    </ul>
                 ) : (
                    <p className="text-slate italic">Selain lokasi, tidak ada data spesifik yang diperlukan untuk eksperimen ini.</p>
                 )}
            </div>
            
            <div className="mt-12 text-center">
                <Link 
                    to={`/experiments/${id}/submit`} 
                    className="btn-cyan-solid text-lg font-bold py-3 px-8 rounded-md inline-block"
                >
                    Kirim Data untuk Eksperimen Ini
                </Link>
            </div>
        </div>
    );
}

export default ExperimentDetail;