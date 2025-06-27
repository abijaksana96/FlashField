import { Link } from 'react-router-dom';

export default function ResearcherDashboard() {
    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-extrabold text-lightest-slate">Dashboard Peneliti</h1>
            <p className="mt-2 text-lg text-slate">Selamat datang! Di sini Anda bisa membuat dan mengelola eksperimen.</p>
            <div className="mt-8">
                <Link to="/experiments/create" className="btn-cyan-solid text-lg font-bold py-3 px-8 rounded-md">
                    + Buat Eksperimen Baru
                </Link>
            </div>
        </div>
    );
}