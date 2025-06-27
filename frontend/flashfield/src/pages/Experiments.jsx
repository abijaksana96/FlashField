import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ExperimentCard from '../components/ExperimentCard';

// Komponen Pagination yang Dipercantik
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
    
    // Calculate displayed items range
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalPages <= 1) return null;

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-12 p-6 bg-light-navy rounded-lg shadow-lg gap-4">
            {/* Info Text */}
            <div className="text-sm text-slate">
                Menampilkan <span className="font-medium text-lightest-slate">{startItem}</span> sampai{' '}
                <span className="font-medium text-lightest-slate">{endItem}</span> dari{' '}
                <span className="font-medium text-lightest-slate">{totalItems}</span> eksperimen
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-1">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
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
                
                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                    {pageNumbers.map(page => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                page === currentPage
                                    ? 'bg-cyan text-navy font-bold shadow-lg transform scale-105'
                                    : 'text-slate hover:text-cyan hover:bg-navy/50 bg-navy/30'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
                
                {/* Next Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
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
    );
};

function Experiments() {
    const [experiments, setExperiments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState("researcher");
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(9); // 3x3 grid
    const [totalExperiments, setTotalExperiments] = useState(0);

    useEffect(() => {
        const fetchAllExperiments = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://127.0.0.1:8000/experiments');
                setExperiments(response.data);
                setTotalExperiments(response.data.length);
            } catch (err) {
                setError("Tidak dapat memuat daftar eksperimen.");
            } finally {
                setLoading(false);
            }
        };
        fetchAllExperiments();
    }, []);

    // Calculate pagination
    const totalPages = Math.ceil(totalExperiments / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentExperiments = experiments.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
            
            {!loading && !error && currentExperiments.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {currentExperiments.map(exp => (
                            <ExperimentCard key={exp.id} experiment={exp} />
                        ))}
                    </div>
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={totalExperiments}
                        itemsPerPage={itemsPerPage}
                    />
                </>
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