import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Impor useAuth untuk mendapatkan data pengguna

const Navbar = () => {
    // Dapatkan semua yang kita butuhkan dari AuthContext
    const { user, logout, isAuthenticated } = useAuth(); 
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    // useEffect untuk menutup dropdown (ini sudah benar)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Fungsi untuk merender menu navigasi berdasarkan peran
    const renderNavLinks = () => {
        if (!user) return null; // Jika user belum ter-load, jangan tampilkan menu

        switch (user.role) {
            case 'admin':
                return (
                    <>
                        <Link to="/admin/usermanagement" className="text-light-slate hover:text-cyan transition-colors">Kelola User</Link>
                        <Link to="/admin/experimentmanagement" className="text-light-slate hover:text-cyan transition-colors">Kelola Eksperimen</Link>
                    </>
                );
            case 'researcher':
                return (
                    <>
                        <Link to="/researcher/homepage" className="text-light-slate hover:text-cyan transition-colors">Homepage</Link>
                        <Link to="/researcher//experiments" className="text-light-slate hover:text-cyan transition-colors">Semua Eksperimen</Link>
                        <Link to="/researcher//experiments/create" className="text-light-slate hover:text-cyan transition-colors">Buat Eksperimen</Link>
                    </>
                );
            case 'volunteer':
            default:
                return (
                    <>
                        <Link to="/homepage" className="text-light-slate hover:text-cyan transition-colors">Homepage</Link>
                        <Link to="/experiments" className="text-light-slate hover:text-cyan transition-colors">Eksperimen</Link>
                        <Link to="/kontribusi" className="text-light-slate hover:text-cyan transition-colors">Kontribusi</Link>
                    </>
                );
        }
    };

    return (
        <header className="sticky top-0 z-50 py-4 px-6 md:px-10 backdrop-blur-md bg-navy/80 shadow-md shadow-black/20">
            <nav className="flex justify-between items-center max-w-7xl mx-auto">
                {/* Logo akan selalu mengarah ke dashboard jika sudah login */}
                <Link to={isAuthenticated ? "/homepage" : "/"} className="text-2xl font-bold text-lightest-slate">
                    Flash<span className="text-cyan">Field</span>
                </Link>
                
                {/* === Menu Navigasi Dinamis === */}
                <div className="hidden md:flex items-center space-x-8">
                    {isAuthenticated && renderNavLinks()}
                </div>

                <div className="flex items-center space-x-4">
                    {/* Gunakan isAuthenticated dari context untuk menampilkan tombol yang sesuai */}
                    {isAuthenticated ? (
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="p-2 rounded-full text-light-slate hover:text-cyan focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </button>
                            
                            <div className={`absolute right-0 mt-2 w-56 bg-light-navy rounded-md shadow-lg overflow-hidden z-50 transition-all duration-300 ease-in-out ${isDropdownOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                                <div className="p-2">
                                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-lightest-slate rounded-md hover:bg-navy">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zM12 12a5 5 0 00-5 5h10a5 5 0 00-5-5z" clipRule="evenodd" /></svg>
                                        <span>Profil Saya</span>
                                    </Link>
                                    <div className="border-t border-navy/50 my-1"></div>
                                    {/* Gunakan fungsi logout dari context */}
                                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 rounded-md hover:bg-navy">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Ini akan ditampilkan di LandingPage atau jika belum login
                        <>
                            <Link to="/login" className="text-sm font-medium py-2 px-4 rounded-md text-light-slate hover:text-cyan transition-colors">Login</Link>
                            <Link to="/register" className="btn-cyan text-sm font-medium py-2 px-4 rounded-md">Daftar</Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;