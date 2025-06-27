import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, ArcElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';

// Registrasi semua komponen Chart.js yang dibutuhkan
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

// --- Komponen UI yang Profesional ---

const LoadingSkeleton = () => (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12 animate-pulse">
        <div className="h-10 bg-slate-700 rounded w-1/2"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-light-navy rounded-lg"></div>
            <div className="h-96 bg-light-navy rounded-lg"></div>
            <div className="h-96 bg-light-navy rounded-lg col-span-1 lg:col-span-2"></div>
        </div>
    </div>
);

const ErrorMessage = ({ message, onRetry }) => (
    <div className="text-center py-20 px-6 bg-light-navy rounded-lg">
        <h3 className="mt-2 text-lg font-semibold text-lightest-slate">Terjadi Kesalahan</h3>
        <p className="mt-1 text-sm text-slate">{message}</p>
        <button onClick={onRetry} className="mt-6 btn-cyan text-sm font-bold py-2 px-5 rounded-md">Coba Lagi</button>
    </div>
);

const HeatmapLayer = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (!map || points.length === 0) return;
        const heatLayer = L.heatLayer(points, { radius: 25, blur: 15, maxZoom: 18, gradient: { 0.4: '#1d4ed8', 0.65: '#34d399', 1: '#f87171' } }).addTo(map);
        return () => { map.removeLayer(heatLayer); };
    }, [map, points]);
    return null;
};

// --- Halaman Utama Statistik ---

function AdminStatsAndHeatmapPage() {
    const [chartData, setChartData] = useState({
        submissionsOverTime: { labels: [], datasets: [] },
        userRoles: { labels: [], datasets: [] }
    });
    const [submissionPoints, setSubmissionPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const chartOptions = (title) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#ccd6f6' } },
            title: { display: true, text: title, color: '#ccd6f6', font: { size: 16 } }
        },
        scales: {
            x: { ticks: { color: '#8892b0' }, grid: { color: 'rgba(136, 146, 176, 0.1)' } },
            y: { ticks: { color: '#8892b0' }, grid: { color: 'rgba(136, 146, 176, 0.1)' }, beginAtZero: true }
        },
    });

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError('');
            try {
                const [usersRes, expRes] = await Promise.all([
                    apiClient.get('/users/'),
                    apiClient.get('/experiments/'),
                ]);

                const manageableUsers = usersRes.data.filter(user => user.role !== 'admin');
                const allExperiments = expRes.data;
                const submissionPromises = allExperiments.map(exp => apiClient.get(`/experiments/${exp.id}/submissions`));
                const submissionResponses = await Promise.all(submissionPromises);
                const allSubmissions = submissionResponses.flatMap(res => res.data);

                // 1. Proses data untuk Grafik Tren Submisi
                const submissionsByDate = allSubmissions.reduce((acc, sub) => {
                    const date = new Date(sub.timestamp).toISOString().split('T')[0];
                    acc[date] = (acc[date] || 0) + 1;
                    return acc;
                }, {});
                const sortedDates = Object.keys(submissionsByDate).sort();
                
                // 2. Proses data untuk Grafik Komposisi Pengguna
                const rolesCount = manageableUsers.reduce((acc, user) => {
                    acc[user.role] = (acc[user.role] || 0) + 1;
                    return acc;
                }, {});

                setChartData({
                    submissionsOverTime: {
                        labels: sortedDates,
                        datasets: [{
                            label: 'Jumlah Submisi per Hari',
                            data: sortedDates.map(date => submissionsByDate[date]),
                            fill: true,
                            borderColor: '#64ffda',
                            backgroundColor: 'rgba(100, 255, 218, 0.2)',
                            tension: 0.3,
                        }],
                    },
                    userRoles: {
                        labels: Object.keys(rolesCount),
                        datasets: [{
                            data: Object.values(rolesCount),
                            backgroundColor: ['#38bdf8', '#34d399'], // Warna untuk volunteer & researcher
                            borderColor: '#112240',
                            borderWidth: 2,
                        }]
                    }
                });
                
                // 3. Proses data untuk Heatmap
                const points = allSubmissions.filter(sub => sub.geo_lat && sub.geo_lng).map(sub => [sub.geo_lat, sub.geo_lng, 1]);
                setSubmissionPoints(points);

            } catch (err) {
                setError("Gagal memuat data. Periksa koneksi atau endpoint API.");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    if (loading) return <LoadingSkeleton />;
    if (error) return <ErrorMessage message={error} onRetry={fetchAllData} />;

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
            <h1 className="text-4xl font-extrabold text-lightest-slate">Statistik & Visualisasi Platform</h1>

            {/* Layout Grid 2x2 untuk Visualisasi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {/* Kartu Grafik Tren */}
                <div className="bg-light-navy rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-lightest-slate text-center mb-4">Tren Aktivitas Submisi</h2>
                    <div className="h-80">
                        <Line options={chartOptions('Submisi per Hari')} data={chartData.submissionsOverTime} />
                    </div>
                </div>

                {/* Kartu Grafik Komposisi Pengguna */}
                <div className="bg-light-navy rounded-lg shadow-lg p-6 flex flex-col items-center justify-center">
                     <h2 className="text-xl font-bold text-lightest-slate text-center mb-4">Komposisi Pengguna</h2>
                    <div className="w-64 h-64">
                         <Doughnut data={chartData.userRoles} options={{ maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { color: '#ccd6f6' } } } }} />
                    </div>
                </div>
                
                {/* Kartu Heatmap (dibuat lebih besar) */}
                <div className="bg-light-navy rounded-lg shadow-lg overflow-hidden lg:col-span-2">
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-lightest-slate">Heatmap Konsentrasi Submisi</h2>
                        <p className="text-slate text-sm mt-1">Area yang lebih "panas" menandakan lebih banyak data yang dikirim.</p>
                    </div>
                    <div className="h-[500px] w-full bg-navy">
                        {submissionPoints.length > 0 ? (
                            <MapContainer center={[-2.5489, 118.0149]} zoom={5} style={{ height: '100%', width: '100%' }}>
                                {/* PERBAIKAN: Gunakan tema peta standar yang lebih cerah */}
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <HeatmapLayer points={submissionPoints} />
                            </MapContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate">Belum ada data lokasi untuk ditampilkan.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminStatsAndHeatmapPage;
