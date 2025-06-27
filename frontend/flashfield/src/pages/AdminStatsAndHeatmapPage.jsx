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

// Komponen untuk kartu insight statistik
const InsightCard = ({ title, value, subtitle, icon, trend }) => (
    <div className="bg-light-navy rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="bg-navy p-3 rounded-full text-cyan">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-lightest-slate">{title}</h3>
                    <p className="text-2xl font-bold text-cyan">{value}</p>
                    <p className="text-sm text-slate">{subtitle}</p>
                </div>
            </div>
            {trend && (
                <div className={`text-right ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate'}`}>
                    <div className="flex items-center space-x-1">
                        {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'}
                        <span className="text-sm">{Math.abs(trend)}%</span>
                    </div>
                </div>
            )}
        </div>
    </div>
);

// Komponen untuk leaderboard
const LeaderboardCard = ({ title, data, icon, valueLabel }) => (
    <div className="bg-light-navy rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
            <div className="bg-navy p-2 rounded-full text-cyan">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-lightest-slate">{title}</h3>
        </div>
        <div className="space-y-3">
            {data.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-navy/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-navy' :
                            index === 1 ? 'bg-gray-400 text-navy' :
                            index === 2 ? 'bg-amber-600 text-navy' :
                            'bg-slate-600 text-lightest-slate'
                        }`}>
                            {index + 1}
                        </div>
                        <div>
                            <p className="text-lightest-slate font-medium">{item.name}</p>
                            <p className="text-xs text-slate">{item.detail}</p>
                        </div>
                    </div>
                    <div className="text-cyan font-bold">
                        {item.value} {valueLabel}
                    </div>
                </div>
            ))}
        </div>
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
    const [insights, setInsights] = useState({
        topResearchers: [],
        topExperiments: [],
        topVolunteers: [],
        generalStats: {},
        trends: {}
    });
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
                const allSubmissions = submissionResponses.flatMap((res, index) => 
                    res.data.map(sub => ({...sub, experiment_id: allExperiments[index].id, experiment_title: allExperiments[index].title}))
                );

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

                // 3. ANALISIS INSIGHT MENDALAM

                // A. Top Researchers (berdasarkan jumlah eksperimen)
                const researcherStats = manageableUsers
                    .filter(user => user.role === 'researcher')
                    .map(researcher => {
                        const experiments = allExperiments.filter(exp => exp.owner?.id === researcher.id);
                        const totalSubmissions = allSubmissions.filter(sub => 
                            experiments.some(exp => exp.id === sub.experiment_id)
                        ).length;
                        return {
                            name: researcher.full_name,
                            detail: `${experiments.length} eksperimen`,
                            value: experiments.length,
                            submissions: totalSubmissions
                        };
                    })
                    .sort((a, b) => b.value - a.value);

                // B. Top Experiments (berdasarkan jumlah submisi)
                const experimentStats = allExperiments.map(exp => {
                    const submissions = allSubmissions.filter(sub => sub.experiment_id === exp.id);
                    return {
                        name: exp.title,
                        detail: `oleh ${exp.owner?.full_name || 'Unknown'}`,
                        value: submissions.length,
                        created: new Date(exp.created_at)
                    };
                }).sort((a, b) => b.value - a.value);

                // C. Top Volunteers (berdasarkan jumlah kontribusi)
                const volunteerStats = manageableUsers
                    .filter(user => user.role === 'volunteer')
                    .map(volunteer => {
                        const contributions = allSubmissions.filter(sub => sub.user_id === volunteer.id);
                        const uniqueExperiments = [...new Set(contributions.map(sub => sub.experiment_id))];
                        return {
                            name: volunteer.full_name,
                            detail: `${uniqueExperiments.length} eksperimen berbeda`,
                            value: contributions.length,
                            experiments: uniqueExperiments.length
                        };
                    })
                    .sort((a, b) => b.value - a.value);

                // D. General Statistics
                const now = new Date();
                const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                
                const recentSubmissions = allSubmissions.filter(sub => new Date(sub.timestamp) >= last30Days);
                const veryRecentSubmissions = allSubmissions.filter(sub => new Date(sub.timestamp) >= last7Days);
                
                const activeExperiments = allExperiments.filter(exp => {
                    const hasRecentSubmissions = allSubmissions.some(sub => 
                        sub.experiment_id === exp.id && new Date(sub.timestamp) >= last7Days
                    );
                    const notExpired = !exp.deadline || new Date(exp.deadline) > now;
                    return hasRecentSubmissions && notExpired;
                });

                // E. Calculate trends (comparing last 7 days vs previous 7 days)
                const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
                const previousWeekSubmissions = allSubmissions.filter(sub => {
                    const date = new Date(sub.timestamp);
                    return date >= previous7Days && date < last7Days;
                });

                const submissionTrend = previousWeekSubmissions.length > 0 
                    ? Math.round(((veryRecentSubmissions.length - previousWeekSubmissions.length) / previousWeekSubmissions.length) * 100)
                    : veryRecentSubmissions.length > 0 ? 100 : 0;

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
                            backgroundColor: ['#38bdf8', '#34d399'],
                            borderColor: '#112240',
                            borderWidth: 2,
                        }]
                    }
                });

                setInsights({
                    topResearchers: researcherStats,
                    topExperiments: experimentStats,
                    topVolunteers: volunteerStats,
                    generalStats: {
                        totalSubmissions: allSubmissions.length,
                        totalExperiments: allExperiments.length,
                        totalUsers: manageableUsers.length,
                        activeExperiments: activeExperiments.length,
                        recentSubmissions: recentSubmissions.length,
                        avgSubmissionsPerExperiment: Math.round(allSubmissions.length / Math.max(allExperiments.length, 1))
                    },
                    trends: {
                        submissionTrend
                    }
                });
                
                // 4. Proses data untuk Heatmap
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

            {/* Quick Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InsightCard
                    title="Total Submisi"
                    value={insights.generalStats.totalSubmissions?.toLocaleString() || '0'}
                    subtitle="Data terkumpul"
                    trend={insights.trends.submissionTrend}
                    icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                />
                <InsightCard
                    title="Eksperimen Aktif"
                    value={insights.generalStats.activeExperiments || '0'}
                    subtitle={`dari ${insights.generalStats.totalExperiments || '0'} total`}
                    icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>}
                />
                <InsightCard
                    title="Pengguna Terdaftar"
                    value={insights.generalStats.totalUsers || '0'}
                    subtitle="Researcher & Volunteer"
                    icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/></svg>}
                />
                <InsightCard
                    title="Rata-rata per Eksperimen"
                    value={insights.generalStats.avgSubmissionsPerExperiment || '0'}
                    subtitle="submisi"
                    icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
                />
            </div>

            {/* Leaderboards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <LeaderboardCard
                    title="Top Researchers"
                    data={insights.topResearchers}
                    valueLabel="eksperimen"
                    icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/></svg>}
                />
                <LeaderboardCard
                    title="Eksperimen Terpopuler"
                    data={insights.topExperiments}
                    valueLabel="submisi"
                    icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/></svg>}
                />
                <LeaderboardCard
                    title="Top Contributors"
                    data={insights.topVolunteers}
                    valueLabel="kontribusi"
                    icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>}
                />
            </div>

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
