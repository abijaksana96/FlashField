import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ExperimentCard from '../components/ExperimentCard';

function Experiments() {
    const [experiments, setExperiments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState("researcher");

    useEffect(() => {
        const fetchAllExperiments = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://127.0.0.1:8000/experiments');
                setExperiments(response.data);
            } catch (err) {
                setError("Tidak dapat memuat daftar eksperimen.");
            } finally {
                setLoading(false);
            }
        };
        fetchAllExperiments();
    }, []);

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-lightest-slate">Jelajahi Semua Eksperimen</h1>
                    <p className="mt-2 text-lg text-slate">Temukan riset yang menarik dan mulailah berkontribusi hari ini.</p>
                </div>
            </div>

            {loading && <p className="text-center text-cyan text-lg">Memuat semua eksperimen...</p>}
            {error && <div className="text-center text-red-400 bg-red-500/10 p-4 rounded-md">{error}</div>}
            
            {!loading && !error && experiments.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {experiments.map(exp => (
                        <ExperimentCard key={exp.id} experiment={exp} />
                    ))}
                </div>
            )}
             {!loading && !error && experiments.length === 0 && (
                <div className="text-center text-slate mt-16">
                    <p className="text-2xl mb-2">Belum ada eksperimen yang tersedia.</p>
                    {userRole !== 'volunteer' && <p>Jadilah yang pertama untuk membuatnya!</p>}
                </div>
            )}
        </div>
    );
}

export default Experiments;