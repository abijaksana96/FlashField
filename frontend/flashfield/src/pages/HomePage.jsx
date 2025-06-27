import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ExperimentCard from '../components/ExperimentCard';
import { useAuth } from '../context/AuthContext';

function HomePage() {
    const { user, loading: authLoading } = useAuth();
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [
        "https://placehold.co/1200x400/0a192f/64ffda?text=Selamat+Datang+di+FlashField",
        "https://placehold.co/1200x400/112240/a8b2d1?text=Riset+Kualitas+Udara+Terbaru",
    ];
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (!authLoading && user && user.role !== 'volunteer') {
            window.location.href = '/unauthorized';
        }
    }, [user, authLoading]);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = setTimeout(
            () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1)),
            4000
        );
        return () => resetTimeout();
    }, [currentSlide]);
    
    useEffect(() => {
        if (!authLoading && user && !['volunteer', 'admin'].includes(user.role)) {
            window.location.href = '/unauthorized';
        }
    }, [user, authLoading]);

    const [experiments, setExperiments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExperiments = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://127.0.0.1:8000/experiments?limit=6');
                setExperiments(response.data);
            } catch (err) {
                setError('Gagal memuat data eksperimen.');
            } finally {
                setLoading(false);
            }
        };
        fetchExperiments();
    }, []);

    return (
        <>
            <section className="relative w-full max-w-7xl mx-auto h-64 md:h-96 overflow-hidden my-8 rounded-lg shadow-lg">
                <div className="whitespace-nowrap transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                    {slides.map((src, index) => (
                        <img key={index} src={src} alt={`Slide ${index + 1}`} className="w-full h-full object-cover inline-block" />
                    ))}
                </div>
                <div className="absolute bottom-5 right-5 flex space-x-2">
                    {slides.map((_, index) => (
                        <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-cyan' : 'bg-slate/50'}`}></button>
                    ))}
                </div>
            </section>

            <section className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-lightest-slate">Eksperimen Terbaru</h2>
                        <p className="mt-4 text-lg text-slate">Ikuti riset yang sedang tren dan berkontribusi sekarang.</p>
                    </div>
                    
                    {loading && <p className="text-center text-cyan">Memuat eksperimen...</p>}
                    {error && <p className="text-center text-red-400">{error}</p>}
                    
                    {!loading && !error && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {experiments.map(exp => (
                                    <ExperimentCard key={exp.id} experiment={exp} />
                                ))}
                            </div>

                            <div className="text-center mt-16">
                                <Link to="/experiments" className="btn-cyan text-lg font-bold py-3 px-8 rounded-md">
                                    Berikutnya
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </>
    );
}

export default HomePage;